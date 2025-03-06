import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  onClick: () => void
  isLoading: boolean
  hasMoreResults: boolean
  totalResults?: number
  loadedResults?: number
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasMoreResults,
  totalResults,
  loadedResults
}: LoadMoreButtonProps) {
  if (!hasMoreResults) return null
  
  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 mb-8">
      {totalResults && loadedResults && (
        <p className="text-sm text-muted-foreground mb-2">
          Showing {loadedResults} of {totalResults} results
        </p>
      )}
      <Button 
        variant="outline" 
        onClick={onClick} 
        disabled={isLoading || !hasMoreResults}
        className="min-w-[200px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More Results'
        )}
      </Button>
    </div>
  )
} 