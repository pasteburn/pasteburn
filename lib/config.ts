// see also next.config.js

import getConfig from "next/config";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const USE_MEMORY_DB = serverRuntimeConfig.useMemoryDb;

// TODO: Enforce this
export const PASTE_MAX_TTL = publicRuntimeConfig.maxTimeToLiveInSecs;

export const FILE_MAX_SIZE_IN_MB = publicRuntimeConfig.fileSizeLimitInMB;
