import { GoogleGenAI } from "@google/genai";
import { db } from '../firebase.ts'; 
import { collection, doc, setDoc, getDocs, addDoc } from 'firebase/firestore';


// --- Types ---
export interface MandiDataInput {
  city: string;
  state: string;
  crop: string;
  min_price: number;
  max_price: number;
  arrival: string;
  date: string;
}

export interface SchemeDataInput {
  name: string;
  eligibility: string;
  benefits: string;
  application_process: string;
  official_link: string;
}

export interface CropDataInput {
  name: string;
  season: string;
  soil_type: string;
  fertilizer: string;
  yield: string;
}

// --- Prompt Generators ---
export function generateMandiPrompt(data: MandiDataInput): string {
  return `You are an expert agriculture content writer and SEO strategist focused on India.
Write a HIGH-RANKING, AI-OPTIMIZED, SEO-STRUCTURED HTML webpage for Agrigence.

INPUT VARIABLES:
Primary Keyword: ${data.city} Mandi Bhav Today
Secondary Keywords: ${data.crop} prices ${data.city}, today mandi rate ${data.state}, agriculture market arrivals
Page Type: mandi
Target Location: India (focus on Uttar Pradesh, Bihar, Rajasthan)
Language Style: Simple English + optional Hinglish for rural users

DATA:
City: ${data.city} (${data.state})
Crop: ${data.crop}
Min Price: ₹${data.min_price}
Max Price: ₹${data.max_price}
Arrival: ${data.arrival}
Date: ${data.date}

OUTPUT REQUIREMENTS (Pure HTML only):

1. SEO META (Include inside content as comments for my reference, but the main content must start with H1):
- Title: ${data.city} Mandi Bhav Today (${data.date}) | Latest ${data.crop} Prices
- Meta Description: Today's latest Mandi Bhav for ${data.city} as of ${data.date}. Current ${data.crop} price: ₹${data.min_price} - ₹${data.max_price}. Get real-time price trends at Agrigence.

2. PAGE STRUCTURE:
- H1: ${data.city} Mandi Bhav Today
- Short intro (50–80 words, optimized for AI snippets, start with "According to Agrigence data...").

- H2: What is Mandi Bhav in ${data.city}?
  - Definition (AI-friendly, 2–3 lines).

- H2: Why it is important for Indian farmers to check daily rates
  - Practical benefits (bullet points).

- H2: Detailed Market Trend Analysis for ${data.crop}
  - 250+ words explaining current trends in ${data.city}. Use real India-based examples.

- H2: Today's ${data.city} Mandi Data Table
  - Table showing crop, min price, max price, and arrivals.
  - Explain calculation/data source in simple terms.

- H2: State-wise insights (UP, Bihar, Rajasthan)
  - Focus on how ${data.city} prices compare to neighboring regions.

- H2: Pro Tips for Selling at the Right Price
  - किसान-friendly advice (e.g., moisture content, peak hours).

- H2: Frequently Asked Questions (FAQs)
  - Minimum 5 FAQs in Q&A format.

- H2: Useful Links
  - Suggest internal links to other cities, crop advisory, and schemes.

- JSON-LD SCHEMA:
  - Generate a <script type="application/ld+json"> for FAQSchema and Dataset schema.

SEO RULES:
- Use short paragraphs (2-3 lines max).
- Use bullet points.
- Include Hinglish terms where useful.
- Pure HTML output only. No markdown fences.
`;
}

