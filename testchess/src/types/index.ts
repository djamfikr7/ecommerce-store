export interface Position {
  row: number;
  col: number;
}

export interface PieceData {
  type: string;
  color: "w" | "b";
  position: Position;
}

export interface GameState {
  board: (PieceData | null)[][];
  currentTurn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: "w" | "b" | null;
}
