import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useRef } from "react";
import Card from "../../../../../components/shared/Card";
import Loader from "../../../../../components/shared/Loader";
import AppLayout from "../../../../../layouts/AppLayout";
import { trpc } from "../../../../../utils/trpc";
import { type NextPageWithLayout } from "../../../../_app";
import { toBlob, toJpeg, toPng } from "html-to-image";
import format from "date-fns/format";
import { MdSave } from "react-icons/md";
import { saveAs } from "file-saver";

const Summary: NextPageWithLayout = () => {
  const router = useRouter();
  const { flockId, month, year } = router.query;

  const summary = trpc.stats.getFlockSummary.useQuery({
    flockId: typeof flockId == "string" ? flockId : "",
    month: typeof month == "string" ? month : "",
    year: typeof year == "string" ? year : "",
  });

  const ref = useRef<HTMLDivElement>(null);

  const getFileName = (fileType: string) =>
    `${summary.data?.flock.name}-${format(new Date(), "HH-mm-ss")}.${fileType}`;

  const downloadPng = useCallback(async () => {
    console.log("Downloading PNG...");

    console.log("Current: ", ref.current);

    if (ref.current === null) {
      console.log("Ref is null...");

      return;
    }

    const blob = await toBlob(ref.current);

    console.log("Blob: ", blob);

    console.log("Window saves: ", (window as any).saveAs);

    if ((window as any).saveAs) {
      console.log("Window.saveAs exists");
      (window as any).saveAs(blob, "my-node.png");
    } else if (blob !== null) {
      console.log("trying filesaver.");
      saveAs(blob, "my-node.png");
    } else {
      console.log("Fail...");
    }
    // toPng(ref.current, {
    //   cacheBust: true,
    // })
    //   .then((dataUrl) => {
    //     const link = document.createElement("a");
    //     link.download = `${getFileName("png")}`;
    //     link.href = dataUrl;
    //     link.click();
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }, [ref]);

  const downloadJpg = useCallback(() => {
    if (ref.current === null) {
      return;
    }
    toJpeg(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${getFileName("jpg")}`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref]);

  const emojis: { [x: string]: string } = {
    feed: "🌾",
    other: "🪣",
    suplements: "🐛",
    medication: "💉",
  };

  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <div className="flex w-full max-w-xl flex-col gap-2">
          <button
            type="button"
            onClick={downloadPng}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as PNG
          </button>
          <button
            type="button"
            onClick={downloadJpg}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as JPEG
          </button>
        </div>
        <div className="w-full max-w-xl" ref={ref}>
          <Card title="Monthly Summary">
            {summary.isLoading ? (
              <Loader show={true} />
            ) : summary.isError ? (
              <p>Error!</p>
            ) : summary.data ? (
              <>
                <div className="flex flex-wrap items-center">
                  <Image
                    src={summary.data.flock.image}
                    width="150"
                    height="150"
                    className="flock-image"
                    alt="A user uploaded image that represents this flock"
                  />
                  <div className="ml-0 md:ml-6">
                    <div className="flex items-center">
                      <h1 className="mr-3 dark:text-gray-300">
                        {summary.data.flock.name}
                      </h1>
                    </div>
                    <p className="description dark:text-gray-300">
                      Summary for {summary.data.month}&nbsp;{summary.data.year}
                    </p>
                  </div>
                </div>
                <div className="divider my-6 dark:border-t-gray-500"></div>
                <div className="justify-evently flex flex-col">
                  <h2 className="mb-4">Egg Production</h2>
                  <div className="flex justify-between">
                    <strong>🥚&nbsp;Total:&nbsp;</strong>
                    <span>{summary.data.logs.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>📝&nbsp;#&nbsp;of&nbsp;Entries:&nbsp;</strong>
                    <span>{summary.data.logs.numLogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>📆&nbsp;Daily&nbsp;Average:&nbsp;</strong>
                    <span>{summary.data.logs.calcAvg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>💪&nbsp;Largest&nbsp;Haul:&nbsp;</strong>
                    <span>{summary.data.logs.largest}</span>
                  </div>
                </div>
                <div className="justify-evently flex flex-col">
                  <h2 className="mb-4 mt-6 flex justify-between">Expenses</h2>
                  {summary.data.expenses.categories.map((cat, index) => {
                    return (
                      <div className="flex justify-between" key={index}>
                        <strong className=" capitalize">
                          {emojis[cat.category]}&nbsp;
                          {cat.category}:&nbsp;
                        </strong>
                        <span>$&nbsp;{cat._sum.amount?.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="divider my-2 dark:border-t-gray-500"></div>
                  <div className="flex justify-between">
                    <strong>💰&nbsp;Total:&nbsp;</strong>
                    <span>$&nbsp;{summary.data.expenses.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : null}
          </Card>
        </div>
      </main>
    </>
  );
};

Summary.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Summary;
