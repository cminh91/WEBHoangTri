// Type declaration for Next.js
import 'next'

declare module 'next' {
  interface PageProps {
    params?: Promise<any> | any
    searchParams?: Promise<any> | any
  }
} 