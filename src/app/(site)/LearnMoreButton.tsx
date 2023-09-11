"use client";

import { MdArrowDownward } from "react-icons/md";

const LearnMoreButton = () => {
  console.log("LearnMoreButton Rendered");

  const scroll = () => {
    const section = document.querySelector("#track");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <button
      className="z-0 flex flex-col items-center gap-2 capitalize transition-all"
      onClick={() => scroll()}
    >
      learn more
      <MdArrowDownward className="animate__animated animate__fadeInDown animate__infinite animate__slow" />
    </button>
  );
};

export default LearnMoreButton;
