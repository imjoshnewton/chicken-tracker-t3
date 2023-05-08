"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdAdd } from "react-icons/md";

const AddFlockButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  return (
    <button
      className="btn mr-1 mt-4 mb-1 h-10 w-full basis-full rounded bg-white px-4 py-2 outline-none transition-all hover:shadow-lg focus:outline-none md:basis-1/3 lg:basis-1/5 xl:w-auto"
      type="button"
      onClick={() => {
        const curParams = new URLSearchParams(searchParams ? searchParams : "");
        if (curParams.get("addFlock")) {
          curParams.delete("addFlock");
        } else {
          curParams.set("addFlock", "true");
        }

        router.replace(`${path}?${curParams.toString()}`);
      }}
    >
      <MdAdd className="text-2xl" /> &nbsp;Add New Flock
    </button>
  );
};

export default AddFlockButton;
