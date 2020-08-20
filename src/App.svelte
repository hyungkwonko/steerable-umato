<!-- https://svelte.dev/repl/42ed4a09041e4e39b2f43f798eb898cb?version=3.21.0 -->
<!-- https://svelte.dev/repl/9a24a35072c64af5b7bfde6c806c43d3?version=3.12.1 -->

<script>
	import { slide } from 'svelte/transition';
	import Linechart from "./Linechart.svelte";
	import Linechart2 from "./Linechart2.svelte";
	import Scatterplot from "./Scatterplot.svelte";
	import Scatterplot2 from "./Scatterplot2.svelte";
	import { beforeUpdate, afterUpdate, onMount } from 'svelte';

	beforeUpdate(() => {
	});

	afterUpdate(() => {
	});

	let globalAlpha = 0.1;
	let hubNum = 100;
	let topN = 30;
	let group = "PCA";
	let globalClicked = false;

	let localAlpha = 0.1;
	let negRate = 5.0;
	let numIter = 50;
	let repulsionHub = 0.01
	let localClicked = false;

	let showItems = false;
	let items = [];
	let i = items.length;

	let settingAssure = false;

	function handleClickGlobal() {
		globalClicked = !globalClicked;
	}

	function handleClickLocal() {
		if (settingAssure) {
			localClicked = !localClicked;
		} else {
			alert("Pleaes check the optimization setting")
		}
	}

	function handleSettingAssure() {
		settingAssure = true;
		alert("Now you can go with local optimization!")
	}

	function handleSettingStopAssure() {
		settingAssure = false;
		localClicked = !localClicked;
	}

	function containsObject(items, feed) {
		let keys = Object.keys(feed)
		for (let i=0; i<items.length; i++) {
				let count = 0;
				keys.forEach(key => {
					if (items[i][key] == feed[key]) {
						count += 1;
					}
				});
				if (count == keys.length) {
					return true;
				}
			}
		return false;
	}

	function saveGlobalSnapshot() {
		let feed = {"type": "global", "globalAlpha": globalAlpha, "hubNum": hubNum, "topN": topN, "group": group};
		let flag = containsObject(items, feed)

		if (!flag) {
			items.push(feed);
			i = items.length;
		} else {
			console.log("already in it");
		}
	}

	function saveLocalSnapshot() {
		let feed =  {"type": "local", "globalAlpha": globalAlpha, "hubNum": hubNum, "topN": topN, "group": group,
		"localAlpha": localAlpha, "negRate": negRate, "numIter": numIter, "repulsionHub": repulsionHub};
		let flag = containsObject(items, feed)

		if (!flag) {
			items.push(feed);
			i = items.length;
		} else {
			console.log("already in it");
		}
	}
</script>

<style>
	h1, h3 {
		text-align: center;
	}

	.row {
		display: table;
		width: 100%;
		table-layout: fixed;
		border-spacing: 2px;
	}
	.column {
		display: table-cell;
		widows: 100%;
		padding: 10px;
		display: table-cell;
		text-align: center;
		vertical-align: middle;
	}

	.column-snapshot {
		text-align: left;
		vertical-align: middle;
	}
	.column-width1 {
		border: 1px dashed gray;
		width: 50%;
	}

	.column-width2 {
		border: 1px dashed gray;
		width: 20%;
	}

	.column-width3 {
		border: 1px dashed gray;
		width: 30%;
	}

	.column-d3 {
		border: 1px solid gray;
	}

	input {
		display:inline-block;
		margin: 0;
	}

	.sub-title {
		display: table;
		width: 100%;
		border-spacing: 2px;
	}

	.button1 {
		background-color: lightgreen;
	}

	.button2 {
		background-color: lightpink;
		border: 1px solid black;
		width: 100%;
	}

	.sub-title-h3 {
		border: 1px solid black;
		border-radius: 2px;
		background-color: black;
		color: #eee;
		padding: 15px;
	}

	.sub-footer {
		display: flex;
	}

	.sub-footer button {
		border: 1px solid black;
		width: 100%;
		padding: 10px;
		margin: 1px;
	}

	.snapshot {
		padding: 0.5em 0;
		border-top: 1px solid #eee;
	}

	footer {
		padding: 40px;
		text-align: center;
	}

	.copyright {
		color: #aaa;
		font-size: 12pt;
		padding: 20px;
		border-top: 1px solid #ddd;
		line-height: 30px;
		margin: 40px 10px;
	}
	button {
		border: 1px solid black;
		border-radius: 2px;
		width: 100%;
		transition: all .15s linear;
		cursor: pointer;
	}
	
	button:hover {
		background-color: wheat;
	}

	button:active {
		opacity: 0.1;
	}

	button:active:after {
		opacity: 1;
	}
</style>

