import { Suspense } from 'react'
import { SearchPageContent } from './search-page-content'
import { Container } from '@/components/ui/container'
import { Spinner } from '@/components/ui/spinner'

export const metadata = {
  title: 'Search Products',
  description: 'Search for products in our store',
}

export default function SearchPage() {
  return (
    <Container className="py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </Container>
  )
}
