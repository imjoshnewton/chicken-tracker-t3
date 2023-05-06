"use client";

import { useState } from "react";
import { RiLoader4Fill } from "react-icons/ri";
import deleteLog from "./server";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
      onClick={async () => {
        setLoading(true);
        await deleteLog(id);
        setLoading(false);
      }}
    >
      {loading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </button>
  );
}
