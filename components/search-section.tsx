"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchSection() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  const genreParam = searchParams.get('genre')
  
  const [selectedGenre, setSelectedGenre] = useState<string | null>(genreParam || null)

  const popularGenres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
  ]

  const handleGenreSelect = (genreId: number, genreName: string) => {
    setSelectedGenre(genreName)
    
    const params = new URLSearchParams(searchParams)
    params.set('genreId', genreId.toString())
    params.set('genre', genreName)
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  const clearGenreFilter = () => {
    setSelectedGenre(null)
    
    const params = new URLSearchParams(searchParams)
    params.delete('genreId')
    params.delete('genre')
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button asChild variant="outline">
        <Link href="/search">Advanced Search</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            {selectedGenre || "Filter by Genre"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {selectedGenre && (
            <DropdownMenuItem onClick={clearGenreFilter}>
              Clear filter
            </DropdownMenuItem>
          )}
          {popularGenres.map((genre) => (
            <DropdownMenuItem key={genre.id} onClick={() => handleGenreSelect(genre.id, genre.name)}>
              {genre.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem asChild>
            <Link href="/search?tab=genre">More genres...</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

