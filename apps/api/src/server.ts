import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

/*
 * Local development میں HTTP server start ہوگا۔
 * Vercel پر app کو serverless handler کے طور پر export کیا جائے گا۔
 */
if (!process.env.VERCEL) {
  app.listen(env.API_PORT, () => {
    console.log(
      `School ERP API listening on http://localhost:${env.API_PORT}`,
    );
  });
}

export default app;