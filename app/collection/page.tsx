import { Metadata } from "next"
import CollectionClient from "./collection-client"

export const metadata: Metadata = {
  title: "My Collection | Movie Tracker",
  description: "View and manage your movie collection",
}

export default function CollectionPage() {
  return <CollectionClient />
}
