"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs"
import Link from "next/link"

export function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">MovieTracker</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/discover">Discover</Link>
            </Button>
            {isSignedIn && (
              <Button asChild variant="ghost">
                <Link href="/collection">My Collection</Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/search">Search</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton>
                <Button variant="default">Sign In</Button>
              </SignInButton>
            )}
          </div>
          <div className="sm:hidden">
            {isSignedIn ? (
              <Button asChild variant="default" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
            ) : (
              <SignInButton>
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
