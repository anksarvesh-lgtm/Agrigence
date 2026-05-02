
import { Article } from '../../types';
import { safeStringify } from '../../lib/safeStringify';

export interface SubmissionMeta {
  articleId: string;
  title: string;
  author: string;
  submittedAt: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
  remarks: string;
  lastUpdated: string;
}

// Key generation logic to ensure consistency
const getMetaKey = (articleId: string) => `meta/${articleId}.json`;

export const createMetaFile = async (articleId: string, title: string, author: string) => {
  const meta: SubmissionMeta = {
    articleId,
    title,
    author,
    submittedAt: new Date().toISOString(),
    status: 'Pending',
    remarks: 'Submission received. Pending initial review.',
    lastUpdated: new Date().toISOString()
  };

  const path = getMetaKey(articleId);
  window.localStorage.setItem(path, safeStringify(meta));
  return true;
};

// Fail-safe reader: If file is missing, generates a temporary default object
export const getMetaFile = async (article: Article): Promise<SubmissionMeta> => {
  const path = getMetaKey(article.id);
  const data = window.localStorage.getItem(path);
  
  if (data && data !== '[Unstringifiable Object]' && !data.startsWith('[Complex Object')) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Ignored
    }
  }

  // Auto-Recovery: Create and return a default record if missing
  // This ensures the UI always has data to render
  const defaultMeta: SubmissionMeta = {
    articleId: String(article.id || ''),
    title: String(article.title || 'Untitled'),
    author: String(article.authorName || 'Unknown'),
    submittedAt: String(article.submissionDate || new Date().toISOString()),
    status: 'Pending',
    remarks: 'Status pending initialization...',
    lastUpdated: String(article.submissionDate || new Date().toISOString())
  };
  
  // Optionally persist this recovery to fix the data gap
  window.localStorage.setItem(path, safeStringify(defaultMeta));
  
  return defaultMeta;
};

export const updateMetaStatus = async (articleId: string, status: SubmissionMeta['status'], remarks: string) => {
  const path = getMetaKey(articleId);
  const data = window.localStorage.getItem(path);
  
  let current: SubmissionMeta;
  if (data && data !== '[Unstringifiable Object]' && !data.startsWith('[Complex Object')) {
    try {
      current = JSON.parse(data);
    } catch(e) {
      return false;
    }
  } else {
    // Should not happen with getMetaFile utilized, but safety first
    return false; 
  }

  const updated = { ...current, status, remarks, lastUpdated: new Date().toISOString() };
  window.localStorage.setItem(path, safeStringify(updated));
  return true;
};

export const deleteMetaFile = (articleId: string) => {
  const path = getMetaKey(articleId);
  window.localStorage.removeItem(path);
};
