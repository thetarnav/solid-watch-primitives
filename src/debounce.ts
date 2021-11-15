import {
   WatchFilterReturn,
   StopWatch,
   ValidWatchCallback,
   WatchArrayCallback,
   WatchOptions,
   WatchSignalCallback,
} from "./common"
import _debounce from "@solid-primitives/debounce"
import { onCleanup } from "solid-js"

export interface DebounceFilterOptions extends WatchOptions {
   wait: number
}

export function debounce<
   T extends (() => any)[] | (() => any),
   U,
   R extends Object,
   N extends Object
>(
   filter: WatchFilterReturn<T, U, N>,
   options: DebounceFilterOptions
): WatchFilterReturn<T, U, R & N>

export function debounce<T extends (() => any)[], U, R extends Object>(
   source: [...T],
   fn: WatchArrayCallback<T, U>,
   options: DebounceFilterOptions
): WatchFilterReturn<T, U, R>

export function debounce<T extends () => any, U, R extends Object>(
   source: T,
   fn: WatchSignalCallback<T, U>,
   options: DebounceFilterOptions
): WatchFilterReturn<T, U, R>

export function debounce(
   a: any,
   b?: any,
   c?: any
): WatchFilterReturn<any, any, Object> {
   let source, fn, options
   if (typeof b === "function") {
      // normal arguments
      source = a
      fn = b
      options = c ?? {}
   } else {
      // passed filter
      source = a[0]
      fn = a[1]
      options = Object.assign(a[2] ?? {}, b ?? {})
   }
   console.log("debounce", source, fn, options)
   const [_fn, clear] = _debounce(fn, options.wait)
   onCleanup(clear)
   return [source, _fn, options]
}
