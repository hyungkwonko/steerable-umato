<script>
	import * as d3 from 'd3';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'
    import data from './localresult.json'

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }

    console.log(data);

    let measures = ["mrre", "continuity", "trust"]


    let r = 5;
    let textMargin = 7;
    let legendMargin;

    let el;

    let hs = false;
    let targetIndex = -1;
	
    const svgWidth = 550
    const svgHeight = 550
    const margin = { top: 20, right: 15, bottom: 30, left: 25 };
    let width = svgWidth - margin.left - margin.right
    let height = svgHeight - margin.top - margin.bottom
    
	data.forEach((d) => {
        d.iter = +d.iter;
        d.mrre = +d.mrre;
		d.trust = +d.trust;
    });

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    
    
    console.log(data[0]);

	$: xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([margin.left, width - margin.right]);

	$: yScale = d3.scaleLinear()
		.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
        .range([height - margin.bottom, margin.top]);

	$: minX = d3.min(data, d => d.iter);
	$: maxX = d3.max(data, d => d.iter);

    $: path = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.mrre)}`).join('L')}`;
	$: path2 = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.continuity)}`).join('L')}`;
	$: path3 = `M${data.map(d => `${xScale(d.iter)}, ${yScale(d.trust)}`).join('L')}`;

    // $: dot = data.map(d => `${xScale(d.iter)}, ${yScale(d.mrre)}`);
    // $: area = `${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`;

	function formatMobile(tick) {
		return "'" + tick % 100;
    }
    
    function hoverState(e, d, i) {
        hs = true;
        targetIndex = i;
    }
    
    function hoverStateOut(e, d, i) {
        hs = false;
        targetIndex = -1;
    }

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
					<text y="-{margin.bottom-5}">{width > 380 ? tick : formatMobile(tick)}</text>
				</g>
			{/each}
		</g>

		<!-- line chart -->
		<!-- <path class="path-area" d={area}></path> -->
        <path class="path-line path-line-mrre" d={path}></path>
        <path class="path-line path-line-continuity" d={path2}></path>
        <path class="path-line path-line-trust" d={path3}></path>

        <!-- axis label -->
        <text x='{(width - margin.left) / 2}' y='{height}' font-size="12px">Iteration #</text>

        <!-- legend -->
        {#each measures as measure, i}
            <circle class="circle-line circle-{measure}"
                r={r}
                cx='{width - 100}'
                cy='{280 + 17 * (i + 1)}'
            ></circle>
            <text x='{width - 80}' y='{280 + 19 * (i+1)}' font-size="12px">{measure}</text>
        {/each}

        <!-- circles -->
        {#each data as d, i}
            {#if !hs || i != targetIndex}
                <circle class="circle-line circle-mrre"
                    r={r}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.mrre)}'
                    on:mouseover={(e) => hoverState(e, d, i)}
                ></circle>
                <circle class="circle-line circle-continuity"
                    r={r}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.continuity)}'
                    on:mouseover={(e) => hoverState(e, d, i)}
                ></circle>
                <circle class="circle-line circle-trust"
                    r={r}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.trust)}'
                    on:mouseover={(e) => hoverState(e, d, i)}
                ></circle>
            {:else}
                <circle class="circle-line circle-mrre"
                    r={10}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.mrre)}'
                    on:mouseout={(e) => hoverStateOut(e, d, i)}
                ></circle>
                <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.mrre) - textMargin}'>{d.mrre}</text>
                <circle class="circle-line circle-continuity"
                    r={10}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.continuity)}'
                    on:mouseout={(e) => hoverStateOut(e, d, i)}
                ></circle>
                <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.continuity) - textMargin}'>{d.continuity}</text>
                <circle class="circle-line circle-trust"
                    r={10}
                    cx='{xScale(d.iter)}'
                    cy='{yScale(d.trust)}'
                    on:mouseout={(e) => hoverStateOut(e, d, i)}
                ></circle>
                <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.trust) - textMargin}'>{d.trust}</text>
            {/if}
        {/each}
	</svg>
</div>

<style>
    .circle-line {
        fill-opacity: 0.7;
        stroke: #eee;
        stroke-width: 1.5;
    }

    .circle-mrre {
        fill: green;
    }
    .circle-continuity {
        fill: blue;
    }
    .circle-trust {
        fill: red;
    }

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

    .path-line-mrre {
		stroke: green;
    }
    .path-line-continuity {
		stroke: blue;
    }
    .path-line-trust {
		stroke: red;
    }


    .path-area {
		fill: rgba(0, 128, 0, 0.2);
	}
</style>