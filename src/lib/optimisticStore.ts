import { readonly, writable, type Updater, get, derived } from 'svelte/store';

type AsyncUpdater<T> = (value: T) => Promise<T>;
type OptimisticUpdater<T, K> = (value: T) => K;

/**
 * store to handle optimistic state
 * if you use typescript you can provide to generic Types first one being the type of the stores state.
 * second one being a different type if needed for the optimistic type (defaults to the first type).
 * Useful if you want to differentiate the optimistic value from the actual one and and special classes to it
 * @param initialValue
 */
export const optimistic = <TValue, TOptimistic = TValue>(initialValue?: TValue) => {
	const actualValueStore = writable(initialValue);
	const optimisticValueStore = writable<TOptimistic | undefined>();
	const isOptimistic = writable(false);
	const valueStore = derived(
		[actualValueStore, optimisticValueStore, isOptimistic],
		([$actualValueStore, $optimisticValueStore, $isOptimistic]) => {
			return $isOptimistic ? ($optimisticValueStore as TOptimistic) : $actualValueStore;
		}
	);

	/**
	 * Update the store either normal or optimistically
	 * @param updater function to update the store value async or not
	 * @param optimistic optional parameter. If provided optimistic value will be store value as long as updater function resolves
	 */
	function update(
		updater: AsyncUpdater<TValue> | Updater<TValue>,
		optimistic?: OptimisticUpdater<TValue, TOptimistic> | TOptimistic
	): void {
		//Optimistic update involved
		if (arguments.length > 1) {
			if (typeof optimistic === 'function') {
				optimisticValueStore.set(
					(optimistic as OptimisticUpdater<TValue, TOptimistic>)(get(actualValueStore))
				);
			} else {
				optimisticValueStore.set(optimistic);
			}
			isOptimistic.set(true);

			const update = updater(get(actualValueStore));

			if (update instanceof Promise) {
				update
					.then((resolved) => {
						if (get(isOptimistic)) {
							actualValueStore.set(resolved);
						}
					})
					.catch(() => {
						//Error: update rejected, reset value
					})
					.finally(() => {
						isOptimistic.set(false);
					});
			} else {
				actualValueStore.set(update);
				isOptimistic.set(false);
			}
		}
		//update normally
		else {
			const update = updater(get(actualValueStore));

			if (update instanceof Promise) {
				update
					.then((resolved) => {
						actualValueStore.set(resolved);
					})
					.catch(() => {
						console.error('Error: update rejected, no change');
					})
					.finally(() => {
						isOptimistic.set(false);
					});
			} else {
				actualValueStore.set(update);
				isOptimistic.set(false);
			}
		}
	}

	/**
	 * set the value of the store. No optimistic update involved
	 */
	function set(value: TValue) {
		actualValueStore.set(value);
		isOptimistic.set(false);
	}

	/**
	 * cancels a current optimistic update and resets to last value of the store
	 */
	function cancel() {
		isOptimistic.set(false);
		optimisticValueStore.set(undefined);
	}

	return {
		update,
		set,
		cancel,
		subscribe: valueStore.subscribe,
		isOptimistic: readonly(isOptimistic)
	};
};
