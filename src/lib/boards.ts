export const BOARDS: string[] = [
  '/assets/boards/chessBoard1.webp',
  '/assets/boards/chessBoard2.webp',
  '/assets/boards/chessBoard3.webp',
  '/assets/boards/chessBoard4.webp',
  '/assets/boards/chessBoard5.webp'
];

export function getDefaultBoard(): string {
  return BOARDS[0];
}
