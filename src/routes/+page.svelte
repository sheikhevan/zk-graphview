<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';

	export let data;
	let graphJson = data.graph;

	onMount(async () => {
		if (!graphJson && browser) {
			const stored = localStorage.getItem('zk-graph');
			if (stored) {
				graphJson = JSON.parse(stored);
			}
		}
	});

	$: if (graphJson) {
		const nodes = graphJson.notes || [];
		const links = graphJson.links || [];
		createGraph(nodes, links);
	}

	function createGraph(nodes: any[], links: any[]) {
		if (!graphJson) return;
		console.log(nodes);
		console.log(links);
	}

	function handleUpload(event: Event) {
		let json = (event.target as HTMLInputElement).files?.[0];
		if (json) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result;
				graphJson = JSON.parse(content as string);
				if (browser) {
					window.localStorage.setItem('zk-graph', JSON.stringify(graphJson));
				}
			};
			reader.readAsText(json);
		}
	}
</script>

<input type="file" on:change={handleUpload} accept=".json" />
