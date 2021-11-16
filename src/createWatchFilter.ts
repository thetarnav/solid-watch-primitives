import type {
   StopWatch,
   WatchArrayCallback,
   WatchFilter,
   WatchSignalCallback,
} from './types'
import type { Fn } from './common'

export function createWatchFilter<
   FilterOptions extends {} | void,
   Returns extends {} = {},
   HandlesStop extends boolean = false,
>(
   creator: (
      source: Fn<any> | Fn<any>[],
      callback: WatchArrayCallback<Fn<any>[], unknown> &
         WatchSignalCallback<Fn<any>, unknown>,
      options: FilterOptions,
      getStop: HandlesStop extends true ? () => StopWatch : false,
   ) => [(input: any, prevInput: any, prevValue?: unknown) => void, Returns],
   requireStop?: HandlesStop,
): WatchFilter<FilterOptions, Returns> {
   return (a: any, b?: any, c?: any) => {
      let source, fn, options
      if (typeof b === 'function') {
         // passed normal arguments
         source = a
         fn = b
         options = c ?? {}
      } else {
         // passed nested filter
         source = a[0]
         fn = a[1]
         options = Object.assign(a[2] ?? {}, b ?? {})
      }

      let stop: () => void
      const nastedHandleStop: ((stop: Fn) => void) | undefined =
         options.handleStop
      const handleStop = requireStop
         ? (dispose: Fn) => {
              stop = dispose
              nastedHandleStop?.(dispose)
           }
         : nastedHandleStop

      const [_fn, returns] = creator(
         source,
         fn,
         options,
         (requireStop ? () => stop : false) as any,
      )
      const nestedReturns: Object = options.returns ?? {}

      return [
         source,
         _fn,
         {
            returns: Object.assign(nestedReturns, returns),
            handleStop,
         },
      ] as [any, any, any]
   }
}
