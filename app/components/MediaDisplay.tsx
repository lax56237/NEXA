import { decodeAndDisplayImage } from "../lib/imageUtils";

interface MediaDisplayProps {
    type: "image" | "video";
    imageData?: {
        data: string;
        width: number;
        height: number;
        format: string;
        originalSize: number;
        compressedSize: number;
    };
    videoData?: string;
    thumbnail?: {
        data: string;
        width: number;
        height: number;
        format: string;
        originalSize: number;
        compressedSize: number;
    };
    className?: string;
}

export default function MediaDisplay({ 
    type, 
    imageData, 
    videoData, 
    thumbnail, 
    className = "" 
}: MediaDisplayProps) {
    
    if (type === "image" && imageData) {
        const imageSrc = decodeAndDisplayImage(imageData.data, imageData.format);
        const compressionRatio = Math.round((imageData.compressedSize / imageData.originalSize) * 100);
        
        return (
            <div className={`relative ${className}`}>
                <img 
                    src={imageSrc} 
                    alt="Uploaded content"
                    className="w-full h-auto rounded-lg"
                    style={{ 
                        maxWidth: `${Math.min(imageData.width, 800)}px`,
                        maxHeight: `${Math.min(imageData.height, 600)}px`
                    }}
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageData.width}×{imageData.height} | {compressionRatio}% compressed
                </div>
            </div>
        );
    }
    
    if (type === "video" && videoData && thumbnail) {
        const thumbnailSrc = decodeAndDisplayImage(thumbnail.data, thumbnail.format);
        const compressionRatio = Math.round((thumbnail.compressedSize / thumbnail.originalSize) * 100);
        
        return (
            <div className={`relative ${className}`}>
                <div className="relative">
                    <img 
                        src={thumbnailSrc} 
                        alt="Video thumbnail"
                        className="w-full h-auto rounded-lg"
                        style={{ 
                            maxWidth: `${Math.min(thumbnail.width, 800)}px`,
                            maxHeight: `${Math.min(thumbnail.height, 600)}px`
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 text-white p-3 rounded-full">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {thumbnail.width}×{thumbnail.height} | {compressionRatio}% compressed
                </div>
            </div>
        );
    }
    
    return (
        <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
            <span className="text-gray-500">Media not available</span>
        </div>
    );
}
