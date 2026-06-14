import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const databaseDir = path.resolve(process.env.PGDATA_DIR ?? ".data/postgres16");
const port = Number(process.env.PGPORT ?? 5433);
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "school_erp",
  password: "school_erp",
  port,
  persistent: true,
  authMethod: "password",
  onLog: (message) => {
    const text = String(message).trim();
    if (text) {
      console.log(`[postgres] ${text}`);
    }
  },
  onError: (message) => {
    const text = String(message).trim();
    if (text) {
      console.error(`[postgres] ${text}`);
    }
  }
});

async function main() {
  console.log(`Starting embedded PostgreSQL in ${databaseDir}`);
  const versionFile = path.join(databaseDir, "PG_VERSION");
  const alreadyInitialised = await fs
    .access(versionFile)
    .then(() => true)
    .catch(() => false);
  if (!alreadyInitialised) {
    await pg.initialise();
  }
  await pg.start();

  try {
    await pg.createDatabase("school_erp");
    console.log("Created database school_erp");
  } catch (error) {
    const message = String(error);
    if (!message.includes("already exists")) {
      throw error;
    }
    console.log("Database school_erp already exists");
  }

  console.log(`Embedded PostgreSQL is ready on localhost:${port}`);
  await new Promise(() => {
    setInterval(() => undefined, 60_000);
  });
}

process.on("SIGINT", async () => {
  await pg.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pg.stop();
  process.exit(0);
});

main().catch(async (error) => {
  console.error(error);
  await pg.stop().catch(() => undefined);
  process.exit(1);
});
