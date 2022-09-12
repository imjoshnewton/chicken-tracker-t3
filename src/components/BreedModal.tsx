import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { trpc } from "../utils/trpc";
import { Breed } from "@prisma/client";
import Loader from "./Loader";
import { useUserData } from "../libs/hooks";
import { storage } from "../libs/firebase";
import { toast } from "react-hot-toast";
import { MdImage, MdOutlineDelete } from "react-icons/md";

const BreedModal = ({
  flockId,
  show,
  closeModal,
  breed,
}: {
  flockId: string | undefined;
  show: boolean;
  closeModal: any;
  breed: Breed | null;
}) => {
  const { user } = useUserData();
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { ...breed, image: null as any, flockId: flockId },
    mode: "onChange",
  });
  const utils = trpc.useContext();

  const createNewBreed = trpc.useMutation(["breeds.createBreed"], {
    onSuccess: () => {
      toast.success("New breed created!");
      invalidateAllFlockPageQueries();
    },
  });

  const updateBreed = trpc.useMutation(["breeds.updateBreed"], {
    onSuccess: () => {
      toast.success("Breed updated!");
      invalidateAllFlockPageQueries();
    },
  });

  const deleteBreed = trpc.useMutation(["breeds.deleteBreed"], {
    onSuccess: () => {
      toast.success("Breed deleted!");
      invalidateAllFlockPageQueries();
    },
  });

  function invalidateAllFlockPageQueries() {
    utils.invalidateQueries(["flocks.getFlock"]);
    utils.invalidateQueries(["stats.getStats"]);
    utils.invalidateQueries(["logs.getLogs"]);
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
      createNewBreed.mutate({
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
      updateBreed.mutate({
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
      deleteBreed.mutate({ id });
      closeModal();
    }
  }

  return (
    <>
      {show ? (
        <>
          <div className='flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none modal-overlay'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl min-w-[350px]'>
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-center justify-between p-5 border-b border-solid border-gray-300 rounded-t '>
                  <h3 className='text-xl font=semibold'>
                    {breed?.id ? "Edit Breed" : "Add Chickens"}
                  </h3>
                  {breed?.id ? (
                    <button
                      onClick={() => deleteBreedClick(breed?.id)}
                      className=' text-xl text-red-600 hover:bg-slate-50 p-3 hover:shadow rounded'>
                      <MdOutlineDelete />
                    </button>
                  ) : null}
                </div>
                <div className='relative flex-auto'>
                  <form
                    className='px-8 pt-6 pb-8 w-full'
                    onSubmit={handleSubmit(createOrUpdateBreed)}>
                    <fieldset className='mb-3'>
                      {uploading ? (
                        <Loader show={true} />
                      ) : (!uploading && downloadURL) || breed?.imageUrl ? (
                        <img
                          src={downloadURL ? downloadURL : breed!.imageUrl!}
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
                    <label className='block text-black text-sm font-bold mb-1'>
                      Name
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      required
                      {...register("name")}
                      type='text'
                    />

                    <label className='block text-black text-sm font-bold mb-1'>
                      Breed
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      required
                      {...register("breed")}
                      type='text'
                    />
                    <label className='block text-black text-sm font-bold mb-1'>
                      Description
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      {...register("description")}
                      type='text'
                    />
                    <label className='block text-black text-sm font-bold mb-1 mt-2'>
                      Count
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      required
                      {...register("count")}
                      type='text'
                    />
                    <label className='block text-black text-sm font-bold mb-1 mt-2'>
                      Average Weekly Production
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      required
                      {...register("averageProduction")}
                      type='text'
                    />
                  </form>
                </div>
                <div className='flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-black background-transparent uppercase px-6 py-3 text-sm outline-none focus:outline-none mr-1 mb-1 hover:bg-slate-50 rounded'
                    type='button'
                    onClick={closeModal}>
                    Close
                  </button>
                  <button
                    className='text-white bg-secondary font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                    type='submit'
                    onClick={handleSubmit(createOrUpdateBreed)}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default BreedModal;
