export interface Cell {
  id: number;
  owner: string | null;
  // version: number;
  isClaimed: boolean;
}