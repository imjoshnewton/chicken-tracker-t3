"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { deleteLog } from "../server-edge";
import { Button } from "@components/ui/button";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="destructive"
      onClick={async () => {
        setLoading(true);
        await toast
          .promise(deleteLog(id), {
            loading: "Deleting log",
            success: "Log deleted successfully",
            error: "Something went wrong",
          })
          .finally(() => setLoading(false));
      }}
      disabled={loading}
    >
      {loading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </Button>
  );
}
