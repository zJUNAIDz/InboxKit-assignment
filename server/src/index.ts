import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import GridManager from "./gridManager";
import SocketManager from "./socketManager";

const app = new Hono();
const gridManager = new GridManager();
const socketManager = SocketManager.getInstance();

app.use(cors({
  origin: "*",
  allowHeaders: ["Content-Type"],
  allowMethods: ["GET", "POST", "OPTIONS"],
}));
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.get("/grid", (c) => {
  const grid = gridManager.getAllCells();
  return c.json(grid);
});
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data.toString()}`);
        try {
          const message = JSON.parse(event.data.toString());
          if (message.type === "claim_cell" || message.type === "unclaim_cell") {
            socketManager.handleUpdateCellMessage(message, gridManager);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
      onClose(event, ws) {
        console.log("WebSocket connection closed");
        socketManager.removeClient(ws);
      },
      onError(event, ws) {
        console.error("WebSocket error:", event);
        socketManager.removeClient(ws);
      },
    };
  }),
);

export default app;
