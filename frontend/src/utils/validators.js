// Email validation
export const isEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone validation
export const isPhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone);
};

// Required field validation
export const isRequired = (value) => {
  return value !== undefined && value !== null && value !== '';
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

// Integer validation
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Positive integer validation
export const isPositiveInteger = (value) => {
  return isInteger(value) && Number(value) > 0;
};

// Min length validation
export const minLength = (value, min) => {
  return value && value.length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
  return !value || value.length <= max;
};

// Range validation
export const isInRange = (value, min, max) => {
  return isNumber(value) && parseFloat(value) >= min && parseFloat(value) <= max;
};

// Password validation
export const isPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Form validation rules
export const validationRules = {
  required: { required: true, message: 'Field ini wajib diisi' },
  email: { type: 'email', message: 'Format email tidak valid' },
  phone: { pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, message: 'Format nomor telepon tidak valid' },
  number: { type: 'number', message: 'Harus berupa angka' },
  positiveNumber: { type: 'number', min: 0, message: 'Harus berupa angka positif' },
  integer: { type: 'integer', message: 'Harus berupa bilangan bulat' },
  positiveInteger: { type: 'integer', min: 1, message: 'Harus berupa bilangan bulat positif' },
  minLength: (min) => ({ min, message: `Minimal ${min} karakter` }),
  maxLength: (max) => ({ max, message: `Maksimal ${max} karakter` }),
  range: (min, max) => ({ type: 'number', min, max, message: `Harus antara ${min} dan ${max}` }),
  password: { min: 6, message: 'Password minimal 6 karakter' }
};