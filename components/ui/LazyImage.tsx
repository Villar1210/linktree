import { useState, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholderSrc?: string;
    onLoad?: () => void;
}

export default function LazyImage({
    src,
    alt,
    className = '',
    placeholderSrc,
    onLoad,
}: LazyImageProps) {
    const [imageSrc, setImageSrc] = useState(placeholderSrc || src);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            onLoad?.();
        };

        img.onerror = () => {
            setIsLoading(false);
        };
    }, [src, onLoad]);

    return (
        <div className="relative overflow-hidden">
            <img
                src={imageSrc}
                alt={alt}
                className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'
                    }`}
                loading="lazy"
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
        </div>
    );
}

// Optimized image URL helper
export function getOptimizedImageUrl(
    url: string,
    options?: {
        width?: number;
        height?: number;
        quality?: number;
    }
): string {
    const { width = 800, height, quality = 75 } = options || {};

    // For Unsplash images
    if (url.includes('unsplash.com')) {
        const params = new URLSearchParams();
        params.set('w', width.toString());
        if (height) params.set('h', height.toString());
        params.set('q', quality.toString());
        params.set('auto', 'format');
        params.set('fit', 'crop');

        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${params.toString()}`;
    }

    // For other images, return as-is
    return url;
}
