import bcrypt from 'bcryptjs';

/**
 * Hashea una contraseña usando bcrypt
 * @param password - La contraseña en texto plano
 * @returns Promise<string> - La contraseña hasheada
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Número de rondas de salt (más alto = más seguro pero más lento)
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica si una contraseña coincide con su hash
 * @param password - La contraseña en texto plano
 * @param hashedPassword - La contraseña hasheada
 * @returns Promise<boolean> - true si coinciden, false si no
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Genera una contraseña temporal aleatoria
 * @param length - Longitud de la contraseña (por defecto 12)
 * @returns string - Contraseña temporal
 */
export function generateTemporaryPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Asegurar que tenga al menos una mayúscula, una minúscula, un número y un símbolo
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Completar el resto de la longitud
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Valida la fortaleza de una contraseña
 * @param password - La contraseña a validar
 * @returns object - Resultado de la validación con detalles
 */
export function validatePasswordStrength(password: string) {
  const result = {
    isValid: false,
    score: 0,
    feedback: [] as string[],
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSymbol: false
    }
  };

  // Verificar longitud mínima
  if (password.length >= 8) {
    result.requirements.minLength = true;
    result.score += 1;
  } else {
    result.feedback.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Verificar mayúsculas
  if (/[A-Z]/.test(password)) {
    result.requirements.hasUppercase = true;
    result.score += 1;
  } else {
    result.feedback.push('Debe contener al menos una letra mayúscula');
  }

  // Verificar minúsculas
  if (/[a-z]/.test(password)) {
    result.requirements.hasLowercase = true;
    result.score += 1;
  } else {
    result.feedback.push('Debe contener al menos una letra minúscula');
  }

  // Verificar números
  if (/[0-9]/.test(password)) {
    result.requirements.hasNumber = true;
    result.score += 1;
  } else {
    result.feedback.push('Debe contener al menos un número');
  }

  // Verificar símbolos
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.requirements.hasSymbol = true;
    result.score += 1;
  } else {
    result.feedback.push('Debe contener al menos un símbolo especial');
  }

  // La contraseña es válida si cumple todos los requisitos
  result.isValid = result.score === 5;

  return result;
}

/**
 * Obtiene el nivel de fortaleza de una contraseña
 * @param password - La contraseña a evaluar
 * @returns object - Nivel y descripción de la fortaleza
 */
export function getPasswordStrengthLevel(password: string) {
  const validation = validatePasswordStrength(password);
  
  if (validation.score <= 2) {
    return { level: 'weak', label: 'Débil', color: 'red' };
  } else if (validation.score <= 3) {
    return { level: 'medium', label: 'Media', color: 'yellow' };
  } else if (validation.score <= 4) {
    return { level: 'strong', label: 'Fuerte', color: 'green' };
  } else {
    return { level: 'very-strong', label: 'Muy Fuerte', color: 'emerald' };
  }
}
