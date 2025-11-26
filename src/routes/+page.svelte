<script lang="ts">
	import ChessBoard from '$lib/ChessBoard.svelte';
	import SpritePanel from '$lib/SpritePanel.svelte';
	import { BOARDS, getDefaultBoard } from '$lib/boards';

	const images = ['/images/girl-placeholder.svg'];
	let selectedBoard: string = getDefaultBoard();
</script>

<div class="page">
  <div class="left">
    <div class="panel-inner">
      <SpritePanel manifestUrl="/images/miki/miki.json" action="idle" frameDuration={600} />
    </div>
  </div>

	<div class="right">
		<div class="panel-inner">
			<div class="controls">
				<label for="board-select">Tipo de tabuleiro:</label>
				<select id="board-select" bind:value={selectedBoard}>
					{#each BOARDS as b, i}
						<option value={b}>{i + 1}</option>
					{/each}
				</select>
			</div>

			<div class="board-wrapper" aria-hidden="false" style="--board-max: min(60vmin,44vw);">
				<ChessBoard size={8} board={selectedBoard} />
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		display: flex;
		gap: 0;
		align-items: stretch;
		justify-content: center;
		height: 100vh;
		padding: 0;
		box-sizing: border-box;

		image-rendering: -moz-crisp-edges;
		image-rendering: -o-pixelated;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
		image-rendering: pixelated;
		-ms-interpolation-mode: nearest-neighbor;
	}

	.left,
	.right {
		width: 50%;
		flex: 0 0 50%;
		display: flex;
		align-items: stretch;
		justify-content: center;
		padding: 0;
		box-sizing: border-box;
		min-height: 100%;
	}

	.panel-inner {
		width: 100%;
		height: 100%;
		padding: 28px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.right {
		background-image: url('/images/table.webp');
		background-repeat: repeat;
		background-position: top left;
		background-size: var(--table-size, 64px);
	}

	.controls {
		display: flex;
		gap: 12px;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
		flex-shrink: 0;
	}

	.board-wrapper {
		width: 100%;
		max-width: var(--board-max, min(70vmin, 680px));
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1 1 auto;
		overflow: hidden;
	}

	@media (max-width: 820px) {
		.page {
			flex-direction: column;
			height: 100vh;
		}
		.left,
		.right {
			width: 100%;
			flex: 0 0 auto;
		}
		.panel-inner {
			padding: 12px;
		}
		.board-wrapper { max-width: 90vw; }
	}
</style>
