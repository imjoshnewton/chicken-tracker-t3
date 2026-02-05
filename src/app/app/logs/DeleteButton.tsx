"use client";

import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { deleteLog } from "../../../actions/logs.actions";
import { Button } from "@components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";

export default function DeleteButton({ id }: { id: string }) {
  const utils = trpc.useContext();

  const { mutateAsync: doDelete, isLoading } = useMutation({
    mutationFn: () => deleteLog(id),
    onSuccess: () => {
      utils.logs.invalidate();
      toast.success("Log deleted successfully");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <Button
      variant="destructive"
      disabled={isLoading}
      onClick={() => doDelete()}
    >
      {isLoading ? <RiLoader4Fill className="animate-spin text-2xl" /> : "Delete"}
    </Button>
  );
}
