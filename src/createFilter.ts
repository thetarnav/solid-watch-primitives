import { createMemo, createSignal, onCleanup, Setter } from "solid-js"
import { createWatch } from "."
import {
   WatchFilterReturn,
   Fn,
   WatchArrayCallback,
   WatchOptions,
   WatchSignalCallback,
   CreateWatchOptions,
} from "./common"
import _debounce from "@solid-primitives/debounce"

export interface WatchFilter<O extends {} | void, R extends {}> {
   <T extends (() => any)[] | (() => any), U, N extends {}>(
      filter: WatchFilterReturn<T, U, N>,
      options: O
   ): WatchFilterReturn<T, U, R & N>
   <T extends (() => any)[], U>(
      source: [...T],
      callback: WatchArrayCallback<T, U>,
      options: O
   ): WatchFilterReturn<T, U, R>
   <T extends () => any, U>(
      source: T,
      callback: WatchSignalCallback<T, U>,
      options: O
   ): WatchFilterReturn<T, U, R>
}

export function createWatchFilter<
   O extends {} | void,
   R extends {} = {},
   S extends boolean = false
>(
   creator: (
      source: (() => any) | (() => any)[],
      callback: WatchArrayCallback<(() => any)[], unknown> &
         WatchSignalCallback<() => any, unknown>,
      options: O,
      getStop: S extends true ? () => () => void : false
   ) => [(input: any, prevInput: any, prevValue?: unknown) => void, R],
   requireStop?: S
): WatchFilter<O, R> {
   const filter: WatchFilter<O, R> = (a: any, b?: any, c?: any) => {
      let source, fn, options
      if (typeof b === "function") {
         // passed normal arguments
         source = a
         fn = b
         options = c ?? {}
      } else {
         // passed another filter
         source = a[0]
         fn = a[1]
         options = Object.assign(a[2] ?? {}, b ?? {})
      }

      let stop: () => void
      const prevHandleStop: ((stop: Fn) => void) | undefined =
         options.handleStop
      const handleStop = requireStop
         ? (dispose: Fn) => {
              stop = dispose
              prevHandleStop?.(dispose)
           }
         : prevHandleStop

      const [_fn, returns] = creator(
         source,
         fn,
         options,
         (requireStop ? () => stop : false) as any
      )
      const previousReturns: Object = options.returns ?? {}

      console.log(previousReturns)

      return [
         source,
         _fn,
         {
            ...options,
            returns: Object.assign(previousReturns, returns),
            handleStop,
         },
      ] as [any, any, any]
   }
   return filter
}

export const debounce = createWatchFilter<{
   wait: number
}>((s, fn, options) => {
   const [_fn, clear] = _debounce(fn, options.wait)
   onCleanup(clear)
   return [_fn, {}]
})

export const whenever = createWatchFilter<void>((source, fn) => {
   const isArray = Array.isArray(source)
   const isTrue = createMemo(() =>
      isArray ? source.every(a => !!a()) : !!source()
   )
   const _fn = (...a: [any, any, any]) => isTrue() && fn(...a)
   return [_fn, {}]
})

export const pausable = createWatchFilter<
   { active?: boolean } | void,
   {
      pause: Fn
      resume: Fn
      toggle: (v?: boolean | ((prev: boolean) => boolean)) => boolean
   }
>((s, fn, options) => {
   const [active, toggle] = createSignal(options?.active ?? true)
   return [
      (...a: [any, any, any]) => active() && fn(...a),
      {
         pause: () => toggle(false),
         resume: () => toggle(true),
         toggle: v => {
            if (v) toggle(v)
            else toggle(p => !p)
            return active()
         },
      },
   ]
})

export const stoppable = createWatchFilter<void, { stop: Fn<Fn> }, true>(
   (s, callback, o, getStop) => [callback, { stop: getStop }],
   true
)

// const [count, setCount] = createSignal(0)

// const { stop } = createWatch(stoppable(count, x => console.log(x)))

// createWatch(
//    debounce(
//       [count],
//       x => {
//          console.log([x])
//       },
//       { wait: 300 }
//    )
// )

// createWatch(
//    whenever(
//       () => count() > 6,
//       () => {
//          console.log("above six")
//       }
//    )
// )

// createWatch(
//    debounce(
//       whenever(
//          () => count() % 2 === 0,
//          () => console.log("even", count())
//       ),
//       { wait: 300 }
//    )
// )
