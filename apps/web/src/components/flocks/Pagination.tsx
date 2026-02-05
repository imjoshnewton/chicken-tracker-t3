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

  const curParams = new URLSearchParams(searchParams || "");
  const page = parseInt(curParams.get("page") || "0");

  const navigateToPage = (pageNumber: number) => {
    curParams.set("page", String(pageNumber));
    router.push(`${path}?${curParams.toString()}`);
  };

  const nextPage = () => navigateToPage(page + 1);
  const prevPage = () => navigateToPage(page - 1);
  const firstPage = () => navigateToPage(0);
  const lastPage = () => totalPages && navigateToPage(totalPages - 1);

  const isPageDisabled = !(page > 0);
  const isLastPage = !!totalPages && page + 1 == totalPages;

  return (
    <div className="flex items-center justify-center gap-2 md:justify-end">
      <div className="flex">
        <IconButton
          action={firstPage}
          disabled={isPageDisabled}
          icon={<MdFirstPage className="text-2xl" />}
        />
        <IconButton
          action={prevPage}
          disabled={isPageDisabled}
          icon={<MdChevronLeft className="text-2xl" />}
        />
      </div>
      {totalPages && (
        <small>
          Page {page + 1} of {totalPages}
        </small>
      )}
      <div className="flex">
        <IconButton
          action={nextPage}
          disabled={isLastPage}
          icon={<MdChevronRight className="text-2xl" />}
        />
        <IconButton
          action={lastPage}
          disabled={isLastPage}
          icon={<MdLastPage className="text-2xl" />}
        />
      </div>
    </div>
  );
}

interface IconButtonProps {
  action: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}

const IconButton = ({ action, disabled = false, icon }: IconButtonProps) => (
  <button
    onClick={action}
    disabled={disabled}
    className={disabled ? "opacity-40" : ""}
  >
    {icon}
  </button>
);
