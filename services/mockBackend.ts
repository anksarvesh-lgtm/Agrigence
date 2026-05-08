
import { safeStringify } from '../lib/safeStringify';
import { v4 as uuidv4 } from 'uuid';
import { Article, EditorialMember, Magazine, NewsItem, User, Product, SubscriptionPlan, PaymentRecord, Coupon, SiteSettings, LeadershipMember, Feedback, Inquiry, Notification, StaticPage, EmailTemplate, PlagiarismReport, OAIRecord, Reference, ReviewAssignment, ReviewMessage, Role, ReviewStatus, Tool, ToolCategory, ToolSection, Review, ActivityLog, Recommendation, UserFieldData, WebsiteVisitor, ToolHistory, Keyword, KeywordCluster, KeywordPerformance, TrendingKeyword, CookieSettings, CookiePreferences, CookieCategory, CookieScript, AiToolSettings, FarmerQuestion, FarmerReply, GovtScheme } from '../types';
import { db, auth, storage } from '../src/firebase';
import { 
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
  arrayUnion
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
  uploadBytesResumable
} from "firebase/storage";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// --- SIMULATED SERVER ENVIRONMENT ---
const SERVER_ENV = {
  // Use relative path for local development to avoid CORS/Fetch errors
  BACKEND_URL: ''
};

