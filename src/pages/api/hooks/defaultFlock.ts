// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);

  const message = req.body.message;
  const data = Buffer.from(req.body.message.data, "base64").toJSON();

  console.log("Data: ", data);

  res.status(200).json({
    message: "Thanks!",
  });
}
