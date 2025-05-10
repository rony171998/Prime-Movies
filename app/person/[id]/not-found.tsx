import Link from "next/link"

export default function PersonNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Person Not Found</h1>
      <p className="text-xl text-zinc-400 mb-8">We couldn't find the person you're looking for.</p>
      <Link
        href="/home"
        className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}
