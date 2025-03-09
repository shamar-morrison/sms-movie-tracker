"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Navbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">MovieTracker</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant={pathname === "/discover" ? "default" : "ghost"}
            >
              <Link href="/discover">Discover</Link>
            </Button>
            {isSignedIn && (
              <Button
                asChild
                variant={pathname === "/collection" ? "default" : "ghost"}
              >
                <Link href="/collection">My Collection</Link>
              </Button>
            )}
            <Button
              asChild
              variant={pathname === "/search" ? "default" : "ghost"}
            >
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
              <UserButton />
            ) : (
              <SignInButton>
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <SheetHeader>
                  <SheetTitle className="text-left">MovieTracker</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-6">
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant={pathname === "/discover" ? "default" : "ghost"}
                      className="justify-start"
                    >
                      <Link href="/discover">Discover</Link>
                    </Button>
                  </SheetClose>
                  {isSignedIn && (
                    <SheetClose asChild>
                      <Button
                        asChild
                        variant={
                          pathname === "/collection" ? "default" : "ghost"
                        }
                        className="justify-start"
                      >
                        <Link href="/collection">My Collection</Link>
                      </Button>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant={pathname === "/search" ? "default" : "ghost"}
                      className="justify-start"
                    >
                      <Link href="/search">Search</Link>
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
