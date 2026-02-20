
require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require("@google/genai");

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- FIREBASE ADMIN INIT ---
let db;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Check if already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    db = admin.firestore();
    console.log("Firebase Admin Initialized");
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
  }
} else {
  console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT not set. Database operations will fail.");
}

// Initialize Gemini Client
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to get Razorpay instance dynamically
async function getRazorpayInstance() {
  if (!db) throw new Error("Database not connected");
  const doc = await db.collection('gateway_settings').doc('razorpay').get();
  
  if (!doc.exists) {
    throw new Error("Razorpay gateway not configured by Admin.");
  }
  
  const config = doc.data();
  if (!config.key_id || !config.key_secret) {
    throw new Error("Razorpay credentials missing in configuration.");
  }

  return {
    instance: new Razorpay({ key_id: config.key_id, key_secret: config.key_secret }),
    config: config
  };
}

// --- AUDIT WORKER LOGIC ---
const auditSubmission = async (docId, content) => {
  console.log(`[Audit Worker] Starting analysis for ${docId}`);
  
  try {
    // 1. Sanitize & Trim (Max 12k words ~ 16k tokens to be safe)
    const sanitizedText = content.replace(/<[^>]*>/g, ' ').slice(0, 50000); 

    // 2. Retry Logic Wrapper
    const runAI = async (retries = 3) => {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Act as an academic integrity auditor. Evaluate the following manuscript text for:
          • Probability of AI-generated writing
          • Linguistic originality
          • Structural repetition patterns
          • Semantic similarity risk

          Return ONLY valid JSON with this exact schema:
          {
            "ai_percent": number (0-100),
            "plag_percent": number (0-100),
            "analysis_summary": "max 2 sentences",
            "flagged_segments": [
              {
                "text": "snippet of suspicious text",
                "reason": "AI Pattern | Repetition | Similarity"
              }
            ]
          }

          Manuscript: "${sanitizedText}"`,
          config: {
            temperature: 0.1,
            topP: 0.8,
            responseMimeType: "application/json"
          }
        });
        
        return JSON.parse(response.text());
      } catch (err) {
        if (retries > 0) {
          console.warn(`[Audit Worker] Retry ${retries} for ${docId}`);
          await new Promise(r => setTimeout(r, 2000 * (4 - retries))); // Backoff
          return runAI(retries - 1);
        }
        throw err;
      }
    };

    // 3. Execute Analysis
    const result = await runAI();

    // 4. Calculate Risk Level
    const maxScore = Math.max(result.ai_percent, result.plag_percent);
    let riskLevel = 'LOW';
    if (maxScore > 75) riskLevel = 'HIGH';
    else if (maxScore > 25) riskLevel = 'MEDIUM';

    // 5. Update Firestore Atomically
    await db.collection('articles').doc(docId).update({
      plagiarismReport: {
        originality_score: 100 - result.plagiarism_score,
        plagiarism_score: result.plag_percent,
        ai_generated_score: result.ai_percent,
        risk_level: riskLevel,
        flagged_sections: result.flagged_segments || [],
        confidence: 0.9,
        generatedAt: new Date().toISOString(),
        summary: result.analysis_summary,
        audit_status: 'COMPLETED'
      }
    });

    console.log(`[Audit Worker] Success for ${docId}: AI=${result.ai_percent}%`);

  } catch (error) {
    console.error(`[Audit Worker] Failed for ${docId}:`, error);
    // Mark as failed so UI doesn't spin forever
    await db.collection('articles').doc(docId).update({
      'plagiarismReport.audit_status': 'FAILED',
      'plagiarismReport.summary': 'Audit process interrupted. Manual review required.'
    }).catch(e => console.error("DB Update Fail", e));
  }
};

// --- IMAGE UPLOAD CONFIGURATION ---

const UPLOADS_DIR = path.join(__dirname, 'uploads/users');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid format. Only JPG, PNG, WEBP allowed."));
    }
  }
});

// --- ROUTES ---

// SUBMISSION ENDPOINT (Auto Audit Trigger)
app.post('/api/submissions', async (req, res) => {
  try {
    const { title, authorId, authorName, content, type, status, fileUrl, submissionDate } = req.body;

    if (!title || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Create Document with PENDING status
    const docRef = await db.collection('articles').add({
      title,
      authorId,
      authorName,
      content,
      type: type || 'ARTICLE',
      status: status || 'PENDING',
      fileUrl,
      submissionDate: submissionDate || new Date().toISOString(),
      views: 0,
      plagiarismReport: {
        audit_status: 'PENDING',
        generatedAt: new Date().toISOString(),
        summary: 'Queued for forensic analysis...'
      }
    });

    // 2. Trigger Async Audit (Fire & Forget)
    // IMPORTANT: We do NOT await this. Cloud Run CPU *might* throttle, 
    // but typically allows enough time for an API call before full freeze.
    // Ideally use Cloud Tasks, but this is the constraint-compliant implementation.
    auditSubmission(docRef.id, content || title).catch(err => 
      console.error("Async audit trigger failed", err)
    );

    // 3. Immediate Response
    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ error: "Submission processing failed." });
  }
});

// PROFILE IMAGE UPLOAD PIPELINE
app.post('/api/uploads/profile', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "Missing User ID" });

    const processedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 72, force: true, reductionEffort: 6 })
      .withMetadata(false)
      .toBuffer();

    const filename = `${userId}.webp`;
    const filepath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filepath, processedBuffer);

    const fileUrl = `/uploads/users/${filename}`;
    res.json({ success: true, imageUrl: fileUrl });

  } catch (error) {
    console.error("Upload Pipeline Error:", error);
    res.status(500).json({ error: "Image processing failed." });
  }
});

// --- ADMIN CONFIGURATION ---

// Save Gateway Configuration (SuperAdmin Only)
app.post('/api/admin/config/razorpay', async (req, res) => {
  try {
    // In a real prod environment, check req.headers.authorization here for SuperAdmin token
    const { key_id, key_secret, is_live } = req.body;
    
    if (!key_id || !key_secret) {
      return res.status(400).json({ error: "Key ID and Secret are required" });
    }

    await db.collection('gateway_settings').doc('razorpay').set({
      provider_name: 'razorpay',
      key_id,
      key_secret,
      is_live: !!is_live,
      updated_at: new Date()
    });

    res.json({ success: true, message: "Gateway configuration updated" });
  } catch (error) {
    console.error("Config Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- RAZORPAY PAYMENT FLOW ---

// 1. Create Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { userId, planId } = req.body;
    if (!userId || !planId) return res.status(400).json({ error: "Missing parameters" });

    // 1. Fetch Plan
    const planSnap = await db.collection('subscription_plans').doc(planId).get();
    if (!planSnap.exists) return res.status(400).json({ error: "Invalid plan" });
    const plan = planSnap.data();

    // 2. Initialize Dynamic Razorpay
    const { instance, config } = await getRazorpayInstance();

    // Amount in paise
    const amountInPaise = Math.round(plan.price * 100);
    
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
        planName: plan.name
      }
    };

    const order = await instance.orders.create(options);

    // 3. Create Transaction Record
    await db.collection('transactions').add({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: plan.price,
      currency: "INR",
      status: 'pending',
      plan_id: planId,
      gateway_mode: config.is_live ? 'LIVE' : 'TEST',
      created_at: new Date()
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: config.key_id, // Send public key to frontend
      plan_name: plan.name
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: error.message || "Failed to initiate payment gateway" });
  }
});

// 2. Verify Payment
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;

    // 1. Fetch Dynamic Config for Secret
    const { config } = await getRazorpayInstance();

    // 2. Construct Expected Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.key_secret)
      .update(body.toString())
      .digest('hex');

    // 3. Compare
    if (expectedSignature === razorpay_signature) {
      
      // Update Transaction
      const txnQuery = await db.collection('transactions')
        .where('razorpay_order_id', '==', razorpay_order_id)
        .limit(1)
        .get();

      if (!txnQuery.empty) {
        await txnQuery.docs[0].ref.update({
          status: 'success',
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          updated_at: new Date()
        });
      }

      // Update User
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const planSnap = await db.collection('subscription_plans').doc(planId).get();
      const planData = planSnap.data();

      let expiry = new Date();
      if (userSnap.exists && userSnap.data().subscriptionExpiry) {
        const current = new Date(userSnap.data().subscriptionExpiry);
        if (current > expiry) expiry = current;
      }
      
      expiry.setMonth(expiry.getMonth() + (planData.durationMonths || 12));

      await userRef.update({
        subscriptionTier: planData.name,
        subscriptionExpiry: expiry.toISOString(),
        current_plan_id: planId,
        plan_status: 'active',
        status: 'ACTIVE',
        articleLimit: planData.articleLimit,
        blogLimit: planData.blogLimit
      });

      // Log Payment
      await db.collection('payments').add({
        userId: userId,
        userName: userSnap.data().name,
        planId: planId,
        planName: planData.name,
        amount: planData.price,
        method: 'RAZORPAY',
        status: 'COMPLETED',
        date: new Date().toISOString(),
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        gatewayMode: config.is_live ? 'LIVE' : 'TEST'
      });

      res.json({ success: true, message: "Payment verified and account upgraded" });

    } else {
      // Invalid
      const txnQuery = await db.collection('transactions')
        .where('razorpay_order_id', '==', razorpay_order_id)
        .limit(1)
        .get();

      if (!txnQuery.empty) {
        await txnQuery.docs[0].ref.update({ status: 'failed_signature', updated_at: new Date() });
      }

      res.status(400).json({ success: false, error: "Invalid signature" });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
