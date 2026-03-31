import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  )
}
