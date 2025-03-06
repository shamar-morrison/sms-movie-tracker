import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface PersonResultsProps {
  results: any[]
  showEmptyMessage?: boolean
  onSelectPerson?: (id: string) => Promise<void>
}

export default function PersonResults({
  results,
  showEmptyMessage = true,
  onSelectPerson,
}: PersonResultsProps) {
  if (results.length === 0 && showEmptyMessage) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No results found. Try a different search.
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  const handlePersonClick = (id: string) => {
    if (onSelectPerson) {
      onSelectPerson(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((person) => (
          <div key={person.id} className="space-y-2">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                    : "/placeholder-user.svg"
                }
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{person.name}</div>
              <div className="text-sm text-muted-foreground">
                {person.known_for_department}
              </div>
            </div>
            {onSelectPerson ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handlePersonClick(person.id)}
              >
                View Movies
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/search?tab=movie&person=${person.id}`}>
                  View Movies
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
