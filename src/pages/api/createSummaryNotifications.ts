import { verifySignature } from "@upstash/qstash/nextjs";
import { subMonths } from "date-fns";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const today = new Date();
  const monthNum = subMonths(today, 1).getMonth() + 1;
  const monthString = monthNum < 10 ? `0${monthNum}` : monthNum.toString();
  const monthName = subMonths(today, 1).toLocaleString("default", {
    month: "long",
  });
  const year = subMonths(today, 1).getFullYear();
  const yearString = year.toString();

  console.log("Month Number: ", monthNum);
  console.log("Month String: ", monthString);
  console.log("Year: ", year);
  console.log("Year String: ", yearString);

  const flocks = await prisma.flock.findMany();

  const newNotifications = await Promise.all(
    flocks.map((flock) => {
      return prisma.notification.create({
        data: {
          title: `Your ${monthName} summary is ready!`,
          message: `Check out your flock stats for ${monthName}.`,
          link: `https://chicken-tracker-t3.vercel.app/app/flocks/${flock.id}/summary?month=${monthString}&year=${yearString}`,
          userId: flock.userId,
        },
      });
    })
  );

  console.log("New Notifications: ", newNotifications);

  res.status(200).json({
    notifications: newNotifications,
  });
};

export default verifySignature(handler);
