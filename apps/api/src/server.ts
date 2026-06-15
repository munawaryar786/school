import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

/**
 * Local development mein normal HTTP server start hota hai.
 * Vercel par Express app serverless function ke taur par export hoti hai.
 */
if (!process.env.VERCEL) {
  app.listen(env.API_PORT, () => {
    console.log(
      `School ERP API listening on http://localhost:${env.API_PORT}`,
    );
  });
}

module.exports = app;