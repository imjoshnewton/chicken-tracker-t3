import { db } from "@lib/db";
import { dateTest } from "@lib/db/schema-postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DateTest = async () => {
  const mockDates = [
    { dt_column: new Date('2023-10-29T02:30:56.000Z'), d_column: '2023-10-29' },
    { dt_column: new Date('2023-10-29T02:31:14.000Z'), d_column: '2023-10-29' },
    { dt_column: new Date('2023-10-29T02:32:21.000Z'), d_column: '2023-10-29' },
    { dt_column: new Date('2023-10-29T02:32:50.000Z'), d_column: '2023-10-29' },
    { dt_column: new Date('2023-10-29T02:33:56.000Z'), d_column: '2023-10-29' }
  ];
  
  // Using mock data to avoid build timeouts
  const dates = mockDates;
  
  return (
    <main className="mx-auto flex max-w-4xl flex-col">
      <div>
        <h1>Date Test</h1>
        <ul className="flex flex-col gap-4">
          {dates.map((date, index) => (
            <li key={index} className="flex flex-col">
              <span>Date time: {date.dt_column.toISOString()}</span>
              <span>Date: {date.d_column}</span>
            </li>
          ))}
        </ul>
        <pre>{JSON.stringify(dates, null, 2)}</pre>
      </div>
    </main>
  );
};

export default DateTest;
