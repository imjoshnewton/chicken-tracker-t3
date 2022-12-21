import Image from "next/image";
import { useRouter } from "next/router";
import { useRef } from "react";
import Card from "../../../../../components/shared/Card";
import Loader from "../../../../../components/shared/Loader";
// import AppLayout from "../../../../../layouts/AppLayout";
import { trpc } from "../../../../../utils/trpc";
import { type NextPageWithLayout } from "../../../../_app";
import { toPng, toSvg, toCanvas } from "html-to-image";
import { cloneNode } from "html-to-image/lib/clone-node";
import { embedWebFonts } from "html-to-image/lib/embed-webfonts";
// import { embedImages } from "html-to-image/lib/embed-images";
import { applyStyle } from "html-to-image/lib/apply-style";
import {
  getImageSize,
  createImage,
  nodeToDataURL,
  getPixelRatio,
  toArray,
} from "html-to-image/lib/util";
import { embedResources } from "html-to-image/lib/embed-resources";
import { isDataUrl, resourceToDataURL } from "html-to-image/lib/dataurl";
import { getMimeType } from "html-to-image/lib/mimes";
import { MdSave } from "react-icons/md";
import { type Options } from "html-to-image/lib/types";

async function embedBackground<T extends HTMLElement>(
  clonedNode: T,
  options: Options
) {
  const background = clonedNode.style?.getPropertyValue("background");
  if (background) {
    const cssString = await embedResources(background, null, options);
    clonedNode.style.setProperty(
      "background",
      cssString,
      clonedNode.style.getPropertyPriority("background")
    );
  }
}

async function embedImageNode<T extends HTMLElement | SVGImageElement>(
  clonedNode: T,
  options: Options
) {
  if (
    !(clonedNode instanceof HTMLImageElement && !isDataUrl(clonedNode.src)) &&
    !(
      clonedNode instanceof SVGImageElement &&
      !isDataUrl(clonedNode.href.baseVal)
    )
  ) {
    return;
  }

  const url =
    clonedNode instanceof HTMLImageElement
      ? clonedNode.src
      : clonedNode.href.baseVal;

  const dataURL = await resourceToDataURL(url, getMimeType(url), options);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = reject;

    const image = clonedNode as HTMLImageElement;
    if (image.decode) {
      image.decode = resolve as any;
    }

    if (clonedNode instanceof HTMLImageElement) {
      clonedNode.srcset = "";
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
}

async function embedChildren<T extends HTMLElement>(
  clonedNode: T,
  options: Options
) {
  const children = toArray<HTMLElement>(clonedNode.childNodes);
  // console.log({ children });

  const deferreds = children.map((child) => {
    console.log({ child });

    return embedImages(child, options);
  });
  console.log({ deferreds });

  await Promise.all(deferreds).then(() => clonedNode);
}

async function embedImages<T extends HTMLElement>(
  clonedNode: T,
  options: Options
) {
  if (clonedNode instanceof Element) {
    console.log({ clonedNode }, "is an instance of element");

    await embedBackground(clonedNode, options);
    await embedImageNode(clonedNode, options);
    await embedChildren(clonedNode, options);
  }
}

const Summary: NextPageWithLayout = () => {
  const router = useRouter();
  const { flockId, month, year } = router.query;

  const summary = trpc.stats.getFlockSummary.useQuery({
    flockId: typeof flockId == "string" ? flockId : "",
    month: typeof month == "string" ? month : "",
    year: typeof year == "string" ? year : "",
  });

  const ref = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (ref.current == null) {
      return;
    }
    const options = {};

    const { width, height } = getImageSize(ref.current, options);
    console.log({ width, height });
    const clonedNode = await cloneNode(ref.current, options, true);
    console.log({ clonedNode });

    if (clonedNode !== null) {
      console.log("Cloned Node isn't null!");

      await embedWebFonts(clonedNode, {});
      await embedImages(clonedNode, options);
      applyStyle(clonedNode, options);
      console.log("After font, images, style: ", { clonedNode });
      const datauri = await nodeToDataURL(clonedNode, width, height);
      console.log({ datauri });
      const svg = datauri;
      const img = await createImage(svg);
      console.log({ svg, img });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const ratio = getPixelRatio();
      const canvasWidth = width;
      const canvasHeight = height;

      canvas.width = canvasWidth * ratio;
      canvas.height = canvasHeight * ratio;

      // if (!options.skipAutoScale) {
      //   checkCanvasDimensions(canvas);
      // }
      canvas.style.width = `${canvasWidth}`;
      canvas.style.height = `${canvasHeight}`;

      // if (options.backgroundColor) {
      //   context.fillStyle = options.backgroundColor;
      //   context.fillRect(0, 0, canvas.width, canvas.height);
      // }

      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL();
      const link = document.createElement("a");
      link.download = "html-to-img.png";
      link.href = dataURL;
      link.click();
    } else if (clonedNode == null) {
      console.log("Clone Node is null");
      return;
    } else {
      console.log("misssed conditions");
    }

    // const svg = await toSvg(ref.current, {});
    // const img = await createImage(svg);

    // console.log({ svg, img });

    // console.log("Current: ", ref.current);
    // console.log({ toCanvas, toPng });

    // const canvas = await toCanvas(ref.current, {});
    // console.log(canvas);
    // const dataUrl = await toPng(ref.current);

    // // download image
    // const link = document.createElement("a");
    // link.download = "html-to-img.png";
    // link.href = dataUrl;
    // link.click();
  };

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
            onClick={downloadImage}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as PNG
          </button>
          {/* <button
            type="button"
            onClick={downloadJpg}
            className="w-full rounded bg-secondary px-4 py-2 text-white transition-all hover:bg-secondary/80"
          >
            <MdSave />
            &nbsp;Save as JPEG
          </button> */}
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
                  <img
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
                        <strong className="capitalize">
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
  return <>{page}</>;
};

export default Summary;
