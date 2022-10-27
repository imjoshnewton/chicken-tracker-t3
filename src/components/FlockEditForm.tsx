import { useState, useEffect } from "react";
import { storage } from "../libs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Breed, Flock } from "@prisma/client";
import { trpc } from "../utils/trpc";
import Loader from "./Loader";
import { MdImage } from "react-icons/md";
import toast from "react-hot-toast";

export default function FlockForm({
  flock,
  userId,
}: {
  flock: Flock & {
    breeds: Breed[];
  };
  userId: string;
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

  const updateFlock = trpc.useMutation(["flocks.updateFlock"], {
    onSuccess: (data) => {
      utils.invalidateQueries("flocks.getFlock");
      router.push(`/flocks/${data.id}`);
      toast.success("Flock updated!");
    },
  });
  const createFlock = trpc.useMutation(["flocks.createFlock"], {
    onSuccess: (data) => {
      utils.invalidateQueries("flocks.getFlock");
      router.push(`/flocks/${data.id}`);
      toast.success("Flock created!");
    },
  });
  const setDefaultFlock = trpc.useMutation(["user.setDefaultFlock"]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch: ", value, name, type);

      if (name == "image" && type == "change") {
        uploadFile(value.image);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // TO-DO: move this to the libs folder
  const uploadFile = async (e: any) => {
    // Get the file
    const file: any = Array.from(e)[0];
    const extension = file.type.split("/")[1];

    // Makes reference to the storage bucket location
    const uploadRef = ref(
      storage,
      `uploads/${userId}/${flock.id}.${extension}`
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
      updateFlock.mutate({
        id: flockData.id,
        name: flockData.name,
        description: flockData.description ? flockData.description : "",
        type: flockData.type,
        imageUrl: downloadURL ? downloadURL : flockData.imageUrl,
        default: flockData.default,
      });
    } else {
      createFlock.mutate({
        name: flockData.name,
        description: flockData.description ? flockData.description : "",
        type: flockData.type,
        imageUrl: downloadURL ? downloadURL : flockData.imageUrl,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(createOrUpdateFlock)}>
      <div>
        {/* <ImageUploader /> */}

        <fieldset className='mb-3'>
          {uploading ? (
            <>
              <Loader show={true} />
              <h3>{progress}%</h3>
            </>
          ) : (!uploading && downloadURL) || flock?.imageUrl ? (
            <img
              src={downloadURL ? downloadURL : flock!.imageUrl!}
              width='100'
              height='100'
              className='flock-image'
            />
          ) : (
            <></>
          )}
          <label
            className='inline-flex items-center px-3 py-2 bg-gray-400 text-white mt-3 rounded hover:bg-gray-500 hover:cursor-pointer'
            htmlFor='image'>
            <MdImage />
            &nbsp;Upload image
            <input
              className='hidden'
              aria-describedby='file_input_help'
              id='image'
              type='file'
              accept='image/x-png,image/gif,image/jpeg'
              {...register("image")}
            />
          </label>
          <p
            className='mt-1 text-sm text-gray-500 dark:text-gray-300'
            id='file_input_help'>
            SVG, PNG, JPG or GIF (MAX. 850kb).
          </p>
        </fieldset>

        <fieldset className='mb-3'>
          <label>Name</label>
          <input
            className='appearance-none border rounded w-full py-2 px-1 text-black'
            // name='name'
            type='text'
            {...register("name")}
          />
        </fieldset>
        <fieldset className='mb-3'>
          <label>Description</label>
          <input
            className='appearance-none border rounded w-full py-2 px-1 text-black'
            // name='description'
            type='text'
            {...register("description")}
          />
        </fieldset>
        <fieldset className='mb-6'>
          <label>Make default:&nbsp;</label>
          <input type='checkbox' {...register("default")}></input>
        </fieldset>
        <fieldset className='mb-6'>
          <label>Type:&nbsp;</label>
          <select {...register("type")}>
            <option value='egg-layers'>Egg Layers</option>
            <option value='meat-birds'>Meat Birds</option>
          </select>
        </fieldset>

        <div className='flex items-center mt-4'>
          {flock.id ? (
            <button
              type='button'
              onClick={() => router.push(`/flocks/${flock.id}`)}
              className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 w-full md:w-auto h-10 mr-3 transition-all'>
              Cancel
            </button>
          ) : (
            <></>
          )}
          <button
            type='submit'
            className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 btn w-full md:w-auto h-10 mr-3 transition-all'
            disabled={!isDirty || !isValid}>
            {flock.id ? "Save Changes" : "Create Flock"}
          </button>
        </div>
      </div>
    </form>
  );
}
