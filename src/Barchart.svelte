<script>
    import { onMount, beforeUpdate, afterUpdate } from 'svelte'
    import * as d3 from 'd3'

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')'
    }
    let svgWidth = 550
    let svgHeight = 550
    let margin = { top: 30, right: 10, bottom: 20, left: 40, mid: 10 }
    let width = svgWidth - margin.left - margin.right
    let height = svgHeight - margin.top - margin.bottom

    //-------------------------------------------------------------bar

    let bar_domain = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    let bar_data = [
        {
            name: 'A',
            value: 10,
            color: '#FF0000',
        },
        {
            name: 'B',
            value: 10,
            color: '#FF8000',
        },
        {
            name: 'C',
            value: 10,
            color: '#FFFF00',
        },
        {
            name: 'D',
            value: 10,
            color: '#80FF00',
        },
        {
            name: 'E',
            value: 10,
            color: '#00FFFF',
        },
        {
            name: 'F',
            value: 10,
            color: '#0080FF',
        },
        {
            name: 'G',
            value: 10,
            color: '#0000FF',
        },
        {
            name: 'H',
            value: 10,
            color: '#8000FF',
        },
        {
            name: 'I',
            value: 10,
            color: '#FF00FF',
        },
        {
            name: 'J',
            value: 10,
            color: '#848484',
        },
    ]
    bar_data.forEach(function (d) {
        d.value = Math.random() * 100
    })
    let el;
    let dx = d3.scaleBand().domain(bar_domain).range([0, width])
    let dy = d3.scaleLinear().domain([0, 100]).range([height, 0])
    let dxAxis = d3.axisBottom(dx)
    let dyAxis = d3.axisLeft(dy)
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    function handleUpdate() {
        bar_data.forEach(function (d) {
            d.value = Math.random() * 101
        })
        bar_data = bar_data
    }
    let rects;
    $: {
        rects = bar_data.map((bar, i) => {
            return {
                fill: colorScale(i),
                width: 40,
                height: dy(bar.value),
                x: (40 + margin.mid) * i,
                y:  height - dy(bar.value),
                cursor: 'pointer'
            }
        })
    }
    function barclick(i) {
        console.log(i)
        bar_data.splice(i, 1)
        bar_data = bar_data;
    }
    onMount(() => {
        console.log('mount')
        d3.select(el).append('g').attr('transform', translate(0, width)).call(dxAxis)
        d3.select(el).append('g').call(dyAxis)
    })
</script>

<button on:click={handleUpdate}>update</button>
<div>
    <svg width={svgWidth} height={svgHeight}>
        <g bind:this={el} width={width} height={height} transform={translate(margin.left, margin.top)}>
            {#each rects as r, i}
                <rect {...r} on:dblclick={() => barclick(i)}></rect>
            {/each}
        </g>
    </svg>
</div>