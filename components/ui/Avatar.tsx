interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const colors = [
  '#e91e63', '#9b59b6', '#4a90d9', '#f39c12', '#e74c3c',
  '#2ecc71', '#1abc9c', '#3498db', '#e67e22', '#95a5a6',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColor(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}
