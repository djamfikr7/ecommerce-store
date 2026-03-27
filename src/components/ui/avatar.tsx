import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  className?: string
}

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const statusColors = {
  online: 'bg-accent-success',
  offline: 'bg-slate-500',
  away: 'bg-accent-warning',
  busy: 'bg-accent-danger',
}

function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'neo-raised rounded-full overflow-hidden flex items-center justify-center',
          'bg-surface-elevated text-slate-300 font-medium',
          avatarSizes[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface-base',
            'h-3 w-3',
            size === 'sm' && 'h-2 w-2',
            size === 'xl' && 'h-4 w-4',
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

export { Avatar }
