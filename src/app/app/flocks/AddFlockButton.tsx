"use client";

import { useUserData } from "@lib/hooks";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import FlockForm from "./FlockEditForm";

const AddFlockButton = () => {
  const { user, status } = useUserData();
  const [showModal, setShowModal] = useState(false);

  const dropIn = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.15,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
  };

  function closeModal(): void {
    setShowModal(false);
  }

  return (
    <>
      <button
        className="btn mb-1 mt-4 h-10 w-full basis-full rounded bg-secondary px-4 py-2 outline-none transition-all hover:shadow-lg focus:outline-none md:basis-1/3 lg:basis-1/4 xl:w-auto xl:basis-1/5"
        type="button"
        disabled={status === "loading"}
        onClick={() => setShowModal(true)}
      >
        <MdAdd className="text-xl" /> &nbsp;Add New Flock
      </button>
      <AnimatePresence
        // Disable any initial animations on children that
        // are present when the component is first rendered
        initial={false}
      >
        {showModal && (
          <>
            <div className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none lg:items-center">
              <div onClick={() => closeModal()}>
                {/* Modal backdrop with animation */}
                {(() => {
                  const backdropProps: HTMLMotionProps<"div"> = {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                  };
                  return (
                    <motion.div {...backdropProps}>
                      <div className="relative mx-auto h-full w-full min-w-[350px] rounded-t-sm pt-4 lg:my-6 lg:h-auto lg:w-auto lg:max-w-3xl lg:rounded-lg">
                        <div onClick={(e) => e.stopPropagation()}>
                          {/* Modal content with animation */}
                          {(() => {
                            const contentProps: HTMLMotionProps<"div"> = {
                              variants: dropIn,
                              initial: "hidden",
                              animate: "visible",
                              exit: "exit"
                            };
                            return (
                              <motion.div {...contentProps}>
                                <div className="pb-safe relative flex h-full w-full flex-col border-0 bg-[#FEF9F6] shadow-lg outline-none focus:outline-none lg:h-auto lg:rounded-lg lg:pb-0">
                                  <div className="flex items-center justify-between rounded-t border-b border-solid border-gray-300 py-3 pl-4 pr-3 lg:py-3 lg:pl-5 lg:pr-3 ">
                                    <h3 className="text-xl">New Flock</h3>
                                    <button
                                      onClick={() => closeModal()}
                                      className=" rounded p-3 text-xl hover:bg-slate-50 hover:shadow"
                                    >
                                      <MdClose />
                                    </button>
                                  </div>
                                  <div className="relative flex flex-auto flex-col">
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
                                    ></FlockForm>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddFlockButton;