import { createFilter } from './createFilter'
import _debounce from '@solid-primitives/debounce'
import _throttle from '@solid-primitives/throttle'
import { Accessor, createMemo, createSignal, onCleanup, Setter } from 'solid-js'
import { access, Fn, MaybeAccessor } from './common'
import { StopEffect } from './types'

export const stoppable = createFilter<void, { stop: StopEffect }, true>(
   (s, callback, o, stop) => [callback, { stop }],
   true,
)

export const once = createFilter<void, {}, true>(
   (s, callback, o, stop) => [
      (...a) => {
         stop()
         callback(...a)
      },
      {},
   ],
   true,
)

export const atMost = createFilter<
   { limit: MaybeAccessor<number> },
   { count: Accessor<number> },
   true
>((s, callback, options, stop) => {
   const [count, setCount] = createSignal(0)
   const _fn = (...a: [any, any, any]) => {
      setCount(p => p + 1)
      count() + 1 >= access(options.limit) && stop()
      callback(...a)
   }
   return [_fn, { count }]
}, true)

export const debounce = createFilter<{
   wait: number
}>((s, fn, options) => {
   const [_fn, clear] = _debounce(fn, options.wait)
   onCleanup(clear)
   return [_fn, {}]
})

export const throttle = createFilter<{
   wait: number
}>((s, fn, options) => {
   const [_fn, clear] = _throttle(fn, options.wait)
   onCleanup(clear)
   return [_fn, {}]
})

export const whenever = createFilter<void>((source, fn) => {
   const isArray = Array.isArray(source)
   const isTrue = createMemo(() =>
      isArray ? source.every(a => !!a()) : !!source(),
   )
   const _fn = (...a: [any, any, any]) => isTrue() && fn(...a)
   return [_fn, {}]
})

export const pausable = createFilter<
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

export const ignorable = createFilter<
   void,
   {
      ignoreNext: () => void | Setter<boolean>
      ignoring: (updater: Fn) => void
   }
>((s, fn) => {
   const [ignore, setIgnore] = createSignal(false)
   const _fn = (...a: [any, any, any]) =>
      ignore() ? setIgnore(false) : fn(...a)
   const ignoreNext = (a?: Parameters<Setter<boolean>>[0]) => {
      typeof a === 'undefined' ? setIgnore(true) : setIgnore(a)
   }
   const ignoring = (updater: Fn) => {
      setIgnore(true)
      updater()
   }
   return [_fn, { ignoreNext, ignoring }]
})
