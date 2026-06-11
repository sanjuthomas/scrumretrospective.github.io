import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export interface SyncServerHandle {
  apiBase: string;
  port: number;
  stop: () => Promise<void>;
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a free port"));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

export async function waitForHealth(url: string, timeoutMs = 10_000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for sync server at ${url}`);
}

function parseConfiguredApiBase(): string | null {
  const raw = process.env.INTEGRATION_SYNC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/**
 * Uses INTEGRATION_SYNC_API_URL when set (CI background server or Docker).
 * Otherwise spawns server/index.mjs on a free local port for this test run.
 */
export async function acquireSyncServer(): Promise<SyncServerHandle> {
  const configured = parseConfiguredApiBase();
  if (configured) {
    const healthUrl = `${configured}/health`;
    await waitForHealth(healthUrl);
    const port = Number(new URL(configured).port) || 8787;
    return {
      apiBase: configured,
      port,
      stop: async () => undefined,
    };
  }

  return startSyncServer();
}

export async function startSyncServer(): Promise<SyncServerHandle> {
  const port = await getFreePort();
  const serverPath = path.join(ROOT, "server/index.mjs");

  const child: ChildProcess = spawn(process.execPath, [serverPath], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      ALLOWED_ORIGINS: "http://localhost:5173",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
  });

  const apiBase = `http://127.0.0.1:${port}/api`;

  try {
    await waitForHealth(`${apiBase}/health`);
  } catch (error) {
    child.kill("SIGTERM");
    throw new Error(
      `${error instanceof Error ? error.message : "Sync server failed to start"}\n${output}`,
    );
  }

  return {
    apiBase,
    port,
    stop: async () => {
      if (child.killed) return;
      child.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        child.once("exit", () => resolve());
        setTimeout(() => {
          if (!child.killed) child.kill("SIGKILL");
          resolve();
        }, 2_000);
      });
    },
  };
}

export async function apiJson<T>(
  apiBase: string,
  pathname: string,
  init?: RequestInit,
): Promise<{ status: number; body: T }> {
  const response = await fetch(`${apiBase}${pathname}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = (await response.json()) as T;
  return { status: response.status, body };
}
