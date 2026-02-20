

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER' | 'EDITORIAL_MEMBER';

export type EditorialRole = 'Reviewer' | 'Section Editor' | 'Editorial Board Member' | 'Advisory Member';

export interface UserPermissions {
  canDownloadArticles: boolean;
  canDownloadBlogs: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  editorialRole?: EditorialRole; // Sub-role for Editorial Members
  phone?: string; // Legacy field
  mobileNumber?: string; // E.164 Format
  country?: string; // ISO Code
  currency?: string; // Derived Currency Code
  occupation?: string;
  subscriptionTier?: string;
  subscriptionExpiry?: string;
  articleLimit?: number | 'UNLIMITED';
  articleUsage: number;
  blogLimit?: number | 'UNLIMITED';
  blogUsage: number;
  permissions: UserPermissions;
  avatar?: string;
  profilePhotoUrl?: string;
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

export interface SchemaTemplates {
  organization: boolean;
  website: boolean;
  scholarlyArticle: boolean;
  blogPosting: boolean;
  breadcrumb: boolean;
  person: boolean;
}

export interface SEOSettings {
  // Global
  metaTitle: string;
  metaDescription: string;
  publisherName?: string;
  canonicalBaseUrl?: string;
  language?: string;
  region?: string;
  forceHttps?: boolean;
  defaultRobots?: string;
  robotsTxt: string;

  // Blog SEO
  blogTitleTemplate?: string;
  autoMetaDesc?: boolean;
  enableBlogSchema?: boolean;
  autoInternalLinking?: boolean;
  showReadingTime?: boolean;
  enforceAltText?: boolean;
  cleanSlugs?: boolean;
  blogFallbackImage?: string;
  showDatesSchema?: boolean;

  // Social
  ogTitleTemplate?: string;
  ogDescriptionTemplate?: string;
  ogImage: string;
  twitterCardType?: 'summary' | 'summary_large_image';

  // Structured Data
  schemaTemplates?: SchemaTemplates;
  customJsonLd?: string;

  // Sitemap
  sitemapEnabled?: boolean;
  includeArticles?: boolean;
  includeBlogs?: boolean;
  includePages?: boolean;

  // URL Rules
  forceLowercase?: boolean;
  removeParams?: boolean;
  canonicalEnforcement?: boolean;

  // Indexation
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  noindexPaths?: string;

  // Content Automation
  autoTitleFromHeading?: boolean;
  autoKeywordSuggestion?: boolean;

  // Technical
  lazyLoadMedia?: boolean;
  dnsPrefetch?: boolean;
  preconnectAssets?: boolean;

  // Verification
  googleConsoleId?: string;
  bingWebmasterId?: string;
  googleAnalyticsId: string;
  tagManagerId?: string;
  
  // Diagnostics
  enableAlerts?: boolean;
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

export interface GatewayConfig {
  provider_name: 'razorpay';
  key_id: string;
  key_secret: string; // Only set on update, not returned fully on read for security
  is_live: boolean;
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
  paymentGateway?: GatewayConfig;
}

export type DownloadAccessLevel = 'FREE' | 'SUBSCRIBERS_ONLY';

export interface Reference {
  id: string;
  rawText: string;
  formattedText: string;
  isValid: boolean;
  type: 'JOURNAL' | 'BOOK' | 'WEB' | 'UNKNOWN';
}

export interface ReviewAssignment {
  id: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'REVIEWED';
  assignedAt: string;
  assignedBy: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ReviewMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  timestamp: string;
  type: 'SUGGESTION' | 'CLARIFICATION' | 'REVISION_REQUEST' | 'REPLY';
}

// Granular Workflow Status
export type ReviewStatus = 
  | 'submitted' 
  | 'under_admin_check' 
  | 'assigned_for_review' 
  | 'under_review' 
  | 'review_completed' 
  | 'admin_verified' 
  | 'final_decision' 
  | 'published' 
  | 'rejected' 
  | 'revision_requested';

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
  review_status?: ReviewStatus; // New Granular Status
  views?: number;
  fileUrl?: string;
  downloadAccess: DownloadAccessLevel;
  type: 'ARTICLE' | 'BLOG';
  isFeatured?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  
  // Enterprise Fields
  internalId?: string; // UUID based internal identifier replacing DOI
  plagiarismReport?: PlagiarismReport;
  citationKey?: string;
  canonicalUrl?: string;
  
  // Publishing Hierarchy
  issueId?: string;
  volume?: string;
  issueNumber?: string;
  
  // AI Enhancements
  formattedContent?: string; // AI normalized version
  references?: Reference[];
  keywords?: string[];

  // Review Workflow
  reviewAssignments?: ReviewAssignment[];
  reviewThreads?: ReviewMessage[];
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
  method: 'QR' | 'RAZORPAY' | 'INTERNATIONAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  upiTxnId?: string;
  screenshotUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  sessionId?: string;
  displayCurrency?: string;
  displayAmount?: number;
  gatewayFee?: number;
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

// Enterprise Publishing Types
export interface ForensicSegment {
  text: string;
  reason: string;
}

export interface PlagiarismReport {
  originality_score: number; // 100 - plagiarism_score
  plagiarism_score: number;
  ai_generated_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  flagged_sections: ForensicSegment[]; // Updated for forensic detail
  confidence: number;
  generatedAt: string;
  summary: string;
  audit_status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface OAIRecord {
  identifier: string;
  datestamp: string;
  setSpec: string[];
  metadata: {
    title: string;
    creator: string;
    subject: string[];
    description: string;
    date: string;
    type: string;
    identifier: string; // Permanent URL
  }
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
