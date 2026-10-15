/**
 * Safe Administrator Provisioning & Cryptographic Authentication
 * Harvinder Telecom E-Commerce
 * Zero-Cost Architecture (Uses Native Web Crypto API — No Paid Dependencies)
 */

export interface AdminProvisionInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  provisioningSecret: string;
}

// Default development bootstrap secret for initializing the store owner account
const DEFAULT_BOOTSTRAP_SECRET = 'HARVINDER_HALDWANI_DEV_SECRET_2026';

/**
 * Converts ArrayBuffer to Hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Cryptographic helper generating a random 16-byte hex salt
 */
export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bufferToHex(bytes.buffer);
  }
  // Fallback random hex
  return Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
}

/**
 * Computes SHA-256 hash with salt using standard Web Crypto API
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }

  // Fallback synchronous hash for non-crypto environments
  let hash = 0;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verifies if candidate password matches stored hash and salt
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const candidateHash = await hashPassword(password, salt);
  return candidateHash === storedHash;
}

/**
 * Safe Administrator Provisioning Method
 * Ensures that normal registration cannot elevate a user to admin.
 * Requires an explicit verification secret or invitation from an existing admin.
 */
export async function provisionAdministrator(
  input: AdminProvisionInput,
  existingAdminSession?: { role: string }
): Promise<{ success: boolean; profile?: { id: string; email: string; role: 'admin'; name: string; phone: string }; error?: string }> {
  // Validate bootstrap secret or existing admin session
  const isAuthorized = 
    existingAdminSession?.role === 'admin' || 
    input.provisioningSecret === DEFAULT_BOOTSTRAP_SECRET;

  if (!isAuthorized) {
    return {
      success: false,
      error: 'Unauthorized: Administrator provisioning requires valid master setup token or existing administrative session.'
    };
  }

  if (!input.email || !input.fullName || !input.password || input.password.length < 8) {
    return {
      success: false,
      error: 'Invalid administrator details: password must be at least 8 characters long.'
    };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(input.password, salt);

  const adminProfile = {
    id: `admin-${Date.now()}`,
    email: input.email.toLowerCase().trim(),
    name: input.fullName.trim(),
    phone: input.phone.trim(),
    role: 'admin' as const,
    password_hash: passwordHash,
    salt: salt,
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    profile: {
      id: adminProfile.id,
      email: adminProfile.email,
      name: adminProfile.name,
      phone: adminProfile.phone,
      role: 'admin'
    }
  };
}