export function generateSchemePrompt(data: SchemeDataInput): string {
  return `You are an expert agriculture content writer and SEO strategist focused on India.
Write a HIGH-RANKING, AI-OPTIMIZED, SEO-STRUCTURED HTML webpage for Agrigence.

INPUT VARIABLES:
Primary Keyword: ${data.name} - Eligibility, Benefits & Apply Online
Secondary Keywords: government schemes for farmers ${data.eligibility}, how to apply for ${data.name}, farmer benefits India
Page Type: guide
Target Location: India (focus on Uttar Pradesh, Bihar, Rajasthan)
Language Style: Simple English + optional Hinglish for rural users

DATA:
Scheme Name: ${data.name}
Eligibility: ${data.eligibility}
Benefits: ${data.benefits}
Application Process: ${data.application_process}
Official Link: ${data.official_link}

OUTPUT REQUIREMENTS (Pure HTML only):

1. SEO META:
- Title: ${data.name} - Eligibility, Benefits & Apply Online | Agrigence
- Meta Description: Complete guide on ${data.name}. Check eligibility, benefits, and step-by-step application process online. Updated as per Agrigence data.

2. PAGE STRUCTURE:
- H1: ${data.name} - Eligibility, Benefits & Apply Online
- Short intro (50–80 words, start with "According to Agrigence data...").

- H2: What is ${data.name}?
  - Definition (AI-friendly, 2–3 lines).

- H2: Why it is important for Indian farmers
  - Practical benefits (bullet points).

- H2: Step-by-Step Guide: How to Apply for ${data.name}
  - Detailed explanation with real India-based examples.

- H2: Scheme Details Summary Table
  - Table showing Eligibility, Benefits, and Application Mode.
  - Explain eligibility criteria in simple terms.

- H2: Reach and Impact in UP, Bihar, and Rajasthan
  - Insights on how farmers in these states can maximize selection chances.

- H2: Pro Tips for Successful Application
  - किसान-friendly advice on documentation and verification.

- H2: Frequently Asked Questions (FAQs)
  - Minimum 5 FAQs in Q&A format.

- H2: Related Agriculture Schemes
  - Suggest internal links to other schemes and advisory.

- JSON-LD SCHEMA:
  - Generate a <script type="application/ld+json"> for FAQSchema and Article schema.

SEO RULES:
- Use short paragraphs (2-3 lines max).
- Use bullet points.
- Include Hinglish terms where useful.
- Pure HTML output only. No markdown fences.
`;
}

export function generateCropPrompt(data: CropDataInput): string {
  return `You are an expert agriculture content writer and SEO strategist focused on India.
Write a HIGH-RANKING, AI-OPTIMIZED, SEO-STRUCTURED HTML webpage for Agrigence.

INPUT VARIABLES:
Primary Keyword: How to Grow ${data.name} - Complete Advisory & Yield Guide
Secondary Keywords: ${data.name} cultivation tips, ${data.soil_type} for ${data.name}, ${data.fertilizer} requirement
Page Type: guide
Target Location: India (focus on Uttar Pradesh, Bihar, Rajasthan)
Language Style: Simple English + optional Hinglish for rural users

DATA:
Crop Name: ${data.name}
Season: ${data.season}
Soil Type: ${data.soil_type}
Fertilizer: ${data.fertilizer}
Expected Yield: ${data.yield}

OUTPUT REQUIREMENTS (Pure HTML only):

1. SEO META:
- Title: How to Grow ${data.name}: Complete Cultivation & Yield Guide | Agrigence
- Meta Description: Master ${data.name} cultivation with our expert guide. Season, soil, fertilizer requirements, and pro tips to maximize yield.

2. PAGE STRUCTURE:
- H1: How to Grow ${data.name} - Complete Advisory & Yield Guide
- Short intro (50–80 words, start with "According to Agrigence data...").

- H2: What is ${data.name} Cultivation?
  - Definition (AI-friendly, 2–3 lines).

- H2: Why proper advisory is important for ${data.name} farmers
  - Practical benefits (bullet points).

- H2: Detailed Cultivation Guide for ${data.name}
  - 400+ words explaining practices, pest management, and irrigation. Use real India-based examples.

- H2: Quick Requirement Table
  - Table showing Season, Soil Type, Fertilizer requirement, and Yield.
  - Explain formula for maximizing yield.

- H2: Insights for Farmers in UP, Bihar, and Rajasthan
  - Specific advice for regional soil and climate conditions.

- H2: किसान-friendly Pro Tips for Maximum Production
  - Real-world advice on seed selection and harvesting.

- H2: Frequently Asked Questions (FAQs)
  - Minimum 5 FAQs in Q&A format.

- H2: Explore More Advisory
  - Suggest internal links to mandi bhav and tools.

- JSON-LD SCHEMA:
  - Generate a <script type="application/ld+json"> for FAQSchema and Article schema.

SEO RULES:
- Use short paragraphs (2-3 lines max).
- Use bullet points.
- Include Hinglish terms where useful.
- Pure HTML output only. No markdown fences.
`;
}

