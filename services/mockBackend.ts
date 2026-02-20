
import { Article, EditorialMember, Magazine, NewsItem, User, Product, SubscriptionPlan, PaymentRecord, Coupon, SiteSettings, LeadershipMember, Feedback, Inquiry, Notification, StaticPage, EmailTemplate, PlagiarismReport, OAIRecord, Reference, ReviewAssignment, ReviewMessage, Role, GatewayConfig, ReviewStatus } from '../types';
import { initializeApp } from "firebase/app";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Firestore,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
  persistentLocalCache,
  persistentMultipleTabManager,
  arrayUnion
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
  uploadBytesResumable
} from "firebase/storage";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAtJrLiAnhN5A4umArJKtqhnWmoXXf27K8",
  authDomain: "gen-lang-client-0276037966.firebaseapp.com",
  projectId: "gen-lang-client-0276037966",
  storageBucket: "gen-lang-client-0276037966.firebasestorage.app",
  messagingSenderId: "455779719985",
  appId: "1:455779719985:web:07fc0a4b6a3234cfdeae10",
  measurementId: "G-ZRQEY0LBJC"
};

// --- SIMULATED SERVER ENVIRONMENT ---
const SERVER_ENV = {
  // Use production URL for dynamic payments
  BACKEND_URL: 'https://agrigence-455779719985.us-west1.run.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with settings to prevent timeouts
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  experimentalForceLongPolling: true, // Forces long polling to avoid WebSocket timeouts
});

const storage = getStorage(app);

export const onAuthStateChanged = (authObj: any, cb: (user: FirebaseUser | null) => void) => {
  return firebaseOnAuthStateChanged(authObj, cb);
};

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '', 
  issn: '2345-6789',
  footerSocials: {
    twitter: 'https://x.com/agrigence',
    instagram: 'https://instagram.com/agrigence',
    facebook: 'https://facebook.com/agrigence',
    linkedin: 'https://linkedin.com/company/agrigence',
    youtube: 'https://youtube.com/@agrigence'
  },
  upiId: 'agrigence@upi',
  upiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=agrigence@upi&pn=Agrigence',
  whatsappNumber: '+919452571317',
  contactEmail: 'agrigence@gmail.com',
  homeFeaturedLimit: 3,
  missionText: 'Our mission is to build a trusted digital ecosystem for agriculture knowledge, research publishing, and practical innovation.',
  primaryColor: '#3D2B1F',
  secondaryColor: '#C29263',
  popup: {
    isEnabled: false,
    title: 'Welcome to Agrigence',
    description: 'Explore the latest research in Indian Agriculture.',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
    buttonText: 'View Latest Journal',
    buttonLink: '/journals'
  },
  navigation: [
    { id: '2', label: 'Archive', path: '/journals', isExternal: false, order: 1, isEnabled: true },
    { id: '3', label: 'News', path: '/news', isExternal: false, order: 2, isEnabled: true },
    { id: '4', label: 'Blogs', path: '/blogs', isExternal: false, order: 3, isEnabled: true },
    { id: '5', label: 'Store', path: '/products', isExternal: false, order: 4, isEnabled: true },
    { id: '6', label: 'Editorial Board', path: '/editorial-board', isExternal: false, order: 5, isEnabled: true },
    { id: '7', label: 'Author Guidelines', path: '/author-guidelines', isExternal: false, order: 6, isEnabled: true },
    { id: '8', label: 'About', path: '/about-contact', isExternal: false, order: 7, isEnabled: true },
  ],
  homepageLayout: [
    { id: 'news', label: 'News & Updates', order: 1, isEnabled: true, itemsToShow: 6 },
    { id: 'blogs', label: 'Latest Blogs', order: 2, isEnabled: true, itemsToShow: 6 },
    { id: 'magazine', label: 'Latest Magazine', order: 3, isEnabled: true, itemsToShow: 1 },
    { id: 'books', label: 'Books Store', order: 4, isEnabled: true, itemsToShow: 6 },
    { id: 'reviews', label: 'Community Reviews', order: 5, isEnabled: true, itemsToShow: 6 },
    { id: 'mission', label: 'Our Mission', order: 6, isEnabled: true, itemsToShow: 1 },
  ],
  seo: {
    metaTitle: 'Agrigence - Digital Agriculture Magazine',
    metaDescription: 'Building a trusted digital ecosystem for agricultural knowledge and research publishing.',
    ogImage: '',
    googleAnalyticsId: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    
    // Default New Fields to avoid crashes
    publisherName: 'Agrigence Publications',
    canonicalBaseUrl: 'https://agrigence.com',
    language: 'en',
    region: 'Global',
    forceHttps: true,
    defaultRobots: 'index, follow',
    
    blogTitleTemplate: '{{title}} | Agrigence Blog',
    autoMetaDesc: true,
    enableBlogSchema: true,
    autoInternalLinking: true,
    showReadingTime: true,
    enforceAltText: true,
    cleanSlugs: true,
    showDatesSchema: true,
    
    twitterCardType: 'summary_large_image',
    schemaTemplates: {
        organization: true,
        website: true,
        scholarlyArticle: true,
        blogPosting: true,
        breadcrumb: true,
        person: true
    },
    
    sitemapEnabled: true,
    includeArticles: true,
    includeBlogs: true,
    includePages: true,
    
    forceLowercase: true,
    removeParams: true,
    canonicalEnforcement: true,
    
    maxSnippet: -1,
    maxImagePreview: 'large',
    
    autoTitleFromHeading: true,
    autoKeywordSuggestion: true,
    
    lazyLoadMedia: true,
    dnsPrefetch: true,
    preconnectAssets: true,
    
    enableAlerts: true
  }
};

