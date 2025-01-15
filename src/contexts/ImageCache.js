import { createContext, useContext, useState } from 'react';

const ImageCacheContext = createContext();

export function ImageCacheProvider({ children }) {
  const [cachedImages, setCachedImages] = useState({});

  const cacheImage = (key, imageUrl) => {
    if (!cachedImages[key]) {
      setCachedImages(prev => ({ ...prev, [key]: imageUrl }));
    }
  };

  return (
    <ImageCacheContext.Provider value={{ cachedImages, cacheImage }}>
      {children}
    </ImageCacheContext.Provider>
  );
}

export const useImageCache = () => useContext(ImageCacheContext);
