import { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
import { MdOutlineEditNote } from "react-icons/md";
import { Breed } from "@prisma/client";

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
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { ...breed, image: null as any, flockId: flockId },
    mode: "onChange",
  });
  const utils = trpc.useContext();

  const createNewBreed = trpc.useMutation(["breeds.createBreed"], {
    onSuccess: () => {
      utils.invalidateQueries(["flocks.getFlock"]);
      utils.invalidateQueries(["stats.getStats"]);
      utils.invalidateQueries(["logs.getLogs"]);
    },
  });

  // const createNewBreed = (data: any) => console.log("Create New: ", data);
  const updateBreed = (data: any) => console.log("Update: ", data);

  // trpc.useMutation(["flocks.createLog"], {
  //   onSuccess: () => {
  //     utils.invalidateQueries("flocks.getStats");
  //   },
  // });

  async function createOrUpdateBreed(breedData: Partial<Breed>) {
    // console.log("breedData: ", breedData);

    if (breedData.flockId && !breedData.id) {
      createNewBreed.mutate({
        flockId: breedData.flockId,
        name: breedData.name!,
        description: breedData.description ? breedData.description : "",
        imageUrl: breedData.imageUrl ? breedData.imageUrl : "",
        averageProduction: Number(breedData.averageProduction!),
        count: Number(breedData.count!),
      });
      reset();
      closeModal();
    } else if (breedData.flockId && breedData.id) {
      updateBreed(breedData);
    }
  }

  return (
    <>
      {show ? (
        <>
          <div className='flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none modal-overlay'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl min-w-[350px]'>
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t '>
                  <h3 className='text-xl font=semibold'>New Log Entry</h3>
                </div>
                <div className='relative flex-auto'>
                  <form
                    className='px-8 pt-6 pb-8 w-full'
                    onSubmit={handleSubmit(createOrUpdateBreed)}>
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
                    className='text-black background-transparent uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1'
                    type='button'
                    onClick={closeModal}>
                    Close
                  </button>
                  <button
                    className='text-white bg-yellow-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
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
