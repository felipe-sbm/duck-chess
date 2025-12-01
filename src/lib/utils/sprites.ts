/**
 * Funções utilitárias para separar sprite sheets em frames individuais.
 * São feitas para uso no browser (usa Image + Canvas).
 */

export type SpriteFrame = string; // data URL

/**
 * Carrega uma imagem a partir de uma URL e retorna o elemento HTMLImageElement.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Divide um sprite sheet em frames individuais.
 * @param url URL do sprite sheet (pode ser relativo em `static/`)
 * @param columns número de frames por linha
 * @param rows número de linhas no sprite sheet (padrão 1)
 * @returns Promise com array de data-URLs (PNG) de cada frame, na ordem linha-major
 */
export async function splitSpriteSheet(url: string, columns: number, rows = 1): Promise<SpriteFrame[]> {
  const img = await loadImage(url);
  const frameWidth = Math.floor(img.width / columns);
  const frameHeight = Math.floor(img.height / rows);

  const canv = document.createElement('canvas');
  canv.width = frameWidth;
  canv.height = frameHeight;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const frames: SpriteFrame[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.drawImage(
        img,
        c * frameWidth,
        r * frameHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );
      frames.push(canv.toDataURL('image/png'));
    }
  }

  return frames;
}

/**
 * Dado um array de URLs de sprite sheets e configuração de frames, retorna um mapa
 * de url -> frames[] para facilitar o carregamento em lote.
 */
export async function splitMultipleSpriteSheets(
  items: { url: string; columns: number; rows?: number }[]
): Promise<Record<string, SpriteFrame[]>> {
  const results: Record<string, SpriteFrame[]> = {};
  await Promise.all(
    items.map(async (it) => {
      results[it.url] = await splitSpriteSheet(it.url, it.columns, it.rows ?? 1);
    })
  );
  return results;
}

/**
 * Configuração para extrair um sprite específico do spritesheet.
 * @param column coluna do sprite (0-indexed)
 * @param row linha do sprite (0-indexed)
 */
export interface SpritePosition {
  column: number;
  row: number;
}

/**
 * Configuração de uma peça de xadrez no spritesheet.
 * @param name nome identificador da peça (ex: 'white-king', 'black-pawn')
 * @param position posição no spritesheet
 */
export interface ChessPieceConfig {
  name: string;
  position: SpritePosition;
}

/**
 * Extrai um único sprite de uma posição específica do spritesheet.
 * @param url URL do sprite sheet
 * @param column coluna do sprite (0-indexed)
 * @param row linha do sprite (0-indexed)
 * @param frameWidth largura de cada frame em pixels
 * @param frameHeight altura de cada frame em pixels
 * @returns Promise com data-URL (PNG) do sprite
 */
export async function extractSprite(
  url: string,
  column: number,
  row: number,
  frameWidth: number,
  frameHeight: number
): Promise<SpriteFrame> {
  const img = await loadImage(url);

  const canv = document.createElement('canvas');
  canv.width = frameWidth;
  canv.height = frameHeight;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.clearRect(0, 0, frameWidth, frameHeight);
  ctx.drawImage(
    img,
    column * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    0,
    0,
    frameWidth,
    frameHeight
  );

  return canv.toDataURL('image/png');
}

/**
 * Extrai múltiplos sprites de posições específicas do spritesheet.
 * Útil para peças de xadrez onde cada peça pode estar em posições diferentes.
 * 
 * @param url URL do sprite sheet
 * @param pieces configuração de cada peça com nome e posição
 * @param frameWidth largura de cada frame em pixels
 * @param frameHeight altura de cada frame em pixels
 * @returns Promise com objeto mapeando nome da peça -> data-URL
 * 
 * @example
 * ```typescript
 * const pieces = await extractChessPieces('/assets/pieces/pieces.webp', [
 *   { name: 'white-king', position: { column: 0, row: 0 } },
 *   { name: 'white-queen', position: { column: 1, row: 0 } },
 *   { name: 'black-king', position: { column: 4, row: 0 } },
 *   { name: 'black-pawn', position: { column: 5, row: 5 } },
 * ], 16, 16);
 * 
 * // Usar: pieces['white-king'], pieces['black-pawn'], etc.
 * ```
 */
