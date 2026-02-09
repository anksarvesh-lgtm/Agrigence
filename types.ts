
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER';

export interface UserPermissions {
  canDownloadArticles: boolean;
  canDownloadBlogs: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  occupation?: string;
  subscriptionTier?: string;
  subscriptionExpiry?: string;
  articleLimit?: number | 'UNLIMITED';
  articleUsage: number;
  blogLimit?: number | 'UNLIMITED';
  blogUsage: number;
  permissions: UserPermissions;
  avatar?: string;
  status?: 'ACTIVE' | 'BLOCKED';
  lastLogin?: string;
  joinedDate?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  isExternal: boolean;
  order: number;
  isEnabled: boolean;
}

export interface HomepageSection {
  id: string;
  label: string;
  order: number;
  isEnabled: boolean;
  itemsToShow: number;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
  robotsTxt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'ARTICLE' | 'BLOG' | 'STORE' | 'NEWS';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'DASHBOARD' | 'EMAIL' | 'BOTH';
  targetRole?: Role | 'ALL';
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
}

export interface PopupSettings {
  isEnabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface SiteSettings {
  logoUrl: string;
  issn?: string;
  footerSocials: {
    twitter: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
  };
  upiId: string;
  upiQrUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  homeFeaturedLimit: number;
  missionText: string;
  primaryColor: string;
  secondaryColor: string;
  popup: PopupSettings;
  navigation: NavigationItem[];
  homepageLayout: HomepageSection[];
  seo: SEOSettings;
}

export type DownloadAccessLevel = 'FREE' | 'SUBSCRIBERS_ONLY';

export interface Article {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  authorName: string;
  categoryId?: string;
  tags: string[];
  content: string;
  excerpt?: string;
  featuredImage?: string;
  submissionDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PENDING' | 'REJECTED' | 'APPROVED';
  views?: number;
  fileUrl?: string;
  downloadAccess: DownloadAccessLevel;
  type: 'ARTICLE' | 'BLOG';
  isFeatured?: boolean;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Magazine {
  id: string;
  title: string;
  issueNumber: string;
  volume: string;
  month: string;
  year: number;
  coverImage: string;
  pdfUrl: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishDate: string;
  downloadAccess: DownloadAccessLevel;
  seoTitle?: string;
  metaDescription?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
  thumbnail?: string;
  relevantLink?: string;
  isBreaking?: boolean;
  publishDate?: string;
}

export interface EditorialMember {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  expertise: string;
  email?: string;
  imageUrl: string;
  institution: string;
  department?: string;
  country?: string;
  experience?: string;
  bio?: string;
  googleScholar?: string;
  orcid?: string;
  researchGate?: string;
  linkedin?: string;
  order: number;
  isEnabled: boolean;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
  isEnabled: boolean;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  price: string;
  offerPrice?: string;
  imageUrl: string;
  images?: string[];
  buyLink: string;
  description: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  featured?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  referenceLink?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'ARTICLE_ACCESS' | 'BLOG_ACCESS' | 'COMBO_ACCESS';
  price: number;
  durationMonths: number;
  description: string;
  features: string[];
  isActive: boolean;
  isRecommended?: boolean;
  articleLimit?: number | 'UNLIMITED';
  blogLimit?: number | 'UNLIMITED';
  validityLabel: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  method: 'STRIPE' | 'UPI';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  upiTxnId?: string;
  screenshotUrl?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  value: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userOccupation?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN';
}
