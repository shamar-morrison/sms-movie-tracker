import SearchTabs from "@/components/search-tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Search Movies | MovieTracker",
  description: "Search for movies by title, person, or genre",
}

export default function SearchPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:opacity-75 transition-opacity">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Search</h1>
        </div>
        <ThemeToggle />
      </div>
      <SearchTabs />
    </div>
  )
}
