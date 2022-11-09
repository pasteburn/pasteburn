import { GetServerSideProps } from "next";
import { ClientSideEncryptedPaste, PastePayload } from "../lib/types";
import * as db from "../lib/db";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Spinner } from "baseui/spinner";
import { decryptPastePayload } from "../lib/crypto";
import download from "downloadjs";
import { setCookie, hasCookie } from "cookies-next";
import Image from "next/image";

type MessageProps = {
  paste?: ClientSideEncryptedPaste;
  token?: string;
};

function getPayloadKey(id: string) {
  return `${id}-payload`;
}

enum PasteState {
  Loading = "Loading",
  Server = "Paste alive",
  OnlyCache = "Paste burned in server but recovered from the cache",
  NotFound = "Paste not found",
  Invalid = "Invalid data",
}

export default function Message(props: MessageProps) {
  const router = useRouter();
  const { id } = router.query;
  const [paste, setPaste] = useState<null | PastePayload>(null);
  const [pasteState, setPasteState] = useState(PasteState.Loading);
  const [pass, setPass] = useState<string | null>(null);

  useEffect(() => {
    if (pass == null) {
      setPass(window.location.hash.slice(1));
      return;
    }

    let { paste: encrypted, token } = props;

    if (encrypted) {
      setPasteState(PasteState.Server);

      // Cache data
      try {
        const s = JSON.stringify(encrypted);
        if (s.length > 1024 * 1024 * 5) {
          // If the data is larger than 5 MiB, skip local caching
        } else {
          localStorage.setItem(getPayloadKey(id as string), s);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const s = localStorage.getItem(getPayloadKey(id as string));
      if (s) {
        setPasteState(PasteState.OnlyCache);
        try {
          encrypted = JSON.parse(s);
        } catch (e) {
          setPasteState(PasteState.Invalid);
          return;
        }
      } else {
        setPasteState(PasteState.NotFound);
        return;
      }
    }

    // Set cookie for counting visitors
    try {
      if (!hasCookie(id as string)) {
        setCookie(id as string, token, {
          maxAge: 60 * 60 * 24, // a day
          path: window.location.pathname, // cookie only applies to the current page
        });
      }
    } catch (e) {
      console.error(e);
    }

    // Decrypt the paste
    try {
      const t = decryptPastePayload(encrypted!, pass);
      setPaste(t);
    } catch (e) {
      console.error(e);
      setPasteState(PasteState.Invalid);
    }
  }, [props, id, pass]);

  useEffect(() => {
    if (!paste) return;
    if (paste.type == "link") {
      setTimeout(() => {
        window.location.href = paste.url;
      }, 0);
    } else if (paste.type == "blob") {
      setTimeout(() => {
        download(
          new Blob(Buffer.from(paste.data, "base64") as any, {
            type: paste.mime,
          }),
          id as string,
          paste.mime
        );
      }, 0);
    }
  }, [paste, id]);

  return pasteState == PasteState.Loading ? (
    <Spinner />
  ) : (
    <div>
      {paste && (
        <div className="m-8">
          {paste.type == "text" && (
            <div className="max-w-lg h-full p-8 shadow-lg whitespace-pre-wrap mx-auto ronuded">
              {paste.text}
            </div>
          )}
          {paste.type == "blob" && paste.mime}
        </div>
      )}
      {pasteState != PasteState.Server && (
        <Image
          src="/fire.svg"
          alt={pasteState}
          title={pasteState}
          width={100}
          height={100}
          className="mx-auto m-12 opacity-20 hover:opacity-60 transition-opacity duration-400 cursor-pointer"
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<MessageProps> = async (
  context
) => {
  const { id } = context.query;
  const reqToken = context.req.cookies[id as string];
  try {
    const { payload, token, visitorToken, sunset } = await db.visitPaste(
      id as string,
      reqToken
    );
    return {
      props: {
        paste: { payload },
        token: visitorToken,
      },
    };
  } catch (e) {
    console.info(id, "not found in the server");
    return {
      props: {},
    };
  }
};
