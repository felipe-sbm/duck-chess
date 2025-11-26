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
