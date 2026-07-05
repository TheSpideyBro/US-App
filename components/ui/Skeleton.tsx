export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-white/10">
      <div className="skeleton h-4 w-20 rounded mb-3" />
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-3 w-3/4 rounded mb-2" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return <div className={`skeleton h-4 ${width} rounded`} />;
}

export function SkeletonAvatar({ size = 10 }: { size?: number }) {
  return (
    <div
      className="skeleton rounded-full"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
