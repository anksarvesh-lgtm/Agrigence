
import { Article, EditorialMember, Magazine, NewsItem, Role, User, Product, SubscriptionPlan, PaymentRecord, Coupon, SiteSettings, LeadershipMember, Feedback, AdminLog, NavigationItem, HomepageSection, Category, EmailTemplate, Inquiry, Notification, StaticPage } from '../types';

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

class MockBackendService {
  private users: User[] = [];
  private articles: Article[] = [];
  private magazines: Magazine[] = [];
  private products: Product[] = [];
  private members: EditorialMember[] = [];
  private leadership: LeadershipMember[] = [];
  private news: NewsItem[] = [];
  private plans: SubscriptionPlan[] = [];
  private payments: PaymentRecord[] = [];
  private coupons: Coupon[] = [];
  private feedbacks: Feedback[] = [];
  private logs: AdminLog[] = [];
  private settings: SiteSettings = DEFAULT_SETTINGS;
  private categories: Category[] = [];
  private templates: EmailTemplate[] = [];
  private inquiries: Inquiry[] = [];
  private notifications: Notification[] = [];
  private staticPages: StaticPage[] = [];
  private trash: any[] = [];

  constructor() {
    this.loadFromStorage();
    this.ensureAdminExists();
    this.ensurePlansExist();
    this.ensureLeadershipExists();
    this.ensureEditorialBoardExists();
    this.ensureDefaultTemplates();
  }

  private ensureEditorialBoardExists() {
    if (this.members.length === 0) {
      this.members = [
        {
          id: 'board-1',
          name: 'Dr. Amitav K. Mallik',
          designation: 'Editor-in-Chief',
          qualification: 'Ph.D. in Agronomy',
          expertise: 'Sustainable Crop Systems, Soil Health',
          institution: 'ICAR-Indian Agricultural Research Institute',
          department: 'Division of Agronomy',
          country: 'India',
          email: 'amitav.mallik@agrigence.in',
          bio: 'Dr. Mallik has over 25 years of experience in agricultural research and has published over 100 peer-reviewed papers.',
          order: 1,
          isEnabled: true,
          imageUrl: 'https://ui-avatars.com/api/?name=Amitav+K+Mallik&background=3D2B1F&color=fff'
        },
        {
          id: 'board-2',
          name: 'Prof. Sarah Jennings',
          designation: 'Associate Editor',
          qualification: 'Ph.D. in Plant Pathology',
          expertise: 'Fungal Diseases, Molecular Breeding',
          institution: 'Zura Haradhan, Chandauli, Uttar Pradesh, 221115',
          department: 'Plant Sciences',
          country: 'India',
          email: 'sarah.j@agrigence.in',
          bio: 'Leading researcher in plant disease resistance mechanisms.',
          order: 2,
          isEnabled: true,
          imageUrl: 'https://ui-avatars.com/api/?name=Sarah+Jennings&background=C29263&color=fff'
        }
      ];
      this.save('agri_members', this.members);
    }
  }

