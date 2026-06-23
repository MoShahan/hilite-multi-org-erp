type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

const resolveLogLevel = (): LogLevel => {
  const configured = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  return LOG_LEVELS.includes(configured as LogLevel)
    ? (configured as LogLevel)
    : "info";
};

const shouldLog = (level: LogLevel): boolean => {
  const configured = resolveLogLevel();
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(configured);
};

const serializeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]),
    );
  }

  return value;
};

const serializeMeta = (meta?: LogMeta): LogMeta | undefined => {
  if (!meta) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, serializeValue(value)]),
  );
};

const write = (level: LogLevel, message: string, meta?: LogMeta): void => {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...serializeMeta(meta),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
