import { Button } from "@/components/ui/button"
import { Clock, Film, Search } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Track Your Movie Journey
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover new films, build your collection, and keep track of what
          you've watched.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center p-6 bg-muted/50 rounded-lg">
            <Search className="h-10 w-10 mb-3 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Discover</h2>
            <p className="text-muted-foreground mb-4">
              Find new movies based on your interests
            </p>
            <Button asChild className="mt-auto">
              <Link href="/discover">Browse Movies</Link>
            </Button>
          </div>

          <div className="flex flex-col items-center p-6 bg-muted/50 rounded-lg">
            <Film className="h-10 w-10 mb-3 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Collection</h2>
            <p className="text-muted-foreground mb-4">
              Save and organize your favorite movies
            </p>
            <Button asChild className="mt-auto">
              <Link href="/collection">View Collection</Link>
            </Button>
          </div>

          <div className="flex flex-col items-center p-6 bg-muted/50 rounded-lg">
            <Clock className="h-10 w-10 mb-3 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              Track and get notified about upcoming releases
            </p>
            <Button asChild disabled variant="secondary" className="mt-auto">
              <Link href="#">Coming Soon</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
