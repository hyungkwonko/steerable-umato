<!-- https://svelte.dev/examples#scatterplot -->
<!-- https://svelte.recipes/components/scatterplot/ -->

<script>
	import * as d3 from 'd3';

    function translate(x, y) { return 'translate(' + x + ',' + y + ')'; }

    function read_csv(path) {
        let request = new XMLHttpRequest();  
        request.open("GET", path, false);   
        request.send(null);

        let csvData = new Array();
        let jsonObject = request.responseText.split(/\r?\n|\r/);
        for (let i = 0; i < jsonObject.length; i++) {
            csvData.push(jsonObject[i].split(','));
        }
        return csvData
    }

    let data = read_csv("umato-small.csv")

    let r = 5;
    let hs = false;
    let targetIndex = -1;
	
    const svgWidth = 600
    const svgHeight = 600
    const margin = { top: 30, right: 15, bottom: 30, left: 25 };

    let width = svgWidth - margin.left - margin.right
    let height = svgHeight - margin.top - margin.bottom
    
	data.forEach((d) => {
        d[0] = +d[0];
        d[1] = +d[1];
		d[2] = +d[2];
    });

    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const colorDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    $: xScale = d3.scaleLinear()
        .domain([Math.min.apply(null, xTicks), Math.max.apply(null, xTicks)])
        .range([margin.left, width - margin.right]);

	$: yScale = d3.scaleLinear()
		.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
        .range([height - margin.bottom, margin.top]);

    // const colorScale = d3.scaleLinear()
    //     .domain(d3.extent(colorDomain))
    //     .range(["black", "red"]);

    const colorScale =  d3.scaleOrdinal()
        .domain(d3.extent(colorDomain))
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);

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

        {#each data as d, i}
            <circle class="circle-line"
                r={r}
                cx='{xScale(d[0])}'
                cy='{yScale(d[1])}'
                fill='{colorScale(d[2])}'
            ></circle>
        {/each}
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
        fill-opacity: 1.0;
        stroke: black;
        stroke-width: 0.4;
    }
</style>