  private ensureDefaultTemplates() {
    if (this.templates.length === 0) {
      this.templates = [
        { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to Agrigence!', body: 'Hello {name}, welcome to our platform.' },
        { id: 'submission', name: 'Article Submission', subject: 'Manuscript Received', body: 'Dear {name}, we have received your submission: {title}.' }
      ];
      this.save('agri_templates', this.templates);
    }
  }

  private ensureAdminExists() {
    const adminEmail = 'admin@cv.co';
    if (!this.users.find(u => u.email === adminEmail)) {
      this.users.push({
        id: 'admin-001',
        name: 'Agrigence Admin',
        email: adminEmail,
        role: 'ADMIN',
        articleUsage: 0,
        blogUsage: 0,
        permissions: { canDownloadArticles: true, canDownloadBlogs: true },
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3D2B1F&color=fff',
        status: 'ACTIVE'
      });
      this.save('agri_users', this.users);
    }
  }

  private ensurePlansExist() {
    this.plans = [
      { id: 'art-1', name: '1 Article Submission', type: 'ARTICLE_ACCESS', price: 149, durationMonths: 1, description: 'Single manuscript submission for publication.', features: ['1 Article Submission', 'Email Support'], isActive: true, articleLimit: 1, blogLimit: 0, validityLabel: '1 Month' },
      { id: 'art-10', name: '10 Articles (Annual)', type: 'ARTICLE_ACCESS', price: 499, durationMonths: 12, description: 'Best for active researchers publishing multiple studies.', features: ['10 Article Submissions', 'Valid for 12 months', 'Priority Review'], isActive: true, articleLimit: 10, blogLimit: 0, validityLabel: '12 Months' },
      { id: 'art-inf', name: 'Unlimited Articles (2 Years)', type: 'ARTICLE_ACCESS', price: 1499, durationMonths: 24, description: 'No-limit publishing for individual high-frequency authors.', features: ['Unlimited Article Submissions', '2 Year Validity', 'Dedicated Support'], isActive: true, articleLimit: 'UNLIMITED', blogLimit: 0, validityLabel: '2 Years' },
      { id: 'art-inst', name: 'Institute (Unlimited)', type: 'ARTICLE_ACCESS', price: 4999, durationMonths: 12, description: 'Unlimited articles for registered institutions and departments.', features: ['Unlimited Articles for all staff', 'Institute Verification', 'Annual Validity'], isActive: true, articleLimit: 'UNLIMITED', blogLimit: 0, validityLabel: '1 Year' },
      { id: 'blog-4', name: '4 Blogs (Starter)', type: 'BLOG_ACCESS', price: 119, durationMonths: 1, description: 'Short-term blog publishing for insights.', features: ['4 Blogs Publishing', '1 Month Validity'], isActive: true, articleLimit: 0, blogLimit: 4, validityLabel: '1 Month' },
      { id: 'blog-25', name: '25 Blogs (Regular)', type: 'BLOG_ACCESS', price: 399, durationMonths: 6, description: 'Publish regular updates for your audience.', features: ['25 Blogs Publishing', '6 Months Validity'], isActive: true, articleLimit: 0, blogLimit: 25, validityLabel: '6 Months' },
      { id: 'blog-inst', name: 'Institute Blogs (Unlimited)', type: 'BLOG_ACCESS', price: 2499, durationMonths: 24, description: 'Unlimited blog access for educational institutions.', features: ['Unlimited Blogs', '2 Years Validity', 'Institutional Profile'], isActive: true, articleLimit: 0, blogLimit: 'UNLIMITED', validityLabel: '2 Years' },
      { id: 'combo-max', name: 'Unlimited Articles + Blogs', type: 'COMBO_ACCESS', price: 5999, durationMonths: 18, description: 'The ultimate academic and insight bundle for professionals.', features: ['Unlimited Articles', 'Unlimited Blogs', '18 Months Validity', 'Verified Badge'], isActive: true, isRecommended: true, articleLimit: 'UNLIMITED', blogLimit: 'UNLIMITED', validityLabel: '18 Months' }
    ];
    this.save('agri_plans', this.plans);
  }

  private ensureLeadershipExists() {
    if (this.leadership.length === 0) {
      this.leadership = [
        { id: 'lead-1', name: 'Sarvesh Kumar Yadav', role: 'Founder', bio: 'Sarvesh is a pioneer in agricultural research with over 15 years of experience.', imageUrl: 'https://ui-avatars.com/api/?name=Sarvesh+Kumar+Yadav', order: 1, isEnabled: true },
        { id: 'lead-2', name: 'Shivi Jaiswal', role: 'Co-Founder', bio: 'Shivi leads our strategic initiatives.', imageUrl: 'https://ui-avatars.com/api/?name=Shivi+Jaiswal', order: 2, isEnabled: true }
      ];
      this.save('agri_leadership', this.leadership);
    }
  }

  private loadFromStorage() {
    const getData = (key: string) => JSON.parse(localStorage.getItem(key) || 'null');
    this.users = getData('agri_users') || [];
    this.settings = getData('agri_settings') || DEFAULT_SETTINGS;
    this.leadership = getData('agri_leadership') || [];
    this.articles = getData('agri_articles') || [];
    this.magazines = getData('agri_magazines') || [];
    this.news = getData('agri_news') || [];
    this.products = getData('agri_products') || [];
    this.plans = getData('agri_plans') || [];
    this.payments = getData('agri_payments') || [];
    this.members = getData('agri_members') || [];
    this.feedbacks = getData('agri_feedbacks') || [];
    this.coupons = getData('agri_coupons') || [];
    this.logs = getData('agri_logs') || [];
    this.categories = getData('agri_categories') || [];
    this.templates = getData('agri_templates') || [];
    this.inquiries = getData('agri_inquiries') || [];
    this.notifications = getData('agri_notifications') || [];
    this.staticPages = getData('agri_pages') || [];
    this.trash = getData('agri_trash') || [];
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private logAction(action: string, module: string) {
    const admin = JSON.parse(localStorage.getItem('agri_session') || '{}');
    const log: AdminLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: admin.id || 'system',
      adminName: admin.name || 'System',
      action,
      module,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(log);
    this.save('agri_logs', this.logs);
  }

  async login(email: string, pass: string) {
    // Official Admin Check
    if (email === 'admin@cv.co' && pass === 'Shivesh@9319') {
      const admin = this.users.find(u => u.email === email);
      if (admin) {
        admin.lastLogin = new Date().toISOString();
        this.save('agri_users', this.users);
      }
      return admin || null;
    }
    const user = this.users.find(u => u.email === email);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.save('agri_users', this.users);
    }
    return user || null;
  }

  async register(u: Partial<User>) {
    const newUser: User = { 
      ...u, 
      id: Math.random().toString(36).substr(2, 9), 
      joinedDate: new Date().toISOString(), 
      articleUsage: 0, 
      blogUsage: 0, 
      status: 'ACTIVE', 
      permissions: { canDownloadArticles: false, canDownloadBlogs: false } 
    } as User;
    this.users.push(newUser);
    this.save('agri_users', this.users);
    return newUser;
  }

  async deleteUser(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      this.trash.push({ ...user, trashType: 'USER', deletedAt: new Date().toISOString() });
      this.users = this.users.filter(u => u.id !== id);
      this.save('agri_users', this.users);
      this.save('agri_trash', this.trash);
      this.logAction('Moved User to Trash', 'Users');
    }
  }

