"use client";

export default function ErrorOrWarning({
  error,
  warning,
}: {
  error?: string;
  warning?: string;
}) {
  return (
    <>
      {error && (
        <div className="bg-red-400 text-white rounded-md p-2 max-w-lg">
          Error: {error}
        </div>
      )}
      {warning && (
        <div className="bg-yellow-400 text-black rounded-md p-2 max-w-lg">
          <strong>Warning:</strong> {warning}
        </div>
      )}
    </>
  );
}
