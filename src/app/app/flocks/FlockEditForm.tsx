"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
// import type { Breed, Flock } from "@prisma/client";
import type { Breed, Flock } from "@lib/db/schema-postgres";
import { storage } from "@lib/firebase";
import { trpc } from "@utils/trpc";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Image from "next/image";
import toast from "react-hot-toast";
import { MdImage, MdOutlineDelete } from "react-icons/md";
import Loader from "../../../components/shared/Loader";
import { createFlock, deleteFlock, updateFlock } from "../../../actions/flocks.actions";
import { Button } from "@components/ui/button";
import { useMutation } from "@tanstack/react-query";

export default function FlockForm({
  flock,
  userId,
  onComplete,
  onCancel,
  onDelete,
}: {
  flock: Flock & {
    breeds: Breed[];
  };
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const { register, handleSubmit, formState, watch } = useForm({
    defaultValues: { ...flock, image: null as any, default: false },
    mode: "onChange",
  });

  const { isValid, isDirty } = formState; // TO-DO: embed errors if they exist in the page

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  const utils = trpc.useContext();

  const updateFlockMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      description: string;
      type: string;
      imageUrl: string;
    }) => updateFlock(data),
    onSuccess: async (data: { id: string; name: string }) => {
      await utils.flocks.invalidate();
      toast.success(`${data.name} updated successfully!!`);
      if (onComplete) onComplete();
      else router.push(`/app/flocks/${data.id}`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  const createFlockMutation = useMutation({
    mutationFn: (data: {
      userId: string;
      name: string;
      description: string;
      type: string;
      imageUrl: string;
    }) => createFlock(data),
    onSuccess: (data: { id: string; name: string }) => {
      utils.flocks.invalidate();
      toast.success(`${data.name} created successfully!`);
      if (onComplete) onComplete();
      else router.push(`/app/flocks/${data.id}`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  const deleteFlockMutation = useMutation({
    mutationFn: (data: { flockId: string }) => deleteFlock(data),
    onSuccess: (data: { name: string }) => {
      utils.flocks.invalidate();
      toast.success(`${data.name} deleted successfully!`);
      if (onDelete) onDelete();
      else router.push(`/app/flocks`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  // TO-DO: move this to the libs folder
  const uploadFile = useCallback(
    async (e: any) => {
      // Get the file
      const file: any = Array.from(e)[0];
      const extension = file.type.split("/")[1];

      // Makes reference to the storage bucket location
      const uploadRef = ref(
        storage,
        `uploads/${userId}/${flock.id}.${extension}`,
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
        .then(() => getDownloadURL(uploadRef))
        .then((url) => {
          if (typeof url == "string") {
            setDownloadURL(url);
            setUploading(false);
          }
          // handler(downloadURL);
        });
    },
    [flock.id, userId],
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch: ", value, name, type);

      if (name == "image" && type == "change") {
        uploadFile(value.image);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, uploadFile]);

  const createOrUpdateFlock = (
    flockData: Flock & { breeds: Breed[] } & { default: boolean },
  ) => {
    console.log(
      "Data: ",
      flockData.name,
      flockData.description,
      flockData.type,
      flockData.imageUrl,
      downloadURL,
    );

    if (flockData.id) {
      updateFlockMutation.mutate({
        id: flockData.id,
        name: flockData.name,
        description: flockData.description ? flockData.description : "",
        type: flockData.type,
        imageUrl: downloadURL ? downloadURL : flockData.imageUrl ?? "",
      });
    } else {
      createFlockMutation.mutate({
        userId: userId,
        name: flockData.name,
        description: flockData.description ? flockData.description : "",
        type: flockData.type,
        imageUrl: downloadURL ? downloadURL : flockData.imageUrl ?? "",
      });
    }
  };

  const deleteCurrentFlock = async (flockId: string) => {
    deleteFlockMutation.mutate({ flockId });
  };

  return (
    <form
      onSubmit={handleSubmit(createOrUpdateFlock)}
      className="flex flex-auto flex-col"
    >
      <div className="flex w-full flex-col gap-4 p-4 lg:px-8 lg:pb-8 lg:pt-6">
        {/* <ImageUploader /> */}

        <fieldset className="mb-0">
          {uploading ? (
            <>
              <Loader show={true} />
              <h3>{progress}%</h3>
            </>
          ) : (!uploading && downloadURL) || flock?.imageUrl ? (
            <Image
              src={downloadURL ? downloadURL : flock!.imageUrl!}
              alt="New Flock Image"
              width="100"
              height="100"
              className="flock-image aspect-square object-cover"
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

        <fieldset className="mb-0">
          {/* <label>Name</label> */}
          <input
            className="w-full appearance-none rounded border px-1 py-2 text-black"
            placeholder="Name"
            // name='name'
            type="text"
            {...register("name")}
          />
        </fieldset>
        <fieldset className="mb-0">
          {/* <label>Description</label> */}
          <input
            className="w-full appearance-none rounded border px-1 py-2 text-black"
            // name='description'
            placeholder="Description"
            type="text"
            {...register("description")}
          />
        </fieldset>
        {/* <fieldset className="mb-0">
          <label>Make default:&nbsp;</label>
          <input type="checkbox" {...register("default")}></input>
        </fieldset> */}
        <fieldset className="mb-0">
          {/* <label>Type:&nbsp;</label> */}
          <select {...register("type")} defaultValue="">
            <option value="" disabled>
              Type
            </option>
            <option value="egg-layers">Egg Layers</option>
            <option value="meat-birds">Meat Birds</option>
          </select>
        </fieldset>
      </div>
      <div className="border-blueGray-200 mt-auto flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
        {flock.id && (
          <>
            <button
              type="button"
              onClick={() => {
                deleteCurrentFlock(flock.id);
              }}
              className="mr-auto rounded p-3 text-xl text-red-600 hover:bg-slate-50 hover:shadow"
            >
              <MdOutlineDelete />
            </button>
            <Button
              variant="ghost"
              onClick={() => {
                if (onCancel) onCancel();
                else router.push(`/app/flocks/${flock.id}`);
              }}
            >
              Cancel
            </Button>
          </>
        )}
        <Button
          type="submit"
          variant="secondary"
          disabled={!isDirty || !isValid}
        >
          {flock.id ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}
