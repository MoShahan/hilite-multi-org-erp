import "dotenv/config";
import "./types/express";
import app from "./app";
import { env } from "./config/env";
import { connectPrisma, disconnectPrisma } from "./lib/prisma";

const start = async () => {
  await connectPrisma();

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
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
