import { DurableObject } from "cloudflare:workers";
import GridManager, { Cell } from "./gridManager";

export class MyDurableObject extends DurableObject {
  private gridManager: GridManager;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.gridManager = new GridManager();

    // loading existing grid from DO storage on startup and wake from sleep/hibernation
    this.ctx.blockConcurrencyWhile(async () => {
      const storedCells = await this.ctx.storage.list<Cell>({
        prefix: "cell_",
      });
      for (const [key, cell] of storedCells.entries()) {
        this.gridManager.updateCell(cell);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/grid") {
      return Response.json(this.gridManager.getAllCells(), {
        headers: {
          "Access-Control-Allow-Origin": "*",// 🥀🥀🥀
        },
      });
    }

    if (url.pathname === "/ws") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // using hibernation API to store this websocket in the Durable Object
      this.ctx.acceptWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received message:", data);
      const payload = data.payload;

      if (data.type === "claim_cell") {
        const updatedCell = this.gridManager.claimCell(
          payload.id,
          payload.owner,
        );
        if (updatedCell) {
          await this.ctx.storage.put(`cell_${updatedCell.id}`, updatedCell);
          this.broadcast(
            JSON.stringify({ type: "update_cell", payload: updatedCell }),
          );
        }
      } else if (data.type === "unclaim_cell") {
        const updatedCell = this.gridManager.unclaimCell(
          payload.id,
          payload.owner,
        );
        if (updatedCell) {
          await this.ctx.storage.put(`cell_${updatedCell.id}`, updatedCell);
          this.broadcast(
            JSON.stringify({ type: "update_cell", payload: updatedCell }),
          );
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    console.log(`WebSocket connection closed: ${code} ${reason}`);
  }

  async webSocketError(ws: WebSocket, error: any) {
    console.error("WebSocket error:", error);
  }

  private broadcast(message: string) {
    // getWebSockets() returns all websockets accepted via acceptWebSocket()
    const websockets = this.ctx.getWebSockets();
    console.log(
      `Broadcasting message to ${websockets.length} clients:`,
      message,
    );
    for (const ws of websockets) {
      try {
        ws.send(message);
      } catch (e) {
        console.error("Error sending to websocket", e);
      }
    }
  }
}
