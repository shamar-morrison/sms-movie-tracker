"use client"

import GenreSearch from "@/components/search/genre-search"
import MovieSearch from "@/components/search/movie-search"
import PersonSearch from "@/components/search/person-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchTabs() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "movie"
  const [activeTab, setActiveTab] = useState(tabParam)
  const router = useRouter()
  
  // Update activeTab when URL parameters change (browser navigation)
  useEffect(() => {
    setActiveTab(tabParam)
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/search?tab=${value}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="movie">Movie Title</TabsTrigger>
        <TabsTrigger value="person">Actor/Director</TabsTrigger>
        <TabsTrigger value="genre">Genre/Year</TabsTrigger>
      </TabsList>
      <TabsContent value="movie" className="space-y-6">
        <MovieSearch />
      </TabsContent>
      <TabsContent value="person" className="space-y-6">
        <PersonSearch />
      </TabsContent>
      <TabsContent value="genre" className="space-y-6">
        <GenreSearch />
      </TabsContent>
    </Tabs>
  )
}

