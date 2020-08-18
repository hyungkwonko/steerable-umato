<!-- https://svelte.dev/repl/area-chart?version=3.24.1 -->

<script>
	import * as d3 from 'd3';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'
    import data from './result.json'

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }

    console.log(data);

    let el;
	
    const svgWidth = 550
    const svgHeight = 550
    const margin = { top: 20, right: 15, bottom: 20, left: 25 };
    let width = svgWidth - margin.left - margin.right
    let height = svgHeight - margin.top - margin.bottom
    
	data.forEach((d) => {
        d.iter = +d.iter;
        d.dtm01 = +d.dtm01;
		d.ce = +d.ce;
    });

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    
    console.log(data[0]);

	$: xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([margin.left, width - margin.right]);

	$: yScale = d3.scaleLinear()
		.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
        .range([height - margin.bottom, margin.top]);

	$: minX = d3.min(data, d => d.iter);
	$: maxX = d3.max(data, d => d.iter);
	$: path = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.dtm01)}`).join('L')}`;
	$: path2 = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.dtm1)}`).join('L')}`;
	$: path3 = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.ce)}`).join('L')}`;
	// $: area = `${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`;

	function formatMobile (tick) {
		return "'" + tick % 100;
	}

    let path;
    $: {
        path = data.map((d, i) => {
            return {
                x: xScale(d.iter),
                y: yScale(d.dtm01),
            }
        })
    }

	onMount(() => {
        console.log("zzzzzzzz");
		d3.select(el)
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.style("width", function(d) {
				return d + "px";
			})
			.text(function(d) {
				return d;
			});
	});

</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg>
		<!-- y axis -->
		<g class="axis y-axis" transform="translate(0, {margin.top})">
			{#each yTicks as tick}
				<g class="tick tick-{tick}" transform="translate(0, {yScale(tick) - margin.bottom})">
					<line x2="100%"></line>
					<text y="-4">{tick}</text>
					<!-- <text y="-4">{tick} {tick === 1 ? '.0 y axis' : ''}</text> -->
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each xTicks as tick}
				<g class="tick tick-{ tick }" transform="translate({xScale(tick)},{height})">
					<line y1="-{height}" y2="-{margin.bottom}" x1="0" x2="0"></line>
					<text y="-2">{width > 380 ? tick : formatMobile(tick)}</text>
				</g>
			{/each}
		</g>

		<!-- data -->
		<!-- <path class="path-area" d={area}></path> -->
		<path class="path-line path-line-green" d={path}></path>
		<!-- <path class="path-line path-line-red" d={path2}></path>
		<path class="path-line path-line-blue" d={path3}></path> -->
	</svg>
</div>

<style>
	.chart, h2, p {
		width: 100%;
		/* max-width: 500px; */
		margin-left: auto;
		margin-right: auto;
	}

	svg {
		position: relative;
		width: 100%;
		height: 400px;
		overflow: visible;
	}

	.tick {
		font-size: .725em;
		font-weight: 200;
	}

	.tick line {
		stroke: #aaa;
		stroke-dasharray: 2;
	}

	.tick text {
		fill: #666;
		text-anchor: start;
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}

	.x-axis .tick text {
		text-anchor: middle;
	}

	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}

    .path-line-green {
		stroke: green;
    }

    .path-line-red {
		stroke: red;
    }

    .path-line-blue {
		stroke: blue;
    }

    .path-area {
		fill: rgba(0, 128, 0, 0.2);
	}
</style>