import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(
    `LegisArc API listening on http://localhost:${env.port} (${env.nodeEnv})`
  );
  console.log(`Storage driver: ${env.storageDriver}`);
  console.log(
    `JWT_SECRET loaded (${env.jwtSecret.length} chars) — must match client JWT_SECRET`
  );
});
