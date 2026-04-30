import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/grid", async (c) => {
  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-grid");
  const stub = c.env.MY_DURABLE_OBJECT.get(id);
  return stub.fetch(c.req.raw);
});

app.get("/ws", async (c) => {
  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-grid");
  const stub = c.env.MY_DURABLE_OBJECT.get(id);
  const response = await stub.fetch(c.req.raw);
  
  if (response.status === 101) {
    return response;
  }
  return new Response("Expected websocket", { status: 426 });
});

export default {
  fetch: app.fetch,
};

export { MyDurableObject } from "./DO";