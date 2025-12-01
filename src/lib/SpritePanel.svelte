<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let manifestUrl: string = '/images/miki/miki.json';
	export let action: string = 'idle';
	export let frameDuration: number = 500; // ms

	let frames: string[] = [];
	let current = 0;
	let interval: ReturnType<typeof setInterval> | null = null;
	let portrait: string | null = null;

	async function loadManifest() {
		try {
			const res = await fetch(manifestUrl);
			if (!res.ok) throw new Error('Failed to load manifest');
			const json = await res.json();
			const imgs: string[] = (json.actions && json.actions[action]) || [];
			frames = imgs.map((f) => (f.startsWith('/') ? f : `/images/miki/${f}`));
			portrait = json.portrait
				? json.portrait.startsWith('/')
					? json.portrait
					: `/images/miki/${json.portrait}`
				: null;
		} catch (err) {
			console.error('SpritePanel load error:', err);
			frames = ['/images/girl-placeholder.svg'];
		}
	}

	function start() {
		stop();
		if (!frames || frames.length <= 1) return;
		interval = setInterval(() => {
			current = (current + 1) % frames.length;
		}, frameDuration);
	}

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	onMount(async () => {
		await loadManifest();
		start();
	});

	onDestroy(() => stop());
</script>

<div class="sprite-panel">
	<div class="scene" aria-hidden="false">
		<img src={frames[current]} alt="sprite" class="character" draggable="false" />
		<div class="table"></div>
	</div>

	<div class="gallery">
		{#if portrait}
			<img src={portrait} alt="portrait" class="thumb" />
		{/if}
	</div>
</div>

<style>
	.sprite-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: center;
		width: 100%;
	}

	.scene {
		width: 100%;
		max-width: 320px;
		height: 20rem;
		position: relative;
		background: linear-gradient(180deg, #f7f7f7 0%, #eaeaea 100%);
		border-radius: 10px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding-bottom: 36px;
	}

	.character {
		width: 25rem;
		height: auto;
		z-index: 2;
	}

	.table {
		position: absolute;
		bottom: 18px;
		width: 85%;
		height: 3.5rem;
		z-index: 2;
		border-radius: 6px;
		box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.15);

		background-image: url('/images/table.webp');
		background-repeat: repeat-x;
		background-position: left center;
		background-size: var(--table-tile-size, 64px) auto;
	}

	.gallery {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.thumb {
		width: 64px;
		height: 64px;
		object-fit: contain;
		border-radius: 8px;
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
</style>