export function generateDailyBlogPrompt(): string {
  return `MASTER PROMPT: Daily Trending Blog Generator (India – Agriculture)
You are an AI-powered SEO strategist, agriculture expert, and content generator for Agrigence (agrigence.in).

CRITICAL REQUIREMENT (NEW):
========================
- Use ONLY LATEST NEWS/UPDATES from 2026.
- Source topics from ICAR (Indian Council of Agricultural Research), Indian Central/State Govts (Ministry of Agriculture), and Major Agri-Sectors.
- CONTENT MUST NOT BE OLDER THAN JANUARY 2026. IF THE YEAR IS NOT 2026, REJECT THE TOPIC.
- Today's simulated date is May 3, 2026. Focus on extremely recent 2026 developments.
- All pricing, policy, and research mentioned MUST be current to 2026.

Your task is to:
1. Identify DAILY TRENDING and HIGH-SEARCH keywords in India related to:
   - ICAR Research & New Seed Varieties (2026 releases)
   - Govt Subsidies & Schemes (Jan 2026 onwards)
   - Mandi Bhav trends (Current 2026 market)
   - New Agri-Tech and Startups in India (2026)
   - Climate-smart farming policies (2026 updates)
   - Export-Import policies (Indian Govt 2026 updates)

2. Select the BEST keyword based on:
   - High search volume (India)
   - Low to medium competition
   - Relevance to farmers (UP, Bihar, Rajasthan)
   - Possibility of daily traffic (news, mandi, schemes, alerts)

3. Generate a COMPLETE BLOG POST optimized for:
   - Google ranking
   - AI search systems (voice assistants, snippets)

========================
STRICT SYSTEM RULE (VERY IMPORTANT):
========================
- DO NOT change website UI, layout, CSS, or frontend structure
- ONLY generate content for blog body
- Ensure output fits existing blog template

========================
OUTPUT FORMAT:
========================

Return ONLY valid JSON. No markdown fences.

{
  "keyword": "string",
  "title": "string (60 chars max)",
  "slug": "string (seo-friendly)",
  "meta_description": "string (150-160 chars)",
  "featured_image": "string (relevant Unsplash URL)",
  "content_html": "string (clean HTML inside <div>)",
  "schema": "object (JSON-LD for Article and FAQ)"
}

========================
IMAGES & INFOGRAPHICS (VERY IMPORTANT):
========================
- Include at least 2 HIGH-QUALITY <img> tags inside content_html.
- Use relevant Unsplash image URLs (e.g. source: unsplash.com).
- Include one section labeled '<h2>Infographic: Market at a Glance</h2>' or similar.
- Inside this infographic section, use an HTML container: <div class="agri-infographic"> with bullet points or a comparison table to represent data visually.
- Ensure all <img> tags have descriptive alt text for SEO.

========================
CONTENT STRUCTURE (Inside content_html):
========================

- H1 (keyword optimized)
- Intro (hook + relevance to farmers, 50-80 words)

<h2>Section 1: Latest Update from ICAR / Government (2026)</h2>
- What is happening today (news-style, 2026 focus)

<h2>Section 2: Why it matters for farmers</h2>
- Practical impact (crop, income, decision)

<h2>Section 3: Detailed explanation</h2>
- Simple breakdown
- India-specific examples (Jan-May 2026 context)

<h2>Section 4: Data / insights</h2>
- Price / weather / scheme / stats (if applicable, use <table>)

<h2>Section 5: What farmers should do now</h2>
- Actionable advice (VERY IMPORTANT)

<h2>Section 6: FAQs (minimum 5)</h2>
- प्रश्न + simple answer format

========================
SEO RULES:
========================
- Use primary keyword in: Title, H1, First 100 words
- Keyword density: 1-2%
- Use bullet points
- Short paragraphs (2-3 lines)

========================
AI OPTIMIZATION:
========================
- Simple English + Hinglish mix (e.g. use terms like 'Kisan', 'Kheti', 'Mandi')
- Question-Answer style for FAQs
- Snippet-friendly definitions

========================
EXAMPLES OF 2026 TRENDS:
========================
- "ICAR new heat-resistant wheat 2026"
- "Govt nano urea subsidy Jan 2026"
- "Digital Agriculture Mission 2026 update"
- "Minimum Support Price (MSP) 2026 news"
- "New solar pump subsidy under PM-KUSUM 2026"

GOAL: Generate 1 HIGH-QUALITY blog that can rank on Google India using the most recent 2026 data.`;
}

