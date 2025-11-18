// utils/validation.js
export const validateFileUpload = (file) => {
  const maxSize = 1 * 1024 * 1024; // 1MB
  if (!file) return { isValid: false, error: 'No file selected' };
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 1MB' };
  }
  // Add more validations if needed, e.g., file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Allowed: JPG, PNG, PDF, DOCX' };
  }
  return { isValid: true, error: null };
};