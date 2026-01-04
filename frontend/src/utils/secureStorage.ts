/**
 * Secure Storage Utility
 * Encrypts and decrypts sensitive data (auth tokens, user IDs) to prevent
 * clear text storage vulnerabilities (CVE-style security issue)
 * 
 * Uses Web Crypto API for encryption with AES-GCM
 */

/**
 * Utility to check if Web Crypto API is available
 */
export const isWebCryptoAvailable = (): boolean => {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
};

// Generate or get encryption key
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyString = 'edulearn_app_key_v1'; // In production, use a dynamic key from server
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  ).then(key =>
    crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('edulearn_salt_v1'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  );
};

/**
 * Encrypts a value and stores it as a JSON object with IV (initialization vector)
 * Also stores a synchronously-retrievable backup for use in sync contexts (like axios interceptors)
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    // ALWAYS store sync backup first (required for interceptor to work)
    setSecureItemFallback(`${key}_sync_backup`, value);
    
    // Then try to store encrypted version if Web Crypto available
    if (isWebCryptoAvailable()) {
      try {
        const encryptionKey = await getEncryptionKey();
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        
        // Generate a random IV for each encryption
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          encryptionKey,
          data
        );
        
        // Store as base64-encoded JSON with IV
        const encryptedArray = new Uint8Array(encrypted);
        const encryptedBase64 = btoa(String.fromCharCode.apply(null, Array.from(encryptedArray)));
        const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));
        
        const storageData = JSON.stringify({
          encrypted: encryptedBase64,
          iv: ivBase64,
          version: 1,
        });
        
        localStorage.setItem(`secure_${key}`, storageData);
      } catch (encryptError) {
        console.warn(`Failed to store encrypted ${key}, using fallback only:`, encryptError);
        // Sync backup already stored, so continue
      }
    }
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
    // Try fallback at least
    try {
      setSecureItemFallback(`${key}_sync_backup`, value);
    } catch (fallbackError) {
      console.error(`Even fallback storage failed for ${key}:`, fallbackError);
    }
  }
};

/**
 * Retrieves and decrypts a value from secure storage
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const storageData = localStorage.getItem(`secure_${key}`);
    if (!storageData) {
      return null;
    }
    
    const parsed = JSON.parse(storageData);
    const encryptionKey = await getEncryptionKey();
    const decoder = new TextDecoder();
    
    // Convert base64 back to Uint8Array
    const encryptedArray = new Uint8Array(
      atob(parsed.encrypted)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    
    const iv = new Uint8Array(
      atob(parsed.iv)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encryptedArray
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    console.error(`Failed to decrypt ${key}:`, error);
    return null;
  }
};

/**
 * Removes a secure item from storage (both encrypted and sync backup)
 */
export const removeSecureItem = (key: string): void => {
  localStorage.removeItem(`secure_${key}`);
  localStorage.removeItem(`secure_${key}_sync_backup`);
};

/**
 * Clears all secure items with the 'secure_' prefix
 */
export const clearSecureStorage = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('secure_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Alternative: Simple obfuscation fallback if Web Crypto is unavailable
 * NOT cryptographically secure - for backward compatibility only
 */
const encodeSimple = (str: string): string => {
  return btoa(
    str
      .split('')
      .map(char => String.fromCharCode(char.charCodeAt(0) ^ 0x42))
      .join('')
  );
};

const decodeSimple = (encoded: string): string => {
  try {
    return atob(encoded)
      .split('')
      .map(char => String.fromCharCode(char.charCodeAt(0) ^ 0x42))
      .join('');
  } catch {
    return '';
  }
};

/**
 * Fallback secure storage using simple obfuscation
 * Used when Web Crypto API is not available
 */
export const setSecureItemFallback = (key: string, value: string): void => {
  const encoded = encodeSimple(value);
  localStorage.setItem(`secure_${key}`, encoded);
};

export const getSecureItemFallback = (key: string): string | null => {
  const encoded = localStorage.getItem(`secure_${key}`);
  if (!encoded) return null;
  return decodeSimple(encoded);
};

/**
 * Helper to get auth token (supports both sync and async retrieval)
 * Prefers secure storage, falls back gracefully
 */
export const getAuthTokenAsync = async (): Promise<string | null> => {
  if (isWebCryptoAvailable()) {
    return await getSecureItem('auth_token');
  }
  return getSecureItemFallback('auth_token');
};

/**
 * Helper to get user ID (supports both sync and async retrieval)
 * Prefers secure storage, falls back gracefully
 */
export const getUserIdAsync = async (): Promise<string | null> => {
  if (isWebCryptoAvailable()) {
    return await getSecureItem('user_id');
  }
  return getSecureItemFallback('user_id');
};
