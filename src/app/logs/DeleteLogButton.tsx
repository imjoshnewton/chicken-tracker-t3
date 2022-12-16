"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteLogButton({ id }: { id: string }) {
  const router = useRouter();
  async function deleteLog(id: string): Promise<Response> {
    return fetch(`/api/logs?id=${id}`, { method: "DELETE" });
  }

  return (
    <button
      className='bg-red-500 text-white hover:shadow-lg hover:cursor-pointer rounded py-1 px-2'
      onClick={async () => {
        try {
          console.log("Deleting log: ", id);

          const res = await deleteLog(id);
          console.log("Response: ", res);

          toast.success("Log deleted!");
          router.refresh();
        } catch (error) {
          toast.error(`Error: ${error}`);
        }
      }}>
      Delete
    </button>
  );
}
