<script lang="ts">
	export let size: number = 8;
	export let board: string = '/assets/boards/chessBoard1.webp';

	const rows = Array.from({ length: size });
	const cols = Array.from({ length: size });
</script>

<div class="board" style="--n: {size}; background-image: url('{board}');">
	{#each rows as _, r}
		{#each cols as _, c}
			<div class="square" data-coord="{String.fromCharCode(97 + c)}{size - r}"></div>
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
	}

	.square::after {
		content: attr(data-coord);
		position: absolute;
		left: 10px;
		top: 5px;
		font-size: 15px;
		color: rgba(0, 0, 0, 0.25);
	}

	:global(.board-wrapper) {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
