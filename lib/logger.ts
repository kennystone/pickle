import fs from "fs";
import path from "path";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== "production";
const LOG_FILE = path.join(process.cwd(), "logs", "app.log");

let fileStreamReady = false;
let fileStream: fs.WriteStream | null = null;

function getFileStream(): fs.WriteStream | null {
  if (!isDev) return null;
  if (fileStreamReady) return fileStream;
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fileStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
    fileStreamReady = true;
  } catch {
    fileStreamReady = true; // don't retry
  }
  return fileStream;
}

function write(level: LogLevel, msg: string, fields?: Record<string, unknown>) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  const line = JSON.stringify(entry) + "\n";

  process.stdout.write(line);

  if (isDev) {
    getFileStream()?.write(line);
  }
}

export const log = {
  info: (msg: string, fields?: Record<string, unknown>) => write("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => write("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => write("error", msg, fields),
};
