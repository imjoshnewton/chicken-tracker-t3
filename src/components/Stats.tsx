import { Breed, Flock, Log } from "@prisma/client";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Stats({
  logs,
  flock,
  className,
  limit,
  onRangeChange,
}: {
  logs: any[] | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
}) {
  function chartData(logs: any[], flock: Flock & { breeds: Breed[] }) {
    const flockDailyAverage = calcDailyAverage(flock);
    const sorted = logs.sort((a, b) => {
      return a.date > b.date ? 1 : -1;
    });
    return {
      datasets: [
        {
          data: sorted.map((i: any) => i._sum.count),
          label: "Egg Production",
          backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(148,159,177,1)",
          pointBorderColor: "rgba(148,159,177,1)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: true,
        },
        {
          data: sorted.map((i: any) => flockDailyAverage),
          label: "Flock Average",
          backgroundColor: "rgba(149,159,177,0.2)",
          borderColor: "rgba(149,159,177,1)",
          pointBackgroundColor: "rgba(148,159,177,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          pointRadius: 0,
        },
      ],
      labels: sorted.map((i: any) =>
        i.date.toLocaleString("us-EN", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
      ),
    };
  }

  function calcDailyAverage(flock: Flock & { breeds: Breed[] }): number {
    const breedAverages = flock.breeds.map(
      (breed) => (breed.averageProduction * breed.count) / 7
    );
    const dailyAverage = breedAverages.reduce((a, b) => a + b);

    return dailyAverage;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
  };

  if (!flock || !logs) {
    return null;
  }

  return (
    <div className={className}>
      <div className='flex justify-between'>
        <h2 className='mb-4'>Stats</h2>
        <select defaultValue={limit} onChange={onRangeChange}>
          <option value='7'>Last 7 Days</option>
          <option value='15'>Last 15 Days</option>
          <option value='30'>Last 30 Days</option>
        </select>
      </div>
      <div className='flex flex-col'>
        <Line
          data={chartData(logs, flock)}
          options={options}
          id='flockchart'></Line>
        <div className='p-2'></div>
        <Link href='/logs' className=''>
          See all logs &gt;
        </Link>
      </div>
    </div>
  );
}
