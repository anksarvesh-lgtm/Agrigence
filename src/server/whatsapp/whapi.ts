import axios from 'axios';
import { db } from './db.ts';

const WHAPI_URL = 'https://gate.whapi.cloud/messages/text';
const MAX_MESSAGES_PER_DAY = 150;

/**
 * Gets the active token with available capacity for today.
 */
export const getActiveToken = () => {
  const tokens = db.get('tokens').filter(t => t.isActive);
  const today = new Date().toISOString().split('T')[0];

  // 1. Check Database Tokens
  if (tokens.length > 0) {
    for (const token of tokens) {
      const usages = db.get('dailyUsage').filter(u => u.tokenId === token.id && u.date === today);
      const currentUsage = usages.reduce((acc, curr) => acc + curr.count, 0);
      
      if (currentUsage < MAX_MESSAGES_PER_DAY) {
        return { token, currentUsage };
      }
    }
  }

  // 2. Fallback to Environment Variable (WHAPI_TOKEN)
  const envToken = process.env.WHAPI_TOKEN;
  if (envToken) {
    const envTokenId = 'env_default_token';
    const usages = db.get('dailyUsage').filter(u => u.tokenId === envTokenId && u.date === today);
    const currentUsage = usages.reduce((acc, curr) => acc + curr.count, 0);

    if (currentUsage < MAX_MESSAGES_PER_DAY) {
      return { 
        token: { id: envTokenId, token: envToken, name: 'Environment Default', isActive: true }, 
        currentUsage 
      };
    }
  }
  
  if (tokens.length > 0 || envToken) {
    throw new Error('LIMIT_EXCEEDED');
  }

  throw new Error('No active Whapi.Cloud tokens found. Please set WHAPI_TOKEN env var or add a token in Admin Panel.');
};

/**
 * Increments the daily limit counter for a token
 */
const incrementUsage = (tokenId: string) => {
  const today = new Date().toISOString().split('T')[0];
  db.incrementUsage(tokenId, today);
};

export const sendWhatsAppMessage = async (to: string, body: string) => {
  try {
    const { token } = getActiveToken();
    
    // Official Whapi.Cloud Endpoint call
    const response = await axios.post(
      WHAPI_URL,
      { to, body },
      {
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    incrementUsage(token.id);
    return { success: true, tokenId: token.id, data: response.data };
  } catch (error: any) {
    if (error.message === 'LIMIT_EXCEEDED') {
      return { success: false, reason: 'LIMIT_EXCEEDED' };
    }
    throw error;
  }
};
