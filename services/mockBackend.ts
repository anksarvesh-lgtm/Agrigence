
import { Article, EditorialMember, Magazine, NewsItem, User, Product, SubscriptionPlan, PaymentRecord, Coupon, SiteSettings, LeadershipMember, Feedback, Inquiry, Notification, StaticPage, EmailTemplate } from '../types';

// --- CONFIGURATION ---
// No firebase config needed for mock

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/3209/3209121.png',
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
    { id: '1', label: 'Home', path: '/', isExternal: false, order: 1, isEnabled: true },
    { id: '2', label: 'Archive', path: '/journals', isExternal: false, order: 2, isEnabled: true },
    { id: '3', label: 'News', path: '/news', isExternal: false, order: 3, isEnabled: true },
    { id: '4', label: 'Store', path: '/products', isExternal: false, order: 4, isEnabled: true },
    { id: '5', label: 'Board', path: '/editorial-board', isExternal: false, order: 5, isEnabled: true },
    { id: '6', label: 'Guidelines', path: '/guidelines', isExternal: false, order: 6, isEnabled: true },
  ],
  homepageLayout: [
    { id: 'news', label: 'News & Updates', order: 1, isEnabled: true, itemsToShow: 6 },
    { id: 'articles', label: 'Latest Journal', order: 2, isEnabled: true, itemsToShow: 4 },
    { id: 'blogs', label: 'Latest Blogs', order: 3, isEnabled: true, itemsToShow: 6 },
    { id: 'books', label: 'Books Store', order: 4, isEnabled: true, itemsToShow: 6 },
    { id: 'magazine', label: 'Latest Magazine', order: 5, isEnabled: true, itemsToShow: 1 },
    { id: 'reviews', label: 'Community Reviews', order: 6, isEnabled: true, itemsToShow: 6 },
    { id: 'mission', label: 'Our Mission', order: 7, isEnabled: true, itemsToShow: 1 },
  ],
  seo: {
    metaTitle: 'Agrigence - Premium Agriculture Journal',
    metaDescription: 'Building a trusted digital ecosystem for agricultural knowledge and research publishing.',
    ogImage: '',
    googleAnalyticsId: '',
    robotsTxt: 'User-agent: *\nAllow: /'
  }
};

// Mock Auth User Type
export interface MockFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Mock Auth Class
class MockAuth {
  currentUser: MockFirebaseUser | null = null;
  private listeners: ((user: MockFirebaseUser | null) => void)[] = [];

  constructor() {
    const stored = localStorage.getItem('agri_auth_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  updateUser(user: MockFirebaseUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('agri_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agri_auth_user');
    }
    this.notify();
  }

