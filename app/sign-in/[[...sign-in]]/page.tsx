"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <SignIn
        appearance={{
          elements: {
            card: "bg-gray-100 dark:bg-gray-800 shadow-md",
            rootBox: "mx-auto",
            headerTitle: "text-gray-900 dark:text-gray-100",
            headerSubtitle: "text-gray-600 dark:text-gray-400",
            socialButtonsBlockButton:
              "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
            socialButtonsBlockButtonText: "text-gray-800 dark:text-gray-200",
            socialButtonsBlockButtonArrow: "text-gray-500",
            dividerLine: "bg-gray-300 dark:bg-gray-600",
            dividerText: "text-gray-500 dark:text-gray-400",
            formFieldLabel: "text-gray-700 dark:text-gray-300",
            formFieldInput:
              "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white",
            formButtonPrimary:
              "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
            footerActionText: "text-gray-600 dark:text-gray-400",
            footerActionLink:
              "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
            identityPreview:
              "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            identityPreviewText: "text-gray-800 dark:text-gray-200",
            identityPreviewEditButton:
              "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
          },
        }}
      />
    </div>
  )
}
