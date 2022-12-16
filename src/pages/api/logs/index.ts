// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "DELETE") {
    const { id } = req.query;

    const response = await prisma.eggLog.delete({
      where: {
        id: id as string,
      },
    });

    res.status(200).send({ ...response });
  }
}
