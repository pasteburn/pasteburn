import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(StatusCodes.NOT_FOUND).send("");
}