  getTrash() { return this.trash; }
  async permanentDelete(id: string) {
    this.trash = this.trash.filter(t => t.id !== id);
    this.save('agri_trash', this.trash);
  }

  getSettings() { return this.settings; }
  async updateSettings(s: SiteSettings) { this.settings = s; this.save('agri_settings', this.settings); this.logAction('Updated Settings', 'System'); }

  getLeadership() { return this.leadership; }
  async updateLeadership(l: LeadershipMember[]) { this.leadership = l; this.save('agri_leadership', this.leadership); this.logAction('Updated Leadership', 'Team'); }

  getUsers() { return this.users; }
  async updateUser(u: User) {
    const idx = this.users.findIndex(x => x.id === u.id);
    if (idx !== -1) { this.users[idx] = u; this.save('agri_users', this.users); this.logAction(`Updated User ${u.name}`, 'Users'); }
  }

  getArticles(query?: string) {
    if (!query) return this.articles;
    const q = query.toLowerCase();
    return this.articles.filter(a => a.title.toLowerCase().includes(q) || a.authorName.toLowerCase().includes(q) || (a.tags && a.tags.some(t => t.toLowerCase().includes(q))));
  }

  getUserArticles(userId: string) {
    return this.articles.filter(a => a.authorId === userId);
  }

  async addArticle(a: Partial<Article>) { 
    const item = { ...a, id: Math.random().toString(), submissionDate: new Date().toISOString(), views: 0 } as Article;
    this.articles.unshift(item); this.save('agri_articles', this.articles); this.logAction(`Added Article ${item.title}`, 'Articles'); return item;
  }

  async submitArticle(a: Partial<Article>) {
    const user = this.users.find(u => u.id === a.authorId);
    if (user) {
      if (a.type === 'ARTICLE') user.articleUsage += 1;
      else user.blogUsage += 1;
      this.save('agri_users', this.users);
    }
    return this.addArticle(a);
  }

  async updateArticle(a: Article) {
    const idx = this.articles.findIndex(x => x.id === a.id);
    if (idx !== -1) { this.articles[idx] = a; this.save('agri_articles', this.articles); this.logAction(`Updated Article ${a.title}`, 'Articles'); }
  }

