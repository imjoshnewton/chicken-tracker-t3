"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { deleteExpense } from "../server";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await toast
          .promise(deleteExpense(id), {
            loading: "Deleting log",
            success: "Log deleted successfully",
            error: "Something went wrong",
          })
          .finally(() => setLoading(false));
        // setLoading(false);
      }}
    >
      {loading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </button>
  );
}
