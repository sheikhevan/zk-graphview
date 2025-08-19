<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let data;
	let graph = data.graph;

	onMount(() => {
		if (!graph && browser) {
			const stored = localStorage.getItem('zk-graph');
			if (stored) {
				graph = JSON.parse(stored);
			}
		}
	});

	$: if (graph) {
		console.log(graph);
	}

	function handleUpload(event: Event) {
		let json = (event.target as HTMLInputElement).files?.[0];
		if (json) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result;
				graph = JSON.parse(content as string);
				if (browser) {
					window.localStorage.setItem('zk-graph', JSON.stringify(graph));
				}
			};
			reader.readAsText(json);
		}
	}
</script>

<input type="file" on:change={handleUpload} accept=".json" />
