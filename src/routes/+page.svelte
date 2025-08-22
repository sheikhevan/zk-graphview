<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as d3 from 'd3';

	export let data;
	let graphJson = data.graph;
	let graphContainer: HTMLDivElement;

	onMount(async () => {
		if (!graphJson && browser) {
			const stored = localStorage.getItem('zk-graph');
			if (stored) {
				graphJson = JSON.parse(stored);
			}
		}
	});

	$: if (graphJson && graphContainer) {
		const nodes = graphJson.notes || [];
		const links = graphJson.links || [];
		createGraph(nodes, links);
	}

	const color = d3.scaleOrdinal(d3.schemeCategory10);

	function extractNodeId(node: any): string {
		return node.metadata?.id || node.filenameStem || '';
	}

	function createGraph(nodes: any[], links: any[]) {
		if (!nodes.length) return;
		if (browser) {
			d3.select(graphContainer).selectAll('*').remove();

			const width = window.innerWidth;
			const height = window.innerHeight;

			const nodesWithIds = nodes.map((node) => ({
				...node,
				id: extractNodeId(node)
			}));

			const transformedLinks = links.map((link) => {
				const sourceNode = nodes.find((node) => node.path === link.sourcePath);
				const targetNode = nodes.find(
					(node) =>
						node.metadata?.id === link.href ||
						node.filename === link.href ||
						node.filenameStem === link.href
				);
				return {
					...link,
					source: sourceNode ? extractNodeId(sourceNode) : link.sourcePath,
					target: targetNode ? extractNodeId(targetNode) : link.href
				};
			});

			const simulation = d3
				.forceSimulation(nodesWithIds)
				.force(
					'link',
					d3.forceLink(transformedLinks).id((d: any) => d.id)
				)
				.force('charge', d3.forceManyBody().strength(-300))
				.force('center', d3.forceCenter(width / 2, height / 2));

			const svg = d3
				.select(graphContainer)
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.style('border', '1px solid #ccc');

			const container = svg.append('g');

			const zoom = d3.zoom().on('zoom', (event) => {
				container.attr('transform', event.transform);
			});

			svg.call(zoom as any);

			const link = container
				.append('g')
				.attr('stroke', '#999')
				.attr('stroke-opacity', 0.6)
				.selectAll('line')
				.data(transformedLinks)
				.join('line')
				.attr('stroke-width', 2);

			const node = container
				.append('g')
				.attr('stroke', '#fff')
				.attr('stroke-width', 1.5)
				.selectAll('circle')
				.data(nodesWithIds)
				.join('circle')
				.attr('r', 8)
				.attr('fill', (d, i) => color(i.toString()));

			const labels = container
				.append('g')
				.selectAll('text')
				.data(nodesWithIds)
				.join('text')
				.text((d) => d.title || d.filenameStem)
				.attr('font-size', '12px')
				.attr('dx', 12)
				.attr('dy', 4);

			node.append('title').text((d) => d.title || d.filenameStem);

			node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended) as any);

			simulation.on('tick', () => {
				link
					.attr('x1', (d: any) => d.source.x)
					.attr('y1', (d: any) => d.source.y)
					.attr('x2', (d: any) => d.target.x)
					.attr('y2', (d: any) => d.target.y);

				node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

				labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
			});

			function dragstarted(event: any) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				event.subject.fx = event.subject.x;
				event.subject.fy = event.subject.y;
			}

			function dragged(event: any) {
				event.subject.fx = event.x;
				event.subject.fy = event.y;
			}

			function dragended(event: any) {
				if (!event.active) simulation.alphaTarget(0);
				event.subject.fx = null;
				event.subject.fy = null;
			}
		}
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

<div bind:this={graphContainer} style="width: 100%; height: 100vh;"></div>
