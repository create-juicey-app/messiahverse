export const uploadImage = async (file) => {
  const base64 = await convertToBase64(file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: base64 })
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.url;
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const extractImages = (markdown) => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push(match[1]);
  }

  return images;
};
