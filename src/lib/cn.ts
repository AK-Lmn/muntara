import { clsx, type ClassValue } from 'clsx'

/** Small classname-join helper, kept separate so it's easy to swap for tailwind-merge later if class conflicts show up. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
