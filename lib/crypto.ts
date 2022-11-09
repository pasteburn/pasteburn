import {
  ClientSideEncryptedPaste,
  EncryptedPaste,
  PastePayload,
} from "./types";
import { createHash } from "crypto";
import AES from "crypto-js/aes";
import CryptoJs from "crypto-js";
import base32Encode from "base32-encode";

function encrypt(data: string, pass: string) {
  return AES.encrypt(data, pass).toString();
}

function decrypt(data: string, pass: string) {
  return AES.decrypt(data, pass).toString(CryptoJs.enc.Utf8);
}

export function digest(data: string): string {
  const ret = base32Encode(
    createHash("sha256").update(data).digest(),
    "Crockford"
  );
  return ret;
}

export function encryptPastePayload(paste: PastePayload, pass: string): string {
  return encrypt(JSON.stringify(paste), pass);
}

export function decryptPastePayload(
  paste: { payload: string },
  pass: string
): PastePayload {
  const ret = decrypt(paste.payload, pass);
  console.log("decrypted", ret);
  return JSON.parse(ret);
}
