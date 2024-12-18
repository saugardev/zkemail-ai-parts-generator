import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              ZK Email Blueprint AI Generator
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">
              Docs
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
