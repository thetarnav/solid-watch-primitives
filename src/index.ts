import { createRoot, createSignal } from "solid-js"
import { createWatch } from "./createWatch"
import { debounce, pausable, stoppable, whenever } from "./createFilter"

export * from "./watch"
export * from "./createWatch"
export * from "./debouncedWatch"
export * from "./throttledWatch"
export * from "./whenever"
export * from "./until"
export * from "./watchOnce"
export * from "./watchAtMost"
export * from "./pausableWatch"
export * from "./ignorableWatch"

createRoot(() => {
   const [count, setCount] = createSignal(0)

   // createWatch(
   //    debounce(
   //       whenever(
   //          () => count() % 2 === 0,
   //          () => console.log("even", count())
   //       ),
   //       { wait: 300 }
   //    )
   // )

   // const { pause, resume, toggle } = createWatch(
   //    pausable(count, x => console.log(x))
   // )

   // const { stop } = createWatch(
   //    stoppable(count, x => console.log("stoppable", x))
   // )

   const { stop } = createWatch(
      stoppable(
         whenever(
            () => count() > 5,
            () => {
               console.log("stop at", count())
               stop()()
            }
         )
      )
   )

   // console.log(stop()?.())

   const loop = () => {
      setTimeout(() => {
         console.log("++")
         setCount(p => p + 1)
         // if (count() % 10 === 0) toggle()
         loop()
      }, Math.random() * 1000)
   }
   loop()
})
