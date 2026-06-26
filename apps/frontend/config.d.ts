declare module "@vitejs/plugin-react" {
  import type { PluginOption } from "vite";

  export default function react(options?: object): PluginOption;
}

declare module "@tailwindcss/vite" {
  import type { PluginOption } from "vite";

  export default function tailwindcss(): PluginOption;
}
