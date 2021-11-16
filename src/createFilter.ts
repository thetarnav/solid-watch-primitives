import type {
   FilterFnModifier,
   StopEffect,
   EffectArrayCallback,
   Filter,
   FilterReturn,
   EffectSignalCallback,
} from './types'
import type { Fn } from './common'

export function createFilter<
   Config extends {} | void,
   Returns extends {} = {},
   HandlesStop extends boolean = false,
>(
   creator: (
      source: Fn<any> | Fn<any>[],
      callback: EffectArrayCallback<Fn<any>[], unknown> &
         EffectSignalCallback<Fn<any>, unknown>,
      options: Config,
      stop: HandlesStop extends true ? StopEffect : undefined,
   ) => [(input: any, prevInput: any, prevValue?: unknown) => void, Returns],
   requireStop?: HandlesStop,
): Filter<Config, Returns> {
   return (a: any, b?: any, c?: any): FilterReturn<any, any, Returns> => {
      const stopRequired = (requireStop as boolean) ?? false
      let source: any,
         initialCallback: (a: any, b: any, c: any) => void,
         options: Config,
         modifyers: FilterFnModifier<any, any, Object>[] = []

      if (typeof b === 'function') {
         // passed normal arguments
         source = a
         initialCallback = b
         options = c ?? {}
      } else {
         const returned = a as FilterReturn<any, any, Object>
         // passed nested filter
         source = returned.initialSource
         initialCallback = returned.initialCallback
         modifyers = returned.modifyers
         options = b ?? {}
      }

      const filterModifier: FilterFnModifier<any, any, Returns> = (
         callback,
         stop,
      ) => creator(source, callback, options, stop as any)
      modifyers.push(filterModifier)

      return {
         stopRequired,
         initialCallback,
         initialSource: source,
         modifyers: modifyers as any,
      }
   }
}
