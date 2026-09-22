export const MAX_PASSWORD_LENGTH = 15;

const ERROR_MESSAGE = 'VUI LÒNG NHẬP LẠI';

export const isValidPhone = (phone: string) => /^0\d{9}$/.test(phone);

export const sanitizePhone = (value: string) => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 0 && !digits.startsWith('0')) {
    return '';
  }
  return digits.slice(0, 10);
};

export const validatePhone = (phone: string): string | null =>
  isValidPhone(phone) ? null : ERROR_MESSAGE;

export const validatePassword = (password: string): string | null =>
  password.length < 8 || password.length > MAX_PASSWORD_LENGTH ? ERROR_MESSAGE : null;