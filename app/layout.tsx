import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Movie Tracker",
  description: "Track and discover your favorite movies",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
