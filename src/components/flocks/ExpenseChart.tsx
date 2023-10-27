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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

export default function ExpenseChart({
  stats,
  className,
  numMonths,
  onMonthsChange,
}: {
  stats: any | null | undefined;
  className: string;
  numMonths?: number;
  onMonthsChange?: (value: string) => void;
}) {
  function chartData(stats: { expenses: any[]; production: any[] }) {
    const chartArray = createChartArray(stats?.expenses);
    const prodArray = createProdOverlayArray(stats?.production);

    console.log("Chart Bar Data: ", chartArray);
    console.log("Production Line Data: ", prodArray);

    return {
      datasets: [
        {
          data: chartArray
            .filter((i) => i.category == "feed")
            .map((i) => i.total),
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
            .filter((i) => i.category == "suplements")
            .map((i) => i.total),
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
            .filter((i) => i.category == "medication")
            .map((i) => i.total),
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
          data: chartArray
            .filter((i) => i.category == "other")
            .map((i) => i.total),
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
          data: prodArray.map((i) => i.total),
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
          tension: 0.3,
          pointRadius: 5,
          hoverRadius: 7,
        },
      ],
      labels: Array.from(new Set(chartArray.map((i: any) => i.monthYear))),
    };
  }

  function getDatesWithCategories(dates: Date[]) {
    const retArray: { monthYear: string; category: string }[] = [];
    const types = ["feed", "suplements", "medication", "other"];

    dates.forEach((date) => {
      types.forEach((type) => {
        retArray.push({
          monthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
          category: type,
        });
      });
    });

    return retArray;
  }

  function createChartArray(expenses: any[]) {
    const dates = getDatesInRange(numMonths || 6);
    const datesAndCats = getDatesWithCategories(dates);
    const expenseArray = expenses as {
      monthYear: string;
      category: string;
      total: number;
    }[];

    const retArray = datesAndCats.map((item) => {
      const index = expenseArray
        ?.map((e) => {
          return {
            monthYear: e.monthYear,
            category: e.category,
          };
        })
        .findIndex((res) => {
          return (
            res.monthYear == item.monthYear && res.category == item.category
          );
        });

      if (index >= 0) {
        return {
          ...expenseArray[index],
        };
      } else {
        return {
          monthYear: item.monthYear,
          category: item.category,
          total: 0,
        };
      }
    });

    return retArray;
  }

  function createProdOverlayArray(production: any[]) {
    const dates = getDatesInRange(numMonths || 6);
    const dateStrings = dates.map((date) => {
      return {
        monthYear: `${date.getMonth() + 1}/${date.getFullYear()}`,
      };
    });
    const productionArray = production as {
      monthYear: string;
      total: number;
    }[];

    const retArray = dateStrings.map((item) => {
      const index = productionArray
        ?.map((e) => {
          return {
            monthYear: e.monthYear,
          };
        })
        .findIndex((res) => {
          return res.monthYear == item.monthYear;
        });

      if (index >= 0) {
        return {
          ...productionArray[index],
        };
      } else {
        return {
          monthYear: item,
          total: 0,
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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="dark:text-gray-300">Expenses</h3>
        <Select onValueChange={onMonthsChange}>
          <SelectTrigger className="max-w-max">
            <SelectValue placeholder={`Last ${numMonths} Months`} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="6">Last 6 Months</SelectItem>
            <SelectItem value="9">Last 9 Months</SelectItem>
            <SelectItem value="12">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
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
