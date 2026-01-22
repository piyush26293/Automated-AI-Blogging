import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Blog Platform - Automated Content Generation',
  description: 'Zero-touch AI-powered blogging platform with automated content generation',
  keywords: 'AI blog, automated blogging, content generation, AI writing',
  authors: [{ name: 'AI Blog Platform' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'AI Blog Platform',
    description: 'Zero-touch AI-powered blogging platform',
    siteName: 'AI Blog Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Blog Platform',
    description: 'Zero-touch AI-powered blogging platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-primary-600">
                  AI Blog
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-700 hover:text-primary-600">
                  Home
                </a>
                <a href="/admin" className="text-gray-700 hover:text-primary-600">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">AI Blog Platform</p>
              <p className="text-gray-400">
                Powered by AI - Zero-touch content generation
              </p>
              <p className="text-gray-500 mt-4">
                © {new Date().getFullYear()} AI Blog Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
