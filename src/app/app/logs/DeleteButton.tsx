"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { deleteLog } from "../server";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  // const [isPending, startTransition] = useTransition();

  return (
    <button
      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
      // onClick={() =>
      //   startTransition(() =>
      //     toast.promise(deleteLog(id), {
      //       loading: "Deleting log",
      //       success: "Log deleted successfully",
      //       error: "Something went wrong",
      //     })
      //   )
      // }
      onClick={async () => {
        setLoading(true);
        await toast.promise(deleteLog(id), {
          loading: "Deleting log",
          success: "Log deleted successfully",
          error: "Something went wrong",
        });
        // await deleteLog(id);
        setLoading(false);
      }}
      disabled={loading}
    >
      {loading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </button>
  );
}
