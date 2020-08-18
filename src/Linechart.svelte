<!-- https://svelte.dev/repl/area-chart?version=3.24.1 -->
<!-- https://github.com/sveltejs/svelte/issues/3050 -->
<!-- https://svelte.dev/repl/ac35bd02ee76441592b1ded00ac3c515?version=3.5.2 -->
<!-- https://svelte.dev/repl/b4c485ee69484fd8a63b8dc07c3b20a2?version=3.4.1 -->
<!-- https://svelte.dev/repl/da70a84eb31c4ddda94122ae17768c19?version=3.17.2 -->

<script>
	import * as d3 from 'd3';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'
    import data from './result.json'

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }

    console.log(data);

    let r = 5;

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

    $: dot = data.map(d => `${xScale(d.iter)}, ${yScale(d.dtm01)}`);

    // $: area = `${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`;

	function formatMobile(tick) {
		return "'" + tick % 100;
    }
    
    function hoverState1(e, d) {
        console.log(e);
        d3.select(e)
            .attr("r", r * 2)
        d3.select("svg").select("g").append("text")
            .attr("id", 10)
            .attr("x", xScale(d.iter))
            .attr("y", yScale(d.dtm01))
            .style("text-anchor", "end")
            .text("asdsads");
    }

    function hoverState2(e, d) {
        console.log(e);
        d3.select(e)
            .attr("r", r * 2)
        d3.select("svg").select("g").append("text")
            .attr("id", 10)
            .attr("x", xScale(d.iter))
            .attr("y", yScale(d.dtm1))
            .style("text-anchor", "end")
            .text("asdsads");
    }

    function hoverState3(e, d) {
        console.log(e);
        d3.select(e)
            .attr("r", r * 2)
        d3.select("svg").select("g").append("text")
            .attr("id", 10)
            .attr("x", xScale(d.iter))
            .attr("y", yScale(d.ce))
            .style("text-anchor", "end")
            .text("asdsads");
    }

    function hoverState(e) {
        // call all three hoverState1, hoverState2, hoverState3, here
    }
    
    function hoverStateOut(e) {
        d3.select(e)
            .attr("r", 5)
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
					<text y="-2">{width > 380 ? tick : formatMobile(tick)}</text>
				</g>
			{/each}
		</g>

		<!-- data -->
		<!-- <path class="path-area" d={area}></path> -->
        {#each data as d, i}
            <path class="path-line path-line-green" d={path}></path>
            <circle class="circle-line circle-green"
                r={r}
                cx='{xScale(d.iter)}'
                cy='{yScale(d.dtm01)}'
                on:mouseover={(e) => hoverState1(e.currentTarget, d)}
                on:mouseout={(e) => hoverStateOut(e.currentTarget)}
            ></circle>

            <path class="path-line path-line-red" d={path2}></path>
            <circle class="circle-line circle-red"
                r={r}
                cx='{xScale(d.iter)}'
                cy='{yScale(d.dtm1)}'
                on:mouseover={(e) => hoverState2(e.currentTarget, d)}
                on:mouseout={(e) => hoverStateOut(e.currentTarget)}
            ></circle>

            <path class="path-line path-line-blue" d={path3}></path>
            <circle class="circle-line circle-blue"
                r={r}
                cx='{xScale(d.iter)}'
                cy='{yScale(d.ce)}'
                on:mouseover={(e) => hoverState3(e.currentTarget, d)}
                on:mouseout={(e) => hoverStateOut(e.currentTarget)}
            ></circle>

    	{/each}
	</svg>
</div>

<style>
    .circle-line {
        fill-opacity: 0.7;
        stroke: #eee;
        stroke-width: 1.5;
    }

    .circle-green {
        fill: green;
    }
    .circle-blue {
        fill: blue;
    }
    .circle-red {
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