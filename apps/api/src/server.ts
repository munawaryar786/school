import app from "./app";
import { env } from "./config/env";

if (!process.env.VERCEL) {
  app.listen(env.API_PORT, () => {
    console.log(
      `School ERP API listening on http://localhost:${env.API_PORT}`,
    );
  });
}

module.exports = app;