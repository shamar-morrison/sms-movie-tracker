import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function showAuthToast() {
  return toast.error("Please sign in to add movies to your collection", {
    description: "You need to be signed in to use this feature",
    action: {
      label: "Sign In",
      onClick: () => {
        document
          .querySelector<HTMLElement>(
            'button:has(.cl-userButtonTrigger), button:contains("Sign In")',
          )
          ?.click()
      },
    },
  })
}
