import { useState, useEffect } from "react";
import { storage } from "../../../libs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Card from "../../../components/Card";
import { useFlockData, useUserData } from "../../../libs/hooks";
import Loader from "../../../components/Loader";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Breed, Flock } from "@prisma/client";
import { trpc } from "../../../utils/trpc";

export default function Edit() {
  const { user } = useUserData();
  const { flockId, flock } = useFlockData();

  return (
    <main>
      <Card title='Edit Flock'>
        {flock && user ? (
          <FlockForm flock={flock} userId={user.id}></FlockForm>
        ) : (
          <Loader show={true} />
        )}
      </Card>
    </main>
  );
}

function FlockForm({
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
    defaultValues: { ...flock, image: null as any },
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState;

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  const utils = trpc.useContext();

  const mutation = trpc.useMutation(["flocks.updateFlock"], {
    onSuccess: () => {
      utils.invalidateQueries("flocks.getFlock");
    },
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch: ", value, name, type);

      if (name == "image" && type == "change") {
        uploadFile(value.image);
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

  const updateFlock = (flockData: Flock & { breeds: Breed[] }) => {
    console.log(
      "Data: ",
      flockData.name,
      flockData.description,
      flockData.type,
      flockData.imageUrl,
      downloadURL
    );

    mutation.mutate({
      id: flockData.id,
      name: flockData.name,
      description: flockData.description ? flockData.description : "",
      type: flockData.type,
      imageUrl: downloadURL ? downloadURL : flockData.imageUrl,
    });

    router.push(`/flocks/${flockData.id}`);
  };

  return (
    <form onSubmit={handleSubmit(updateFlock)}>
      <div>
        {/* <ImageUploader /> */}

        <fieldset className='mb-3'>
          <label
            className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            htmlFor='file_input'>
            Flock image
          </label>
          {uploading ? (
            <Loader show={true} />
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
          <input
            className='block w-full py-1 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file-input'
            aria-describedby='file_input_help'
            id='image'
            type='file'
            accept='image/x-png,image/gif,image/jpeg'
            {...register("image")}
          />
          <p
            className='mt-1 text-sm text-gray-500 dark:text-gray-300'
            id='file_input_help'>
            SVG, PNG, JPG or GIF (MAX. 200x200px).
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
        <fieldset className='mb-3'>
          <label>Type:&nbsp;</label>
          <select {...register("type")}>
            <option value='egg-layers'>Egg Layers</option>
            <option value='meat-birds'>Meat Birds</option>
          </select>
        </fieldset>

        <div className='flex items-center mt-4'>
          <button
            type='button'
            onClick={() => router.push(`/flocks/${flock.id}`)}
            className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 w-full md:w-auto h-10 mr-3 transition-all'>
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 btn w-full md:w-auto h-10 mr-3 transition-all'
            disabled={!isDirty || !isValid}>
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}
