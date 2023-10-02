"use client";

import Card from "@components/shared/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center p-0 lg:p-8 lg:px-[3.5vw]">
      <Card title="Oops!" className="max-w-xl shadow-xl">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h2 className="text-2xl">Something went wrong!</h2>
          <p className="max-w-md">
            An error occured while trying to load this page. It's probably
            nothng serious... You can click the button below to reload and try
            again.
          </p>
          <div className="p-1" />
          <button
            className="btn h-10 w-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none md:w-auto"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </Card>
    </main>
  );
}