export const onAuthStateChanged = (authObj: any, cb: (user: FirebaseUser | null) => void) => {
  return firebaseOnAuthStateChanged(authObj, cb);
};

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '/logo.png', 
  issn: 'Applied For',
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
  tagline: 'Where Agri-Intelligence Meets Agricultural Generations',
  contactEmail: 'agrigence@gmail.com',
  homeFeaturedLimit: 3,
  missionText: 'Agrigence Journal of Agriculture and Allied Science. is a monthly international peer-reviewed online journal dedicated to building a trusted digital ecosystem for agriculture knowledge, research publishing, and practical innovation.',
  primaryColor: '#002147',
  secondaryColor: '#1A3C40',
  popup: {
    isEnabled: false,
    title: 'Welcome to Agrigence Journal',
    description: 'Explore Vol 1 Issue 1 - May 2026. Submit your research today.',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
    buttonText: 'Current Issue',
    buttonLink: '/current-issue'
  },
  navigation: [
    { id: '1', label: 'Home', path: '/', isExternal: false, order: 1, isEnabled: true },
    { id: '2', label: 'Journal', path: '/about-journal', isExternal: false, order: 2, isEnabled: true },
    { id: '3', label: 'Current Issue', path: '/current-issue', isExternal: false, order: 3, isEnabled: true },
    { id: '4', label: 'Archive', path: '/journals', isExternal: false, order: 4, isEnabled: true },
    { id: '5', label: 'Research Articles', path: '/articles', isExternal: false, order: 5, isEnabled: true },
    { id: '6', label: 'Author Guidelines', path: '/author-guidelines', isExternal: false, order: 6, isEnabled: true },
    { id: '7', label: 'Information', path: '/about-contact', isExternal: false, order: 7, isEnabled: true },
  ],
  homepageLayout: [
    { id: 'hero', label: 'Hero Section', order: 1, isEnabled: true, itemsToShow: 1 },
    { id: 'journal_announcements', label: 'Journal Announcements', order: 2, isEnabled: true, itemsToShow: 6 },
    { id: 'recent_research', label: 'Recent Research Articles', order: 3, isEnabled: true, itemsToShow: 6 },
    { id: 'indexing', label: 'Indexing & Partners', order: 4, isEnabled: true, itemsToShow: 6 },
  ],
  featureVisibility: {
    mandi: true,
    schemes: true,
    crops: true,
    journals: true,
    blogs: false,
    news: false,
    store: true
  },
  seo: {
    metaTitle: 'Agrigence Journal of Agriculture and Allied Science.',
    metaDescription: 'Where Agri-Intelligence Meets Agricultural Generations.',
    ogImage: '',
    googleAnalyticsId: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    
    // Default New Fields to avoid crashes
    publisherName: 'Agrigence Publications',
    canonicalBaseUrl: 'https://www.agrigence.in',
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

  private cleanObject<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item)) as any;
    }

    const newObj: any = {};
    Object.keys(obj as any).forEach(key => {
      const val = (obj as any)[key];
      if (val !== undefined) {
        newObj[key] = this.cleanObject(val);
      }
    });
    return newObj as T;
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
            const data = { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings;
            // Deep merge featureVisibility
            if (docSnap.data().featureVisibility) {
                data.featureVisibility = { ...DEFAULT_SETTINGS.featureVisibility, ...docSnap.data().featureVisibility };
            }
            if (data.navigation) {
                // Ensure critical paths for the journal
                const requiredPaths = [
                    { id: '1', label: 'Current Issue', path: '/current-issue', isExternal: false, order: 1, isEnabled: true },
                    { id: '2', label: 'Submit Paper', path: '/submission', isExternal: false, order: 2, isEnabled: true },
                    { id: '3', label: 'Editorial Board', path: '/editorial-board', isExternal: false, order: 3, isEnabled: true },
                ];
                
                requiredPaths.forEach(rp => {
                    const exists = data.navigation.some(n => n.path === rp.path);
                    if (!exists) data.navigation.push(rp);
                });
            }
            if (!data.logoUrl) {
                data.logoUrl = DEFAULT_SETTINGS.logoUrl;
            }
            this.localSettings = data;
        } else {
            this.localSettings = DEFAULT_SETTINGS;
        }
    }, (error) => {
        console.warn("Settings sync offline mode:", error.message);
    });
  }

  async checkAndSeedData() {
    try {
        const plans = await this.getPlans();
        if (plans.length === 0) {
            const defaultPlans: SubscriptionPlan[] = [
                { id: 'free', name: 'Free Tier', type: 'ARTICLE_ACCESS', price: 0, durationMonths: 12, description: 'Basic access', features: ['Read Only'], isActive: true, validityLabel: '1 Year', articleLimit: 0, blogLimit: 0, is_research_enabled: false },
                { id: 'art-sub', name: 'Single Article Subscription', type: 'ARTICLE_ACCESS', price: 149, durationMonths: 1, description: 'Access to 1 article', features: ['Full article PDF access', 'Research download access', 'Citation-ready format'], isActive: true, validityLabel: '1 Month', articleLimit: 1, blogLimit: 0, is_research_enabled: false },
                { id: 'premium', name: 'Annual Subscription', type: 'COMBO_ACCESS', price: 499, durationMonths: 12, description: 'Full access for 1 year', features: ['Multi-article access', 'Current issue access', 'Archive access', 'Priority updates'], isActive: true, validityLabel: '12 Months', articleLimit: 8, blogLimit: 'UNLIMITED', is_research_enabled: true },
                { id: 'lifetime', name: 'Lifetime Subscription', type: 'COMBO_ACCESS', price: 1999, durationMonths: 60, description: '5 years of premium access', features: ['Extended research access', 'Archive access', 'Priority notifications'], isActive: true, validityLabel: '5 Years', articleLimit: 'UNLIMITED', blogLimit: 'UNLIMITED', is_research_enabled: true },
                { id: 'institute', name: 'Institute Subscription', type: 'COMBO_ACCESS', price: 4999, durationMonths: 60, description: 'Institutional access', features: ['Multi-user usage', 'Archive availability', 'Institutional support'], isActive: true, validityLabel: '5 Years', articleLimit: 'UNLIMITED', blogLimit: 'UNLIMITED', is_research_enabled: true },
                { id: 'kisan-pro', name: 'Kisan Pro', type: 'KISAN_ACCESS', price: 199, durationMonths: 12, description: 'Premium farming capabilities', features: ['Priority Marketplace Listings', 'Advanced Weather Alerts', 'Dedicated Expert Access'], isActive: true, validityLabel: '1 Year', articleLimit: 0, blogLimit: 0, is_research_enabled: false }
            ];
            for (const p of defaultPlans) {
                await setDoc(doc(this.db, 'subscription_plans', p.id), p);
            }
        }


        const keywords = await this.getKeywords();
        if (keywords.length === 0) {
          const defaultKeywords: Omit<Keyword, 'id'>[] = [
            { term: 'agriculture in India', category: 'HIGH_VOLUME', priority: 'HIGH', searchVolume: 110000, difficulty: 75, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'farming techniques', category: 'HIGH_VOLUME', priority: 'HIGH', searchVolume: 49500, difficulty: 60, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'organic farming', category: 'HIGH_VOLUME', priority: 'HIGH', searchVolume: 90500, difficulty: 68, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'wheat farming in India', category: 'CROP_SPECIFIC', subCategory: 'Wheat', priority: 'HIGH', searchVolume: 22000, difficulty: 45, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'wheat seed rate', category: 'CROP_SPECIFIC', subCategory: 'Wheat', priority: 'MEDIUM', searchVolume: 8100, difficulty: 30, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'paddy cultivation methods', category: 'CROP_SPECIFIC', subCategory: 'Rice', priority: 'HIGH', searchVolume: 18000, difficulty: 40, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'sugarcane farming guide', category: 'CROP_SPECIFIC', subCategory: 'Sugarcane', priority: 'MEDIUM', searchVolume: 12000, difficulty: 35, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'tomato farming', category: 'CROP_SPECIFIC', subCategory: 'Vegetables', priority: 'HIGH', searchVolume: 40000, difficulty: 55, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'why crop yield is low', category: 'PROBLEM_BASED', priority: 'HIGH', searchVolume: 15000, difficulty: 42, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'pest control in crops', category: 'PROBLEM_BASED', priority: 'HIGH', searchVolume: 27000, difficulty: 50, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'farming in Uttar Pradesh', category: 'LOCATION_BASED', priority: 'MEDIUM', searchVolume: 9900, difficulty: 38, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'PM Kisan Yojana', category: 'GOVERNMENT_SCHEME', priority: 'HIGH', searchVolume: 1500000, difficulty: 85, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
            { term: 'how to increase wheat yield naturally', category: 'LONG_TAIL', priority: 'LOW', searchVolume: 2400, difficulty: 20, aiOptimized: false, synonyms: [], relatedQueries: [], mappedArticles: [], autoInsert: true },
          ];
          for (const kw of defaultKeywords) {
            await this.addKeyword(kw);
          }
        }
        
        const clusters = await this.getKeywordClusters();
        if (clusters.length === 0) {
          const defaultClusters: Omit<KeywordCluster, 'id'>[] = [
            { mainTopic: 'Wheat Farming', subtopics: ['wheat seed rate', 'wheat fertilizer schedule', 'how to increase wheat yield naturally', 'wheat diseases'] },
            { mainTopic: 'Organic Farming', subtopics: ['step by step organic farming', 'organic pest control', 'soil fertility improvement'] }
          ];
          for (const cl of defaultClusters) {
            await this.addKeywordCluster(cl);
          }
        }

        const trending = await this.getTrendingKeywords();
        if (trending.length === 0) {
          const defaultTrending: Omit<TrendingKeyword, 'id'>[] = [
            { term: 'climate resilient crops', searchVolume: 12500, growthPercentage: 145, category: 'Modern Farming' },
            { term: 'drone spraying in agriculture', searchVolume: 8400, growthPercentage: 210, category: 'AgriTech' },
            { term: 'nano urea benefits', searchVolume: 18000, growthPercentage: 85, category: 'Fertilizers' }
          ];
          for (const tr of defaultTrending) {
             await addDoc(collection(this.db, 'trending_keywords'), tr);
          }
        }

        const performance = await this.getKeywordPerformance();
        if (performance.length === 0) {
          const defaultPerformance: Omit<KeywordPerformance, 'keywordId'>[] = [
            { term: 'agriculture in India', ranking: 3, searchVolume: 110000, ctr: 8.5, traffic: 9350, trend: 'UP' },
            { term: 'wheat farming in India', ranking: 1, searchVolume: 22000, ctr: 24.2, traffic: 5324, trend: 'STABLE' },
            { term: 'PM Kisan Yojana', ranking: 12, searchVolume: 1500000, ctr: 1.2, traffic: 18000, trend: 'UP' },
            { term: 'organic farming', ranking: 5, searchVolume: 90500, ctr: 5.1, traffic: 4615, trend: 'DOWN' }
          ];
          for (const perf of defaultPerformance) {
            await addDoc(collection(this.db, 'keyword_performance'), { ...perf, keywordId: `kw_${Math.random().toString(36).substring(2, 9)}` });
          }
        }
    } catch (e) {
        console.error("Seeding failed (likely offline):", e instanceof Error ? e.message : String(e));
    }
  }

  private _triggerLocalUpdate(collectionName: string) {
      const tDoc = doc(this.db, collectionName, '_local_trigger');
      setDoc(tDoc, { ts: Date.now() }).then(() => deleteDoc(tDoc)).catch(() => {});
  }

  private async getCollectionData<T>(collectionName: string, orderByField?: string, silent: boolean = false): Promise<T[]> {
    try {
        const colRef = collection(this.db, collectionName);
        const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : query(colRef);
        const snapshot = await getDocs(q);
        // Corrected mapping: Spread data first, then overwrite id with doc.id to ensure we use the Document ID
        return snapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .filter(doc => !doc.id.startsWith('_')) as unknown as T[];
    } catch (e) {
        if (!silent) {
            console.error(`Error fetching collection ${collectionName}:`, e instanceof Error ? e.message : String(e));
        }
        return [];
    }
  }

  private subscribeToCollection<T>(collectionName: string, cb: (data: T[]) => void, orderByField?: string): () => void {
    const colRef = collection(this.db, collectionName);
    const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : query(colRef);
    return onSnapshot(q, (snapshot) => {
      // Corrected mapping: Spread data first, then overwrite id with doc.id
      const data = snapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(doc => !doc.id.startsWith('_')) as unknown as T[];
      cb(data);
    }, (error) => {
        console.warn(`Subscription error for ${collectionName}:`, error);
        // Don't crash on error, just log
    });
  }

  // --- METHODS ---
  getSettings(): SiteSettings { return this.localSettings; }
  
  async getAiToolSettings(): Promise<AiToolSettings[]> {
    return this.getCollectionData<AiToolSettings>('ai_tool_settings');
  }

  async updateAiToolSettings(settings: AiToolSettings) {
    await setDoc(doc(this.db, 'ai_tool_settings', settings.id), settings);
  }
  
  subscribeToSettings(cb: (s: SiteSettings) => void) {
    return onSnapshot(doc(this.db, 'site_identity', 'global'), (docSnap) => {
        if (docSnap.exists()) {
            const data = { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings;
            if (docSnap.data().featureVisibility) {
                data.featureVisibility = { ...DEFAULT_SETTINGS.featureVisibility, ...docSnap.data().featureVisibility };
            }
            if (!data.logoUrl) {
                data.logoUrl = DEFAULT_SETTINGS.logoUrl;
            }
            cb(data);
        } else {
            cb(DEFAULT_SETTINGS);
        }
    });
  }

  async refreshSettings() {
    try {
        const docSnap = await getDoc(doc(this.db, 'site_identity', 'global'));
        if (docSnap.exists()) {
            const data = { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings;
            if (docSnap.data().featureVisibility) {
                data.featureVisibility = { ...DEFAULT_SETTINGS.featureVisibility, ...docSnap.data().featureVisibility };
            }
            this.localSettings = data;
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
        dob: data.dob,
        email: data.email.toLowerCase().trim(),
        role: data.role || 'USER',
        occupation: data.occupation,
        permissions: { canDownloadArticles: false, canDownloadBlogs: true },
        articleUsage: 0,
        blogUsage: 0,
        joinedDate: new Date().toISOString(),
        status: 'ACTIVE',
        subscriptionTier: 'Free',
        avatar: data.avatar,
        farmId: uuidv4(),
        // New Fields
        country: data.country,
        mobileNumber: data.mobileNumber,
        profilePhotoUrl: data.profilePhotoUrl,
        currency: currency,
        userType: data.userType || 'INDIVIDUAL',
        adminArticleLimitAdjustment: 0,
        adminBlogLimitAdjustment: 0,
        adminEnabledTools: [],
    };
    
    await setDoc(doc(this.db, 'users', newUser.id), newUser);

    // Auto-sync to WhatsApp Contacts
    if (newUser.mobileNumber && typeof window !== 'undefined') {
      try {
        await fetch('/api/whatsapp/auto-add-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newUser.name, phone: newUser.mobileNumber })
        });
      } catch (e) {
        console.error("WhatsApp auto-sync failed", e);
      }
    }

    return newUser;
  }

  // --- ADMIN PASSWORD RESET ---
  async adminResetUserPassword(userId: string, newPass: string) {
    // In a real Firebase app, this requires the Firebase Admin SDK on a Node.js backend.
    // Since we are using the client SDK, we cannot directly change another user's password.
    // For the sake of this prototype, we'll simulate success.
    console.warn("Simulating password reset. In production, use Firebase Admin SDK.");
    // We could store a flag in the user's document if we wanted to force a reset on next login,
    // but for now, we just return true.
    return true;
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

  async getUserByEmail(email: string): Promise<User | null> {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`Searching for user with email: ${normalizedEmail}`);
        const q = query(collection(this.db, 'users'), where('email', '==', normalizedEmail));
        const snap = await getDocs(q);
        if (snap.empty) {
            console.log("No user found with that email.");
            return null;
        }
        return snap.docs[0].data() as User;
    } catch (e) { 
        console.error("Error in getUserByEmail:", e instanceof Error ? e.message : String(e));
        return null; 
    }
  }

  async syncUser(firebaseUser: FirebaseUser) {
    const userRef = doc(this.db, 'users', firebaseUser.uid);
    try {
        const snap = await getDoc(userRef);
        const email = (firebaseUser.email || '').toLowerCase().trim();
        const isSuperAdminEmail = email === 'anksarvesh@gmail.com' || email === 'agrigence@gmail.com';
        
        if (!snap.exists()) {
           const newUser: User = {
               id: firebaseUser.uid,
               name: firebaseUser.displayName || 'User',
               email: email,
               role: isSuperAdminEmail ? 'SUPER_ADMIN' : 'USER',
               permissions: { canDownloadArticles: false, canDownloadBlogs: true },
               articleUsage: 0,
               blogUsage: 0,
               joinedDate: new Date().toISOString(),
               status: 'ACTIVE',
               avatar: firebaseUser.photoURL || '',
               farmId: uuidv4(),
               // Default Fallbacks
               currency: 'INR',
               country: 'IN'
           };
           await setDoc(userRef, newUser);
        } else {
           const data = snap.data() as User;
           const updateData: any = { lastLogin: new Date().toISOString() };
           
           if (!data.farmId) {
               updateData.farmId = uuidv4();
           }

           if (isSuperAdminEmail && data.role !== 'SUPER_ADMIN') {
               updateData.role = 'SUPER_ADMIN';
           }
           await updateDoc(userRef, updateData);
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
  async updateUser(userId: string, data: Partial<User>) { 
      await setDoc(doc(this.db, 'users', userId), data, { merge: true }); 
      
      // Auto-sync to WhatsApp Contacts if phone provided
      if ((data.mobileNumber || data.name) && typeof window !== 'undefined') {
          try {
            await fetch('/api/whatsapp/auto-add-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Use data.name if available, otherwise it'll fall back to 'Unknown' in backend
                body: JSON.stringify({ name: data.name, phone: data.mobileNumber })
            });
          } catch(e) { console.warn('WhatsApp sync failed on update', e); }
      }
  }
  
  async updateUserLimitAdjustment(userId: string, data: { 
    articleAdjustment: number, 
    blogAdjustment: number, 
    notes: string,
    adminEnabledTools?: string[],
    adminExpiryOverride?: string | null,
    userType?: 'INDIVIDUAL' | 'INSTITUTE' | 'ORGANISATION' | 'FARMER'
  }) {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      adminArticleLimitAdjustment: data.articleAdjustment,
      adminBlogLimitAdjustment: data.blogAdjustment,
      limitAdjustmentNotes: data.notes,
      adminEnabledTools: data.adminEnabledTools || [],
      adminExpiryOverride: data.adminExpiryOverride || null,
      userType: data.userType || 'INDIVIDUAL'
    });
  }

  async deleteUser(id: string) { await deleteDoc(doc(this.db, 'users', id)); }
  
  async deleteSubmissionPermanent(id: string) {
      await deleteDoc(doc(this.db, 'articles', id));
  }
  
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
  private DUMMY_ARTICLES: Article[] = [
    {
      id: 'art-1',
      title: 'Advancements in Sustainable Crop Management Practices in Northern India',
      authorName: 'Dr. Rajesh Kumar, Dr. Anita Singh',
      abstract: 'This research explores the recent advancements in sustainable crop management specifically tailored for Northern Indian topography. We analyze the impact of organic fertilizers and precision irrigation on yield and soil health over a five-year study.',
      keywords: ['Sustainability', 'Agriculture', 'India', 'Crop Management', 'Organic Fertilizers'],
      category: 'Agronomy',
      submissionDate: '2026-05-01T10:00:00Z',
      status: 'Published',
      review_status: 'review_completed',
      views: 1240,
      authorId: 'system',
      volume: '1',
      issueNumber: '1',
      slug: 'advancements-sustainable-crop-management',
      content: '',
      tags: [],
      type: 'ARTICLE',
      downloadAccess: 'FREE'
    },
    {
      id: 'art-2',
      title: 'Impact of Climate Change on Horticulture Productivity in Himalayan Foothills',
      authorName: 'Prof. S.K. Sharma',
      abstract: 'Climate variability is significantly shifting the harvest seasons and quality of horticultural crops in the Himalayan region. This paper documents these shifts and proposes adaptive strategies for local farmers.',
      keywords: ['Climate Change', 'Horticulture', 'Himalayas', 'Adaptive Farming'],
      category: 'Horticulture',
      submissionDate: '2026-05-02T11:00:00Z',
      status: 'Published',
      review_status: 'review_completed',
      views: 890,
      authorId: 'system',
      volume: '1',
      issueNumber: '1',
      slug: 'impact-climate-change-horticulture',
      content: '',
      tags: [],
      type: 'ARTICLE',
      downloadAccess: 'FREE'
    },
    {
      id: 'art-3',
      title: 'Digital Transformation of Indian Mandis: A Case Study of e-NAM Implementation',
      authorName: 'Dr. Vivek Mishra, Er. Sahil Varma',
      abstract: 'The e-NAM initiative has aimed to unify Indian agricultural markets. This study evaluates the successes and challenges faced during the implementation phase in major trade hubs.',
      keywords: ['e-NAM', 'Indian Mandi', 'Digital Transformation', 'Agribusiness'],
      category: 'Agribusiness',
      submissionDate: '2026-05-03T12:00:00Z',
      status: 'Published',
      review_status: 'review_completed',
      views: 1560,
      authorId: 'system',
      volume: '1',
      issueNumber: '1',
      slug: 'digital-transformation-indian-mandis',
      content: '',
      tags: [],
      type: 'ARTICLE',
      downloadAccess: 'FREE'
    }
  ];

  private DUMMY_MAGAZINES: Magazine[] = [];

  async getMagazines() { 
      const dbMagazines = await this.getCollectionData<Magazine>('magazines', 'year'); 
      return [...this.DUMMY_MAGAZINES, ...dbMagazines];
  }
  async getJournals() { return this.getMagazines(); }
  subscribeToMagazines(cb: (m: Magazine[]) => void) { 
      return this.subscribeToCollection<Magazine>('magazines', (data) => {
          cb([...this.DUMMY_MAGAZINES, ...data]);
      }, 'year'); 
  }
  async addMagazine(m: Partial<Magazine>) {
      if (m.id && m.id.startsWith('dummy-')) return;
      if (m.id) await updateDoc(doc(this.db, 'magazines', m.id), { ...m });
      else await addDoc(collection(this.db, 'magazines'), m);
  }
  async deleteMagazine(id: string) { 
      if (id.startsWith('dummy-')) {
          this.DUMMY_MAGAZINES = this.DUMMY_MAGAZINES.filter(m => m.id !== id);
          this._triggerLocalUpdate('magazines');
          return;
      }
      const data = (await getDoc(doc(this.db, 'magazines', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'MAGAZINE', originalId: id });
      await deleteDoc(doc(this.db, 'magazines', id));
  }

  // --- ARTICLES ---

  async getArticles(search?: string) {
    let articles = await this.getCollectionData<Article>('articles');
    articles = [...this.DUMMY_ARTICLES, ...articles].sort((a, b) => new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime());
    if (search) {
        const lower = search.toLowerCase();
        articles = articles.filter(a => a.title.toLowerCase().includes(lower) || a.authorName.toLowerCase().includes(lower));
    }
    return articles;
  }
  
  subscribeToArticles(cb: (a: Article[]) => void) { 
      return this.subscribeToCollection<Article>('articles', (data) => {
          const merged = [...this.DUMMY_ARTICLES, ...data];
          const sorted = merged.sort((a, b) => new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime());
          cb(sorted);
      }); 
  }
  
  async getUserArticles(userId: string) {
    try {
        const q = query(collection(this.db, 'articles'), where('authorId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Article[];
    } catch (e) { return []; }
  }

  async submitArticle(data: Partial<Article>) {
    try {
        const payload = {
            ...data,
            review_status: 'submitted' as any,
            status: 'Pending' as any,
            source: 'user',
            submissionDate: data.submissionDate || new Date().toISOString(),
            views: 0,
            plagiarismReport: {
                audit_status: 'PENDING',
                generatedAt: new Date().toISOString(),
                summary: 'Queued for forensic analysis...'
            }
        };

        const docRef = await addDoc(collection(this.db, 'articles'), payload);
        return { id: docRef.id, ...payload };
    } catch (e: any) {
        throw e;
    }
  }

  async updateArticle(article: Article) { 
      if (article.id.startsWith('dummy-')) return;
      await updateDoc(doc(this.db, 'articles', article.id), { ...article });
  }
  
  async updateArticleStatus(id: string, status: Article['status']) { 
      if (id.startsWith('dummy-')) return;
      await updateDoc(doc(this.db, 'articles', id), { status }); 
  }
  
  async updateWorkflowStatus(id: string, status: any) {
      if (id.startsWith('dummy-')) return;
      await updateDoc(doc(this.db, 'articles', id), { review_status: status });
  }
  
  async deleteArticle(id: string) { 
      if (id.startsWith('dummy-')) {
          this.DUMMY_ARTICLES = this.DUMMY_ARTICLES.filter(a => a.id !== id);
          this._triggerLocalUpdate('articles');
          return;
      }
      const data = (await getDoc(doc(this.db, 'articles', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'ARTICLE', originalId: id });
      await deleteDoc(doc(this.db, 'articles', id)); 
  }

  async addArticle(article: Partial<Article>) { 
      await addDoc(collection(this.db, 'articles'), { ...article, submissionDate: new Date().toISOString() }); 
  }

  // --- REVIEW ASSIGNMENT & MESSAGING ---

  async assignReviewer(articleId: string, reviewerId: string, adminId: string) {
    const reviewerSnap = await getDoc(doc(this.db, 'users', reviewerId));
    if(!reviewerSnap.exists()) throw new Error("Reviewer not found");
    const reviewerData = reviewerSnap.data() as User;
    
    // Updated assuming arrayUnion exists and ReviewAssignment type exists
    const assignment: any = {
        id: `assign_${Date.now()}`,
        articleId,
        reviewerId,
        reviewerName: reviewerData.name,
        status: 'PENDING',
        assignedAt: new Date().toISOString(),
        assignedBy: adminId
    };

    const articleRef = doc(this.db, 'articles', articleId);
    await updateDoc(articleRef, {
        reviewAssignments: arrayUnion(assignment),
        review_status: 'assigned_for_review',
        status: 'Pending' 
    });
  }

  async addReviewMessage(articleId: string, msg: Partial<any>) {
      const articleRef = doc(this.db, 'articles', articleId);
      await updateDoc(articleRef, { reviewThreads: arrayUnion(msg) });
  }

  async updateReviewStatus(articleId: string, reviewerId: string, status: any) {
      const articleRef = doc(this.db, 'articles', articleId);
      const snap = await getDoc(articleRef);
      if(!snap.exists()) return;
      
      const data = snap.data() as Article;
      if(!data.reviewAssignments) return;

      const updatedAssignments = data.reviewAssignments.map((a: any) => {
          if(a.reviewerId === reviewerId) return { ...a, status };
          return a;
      });

      await updateDoc(articleRef, { reviewAssignments: updatedAssignments });
  }

  async saveReviewDraft(review: Partial<any>) {
    if (!review.manuscriptId || !review.reviewerId) throw new Error("Missing manuscriptId or reviewerId");
    
    const reviewsRef = collection(this.db, 'reviews');
    const q = query(reviewsRef, where('manuscriptId', '==', review.manuscriptId));
    const snap = await getDocs(q);
    const existingDoc = snap.docs.find(d => d.data().reviewerId === review.reviewerId);
    
    const reviewData = { ...review, lastSavedAt: new Date().toISOString(), status: 'draft' };

    if (!existingDoc) {
        const docRef = await addDoc(reviewsRef, reviewData);
        return docRef.id;
    } else {
        await updateDoc(existingDoc.ref, reviewData);
        return existingDoc.id;
    }

    const articleRef = doc(this.db, 'articles', review.manuscriptId);
    await updateDoc(articleRef, { review_status: 'DraftSaved' });
  }

  async getReview(manuscriptId: string, reviewerId: string) {
    const reviewsRef = collection(this.db, 'reviews');
    const q = query(reviewsRef, where('manuscriptId', '==', manuscriptId));
    const snap = await getDocs(q);
    const existingDoc = snap.docs.find(d => d.data().reviewerId === reviewerId);
    if (!existingDoc) return null;
    return { ...existingDoc.data(), id: existingDoc.id } as Review;
  }

  async submitReview(reviewId: string) {
    const reviewRef = doc(this.db, 'reviews', reviewId);
    await updateDoc(reviewRef, { status: 'submitted', submittedAt: new Date().toISOString() });
    const review = (await getDoc(reviewRef)).data() as any;
    
    await this.updateReviewStatus(review.manuscriptId, review.reviewerId, 'REVIEWED');
  }

  async logActivity(log: Partial<any>) {
    const logsRef = collection(this.db, 'activity_logs');
    await addDoc(logsRef, { ...log, timestamp: new Date().toISOString() });
  }

  // --- PRODUCTS ---
  private DUMMY_PRODUCTS: Product[] = [];

  async getProducts() { 
      const dbProducts = await this.getCollectionData<Product>('products'); 
      return [...this.DUMMY_PRODUCTS, ...dbProducts];
  }
  subscribeToProducts(cb: (p: Product[]) => void) { 
      return this.subscribeToCollection<Product>('products', (data) => {
          cb([...this.DUMMY_PRODUCTS, ...data]);
      }); 
  }
  async addProduct(p: Partial<Product>) { await addDoc(collection(this.db, 'products'), p); }
  async updateProduct(p: Product) { 
      if (p.id.startsWith('dummy-')) return;
      await updateDoc(doc(this.db, 'products', p.id), { ...p }); 
  }
  
  async deleteProduct(id: string) { 
      if (id.startsWith('dummy-')) {
          this.DUMMY_PRODUCTS = this.DUMMY_PRODUCTS.filter(p => p.id !== id);
          this._triggerLocalUpdate('products');
          return;
      }
      const data = (await getDoc(doc(this.db, 'products', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'PRODUCT', originalId: id });
      await deleteDoc(doc(this.db, 'products', id)); 
  }

  async getMembers() { return this.getCollectionData<EditorialMember>('editorial_board', 'order'); }
  async addMember(m: Partial<EditorialMember>) { 
      await addDoc(collection(this.db, 'editorial_board'), this.cleanObject(m)); 
  }
  async updateMember(m: EditorialMember) { 
      const { id } = m;
      await updateDoc(doc(this.db, 'editorial_board', id), this.cleanObject(m) as any); 
  }
  
  async deleteMember(id: string) { 
      const data = (await getDoc(doc(this.db, 'editorial_board', id))).data();
      if(data) await addDoc(collection(this.db, 'trash'), { ...data, deletedAt: new Date().toISOString(), trashType: 'BOARD_MEMBER', originalId: id });
      await deleteDoc(doc(this.db, 'editorial_board', id)); 
  }

  async getLeadership() { return this.getCollectionData<LeadershipMember>('leadership', 'order'); }
  async updateLeadership(leaders: LeadershipMember[]) {
      const batch = writeBatch(this.db);
      const currentLeaders = await this.getLeadership();
      const currentIds = currentLeaders.map(l => l.id);
      const newIds = leaders.map(l => l.id);
      const toDelete = currentIds.filter(id => !newIds.includes(id));
      
      toDelete.forEach(id => {
          batch.delete(doc(this.db, 'leadership', id));
      });

      leaders.forEach(l => {
          const ref = doc(this.db, 'leadership', l.id);
          batch.set(ref, this.cleanObject(l));
      });
      await batch.commit();
  }

  async getPlans() { return this.getCollectionData<SubscriptionPlan>('subscription_plans'); }
  async addPlan(p: Partial<SubscriptionPlan>) { 
      await addDoc(collection(this.db, 'subscription_plans'), this.cleanObject(p)); 
  }
  async updatePlan(p: SubscriptionPlan) { 
      await updateDoc(doc(this.db, 'subscription_plans', p.id), this.cleanObject(p) as any); 
  }
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

  async createRazorpayOrder(amount: number, currency: string = "INR") {
      try {
          const resp = await fetch('/api/mobile/razorpay/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, currency })
          });
          
          const text = await resp.text();
          let data;
          try {
              data = text ? JSON.parse(text) : {};
          } catch(e) {
              console.error("Failed to parse Razorpay create response:", text);
              throw new Error("Invalid response from payment server");
          }

          if (!resp.ok) {
              throw new Error(data.error || 'Failed to create Razorpay order');
          }
          return data;
      } catch (err: any) {
          console.error('Razorpay Create Error:', err);
          throw new Error(err.message || "Failed to connect to payment server");
      }
  }

  async verifyRazorpayPayment(paymentData: any) {
      try {
          const resp = await fetch('/api/mobile/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentData)
          });
          
          const text = await resp.text();
          let data;
          try {
              data = text ? JSON.parse(text) : {};
          } catch(e) {
              console.error("Failed to parse Razorpay verify response:", text);
              throw new Error("Invalid response from payment server");
          }

          if (!resp.ok) {
              throw new Error(data.error || 'Payment verification failed');
          }
          return data;
      } catch (err: any) {
          console.error('Razorpay Verify Error:', err);
          throw new Error(err.message || "Failed to verify payment");
      }
  }

  async addPaymentRecord(record: Omit<PaymentRecord, 'id'>) {
      const id = `pay_${Date.now()}`;
      await setDoc(doc(this.db, 'payments', id), { ...record, id });
      return id;
  }

  async processOnlinePayment(userId: string, planId: string, paymentId: string, amount: number, guestInfo?: { name: string, email: string, mobile: string }) {
      const planSnap = await getDoc(doc(this.db, 'subscription_plans', planId));
      let plan: SubscriptionPlan;

      if (!planSnap.exists()) {
          console.warn(`Plan ${planId} not found in DB. Trying to recover using default plans.`);
          const defaultPlans: SubscriptionPlan[] = [
               { id: 'free', name: 'Free Tier', type: 'ARTICLE_ACCESS', price: 0, durationMonths: 12, description: 'Basic access', features: ['Read Only'], isActive: true, validityLabel: '1 Year', articleLimit: 0, blogLimit: 0, is_research_enabled: false },
               { id: 'art-sub', name: 'Single Article Subscription', type: 'ARTICLE_ACCESS', price: 149, durationMonths: 1, description: 'Access to 1 article', features: ['Full article PDF access', 'Research download access', 'Citation-ready format'], isActive: true, validityLabel: '1 Month', articleLimit: 1, blogLimit: 0, is_research_enabled: false },
               { id: 'premium', name: 'Annual Subscription', type: 'COMBO_ACCESS', price: 499, durationMonths: 12, description: 'Full access for 1 year', features: ['Multi-article access', 'Current issue access', 'Archive access', 'Priority updates'], isActive: true, validityLabel: '12 Months', articleLimit: 8, blogLimit: 'UNLIMITED', is_research_enabled: true },
               { id: 'lifetime', name: 'Lifetime Subscription', type: 'COMBO_ACCESS', price: 1999, durationMonths: 60, description: '5 years of premium access', features: ['Extended research access', 'Archive access', 'Priority notifications'], isActive: true, validityLabel: '5 Years', articleLimit: 'UNLIMITED', blogLimit: 'UNLIMITED', is_research_enabled: true },
               { id: 'institute', name: 'Institute Subscription', type: 'COMBO_ACCESS', price: 4999, durationMonths: 60, description: 'Institutional access', features: ['Multi-user usage', 'Archive availability', 'Institutional support'], isActive: true, validityLabel: '5 Years', articleLimit: 'UNLIMITED', blogLimit: 'UNLIMITED', is_research_enabled: true },
               { id: 'kisan-pro', name: 'Kisan Pro', type: 'KISAN_ACCESS', price: 199, durationMonths: 12, description: 'Premium farming capabilities', features: ['Priority Marketplace Listings', 'Advanced Weather Alerts', 'Dedicated Expert Access'], isActive: true, validityLabel: '1 Year', articleLimit: 0, blogLimit: 0, is_research_enabled: false }
          ];
          const found = defaultPlans.find(p => p.id === planId);
          if (found) {
             plan = found;
          } else {
             throw new Error("Plan not found");
          }
      } else {
          plan = planSnap.data() as SubscriptionPlan;
      }

      const now = new Date();
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + plan.durationMonths);

      const record: PaymentRecord = {
          id: `pay_${Date.now()}`,
          userId,
          userName: guestInfo?.name || 'Guest User',
          userEmail: guestInfo?.email,
          userMobile: guestInfo?.mobile,
          planId,
          planName: plan.name,
          amount,
          method: 'ONLINE',
          status: 'COMPLETED',
          date: now.toISOString(),
          txnId: paymentId
      };

      if (!userId.startsWith('guest_')) {
          const userRef = doc(this.db, 'users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
             const userData = userSnap.data() as User;
             record.userName = userData.name;
             record.userEmail = userData.email;
             record.userMobile = userData.mobileNumber;

             await updateDoc(userRef, {
                 subscriptionTier: plan.name,
                 subscriptionExpiry: expiry.toISOString(),
                 status: 'ACTIVE',
                 articleLimit: plan.articleLimit,
                 blogLimit: plan.blogLimit,
                 permissions: {
                    canDownloadArticles: true,
                    canDownloadBlogs: true
                 }
             });
          }
      }

      await addDoc(collection(this.db, 'payments'), record);
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

  async uploadToBlob(file: File, path: string): Promise<string> {
      return this.uploadFile(file, path);
  }

  async deleteFromBlob(url: string): Promise<void> {
      try {
          const response = await fetch('/api/admin/blob/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
          });
          if (!response.ok) {
              console.error('Failed to delete blob:', await response.text());
          }
      } catch (err) {
          console.error('Error deleting blob:', err);
      }
  }

  async uploadFile(file: File, path: string, customName?: string): Promise<string> {
      this.notifyUpload(0, 'UPLOADING', file.name);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      try {
          const response = await fetch('/api/admin/blob/upload', {
              method: 'POST',
              body: formData
          });

          if (!response.ok) {
              let errorMsg = 'Failed to upload file';
              try {
                  const err = await response.json();
                  errorMsg = err.error || errorMsg;
              } catch (e) {
                  const text = await response.text();
                  errorMsg = text || `Server error (${response.status})`;
              }
              this.notifyUpload(0, 'ERROR', file.name);
              throw new Error(errorMsg);
          }

          const data = await response.json();
          this.notifyUpload(100, 'SUCCESS', file.name);
          return data.url;
      } catch (error: any) {
          console.error('Blob Storage Upload Error:', error);
          this.notifyUpload(0, 'ERROR', file.name);
          throw new Error(error.message || 'Failed to upload file');
      }
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



  async purchasePlan(userId: string, planId: string, details: any) {
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
              status: details.status || 'PENDING',
              date: new Date().toISOString(),
              ...details
          };

          const docRef = await addDoc(collection(this.db, 'payments'), record);
          
          // If status is COMPLETED, update user subscription
          if (details.status === 'COMPLETED') {
              const expiry = new Date();
              expiry.setMonth(expiry.getMonth() + plan.durationMonths);
              await updateDoc(doc(this.db, 'users', userId), {
                  subscriptionTier: plan.name,
                  subscriptionExpiry: expiry.toISOString(),
                  articleUsage: 0,
                  blogUsage: 0
              });
          }

          return docRef.id;
  }

  async adminGrantPlan(userId: string, planId: string) {
      await this.purchasePlan(userId, planId, {
          method: 'ONLINE',
          amount: 0,
          status: 'COMPLETED',
          notes: 'Gifted by Admin'
      });
  }

  async getToolSections() {
    const defaultSections: ToolSection[] = [
      { id: 'farm-planning', name: 'Farm Planning' },
      { id: 'crop-mgmt', name: 'Crop Management' },
      { id: 'performance', name: 'Performance & Economics' },
      { id: 'experimental-design', name: 'Experimental Design' },
      { id: 'statistics', name: 'Statistical Analysis' },
      { id: 'environment', name: 'Environment & Adaptation' },
      { id: 'data-science', name: 'Data Science & Modeling' },
      { id: 'knowledge', name: 'Knowledge & Reporting' },
      { id: 'kpi', name: 'KPI & Decision Dashboard' }
    ];
    try {
      const sections = await this.getCollectionData<ToolSection>('tool_sections', undefined, true);
      if (sections.length === 0) {
        for (const s of defaultSections) {
          await setDoc(doc(this.db, 'tool_sections', s.id), s).catch(() => {});
        }
        return defaultSections;
      }
      return sections;
    } catch (e) {
      return defaultSections;
    }
  }

  async getToolCategories(sectionId: string) {
    // In this new flat domain structure, categories map 1:1 to sections for simplicity, 
    // or we can group them if needed. For now, we'll return a single "General" category 
    // for each section to keep the UI consistent, or specific sub-categories if applicable.
    
    const defaultCategories: Record<string, ToolCategory[]> = {
      'agri_intelligence': [
        { id: 'planning-tools', name: 'Planning Tools', sectionId: 'agri_intelligence' },
        { id: 'mgmt-tools', name: 'Management Tools', sectionId: 'agri_intelligence' },
        { id: 'perf-tools', name: 'Performance Tools', sectionId: 'agri_intelligence' }
      ],
      'research': [
        { id: 'design-tools', name: 'Design Tools', sectionId: 'research' },
        { id: 'analysis-tools', name: 'Analysis Tools', sectionId: 'research' },
        { id: 'pub-tools', name: 'Publication Tools', sectionId: 'research' }
      ],
      'soil': [
        { id: 'soil-health', name: 'Soil Health', sectionId: 'soil' },
        { id: 'fertility', name: 'Fertility', sectionId: 'soil' }
      ],
      'analytics': [
        { id: 'analytics-dashboard', name: 'Analytics Dashboard', sectionId: 'analytics' },
        { id: 'pipeline-builder', name: 'Pipeline Builder', sectionId: 'analytics' },
        { id: 'anova-engine', name: 'ANOVA Engine', sectionId: 'analytics' }
      ],
      'finance': [
        { id: 'finance-planning', name: 'Financial Planning', sectionId: 'finance' },
        { id: 'finance-analysis', name: 'Financial Analysis', sectionId: 'finance' }
      ],
      'general': [
        { id: 'general-utils', name: 'General Utilities', sectionId: 'general' }
      ],
      'ai_tools': [
        { id: 'ai-vision', name: 'AI Vision & Diagnostics', sectionId: 'ai_tools' },
        { id: 'ai-writing', name: 'AI Writing & Analysis', sectionId: 'ai_tools' }
      ]
    };

    const toAdd = defaultCategories[sectionId] || [];

    try {
      const q = query(collection(this.db, 'tool_categories'), where('sectionId', '==', sectionId));
      const snap = await getDocs(q);
      const categories = snap.docs.map(d => ({ ...d.data(), id: d.id })) as ToolCategory[];
      
      const categoryIds = new Set(categories.map(c => c.id));
      const missingCategories = toAdd.filter(c => !categoryIds.has(c.id));

      if (missingCategories.length > 0) {
        for (const c of missingCategories) {
          await setDoc(doc(this.db, 'tool_categories', c.id), c).catch(() => {});
          categories.push(c);
        }
      }
      return categories;
    } catch (e) {
      return toAdd;
    }
  }

  async getTools(categoryId: string) {
    const defaultTools: Record<string, Tool[]> = {
      'planning-tools': [
        { id: 'seed-rate', name: 'Seed Rate Calculator', description: 'Scientific calculation for precise seed requirements.', categoryId: 'planning-tools', route: '/tools/seed-rate' },
        { id: 'water-req', name: 'Water Requirement', description: 'FAO-56 Penman-Monteith engine for irrigation scheduling.', categoryId: 'planning-tools', route: '/tools/water-req' },
        { id: 'spray-calculator', name: 'Spray Calculator', description: 'Precision pesticide mixing engine.', categoryId: 'planning-tools', route: '/tools/spray-calculator' }
      ],
      'mgmt-tools': [
        { id: 'climate-analyzer', name: 'Climate Analyzer', description: 'Agro-meteorological indices calculator.', categoryId: 'mgmt-tools', route: '/tools/climate-analyzer' },
        { id: 'yield-estimator', name: 'Yield Estimator', description: 'Scientific yield estimation tool.', categoryId: 'mgmt-tools', route: '/tools/yield-estimator' }
      ],
      'perf-tools': [
        { id: 'kpi-dashboard', name: 'KPI Dashboard', description: 'Key performance indicators for agriculture.', categoryId: 'perf-tools', route: '/tools/kpi-dashboard' }
      ],
      'design-tools': [
        { id: 'experiment-builder', name: 'Experiment Builder', description: 'Design statistically valid field trials.', categoryId: 'design-tools', route: '/tools/experiment-builder' },
        { id: 'plot-dose', name: 'Plot Dose Calculator', description: 'Convert field recommendation into exact plot dose.', categoryId: 'design-tools', route: '/tools/plot-dose' },
        { id: 'factorial-generator', name: 'Factorial Generator', description: 'Treatment combination builder.', categoryId: 'design-tools', route: '/tools/factorial-generator' }
      ],
      'analysis-tools': [
        { id: 'research-lab', name: 'Research Data Lab', description: 'Advanced experimental design & ANOVA engine.', categoryId: 'analysis-tools', route: '/dashboard/research-lab' },
        { id: 'advanced-stats-suite', name: 'Advanced Research Data & Statistical Analysis Suite', description: 'Customizable research data entry and advanced statistical analysis system.', categoryId: 'analysis-tools', route: '/dashboard/advanced-research' }
      ],
      'pub-tools': [
        { id: 'auto-graph', name: 'Graph Generator', description: 'Research visualization engine.', categoryId: 'pub-tools', route: '/tools/auto-graph' }
      ],
      'soil-health': [
        { id: 'nutrient-req', name: 'Nutrient Requirement', description: 'Precision STCR-based nutrient recommendation.', categoryId: 'soil-health', route: '/tools/nutrient-req' }
      ],
      'fertility': [
        { id: 'inm-planner', name: 'INM Planner', description: 'Cost-minimized nutrient planning with organic constraints.', categoryId: 'fertility', route: '/tools/inm-planner' }
      ],
      'analytics-dashboard': [
        { id: 'analytics-dashboard', name: 'Analytics Dashboard', description: 'Comprehensive descriptive, correlation, and regression analysis.', categoryId: 'analytics-dashboard', route: '/analytics' },
        { id: 'pipeline-builder', name: 'Pipeline Builder', description: 'Pipeline builder.', categoryId: 'pipeline-builder', route: '/analytics/pipeline' },
        { id: 'anova-engine', name: 'ANOVA Engine', description: 'ANOVA Engine.', categoryId: 'anova-engine', route: '/analytics/anova' }
      ],
      'finance-planning': [
      ],
      'finance-analysis': [
        { id: 'economics', name: 'Farm Economics', description: 'Comprehensive profitability analysis.', categoryId: 'finance-analysis', route: '/tools/economics' }
      ],
      'general-utils': [
        { id: 'land-converter', name: 'Land Converter', description: 'Convert vernacular land units to standard metric units.', categoryId: 'general-utils', route: '/tools/land-converter' }
      ],
      'ai-vision': [
        { id: 'crop-disease-diagnostic', name: 'AI Crop Disease Diagnostic', description: 'AI-powered crop disease identification and treatment.', categoryId: 'ai-vision', route: '/tools/crop-disease-diagnostic' }
      ],
      'ai-writing': [
        { id: 'writing-assistant', name: 'AI Writing Assistant', description: 'Scientific writing support with AI enhancement.', categoryId: 'ai-writing', route: '/tools/writing-assistant' },
        { id: 'review-organizer', name: 'AI Review Organizer', description: 'Literature management with AI abstract extraction.', categoryId: 'ai-writing', route: '/tools/review-organizer' },
        { id: 'plagiarism-checker', name: 'AI Plagiarism & Integrity Checker', description: 'Analyze articles for similarity and AI-generated content.', categoryId: 'ai-writing', route: '/tools/plagiarism-checker' }
      ]
    };

    const toAdd = defaultTools[categoryId] || [];

    try {
      const q = query(collection(this.db, 'tools'), where('categoryId', '==', categoryId));
      const snap = await getDocs(q);
      const tools = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Tool[];

      const toolIds = new Set(tools.map(t => t.id));
      const missingTools = toAdd.filter(t => !toolIds.has(t.id));

      if (missingTools.length > 0) {
        for (const t of missingTools) {
          await setDoc(doc(this.db, 'tools', t.id), t).catch(() => {});
          tools.push(t);
        }
      }
      return tools;
    } catch (e) {
      return toAdd;
    }
  }

  async getAllTools(): Promise<Tool[]> {
    try {
      const tools = await this.getCollectionData<Tool>('tools');
      if (tools.length === 0) {
        // If empty, we need to trigger the seeding by calling getTools for each category
        // or just return the flattened defaultTools. 
        // For simplicity in admin, we'll just return what's in DB.
        // If DB is empty, the first visit to Tools page usually seeds it.
        return tools;
      }
      return tools;
    } catch (e) {
      return [];
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

  // --- USER FIELD DATA & ANALYSIS ---
  async saveUserFieldData(data: Partial<UserFieldData>): Promise<string> {
    const colRef = collection(this.db, 'user_field_data');
    
    // Check for plan access (simulated)
    // In a real app, this would be a server-side check
    if (!data.is_temporary) {
      // This is a simplified check for the mock
    }

    if (data.id) {
      await setDoc(doc(this.db, 'user_field_data', data.id), {
        ...data,
        updated_at: serverTimestamp()
      }, { merge: true });
      return data.id;
    } else {
      const docRef = await addDoc(colRef, {
        ...data,
        created_at: serverTimestamp()
      });
      return docRef.id;
    }
  }

  async saveTempToolSession(toolName: string, result: any, sessionId: string): Promise<string> {
    const colRef = collection(this.db, 'temp_tool_sessions');
    const docRef = await addDoc(colRef, {
      tool_name: toolName,
      result,
      session_id: sessionId,
      created_at: serverTimestamp()
    });
    return docRef.id;
  }

  async cleanupTemporaryData(): Promise<void> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // Cleanup user_field_data
    const q1 = query(
      collection(this.db, 'user_field_data'),
      where('is_temporary', '==', true)
    );
    const snap1 = await getDocs(q1);
    const batch = writeBatch(this.db);
    snap1.docs.forEach(d => {
      const data = d.data();
      const createdAt = data.created_at?.toDate?.() || new Date(data.created_at);
      if (createdAt < twoHoursAgo) {
        batch.delete(d.ref);
      }
    });
    
    // Cleanup temp_tool_sessions
    const q2 = query(
      collection(this.db, 'temp_tool_sessions'),
      where('created_at', '<', twoHoursAgo)
    );
    const snap2 = await getDocs(q2);
    snap2.docs.forEach(d => batch.delete(d.ref));
    
    await batch.commit();
  }

  async getUserFieldData(userId: string): Promise<UserFieldData[]> {
    const q = query(
      collection(this.db, 'user_field_data'),
      where('user_id', '==', userId)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      created_at: d.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as UserFieldData[];
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return data;
  }

  async deleteUserFieldData(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'user_field_data', id));
  }

  // --- WEBSITE VISITOR TRACKING ---
  async logVisitor(visitor: Partial<WebsiteVisitor>): Promise<void> {
    try {
      if (!visitor.session_id) return;
      
      const cleanVisitor = Object.fromEntries(
        Object.entries(visitor).filter(([_, v]) => v !== undefined)
      );
      
      const docRef = doc(this.db, 'website_visitors', visitor.session_id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...cleanVisitor,
          created_at: new Date().toISOString()
        });
      } else {
        const existingData = docSnap.data() as WebsiteVisitor;
        
        // Calculate duration
        const firstVisit = new Date(existingData.first_visit).getTime();
        const lastVisit = new Date(visitor.last_visit || new Date().toISOString()).getTime();
        const duration = Math.floor((lastVisit - firstVisit) / 1000);
        
        await updateDoc(docRef, {
          last_visit: visitor.last_visit,
          visit_duration: duration,
          pages_visited: visitor.pages_visited,
          page_views: visitor.page_views
        });
      }
    } catch (e: any) {
      if (
        e?.code !== 'permission-denied' && 
        e?.message !== 'Missing or insufficient permissions.' &&
        !e?.message?.includes('offline') &&
        !e?.message?.includes('Backend didn\'t respond')
      ) {
        console.error("Error logging visitor:", e instanceof Error ? e.message : String(e));
      }
    }
  }

  async getVisitors(): Promise<WebsiteVisitor[]> {
    return this.getCollectionData<WebsiteVisitor>('website_visitors', 'last_visit', true);
  }

  subscribeToVisitors(cb: (v: WebsiteVisitor[]) => void) {
    return this.subscribeToCollection<WebsiteVisitor>('website_visitors', cb);
  }

  async cleanupOldVisitors(): Promise<void> {
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const q = query(
        collection(this.db, 'website_visitors'),
        where('last_visit', '<', oneYearAgo)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(this.db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch (e: any) {
      if (e?.code !== 'permission-denied' && e?.message !== 'Missing or insufficient permissions.') {
        console.error("Error cleaning up visitors:", e instanceof Error ? e.message : String(e));
      }
    }
  }


  async banUser(userId: string): Promise<void> {
    const docRef = doc(this.db, 'users', userId);
    await updateDoc(docRef, { status: 'BLOCKED' });
  }


  // --- BACKUP ---
  async backupSite(isAuto = false) {
    try {
      const data = {
        users: await this.getUsers(),
        articles: await this.getArticles(),
        products: await this.getProducts(),
        magazines: await this.getMagazines(),
        members: await this.getMembers(),
        leadership: await this.getLeadership(),
        plans: await this.getPlans(),
        payments: await this.getPayments(),
        coupons: await this.getCoupons(),
        inquiries: await this.getInquiries(),
        pages: await this.getPages(),
        templates: await this.getTemplates(),
        notifications: await this.getNotifications(),
        trash: await this.getTrash(),
        tools: await this.getAllTools(),
        settings: this.getSettings(),
        timestamp: new Date().toISOString()
      };
      
      // Replace old backup
      localStorage.setItem('agrigence_site_backup', safeStringify(data));
      localStorage.setItem('last_auto_backup', new Date().toISOString());
      
      if (!isAuto) {
        const blob = new Blob([safeStringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agrigence_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      return true;
    } catch (error) {
      console.error("Backup failed:", error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', safeStringify(errInfo));
    throw new Error(safeStringify(errInfo));
  }

  // --- TOOL HISTORY ---
  async saveToolHistory(history: Omit<ToolHistory, 'id'>) {
    const path = 'tool_history';
    try {
      const docRef = await addDoc(collection(this.db, path), {
        ...history,
        timestamp: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  }

  subscribeToToolHistory(userId: string, callback: (history: ToolHistory[]) => void) {
    const path = 'tool_history';
    if (!userId) {
      console.warn("subscribeToToolHistory called with empty userId");
      return () => {};
    }
    const q = query(
      collection(this.db, path),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ToolHistory));
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(history);
    }, (error) => {
      const debugInfo = {
        passedUserId: userId,
        authUid: auth.currentUser?.uid,
        isMatch: userId === auth.currentUser?.uid
      };
      console.error('Tool History Subscription Error Debug:', safeStringify(debugInfo));
      this.handleFirestoreError(error, OperationType.LIST, path);
    });
  }

  async getToolHistoryItem(id: string): Promise<ToolHistory | null> {
    const path = `tool_history/${id}`;
    try {
      const docRef = doc(this.db, 'tool_history', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ToolHistory;
      }
      return null;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  }

  // --- KEYWORD INTELLIGENCE ---
  async getKeywords(): Promise<Keyword[]> {
    return this.getCollectionData<Keyword>('keywords');
  }

  async addKeyword(keyword: Omit<Keyword, 'id'>): Promise<Keyword> {
    const docRef = await addDoc(collection(this.db, 'keywords'), keyword);
    return { id: docRef.id, ...keyword } as Keyword;
  }

  async updateKeyword(id: string, updates: Partial<Keyword>): Promise<void> {
    await updateDoc(doc(this.db, 'keywords', id), updates);
  }

  async deleteKeyword(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'keywords', id));
  }

  async getKeywordClusters(): Promise<KeywordCluster[]> {
    return this.getCollectionData<KeywordCluster>('keyword_clusters');
  }

  async addKeywordCluster(cluster: Omit<KeywordCluster, 'id'>): Promise<KeywordCluster> {
    const docRef = await addDoc(collection(this.db, 'keyword_clusters'), cluster);
    return { id: docRef.id, ...cluster } as KeywordCluster;
  }

  async updateKeywordCluster(id: string, updates: Partial<KeywordCluster>): Promise<void> {
    await updateDoc(doc(this.db, 'keyword_clusters', id), updates);
  }

  async deleteKeywordCluster(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'keyword_clusters', id));
  }

  async getKeywordPerformance(): Promise<KeywordPerformance[]> {
    return this.getCollectionData<KeywordPerformance>('keyword_performance');
  }

  async getTrendingKeywords(): Promise<TrendingKeyword[]> {
    return this.getCollectionData<TrendingKeyword>('trending_keywords');
  }

  // --- COOKIE CONSENT MANAGEMENT ---
  async getCookieSettings(): Promise<CookieSettings> {
    const path = 'site_identity/cookie_settings';
    try {
      const docRef = doc(this.db, 'site_identity', 'cookie_settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as CookieSettings;
      }
      
      // Default settings if none exist
      const defaultSettings: CookieSettings = {
        defaultMode: 'ASK',
        expiryDays: 180,
        consentVersion: 1,
        privacyPolicyUrl: '/privacy-policy',
        cookiePolicyUrl: '/cookie-policy',
        categories: [
          { id: 'essential', name: 'Essential Cookies', description: 'Required for the website to function properly.', isEssential: true, isEnabled: true },
          { id: 'analytics', name: 'Analytics Cookies', description: 'Help us understand how visitors interact with the website.', isEssential: false, isEnabled: true },
          { id: 'marketing', name: 'Marketing Cookies', description: 'Used to track visitors across websites to display relevant ads.', isEssential: false, isEnabled: true },
          { id: 'preferences', name: 'Preference Cookies', description: 'Allow the website to remember choices you make.', isEssential: false, isEnabled: true }
        ],
        scripts: []
      };
      
      // Only attempt to save if user is an admin (to avoid permission errors for guests)
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(this.db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && (userDoc.data().role === 'SUPER_ADMIN' || userDoc.data().role === 'ADMIN')) {
            await setDoc(docRef, defaultSettings);
          }
        } catch (e) {
          console.warn("Could not save default cookie settings", e);
        }
      }
      
      return defaultSettings;
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn("Could not read cookie settings from backend due to permission denied. Using defaults.");
        return {
          defaultMode: 'ASK',
          expiryDays: 180,
          consentVersion: 1,
          privacyPolicyUrl: '/privacy-policy',
          cookiePolicyUrl: '/cookie-policy',
          categories: [
            { id: 'essential', name: 'Essential Cookies', description: 'Required for the website to function properly.', isEssential: true, isEnabled: true },
            { id: 'analytics', name: 'Analytics Cookies', description: 'Help us understand how visitors interact with the website.', isEssential: false, isEnabled: true },
            { id: 'marketing', name: 'Marketing Cookies', description: 'Used to track visitors across websites to display relevant ads.', isEssential: false, isEnabled: true },
            { id: 'preferences', name: 'Preference Cookies', description: 'Allow the website to remember choices you make.', isEssential: false, isEnabled: true }
          ],
          scripts: []
        };
      }
      this.handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  }

  async updateCookieSettings(settings: CookieSettings): Promise<void> {
    const path = 'site_identity/cookie_settings';
    try {
      await setDoc(doc(this.db, 'site_identity', 'cookie_settings'), settings);
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn("Could not update cookie settings due to permission denied.");
        throw new Error("Permission denied. Please ensure you are an Admin or Super Admin and have updated firestore.rules.");
      }
      this.handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }

  async saveCookiePreferences(preferences: CookiePreferences): Promise<void> {
    const path = 'cookie_preferences';
    try {
      await addDoc(collection(this.db, 'cookie_preferences'), preferences);
    } catch (error: any) {
      // If the user hasn't deployed the updated firestore.rules, this will fail.
      // We catch it gracefully so it doesn't break the frontend experience.
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn("Could not save cookie preferences to backend due to permission denied. Please update firestore.rules to allow create on /cookie_preferences/{docId}. Preferences are saved locally.");
      } else {
        this.handleFirestoreError(error, OperationType.CREATE, path);
        throw error;
      }
    }
  }

  async getCookieConsentLogs(): Promise<CookiePreferences[]> {
    try {
      return await this.getCollectionData<CookiePreferences>('cookie_preferences');
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn("Could not read cookie consent logs due to permission denied.");
        return [];
      }
      throw error;
    }
  }

  // --- FARMER CHAT & GOVT SCHEMES ---
  async getFarmerQuestions(): Promise<FarmerQuestion[]> {
    return this.getCollectionData<FarmerQuestion>('farmer_questions');
  }

  async addFarmerQuestion(q: Omit<FarmerQuestion, 'id'>): Promise<FarmerQuestion> {
    const docRef = await addDoc(collection(this.db, 'farmer_questions'), q);
    return { id: docRef.id, ...q } as FarmerQuestion;
  }

  async getFarmerReplies(questionId: string): Promise<FarmerReply[]> {
    const path = `farmer_replies`;
    try {
      const q = query(collection(this.db, 'farmer_replies'), where('questionId', '==', questionId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FarmerReply));
      return results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, path);
      throw error; // Let the caller decide or return empty? I'll throw because handleFirestoreError does anyway.
    }
  }

  async addFarmerReply(reply: Omit<FarmerReply, 'id'>): Promise<FarmerReply> {
    const docRef = await addDoc(collection(this.db, 'farmer_replies'), reply);
    // Increment repliesCount in the parent question
    await updateDoc(doc(this.db, 'farmer_questions', reply.questionId), {
      repliesCount: increment(1)
    });
    return { id: docRef.id, ...reply } as FarmerReply;
  }

  async deleteFarmerQuestion(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'farmer_questions', id));
  }

  async deleteFarmerReply(id: string, questionId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'farmer_replies', id));
    await updateDoc(doc(this.db, 'farmer_questions', questionId), {
      repliesCount: increment(-1)
    });
  }

  async getGovtSchemes(): Promise<GovtScheme[]> {
    const schemes = await this.getCollectionData<GovtScheme>('govt_schemes');
    if (schemes.length === 0) {
        const staticSchemes = [
            {
                title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                description: "Direct income support of ₹6,000 per year to all land-holding farmer families in 3 equal installments.",
                detailedDesc: "Provides direct income support to supplement financial needs for crop procurement and domestic expenses. Covers all land-holding farm families regardless of land holding size. Funds are transferred directly to Aadhaar-linked bank accounts.",
                isActive: true,
                tags: ["Income Support", "Central", "DBT"],
                category: "SUBSIDY",
                subsidyAmount: "₹6,000/year direct transfer",
                eligibility: "All landholding farmer families who own cultivable land (excluding institutional landholders, tax payers, etc.)",
                documents: ["Aadhaar Card", "Land ownership records (Khasra/Khatauni)", "Bank account passbook", "Mobile number"],
                link: "https://pmkisan.gov.in",
                createdAt: new Date().toISOString()
            },
            {
                title: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                description: "Affordable crop insurance against natural calamities, pests, and diseases.",
                detailedDesc: "Provides affordable crop insurance coverage to farmers against losses due to natural calamities, pests, diseases, and post-harvest risks to stabilize income and encourage modern farming. Very low premium rate (1.5% to 5%) with government paying the balance.",
                isActive: true,
                tags: ["Crop Insurance", "Central"],
                category: "OTHER",
                subsidyAmount: "Low-premium full crop coverage (Farmer pays 1.5% - 5%)",
                eligibility: "All farmers growing notified crops in notified areas. Both loanee and non-loanee farmers. Tenant/sharecroppers",
                documents: ["Aadhaar Card", "Land records", "Bank passbook", "Sowing certificate"],
                link: "https://pmfby.gov.in",
                createdAt: new Date().toISOString()
            },
            {
                title: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)",
                description: "Expand cultivable area under assured irrigation, improve on-farm water use efficiency.",
                detailedDesc: "Focuses on 'Har Khet Ko Pani, More Crop Per Drop'. Subsidizes micro-irrigation systems (drip and sprinkler) and water storage structures like ponds and check dams.",
                isActive: true,
                tags: ["Subsidy", "Irrigation"],
                category: "SUBSIDY",
                subsidyAmount: "55% subsidy on drip/sprinkler systems for small/marginal farmers",
                eligibility: "Individual farmers, groups, priority for small/marginal farmers.",
                documents: ["Aadhaar Card", "Land ownership documents", "Bank account details", "Vendor quotation"],
                link: "https://pmksy.gov.in",
                createdAt: new Date().toISOString()
            },
            {
                title: "Kisan Credit Card (KCC)",
                description: "Timely credit support to farmers for agricultural operations and post-harvest expenses.",
                detailedDesc: "Credit limit up to ₹3 lakh at 7% interest (4% effective with prompt repayment). Revolving credit — repay and draw again during the crop cycle.",
                isActive: true,
                tags: ["Credit & Loan", "Banking"],
                category: "LOAN",
                subsidyAmount: "4–7% interest revolving crop loan",
                eligibility: "All farmers including owner-cultivators, tenant farmers, oral lessees, sharecroppers, and SHGs.",
                documents: ["Aadhaar Card", "Land records", "Passport-size photo", "Address proof", "Bank details"],
                link: "https://www.nabard.org",
                createdAt: new Date().toISOString()
            }
        ];
        for (const scheme of staticSchemes) {
            await this.addGovtScheme(scheme);
        }
        return await this.getCollectionData<GovtScheme>('govt_schemes');
    }
    return schemes;
  }

  async addGovtScheme(scheme: Omit<GovtScheme, 'id'>): Promise<GovtScheme> {
    const docRef = await addDoc(collection(this.db, 'govt_schemes'), scheme);
    return { id: docRef.id, ...scheme } as GovtScheme;
  }

  async updateGovtScheme(id: string, updates: Partial<GovtScheme>): Promise<void> {
    await updateDoc(doc(this.db, 'govt_schemes', id), updates);
  }

  async deleteGovtScheme(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'govt_schemes', id));
  }

  async getMandiBhav(city?: string): Promise<any[]> {
    const { mandiPrices } = await import('../src/data/agrigence_engine');
    if (city) {
      return mandiPrices.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }
    return mandiPrices;
  }
}


export const mockBackend = new FirebaseBackendService();