  async updateArticleStatus(id: string, status: Article['status']) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.status = status;
      this.save('agri_articles', this.articles);
      this.logAction(`Updated Article Status to ${status}`, 'Articles');
    }
  }

  async deleteArticle(id: string) { 
    const item = this.articles.find(a => a.id === id);
    if (item) {
      this.trash.push({ ...item, trashType: 'ARTICLE', deletedAt: new Date().toISOString() });
      this.articles = this.articles.filter(x => x.id !== id);
      this.save('agri_articles', this.articles);
      this.save('agri_trash', this.trash);
      this.logAction('Moved Article to Trash', 'Articles');
    }
  }

  getNews() { return this.news; }
  async addNews(n: Partial<NewsItem>) {
    const item = { ...n, id: Math.random().toString(), date: new Date().toISOString().split('T')[0] } as NewsItem;
    this.news.unshift(item); this.save('agri_news', this.news); this.logAction(`Added News ${item.title}`, 'News');
  }

  async deleteNews(id: string) {
    this.news = this.news.filter(x => x.id !== id);
    this.save('agri_news', this.news);
    this.logAction('Deleted News', 'News');
  }

  getMagazines() { return this.magazines; }
  getJournals() { return this.magazines; }
  getLatestMagazine() { return this.magazines[0] || null; }

  async addMagazine(m: Partial<Magazine>) {
    const item = { ...m, id: Math.random().toString(), publishDate: new Date().toISOString() } as Magazine;
    this.magazines.unshift(item); this.save('agri_magazines', this.magazines); this.logAction(`Added Magazine ${item.title}`, 'Magazines');
  }

  getProducts() { return this.products; }
  async addProduct(p: Partial<Product>) {
    const item = { ...p, id: Math.random().toString() } as Product;
    this.products.unshift(item); this.save('agri_products', this.products); this.logAction(`Added Product ${item.name}`, 'Store');
  }

  async updateProduct(p: Product) {
    const idx = this.products.findIndex(x => x.id === p.id);
    if (idx !== -1) { this.products[idx] = p; this.save('agri_products', this.products); this.logAction(`Updated Product ${p.name}`, 'Store'); }
  }

  async deleteProduct(id: string) {
    this.products = this.products.filter(x => x.id !== id);
    this.save('agri_products', this.products);
    this.logAction('Deleted Product', 'Store');
  }

  getMembers() { return this.members; }
  async addMember(m: Partial<EditorialMember>) {
    const item = { ...m, id: Math.random().toString(), order: this.members.length + 1, isEnabled: true } as EditorialMember;
    this.members.push(item);
    this.save('agri_members', this.members);
    this.logAction(`Added Member ${item.name}`, 'Board');
    return item;
  }
  async updateMember(m: EditorialMember) {
    const idx = this.members.findIndex(x => x.id === m.id);
    if (idx !== -1) { this.members[idx] = m; this.save('agri_members', this.members); this.logAction(`Updated Member ${m.name}`, 'Board'); }
  }
  async deleteMember(id: string) {
    this.members = this.members.filter(m => m.id !== id);
    this.save('agri_members', this.members);
    this.logAction('Deleted Member', 'Board');
  }

  getPlans() { return this.plans; }
  async updatePlan(p: SubscriptionPlan) {
    const idx = this.plans.findIndex(x => x.id === p.id);
    if (idx !== -1) { this.plans[idx] = p; this.save('agri_plans', this.plans); this.logAction(`Updated Plan ${p.name}`, 'Subscriptions'); }
  }

  // UPDATED: Now requires manual data containing txnId and screenshot. Creates a PENDING record.
  async purchasePlan(userId: string, planId: string, paymentData: { txnId: string, screenshot?: string }) {
    const user = this.users.find(u => u.id === userId);
    const plan = this.plans.find(p => p.id === planId);
    if (!user || !plan) return null;

    const payment: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName: user.name,
      planId,
      planName: plan.name,
      amount: plan.price,
      method: 'QR',
      status: 'PENDING',
      date: new Date().toISOString(),
      upiTxnId: paymentData.txnId,
      screenshotUrl: paymentData.screenshot
    };
    
    this.payments.unshift(payment);
    this.save('agri_payments', this.payments);
    this.logAction(`New QR Payment Request: ${paymentData.txnId}`, 'Subscriptions');
    return payment;
  }

  getPayments() { return this.payments; }
  
  // UPDATED: Activating plan only on admin verification
  async verifyPayment(id: string) {
    const p = this.payments.find(x => x.id === id);
    if (!p) return;
    
    // Find user and plan associated with this payment
    const userIndex = this.users.findIndex(u => u.id === p.userId);
    const plan = this.plans.find(pl => pl.id === p.planId);
    
    if (userIndex !== -1 && plan && p.status === 'PENDING') {
       // Activate Plan
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + plan.durationMonths);
        
        const updatedUser = {
          ...this.users[userIndex],
          subscriptionTier: plan.name,
          subscriptionExpiry: expiry.toISOString(),
          articleLimit: plan.articleLimit,
          blogLimit: plan.blogLimit,
          permissions: { canDownloadArticles: true, canDownloadBlogs: true }
        };
        this.users[userIndex] = updatedUser;
        this.save('agri_users', this.users);
        
        // Update Payment
        p.status = 'COMPLETED';
        this.save('agri_payments', this.payments);
        this.logAction(`Verified Payment ${id}`, 'Payments');
    }
  }

  getCoupons() { return this.coupons; }
  async addCoupon(c: Partial<Coupon>) {
    const item = { ...c, id: Math.random().toString(), usageCount: 0 } as Coupon;
    this.coupons.push(item); this.save('agri_coupons', this.coupons); this.logAction(`Created Coupon ${item.code}`, 'Coupons');
  }
  async deleteCoupon(id: string) { this.coupons = this.coupons.filter(c => c.id !== id); this.save('agri_coupons', this.coupons); }

  getPositiveFeedback() { return this.feedbacks.filter(f => f.rating >= 4 && f.status === 'APPROVED'); }
  async submitFeedback(f: Partial<Feedback>) {
    const item = { ...f, id: Math.random().toString(), date: new Date().toISOString(), status: 'APPROVED' } as Feedback;
    this.feedbacks.unshift(item);
    this.save('agri_feedbacks', this.feedbacks);
    return item;
  }

  async sendMessage(data: any) {
    const inquiry: Inquiry = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name, email: data.email, message: data.message, status: 'PENDING', date: new Date().toISOString()
    };
    this.inquiries.unshift(inquiry);
    this.save('agri_inquiries', this.inquiries);
    this.logAction('Sent Contact Message', 'System');
    return { success: true };
  }

  getInquiries() { return this.inquiries; }
  async resolveInquiry(id: string) {
    const idx = this.inquiries.findIndex(i => i.id === id);
    if (idx !== -1) { this.inquiries[idx].status = 'RESOLVED'; this.save('agri_inquiries', this.inquiries); }
  }

  getCategories() { return this.categories; }
  async addCategory(c: Partial<Category>) {
    const item = { ...c, id: Math.random().toString() } as Category;
    this.categories.push(item); this.save('agri_categories', this.categories);
  }

  getTemplates() { return this.templates; }
  async updateTemplate(t: EmailTemplate) {
    const idx = this.templates.findIndex(x => x.id === t.id);
    if (idx !== -1) { this.templates[idx] = t; this.save('agri_templates', this.templates); }
  }

  getNotifications() { return this.notifications; }
  async addNotification(n: Partial<Notification>) {
    const item = { ...n, id: Math.random().toString(), date: new Date().toISOString() } as Notification;
    this.notifications.unshift(item); this.save('agri_notifications', this.notifications);
  }

  getPages() { return this.staticPages; }
  async updatePage(p: StaticPage) {
    const idx = this.staticPages.findIndex(x => x.id === p.id);
    if (idx !== -1) { this.staticPages[idx] = { ...p, lastUpdated: new Date().toISOString() }; }
    else { this.staticPages.push({ ...p, id: Math.random().toString(), lastUpdated: new Date().toISOString() }); }
    this.save('agri_pages', this.staticPages);
  }

  getLogs() { return this.logs; }
  incrementVisitor() { 
    const v = parseInt(localStorage.getItem('visitor_count') || '2450') + 1;
    localStorage.setItem('visitor_count', v.toString());
    return v;
  }
}

export const mockBackend = new MockBackendService();
