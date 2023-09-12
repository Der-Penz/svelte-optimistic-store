# svelte-optimistic-store

store to handle optimistic values in svelte

Inspired by reacts useOptimistic Hook

## Installation

```bash
# install the dependence
npm i svelte-optimistic-store
```

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