export async function extractChessPieces(
  url: string,
  pieces: ChessPieceConfig[],
  frameWidth: number,
  frameHeight: number
): Promise<Record<string, SpriteFrame>> {
  const img = await loadImage(url);

  const canv = document.createElement('canvas');
  canv.width = frameWidth;
  canv.height = frameHeight;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const results: Record<string, SpriteFrame> = {};

  for (const piece of pieces) {
    const { name, position } = piece;
    const { column, row } = position;

    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(
      img,
      column * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );

    results[name] = canv.toDataURL('image/png');
  }

  return results;
}

/**
 * Configuração para um conjunto completo de peças de uma cor.
 * Cada peça pode ter coluna e linha diferentes no spritesheet.
 */
export interface ColorPiecesConfig {
  king: SpritePosition;
  queen: SpritePosition;
  bishop: SpritePosition;
  knight: SpritePosition;
  rook: SpritePosition;
  pawn: SpritePosition;
}

/**
 * Configuração completa para extrair todas as peças de xadrez.
 */
export interface FullChessConfig {
  white: ColorPiecesConfig;
  black: ColorPiecesConfig;
  green?: ColorPiecesConfig;
  blue?: ColorPiecesConfig;
}

export type ChessPieceType = 'king' | 'queen' | 'bishop' | 'knight' | 'rook' | 'pawn';
export type ChessColorType = 'white' | 'black' | 'green' | 'blue';

/**
 * Extrai um conjunto completo de peças de xadrez com configuração por cor.
 * 
 * @param url URL do sprite sheet
 * @param config configuração de posições para cada cor e peça
 * @param frameWidth largura de cada frame em pixels
 * @param frameHeight altura de cada frame em pixels
 * @returns Promise com objeto organizado por cor e tipo de peça
 * 
 * @example
 * ```typescript
 * const pieces = await loadChessPiecesWithConfig('/assets/pieces/pieces.webp', {
 *   white: {
 *     king: { column: 0, row: 0 },
 *     queen: { column: 1, row: 0 },
 *     bishop: { column: 2, row: 0 },
 *     knight: { column: 3, row: 0 },
 *     rook: { column: 0, row: 1 },
 *     pawn: { column: 1, row: 1 },
 *   },
 *   black: {
 *     king: { column: 4, row: 0 },
 *     queen: { column: 5, row: 0 },
 *     // ... etc
 *   },
 * }, 16, 16);
 * 
 * // Usar: pieces.white.king, pieces.black.pawn, etc.
 * ```
 */
