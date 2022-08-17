import { Breed, Flock } from "@prisma/client";
import { Line } from "react-chartjs-2";
import Link from "next/link";
import Loader from "./Loader";
import {
  MdOutlineTrendingDown,
  MdOutlineTrendingUp,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
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
  stats,
  flock,
  className,
  limit,
  onRangeChange,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
}) {
  function chartData(logs: any[], flock: Flock & { breeds: Breed[] }) {
    const flockDailyAverage = calcDailyAverage(flock);
    const chartArray = createChartArray(logs, Number(limit));

    return {
      datasets: [
        {
          data: chartArray.map((i: any) => i._sum.count),
          label: "Egg Production",
          backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(39,166,154,0.8)",
          pointBorderColor: "rgba(39,166,154,0.8)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
        },
        {
          data: chartArray.map(() => flockDailyAverage),
          label: "Target Average",
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
      labels: chartArray.map((d) => d.date),
    };
  }

  function calcDailyAverage(flock: Flock & { breeds: Breed[] }): number {
    const breedAverages = flock.breeds.map(
      (breed) => (breed.averageProduction * breed.count) / 7
    );
    const dailyAverage = breedAverages.reduce((a, b) => a + b);

    return dailyAverage;
  }

  function calcActualDailyAverage(logs: any[]) {
    const average =
      logs.map((l) => l._sum.count).reduce((a, b) => a + b) / logs.length;

    return average;
  }

  function getDatesInRange(limit: number) {
    const retArray: Date[] = [];

    for (let i: number = limit - 1; i >= 0; i--) {
      const today = new Date(Date.now());
      retArray.push(new Date(today.setDate(today.getDate() - i)));
    }

    return retArray;
  }

  function createChartArray(logs: any[], limit: number) {
    const dates = getDatesInRange(Number(limit));
    const logsArray = logs.map((log) => {
      return {
        ...log,
        date: log.date.toLocaleString("us-EN", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }),
      };
    });

    const retArray = dates.map((date) => {
      const stringValue = date.toLocaleString("us-EN", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      const index = logsArray.map((l) => l.date).indexOf(stringValue);

      if (index >= 0) {
        return {
          ...logsArray[index],
        };
      } else {
        return {
          date: stringValue,
          _sum: {
            count: 0,
          },
        };
      }
    });

    return retArray;
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

  if (!flock || !stats.logs) {
    return (
      <div className='flex justify-center items-center basis-[48%]'>
        <Loader show={true}></Loader>
      </div>
    );
  }

  const targetDailyAvg = calcDailyAverage(flock);
  const actualDailyAvg = calcActualDailyAverage(stats.logs);

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
          data={chartData(stats.logs, flock)}
          options={options}
          id='flockchart'></Line>
        <div className='p-2'></div>
        <div className='flex justify-between'>
          <div>Target Daily Avg: {targetDailyAvg.toFixed(2)}</div>
          <div className='flex items-center'>
            Actual Daily Avg:
            <span className='ml-1'>{actualDailyAvg.toFixed(2)}</span>
            <span className='ml-1'>
              {actualDailyAvg < targetDailyAvg ? (
                <MdArrowDownward className='text-red-600' />
              ) : (
                <MdArrowUpward className=' text-green-600' />
              )}
            </span>
          </div>
        </div>
        <div className='flex justify-between'>
          <div>Last Weeks Avg: {stats.lastWeekAvg._avg.count?.toFixed(2)}</div>
          <div className='flex items-center'>
            This Weeks Avg:
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count?.toFixed(2)}
            </span>
            <span className='ml-1'>
              {stats.thisWeeksAverage < stats.lastWeeksAverage ? (
                <MdOutlineTrendingDown className='text-red-600' />
              ) : (
                <MdOutlineTrendingUp className=' text-green-600' />
              )}
            </span>
          </div>
        </div>
        <div className='p-2'></div>
        <Link href='/logs' className=''>
          See all logs &gt;
        </Link>
      </div>
    </div>
  );
}
