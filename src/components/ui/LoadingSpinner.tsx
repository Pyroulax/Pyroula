export default function LoadingSpinner({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-orange-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin"></div>
      </div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-gray-900 border border-white/10 animate-pulse">
          <div className="aspect-[2/3] bg-gray-800"></div>
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export function GameCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-gray-900 border border-white/10 animate-pulse">
          <div className="aspect-[16/10] bg-gray-800"></div>
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}
