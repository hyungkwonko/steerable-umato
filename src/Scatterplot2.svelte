<!-- https://svelte.dev/examples#scatterplot -->
<script>
    import * as d3 from 'd3';
	import * as easings from 'svelte/easing';
	import { tweened } from 'svelte/motion';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'
    import data from './umato_large.json'

    export let localClicked = false;
    let counter = 0;
    let flag = true;
    let maxlen = 20

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }

	onMount(() => {
    });

    beforeUpdate(() => {
    });

	afterUpdate(() => {
        if(localClicked && flag) {
            flag = false
            const interval = setInterval(() => {
                if (counter < 20) counter++;
            }, 1000);
            return () => clearInterval(interval);
		}
		
		if (counter < maxlen) {
			member = counter.toString();
			points = data[member]
		}

        // remove chart when stopped
        if(!localClicked) {
			counter = 0
			member = 0
            points = data[member]
        }
	});


	let member = '0';
	let points = data[member];

    let r = 2.5;
    let hs = false;
    let targetIndex = -1;
	
	const tweenedPoints = tweened(points, {
		delay: 0,
		duration: 750,
		easing: easings.cubicOut
    });
    
	const [minX, maxX] = d3.extent($tweenedPoints,(d) => d.x1);
	const [minY, maxY] = d3.extent($tweenedPoints,(d) => d.x2);

    const svgWidth = 600
    const svgHeight = 600
    const margin = { top: 30, right: 15, bottom: 30, left: 25 };

    let width = svgWidth - margin.left - margin.right
    let height = svgHeight - margin.top - margin.bottom
    
	$: xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([margin.left, width - margin.right]);

	$: yScale = d3.scaleLinear()
		.domain([minY, maxY])
		.range([height - margin.bottom, margin.top]);

    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const colorDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const colorScale =  d3.scaleOrdinal()
        .domain(d3.extent(colorDomain))
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);

	function setTween(key) {
		tweenedPoints.set(data[key]);
	}

	$: if (member > 0) {
		setTween(member)
	}

</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg>
		<!-- y axis -->
		<g class="axis y-axis" transform="translate(0, {margin.top})">
			{#each yTicks as tick}
				<g class="tick tick-{tick}" transform="translate(0, {yScale(tick) - margin.bottom / 2})">
					<line x2="100%"></line>
					<text y="-4">{tick}</text>
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each xTicks as tick}
				<g class="tick tick-{ tick }" transform="translate({xScale(tick)},{height + margin.top / 2})">
					<line y1="-{height}" y2="-{margin.bottom}" x1="0" x2="0"></line>
					<text y="-{margin.bottom-10}">{tick}</text>
				</g>
			{/each}
		</g>

		{#if counter > 0}
            <!-- label: NN num -->
            <text x='{width - margin.left - 100}' y='{30}' font-size="12px">NN Num: {points.length}</text>

            {#each points as d, i}
                <circle class="circle-line"
                    r={r}
                    cx='{xScale(d.x1)}'
                    cy='{yScale(d.x2)}'
                    fill='{colorScale(d.label)}'
                ></circle>
            {/each}
        {/if}
    </svg>
</div>

<style>
    .chart, h2, p {
		width: 100%;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	svg {
		position: relative;
		width: 100%;
		height: 600px;
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

    .circle-line {
        fill-opacity: 0.7;
        stroke: black;
        stroke-width: 0.2;
    }
</style>