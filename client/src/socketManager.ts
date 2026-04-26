import { QueryClient } from "@tanstack/react-query";
import type { Cell } from "./types";
import { getLocalIdentity } from "./utils";

export interface UpdateCellMessage {
  type: "update_cell";
  payload: Cell;
}
export type ClientMessage =
  | { type: "claim_cell"; payload: { id: number; owner: string } }
  | { type: "unclaim_cell"; payload: { id: number; owner: string } };
export type ServerMessage = { type: "update_cell"; payload: Cell };
class SocketManager {
  private static instance: SocketManager;
  private socket: WebSocket | null = null;
  private queryClient: QueryClient | null = null;
  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  public getSocket(): WebSocket | null {
    return this.socket;
  }

  connect(url: string, queryClient: QueryClient): void {
    if (this.socket) {
      console.warn("WebSocket is already connected.");
      return;
    }
    this.socket = new WebSocket(url);
    this.queryClient = queryClient;

    this.socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    this.socket.onmessage = (event) => {
      const message: ServerMessage = JSON.parse(event.data);
      if (message.type === "update_cell") {
        this.applyCellUpdate(message.payload);
      }
    };

    this.socket.onclose = () => {
      if (this.socket) {
        console.log("WebSocket connection closed.");
        this.socket = null;
      }
    };

    this.socket.onerror = (error) => {
      if (this.socket) {
        this.socket = null;
      }
      console.error("WebSocket error:", error);
    };
  }
  sendMessage(message: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected. Cannot send message.");
      return;
    }
    this.socket.send(message);
  }

  private applyCellUpdate(updatedCell: Cell): void {
    this.queryClient?.setQueryData<Cell[]>(["cells"], (currentCells = []) => {
      const existingIndex = currentCells.findIndex(
        (cell) => cell.id === updatedCell.id,
      );
      if (existingIndex === -1) {
        return [...currentCells, updatedCell];
      }

      return currentCells.map((cell) =>
        cell.id === updatedCell.id ? updatedCell : cell,
      );
    });
  }

  handleCellClick(cell: Cell): void {
    // const updatedCell = { ...cell, version: cell.version + 1, isClaimed: true };
    if (cell.isClaimed && cell.owner === getLocalIdentity().name) {
      const message: ClientMessage = {
        type: "unclaim_cell",
        payload: { id: cell.id, owner: getLocalIdentity().name },
      };
      // this.applyCellUpdate({ ...cell, owner: null, isClaimed: false });
      this.sendMessage(JSON.stringify(message));
      return;
    }
    if (!cell.isClaimed) {
      const message: ClientMessage = {
        type: "claim_cell",
        payload: { id: cell.id, owner: getLocalIdentity().name },
      };
      this.sendMessage(JSON.stringify(message));
      return;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
export default SocketManager;
