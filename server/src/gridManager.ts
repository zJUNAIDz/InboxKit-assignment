export interface Cell {
  id: number;
  owner: string | null;
  // version: number;
  isClaimed: boolean;
}

class GridManager {
  private grid: Map<number, Cell>;

  constructor() {
    this.grid = new Map<number, Cell>();
    for (let i = 0; i < 500; i++) {
      this.grid.set(i, { id: i, owner: null, isClaimed: false });
    }
  }

  getCell(id: number): Cell | undefined {
    return this.grid.get(id);
  }

  updateCell(updatedCell: Cell): void {
    console.log("updating cell:", updatedCell.id);
    const currentCell = this.grid.get(updatedCell.id);
    if (!currentCell) return;
    this.grid.set(updatedCell.id, updatedCell);

    // // Only update if the incoming version is newer
    // if (updatedCell.version > currentCell.version) {
    // console.log(
    //   `Cell ${updatedCell.id} updated to version ${updatedCell.version}`,
    // );
    // }
  }
  claimCell(id: number, owner: string): Cell | null {
    const cell = this.grid.get(id);
    if (!cell || cell.isClaimed) {
      return null; // Cell is already claimed or doesn't exist
    }
    const updatedCell: Cell = {
      ...cell,
      owner,
      isClaimed: true,
    };
    this.grid.set(id, updatedCell);
    return updatedCell;
  }
  unclaimCell(id: number, owner: string): Cell | null {
    const cell = this.grid.get(id);
    if (!cell || !cell.isClaimed || cell.owner !== owner) {
      return null; // Cell is not claimed, doesn't exist, or owned by someone else
    }
    const updatedCell: Cell = {
      ...cell,
      owner: null,
      isClaimed: false,
    };
    this.grid.set(id, updatedCell);
    return updatedCell;
  }
  getAllCells(): Cell[] {
    return Array.from(this.grid.values());
  }
}

export default GridManager;
