import type { Cell } from './types';

interface CellProps {
  cell: Cell;
  handleClick: (cell: Cell) => void;
}

const CellBox = ({ cell, handleClick }: CellProps) => {
  return (
    <button
      type="button"
      onClick={() => handleClick(cell)}
      className={cell.isClaimed ? `cell is-claimed` : 'cell'}
      aria-label={`Cell ${cell.id}`}
    >
      <span className="cell-id">#{cell.id}</span>
      <span className="cell-owner">{cell.isClaimed ? `Claimed by ${cell.owner}` : 'Open'}</span>
    </button>
  );
};

export default CellBox;