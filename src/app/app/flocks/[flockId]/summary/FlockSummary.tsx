"use client";

import Card from "@components/shared/Card";
import { format } from "date-fns";
import saveAs from "file-saver";
import { toPng } from "html-to-image";
import { useCallback, useRef, useState } from "react";
import { MdSave } from "react-icons/md";

export default function FlockSummary({
  summary,
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
}) {
  const [showExpenses, setShowExpenses] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const getFileName = (fileType: string, prefix: string) =>
    `${prefix}-${format(new Date(), "HH-mm-ss")}.${fileType}`;

  const downloadImage = useCallback(async () => {
    // if (ref.current === null) {
    //   return;
    // }
    // toPng(ref.current, { cacheBust: true })
    //   .then((dataUrl) => {
    //     saveAs(dataUrl, getFileName("png", `${summary.flock.name}`));
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    const res = await (
      await fetch("/api/summary", {
        // Changed endpoint here
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: summary.flock.id,
          month: "05",
          year: summary.year,
        }),
      })
    ).json();

    console.log("res", res);
  }, [ref, summary.flock.name]);

  // const downloadImage2 = async () => {
  //   if (ref.current == null) {
  //     return;
  //   }

  //   const dataUrl = await toPng(ref.current, { cacheBust: true });

  //   // download image
  //   const link = document.createElement("a");
  //   link.download = getFileName("png", `${summary.data?.flock.name}`);
  //   link.href = dataUrl;
  //   link.click();
  // };

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
          className="w-full rounded bg-[#84A8A3] px-4 py-2 text-white transition-all hover:brightness-90"
        >
          <MdSave />
          &nbsp;Save as PNG
        </button>
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
        {/* <fieldset className="flex items-center justify-center">
            <h3 className="mr-4">Dimensions:</h3>
            <label htmlFor="width" className="flex items-center justify-center">
              <input type="text" id="width" className="w-20" />
            </label>
            <MdClose className="mx-4" />
            <label
              htmlFor="height"
              className="flex items-center justify-center"
            >
              <input type="text" id="height" className="w-20" />
            </label>
          </fieldset> */}
      </div>
      {/* <div className="w-full max-w-xl"></div> */}
      <div className="w-full max-w-xl shadow-xl" ref={ref}>
        <Card title="FlockNerd Summary">
          {summary ? (
            <>
              <div className="flex flex-wrap items-center">
                <img
                  src={summary.flock.image}
                  width="150"
                  height="150"
                  className="flock-image aspect-square object-cover"
                  alt="A user uploaded image that represents this flock"
                />
                <div className="ml-0 md:ml-6">
                  <div className="flex items-center">
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
