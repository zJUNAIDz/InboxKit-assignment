import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import CellBox from './Cell';
import { API_BASE_URL } from './constants';
import SocketManager from './socketManager';
import type { Cell } from './types';

const socketManager = SocketManager.getInstance();

const queryClient = useQueryClient();
const Grid = () => {
  const cells = useQuery<Cell[]>({
    queryKey: ['cells'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/grid`);
      return res.data;
    },
    initialData: [],
  });

  useEffect(() => {
    socketManager.connect(`${API_BASE_URL}/ws`, queryClient);
  }, [queryClient]);

  const handleClick = (cell: Cell) => {
    console.log(`Cell ${cell.id} clicked!`);
    socketManager.handleCellClick(cell);
  };

  return (
    <section className="grid-panel" aria-label="Realtime interactive grid">
      <div className="grid-panel-head">
        <p className="grid-hint">Click a tile to claim it</p>
      </div>
      <div className="grid-layout">
        {cells.data.map((cell) => (
          <CellBox key={cell.id} cell={cell} handleClick={handleClick} />
        ))}
      </div>
    </section>
  );
};

export default Grid;