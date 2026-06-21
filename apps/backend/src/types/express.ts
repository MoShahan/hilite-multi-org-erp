import type { AuthContext } from "./auth";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthContext;
    }
  }
}

export {};