type UploadStatus = 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
type UploadListener = (progress: number, status: UploadStatus, fileName?: string) => void;

class FirebaseBackendService {
  private db: Firestore;
  private storage: FirebaseStorage;
  private localSettings: SiteSettings = DEFAULT_SETTINGS;
  private uploadListener: UploadListener | null = null;

  constructor() {
    this.db = db;
    this.storage = storage;
    this.initSettingsSync();
    
    // Check seed data on load if admin
    onAuthStateChanged(auth, (user) => {
        if (user && (user.email === 'agrigence@gmail.com' || user.email === 'admin@agrigence.com')) {
            this.checkAndSeedData();
        }
    });
  }

  // --- UPLOAD LISTENER ---
  setUploadListener(listener: UploadListener) {
    this.uploadListener = listener;
  }

  private notifyUpload(progress: number, status: UploadStatus, fileName?: string) {
    if (this.uploadListener) {
      this.uploadListener(progress, status, fileName);
    }
  }

  // --- CORE UTILITIES ---

  private initSettingsSync() {
    const docRef = doc(this.db, 'site_identity', 'global');
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data() as SiteSettings;
            if (data.navigation) {
                // Auto-correct legacy label "Board" to "Editorial Board" locally for display
                // Note: We avoid updateDoc here to prevent potential snapshot loops (flickering)
                data.navigation = data.navigation.map(n => {
                    if (n.label === 'Board' || n.path === '/board') {
                        return { ...n, label: 'Editorial Board', path: '/editorial-board' };
                    }
                    if (n.label === 'Guidelines' || n.path === '/guidelines') {
                        return { ...n, label: 'Author Guidelines', path: '/author-guidelines' };
                    }
                    return n;
                });

                // Ensure critical paths aren't removed in local view
                const hasBoard = data.navigation.some(n => n.path === '/editorial-board');
                if (!hasBoard) {
                    data.navigation.push({ id: 'board-fallback', label: 'Editorial Board', path: '/editorial-board', isExternal: false, order: 5, isEnabled: true });
                }
                const hasGuidelines = data.navigation.some(n => n.path === '/author-guidelines');
                if (!hasGuidelines) {
                    data.navigation.push({ id: 'guidelines-fallback', label: 'Author Guidelines', path: '/author-guidelines', isExternal: false, order: 6, isEnabled: true });
                }
            }
            this.localSettings = data;
        } else {
            this.localSettings = DEFAULT_SETTINGS;
        }
    }, (error) => {
        console.warn("Settings sync offline mode:", error.message);
    });
  }

  private async checkAndSeedData() {
    try {
        const plans = await this.getPlans();
        if (plans.length === 0) {
            const defaultPlans: SubscriptionPlan[] = [
                { id: 'free', name: 'Free Tier', type: 'ARTICLE_ACCESS', price: 0, durationMonths: 12, description: 'Basic access', features: ['Read Only'], isActive: true, validityLabel: '1 Year', articleLimit: 0, blogLimit: 0 },
                { id: 'premium', name: 'Premium Researcher', type: 'COMBO_ACCESS', price: 999, durationMonths: 12, description: 'Full access', features: ['Submit Articles', 'Read All'], isActive: true, validityLabel: '1 Year', articleLimit: 5, blogLimit: 'UNLIMITED' }
            ];
            for (const p of defaultPlans) {
                await setDoc(doc(this.db, 'subscription_plans', p.id), p);
            }
        }
    } catch (e) {
        console.error("Seeding failed (likely offline):", e);
    }
  }

  private async getCollectionData<T>(collectionName: string, orderByField?: string): Promise<T[]> {
    try {
        const colRef = collection(this.db, collectionName);
        const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : query(colRef);
        const snapshot = await getDocs(q);
        // Corrected mapping: Spread data first, then overwrite id with doc.id to ensure we use the Document ID
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as T[];
    } catch (e) {
        console.error(`Error fetching collection ${collectionName}:`, e);
        return [];
    }
  }

  private subscribeToCollection<T>(collectionName: string, cb: (data: T[]) => void, orderByField?: string): () => void {
    const colRef = collection(this.db, collectionName);
    const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : query(colRef);
    return onSnapshot(q, (snapshot) => {
      // Corrected mapping: Spread data first, then overwrite id with doc.id
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as T[];
      cb(data);
    }, (error) => {
        console.warn(`Subscription error for ${collectionName}:`, error);
        // Don't crash on error, just log
    });
  }

  // --- METHODS ---
  getSettings(): SiteSettings { return this.localSettings; }
  
  subscribeToSettings(cb: (s: SiteSettings) => void) {
    return onSnapshot(doc(this.db, 'site_identity', 'global'), (doc) => {
        if (doc.exists()) {
            cb(doc.data() as SiteSettings);
        } else {
            cb(DEFAULT_SETTINGS);
        }
    });
  }

  async refreshSettings() {
    try {
        const docSnap = await getDoc(doc(this.db, 'site_identity', 'global'));
        if (docSnap.exists()) {
            this.localSettings = docSnap.data() as SiteSettings;
        }
    } catch(e) { console.warn("Refresh settings failed", e); }
  }

  async updateSettings(settings: SiteSettings) {
    await setDoc(doc(this.db, 'site_identity', 'global'), settings);
    this.localSettings = settings;
  }

  async login(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return this.getUser(cred.user.uid);
  }

  // Enhanced Registration
  async register(data: Partial<User> & { password?: string }) {
    if (!data.email || !data.password) throw new Error("Missing credentials");
    
    // Create Auth User
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // Auto-detect currency based on country
    const currency = this.mapCountryToCurrency(data.country || 'IN');

    await updateProfile(cred.user, { displayName: data.name, photoURL: data.profilePhotoUrl || data.avatar });
    
    const newUser: User = {
        id: cred.user.uid,
        name: data.name || 'User',
        email: data.email,
        role: data.role || 'USER',
        occupation: data.occupation,
        permissions: { canDownloadArticles: false, canDownloadBlogs: true },
        articleUsage: 0,
        blogUsage: 0,
        joinedDate: new Date().toISOString(),
        status: 'ACTIVE',
        subscriptionTier: 'Free',
        avatar: data.avatar,
        // New Fields
        country: data.country,
        mobileNumber: data.mobileNumber,
        profilePhotoUrl: data.profilePhotoUrl,
        currency: currency
    };
    
    await setDoc(doc(this.db, 'users', newUser.id), newUser);
    return newUser;
  }

  // --- CURRENCY UTILS ---
  
  private mapCountryToCurrency(countryCode: string): string {
      const map: Record<string, string> = {
          'IN': 'INR',
          'US': 'USD',
          'GB': 'GBP',
          'AE': 'AED',
          'NG': 'NGN',
          'CA': 'CAD',
          'AU': 'AUD',
          'EU': 'EUR',
          'BD': 'BDT',
          'PK': 'PKR',
          'LK': 'LKR'
      };
      // Default to USD for others
      return map[countryCode.toUpperCase()] || (countryCode.toUpperCase() === 'IN' ? 'INR' : 'USD');
  }

  // Helper for frontend display price (Approximate / Static conversion)
  // Base is always INR
  getDisplayPrice(baseInr: number, userCurrency?: string): { amount: number, currency: string, symbol: string } | null {
      if (!userCurrency || userCurrency === 'INR') return null;

      const rates: Record<string, number> = {
          'USD': 0.012,
          'GBP': 0.0095,
          'AED': 0.044,
          'EUR': 0.011,
          'NGN': 18.5, 
          'CAD': 0.016,
          'AUD': 0.018,
          'BDT': 1.3,
          'PKR': 3.3,
          'LKR': 3.6
      };

      const symbols: Record<string, string> = {
          'USD': '$',
          'GBP': '£',
          'AED': 'AED',
          'EUR': '€',
          'NGN': '₦',
          'CAD': 'C$',
          'AUD': 'A$',
          'BDT': '৳',
          'PKR': '₨',
          'LKR': 'Rs'
      };

      const rate = rates[userCurrency];
      if (!rate) return null;

      const converted = Math.ceil(baseInr * rate);
      return {
          amount: converted,
          currency: userCurrency,
          symbol: symbols[userCurrency] || userCurrency
      };
  }

  async logout() { await signOut(auth); }

  async getUser(uid: string): Promise<User | null> {
    try {
        const d = await getDoc(doc(this.db, 'users', uid));
        return d.exists() ? (d.data() as User) : null;
    } catch (e) { return null; }
  }

  async syncUser(firebaseUser: FirebaseUser) {
    const userRef = doc(this.db, 'users', firebaseUser.uid);
    try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
           const newUser: User = {
               id: firebaseUser.uid,
               name: firebaseUser.displayName || 'User',
               email: firebaseUser.email || '',
               role: 'USER',
               permissions: { canDownloadArticles: false, canDownloadBlogs: true },
               articleUsage: 0,
               blogUsage: 0,
               joinedDate: new Date().toISOString(),
               status: 'ACTIVE',
               avatar: firebaseUser.photoURL || '',
               // Default Fallbacks
               currency: 'INR',
               country: 'IN'
           };
           await setDoc(userRef, newUser);
        } else {
           await updateDoc(userRef, { lastLogin: new Date().toISOString() });
        }
    } catch (e) { console.warn(e); }
  }

  subscribeToUser(uid: string, cb: (u: User) => void) {
    return onSnapshot(doc(this.db, 'users', uid), (doc) => {
        if (doc.exists()) cb(doc.data() as User);
    });
  }

  async getUsers() { return this.getCollectionData<User>('users', 'joinedDate'); }
  subscribeToUsers(cb: (u: User[]) => void) { return this.subscribeToCollection('users', cb, 'joinedDate'); }
  async updateUser(user: User) { await updateDoc(doc(this.db, 'users', user.id), { ...user }); }
  async deleteUser(id: string) { await deleteDoc(doc(this.db, 'users', id)); }
  
  async getPublicAdmins() {
    try {
      const q = query(collection(this.db, 'users'), where('role', 'in', ['ADMIN', 'SUPER_ADMIN']));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as User[];
    } catch (e) { return []; }
  }

  async changeUserPassword(current: string, newPass: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user signed in");
    
    // Re-authenticate to ensure security compliance
    const cred = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(user, cred);
    
    // Update password
    await updatePassword(user, newPass);
  }

  // --- CONTENT ---
  async getArticles(search?: string) {
    let articles = await this.getCollectionData<Article>('articles', 'submissionDate');
    if (search) {
        const lower = search.toLowerCase();
        articles = articles.filter(a => a.title.toLowerCase().includes(lower) || a.authorName.toLowerCase().includes(lower));
    }
    return articles;
  }
  subscribeToArticles(cb: (a: Article[]) => void) { return this.subscribeToCollection('articles', cb, 'submissionDate'); }
  
  async getUserArticles(userId: string) {
    try {
        const q = query(collection(this.db, 'articles'), where('authorId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Article[];
    } catch (e) { return []; }
  }

  async submitArticle(data: Partial<Article>) {
    // --- UPDATED SUBMISSION FLOW ---
    // Use the backend API to trigger auto-audit via Gemini.
    // Explicitly set review_status to 'submitted'
    try {
        const payload = {
            ...data,
            review_status: 'submitted' as ReviewStatus,
            status: 'PENDING'
        };

        const backendUrl = SERVER_ENV.BACKEND_URL.replace(/\/$/, '');
        const response = await fetch(`${backendUrl}/api/submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Server submission failed");
        }

        const resData = await response.json();
        return { id: resData.id, ...payload };
    } catch (e) {
        console.error("Submission API Error:", e);
        throw e;
    }
  }

  async updateArticle(article: Article) { 
      await updateDoc(doc(this.db, 'articles', article.id), { ...article });
  }
  
  async updateArticleStatus(id: string, status: Article['status']) { await updateDoc(doc(this.db, 'articles', id), { status }); }
  
  // New method for Granular Review Flow
  async updateWorkflowStatus(id: string, status: ReviewStatus) {
      await updateDoc(doc(this.db, 'articles', id), { review_status: status });
  }
  
  async deleteArticle(id: string) { 
      const data = (await getDoc(doc(this.db, 'articles', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'ARTICLE', originalId: id });
      await deleteDoc(doc(this.db, 'articles', id)); 
  }
  async deleteSubmissionPermanent(id: string) { await deleteDoc(doc(this.db, 'articles', id)); }
  async addArticle(article: Partial<Article>) { await addDoc(collection(this.db, 'articles'), { ...article, submissionDate: new Date().toISOString() }); }

  // --- REVIEW ASSIGNMENT & MESSAGING ---

  async assignReviewer(articleId: string, reviewerId: string, adminId: string) {
    const reviewerSnap = await getDoc(doc(this.db, 'users', reviewerId));
    if(!reviewerSnap.exists()) throw new Error("Reviewer not found");
    const reviewerData = reviewerSnap.data() as User;

    const assignment: ReviewAssignment = {
        id: `assign_${Date.now()}`,
        articleId,
        reviewerId,
        reviewerName: reviewerData.name,
        status: 'PENDING',
        assignedAt: new Date().toISOString(),
        assignedBy: adminId
    };

    // Use arrayUnion to append to the article document
    // Update article status to indicate assignment
    const articleRef = doc(this.db, 'articles', articleId);
    await updateDoc(articleRef, {
        reviewAssignments: arrayUnion(assignment),
        review_status: 'assigned_for_review', // Granular Update
        status: 'PENDING' 
    });
  }

  async addReviewMessage(articleId: string, msg: Partial<ReviewMessage>) {
      if(!msg.message || !msg.senderId) throw new Error("Invalid message payload");
      
      const newMessage: ReviewMessage = {
          id: `msg_${Date.now()}`,
          senderId: msg.senderId!,
          senderName: msg.senderName || 'System',
          senderRole: msg.senderRole || 'ADMIN',
          message: msg.message!,
          timestamp: new Date().toISOString(),
          type: msg.type || 'SUGGESTION'
      };

      const articleRef = doc(this.db, 'articles', articleId);
      await updateDoc(articleRef, {
          reviewThreads: arrayUnion(newMessage)
      });
  }

  async updateReviewStatus(articleId: string, reviewerId: string, status: 'PENDING' | 'UNDER_REVIEW' | 'REVIEWED') {
      const articleRef = doc(this.db, 'articles', articleId);
      const snap = await getDoc(articleRef);
      if(!snap.exists()) return;
      
      const data = snap.data() as Article;
      if(!data.reviewAssignments) return;

      const now = new Date().toISOString();

      const updatedAssignments = data.reviewAssignments.map(a => {
          if(a.reviewerId === reviewerId) {
              const update: Partial<ReviewAssignment> = { status };
              if (status === 'UNDER_REVIEW' && !a.startedAt) {
                  update.startedAt = now;
              }
              if (status === 'REVIEWED' && !a.completedAt) {
                  update.completedAt = now;
              }
              return { ...a, ...update };
          }
          return a;
      });

      // Workflow Logic: Check aggregate status
      let newReviewStatus: ReviewStatus | undefined;
      
      if (status === 'UNDER_REVIEW') {
          // If any reviewer starts, status moves to under_review
          newReviewStatus = 'under_review';
      } else if (status === 'REVIEWED') {
          // Check if ALL reviewers are done
          const allReviewed = updatedAssignments.every(a => a.status === 'REVIEWED');
          if (allReviewed) {
              newReviewStatus = 'review_completed';
          }
      }

      const updatePayload: any = { reviewAssignments: updatedAssignments };
      
      // Only update global status if it moves strictly forward in the flow
      // or if it's the first time entering under_review
      if (newReviewStatus) {
          // Prevent regression if multiple reviewers are working
          if (newReviewStatus === 'under_review' && data.review_status !== 'review_completed') {
             updatePayload.review_status = 'under_review';
          }
          if (newReviewStatus === 'review_completed') {
             updatePayload.review_status = 'review_completed';
          }
      }

      await updateDoc(articleRef, updatePayload);
  }

  // --- CONTENT (Continued) ---

  async getProducts() { return this.getCollectionData<Product>('products'); }
  subscribeToProducts(cb: (p: Product[]) => void) { return this.subscribeToCollection('products', cb); }
  async addProduct(p: Partial<Product>) { await addDoc(collection(this.db, 'products'), p); }
  async updateProduct(p: Product) { await updateDoc(doc(this.db, 'products', p.id), { ...p }); }
  
  async deleteProduct(id: string) { 
      const data = (await getDoc(doc(this.db, 'products', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'PRODUCT', originalId: id });
      await deleteDoc(doc(this.db, 'products', id)); 
  }

  async getNews() { return this.getCollectionData<NewsItem>('news', 'date'); }
  subscribeToNews(cb: (n: NewsItem[]) => void) { return this.subscribeToCollection('news', cb, 'date'); }
  async addNews(n: Partial<NewsItem>) { 
      if (n.id) await updateDoc(doc(this.db, 'news', n.id), { ...n });
      else await addDoc(collection(this.db, 'news'), { ...n, date: new Date().toISOString().split('T')[0] }); 
  }
  async deleteNews(id: string) { 
      const data = (await getDoc(doc(this.db, 'news', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'NEWS', originalId: id });
      await deleteDoc(doc(this.db, 'news', id)); 
  }

  async getMagazines() { return this.getCollectionData<Magazine>('magazines', 'year'); }
  async getJournals() { return this.getMagazines(); }
  subscribeToMagazines(cb: (m: Magazine[]) => void) { return this.subscribeToCollection('magazines', cb, 'year'); }
  async addMagazine(m: Partial<Magazine>) {
      if (m.id) await updateDoc(doc(this.db, 'magazines', m.id), { ...m });
      else await addDoc(collection(this.db, 'magazines'), m);
  }
  async deleteMagazine(id: string) { 
      const data = (await getDoc(doc(this.db, 'magazines', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'MAGAZINE', originalId: id });
      await deleteDoc(doc(this.db, 'magazines', id));
  }

  async getMembers() { return this.getCollectionData<EditorialMember>('editorial_board', 'order'); }
  async addMember(m: Partial<EditorialMember>) { await addDoc(collection(this.db, 'editorial_board'), m); }
  async updateMember(m: EditorialMember) { await updateDoc(doc(this.db, 'editorial_board', m.id), { ...m }); }
  
  async deleteMember(id: string) { 
      const data = (await getDoc(doc(this.db, 'editorial_board', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'BOARD_MEMBER', originalId: id });
      await deleteDoc(doc(this.db, 'editorial_board', id)); 
  }

  async getLeadership() { return this.getCollectionData<LeadershipMember>('leadership', 'order'); }
  async updateLeadership(leaders: LeadershipMember[]) {
      const batch = writeBatch(this.db);
      leaders.forEach(l => {
          const ref = l.id.startsWith('l') && l.id.length < 20 ? doc(collection(this.db, 'leadership')) : doc(this.db, 'leadership', l.id);
          batch.set(ref, l);
      });
      await batch.commit();
  }

  async getPlans() { return this.getCollectionData<SubscriptionPlan>('subscription_plans'); }
  async addPlan(p: Partial<SubscriptionPlan>) { await addDoc(collection(this.db, 'subscription_plans'), p); }
  async updatePlan(p: SubscriptionPlan) { await updateDoc(doc(this.db, 'subscription_plans', p.id), { ...p }); }
  async deletePlan(id: string) { await deleteDoc(doc(this.db, 'subscription_plans', id)); }

  async getPayments() { return this.getCollectionData<PaymentRecord>('payments', 'date'); }
  subscribeToPayments(cb: (p: PaymentRecord[]) => void) { return this.subscribeToCollection('payments', cb, 'date'); }
  async getUserPayments(userId: string) {
      try {
        const q = query(collection(this.db, 'payments'), where('userId', '==', userId));
        const snap = await getDocs(q);
        // Correct mapping
        return snap.docs.map(d => ({ ...d.data(), id: d.id })) as PaymentRecord[];
      } catch(e) { return []; }
  }

  // --- REAL-TIME USER PAYMENTS SUBSCRIPTION ---
  subscribeToUserPayments(userId: string, cb: (p: PaymentRecord[]) => void) {
      const q = query(collection(this.db, 'payments'), where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
          // Correct mapping for real-time listener
          const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PaymentRecord[];
          data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          cb(data);
      }, (error) => {
          console.warn("User payments subscription error:", error);
      });
  }

  async verifyPayment(id: string) {
      // Manual verification for QR payments
      const paymentRef = doc(this.db, 'payments', id);
      const paymentSnap = await getDoc(paymentRef);
      if (!paymentSnap.exists()) throw new Error(`Payment record not found: ${id}`);
      const payment = paymentSnap.data() as PaymentRecord;
      await updateDoc(paymentRef, { status: 'COMPLETED' });
      
      const planSnap = await getDoc(doc(this.db, 'subscription_plans', payment.planId));
      if (planSnap.exists()) {
          const plan = planSnap.data() as SubscriptionPlan;
          const userRef = doc(this.db, 'users', payment.userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
              const now = new Date();
              const expiry = new Date();
              expiry.setMonth(expiry.getMonth() + plan.durationMonths);
              
              await updateDoc(userRef, {
                  subscriptionTier: plan.name,
                  subscriptionExpiry: expiry.toISOString(),
                  status: 'ACTIVE',
                  // Reset limits if needed, or add to existing
                  articleLimit: plan.articleLimit,
                  blogLimit: plan.blogLimit
              });
          }
      }
  }

  async getCoupons() { return this.getCollectionData<Coupon>('coupons'); }
  subscribeToCoupons(cb: (c: Coupon[]) => void) { return this.subscribeToCollection('coupons', cb); }
  async addCoupon(c: Partial<Coupon>) { await addDoc(collection(this.db, 'coupons'), { ...c, usageCount: 0 }); }
  async deleteCoupon(id: string) { await deleteDoc(doc(this.db, 'coupons', id)); }

  async getInquiries() { return this.getCollectionData<Inquiry>('inquiries', 'date'); }
  async sendMessage(msg: any) { await addDoc(collection(this.db, 'inquiries'), { ...msg, date: new Date().toISOString(), status: 'PENDING' }); }
  async resolveInquiry(id: string) { await updateDoc(doc(this.db, 'inquiries', id), { status: 'RESOLVED' }); }
  
  subscribeToFeedback(cb: (f: Feedback[]) => void) { return this.subscribeToCollection('feedback', cb, 'date'); }
  async submitFeedback(f: Partial<Feedback>) { await addDoc(collection(this.db, 'feedback'), { ...f, date: new Date().toISOString(), status: 'PENDING' }); }

  async getPages() { return this.getCollectionData<StaticPage>('static_pages'); }
  async updatePage(p: StaticPage) { 
      const q = query(collection(this.db, 'static_pages'), where('slug', '==', p.slug));
      const snap = await getDocs(q);
      if (snap.empty) await addDoc(collection(this.db, 'static_pages'), { ...p, lastUpdated: new Date().toISOString() });
      else await updateDoc(doc(this.db, 'static_pages', snap.docs[0].id), { ...p, lastUpdated: new Date().toISOString() });
  }

  async getTemplates() { return this.getCollectionData<EmailTemplate>('templates'); }
  async updateTemplate(t: EmailTemplate) { await updateDoc(doc(this.db, 'templates', t.id), { ...t }); }

  async getNotifications() { return this.getCollectionData<Notification>('notifications', 'date'); }
  async addNotification(n: Partial<Notification>) { await addDoc(collection(this.db, 'notifications'), { ...n, date: new Date().toISOString() }); }
  async deleteNotification(id: string) { await deleteDoc(doc(this.db, 'notifications', id)); }

  async getTrash() { return this.getCollectionData<any>('trash', 'deletedAt'); }
  
  async permanentDelete(id: string) { await deleteDoc(doc(this.db, 'trash', id)); }
  
  async restoreFromTrash(id: string) {
      const trashDoc = await getDoc(doc(this.db, 'trash', id));
      if (!trashDoc.exists()) return;
      const data = trashDoc.data();
      const { trashType, originalId, deletedAt, ...rest } = data;

      let collectionName = '';
      switch(trashType) {
          case 'ARTICLE': collectionName = 'articles'; break;
          case 'MAGAZINE': collectionName = 'magazines'; break;
          case 'NEWS': collectionName = 'news'; break;
          case 'PRODUCT': collectionName = 'products'; break;
          case 'BOARD_MEMBER': collectionName = 'editorial_board'; break;
      }

      if(collectionName) {
          await setDoc(doc(this.db, collectionName, originalId || rest.id), rest);
          await deleteDoc(doc(this.db, 'trash', id));
      }
  }

  async uploadFile(file: File, path: string, customName?: string): Promise<string> {
      this.notifyUpload(0, 'UPLOADING', file.name);

      // --- INTERCEPT PROFILE UPLOADS FOR SERVER-SIDE PROCESSING ---
      if (path === 'users/profiles' && customName) {
          try {
              // Fake progress for visual feedback
              let p = 0;
              const timer = setInterval(() => {
                  p = Math.min(p + 10, 90);
                  this.notifyUpload(p, 'UPLOADING', file.name);
              }, 200);

              // Extract User ID from customName (format: {userId}.webp)
              const userId = customName.split('.')[0];
              
              const formData = new FormData();
              formData.append('file', file);
              formData.append('userId', userId);

              // Use the backend server endpoint for robust processing
              const response = await fetch(`${SERVER_ENV.BACKEND_URL}/api/uploads/profile`, {
                  method: 'POST',
                  body: formData
              });

              clearInterval(timer);

              if (!response.ok) {
                  const err = await response.json().catch(() => ({}));
                  throw new Error(err.error || `Server responded with ${response.status}`);
              }

              const data = await response.json();
              this.notifyUpload(100, 'SUCCESS', file.name);
              
              // Construct full URL (Backend returns relative path /uploads/users/...)
              return `${SERVER_ENV.BACKEND_URL}${data.imageUrl}`;
          } catch (error) {
              console.warn("Backend processing failed, falling back to Firebase Storage:", error);
              // Fallthrough to standard upload logic below
          }
      }

      // --- STANDARD FIREBASE UPLOAD FOR OTHER ASSETS ---
      // Use custom name if provided (e.g., for overwriting specific user profiles)
      // Otherwise, generate a timestamped name to prevent collisions
      const fileName = customName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(this.storage, `${path}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.notifyUpload(progress, 'UPLOADING', file.name);
            },
            (error) => {
                console.error(error);
                this.notifyUpload(0, 'ERROR', file.name);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                this.notifyUpload(100, 'SUCCESS', file.name);
                resolve(downloadURL);
            }
          );
      });
  }

  async incrementVisitorCount() {
      const ref = doc(this.db, 'site_stats', 'visitors');
      try { await updateDoc(ref, { count: increment(1) }); } catch (e) { await setDoc(ref, { count: 1 }); }
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data().count : 0;
  }
  async getVisitorCount() {
      try { const snap = await getDoc(doc(this.db, 'site_stats', 'visitors')); return snap.exists() ? snap.data().count : 0; } catch(e) { return 0; }
  }
  async triggerEmail(to: string, subject: string, html: string) {
      await addDoc(collection(this.db, 'mail'), { to, message: { subject, html } });
  }

  // --- PAYMENT GATEWAY (SECURE) ---
  
  async startPaymentSession(userId: string, planId: string) {
      try {
        const backendUrl = SERVER_ENV.BACKEND_URL.replace(/\/$/, '');
        // Updated to use the correct create-order endpoint requested
        const url = `${backendUrl}/api/payment/create-order`;
        console.log(`[Payment] Initializing session via ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, userId })
        });
        
        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Session creation failed: ${errorText.error || response.statusText}`);
        }
        
        return await response.json();

      } catch (e) {
        console.error("Payment Session Error:", e);
        throw e;
      }
  }

  async saveGatewayConfig(config: GatewayConfig) {
    try {
        const backendUrl = SERVER_ENV.BACKEND_URL.replace(/\/$/, '');
        const url = `${backendUrl}/api/admin/config/razorpay`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const errorText = await response.json().catch(() => ({}));
            throw new Error(errorText.error || 'Failed to save config');
        }
        return true;
    } catch (e) {
        console.error("Config Save Error:", e);
        throw e;
    }
  }

  async createRazorpayOrder(amount: number) { return { id: '', amount: 0, currency: '', key: '' }; }
  async verifyRazorpayPayment(response: any) { return true; }

  async purchasePlan(userId: string, planId: string, details: any) {
      if (details.method !== 'RAZORPAY') {
          const user = await this.getUser(userId);
          const plan = (await this.getPlans()).find(p => p.id === planId);
          if (!user || !plan) throw new Error("Invalid User or Plan");

          const record: PaymentRecord = {
              id: `pay_${Date.now()}`,
              userId,
              userName: user.name,
              planId,
              planName: plan.name,
              amount: details.amount,
              method: details.method,
              status: 'PENDING',
              date: new Date().toISOString(),
              ...details
          };

          await addDoc(collection(this.db, 'payments'), record);
      }
  }

  // --- AI FEATURES ---
  async checkPlagiarism(content: string, title: string): Promise<PlagiarismReport> {
    // Deprecated in favor of backend audit worker
    return { 
        originality_score: 0, 
        plagiarism_score: 0,
        ai_generated_score: 0,
        risk_level: 'LOW', 
        flagged_sections: [], 
        confidence: 0, 
        generatedAt: new Date().toISOString(),
        summary: "Audit will run on server"
    };
  }
}

export const mockBackend = new FirebaseBackendService();
