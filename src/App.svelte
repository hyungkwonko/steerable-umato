<script>
	import { slide } from 'svelte/transition';

	let w;
	let h;

	let globalAlpha = 0.1;
	let hubNum = 100;
	let topN = 30;
	let group = "PCA";
	let globalCliked = false;

	let localAlpha = 0.1;
	let negRate = 5.0;
	let numIter = 50;
	let repulsionHub = 0.01
	let localCliked = false;

	let text = 'edit me';

	let showItems = false;
	let items = [];
	let i = items.length;


	function handleClickGlobal() {
		globalCliked = !globalCliked;
	}

	function handleClickLocal() {
		localCliked = !localCliked;
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
		console.log(flag);

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

	input {
		display:inline-block;
		margin: 0;
	}

	.sub-title {
		display: table;
		width: 100%;
		border-spacing: 2px;
	}

	.sub-title button {
		border: 1px solid black;
		width: 100%;
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
		margin: 0px 10px;
	}

</style>

<div>
	<h1>
		Steerable UMATO
	</h1>

	<!-- Global -->
	<div class="column">
		<div class="sub-title">
			{#if globalCliked}
				<button on:click={handleClickGlobal} style="background: lightpink">
					<h3>
						Hyperparameter setting for GLOBAL optimization (Click for STOP 🟥)
					</h3>
				</button>
			{:else}
				<button on:click={handleClickGlobal} style="background: lightgreen">
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
			<button on:click={saveGlobalSnapshot}>
				Use this setting for LOCAL optimization
			</button>
		</div>
	</div>


	<!-- LOCAL -->
	<div class="column">
		<div class="sub-title">
			{#if localCliked}
				<button on:click={handleClickLocal} style="background: lightpink">
					<h3>
						Hyperparameter setting for LOCAL optimization (Click for STOP 🟥)
					</h3>
				</button>
			{:else}
				<button on:click={handleClickLocal} style="background: lightgreen">
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
			<button on:click={handleClickGlobal}>
				Save snapshot
			</button>
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
					<div class="snapshot" transition:slide>
						"type": {item.type}, "globalAlpha": {item.globalAlpha}, "hubNum": {item.hubNum}, "topN": {item.topN}, "group": {item.group}
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<footer class="copyright">
			Copyright 2020 Hyung-Kwon Ko <a href="mailto:hkko@hcil.snu.ac.kr">hkko@hcil.snu.ac.kr</a>
	</footer>

</div>





<!-- <p>size: {w}px x {h}px</p>
<input bind:value={text}>


<div bind:clientWidth={w} bind:clientHeight={h}>
	<span style="font-size: {topN}px">{text}</span>
</div> -->