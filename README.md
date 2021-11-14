# solid-watch-primitives

#### This package is experimental, made to test the concept and usability of primitives build around watching computation changes, to see how it can be used in [Solid](https://www.solidjs.com/). Eventually to be merged to [solid-primitives](https://github.com/davedbase/solid-primitives) if proven useful.

#### Feel free to play around with it, I would appreciate any feedback or ideas that you may have, you can join the discussion [here](https://github.com/davedbase/solid-primitives/pull/19) or simply open an issue if you have some opinions to share.

#### The original idea and part of the used logic comes from [Anthony Fu's vueuse library](https://github.com/vueuse/vueuse) for Vue.

[try on codesandbox](https://codesandbox.io/s/solid-watch-primitives-zoxwe?file=/src/index.tsx)

## The Usage:

### Installation:

```sh
npm i solid-watch-primitives
```

### Available Primitives:

```ts
import {
   watch,
   watchOnce,
   watchAtMost,
   debouncedWatch,
   throttledWatch,
   pausableWatch,
   ignorableWatch,
   whenever,
   until,
} from "solid-watch-primitives"
```

### watch

A stoppable `createEffect(on(source, fn, { defer: true }))`

```ts
const [counter, setCounter] = createSignal(0)

const stop = watch(counter, n => console.log(n))
```

### throttledWatch

The callback is throttled

```ts
const position = createScrollObserver()

const stop = throttledWatch(position, x => console.log(x), 200)
```

### watchOnce

A `watch` that disposes itself on the first captured change.

```ts
const stop = watchOnce(counter, n => console.log(n))
```

### watchAtMost

A `watch` with the specified number of times triggered, until disposes.

```ts
const { stop, count } = watchAtMost(counter, n => console.log(n), 5)
```

### debouncedWatch

The callback is debounced

```ts
const position = createScrollObserver()

const stop = debouncedWatch(position, x => console.log(x), 200)
```

### pausableWatch

Manually controll if the callback gets to be executed

```ts
const { stop, pause, resume, toggle } = pausableWatch(counter, x =>
   console.log(x)
)
```

### ignorableWatch

Somewhat similar to `pausableWatch`, but ignore changes that would cause the next effect to run.

Because Solid batches together changes made in effects, the usage inside and outside effects will differ.

```ts
const { stop, ignoreNext, ignoring } = ignorableWatch(
   counter,
   x => {
      // next effect will be ignored:
      ignoreNext()
      setCounter(p => p + 1)

      // this change happens in the same effect, so it will also be ignored
      setCounter(5)
   }
);


const ignoreMe = () => {
   ignoring(() => {
      // both changes will be ignored:
      setCounter(420)
      setCounter(69)
   })
   // but not this one:
   setCounter(p => p + 2)
}

// this watcher will work normally,
// ignoring only affects the ignorableWatch above
watch(counter, () => {...})
```

### whenever

Runs callback each time the source is truthy.

```ts
setInterval(() => setCount(p => p + 1), 1000)

const stop = whenever(
   () => count() > 5,
   () => console.log(count())
)
// will fire on each count change, if count is gt 5
// => 6, 7, 8, 9, 10, ...

whenever(
   createMemo(() => count() > 5),
   () => console.log(count())
)
// will fire only when the memo changes
// => 6
```

### until

`until` instead of being a simple shortcut, that saves up some code, like the ones above.
This one solves an actual problem. The problem is that, when you use someting like `createFetch` to abstract an asynchronous operation into a reactive helper, you loose the option to use `await`. Because you are turning Promise into a Signal. The `until` brings that functionality back.

```ts
const [data] = createFetch("https://my-url/")

await until(data).not.toBeNull()
console.log(data)
```

[More usage here](https://vueuse.org/shared/until/#usage)
