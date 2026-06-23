import "dotenv/config";
import "./types/express";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { connectPrisma, disconnectPrisma } from "./lib/prisma";
import { registerHandlers } from "./lib/registerHandlers";

const start = async () => {
  await connectPrisma();
  registerHandlers();

  const server = app.listen(env.port, () => {
    logger.info("Server running", { port: env.port });
  });

  const shutdown = async (signal: string) => {
    logger.info("Shutting down", { signal });
    server.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};

void start();
