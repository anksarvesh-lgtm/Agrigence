
import { Article } from '../../types';

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
  window.localStorage.setItem(path, JSON.stringify(meta));
  return true;
};

// Fail-safe reader: If file is missing, generates a temporary default object
export const getMetaFile = async (article: Article): Promise<SubmissionMeta> => {
  const path = getMetaKey(article.id);
  const data = window.localStorage.getItem(path);
  
  if (data) {
    return JSON.parse(data);
  }

  // Auto-Recovery: Create and return a default record if missing
  // This ensures the UI always has data to render
  const defaultMeta: SubmissionMeta = {
    articleId: article.id,
    title: article.title,
    author: article.authorName,
    submittedAt: article.submissionDate,
    status: 'Pending',
    remarks: 'Status pending initialization...',
    lastUpdated: article.submissionDate
  };
  
  // Optionally persist this recovery to fix the data gap
  window.localStorage.setItem(path, JSON.stringify(defaultMeta));
  
  return defaultMeta;
};

export const updateMetaStatus = async (articleId: string, status: SubmissionMeta['status'], remarks: string) => {
  const path = getMetaKey(articleId);
  const data = window.localStorage.getItem(path);
  
  let current: SubmissionMeta;
  if (data) {
    current = JSON.parse(data);
  } else {
    // Should not happen with getMetaFile utilized, but safety first
    return false; 
  }

  const updated = { ...current, status, remarks, lastUpdated: new Date().toISOString() };
  window.localStorage.setItem(path, JSON.stringify(updated));
  return true;
};

export const deleteMetaFile = (articleId: string) => {
  const path = getMetaKey(articleId);
  window.localStorage.removeItem(path);
};
