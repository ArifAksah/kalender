/**
 * Image Optimization Utilities
 * Compress and optimize images before upload
 */

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    type = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, type, quality);
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Lazy load images using Intersection Observer
 * @param {HTMLElement} imageElement - Image element to lazy load
 * @param {Object} options - Observer options
 */
export const lazyLoadImage = (imageElement, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);

  observer.observe(imageElement);

  return observer;
};

/**
 * Preload images for better UX
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} Promise that resolves when all images loaded
 */
export const preloadImages = (urls) => {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(url);
      img.src = url;
    });
  });

  return Promise.allSettled(promises);
};

/**
 * Convert image to WebP format (modern, smaller size)
 * @param {File} file - Image file
 * @returns {Promise<Blob>} WebP blob
 */
export const convertToWebP = async (file) => {
  return compressImage(file, {
    type: 'image/webp',
    quality: 0.85
  });
};

/**
 * Get image dimensions without loading
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generate image thumbnail
 * @param {File} file - Image file
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<Blob>} Thumbnail blob
 */
export const generateThumbnail = async (file, size = 150) => {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7
  });
};

const imageOptimizationUtils = {
  compressImage,
  lazyLoadImage,
  preloadImages,
  convertToWebP,
  getImageDimensions,
  generateThumbnail
};

export default imageOptimizationUtils;
