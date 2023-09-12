[![Svelte v4](https://img.shields.io/badge/svelte-v4-orange.svg)](https://svelte.dev)
[![npm](https://img.shields.io/npm/v/svelte-optimistic-store.svg)](https://www.npmjs.com/package/svelte-optimistic-store)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![downloads](http://img.shields.io/npm/dm/svelte-optimistic-store.svg?style=flat-square)](https://npmjs.org/package/svelte-optimistic-store)

# svelte-optimistic-store

Store to handle optimistic values in svelte

Inspired by reacts useOptimistic Hook

## Installation

```bash
# install the dependence
npm i svelte-optimistic-store
```

## Api

**optimistic**

Creates a writable store which can handle optimistic updates.

- `initialValue`: value of the store on initialization

Returns a store with these properties:

- `subscribe`: subscribe method to get the current value of the store
- `update`: update method, either optimistic or just like a basic writable store
- `set`: basic set method like a writable store
- `isOptimistic`: readonly store to know if the current value of the store is optimistic or not
- `cancel`: cancel an optimistic update

## Usage

```ts
// create a optimistic store with a default value
import { optimistic } from 'svelte-optimistic-store';

const likeStore = optimistic(1);

//update and set the store like always
likeStore.set(2);
likeStore.update((cur) => cur + 1);

//update asynchronously (after one second store will change)
likeStore.update(
	(cur) =>
		new Promise((res) =>
			setTimeout(() => {
				res(cur + 1);
			}, 1000)
		)
);

//update optimistically (after one second store will change to the actual value, but during this second the second argument will be value of the store)
likeStore.update(
	(cur) =>
		new Promise((res) =>
			setTimeout(() => {
				res(cur + 1);
			}, 1000)
		),
	(cur) => cur + 1 // updater function or just a value
);
```

A Rejected promise in the updater function will reset the value to its previous state

```ts
//Value will be set to 2 and after one second back to 1 due to the rejected promise
likeStore.update(
	(cur) =>
		new Promise((res, rej) =>
			setTimeout(() => {
				rej();
			}, 1000)
		),
	(cur) => cur + 1
);
```

If you want your optimistic item to have a different type than the normal store type you can provide two generics to the store (e.g if you want a way to distinguish a optimistic array item and add special classes to it). By default the second generic is the same as the first.

```ts
import { optimistic } from 'svelte-optimistic-store';

type Todo = {
	id: number;
	content: string;
	done: boolean;
};

type OptimisticTodo = Todo & {
	optimistic: true;
};

const todoStore = optimistic<Todo[], OptimisticTodo[]>([]);

todoStore.update(
	(cur) =>
		new Promise((res) =>
			setTimeout(() => {
				res([...cur, { id: 2, content: 'Write a post', done: false }]);
			}, 1000)
		),
	(cur) => [...cur, { id: 2, content: 'Write a post', done: false, optimistic: true }]
);
```

In your UI you can do something like this now

```ts
{#each $todoStore as todo }
	<div class:ghost={todo.optimistic}>
		{todo.content}
	</div>
{/each}
```

You can cancel an optimistic update by calling cancel. This will reset the value of the store back to its value before making an optimistic update. Note it will also prevent the current asynchronous update to the store.

```ts
const likeStore = optimistic(1);

//update optimistically (after one second store will change to the actual value, as long as the update is not canceled)
likeStore.update(
	(cur) =>
		new Promise((res) =>
			setTimeout(() => {
				res(cur + 1);
			}, 1000)
		),
	(cur) => cur + 1 // updater function or just a value
);

//value will be the optimistic value as long as the update didn't resolve or cancel hasn't been called
console.log(get(likeStore)); // 2

//store will be reset to last value (here 1) and the asynchronous update won't be applied
likeStore.cancel();

// after 1 second store will still be 1 and won't update to 2

console.log(get(likeStore)); // 1
```
