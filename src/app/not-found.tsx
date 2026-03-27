import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="neo-card p-12 text-center max-w-lg">
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3
                     bg-accent-primary hover:bg-accent-primary-hover
                     text-white font-medium rounded-lg
                     transition-all duration-200
                     neo-raised-sm hover:neo-glow-hover"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
