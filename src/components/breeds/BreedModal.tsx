"use client";

import { Breed } from "@prisma/client";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { MdImage, MdOutlineDelete } from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";
import { storage } from "../../lib/firebase";
import { trpc } from "../../utils/trpc";
import Loader from "../shared/Loader";

const BreedModal = ({
  flockId,
  closeModal,
  breed,
  user,
}: {
  flockId: string | undefined;
  closeModal: any;
  breed: Breed | null;
  user:
    | ({
        id: string;
      } & {
        name?: string | null | undefined;
        email?: string | null | undefined;
        image?: string | null | undefined;
      })
    | undefined;
}) => {
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { ...breed, image: null as any, flockId: flockId },
    mode: "onChange",
  });
  const utils = trpc.useContext();

  const { mutateAsync: createNewBreed, isLoading: creatingBreed } =
    trpc.breeds.createBreed.useMutation({
      onSuccess: () => {
        toast.success("New breed created!");
        invalidateAllFlockPageQueries();
      },
    });

  const { mutateAsync: updateBreed, isLoading: updatingBreed } =
    trpc.breeds.updateBreed.useMutation({
      onSuccess: () => {
        toast.success("Breed updated!");
        invalidateAllFlockPageQueries();
      },
    });

  const { mutateAsync: deleteBreed, isLoading: deletingBreed } =
    trpc.breeds.deleteBreed.useMutation({
      onSuccess: () => {
        toast.success("Breed deleted!");
        invalidateAllFlockPageQueries();
      },
    });

  const dropIn = {
    hidden: {
      y: "-100vh",
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
      y: "-100vh",
      opacity: 0,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
  };

  function invalidateAllFlockPageQueries() {
    utils.flocks.getFlock.invalidate();
    utils.stats.getStats.invalidate();
    utils.logs.getLogs.invalidate();
  }

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch: ", value, name, type);

      if (name == "image" && type == "change") {
        if (value.image[0].size < 850000) {
          uploadFile(value.image);
        } else {
          toast.error("Image file is too large! Try another image.");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const uploadFile = async (e: any) => {
    // Get the file
    const file: any = Array.from(e)[0];
    const extension = file.type.split("/")[1];

    // Makes reference to the storage bucket location
    const uploadRef = ref(
      storage,
      `uploads/${user?.id}/${
        breed ? breed.id : file.name.split(".")[0]
      }.${extension}`
    );
    setUploading(true);

    // Starts the upload
    const task = uploadBytesResumable(uploadRef, file);

    // Listen to updates to upload task
    task.on("state_changed", (snapshot) => {
      const pct = (
        (snapshot.bytesTransferred / snapshot.totalBytes) *
        100
      ).toFixed(0);
      setProgress(Number(pct));
    });

    // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
    task
      .then((d) => getDownloadURL(uploadRef))
      .then((url) => {
        if (typeof url == "string") {
          setDownloadURL(url);
          setUploading(false);
        }
        // handler(downloadURL);
      });
  };

  async function createOrUpdateBreed(breedData: Partial<Breed>) {
    console.log("Data: ", breedData);

    if (breedData.flockId && !breedData.id) {
      await createNewBreed({
        flockId: breedData.flockId,
        name: breedData.name!,
        breed: breedData.breed!,
        description: breedData.description ? breedData.description : "",
        imageUrl: downloadURL
          ? downloadURL
          : breedData.imageUrl
          ? breedData.imageUrl
          : "",
        averageProduction: Number(breedData.averageProduction!),
        count: Number(breedData.count!),
      });
      closeModal();
    } else if (breedData.flockId && breedData.id) {
      await updateBreed({
        id: breedData.id,
        flockId: breedData.flockId,
        name: breedData.name!,
        breed: breedData.breed!,
        description: breedData.description ? breedData.description : "",
        imageUrl: downloadURL
          ? downloadURL
          : breedData.imageUrl
          ? breedData.imageUrl
          : "",
        averageProduction: Number(breedData.averageProduction!),
        count: Number(breedData.count!),
      });
      closeModal();
    } else {
      console.log(
        "Not enough data provided to update or delete breed: ",
        breedData
      );
    }
  }

  async function deleteBreedClick(id: string) {
    if (confirm(`Are you sure you want to delete this breed?`)) {
      await deleteBreed({ id });
      closeModal();
    }
  }

  return (
    <>
      <motion.div
        onClick={() => closeModal()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          variants={dropIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative my-6 mx-auto w-auto min-w-[350px] max-w-3xl"
        >
          <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
            <div className="flex items-center justify-between rounded-t border-b border-solid border-gray-300 p-5 ">
              <h3 className="font=semibold text-xl">
                {breed?.id ? "Edit Breed" : "Add Birds"}
              </h3>
              {breed?.id ? (
                <button
                  onClick={() => deleteBreedClick(breed?.id)}
                  className=" rounded p-3 text-xl text-red-600 hover:bg-slate-50 hover:shadow"
                >
                  <MdOutlineDelete />
                </button>
              ) : null}
            </div>
            <div className="relative flex-auto">
              <form
                className="w-full px-8 pt-6 pb-8"
                onSubmit={handleSubmit(createOrUpdateBreed)}
              >
                <fieldset className="mb-3">
                  {uploading ? (
                    <Loader show={true} />
                  ) : (!uploading && downloadURL) || breed?.imageUrl ? (
                    <Image
                      src={downloadURL ? downloadURL : breed!.imageUrl!}
                      alt="Breed Image"
                      width="100"
                      height="100"
                      className="aspect-square rounded object-cover"
                    />
                  ) : (
                    <></>
                  )}
                  <label
                    className="mt-3 inline-flex items-center rounded bg-gray-400 px-3 py-2 text-white hover:cursor-pointer hover:bg-gray-500"
                    htmlFor="image"
                  >
                    <MdImage />
                    &nbsp;Upload image
                    <input
                      className="hidden"
                      aria-describedby="file_input_help"
                      id="image"
                      type="file"
                      accept="image/x-png,image/gif,image/jpeg"
                      {...register("image")}
                    />
                  </label>
                  <p
                    className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                    id="file_input_help"
                  >
                    SVG, PNG, JPG or GIF (MAX. 850kb).
                  </p>
                </fieldset>
                <label className="mb-1 block text-sm font-bold text-black">
                  Name
                </label>
                <input
                  className="w-full appearance-none rounded border py-2 px-1 text-black"
                  required
                  {...register("name")}
                  type="text"
                />

                <label className="mb-1 block text-sm font-bold text-black">
                  Breed
                </label>
                <input
                  className="w-full appearance-none rounded border py-2 px-1 text-black"
                  required
                  {...register("breed")}
                  type="text"
                />
                <label className="mb-1 block text-sm font-bold text-black">
                  Description
                </label>
                <input
                  className="w-full appearance-none rounded border py-2 px-1 text-black"
                  {...register("description")}
                  type="text"
                />
                <label className="mb-1 mt-2 block text-sm font-bold text-black">
                  Count
                </label>
                <input
                  className="w-full appearance-none rounded border py-2 px-1 text-black"
                  required
                  {...register("count")}
                  type="text"
                />
                <label className="mb-1 mt-2 block text-sm font-bold text-black">
                  Average Weekly Production
                </label>
                <input
                  className="w-full appearance-none rounded border py-2 px-1 text-black"
                  required
                  {...register("averageProduction")}
                  type="text"
                />
              </form>
            </div>
            <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-6">
              <button
                className="background-transparent mr-1 mb-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
                type="button"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className="mr-1 mb-1 rounded bg-secondary px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
                type="submit"
                disabled={updatingBreed || deletingBreed || creatingBreed}
                onClick={handleSubmit(createOrUpdateBreed)}
              >
                {updatingBreed || deletingBreed || creatingBreed ? (
                  <RiLoader4Fill className="animate-spin text-2xl" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default BreedModal;
