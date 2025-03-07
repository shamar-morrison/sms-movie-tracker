"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
