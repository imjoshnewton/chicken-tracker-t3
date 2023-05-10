"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";

export default function Pagination({ totalPages }: { totalPages?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  const curParams = new URLSearchParams(searchParams ? searchParams : "");
  const page = parseInt(curParams.get("page") || "0");

  const nextPage = () => {
    curParams.set("page", String(page + 1));
    router.push(`${path}?${curParams.toString()}`);
  };
  const prevPage = () => {
    curParams.set("page", String(page - 1));
    router.push(`${path}?${curParams.toString()}`);
  };
  const firstPage = () => {
    curParams.set("page", String(0));
    router.push(`${path}?${curParams.toString()}`);
  };
  const lastPage = () => {
    if (!totalPages) return;

    curParams.set("page", String(totalPages - 1));
    router.push(`${path}?${curParams.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* {page > 0 && ( */}
      <div className="flex">
        <button
          onClick={firstPage}
          disabled={!(page > 0)}
          className={`${!(page > 0) ? "opacity-40" : ""}`}
        >
          <MdFirstPage className="text-2xl" />
        </button>
        <button
          onClick={prevPage}
          disabled={!(page > 0)}
          className={`${!(page > 0) ? "opacity-40" : ""}`}
        >
          <MdChevronLeft className="text-2xl" />
        </button>
      </div>
      {/* )} */}
      {totalPages && (
        <small>
          Page {page + 1} of {totalPages}
        </small>
      )}
      <div className="flex">
        <button onClick={nextPage}>
          <MdChevronRight className="text-2xl" />
        </button>
        <button onClick={lastPage}>
          <MdLastPage className="text-2xl" />
        </button>
      </div>
    </div>
  );
}
