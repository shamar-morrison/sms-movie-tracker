import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// Animation variants for the grid container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
    },
  },
}

// Animation variants for each person card
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

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
      <AnimatePresence mode="wait">
        <motion.div
          className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          key="person-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          layout
        >
          {results.map((person) => (
            <motion.div
              key={person.id}
              className="space-y-2"
              variants={cardVariants}
              layout
              layoutId={`person-${person.id}`}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                <Image
                  src={
                    person.profile_path
                      ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                      : "/placeholder-user.svg"
                  }
                  alt={person.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
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
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
