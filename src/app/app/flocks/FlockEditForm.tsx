"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Breed, Flock } from "@prisma/client";
import Loader from "../../../components/shared/Loader";
import { MdImage } from "react-icons/md";
import toast from "react-hot-toast";
import Image from "next/image";
import { createFlock, updateFlock } from "../server";
import { trpc } from "@utils/trpc";

export default function FlockForm({
  flock,
  userId,
  onComplete,
  onCancel,
}: {
  flock: Flock & {
    breeds: Breed[];
  };
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { ...flock, image: null as any, default: false },
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState; // TO-DO: embed errors if they exist in the page

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  const utils = trpc.useContext();

  const createOrUpdateFlock = (
    flockData: Flock & { breeds: Breed[] } & { default: boolean }
  ) => {
    console.log(
      "Data: ",
      flockData.name,
      flockData.description,
      flockData.type,
      flockData.imageUrl,
      downloadURL
    );

    if (flockData.id) {
      toast
        .promise(
          updateFlock({
            id: flockData.id,
            name: flockData.name,
            description: flockData.description ? flockData.description : "",
            type: flockData.type,
            imageUrl: downloadURL ? downloadURL : flockData.imageUrl,
          }),
          {
            loading: `Saving flock`,
            success: (data) => `${data.name} updated successfully!!`,
            error: (err) => `This just happened: ${err.toString()}`,
          }
        )
        .then(async (flock) => {
          await utils.flocks.invalidate();
          if (onComplete) onComplete();
          else router.push(`/app/flocks/${flock.id}`);
        });
    } else {
      toast
        .promise(
          createFlock({
            userId: userId,
            name: flockData.name,
            description: flockData.description ? flockData.description : "",
            type: flockData.type,
            imageUrl: downloadURL ? downloadURL : flockData.imageUrl,
          }),
          {
            loading: `Creating flock`,
            success: (data) => `${data.name} created successfully!`,
            error: (err) => `This just happened: ${err.toString()}`,
          }
        )
        .then((flock) => {
          if (onComplete) onComplete();
          else router.push(`/app/flocks/${flock.id}`);
        });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(createOrUpdateFlock)}
      className="flex flex-auto flex-col"
    >
      <div className="flex w-full flex-col gap-4 p-4 lg:px-8 lg:pt-6 lg:pb-8">
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
            className="w-full appearance-none rounded border py-2 px-1 text-black"
            placeholder="Name"
            // name='name'
            type="text"
            {...register("name")}
          />
        </fieldset>
        <fieldset className="mb-0">
          {/* <label>Description</label> */}
          <input
            className="w-full appearance-none rounded border py-2 px-1 text-black"
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
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else router.push(`/app/flocks/${flock.id}`);
            }}
            className="background-transparent mr-1 mb-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
          >
            CANCEL
          </button>
        )}
        <button
          type="submit"
          className="btn mr-1 mb-1 rounded px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
          disabled={!isDirty || !isValid}
        >
          {flock.id ? "SAVE" : "CREATE"}
        </button>
      </div>
    </form>
  );
}
