<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" href="/fonts/Micro_5/Micro5-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" href="/fonts/Doto/Doto-VariableFont_ROND,wght.woff2" as="font" type="font/woff2" crossorigin="anonymous">
</svelte:head>
 
<style>
	/* Global body styles must be declared as global so Svelte doesn't scope them */
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f0eade;
	}

	/* Self-hosted fonts: Primary = Micro 5, Secondary = Doto
		 prefer woff2 (smaller, modern browsers) and fallback to ttf if needed */
	@font-face {
		font-family: 'Micro 5';
		src: url('/fonts/Micro_5/Micro5-Regular.woff2') format('woff2');
		font-weight: 400;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Doto';
		src: url('/fonts/Doto/Doto-VariableFont_ROND,wght.woff2') format('woff2');
		font-weight: 100 900;
		font-style: normal;
		font-display: swap;
	}

	:global(:root) {
		--font-primary: 'Micro 5', 'Doto', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	:global(body) {
		font-family: var(--font-primary);
		height: 100vh;
		overflow: hidden;
		box-sizing: border-box;
		color: white;
	}
</style>


{@render children()}