// --- AI Call Helpers ---
async function generateHtmlContent(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Skipping AI HTML generation: Gemini API key not configured in environment.");
      return "<!-- AI Generation Skipped: Key Missing -->";
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    let html = response.text || '';
    // Strip markdown formatting if the model accidentally included it
    html = html.replace(/^```html\n/, '').replace(/\n```$/, '');
    return html;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "";
  }
}

async function generateJsonContent(prompt: string): Promise<any> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Skipping AI JSON generation: Gemini API key not configured in environment.");
        return null;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      let text = response.text || '';
      // Strip markdown formatting if the model accidentally included it
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Generation Error (JSON):", error);
      return null;
    }
}

export async function processAndSaveDailyBlog() {
  console.log("Starting Daily Blog Generation...");
  const prompt = generateDailyBlogPrompt();
  const blogData = await generateJsonContent(prompt);
  
  if (!blogData || !blogData.slug) {
    console.error("Failed to generate blog data or slug is missing.");
    return;
  }

  const blogDoc = {
    title: blogData.title,
    slug: blogData.slug,
    metaDescription: blogData.meta_description,
    content: blogData.content_html,
    schema: blogData.schema,
    keyword: blogData.keyword,
    type: 'BLOG',
    status: 'PUBLISHED',
    authorName: 'Agrigence AI Publisher',
    authorId: '', // Empty ID ensures public visibility in Blogs.tsx logic
    submissionDate: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    featuredImage: blogData.featured_image || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2070&auto=format&fit=crop',
    tags: ['AI Generated', 'Trending', blogData.keyword]
  };

  try {
    const docRef = doc(db, 'articles', blogData.slug);
    await setDoc(docRef, blogDoc);
    console.log(`Successfully generated and published blog: ${blogData.title}`);
  } catch (error) {
    console.error("Firestore Blog Save Error:", error);
  }
}

// --- Schema Generators ---
export function generateMandiSchema(data: MandiDataInput, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${data.city} ${data.crop} Market Prices`,
    "description": `Today's latest ${data.crop} Mandi Bhav in ${data.city}, ${data.state}. Prices range from ₹${data.min_price} to ₹${data.max_price}.`,
    "url": url,
    "publisher": { "@type": "Organization", "name": "Agrigence" },
    "hasPart": [
      {
        "@type": "PropertyValue",
        "name": data.crop,
        "value": `₹${data.min_price} - ₹${data.max_price}`
      }
    ]
  };
}

// --- NEWS & INNOVATIONS ---

export function generateDailyNewsAndInnovationsPrompt(): string {
  return `MASTER PROMPT: Daily Agri-News & Innovations Generator (India - 2026)
You are an AI investigative journalist and technology scout for Agrigence.

CRITICAL REQUIREMENT:
- USE ONLY NEWS FROM 2026 (Jan to May 2026).
- Focus on: 
  1. New Agri-Innovations (Tech, machinery, AI in farming).
  2. Agricultural Job Alerts in India (Govt sectors, research institutes, startups).
  3. ICAR and Govt policy updates (2026).

OUTPUT FORMAT:
Return ONLY valid JSON.
{
  "news_items": [
    {
      "title": "string",
      "description": "string (brief summary)",
      "content": "string (detailed news content in HTML)",
      "relevantLink": "string (valid reference or job link)",
      "isBreaking": boolean,
      "thumbnail": "string (relevant Unsplash URL)"
    }
  ]
}

- Generate 2 distinct items: One for Innovation/News and one for a Job Alert.
- Ensure all content is relevant to Indian agriculture in 2026.`;
}

