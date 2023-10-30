import { db } from "@lib/db";
import { dateTest } from "@lib/db/schema";

const DateTest = async () => {
  const dates = await db.select().from(dateTest);

  console.log("dates: ", dates);
  return (
    <main className="mx-auto flex max-w-4xl flex-col">
      <div>
        <h1>Date Test</h1>
        <ul className="flex flex-col gap-4">
          {dates.map((date, index) => (
            <li key={index} className="flex flex-col">
              <span>Date time: {date.dt_column.toISOString()}</span>
              <span>Date: {date.d_column.toISOString()}</span>
            </li>
          ))}
        </ul>
        <span>{JSON.stringify(dates)}</span>
      </div>
    </main>
  );
};

export default DateTest;
