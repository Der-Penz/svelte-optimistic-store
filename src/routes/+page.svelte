<script lang="ts">
	import { optimistic } from '$lib/optimisticStore.js';
	import type { PageData } from './$types.js';

	export let data: PageData;

	const { isOptimistic, ...likeStore } = optimistic(data.likes);

	function updateAsync() {
		likeStore.update((cur) => {
			return new Promise((res) => {
				setTimeout(() => {
					res(cur + 1);
				}, 500);
			});
		});
	}

	function updateAsyncWithOptimisticValue() {
		likeStore.update(
			(cur) => {
				return new Promise((res, rej) => {
					setTimeout(() => {
						if (Math.random() >= 0.3) {
							res(cur + 1);
						} else {
							rej();
						}
					}, 500);
				});
			},
			(cur) => cur + 1
		);
	}
</script>

<h1>Svelte-optimistic-store</h1>

<div class="post">
	<p>"Hello world"</p>
	<p class="likes" class:optimistic={$isOptimistic}>{$likeStore}❤</p>
</div>

<div class="buttons">
	<button on:click={updateAsync}> Add Async without optimistic update </button>

	<button on:click={updateAsyncWithOptimisticValue}>Add Async with optimistic update</button>
	<button
		on:click={() => {
			likeStore.update((cur) => ++cur);
		}}>Add normal</button
	>

	<button on:click={() => likeStore.cancel()}>cancel optimistic update</button>
</div>

<style>
	.likes {
		font-weight: bold;
	}

	.likes.optimistic {
		opacity: 0.5;
	}

	.buttons {
		display: flex;
		flex-direction: column;
		width: 50vw;
	}

	.post {
		border: 0.3rem solid lightblue;
		border-radius: 0.5rem;
		width: max-content;
		padding: 0.1rem;
		display: flex;
		gap: 1rem;
		align-items: center;
	}
</style>
