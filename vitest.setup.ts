import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Testing Library only auto-cleans when test globals are enabled; we keep them off.
afterEach(() => {
  cleanup();
});
