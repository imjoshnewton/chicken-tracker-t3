"use client";

import Card from "@components/shared/Card";
import { format } from "date-fns";
import saveAs from "file-saver";
import { getDownloadURL, ref } from "firebase/storage";
import { useState } from "react";
import { MdSave } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";
import { storage } from "../../../../../lib/firebase";
import { RiLoader4Fill } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function FlockSummary({
  summary,
  twoDigitMonth,
}: {
  summary: {
    flock: {
      id: string;
      name: string;
      image: string;
    };
    expenses: {
      total: number;
      categories: {
        category: string;
        amount: number;
      }[];
    };
    logs: {
      total: number | null;
      numLogs: number;
      average: number | null;
      calcAvg: number;
      largest: number | null;
    };
    year: string;
    month: string;
  };
  twoDigitMonth: string;
}) {
  const router = useRouter();
  const [showExpenses, setShowExpenses] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const getFileName = (fileType: string, prefix: string) =>
    `${prefix}-${format(new Date(), "HH-mm-ss")}.${fileType}`;

  const generateImage = async () => {
    setGeneratingImage(true);
    const res = await (
      await fetch(
        "https://us-central1-chicken-tracker-83ef8.cloudfunctions.net/summary",
        {
          // Changed endpoint here
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: summary.flock.id,
            month: twoDigitMonth,
            year: summary.year,
          }),
        }
      )
    ).json();

    const imageRef = ref(storage, res.ref);

    getDownloadURL(imageRef)
      .then((url) => {
        // `url` is the download URL
        // saveAs(url, getFileName("png", `${summary.flock.name}`));
        setDownloadURL(url);
        router.push(url);
      })
      .catch((error) => {
        // Handle any errors
        console.log(error);
      })
      .finally(() => {
        setGeneratingImage(false);
      });
  };

  const downloadImage = () => {
    if (!downloadURL) {
      generateImage();
      return;
    } else {
      // saveAs(downloadURL, getFileName("png", `${summary.flock.name}`));
      router.push(downloadURL);
    }
  };

  const handleChange = () => {
    setShowExpenses(!showExpenses);
  };

  const emojis: { [x: string]: string } = {
    feed: "🌾",
    other: "🪣",
    suplements: "🐛",
    medication: "💉",
  };

  return (
    <>
      <div className="flex w-full max-w-xl flex-col gap-2">
        <button
          type="button"
          onClick={downloadImage}
          disabled={generatingImage}
          className={
            "w-full rounded bg-[#84A8A3] px-4 py-2 text-white transition-all " +
            (generatingImage
              ? "cursor-not-allowed opacity-60"
              : "hover:brightness-110")
          }
        >
          {/* <BiImageAdd />
            &nbsp;Generate Image */}
          {generatingImage ? (
            <RiLoader4Fill className="animate-spin text-2xl" />
          ) : (
            <>
              <MdSave />
              &nbsp;Save as PNG
            </>
          )}
        </button>
        {/* {downloadURL && (
          <a
            href={downloadURL}
            download
            className="flex w-full items-center justify-center rounded bg-[#84A8A3] px-4 py-2 text-center text-white transition-all hover:brightness-110"
          >
            <MdSave />
            &nbsp;Save as PNG
          </a>
        )} */}
        {/* <button
            type="button"
            onClick={downloadImage}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as PNG 2
          </button> */}
        {/* <button
            type="button"
            onClick={downloadJpg}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as JPEG
          </button> */}
        <label
          htmlFor="hide-expenses"
          className="mb-1 flex items-center justify-center"
        >
          <input
            type="checkbox"
            id="hide-expenses"
            checked={showExpenses}
            onChange={handleChange}
          />
          &nbsp;Show Expenses
        </label>
      </div>
      <div className="w-full max-w-xl shadow-xl">
        <Card title="FlockNerd Summary">
          {summary ? (
            <>
              <div className="flex flex-col items-center lg:flex-row">
                <Image
                  src={summary.flock.image}
                  width="150"
                  height="150"
                  className="flock-image mr-0 aspect-square object-cover md:mr-6"
                  alt="A user uploaded image that represents this flock"
                />
                <div className="">
                  <div className="flex items-center justify-center lg:justify-start">
                    <h1 className="mr-3 dark:text-gray-300">
                      {summary.flock.name}
                    </h1>
                  </div>
                  <p className="description dark:text-gray-300">
                    Summary for {summary.month}&nbsp;{summary.year}
                  </p>
                </div>
              </div>
              <div className="divider my-6 dark:border-t-gray-500"></div>
              <div className="justify-evently flex flex-col">
                <h2 className="mb-4">Egg Production</h2>
                <div className="flex justify-between">
                  <strong>🥚&nbsp;Total:&nbsp;</strong>
                  <span>{summary.logs.total}</span>
                </div>
                <div className="flex justify-between">
                  <strong>📝&nbsp;#&nbsp;of&nbsp;Entries:&nbsp;</strong>
                  <span>{summary.logs.numLogs}</span>
                </div>
                <div className="flex justify-between">
                  <strong>📆&nbsp;Daily&nbsp;Average:&nbsp;</strong>
                  <span>{summary.logs.calcAvg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <strong>💪&nbsp;Largest&nbsp;Haul:&nbsp;</strong>
                  <span>{summary.logs.largest}</span>
                </div>
              </div>
              {showExpenses && (
                <div className="justify-evently flex flex-col">
                  <h2 className="mb-4 mt-6 flex justify-between">Expenses</h2>
                  {summary.expenses.categories.map((cat, index) => {
                    return (
                      <div className="flex justify-between" key={index}>
                        <strong className="capitalize">
                          {emojis[cat.category]}&nbsp;
                          {cat.category}:&nbsp;
                        </strong>
                        <span>$&nbsp;{cat.amount?.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="divider my-2 dark:border-t-gray-500"></div>
                  <div className="flex justify-between">
                    <strong>💰&nbsp;Total:&nbsp;</strong>
                    <span>$&nbsp;{summary.expenses.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </Card>
      </div>
    </>
  );
}
