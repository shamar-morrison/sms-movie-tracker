"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"

export function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">MovieTracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/search">Search</Link>
          </Button>
          {isSignedIn ? (
            <Button asChild variant="default">
              <Link href="/profile">Profile</Link>
            </Button>
          ) : (
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
