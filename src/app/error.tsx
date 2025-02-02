"use client";

// This component renders whenever an error is detected in the error boundary (i.e. a network error from the world bank API.)
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center p-4 font-poppins">
      <h1 className="text-2xl text-red-600">Something went wrong!</h1>
      <p>{error.message}</p>
      <button
        className="mt-4 px-4 py-2 bg-ceruleanBlue-600 text-white rounded"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  );
}
