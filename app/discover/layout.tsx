import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover Movies | Movie Tracker",
  description: "Discover new movies to add to your collection",
}

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
