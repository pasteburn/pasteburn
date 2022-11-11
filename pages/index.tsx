import { Button } from "baseui/button";
import { Textarea } from "baseui/textarea";
import { Tab, Tabs, FILL } from "baseui/tabs-motion";
import { Input, SIZE as InputSize } from "baseui/input";
import React, { FormEvent, useCallback, useRef, useState } from "react";
import { encryptPastePayload } from "../lib/crypto";
import {
  BlobPastePayload,
  CreatePasteResponse,
  EncryptedPaste,
  LinkPastePayload,
  PastePayload,
  Sunset,
  TextPastePayload,
} from "../lib/types";
import { FileUploader } from "baseui/file-uploader";
import {
  Select,
  Value as SelectValue,
  SIZE as SelectSize,
} from "baseui/select";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { setCookie } from "cookies-next";
import { FILE_MAX_SIZE_IN_MB } from "../lib/config";
import { StatusCodes } from "http-status-codes";
import classNames from "classnames";

export default dynamic(Promise.resolve(Create), {
  ssr: false,
});

function postCreate(paste: PastePayload, sunset: Sunset, password: string) {
  const payload = encryptPastePayload(paste, password);
  const encrypted: EncryptedPaste = {
    payload,
    sunset,
  };
  return fetch("/api/paste", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(encrypted),
  });
}

