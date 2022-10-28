// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body);

  const message = req.body.message;
  const data = JSON.parse(
    Buffer.from(req.body.message.data, "base64").toString()
  );

  console.log("Data: ", data);

  const updatedUser = await prisma.user.update({
    where: {
      id: data.ownerId,
    },
    data: {
      defaultFlock: data.flockId,
    },
  });

  console.log("Updated user: ", updatedUser);

  res.status(200).json({
    message: "Thanks!",
  });
}
