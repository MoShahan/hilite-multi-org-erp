import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof CSS !== "undefined" && typeof CSS.supports !== "function") {
  CSS.supports = () => false;
}

afterEach(() => {
  cleanup();
});
