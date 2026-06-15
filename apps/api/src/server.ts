import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

if (!process.env.VERCEL) {
  app.listen(env.API_PORT, () => {
    console.log(
      `School ERP API listening on http://localhost:${env.API_PORT}`,
    );
  });
}

export default app;
module.exports = app;