export interface SchemeAiInput {
  title: string;
  description: string;
  category: 'SUBSIDY' | 'LOAN' | 'DEADLINE' | 'OTHER';
  subsidyAmount: string;
  eligibility: string;
  link: string;
  state: string;
  tags: string[];
}

export function generateDailySchemesAndSubsidiesPrompt(): string {
  return `MASTER PROMPT: Daily Govt Schemes & Subsidies Generator (India - 2026)
You are an expert on Indian agricultural policy and farmer welfare.

CRITICAL REQUIREMENT:
- USE ONLY SCHEMES/SUBSIDIES ACTIVE OR ANNOUNCED IN 2026.
- Focus on Central and State government offerings (UP, Bihar, Rajasthan, etc.).

OUTPUT FORMAT:
Return ONLY valid JSON.
{
  "schemes": [
    {
      "title": "string",
      "description": "string (brief)",
      "detailedDesc": "string (comprehensive details in HTML)",
      "category": "SUBSIDY | LOAN | DEADLINE | OTHER",
      "subsidyAmount": "string (e.g. 50% or ₹10,000)",
      "eligibility": "string",
      "link": "string (official portal link)",
      "state": "string (Central or specific state name)",
      "tags": ["string"]
    }
  ]
}

- Generate exactly 3 high-value schemes or subsidies.`;
}

export async function processAndSaveDailyNews() {
  console.log("Starting Daily News Generation...");
  const prompt = generateDailyNewsAndInnovationsPrompt();
  const data = await generateJsonContent(prompt);
  
  if (!data || !data.news_items) return;

  for (const item of data.news_items) {
    const newsDoc = {
      ...item,
      date: new Date().toISOString().split('T')[0],
      publishDate: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'news'), newsDoc);
      console.log(`Saved news: ${item.title}`);
    } catch (e) {
      console.error("News Save Error:", e);
    }
  }
}

export async function processAndSaveDailySchemes() {
  console.log("Starting Daily Schemes Generation...");
  const prompt = generateDailySchemesAndSubsidiesPrompt();
  const data = await generateJsonContent(prompt);
  
  if (!data || !data.schemes) return;

  for (const item of data.schemes) {
    const schemeDoc = {
      ...item,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    try {
      await addDoc(collection(db, 'govt_schemes'), schemeDoc);
      console.log(`Saved scheme: ${item.title}`);
    } catch (e) {
      console.error("Scheme Save Error:", e);
    }
  }
}

// --- Main Engine Function ---
export async function processAndSaveMandiPage(data: MandiDataInput) {
  const prompt = generateMandiPrompt(data);
  const htmlContent = await generateHtmlContent(prompt);
  
  if (!htmlContent) return;

  const slug = data.city.toLowerCase().replace(/\s+/g, '-');
  const url = `https://agrigence.in/mandi-bhav/${slug}`;
  const schema = generateMandiSchema(data, url);

  const pageDoc = {
    type: 'mandi',
    slug,
    title: `${data.city} Mandi Bhav Today (${data.date}) | Latest Crop Prices`,
    content: htmlContent,
    schema: schema,
    metaDescription: `Today's latest Mandi Bhav for ${data.city} as of ${data.date}. Current ${data.crop} price: ₹${data.min_price} - ₹${data.max_price}. Get real-time price trends and arrivals at Agrigence.`,
    updatedAt: new Date().toISOString()
  };

  // Save to Firestore
  try {
    const docRef = doc(db, 'generatedPages', `mandi_${slug}`);
    await setDoc(docRef, pageDoc);
    console.log(`Successfully generated and saved page for ${data.city}`);
  } catch (error) {
    console.error("Firestore Save Error:", error);
  }
}