function Create() {
  const [activeKey, setActiveKey] = useState(0);
  const [sunset, setSunset] = useState<Sunset>({
    time: 60 * 10,
    visitors: 1,
  });
  const [resultUrl, setResultUrl] = useState("");
  const [password, setPassword] = useState("");
  const onSubmit = useCallback(
    async (paste: PastePayload) => {
      const resp = await postCreate(paste, sunset, password);
      if (resp.status != StatusCodes.OK) {
        alert(resp.statusText);
        return;
      }
      const ret: CreatePasteResponse = await resp.json();
      const url = new URL(`./${ret.id}#${encodeURIComponent(password)}`, window.location.href);
      setResultUrl(url.href);
      setCookie(ret.id, ret.token, {
        maxAge: sunset.time,
        path: url.pathname,
      });
    },
    [sunset, password]
  );
  return (
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 mx-auto max-w-lg flex flex-col gap-2">
      <Link href="/">
        <Image
          src="/salamander.png"
          alt="Pasteburn Logo"
          title="Logo, made from
            Icon Fonts, which
            is licensed by CC BY 3.0"
          width={256}
          height={64}
          className="mx-auto"
          priority
        />
      </Link>
      {resultUrl ? (
        <div className="font-serif my-8 flex flex-row justify-between gap-2">
          <Input id="resultUrl" value={resultUrl} readOnly />
          <Button
            onClick={() => {
              const e = document.getElementById(
                "resultUrl"
              ) as HTMLInputElement;
              e.select();
              e.setSelectionRange(0, 9999);
              navigator.clipboard.writeText(resultUrl);
            }}
          >
            Copy
          </Button>
        </div>
      ) : (
        <Tabs
          activeKey={activeKey}
          onChange={({ activeKey }) => {
            setActiveKey(Number(activeKey));
          }}
          fill={FILL.fixed}
          activateOnFocus
        >
          <Tab title="Text">
            <div className="flex flex-col gap-4">
              <BurnControl
                sunset={sunset}
                setSunset={setSunset}
                password={password}
                setPassword={setPassword}
              />
              <PasteText onSubmit={onSubmit} />
            </div>
          </Tab>
          <Tab title="Link">
            <div className="flex flex-col gap-4">
              <BurnControl
                sunset={sunset}
                setSunset={setSunset}
                password={password}
                setPassword={setPassword}
              />
              <PasteLink onSubmit={onSubmit} />
            </div>
          </Tab>
          <Tab title="File">
            <div className="flex flex-col gap-4">
              <BurnControl
                sunset={sunset}
                setSunset={setSunset}
                password={password}
                setPassword={setPassword}
              />
              <PasteFile onSubmit={onSubmit} />
            </div>
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

const OPTIONS = [
  { label: "10 Min", id: "10" },
  { label: "1 Hour", id: "60" },
  { label: "2 Hour", id: "90" },
  { label: "4 Hour", id: "240" },
  { label: "1 Day", id: "1440" },
];

function BurnControl({
  sunset,
  setSunset,
  password,
  setPassword,
}: {
  sunset: Sunset;
  setSunset: (sunset: Sunset) => void;
  password: string;
  setPassword: (password: string) => void;
}) {
  return (
    <div className="font-serif flex flex-col gap-1">
      <div>
        <div className="text-[#aa0000]">Burn Control</div>
        <div className="flex flex-row flex-wrap items-center gap-4 select-none justify-between">
          <div className="flex flex-row items-center gap-2">
            <div>Time To Live</div>
            <div>
              <Select
                clearable={false}
                options={OPTIONS}
                value={[OPTIONS.find((e) => e.id == String(sunset.time / 60))!]}
                searchable={false}
                placeholder="Select TTL"
                onChange={(params) =>
                  setSunset({
                    ...sunset,
                    time: Number(params.value[0].id) * 60,
                  })
                }
                size={SelectSize.mini}
                overrides={{
                  ValueContainer: {
                    style: ({ $theme }) => ({
                      paddingTop: 0,
                      paddingBottom: 0,
                    }),
                  },
                }}
              />
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <div>Unique Visitors Allowed</div>
            <div className="w-20">
              <Input
                value={sunset.visitors}
                type="number"
                onChange={(e) => {
                  const x = Number(e.target.value);
                  if (x >= 1) {
                    setSunset({ ...sunset, visitors: x });
                  }
                }}
                size={InputSize.mini}
                placeholder="1"
                clearOnEscape
                overrides={{
                  Input: {
                    style: ({ $theme }) => ({
                      paddingTop: 0,
                      paddingBottom: 0,
                    }),
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[#aa0000]">Encryption</div>
        <div className="flex flex-row grow items-center justify-between gap-2">
          <div>
            <Input
              value={password}
              type="text"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Password"
              size={InputSize.mini}
              clearOnEscape
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubmitProps {
  onSubmit: (paste: PastePayload) => any;
}

function PasteText({ onSubmit }: SubmitProps) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <Textarea onChange={(e) => setText(e.target.value)} />
      <Button
        onClick={(e: FormEvent) => {
          e.preventDefault();
          if (text) {
            const paste: TextPastePayload = {
              type: "text",
              text,
            };
            onSubmit(paste);
          }
        }}
      >
        Submit
      </Button>
    </div>
  );
}

function PasteFile({ onSubmit }: SubmitProps) {
  const [err, setErr] = useState("");
  return (
    <div className="flex flex-row justify-center m-4">
      <FileUploader
        errorMessage={err}
        overrides={{
          RetryButtonComponent: {
            props: {
              overrides: {
                BaseButton: {
                  style: {
                    opacity: "0",
                    cursor: "default",
                  },
                },
              },
            },
          },
        }}
        maxSize={FILE_MAX_SIZE_IN_MB * 1024 * 1024}
        onDropAccepted={async (files) => {
          const file = files[0];
          const data = Buffer.from(await file.arrayBuffer()).toString("base64");
          const payload: BlobPastePayload = {
            type: "blob",
            data,
            mime: file.type,
          };
          onSubmit(payload);
        }}
        onDropRejected={() => {
          setErr(`File size is limited to ${FILE_MAX_SIZE_IN_MB} MiB`);
        }}
      />
    </div>
  );
}

function PasteLink({ onSubmit }: SubmitProps) {
  const [url, setUrl] = useState("");

  return (
    <form
      className="flex flex-row gap-2"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!url) return;
        const paste: LinkPastePayload = {
          type: "link",
          url,
        };
        onSubmit(paste);
      }}
    >
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        clearOnEscape
      />
      <Button>Confirm</Button>
    </form>
  );
}
