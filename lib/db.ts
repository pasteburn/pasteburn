import { CreatePasteReq, CreatePasteResponse, DbItem } from "./types";
import { randomUUID } from "crypto";
import { digest } from "./crypto";
import { GlobalRef } from "./global";
import { USE_MEMORY_DB } from "./config";
import { MemoryLevel } from "memory-level";
import { Level } from "level";

const databaseConn = new GlobalRef("database");
if (!databaseConn.value) {
  if (USE_MEMORY_DB) {
    databaseConn.value = new MemoryLevel();
  } else {
    databaseConn.value = new Level("./data");
  }
}
const db: Level | MemoryLevel = databaseConn.value as any;

async function insertImpl(data: DbItem, urlLen = 3): Promise<string> {
  const id = digest(String(urlLen) + data.payload).slice(0, urlLen);
  try {
    await db.get(id);
    return insertImpl(data, urlLen + 1);
  } catch (e) {
    await db.put(id, JSON.stringify(data));
    return id;
  }
}

export async function insertPaste(
  paste: CreatePasteReq
): Promise<CreatePasteResponse> {
  const token = randomUUID();
  const visitorToken = randomUUID();

  if (!paste.sunset.time) throw "Bad sunset time";

  const data: DbItem = {
    ...paste,
    token,
    visitorToken,
    deadTime: Date.now() / 1000 + paste.sunset.time,
  };

  const id = await insertImpl(data);

  // Set clean-up timer
  setTimeout(async () => {
    try {
      await db.del(id);
    } catch (e) {
      console.error(e, "when cleaning up", id);
    }
  }, paste.sunset.time * 1000);

  console.info("inserted paste", data);

  return { token, id, visitorToken };
}

async function getPaste(id: string): Promise<DbItem> {
  return JSON.parse((await db.get(id)).toString());
}

export async function visitPaste(id: string, token?: string): Promise<DbItem> {
  console.info("visit", id, "with", token);

  const data = await getPaste(id);

  // Handle stale paste when the server has been restarted
  if (
    (data.deadTime != 0 && data.deadTime < Date.now() / 1000) ||
    data.sunset.visitors <= 0
  ) {
    console.info(id, data, "is stale");
    try {
      await db.del(id);
    } catch (e) {
      console.error(e);
    }
    throw "Burnt";
  }

  if (token != data.token && token != data.visitorToken) {
    data.sunset.visitors -= 1;
    if (data.sunset.visitors <= 0) {
      console.info(id, "has used up its last visit");
      try {
        await db.del(id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return data;
}
