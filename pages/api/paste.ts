import type { NextApiRequest, NextApiResponse } from "next";
import { CreatePasteResponse, GetPasteResponse } from "../../lib/types";
import * as db from "../../lib/db";
import { StatusCodes } from "http-status-codes";
import { FILE_MAX_SIZE_IN_MB } from "../../lib/config";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      await createPaste(req, res);
      break;
    case "GET":
      await visitPaste(req, res);
      break;
    case "PUT":
      await updatePaste(req, res);
      break;
    case "DELETE":
      await deletePaste(req, res);
      break;
    default:
      res.status(StatusCodes.BAD_REQUEST);
  }
}

async function createPaste(
  req: NextApiRequest,
  res: NextApiResponse<CreatePasteResponse | "">
) {
  const length = Number(req.headers["content-length"]);
  if (length && length > FILE_MAX_SIZE_IN_MB * 1024 * 1024) {
    res.status(StatusCodes.FORBIDDEN).send("");
  } else {
    res.status(StatusCodes.OK).json(await db.insertPaste(req.body));
  }
}

async function visitPaste(
  req: NextApiRequest,
  res: NextApiResponse<GetPasteResponse | "">
) {
  const { id } = req.query;
  if (typeof id != "string") {
    res.status(StatusCodes.BAD_REQUEST).send("");
    return;
  }
  const reqToken = req.cookies[id as string];
  res.setHeader("Cache-Control", "no-cache");
  try {
    res.status(StatusCodes.OK).json(await db.visitPaste(id, reqToken));
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).send("");
  }
}

async function updatePaste(req: NextApiRequest, res: NextApiResponse<void>) {
  res.status(StatusCodes.BAD_REQUEST);
}

async function deletePaste(req: NextApiRequest, res: NextApiResponse<void>) {
  res.status(StatusCodes.BAD_REQUEST);
}
