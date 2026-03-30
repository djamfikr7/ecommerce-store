import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="default" />
        <p className="mt-6 text-lg text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
