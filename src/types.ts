import type { ReturnTypes } from 'solid-js'
import type { Fn } from './common'

export type StopWatch = Fn

export interface WatchOptions<Returns extends {}> {
   defer?: boolean // from "on"
   handleStop?: (stop: StopWatch) => void
   returns?: Returns
}

export type ValidWatchCallback = (
   input: any,
   prevInput: any,
   prevValue?: any,
) => any

export type WatchArrayCallback<Source extends Fn<any>[], U> = (
   input: ReturnTypes<Source>,
   prevInput: ReturnTypes<Source>,
   prevValue?: U,
) => U

export type WatchSignalCallback<Source extends Fn<any>, U> = (
   input: ReturnType<Source>,
   prevInput: ReturnType<Source>,
   prevValue?: U,
) => U

export interface WatchFilter<
   FilterOptions extends {} | void,
   Returns extends {},
> {
   <Source extends Fn<any>[] | Fn<any>, U, N extends {}>(
      filter: WatchFilterReturn<Source, U, N>,
      options: FilterOptions,
   ): WatchFilterReturn<Source, U, Returns & N>
   <Source extends Fn<any>[], U>(
      source: [...Source],
      callback: WatchArrayCallback<Source, U>,
      options: FilterOptions,
   ): WatchFilterReturn<Source, U, Returns>
   <Source extends Fn<any>, U>(
      source: Source,
      callback: WatchSignalCallback<Source, U>,
      options: FilterOptions,
   ): WatchFilterReturn<Source, U, Returns>
}

export type WatchFilterReturn<
   Source extends Fn<any>[] | Fn<any>,
   U,
   Returns extends {},
> = Source extends Fn<any>[]
   ? [[...Source], WatchArrayCallback<Source, U>, WatchOptions<Returns>]
   : Source extends Fn<any>
   ? [Source, WatchSignalCallback<Source, U>, WatchOptions<Returns>]
   : never
