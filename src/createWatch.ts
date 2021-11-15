import { createEffect, createRoot, on, onCleanup } from 'solid-js'
import type { Fn } from './common'
import type {
   WatchOptions,
   WatchArrayCallback,
   WatchFilterReturn,
   WatchSignalCallback,
} from './types'

export function createWatch<
   Source extends Fn<any>[] | Fn<any>,
   U,
   Returns extends {},
>(
   filter: WatchFilterReturn<Source, U, Returns>,
   options?: { defer?: boolean },
): Returns

export function createWatch<Source extends Fn<any>[], U, Returns extends {}>(
   source: [...Source],
   fn: WatchArrayCallback<Source, U>,
   options?: WatchOptions<Returns>,
): Returns

export function createWatch<Source extends Fn<any>, U, Returns extends {}>(
   source: Source,
   fn: WatchSignalCallback<Source, U>,
   options?: WatchOptions<Returns>,
): Returns

export function createWatch(...a: any): Object {
   console.log('createWatch a', a)

   let defer = true
   if (typeof a[1] !== 'function') {
      // passed a filter
      if (typeof a[1]?.defer !== 'undefined') defer = a[1].defer
      a = a[0]
   }
   const source: any = a[0]
   const fn: Fn = a[1]
   const options: WatchOptions<Object> = a[2] ?? {}
   const { returns = {} } = options

   console.log('createWatch b', [source, fn, options], defer)

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
