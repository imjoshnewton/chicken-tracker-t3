import { subMonths } from "date-fns";
import { Chart } from "react-chartjs-2";
import Link from "next/link";
import {
  Chart as ChartJS,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function ExpenseChart({
  stats,
  className,
}: {
  stats: any | null | undefined;
  className: string;
}) {
  function chartData(stats: { expenses: any[]; production: any[] }) {
    const chartArray = createChartArray(stats.expenses);
    const prodArray = createProdOverlayArray(stats.production);

    console.log("Chart Bar Data: ", chartArray);
    console.log("Production Line Data: ", prodArray);

    return {
      datasets: [
        {
          data: chartArray.filter((i) => i.Cat == "feed").map((i) => i.Tot),
          label: "Feed",
          backgroundColor: "rgba(39,70,84,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray
            .filter((i) => i.Cat == "suplements")
            .map((i) => i.Tot),
          label: "Suplements",
          backgroundColor: "rgba(39,166,154,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray
            .filter((i) => i.Cat == "medication")
            .map((i) => i.Tot),
          label: "Medication",
          backgroundColor: "rgba(231, 111, 82, 0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: chartArray.filter((i) => i.Cat == "other").map((i) => i.Tot),
          label: "Other",
          backgroundColor: "rgba(244, 162, 98,0.75)",
          // borderColor: "rgba(39,166,154,1)",
          // pointBackgroundColor: "rgba(39,166,154,0.8)",
          // pointBorderColor: "rgba(39,166,154,0.8)",
          // pointHoverBackgroundColor: "#fff",
          // pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "bar" as const,
          yAxisID: "y",
          order: 2,
        },
        {
          data: prodArray.map((i) => i.Tot),
          label: "Egg Production",
          // backgroundColor: "rgba(39,166,154,0.2)",
          borderColor: "rgba(39,166,154,1)",
          pointBackgroundColor: "rgba(39,166,154,0.8)",
          pointBorderColor: "rgba(39,166,154,0.8)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(148,159,177,0.8)",
          fill: "origin",
          type: "line" as const,
          yAxisID: "y1",
          order: 1,
        },
      ],
      labels: Array.from(new Set(chartArray.map((i: any) => i.MonthYear))),
    };
  }

  function getDatesWithCategories(dates: Date[]) {
    const retArray: { MonthYear: string; Cat: string }[] = [];
    const types = ["feed", "suplements", "medication", "other"];

    dates.forEach((date) => {
      types.forEach((type) => {
        retArray.push({
          MonthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
          Cat: type,
        });
      });
    });

    return retArray;
  }

  function createChartArray(expenses: any[]) {
    const dates = getDatesInRange(6);
    const datesAndCats = getDatesWithCategories(dates);
    const expenseArray = expenses as {
      MonthYear: string;
      Cat: string;
      Tot: number;
    }[];

    const retArray = datesAndCats.map((item) => {
      const index = expenseArray
        .map((e) => {
          return {
            MonthYear: e.MonthYear,
            Cat: e.Cat,
          };
        })
        .findIndex((res) => {
          return res.MonthYear == item.MonthYear && res.Cat == item.Cat;
        });

      if (index >= 0) {
        return {
          ...expenseArray[index],
        };
      } else {
        return {
          MonthYear: item.MonthYear,
          Cat: item.Cat,
          Tot: 0,
        };
      }
    });

    return retArray;
  }

  function createProdOverlayArray(production: any[]) {
    const dates = getDatesInRange(6);
    const dateStrings = dates.map((date) => {
      return {
        MonthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
      };
    });
    const productionArray = production as {
      MonthYear: string;
      Tot: number;
    }[];

    const retArray = dateStrings.map((item) => {
      const index = productionArray
        .map((e) => {
          return {
            MonthYear: e.MonthYear,
          };
        })
        .findIndex((res) => {
          return res.MonthYear == item.MonthYear;
        });

      if (index >= 0) {
        return {
          ...productionArray[index],
        };
      } else {
        return {
          MonthYear: item,
          Tot: 0,
        };
      }
    });

    return retArray;
  }

  function getDatesInRange(limit: number) {
    const retArray: Date[] = [];

    for (let i: number = limit - 1; i >= 0; i--) {
      const today = new Date(Date.now());
      retArray.push(subMonths(today, i));
    }

    return retArray;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        startAtZero: true,
        stacked: true,
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value: any) {
            return "$" + value;
          },
        },
      },
      y1: {
        // type: "linear" as const,
        display: true,
        position: "right" as const,
        // stacked: false,

        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
  };

  return (
    <div className={className}>
      <div className="flex justify-between">
        <h3 className="mb-4 dark:text-gray-300">Expenses</h3>
        {/* <select defaultValue={limit} onChange={onRangeChange} className='mb-4'>
          <option value='7'>Last 7 Days</option>
          <option value='15'>Last 15 Days</option>
          <option value='30'>Last 30 Days</option>
        </select> */}
      </div>
      <div className="flex flex-col">
        <div className="min-h-[300px] w-[99%] md:min-h-[275px]">
          <Chart
            type="bar"
            data={chartData(stats.expenses)}
            options={options}
            id="expenseChart"
          ></Chart>
        </div>
        {/* <div className='p-2'></div>
        <div className='flex justify-between'>
          <div className='dark:text-gray-300'>
            Target Daily Avg: {targetDailyAvg.toFixed(2)}
          </div>
          <div className='flex items-center dark:text-gray-300'>
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
        </div> */}
        {/* <div className='flex justify-between dark:text-gray-300'>
          <div>
            Last Weeks Avg:{" "}
            {stats.lastWeekAvg._avg.count
              ? stats.lastWeekAvg._avg.count.toFixed(2)
              : "n/a"}
          </div>
          <div className='flex items-center dark:text-gray-300'>
            This Weeks Avg:
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count?.toFixed(2)}
            </span>
            <span className='ml-1'>
              {stats.thisWeekAvg._avg.count < stats.lastWeekAvg._avg.count ? (
                <MdOutlineTrendingDown className='text-red-600' />
              ) : (
                <MdOutlineTrendingUp className=' text-green-600' />
              )}
            </span>
          </div>
        </div> */}
        <div className="p-2"></div>
        <Link
          href="/app/expenses"
          className="text-stone-400 transition-colors hover:text-stone-700"
        >
          See all expenses &gt;
        </Link>
      </div>
    </div>
  );
}
