import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <p className="font-display text-[120px] font-semibold text-bg-4 leading-none select-none">404</p>
      <h1 className="font-display text-2xl font-semibold mt-2 mb-3">Page not found</h1>
      <p className="text-text-3 text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">← Back to home</Link>
    </div>
  );
}
