import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl font-semibold text-neutral-700">404</p>
        <h1 className="mt-4 text-lg font-medium text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-foreground underline underline-offset-4 hover:text-neutral-300 transition"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
