import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface Credential {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  type?: 'admin' | 'user';
}

export interface CredentialInput {
  email: string;
  password: string;
  full_name: string;
  status: 'active' | 'inactive';
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Credentials management
export async function getAdminCredentials() {
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Credential[];
}

export async function getUserCredentials() {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Credential[];
}

export async function getCredentialById(
  type: 'admin' | 'user',
  id: number
) {
  const table = type === 'admin' ? 'admin_credentials' : 'user_credentials';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Credential;
}

export async function createCredential(
  type: 'admin' | 'user',
  input: CredentialInput
) {
  const validation = validatePassword(input.password);
  if (!validation.isValid) {
    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
  }

  if (!validateEmail(input.email)) {
    throw new Error('Invalid email format');
  }

  const passwordHash = await hashPassword(input.password);
  const table = type === 'admin' ? 'admin_credentials' : 'user_credentials';

  const { data, error } = await supabase
    .from(table)
    .insert({
      email: input.email,
      password_hash: passwordHash,
      full_name: input.full_name,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Credential;
}

export async function updateCredential(
  type: 'admin' | 'user',
  id: number,
  input: Partial<CredentialInput>
) {
  const table = type === 'admin' ? 'admin_credentials' : 'user_credentials';
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.email) {
    if (!validateEmail(input.email)) {
      throw new Error('Invalid email format');
    }
    updateData.email = input.email;
  }

  if (input.password) {
    const validation = validatePassword(input.password);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }
    updateData.password_hash = await hashPassword(input.password);
  }

  if (input.full_name) {
    updateData.full_name = input.full_name;
  }

  if (input.status) {
    updateData.status = input.status;
  }

  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Credential;
}

export async function deleteCredential(
  type: 'admin' | 'user',
  id: number
) {
  const table = type === 'admin' ? 'admin_credentials' : 'user_credentials';
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function searchCredentials(
  type: 'admin' | 'user',
  query: string
) {
  const table = type === 'admin' ? 'admin_credentials' : 'user_credentials';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Credential[];
}
