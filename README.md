# solid-watch-primitives

#### This package is experimental, made to test the concept and usability of primitives build around watching computation changes, to see how it can be used in [Solid](https://www.solidjs.com/). Eventually to be merged to [solid-primitives](https://github.com/davedbase/solid-primitives) if proven useful.

#### Feel free to play around with it, I would appreciate any feedback or ideas that you may have, you can join the discussion [here](https://github.com/davedbase/solid-primitives/pull/19) or simply open an issue if you have some opinions to share.

#### The original idea and parts of the used logic comes from [Anthony Fu's vueuse library](https://github.com/vueuse/vueuse) for Vue.

[try on codesandbox](https://codesandbox.io/s/solid-watch-primitives-urb2u?file=/src/index.tsx)

## The Usage:

### Installation:

```sh
npm i solid-watch-primitives
```

### Available Primitives:

```ts
import {
   createFilteredEffect,
   createFilter,
   until,
} from 'solid-watch-primitives'
```

### createFilteredEffect

When used alone, it's a shortcut for `createEffect(on(source, fn))`. But it can be combined with [Filters](#available-filters) to extend it's functionality.

```ts
const [counter, setCounter] = createSignal(0)

// alone:
createFilteredEffect(counter, n => console.log(n))

// accepts "defer" option, same as on()
createFilteredEffect(counter, n => console.log(n), { defer: true })

// with filter:
createFilteredEffect(debounced(counter, n => console.log(n), { wait: 300 }))

// with nested filters:
const { stop, pause } = createFilteredEffect(
   stoppable(pausable(counter, n => console.log(n))),
)
```

### createFilter

A utility for creating your own custom filters. Every available filter was made using this.

```ts
function createFilter<Config, Returns, RequireStop>(
   modifier: (
      source: Fn<any> | Fn<any>[], // like source of "on"
      callback: EffectCallback, // like callback of "on"
      config: Config, // config for your filter
      stop: StopEffect | undefined, // a StopEffect if RequireStop
   ) => [CustomCallback, Returns], // return your modified callback and custom return values
   requireStop?: RequireStop, // true if you want to use StopEffect
): Filter {}

// for example, thats the source of "debounce"
const debounce = createFilter<{
   wait: number
}>((s, fn, options) => {
   const [_fn, clear] = _debounce(fn, options.wait)
   onCleanup(clear)
   return [_fn, {}]
})

// and this is "atMost", notice the required double "true" to use stop
const atMost = createFilter<
   { limit: MaybeAccessor<number> }, // config you require
   { count: Accessor<number> }, // what you want to return
   true // if you want to use stop()
>(
   (s, callback, config, stop) => {
      const [count, setCount] = createSignal(0)
      const _fn = (...a: [any, any, any]) => {
         setCount(p => p + 1)
         count() + 1 >= access(config.limit) && stop()
         callback(...a)
      }
      return [_fn, { count }] // [CustomCallback, Returns]
   },
   true, // if you want to use stop()
)
```

### until

`until` instead of being a simple shortcut, this one solves an actual problem.
The problem is that, when you use someting like `createFetch` to abstract an asynchronous operation into a reactive helper, you loose the option to use `await`. Because you are turning Promise into a Signal. The `until` tries to brings that functionality back.

```ts
const [data] = createFetch('https://my-url/')

await until(data).not.toBeNull()
console.log(data)
```

[More until usage here](https://vueuse.org/shared/until/#usage)

### Available Filters

```ts
import {
   stoppable,
   once,
   atMost,
   debounce,
   throttle,
   whenever,
   pausable,
   ignorable,
} from 'solid-watch-primitives'
```

### stoppable

returns `{ stop: StopEffect }`, that can be used to manually dispose of the effects.

```ts
const { stop } = createFilteredEffect(stoppable(counter, n => console.log(n)))
```

### once

disposes itself on the first captured change. **Set the defer option to true**, otherwise the callback will run and dispose itself on the initial setup.

```ts
createFilteredEffect(
   once(counter, n => console.log(n)),
   { defer: true },
)
```

### atMost

you specify the number of times it can triggered, until disposes itself.

```ts
const { count } = createFilteredEffect(
   atMost(counter, n => console.log(n), { limit: 8 }),
)
```

### debounce

debounces callback

```ts
const position = createScrollObserver()

createFilteredEffect(debounce(position, x => console.log(x), { wait: 300 }))
```

### throttle

The callback is throttled

```ts
const position = createScrollObserver()

createFilteredEffect(throttle(position, x => console.log(x), { wait: 300 }))
```

### whenever

Runs callback each time the source is truthy.

```ts
setInterval(() => setCount(p => p + 1), 1000)

createFilteredEffect(
   whenever(
      () => count() > 5,
      () => console.log(count()),
   ),
)
// will fire on each count change, if count is gt 5
// => 6, 7, 8, 9, 10, ...

createFilteredEffect(
   whenever(
      createMemo(() => count() > 5),
      () => console.log(count()),
   ),
)
// will fire only when the memo changes
// => 6
```

### pausable

Manually controll if the callback gets to be executed

```ts
const { pause, resume, toggle } = createFilteredEffect(
   pausable(counter, x => console.log(x), { active: false }),
)
```

### ignorable

Somewhat similar to `pausable`, but ignore changes that would cause the next effect to run.

Because Solid batches together changes made in effects, the usage inside and outside effects will differ.

```ts
const { ignoreNext, ignoring } = createFilteredEffect(ignorable(
   counter,
   x => {
      // next effect will be ignored:
      ignoreNext()
      setCounter(p => p + 1)

      // this change happens in the same effect, so it will also be ignored
      setCounter(5)
   }
));


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
createFilteredEffect(counter, () => {...})
```
