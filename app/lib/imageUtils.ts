export interface CompressedImage {
    data: string; 
    width: number;
    height: number;
    format: string;
    size: number; 
}

export const compressAndEncodeImage = async (
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600,
    quality: number = 0.7
): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            try {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx?.drawImage(img, 0, 0, width, height);
                
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                const base64Data = compressedDataUrl.split(',')[1];
                
                resolve({
                    data: base64Data,
                    width: Math.round(width),
                    height: Math.round(height),
                    format: 'jpeg',
                    size: file.size
                });
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

export const compressAndEncodeVideo = async (
    file: File,
    thumbnailQuality: number = 0.6
): Promise<{ thumbnail: CompressedImage; videoData: string }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadedmetadata = () => {
            try {
                video.currentTime = 1;
            } catch (error) {
                video.currentTime = 0;
            }
        };
        
        video.onseeked = () => {
            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx?.drawImage(video, 0, 0);
                
                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', thumbnailQuality);
                const thumbnailBase64 = thumbnailDataUrl.split(',')[1];
                
                const reader = new FileReader();
                reader.onload = () => {
                    const videoBase64 = (reader.result as string).split(',')[1];
                    resolve({
                        thumbnail: {
                            data: thumbnailBase64,
                            width: video.videoWidth,
                            height: video.videoHeight,
                            format: 'jpeg',
                            size: file.size
                        },
                        videoData: videoBase64
                    });
                };
                reader.readAsDataURL(file);
            } catch (error) {
                reject(error);
            }
        };
        
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = URL.createObjectURL(file);
    });
};

export const decodeAndDisplayImage = (encodedData: string, format: string = 'jpeg'): string => {
    return `data:image/${format};base64,${encodedData}`;
};

export const getImageDimensions = (compressedImage: CompressedImage) => {
    return {
        width: compressedImage.width,
        height: compressedImage.height,
        format: compressedImage.format,
        originalSize: compressedImage.size
    };
};

export const getCompressionRatio = (compressedImage: CompressedImage): number => {
    const compressedSize = compressedImage.data.length * 0.75; 
    return (compressedSize / compressedImage.size) * 100;
};
