import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

if (typeof CSS !== "undefined" && typeof CSS.supports !== "function") {
  CSS.supports = () => false;
}

afterEach(() => {
  cleanup();
});
