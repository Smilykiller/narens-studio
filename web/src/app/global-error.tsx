"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-sand-bg text-sand-text flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-3xl font-serif mb-4">Critical Error</h2>
          <p className="text-sand-muted mb-8 max-w-md mx-auto">
            A critical error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-sand-surface text-sand-text font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
