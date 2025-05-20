import { db } from "@lib/db";
import { dateTest } from "@lib/db/schema-postgres";

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
              <span>Date time: {typeof date.dt_column === 'string' ? date.dt_column : new Date(date.dt_column).toISOString()}</span>
              <span>Date: {typeof date.d_column === 'string' ? date.d_column : new Date(date.d_column).toISOString()}</span>
            </li>
          ))}
        </ul>
        <span>{JSON.stringify(dates)}</span>
      </div>
    </main>
  );
};

export default DateTest;
