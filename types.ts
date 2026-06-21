

export interface AiToolSettings {
  id: string;
  toolName: string;
  isEnabled: boolean;
}

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER' | 'EDITORIAL_MEMBER';

export type EditorialRole = 'Reviewer' | 'Section Editor' | 'Editorial Board Member' | 'Advisory Member';

export interface UserPermissions {
  canDownloadArticles: boolean;
  canDownloadBlogs: boolean;
}

export interface ExamCategory {
  id: string;
  examId: string;
  examName: string;
  shortName: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface UserSubscription {
  active: boolean;
  planId: string;
  unlockType: 'specific_exams' | 'all_exams';
  allowedExams: string[];
  startDate: string;
  endDate: string;
  paymentId?: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  dob?: string;
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
  adminArticleLimitAdjustment?: number;
  adminBlogLimitAdjustment?: number;
  adminEnabledTools?: string[];
  adminExpiryOverride?: string;
  userType?: 'INDIVIDUAL' | 'INSTITUTE' | 'ORGANISATION' | 'FARMER';
  limitAdjustmentNotes?: string;
  permissions: UserPermissions;
  avatar?: string;
  farmId?: string;
  profilePhotoUrl?: string;
  bio?: string;
  isVerified?: boolean;
  status?: 'ACTIVE' | 'BLOCKED';
  language?: 'en' | 'hi' | 'mr' | 'gu' | 'te'; // Supported languages
  lastLogin?: string;
  joinedDate?: string;
  onboardingCompleted?: boolean;
  qualification?: string;
  state?: string;
  preferredLanguage?: string;
  targetExams?: string[];
  preparationLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  subscription?: UserSubscription;
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

export interface Tool {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  route?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  sectionId: string;
}

export interface ToolSection {
  id: string;
  name: string;
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



export type KeywordCategory = 'HIGH_VOLUME' | 'CROP_SPECIFIC' | 'PROBLEM_BASED' | 'LOCATION_BASED' | 'GOVERNMENT_SCHEME' | 'LONG_TAIL';
export type KeywordPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AIQuestionAnswer {
  question: string;
  answer: string;
}

export interface Keyword {
  id: string;
  term: string;
  category: KeywordCategory;
  subCategory?: string;
  priority: KeywordPriority;
  searchVolume: number;
  difficulty: number;
  aiOptimized: boolean;
  aiQA?: AIQuestionAnswer;
  synonyms: string[];
  relatedQueries: string[];
  mappedArticles: string[];
  autoInsert: boolean;
  densityTarget?: number; // e.g., 1.5 for 1.5%
}

export interface KeywordCluster {
  id: string;
  mainTopic: string;
  subtopics: string[]; // Keyword IDs or terms
  targetUrl?: string;
}

export interface KeywordPerformance {
  keywordId: string;
  term: string;
  ranking: number;
  searchVolume: number;
  ctr: number;
  traffic: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface TrendingKeyword {
  id: string;
  term: string;
  searchVolume: number;
  growthPercentage: number;
  category: string;
}

export interface CookieCategory {
  id: string; // 'essential', 'analytics', 'marketing', 'preferences'
  name: string;
  description: string;
  isEssential: boolean;
  isEnabled: boolean;
}

export interface CookieScript {
  id: string;
  categoryId: string;
  name: string;
  scriptContent: string;
  isSrc: boolean;
}

export interface CookieSettings {
  defaultMode: 'ACCEPT_ALL' | 'REJECT_ALL' | 'ASK';
  expiryDays: number;
  consentVersion: number;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  categories: CookieCategory[];
  scripts: CookieScript[];
}

export interface CookiePreferences {
  id?: string;
  userId?: string | null;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consentVersion: number;
  timestamp: string;
  ipAddress?: string;
}

export interface SiteSettings {
  logoUrl: string;
  apkUrl?: string;
  playStoreUrl?: string;
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
  featureVisibility: {
    mandi: boolean;
    schemes: boolean;
    crops: boolean;
    journals: boolean;
    blogs: boolean;
    news: boolean;
    store: boolean;
  };
  seo: SEOSettings;
  paymentGateway?: any;
}

export type DownloadAccessLevel = 'FREE' | 'SUBSCRIBERS_ONLY';

export interface Reference {
  id: string;
  rawText: string;
  formattedText: string;
  isValid: boolean;
  type: 'JOURNAL' | 'BOOK' | 'WEB' | 'UNKNOWN';
}

export type Recommendation = 'A' | 'MR' | 'MJ' | 'R';

export interface Review {
  id: string;
  manuscriptId: string;
  reviewerId: string;
  commentsToAuthor: string;
  commentsToEditor: string;
  recommendation: Recommendation | null;
  status: 'draft' | 'submitted';
  lastSavedAt: string;
  submittedAt?: string;
}

export interface ActivityLog {
  id: string;
  actionType: 'draft_saved' | 'review_submitted' | 'login' | 'logout';
  actorId: string;
  manuscriptId?: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

export interface ReviewAssignment {
  id: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
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
  | 'DraftSaved'
  | 'Submitted'
  | 'EditorQueue'
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
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PENDING' | 'REJECTED' | 'APPROVED' | 'Pending' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
  review_status?: ReviewStatus; // New Granular Status
  views?: number;
  fileUrl?: string;
  driveUrl?: string;
  downloadAccess: DownloadAccessLevel;
  type: 'ARTICLE' | 'BLOG';
  isFeatured?: boolean;
  category?: string;
  abstract?: string;
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
  coverUrl?: string;
  issue?: string;
  pdfUrl: string;
  driveUrl?: string;
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
  profession: string;
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
  email?: string; // Added email field
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
  isDigital?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  referenceLink?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'ARTICLE_ACCESS' | 'BLOG_ACCESS' | 'COMBO_ACCESS' | 'TOOL_ACCESS' | 'KISAN_ACCESS' | 'SPECIFIC_EXAMS' | 'ALL_EXAMS';
  unlockType?: 'specific_exams' | 'all_exams';
  allowedExams?: string[];
  price: number;
  durationMonths: number;
  description: string;
  features: string[];
  isActive: boolean;
  isRecommended?: boolean;
  is_research_enabled?: boolean;
  articleLimit?: number | 'UNLIMITED';
  blogLimit?: number | 'UNLIMITED';
  validityLabel: string;
  allowedTools?: string[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  method: 'QR' | 'INTERNATIONAL' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  upiTxnId?: string;
  txnId?: string;
  screenshotUrl?: string;
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
  userRole?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN';
}

export interface UserFieldData {
  id: string;
  user_id: string;
  dataset_name: string;
  variables: string[];
  data: Record<string, any>[];
  created_at: string;
  is_temporary?: boolean;
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

export interface ToolHistory {
  id: string;
  userId: string;
  toolName: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  inputData: any;
  outputData: any;
}

export interface WebsiteVisitor {
  id: string;
  visitor_id: string;
  ip_address: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  device_type: string;
  os: string;
  browser: string;
  screen_resolution: string;
  isp: string;
  referrer: string;
  landing_page: string;
  pages_visited: number;
  session_id: string;
  visit_duration: number;
  first_visit: string;
  last_visit: string;
  created_at: string;
  is_bot: boolean;
  traffic_source: string;
  page_views: { path: string; timestamp: string }[];
}

export interface FarmerQuestion {
  id: string;
  question: string;
  audioUrl?: string; // For voice notes
  createdAt: string;
  repliesCount: number;
}

export interface FarmerReply {
  id: string;
  questionId: string;
  reply: string;
  audioUrl?: string; // Voice notes for replies
  authorId: string; // Used to identify 'expert' badge or admin status
  authorName: string;
  isExpert: boolean;
  createdAt: string;
}

export interface GovtScheme {
  id: string;
  title: string;
  description: string; // Brief description
  detailedDesc?: string; // Additional details
  category: 'SUBSIDY' | 'LOAN' | 'DEADLINE' | 'OTHER' | string;
  subsidyAmount?: string; // e.g., '₹6,000/year'
  eligibility?: string;
  documents?: string[];
  tags?: string[];
  deadline?: string;
  state?: string; // Optional state-specific
  link?: string;
  createdAt: string;
  isActive: boolean;
}



