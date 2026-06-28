/// <reference types="vite/client" />
/// <reference path="./test/vitest-env.d.ts" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
