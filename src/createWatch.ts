import { createEffect, createRoot, on, onCleanup } from "solid-js"
import {
   WatchFilterReturn,
   CreateWatchOptions,
   Fn,
   StopWatch,
   ValidWatchCallback,
   WatchArrayCallback,
   WatchOptions,
   WatchSignalCallback,
} from "./common"

export function createWatch<
   T extends (() => any)[] | (() => any),
   U,
   R extends {}
>(filter: WatchFilterReturn<T, U, R>): R

export function createWatch<T extends (() => any)[], U, R extends {}>(
   source: [...T],
   fn: WatchArrayCallback<T, U>,
   options?: CreateWatchOptions<R>
): R

export function createWatch<T extends () => any, U, R extends {}>(
   source: T,
   fn: WatchSignalCallback<T, U>,
   options?: CreateWatchOptions<R>
): R

export function createWatch(...a: any): Object {
   console.log("createWatch a", a)

   if (typeof a[1] === "undefined") a = a[0]
   const source: any = a[0]
   const fn: Fn = a[1]
   const options: CreateWatchOptions<Object> = a[2] ?? {}
   const { defer = true, returns = {} } = options

   console.log("createWatch b", [source, fn, options])

   if (options.handleStop) {
      const stop = createRoot(stop => {
         createEffect(on(source, fn, { defer }))
         return stop
      })
      onCleanup(stop)
      options.handleStop(stop)
   } else {
      createEffect(on(source, fn, { defer }))
   }
   return returns
}
