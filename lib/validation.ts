export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('One number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character');
  }

  if (password.length > 100) {
    errors.push('Maximum 100 characters');
  }

  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', '123456789', 'Password1'
  ];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common');
  }

  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600 dark:text-red-400';
    case 'medium':
      return 'text-amber-600 dark:text-amber-400';
    case 'strong':
      return 'text-green-600 dark:text-green-400';
  }
}

export function getPasswordStrengthBg(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'strong':
      return 'bg-green-500';
  }
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 320) {
    return { isValid: false, error: 'Email too long' };
  }
  
  return { isValid: true };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Min 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Max 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Letters, numbers, underscore only' };
  }
  
  if (/^\d/.test(username)) {
    return { isValid: false, error: 'Cannot start with number' };
  }
  
  return { isValid: true };
}

export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Min 2 characters' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Max 100 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Letters, spaces, hyphens, apostrophes only' };
  }
  
  return { isValid: true };
}

