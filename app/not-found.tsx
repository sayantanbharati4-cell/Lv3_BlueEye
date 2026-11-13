import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-black text-gold mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
      <p className="text-text3 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link prefetch={false} href="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
