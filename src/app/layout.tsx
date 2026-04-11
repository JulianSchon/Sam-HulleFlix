import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sam-Hulle-Flix',
  description: 'Classic franchise cinema tracker',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="min-h-screen bg-cinema-bg text-white antialiased">
        <Providers session={session}>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
