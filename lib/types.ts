// Represents the limit for a paste
// Conditions are ORed
export interface Sunset {
  time: number; // Expire time in seconds. 0 means the max allowed duration
  visitors: number; // Unique visitors. 0 means no limit
}

interface CommonPaste {
  sunset: Sunset;
}

export interface TextPastePayload {
  type: "text";
  text: string;
}

export interface LinkPastePayload {
  type: "link";
  url: string;
  preview?: string;
}

export interface BlobPastePayload {
  type: "blob";
  mime: string;
  data: string;
}

export interface EncryptedPaste extends CommonPaste {
  payload: string;
}

export type ClientSideEncryptedPaste = Omit<EncryptedPaste, "sunset">;

export type PastePayload =
  | LinkPastePayload
  | TextPastePayload
  | BlobPastePayload;

export type CreatePasteReq = EncryptedPaste;

export interface DbItem extends CreatePasteReq {
  token: string;
  visitorToken: string;
  deadTime: number;
}

export interface CreatePasteResponse {
  id: string;
  token: string;
  visitorToken: string;
}

export type GetPasteResponse = EncryptedPaste;
