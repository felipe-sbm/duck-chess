// place files you want to import through the `$lib` alias in this folder.

// Sprite utilities
export {
  splitSpriteSheet,
  splitMultipleSpriteSheets,
  extractSprite,
  extractChessPieces,
  loadChessPiecesWithConfig,
  loadDefaultChessPieces,
  loadPieceAnimationFrames,
  extractAnimationFrames,
  DEFAULT_CHESS_PIECES_CONFIG,
  DEFAULT_ANIMATION_COLUMNS,
  CHESS_SPRITE_SIZE,
} from './utils/sprites';

export type {
  SpriteFrame,
  SpritePosition,
  ChessPieceConfig,
  ColorPiecesConfig,
  FullChessConfig,
  ChessPieceType,
  ChessColorType,
  AnimationColumnsConfig,
  PieceAnimationFrames,
} from './utils/sprites';
