export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-brand-600 animate-spin"></div>
            </div>
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
        </div>
    );
}