export async function loadChessPiecesWithConfig(
  url: string,
  config: FullChessConfig,
  frameWidth: number,
  frameHeight: number
): Promise<Record<ChessColorType, Record<ChessPieceType, SpriteFrame>>> {
  const img = await loadImage(url);

  const canv = document.createElement('canvas');
  canv.width = frameWidth;
  canv.height = frameHeight;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const extractSingle = (pos: SpritePosition): SpriteFrame => {
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(
      img,
      pos.column * frameWidth,
      pos.row * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
    return canv.toDataURL('image/png');
  };

  const extractColorSet = (colorConfig: ColorPiecesConfig): Record<ChessPieceType, SpriteFrame> => ({
    king: extractSingle(colorConfig.king),
    queen: extractSingle(colorConfig.queen),
    bishop: extractSingle(colorConfig.bishop),
    knight: extractSingle(colorConfig.knight),
    rook: extractSingle(colorConfig.rook),
    pawn: extractSingle(colorConfig.pawn),
  });

  const result: Record<ChessColorType, Record<ChessPieceType, SpriteFrame>> = {
    white: extractColorSet(config.white),
    black: extractColorSet(config.black),
    green: config.green ? extractColorSet(config.green) : {} as Record<ChessPieceType, SpriteFrame>,
    blue: config.blue ? extractColorSet(config.blue) : {} as Record<ChessPieceType, SpriteFrame>,
  };

  return result;
}

/**
 * Configuração padrão para o spritesheet de peças 10x12 (16x16 cada).
 * O spritesheet tem 4 cores de peças distribuídas em grupos de colunas.
 * 
 * Layout aproximado (colunas 0-9, linhas 0-11):
 * - Colunas 0-1: Peças brancas (variações)
 * - Colunas 2-3: Peças pretas (variações)  
 * - Colunas 5-6: Peças vermelhas (variações)
 * - Colunas 7-8: Peças azuis/verdes (variações)
 * 
 * Ajuste as posições conforme seu spritesheet específico.
 */
export const DEFAULT_CHESS_PIECES_CONFIG: FullChessConfig = {
  blue: {
    pawn: { column: 0, row: 0 },
    rook: { column: 1, row: 1 },
    knight: { column: 1, row: 2 },
    bishop: { column: 2, row: 3 },
    queen: { column: 1, row: 4 },
    king: { column: 2, row: 5 },
  },
  green: {
    pawn: { column: 5, row: 0 },
    rook: { column: 6, row: 1 },
    knight: { column: 6, row: 2 },
    bishop: { column: 7, row: 3 },
    queen: { column: 6, row: 4 },
    king: { column: 7, row: 5 },
  },
  white: {
    pawn: { column: 0, row: 6 },
    rook: { column: 1, row: 7 },
    knight: { column: 1, row: 8 },
    bishop: { column: 2, row: 9 },
    queen: { column: 1, row: 10 },
    king: { column: 2, row: 11 },
  },
  black: {
    pawn: { column: 5, row: 6 },
    rook: { column: 6, row: 7 },
    knight: { column: 6, row: 8 },
    bishop: { column: 7, row: 9 },
    queen: { column: 6, row: 10 },
    king: { column: 7, row: 11 },
  }
};

/** Tamanho padrão de cada sprite no spritesheet de peças */
export const CHESS_SPRITE_SIZE = 16;

/**
 * Carrega as peças de xadrez do spritesheet padrão.
 * Usa a configuração DEFAULT_CHESS_PIECES_CONFIG.
 * 
 * @param url URL do spritesheet (padrão: '/assets/pieces/pieces.webp')
 * @param config Configuração customizada (opcional)
 * @returns Promise com objeto organizado por cor e tipo de peça
 * 
 * @example
 * ```typescript
 * import { loadDefaultChessPieces } from '$lib/utils/sprites';
 * 
 * const pieces = await loadDefaultChessPieces();
 * 
 * // Usar nos componentes:
 * // <img src={pieces.white.king} alt="White King" />
 * // <img src={pieces.black.queen} alt="Black Queen" />
 * ```
 */
export async function loadDefaultChessPieces(
  url: string = '/assets/pieces/pieces.webp',
  config: FullChessConfig = DEFAULT_CHESS_PIECES_CONFIG
): Promise<Record<ChessColorType, Record<ChessPieceType, SpriteFrame>>> {
  return loadChessPiecesWithConfig(url, config, CHESS_SPRITE_SIZE, CHESS_SPRITE_SIZE);
}

/**
 * Configuração de animação para cada cor.
 * Define as colunas inicial e final para a animação de seleção.
 */
export interface AnimationColumnsConfig {
  startColumn: number;
  endColumn: number;
}

/**
 * Configuração padrão de animação por cor:
 * - Branco e Azul: colunas 0-3 (4 frames)
 * - Verde e Preto: colunas 5-8 (4 frames)
 */
export const DEFAULT_ANIMATION_COLUMNS: Record<ChessColorType, AnimationColumnsConfig> = {
  white: { startColumn: 1, endColumn: 4 },
  blue: { startColumn: 1, endColumn: 4 },
  green: { startColumn: 6, endColumn: 9 },
  black: { startColumn: 6, endColumn: 9 },
};

/**
 * Extrai os frames de animação para uma peça específica.
 * A animação percorre as colunas de startColumn até endColumn na mesma linha.
 * 
 * @param url URL do sprite sheet
 * @param row linha da peça no spritesheet
 * @param startColumn coluna inicial da animação
 * @param endColumn coluna final da animação (inclusive)
 * @param frameWidth largura de cada frame em pixels
 * @param frameHeight altura de cada frame em pixels
 * @returns Promise com array de data-URLs (frames da animação)
 */
export async function extractAnimationFrames(
  url: string,
  row: number,
  startColumn: number,
  endColumn: number,
  frameWidth: number = CHESS_SPRITE_SIZE,
  frameHeight: number = CHESS_SPRITE_SIZE
): Promise<SpriteFrame[]> {
  const img = await loadImage(url);

  const canv = document.createElement('canvas');
  canv.width = frameWidth;
  canv.height = frameHeight;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const frames: SpriteFrame[] = [];

  for (let col = startColumn; col <= endColumn; col++) {
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(
      img,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
    frames.push(canv.toDataURL('image/png'));
  }

  return frames;
}

/**
 * Tipo para armazenar todos os frames de animação de todas as peças.
 */
export type PieceAnimationFrames = Record<ChessColorType, Record<ChessPieceType, SpriteFrame[]>>;

/**
 * Carrega todos os frames de animação para todas as peças.
 * Usa a configuração DEFAULT_CHESS_PIECES_CONFIG para obter a linha de cada peça
 * e DEFAULT_ANIMATION_COLUMNS para as colunas de animação de cada cor.
 * 
 * @param url URL do spritesheet (padrão: '/assets/pieces/pieces.webp')
 * @returns Promise com objeto organizado por cor e tipo de peça, cada um contendo array de frames
 * 
 * @example
 * ```typescript
 * const animFrames = await loadPieceAnimationFrames();
 * 
 * // animFrames.white.king = ['frame1', 'frame2', 'frame3', 'frame4']
 * // animFrames.black.pawn = ['frame1', 'frame2', 'frame3', 'frame4']
 * ```
 */
export async function loadPieceAnimationFrames(
  url: string = '/assets/pieces/pieces.webp',
  config: FullChessConfig = DEFAULT_CHESS_PIECES_CONFIG,
  animConfig: Record<ChessColorType, AnimationColumnsConfig> = DEFAULT_ANIMATION_COLUMNS
): Promise<PieceAnimationFrames> {
  const img = await loadImage(url);

  const canv = document.createElement('canvas');
  canv.width = CHESS_SPRITE_SIZE;
  canv.height = CHESS_SPRITE_SIZE;
  const ctx = canv.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const extractFramesForPiece = (row: number, startCol: number, endCol: number): SpriteFrame[] => {
    const frames: SpriteFrame[] = [];
    for (let col = startCol; col <= endCol; col++) {
      ctx.clearRect(0, 0, CHESS_SPRITE_SIZE, CHESS_SPRITE_SIZE);
      ctx.drawImage(
        img,
        col * CHESS_SPRITE_SIZE,
        row * CHESS_SPRITE_SIZE,
        CHESS_SPRITE_SIZE,
        CHESS_SPRITE_SIZE,
        0,
        0,
        CHESS_SPRITE_SIZE,
        CHESS_SPRITE_SIZE
      );
      frames.push(canv.toDataURL('image/png'));
    }
    return frames;
  };

  const pieceTypes: ChessPieceType[] = ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'];
  const colors: ChessColorType[] = ['white', 'black', 'green', 'blue'];

  const result: PieceAnimationFrames = {
    white: {} as Record<ChessPieceType, SpriteFrame[]>,
    black: {} as Record<ChessPieceType, SpriteFrame[]>,
    green: {} as Record<ChessPieceType, SpriteFrame[]>,
    blue: {} as Record<ChessPieceType, SpriteFrame[]>,
  };

  for (const color of colors) {
    const colorConfig = config[color];
    if (!colorConfig) continue;

    const { startColumn, endColumn } = animConfig[color];

    for (const pieceType of pieceTypes) {
      const piecePos = colorConfig[pieceType];
      if (piecePos) {
        result[color][pieceType] = extractFramesForPiece(piecePos.row, startColumn, endColumn);
      }
    }
  }

  return result;
}
