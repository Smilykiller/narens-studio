"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-sand-bg text-sand-text flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-serif mb-4">Something went wrong</h2>
        <p className="text-sand-muted mb-8">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-sand-surface text-sand-text rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full py-4 bg-black/5 text-sand-text rounded-xl font-bold hover:bg-black/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
