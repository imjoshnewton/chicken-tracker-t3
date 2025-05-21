"use client";

import { useUserData } from "@lib/hooks";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import FlockForm from "./FlockEditForm";
import { Button } from "@components/ui/button";
import { ResponsiveDialog, DrawerClose } from "@components/ui/responsive-dialog";

const AddFlockButton = () => {
  const { user, status } = useUserData();
  const [showModal, setShowModal] = useState(false);

  // No animations needed with ResponsiveDialog

  function closeModal(): void {
    setShowModal(false);
  }

  return (
    <ResponsiveDialog
      open={showModal}
      onOpenChange={setShowModal}
      trigger={
        <Button
          className="mb-1 mt-4 h-10 w-full basis-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none md:basis-1/3 lg:basis-1/4 xl:w-auto xl:basis-1/5"
          variant="secondary"
          disabled={status === "loading"}
        >
          <MdAdd className="text-xl" /> &nbsp;Add New Flock
        </Button>
      }
      title="New Flock"
      contentClassName="bg-[#FEF9F6] p-0"
    >
      <div className="p-4">
        <FlockForm
          flock={{
            id: "",
            name: "",
            description: "",
            imageUrl: "",
            type: "",
            zip: "",
            userId: "",
            breeds: [],
            deleted: false,
          }}
          userId={(user as any)?.id ?? ""}
          onCancel={closeModal}
          onComplete={closeModal}
        />
      </div>
    </ResponsiveDialog>
  );
};

export default AddFlockButton;