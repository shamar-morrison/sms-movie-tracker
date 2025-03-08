"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

// Available sort options in TMDB API
const sortOptions = [
  { value: "popularity.desc", label: "Popularity (Descending)" },
  { value: "popularity.asc", label: "Popularity (Ascending)" },
  { value: "vote_average.desc", label: "Rating (Descending)" },
  { value: "vote_average.asc", label: "Rating (Ascending)" },
  { value: "primary_release_date.desc", label: "Release Date (Descending)" },
  { value: "primary_release_date.asc", label: "Release Date (Ascending)" },
  { value: "revenue.desc", label: "Revenue (Descending)" },
  { value: "revenue.asc", label: "Revenue (Ascending)" },
]

// Popular genres in TMDB
const popularGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
]

// Year ranges for filtering
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 80 }, (_, i) => currentYear - i)

// Animation variants
const filterButtonVariants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
}

export default function DiscoverFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current filter values from URL or use defaults
  const currentSort = searchParams.get("sort_by") || "popularity.desc"
  const currentGenre = searchParams.get("genre") || ""
  const currentYearFrom =
    searchParams.get("year_from") || (currentYear - 10).toString()
  const currentYearTo = searchParams.get("year_to") || currentYear.toString()
  const currentVoteCount = searchParams.get("vote_count.gte") || "0"

  // Local state for advanced filter values
  const [yearFrom, setYearFrom] = useState(parseInt(currentYearFrom))
  const [yearTo, setYearTo] = useState(parseInt(currentYearTo))
  const [minVoteCount, setMinVoteCount] = useState(parseInt(currentVoteCount))
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    currentGenre || null,
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSortChange = (value: string) => {
    setIsUpdating(true)
    const params = new URLSearchParams(searchParams)
    params.set("sort_by", value)
    router.push(`${pathname}?${params.toString()}`)
    // Reset after a short delay to allow animation
    setTimeout(() => setIsUpdating(false), 300)
  }

  const handleGenreSelect = (genreId: number, genreName: string) => {
    setIsUpdating(true)
    setSelectedGenre(genreName)

    const params = new URLSearchParams(searchParams)
    params.set("genreId", genreId.toString())
    params.set("genre", genreName)

    router.push(`${pathname}?${params.toString()}`)
    // Reset after a short delay to allow animation
    setTimeout(() => setIsUpdating(false), 300)
  }

  const clearGenreFilter = () => {
    setIsUpdating(true)
    setSelectedGenre(null)

    const params = new URLSearchParams(searchParams)
    params.delete("genreId")
    params.delete("genre")

    router.push(`${pathname}?${params.toString()}`)
    // Reset after a short delay to allow animation
    setTimeout(() => setIsUpdating(false), 300)
  }

  const applyAdvancedFilters = () => {
    setIsUpdating(true)
    const params = new URLSearchParams(searchParams)

    params.set("year_from", yearFrom.toString())
    params.set("year_to", yearTo.toString())
    params.set("vote_count.gte", minVoteCount.toString())

    router.push(`${pathname}?${params.toString()}`)

    // Close the dialog after applying filters
    setDialogOpen(false)
    // Reset after a short delay to allow animation
    setTimeout(() => setIsUpdating(false), 300)
  }

  const resetAllFilters = () => {
    setIsUpdating(true)
    router.push(pathname)

    // Close the dialog after resetting filters
    setDialogOpen(false)
    // Reset after a short delay to allow animation
    setTimeout(() => setIsUpdating(false), 300)
  }

  const currentSortLabel =
    sortOptions.find((option) => option.value === currentSort)?.label ||
    "Sort By"

  return (
    <motion.div
      className="mb-6 space-y-4"
      layout
      transition={{
        layout: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <div className="flex flex-wrap gap-2">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={filterButtonVariants}
            >
              <Button variant="outline" className="flex items-center gap-1">
                {currentSortLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <AnimatePresence>
              {sortOptions.map((option) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem
                    onClick={() => handleSortChange(option.value)}
                    className={currentSort === option.value ? "bg-accent" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Genre Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={filterButtonVariants}
            >
              <Button variant="outline" className="flex items-center gap-1">
                {selectedGenre || "Genre"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 max-h-[300px] overflow-y-auto"
          >
            {selectedGenre && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem onClick={clearGenreFilter}>
                  Clear genre
                </DropdownMenuItem>
              </motion.div>
            )}
            <AnimatePresence>
              {popularGenres.map((genre) => (
                <motion.div
                  key={genre.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem
                    onClick={() => handleGenreSelect(genre.id, genre.name)}
                    className={selectedGenre === genre.name ? "bg-accent" : ""}
                  >
                    {genre.name}
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Filters Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={filterButtonVariants}
            >
              <Button variant="outline" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced Filters</span>
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-medium">Release Years</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      From
                    </label>
                    <Select
                      value={yearFrom.toString()}
                      onValueChange={(value) => setYearFrom(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="From Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">To</label>
                    <Select
                      value={yearTo.toString()}
                      onValueChange={(value) => setYearTo(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="To Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">Minimum Vote Count</h4>
                  <span className="text-sm text-muted-foreground">
                    {minVoteCount}
                  </span>
                </div>
                <Slider
                  value={[minVoteCount]}
                  min={0}
                  max={1000}
                  step={50}
                  onValueChange={(values) => setMinVoteCount(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="flex justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button variant="outline" onClick={resetAllFilters}>
                Reset All
              </Button>
              <Button onClick={applyAdvancedFilters}>Apply Filters</Button>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Show active filters if any */}
        <AnimatePresence>
          {(currentGenre ||
            currentYearFrom !== (currentYear - 10).toString() ||
            currentYearTo !== currentYear.toString() ||
            currentVoteCount !== "0") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              whileHover="hover"
              whileTap="tap"
              variants={filterButtonVariants}
            >
              <Button
                variant="ghost"
                onClick={resetAllFilters}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            className="h-1 bg-primary/20 w-full rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="h-1 bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: "100%",
                transition: { duration: 0.3 },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
