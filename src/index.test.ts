import { optimistic } from '$lib/optimisticStore.js';
import { get } from 'svelte/store';
import { describe, it, expect } from 'vitest';

describe('default value test', () => {
	it('sets default value and returns it', () => {
		const defaultValue = 'DEFAULT';

		const stringStore = optimistic(defaultValue);
		expect(get(stringStore)).toBe(defaultValue);
	});
});

describe('isOptimistic test', () => {
	it('sets default value and store should have a non optimistic value', () => {
		const stringStore = optimistic('DEFAULT');
		const { isOptimistic } = stringStore;
		expect(get(isOptimistic)).toBe(false);
	});
	it('update store optimistically', () => {
		const stringStore = optimistic('DEFAULT');

		stringStore.update(
			() =>
				new Promise((res) => {
					setTimeout(() => {
						res('UPDATED');
					}, 1000);
				}),

			'OPTIMISTIC'
		);
		expect(get(stringStore)).toBe('OPTIMISTIC');
	});
	it('update store optimistically and check if its will be set after promise resolved', async () => {
		const stringStore = optimistic('DEFAULT');

		await new Promise((res) => {
			stringStore.update(
				() =>
					new Promise((res) => {
						setTimeout(() => {
							res('UPDATED');
						}, 25);
					}),

				'OPTIMISTIC'
			);

			setTimeout(() => {
				res(true);
			}, 50);
		});
		expect(get(stringStore)).toBe('UPDATED');
	});
});

describe('use store normally', () => {
	it('sets value of the store', () => {
		const stringStore = optimistic('DEFAULT');
		stringStore.set('SET');
		expect(get(stringStore)).toBe('SET');
	});
	it('update value of the store', () => {
		const stringStore = optimistic('DEFAULT');
		stringStore.update(() => 'UPDATE');
		expect(get(stringStore)).toBe('UPDATE');
	});
	it('update value of the store async', async () => {
		const stringStore = optimistic('DEFAULT');
		await new Promise((res) => {
			stringStore.update(
				async () => new Promise((res) => setTimeout(() => res('ASYNC UPDATE'), 25))
			);
			setTimeout(() => res(true), 50);
		});
		expect(get(stringStore)).toBe('ASYNC UPDATE');
	});
});
