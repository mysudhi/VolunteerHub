import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`VolunteerHub API listening on port ${port}`);
});
