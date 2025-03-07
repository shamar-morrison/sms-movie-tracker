"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ReactNode } from "react"
import { Toaster } from "sonner"

// Initialize the Convex client
const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  "https://insightful-puffin-351.convex.cloud"
const convex = new ConvexReactClient(convexUrl)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
      <Toaster richColors />
    </>
  )
}
