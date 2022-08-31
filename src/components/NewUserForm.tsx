import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { storage } from "../libs/firebase";
import { trpc } from "../utils/trpc";
import Loader from "./Loader";

export default function NewUserForm({
  user,
}: {
  user: {
    id: string;
  } & {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
}) {
  const router = useRouter();
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { name: "", image: "", imageFile: null as any },
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState; // TO-DO: embed errors if they exist in the page

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  const utils = trpc.useContext();

  const updateUser = trpc.useMutation(["user.updateUser"], {
    onSuccess: (data) => {
      //   router.push("/auth/new-user?userUpdated=true");
      router.reload();
      toast.success("User info updated!");
    },
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log("Watch: ", value, name, type);

      if (name == "imageFile" && type == "change") {
        uploadFile(value.imageFile);
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
      `uploads/${user.id}/${user.id}.${extension}`
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

  const updateUserInformation = (data: {
    name: string;
    image: string;
    imageFile: any;
  }) => {
    console.log("Data: ", data, downloadURL);

    updateUser.mutate({
      name: data.name,
      image: downloadURL ? downloadURL : "",
    });
  };

  return (
    <form onSubmit={handleSubmit(updateUserInformation)}>
      <section>
        <h2 className='mb-3'>Welcome!</h2>
        <p className='mb-3'>
          Let&apos;s get to know you a little better...
          <br />
          Complete your profile by uploading a profile picture and letting us
          know your name.
        </p>
      </section>
      <div>
        {/* <ImageUploader /> */}

        <fieldset className='mb-3'>
          <label
            className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            htmlFor='file_input'>
            Profile image
          </label>
          {uploading ? (
            <>
              <Loader show={true} />
              <h3>{progress}%</h3>
            </>
          ) : (!uploading && downloadURL) || user.image ? (
            <img
              src={downloadURL ? downloadURL : user.image ? user.image : ""}
              width='100'
              height='100'
              className='rounded-full'
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
            {...register("imageFile")}
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

        <div className='flex items-center mt-4'>
          <button
            type='submit'
            className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 btn w-full md:w-auto h-10 mr-3 transition-all'
            disabled={!isDirty || !isValid}>
            Update Profile
          </button>
        </div>
      </div>
    </form>
  );
}
