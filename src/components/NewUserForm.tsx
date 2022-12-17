import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MdImage } from "react-icons/md";
import { storage } from "../lib/firebase";
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
    defaultValues: { name: user.name || "", image: "", imageFile: null as any },
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState; // TO-DO: embed errors if they exist in the page

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  const updateUser = trpc.auth.updateUser.useMutation({
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
      <div>
        {/* <ImageUploader /> */}

        <fieldset className="mb-3">
          {uploading ? (
            <>
              <Loader show={true} />
              <h3>{progress}%</h3>
            </>
          ) : (!uploading && downloadURL) || user.image ? (
            <img
              src={downloadURL ? downloadURL : user.image!}
              width="100"
              height="100"
              className="flock-image"
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
              {...register("imageFile")}
            />
          </label>
          <p
            className="mt-1 text-sm text-gray-500 dark:text-gray-300"
            id="file_input_help"
          >
            SVG, PNG, JPG or GIF (MAX. 850kb).
          </p>
        </fieldset>

        <fieldset className="mb-3">
          <label>Name</label>
          <input
            className="w-full appearance-none rounded border py-2 px-1 text-black"
            // name='name'
            type="text"
            {...register("name")}
          />
        </fieldset>

        <div className="mt-4 flex items-center">
          <button
            type="submit"
            className="btn mb-1 mr-3 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all hover:shadow-lg focus:outline-none md:w-auto"
            disabled={!isDirty || !isValid}
          >
            Update Profile
          </button>
        </div>
      </div>
    </form>
  );
}