<div>
	<h1>
		Steerable UMATO
	</h1>

	<div>
		<!-- Global -->
		<div class="column">
			<div class="sub-title">
				{#if globalClicked}
					<button on:click={handleClickGlobal} class="button2">
						<h3>
							Hyperparameter setting for GLOBAL optimization (Click for STOP 🟥)
						</h3>
					</button>
				{:else}
					<button on:click={handleClickGlobal} class="button1">
						<h3>
							Hyperparameter setting for GLOBAL optimization (Click for RUN 🟢)
						</h3>
					</button>
				{/if}
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Global alpha</b>
					<br>
					range: 0.0 ~ 1.0 w/ interval=0.005
				</div>
				<div class="column column-width2">
					{globalAlpha}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={globalAlpha} min=0.0 max=1.0 step=0.005>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Number of hub nodes</b>
					<br>
					range: 100 ~ 500 w/ interval=50
				</div>
				<div class="column column-width2">
					{hubNum}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={hubNum} min=100 max=500 step=50>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Top N considerations</b>
					<br>
					range: 5 ~ 30 w/ interval=5
				</div>
				<div class="column column-width2">
					{topN}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={topN} min=5 max=30 step=5>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Init method</b>
				</div>
				<div class="column column-width2">
					{group}
				</div>
				<div class="column column-width3">
					<label>
						<input type="radio" bind:group value={"PCA"}>
						<slot/>
						PCA
					</label>
					<label>
						<input type="radio" bind:group value={"Random"}>
						<slot/>
						Random
					</label>
				</div>
			</div>
	
			<div class="sub-footer">
				<button on:click={saveGlobalSnapshot}>
					Save snapshot
				</button>
				<button on:click={handleSettingAssure}>
					Use this setting for LOCAL optimization
				</button>
			</div>
		</div>

		<!-- LOCAL -->
		<div class="column">
			<div class="sub-title">
				{#if localClicked}
					<button on:click={handleSettingStopAssure} class="button2">
						<h3>
							Hyperparameter setting for LOCAL optimization (Click for STOP 🟥)
						</h3>
					</button>
					<!-- {#if finishedLocalOptimization}
					function ~
					localClicked = false
					{/if} -->
				{:else}
					<button on:click={handleClickLocal} class="button1">
						<h3>
							Hyperparameter setting for LOCAL optimization (Click for RUN 🟢)
						</h3>
					</button>
				{/if}
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Local alpha</b>
					<br>
					range: 0.0 ~ 1.0 w/ interval=0.005
				</div>
				<div class="column column-width2">
					{localAlpha}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={localAlpha} min=0.0 max=1.0 step=0.005>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Negative sampling rate</b>
					<br>
					range: 1 ~ 50 w/ interval=1
				</div>
				<div class="column column-width2">
					{negRate}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={negRate} min=1 max=50 step=1>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Number of iterations</b>
					<br>
					range: 50 ~ 200 w/ interval=10
				</div>
				<div class="column column-width2">
					{numIter}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={numIter} min=50 max=200 step=10>
				</div>
			</div>
			<div class="row">
				<div class="column column-width1">
					<b>Repulsion force for hub nodes</b>
					<br>
					range: 0 ~ 1.0 w/ interval=0.01
				</div>
				<div class="column column-width2">
					{repulsionHub}
				</div>
				<div class="column column-width3">
					<input type=range bind:value={repulsionHub} min=0 max=1 step=0.01>
				</div>
			</div>
	
			<div class="sub-footer">
				<button on:click={saveLocalSnapshot}>
					Save snapshot
				</button>
			</div>
		</div>
	</div>

	<!-- Result charts -->
	<div>
		<div class="column">
			<div class="sub-title">
				<h3 class="sub-title-h3">
					Global optimization 2D plot
				</h3>
			</div>
			<div class="row">
				<div class="column column-d3">
					<Scatterplot globalClicked={globalClicked}></Scatterplot>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="sub-title">
				<h3 class="sub-title-h3">
					Local optimization 2D plot
				</h3>
			</div>
			<div class="row">
				<div class="column column-d3">
					<Scatterplot2></Scatterplot2>
				</div>
			</div>
		</div>
	</div>

	<!-- Quantitative evaluation -->
	<div>
		<div class="column">
			<div class="sub-title">
				<h3 class="sub-title-h3">
					Global optimization quantitative result
				</h3>
			</div>
			<div class="row">
				<div class="column column-d3">
					<Linechart globalClicked={globalClicked}></Linechart>
				</div>
			</div>
		</div>
		<div class="column">
			<div class="sub-title">
				<h3 class="sub-title-h3">
					Local optimization quantitative result
				</h3>
			</div>
			<div class="row">
				<div class="column column-d3">
					<Linechart2 localClicked={localClicked}></Linechart2>
				</div>
			</div>
		</div>
	</div>

	<!-- Snapshot -->
	<div class="row">
		<div class="column column-snapshot">
			<label>
				<input type="checkbox" bind:checked={showItems}>
				show snapshots
			</label>
			{#if showItems}
				{#each items.slice(0, i) as item}
					{#if item.type == "global"}
						<div class="snapshot" transition:slide>
							{items.indexOf(item)}. type: {item.type}, globalAlpha: {item.globalAlpha}, hubNum: {item.hubNum},
							topN: {item.topN}, group: {item.group}
						</div>
					{:else}
						<div class=snapshot transition:slide>
							{items.indexOf(item)}. type: {item.type}, globalAlpha: {item.globalAlpha}, hubNum: {item.hubNum},
							topN: {item.topN}, group: {item.group}, localAlpha: {item.localAlpha}, negRate: {item.negRate},
							numIter: {item.numIter}, repulsionHub: {item.repulsionHub}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>

	<div id="my_dataviz"></div>
	
	<footer class="copyright">
		Copyright 2020 Hyung-Kwon Ko
		<br>
		<a href="mailto:hkko@hcil.snu.ac.kr">hkko@hcil.snu.ac.kr</a> / <a href="https://hyungkwonko.info">hyungkwonko.info</a>
	</footer>

</div>


<!-- <p>size: {w}px x {h}px</p>
<input bind:value={text}>


<div bind:clientWidth={w} bind:clientHeight={h}>
	<span style="font-size: {topN}px">{text}</span>
</div> -->