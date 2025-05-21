"use client";

import { MdOutlineEdit } from "react-icons/md";
import FlockForm from "src/app/app/flocks/FlockEditForm";
import { trpc } from "../../utils/trpc";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { ResponsiveDialog, DialogClose } from "@components/ui/responsive-dialog";

const EditModal = ({
  userId,
  flockId,
}: {
  userId: string;
  flockId: string;
}) => {
  const [open, setOpen] = useState(false);

  const {
    data: flock,
    isLoading,
    isError,
  } = trpc.flocks.getFlock.useQuery({ flockId });

  function handleClose() {
    setOpen(false);
  }

  if (!userId || !flockId || !flock) {
    return null;
  }

  const trigger = (
    <Button
      variant="ghost"
      className="flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
    >
      Edit&nbsp;&nbsp;
      <MdOutlineEdit />
    </Button>
  );

  const footer = (
    <>
      {/* Empty footer - Cancel button is in the form */}
    </>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="Edit Flock"
      footer={footer}
      contentClassName="bg-[#FEF9F6] p-0"
    >
      <div className="p-4">
        <FlockForm
          flock={{
            ...flock,
            deleted: flock.deleted,
            breeds: flock.breeds.map((breed) => {
              return {
                ...breed,
                deleted: breed.deleted,
              };
            }),
          }}
          userId={userId}
          onCancel={handleClose}
          onComplete={handleClose}
        />
      </div>
    </ResponsiveDialog>
  );
};

export default EditModal;