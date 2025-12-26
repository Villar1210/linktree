export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            {/* Image skeleton */}
            <div className="w-full h-48 bg-gray-200"></div>

            {/* Content skeleton */}
            <div className="p-6 space-y-4">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>

                {/* Description lines */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>

                {/* Price */}
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>

                {/* Tags */}
                <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="border-b border-gray-100 p-4 flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonDetail() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Hero image */}
            <div className="w-full h-96 bg-gray-200 rounded-xl"></div>

            {/* Title */}
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>

            {/* Stats */}
            <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded w-24"></div>
                <div className="h-12 bg-gray-200 rounded w-24"></div>
                <div className="h-12 bg-gray-200 rounded w-24"></div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>
    );
}
