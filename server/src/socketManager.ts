import { WSContext } from "hono/ws";
import GridManager, { Cell } from "./gridManager";

// export interface UpdateCellMessage {
//   type: "update_cell";
//   payload: Cell;
// }
type ClientMessage =
  | { type: "claim_cell"; payload: { id: number; owner: string } }
  | { type: "unclaim_cell"; payload: { id: number; owner: string } };
type ServerMessage = { type: "update_cell"; payload: Cell };
class SocketManager {
  private static instance: SocketManager;
  private clients: Set<WSContext> = new Set();
  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  addClient(client: WSContext): void {
    console.log("Adding new client connection", client);
    this.clients.add(client);
  }
  removeClient(client: WSContext): void {
    console.log("Removing client connection", client);
    this.clients.delete(client);
  }

  handleUpdateCellMessage(
    message: ClientMessage,
    gridManager: GridManager,
  ): void {
    const { payload } = message;
    // Update the cell in the grid manager
    if (message.type === "claim_cell") {
      const updatedCell = gridManager.claimCell(payload.id, payload.owner);
      if (!updatedCell) {
        console.warn(
          `Failed to claim cell ${payload.id} for owner ${payload.owner}`,
        );
        return;
      }
    } else if (message.type === "unclaim_cell") {
      const updatedCell = gridManager.unclaimCell(payload.id, payload.owner);
      if (!updatedCell) {
        console.warn(
          `Failed to unclaim cell ${payload.id} for owner ${payload.owner}`,
        );
        return;
      }
    }
    const updatedCell = gridManager.getCell(payload.id);
    if (!updatedCell) {
      console.warn(`Cell ${payload.id} not found in grid manager`);
      return;
    }
    const serverMessage: ServerMessage = {
      type: "update_cell",
      payload: updatedCell,
    };
    // Broadcast the updated cell to all clients
    this.broadcastMessage(JSON.stringify(serverMessage));
  }
  sendMessage(message: string, client: WebSocket): void {
    if (!client || client.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected. Cannot send message.");
      return;
    }
    client.send(message);
  }
  broadcastMessage(message: string): void {
    console.log("Broadcasting message to clients:", message);
    // Broadcast message to all connected clients
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
export default SocketManager;
