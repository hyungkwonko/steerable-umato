<!-- https://svelte.dev/repl/area-chart?version=3.24.1 -->
<!-- https://github.com/sveltejs/svelte/issues/3050 -->
<!-- https://svelte.dev/repl/ac35bd02ee76441592b1ded00ac3c515?version=3.5.2 -->
<!-- https://svelte.dev/repl/b4c485ee69484fd8a63b8dc07c3b20a2?version=3.4.1 -->
<!-- https://svelte.dev/repl/da70a84eb31c4ddda94122ae17768c19?version=3.17.2 -->

<script>
	import * as d3 from 'd3';
    import data from './globalresult.json'
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'

    export let globalClicked = false;

    let counter = 0;
    let flag = true;
    let tmpData;

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }

	onMount(() => {
    });

    beforeUpdate(() => {
        if(globalClicked && flag) {
            flag = false
            const interval = setInterval(() => {
                if (counter < 10) counter++;
            }, 1000);
            return () => clearInterval(interval);
        }
	});

	afterUpdate(() => {
        tmpData = data.slice(0, counter + 1)

        // remove chart when stopped
        if(!globalClicked) {
            counter = 0
            tmpData = data.slice(0, counter + 1)
        }
	});

    let measures = ["dtm01", "dtm1", "ce"]

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
        d.dtm01 = +d.dtm01;
		d.ce = +d.ce;
    });

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
	$: xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([margin.left, width - margin.right]);

	$: yScale = d3.scaleLinear()
		.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
        .range([height - margin.bottom, margin.top]);

	$: minX = d3.min(data, d => d.iter);
    $: maxX = d3.max(data, d => d.iter);
    
    let path;
    let path2;
    let path3;

    $: if (counter > 0) {
        path = `M${tmpData.map(d => `${xScale(d.iter)}, ${yScale(d.dtm01)}`).join('L')}`;
        path2 = `M${tmpData.map(d => `${xScale(d.iter)}, ${yScale(d.dtm1)}`).join('L')}`;
        path3 = `M${tmpData.map(d => `${xScale(d.iter)}, ${yScale(d.ce)}`).join('L')}`;
    }
    // $: dot = data.map(d => `${xScale(d.iter)}, ${yScale(d.dtm01)}`);
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

        <!-- x axis label -->
        <text x='{(width - margin.left) / 2}' y='{height}' font-size="12px">Iteration #</text>


        {#if counter > 0}
    		<!-- line chart -->
            <path class="path-line path-line-dtm01" d={path}></path>
            <path class="path-line path-line-dtm1" d={path2}></path>
            <path class="path-line path-line-ce" d={path3}></path>
	    	<!-- <path class="path-area" d={area}></path> -->

            <!-- circles -->
            {#each tmpData as d, i}
                {#if !hs || i != targetIndex}
                    <circle class="circle-line circle-dtm01"
                        r={r}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.dtm01)}'
                        on:mouseover={(e) => hoverState(e, d, i)}
                    ></circle>
                    <circle class="circle-line circle-dtm1"
                        r={r}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.dtm1)}'
                        on:mouseover={(e) => hoverState(e, d, i)}
                    ></circle>
                    <circle class="circle-line circle-ce"
                        r={r}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.ce)}'
                        on:mouseover={(e) => hoverState(e, d, i)}
                    ></circle>
                {:else}
                    <circle class="circle-line circle-dtm01"
                        r={10}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.dtm01)}'
                        on:mouseout={(e) => hoverStateOut(e, d, i)}
                    ></circle>
                    <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.dtm01) - textMargin}'>{d.dtm01}</text>
                    <circle class="circle-line circle-dtm1"
                        r={10}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.dtm1)}'
                        on:mouseout={(e) => hoverStateOut(e, d, i)}
                    ></circle>
                    <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.dtm1) - textMargin}'>{d.dtm1}</text>
                    <circle class="circle-line circle-ce"
                        r={10}
                        cx='{xScale(d.iter)}'
                        cy='{yScale(d.ce)}'
                        on:mouseout={(e) => hoverStateOut(e, d, i)}
                    ></circle>
                    <text x='{xScale(d.iter) + textMargin}' y='{yScale(d.ce) - textMargin}'>{d.ce}</text>
                {/if}
            {/each}

            <!-- legend -->
            {#each measures as measure, i}
                <circle class="circle-line circle-{measure}"
                    r={r}
                    cx='{width - 90}'
                    cy='{17 * (i + 1)}'
                ></circle>
                <text x='{width - 70}' y='{19 * (i+1)}' font-size="12px">{measure}</text>
            {/each}
        {/if}

	</svg>
</div>

<style>
    .circle-line {
        fill-opacity: 0.7;
        stroke: #eee;
        stroke-width: 1.5;
    }

    .circle-dtm01 {
        fill: green;
    }
    .circle-dtm1 {
        fill: blue;
    }
    .circle-ce {
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

    .path-line-dtm01 {
		stroke: green;
    }
    .path-line-dtm1 {
		stroke: blue;
    }
    .path-line-ce {
		stroke: red;
    }


    .path-area {
		fill: rgba(0, 128, 0, 0.2);
	}
</style>