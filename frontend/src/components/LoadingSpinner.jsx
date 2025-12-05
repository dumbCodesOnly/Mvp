function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  }

  return (
    <div className={`inline-block ${sizes[size]} border-purple-500/30 border-t-purple-500 rounded-full animate-spin-slow ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-gray-400 animate-pulse-slow">Loading...</p>
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-6 animate-fade-in">
          <div className="skeleton h-6 w-1/3 rounded mb-4" />
          <div className="skeleton h-10 w-2/3 rounded mb-3" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 glass-card rounded-lg">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
