export const validateImage = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) throw new Error('No file provided');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Invalid file type');
  if (file.size > MAX_FILE_SIZE) throw new Error('File too large (max 5MB)');

  return true;
};

export const validatePost = (title, content) => {
  if (!title?.trim()) throw new Error('Title is required');
  if (!content?.trim()) throw new Error('Content is required');
  if (title.length > 200) throw new Error('Title too long (max 200 chars)');
  if (content.length > 50000) throw new Error('Content too long (max 50000 chars)');
  
  return true;
};
