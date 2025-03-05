import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder="Search by title, actor, director, or genre..." className="w-full pl-8" />
    </div>
  )
}

