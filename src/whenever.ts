import { createMemo } from "solid-js"
import {
   WatchFilterReturn,
   Fn,
   StopWatch,
   ValidWatchCallback,
   WatchArrayCallback,
   WatchOptions,
   WatchSignalCallback,
} from "./common"
import { watch } from "./watch"

export function whenever<
   T extends (() => any)[] | (() => any),
   U,
   R extends Object,
   N extends Object
>(filter: WatchFilterReturn<T, U, N>): WatchFilterReturn<T, U, R & N>

export function whenever<T extends (() => any)[], U, R extends Object>(
   source: [...T],
   fn: WatchArrayCallback<T, U>,
   options?: WatchOptions
): WatchFilterReturn<T, U, R>

export function whenever<T extends () => any, U, R extends Object>(
   source: T,
   fn: WatchSignalCallback<T, U>,
   options?: WatchOptions
): WatchFilterReturn<T, U, R>

export function whenever(
   a: any,
   b?: any,
   c?: any
): WatchFilterReturn<any, any, Object> {
   const [source, fn, options] = typeof b === "undefined" ? a : [a, b, c]
   const isArray = Array.isArray(source)
   const isTrue = createMemo(() =>
      isArray ? source.every(a => !!a()) : !!source()
   )
   const _fn = (...a: [any, any, any]) => isTrue() && fn(...a)
   return [source, _fn, options]
}
