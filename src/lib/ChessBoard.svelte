<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { 
		loadDefaultChessPieces, 
		loadPieceAnimationFrames,
		type ChessPieceType, 
		type ChessColorType, 
		type SpriteFrame,
		type PieceAnimationFrames
	} from './utils/sprites';

	export let size: number = 8;
	export let board: string = '/assets/boards/chessBoard1.webp';
	export let playerColor: ChessColorType = 'white';

	const rows = Array.from({ length: size });
	const cols = Array.from({ length: size });

	// Tipo para representar uma peça no tabuleiro
	type BoardPiece = {
		color: ChessColorType;
		type: ChessPieceType;
	} | null;

	// Estado do tabuleiro (8x8)
	let boardState: BoardPiece[][] = [];
	let pieceSprites: Record<ChessColorType, Record<ChessPieceType, SpriteFrame>> | null = null;
	let animationFrames: PieceAnimationFrames | null = null;
	let loading = true;

	// Estado da animação
	let selectedPiece: { row: number; col: number } | null = null;
	let currentFrame = 0;
	let animationInterval: ReturnType<typeof setInterval> | null = null;

	// FPS da animação (3fps = 333ms por frame)
	const ANIMATION_FPS = 3;
	const FRAME_DURATION = 1000 / ANIMATION_FPS;

	// Posição inicial das peças de xadrez
	function getInitialBoard(): BoardPiece[][] {
		const board: BoardPiece[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
		
		// Ordem das peças na primeira linha
		const backRow: ChessPieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
		
		// Peças brancas (linhas 6 e 7, índices do array)
		for (let c = 0; c < 8; c++) {
			board[7][c] = { color: 'white', type: backRow[c] };
			board[6][c] = { color: 'white', type: 'pawn' };
		}
		
		// Peças pretas (linhas 0 e 1)
		for (let c = 0; c < 8; c++) {
			board[0][c] = { color: 'black', type: backRow[c] };
			board[1][c] = { color: 'black', type: 'pawn' };
		}
		
		return board;
	}

	// Retorna o sprite da peça na posição (r, c) - reativo ao currentFrame e selectedPiece
	function getPieceSprite(r: number, c: number, frame: number, selected: { row: number; col: number } | null): string | null {
		if (!pieceSprites || !boardState[r] || !boardState[r][c]) return null;
		const piece = boardState[r][c];
		if (!piece) return null;

		// Se esta peça está selecionada e animando, retorna o frame atual da animação
		if (selected && selected.row === r && selected.col === c && animationFrames) {
			const frames = animationFrames[piece.color]?.[piece.type];
			if (frames && frames.length > 0) {
				return frames[frame % frames.length];
			}
		}

		// Caso contrário, retorna o sprite estático
		return pieceSprites[piece.color]?.[piece.type] || null;
	}

	// Inicia a animação para uma peça
	function startAnimation(r: number, c: number) {
		// Para a animação atual
		stopAnimation();

		// Verifica se há uma peça na posição
		if (!boardState[r] || !boardState[r][c]) return;

		// Define a nova peça selecionada
		selectedPiece = { row: r, col: c };
		currentFrame = 0;

		// Inicia o intervalo de animação
		animationInterval = setInterval(() => {
			currentFrame++;
		}, FRAME_DURATION);
	}

	// Para a animação atual
	function stopAnimation() {
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
		}
		selectedPiece = null;
		currentFrame = 0;
	}

	// Handler de clique na casa
	function handleSquareClick(r: number, c: number) {
		const piece = boardState[r]?.[c];
		
		if (!piece) {
			// Clicou em casa vazia, para a animação
			stopAnimation();
			return;
		}

		// Só permite interagir com peças do jogador
		if (piece.color !== playerColor) {
			return;
		}

		// Se clicou na mesma peça, para a animação
		if (selectedPiece && selectedPiece.row === r && selectedPiece.col === c) {
			stopAnimation();
			return;
		}

		// Inicia animação na nova peça
		startAnimation(r, c);
	}

	// Verifica se uma peça está selecionada
	function isSelected(r: number, c: number): boolean {
		return selectedPiece !== null && selectedPiece.row === r && selectedPiece.col === c;
	}

	onMount(async () => {
		boardState = getInitialBoard();
		// Carrega sprites estáticos e frames de animação em paralelo
		[pieceSprites, animationFrames] = await Promise.all([
			loadDefaultChessPieces(),
			loadPieceAnimationFrames()
		]);
		loading = false;
	});

	onDestroy(() => {
		stopAnimation();
	});

	// Variável reativa que depende de pieceSprites para forçar re-render quando carregar
	$: spritesLoaded = pieceSprites !== null;
</script>

<div class="board" style="--n: {size}; background-image: url('{board}');">
	{#each rows as _, r}
		{#each cols as _, c}
			{@const sprite = spritesLoaded ? getPieceSprite(r, c, currentFrame, selectedPiece) : null}
			<div 
				class="square" 
				class:selected={isSelected(r, c)}
				data-coord="{String.fromCharCode(97 + c)}{size - r}"
				on:click={() => handleSquareClick(r, c)}
				on:keydown={(e) => e.key === 'Enter' && handleSquareClick(r, c)}
				role="button"
				tabindex="0"
			>
				{#if sprite}
					<img 
						src={sprite} 
						alt="piece" 
						class="piece"
						class:animating={isSelected(r, c)}
						draggable="false"
					/>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		width: 100%;
		max-width: var(--board-max, min(70vmin, 680px));
		aspect-ratio: 1 / 1;
		overflow: hidden;
		box-shadow: 0 4px 50px rgba(0, 0, 0, 0.5);
		background-position: center center;
		background-size: cover;
	}

	.square {
		width: 100%;
		height: 100%;
		position: relative;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		cursor: pointer;
	}

	.square:focus {
		outline: none;
	}

	.square.selected {
		background: rgba(255, 215, 0, 0.3);
		box-shadow: inset 0 0 0 2px rgba(255, 215, 0, 0.6);
	}

	.square::after {
		content: attr(data-coord);
		position: absolute;
		left: 2px;
		bottom: 1px;
		font-size: 0.6em;
		color: rgba(0, 0, 0, 0.25);
		pointer-events: none;
	}

	.piece {
		width: 85%;
		height: 85%;
		object-fit: contain;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		pointer-events: none;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.piece.animating {
		filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
	}

	:global(.board-wrapper) {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