  onAuthStateChanged(cb: (user: MockFirebaseUser | null) => void) {
    this.listeners.push(cb);
    setTimeout(() => cb(this.currentUser), 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }
}

export const auth = new MockAuth();

export const onAuthStateChanged = (authObj: any, cb: (user: MockFirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(cb);
};

class MockBackendService {
  private localSettings: SiteSettings = DEFAULT_SETTINGS;

  constructor() {
    this.refreshSettings();
    this.initSeedData();
  }

  private getDB<T>(collection: string): T[] {
      const d = localStorage.getItem(`agri_${collection}`);
      return d ? JSON.parse(d) : [];
  }

  private setDB<T>(collection: string, data: T[]) {
      localStorage.setItem(`agri_${collection}`, JSON.stringify(data));
      if (this.listeners[collection]) {
          this.listeners[collection].forEach(cb => cb(data));
      }
  }

  private listeners: Record<string, ((data: any[]) => void)[]> = {};

  private subscribeToCollection<T>(collection: string, cb: (data: T[]) => void, orderBy?: string, dir: 'asc'|'desc' = 'desc'): () => void {
      if (!this.listeners[collection]) this.listeners[collection] = [];
      this.listeners[collection].push(cb);
      
      const data = this.getDB<T>(collection);
      if (orderBy) {
            data.sort((a: any, b: any) => {
              const va = a[orderBy];
              const vb = b[orderBy];
              if (va < vb) return dir === 'asc' ? -1 : 1;
              if (va > vb) return dir === 'asc' ? 1 : -1;
              return 0;
            });
      }

      setTimeout(() => cb(data), 0);
      return () => {
          this.listeners[collection] = this.listeners[collection].filter(c => c !== cb);
      }
  }

  async uploadFile(file: File, path: string): Promise<string> {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  }

  async login(email: string, pass: string): Promise<User | null> {
      const creds: any[] = JSON.parse(localStorage.getItem('agri_creds') || '[]');
      const userCred = creds.find(c => c.email === email && c.password === pass);
      
      if (userCred) {
          const firebaseUser = { 
              uid: userCred.uid, 
              email: userCred.email, 
              displayName: userCred.name, 
              photoURL: null 
          };
          auth.updateUser(firebaseUser);
          return this.syncUser(firebaseUser);
      }
      
      throw new Error('auth/invalid-credential');
  }

  async register(u: Partial<User> & { password?: string }): Promise<void> {
      const uid = 'user_' + Date.now();
      const creds: any[] = JSON.parse(localStorage.getItem('agri_creds') || '[]');
      
      if (creds.find(c => c.email === u.email)) {
          throw new Error('auth/email-already-in-use');
      }

      creds.push({ email: u.email, password: u.password, uid, name: u.name });
      localStorage.setItem('agri_creds', JSON.stringify(creds));

      const newUser: User = {
          id: uid,
          name: u.name || 'User',
          email: u.email!,
          role: 'USER',
          permissions: { canDownloadArticles: false, canDownloadBlogs: false },
          articleUsage: 0,
          blogUsage: 0,
          occupation: u.occupation,
          avatar: u.avatar,
          joinedDate: new Date().toISOString()
      };
      
      const users = this.getDB<User>('users');
      users.push(newUser);
      this.setDB('users', users);

      const firebaseUser = { uid, email: u.email!, displayName: u.name || null, photoURL: u.avatar || null };
      auth.updateUser(firebaseUser);
  }

  async logout() {
      auth.updateUser(null);
  }
  
  async syncUser(fbUser: MockFirebaseUser): Promise<User> {
      const users = this.getDB<User>('users');
      let user = users.find(u => u.id === fbUser.uid);
      
      if (user) {
           if (fbUser.email === 'agrigence@gmail.com' && user.role !== 'SUPER_ADMIN') {
               user.role = 'SUPER_ADMIN';
               this.setDB('users', users);
           }
           return user;
      } else {
           const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              email: fbUser.email || '',
              role: fbUser.email === 'agrigence@gmail.com' ? 'SUPER_ADMIN' : 'USER',
              permissions: { canDownloadArticles: false, canDownloadBlogs: false },
              articleUsage: 0,
              blogUsage: 0,
              joinedDate: new Date().toISOString(),
              avatar: fbUser.photoURL || undefined
          };
          users.push(newUser);
          this.setDB('users', users);
          return newUser;
      }
  }

  async getUsers() { return this.getDB<User>('users'); }
  subscribeToUsers(cb: (users: User[]) => void) { return this.subscribeToCollection<User>('users', cb, 'joinedDate'); }
  async updateUser(u: User) { 
      const users = this.getDB<User>('users');
      const idx = users.findIndex(user => user.id === u.id);
      if (idx !== -1) {
          users[idx] = u;
          this.setDB('users', users);
      }
  }
  async deleteUser(id: string) {
      const users = this.getDB<User>('users');
      this.setDB('users', users.filter(u => u.id !== id));
  }
  
  private generateId() { return Math.random().toString(36).substr(2, 9); }
  
  async addArticle(a: Partial<Article>) {
      const list = this.getDB<Article>('articles');
      const newArt = { 
          ...a, 
          id: this.generateId(),
          submissionDate: new Date().toISOString(), 
          views: 0,
          status: a.status || 'PENDING'
      } as Article;
      list.push(newArt);
      this.setDB('articles', list);
      if (a.authorId && a.type === 'ARTICLE') {
          this.sendNotification(a.authorId, 'SUBMISSION', { title: a.title || 'Untitled Article' });
      }
      return newArt;
  }
  
  async getArticles(queryStr?: string) {
      let list = this.getDB<Article>('articles');
      list.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      if (queryStr) {
          const qs = queryStr.toLowerCase();
          list = list.filter(a => a.title.toLowerCase().includes(qs) || a.authorName.toLowerCase().includes(qs));
      }
      return list;
  }
  subscribeToArticles(cb: (articles: Article[]) => void) { return this.subscribeToCollection('articles', cb, 'submissionDate'); }
  async getUserArticles(userId: string) {
      return this.getDB<Article>('articles').filter(a => a.authorId === userId);
  }
  async submitArticle(a: Partial<Article>) { return this.addArticle(a); }
  async updateArticle(a: Article) { 
      const list = this.getDB<Article>('articles');
      const idx = list.findIndex(i => i.id === a.id);
      if (idx !== -1) { list[idx] = a; this.setDB('articles', list); }
  }
  async updateArticleStatus(id: string, status: Article['status']) {
      const list = this.getDB<Article>('articles');
      const item = list.find(i => i.id === id);
      if (item) {
          item.status = status;
          this.setDB('articles', list);
          if (item.authorId) {
              this.sendNotification(item.authorId, 'ARTICLE_STATUS', { title: item.title, status });
          }
      }
  }
  async deleteArticle(id: string) {
      const list = this.getDB<Article>('articles');
      this.setDB('articles', list.filter(i => i.id !== id));
  }
  
  async getNews() { return this.getDB<NewsItem>('news').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }
  subscribeToNews(cb: (news: NewsItem[]) => void) { return this.subscribeToCollection('news', cb, 'date'); }
  async addNews(n: Partial<NewsItem>) {
      const list = this.getDB<NewsItem>('news');
      list.push({ ...n, id: this.generateId(), date: n.date || new Date().toISOString().split('T')[0] } as NewsItem);
      this.setDB('news', list);
  }
  async deleteNews(id: string) {
      this.setDB('news', this.getDB('news').filter((i:any) => i.id !== id));
  }

  async getJournals() { return this.getMagazines(); }
  async getMagazines() { return this.getDB<Magazine>('magazines'); }
  subscribeToMagazines(cb: (mags: Magazine[]) => void) { return this.subscribeToCollection('magazines', cb); }
  async addMagazine(m: Partial<Magazine>) {
      const list = this.getDB<Magazine>('magazines');
      if (m.id) {
           const idx = list.findIndex(i => i.id === m.id);
           if (idx !== -1) list[idx] = m as Magazine;
      } else {
           list.push({ ...m, id: this.generateId() } as Magazine);
      }
      this.setDB('magazines', list);
  }
  async getLatestMagazine() {
      const list = this.getDB<Magazine>('magazines');
      return list.length ? list[0] : null;
  }

  async getProducts() { return this.getDB<Product>('products'); }
  subscribeToProducts(cb: (p: Product[]) => void) { return this.subscribeToCollection('products', cb); }
  async addProduct(p: Partial<Product>) {
      const list = this.getDB<Product>('products');
      list.push({ ...p, id: this.generateId() } as Product);
      this.setDB('products', list);
  }
  async updateProduct(p: Product) {
      const list = this.getDB<Product>('products');
      const idx = list.findIndex(i => i.id === p.id);
      if (idx !== -1) { list[idx] = p; this.setDB('products', list); }
  }
  async deleteProduct(id: string) {
      this.setDB('products', this.getDB('products').filter((i:any) => i.id !== id));
  }

  async getMembers() { return this.getDB<EditorialMember>('editorial_board'); }
  subscribeToMembers(cb: (m: EditorialMember[]) => void) { return this.subscribeToCollection('editorial_board', cb, 'order', 'asc'); }
  async addMember(m: Partial<EditorialMember>) {
      const list = this.getDB<EditorialMember>('editorial_board');
      list.push({ ...m, id: this.generateId() } as EditorialMember);
      this.setDB('editorial_board', list);
  }
  async updateMember(m: EditorialMember) {
      const list = this.getDB<EditorialMember>('editorial_board');
      const idx = list.findIndex(i => i.id === m.id);
      if (idx !== -1) { list[idx] = m; this.setDB('editorial_board', list); }
  }
  async deleteMember(id: string) {
      this.setDB('editorial_board', this.getDB('editorial_board').filter((i:any) => i.id !== id));
  }

  async getPlans() { return this.getDB<SubscriptionPlan>('subscription_plans'); }
  async addPlan(p: Partial<SubscriptionPlan>) {
      const list = this.getDB<SubscriptionPlan>('subscription_plans');
      list.push({ ...p, id: this.generateId() } as SubscriptionPlan);
      this.setDB('subscription_plans', list);
  }
  async updatePlan(p: SubscriptionPlan) {
      const list = this.getDB<SubscriptionPlan>('subscription_plans');
      const idx = list.findIndex(i => i.id === p.id);
      if (idx !== -1) { list[idx] = p; this.setDB('subscription_plans', list); }
  }
  async deletePlan(id: string) {
      this.setDB('subscription_plans', this.getDB('subscription_plans').filter((i:any) => i.id !== id));
  }

  async getPayments() { return this.getDB<PaymentRecord>('payments'); }
  subscribeToPayments(cb: (p: PaymentRecord[]) => void) { return this.subscribeToCollection('payments', cb, 'date'); }
  async purchasePlan(userId: string, planId: string, paymentData: any) {
      const user = (await this.getUsers()).find(u => u.id === userId);
      const plan = (await this.getPlans()).find(p => p.id === planId);
      if (user && plan) {
          const list = this.getDB<PaymentRecord>('payments');
          list.push({
              id: this.generateId(),
              userId, userName: user.name, planId, planName: plan.name, amount: plan.price,
              method: 'QR', status: 'PENDING', date: new Date().toISOString(),
              upiTxnId: paymentData.txnId, screenshotUrl: paymentData.screenshot
          });
          this.setDB('payments', list);
      }
  }
  async verifyPayment(id: string) {
      const list = this.getDB<PaymentRecord>('payments');
      const payment = list.find(p => p.id === id);
      if (payment && payment.status === 'PENDING') {
          payment.status = 'COMPLETED';
          this.setDB('payments', list);
          
          const users = this.getDB<User>('users');
          const user = users.find(u => u.id === payment.userId);
          const plan = (await this.getPlans()).find(p => p.id === payment.planId);
          
          if (user && plan) {
              const now = new Date();
              const expiry = new Date(now.setMonth(now.getMonth() + plan.durationMonths));
              user.subscriptionTier = plan.name;
              user.subscriptionExpiry = expiry.toISOString();
              user.articleLimit = plan.articleLimit;
              user.blogLimit = plan.blogLimit;
              user.articleUsage = 0;
              user.blogUsage = 0;
              user.permissions = { canDownloadArticles: true, canDownloadBlogs: true };
              this.setDB('users', users);
              
              this.sendNotification(user.id, 'SUBSCRIPTION', { plan_name: plan.name, expiry: expiry.toLocaleDateString() });
          }
      }
  }

  getSettings() { 
      const s = this.getDB<SiteSettings>('site_identity');
      return s.length ? s[0] : DEFAULT_SETTINGS;
  }
  async refreshSettings() { this.localSettings = this.getSettings(); }
  async updateSettings(s: SiteSettings) {
      this.setDB('site_identity', [s]);
      this.localSettings = s;
  }

  async getLeadership() { return this.getDB<LeadershipMember>('leadership'); }
  async updateLeadership(l: LeadershipMember[]) { this.setDB('leadership', l); }

  async getCoupons() { return this.getDB<Coupon>('coupons'); }
  async addCoupon(c: Partial<Coupon>) {
      const list = this.getDB<Coupon>('coupons');
      list.push({ ...c, id: this.generateId() } as Coupon);
      this.setDB('coupons', list);
  }
  async deleteCoupon(id: string) {
      this.setDB('coupons', this.getDB('coupons').filter((i:any) => i.id !== id));
  }

  async getPositiveFeedback() { return this.getDB<Feedback>('feedback').filter(f => f.status === 'APPROVED'); }
  subscribeToFeedback(cb: (fb: Feedback[]) => void) { 
      return this.subscribeToCollection<Feedback>('feedback', (data) => {
           cb(data.filter(f => f.status === 'APPROVED'));
      });
  }
  async submitFeedback(f: Partial<Feedback>) {
      const list = this.getDB<Feedback>('feedback');
      list.push({ ...f, id: this.generateId(), status: 'APPROVED', date: new Date().toISOString() } as Feedback);
      this.setDB('feedback', list);
  }

  async sendMessage(data: any) {
      const list = this.getDB<Inquiry>('inquiries');
      list.push({ ...data, id: this.generateId(), status: 'PENDING', date: new Date().toISOString() });
      this.setDB('inquiries', list);
      return { success: true };
  }
  async getInquiries() { return this.getDB<Inquiry>('inquiries'); }
  subscribeToInquiries(cb: (i: Inquiry[]) => void) { return this.subscribeToCollection('inquiries', cb, 'date'); }
  async resolveInquiry(id: string) {
      const list = this.getDB<Inquiry>('inquiries');
      const item = list.find(i => i.id === id);
      if (item) { item.status = 'RESOLVED'; this.setDB('inquiries', list); }
  }

  async getTemplates() { return this.getDB<EmailTemplate>('templates'); }
  async updateTemplate(t: EmailTemplate) {
       const list = this.getDB<EmailTemplate>('templates');
       const idx = list.findIndex(i => i.id === t.id);
       if (idx !== -1) { list[idx] = t; this.setDB('templates', list); }
  }

  async getNotifications() { return this.getDB<Notification>('notifications'); }
  subscribeToNotifications(cb: (n: Notification[]) => void) { return this.subscribeToCollection('notifications', cb, 'date'); }
  async addNotification(n: Partial<Notification>) {
      const list = this.getDB<Notification>('notifications');
      list.push({ ...n, id: this.generateId(), date: new Date().toISOString() } as Notification);
      this.setDB('notifications', list);
  }

  async getPages() { return this.getDB<StaticPage>('static_pages'); }
  async updatePage(p: StaticPage) {
      const list = this.getDB<StaticPage>('static_pages');
      const idx = list.findIndex(i => i.slug === p.slug);
      if (idx !== -1) {
          list[idx] = { ...p, lastUpdated: new Date().toISOString() };
      } else {
          list.push({ ...p, lastUpdated: new Date().toISOString() });
      }
      this.setDB('static_pages', list);
  }

  getTrash() { return []; }
  async permanentDelete(id: string) {}

  async triggerEmail(to: string | string[], subject: string, html: string) {
      console.log(`[MockBackend] Email triggered to ${to}: ${subject}`);
  }
  
  async sendNotification(userId: string, templateType: string, data: any) {
      console.log(`[MockBackend] Notification for ${userId}: ${templateType}`, data);
  }
  
  private async getUserById(id: string): Promise<User | null> {
      return this.getDB<User>('users').find(u => u.id === id) || null;
  }

  private initSeedData() {
    if (!localStorage.getItem('agri_site_identity')) {
         localStorage.setItem('agri_site_identity', JSON.stringify([DEFAULT_SETTINGS]));
    }
    
    if (!localStorage.getItem('agri_subscription_plans')) {
         this.setDB('subscription_plans', this.ensurePlans());
    }
  }

  private ensurePlans() {
    return [
      { id: 'p1', name: '1 Article Submission', type: 'ARTICLE_ACCESS', price: 149, durationMonths: 1, description: 'Single manuscript submission.', features: ['1 Article Submission', 'Email Support'], isActive: true, articleLimit: 1, blogLimit: 0, validityLabel: '1 Month' },
      { id: 'p2', name: 'Institute (Unlimited)', type: 'ARTICLE_ACCESS', price: 4999, durationMonths: 12, description: 'Unlimited articles.', features: ['Unlimited Articles', 'Institute Verification'], isActive: true, articleLimit: 'UNLIMITED', blogLimit: 0, validityLabel: '1 Year' },
    ];
  }
}

export const mockBackend = new MockBackendService();
    