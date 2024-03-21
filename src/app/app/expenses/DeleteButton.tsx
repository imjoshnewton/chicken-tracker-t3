"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { deleteExpense } from "../server-edge";
import { Button } from "@components/ui/button";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="destructive"
      disabled={loading}
      onClick={async () => {
        setLoading(true); // TODO: use a loading state
        await toast
          .promise(deleteExpense(id), {
            loading: "Deleting log",
            success: "Log deleted successfully",
            error: "Something went wrong",
          })
          .finally(() => setLoading(false));
      }}
    >
      {loading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </Button>
  );
}
