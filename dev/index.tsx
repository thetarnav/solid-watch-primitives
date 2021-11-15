import { Component, createSignal, Show } from "solid-js"
import { render } from "solid-js/web"
import {
   watch,
   watchOnce,
   watchAtMost,
   debouncedWatch,
   throttledWatch,
   pausableWatch,
   ignorableWatch,
   whenever,
   until,
} from "../src"

const App: Component = () => {
   const [count, setCount] = createSignal(0)

   setInterval(() => setCount(p => p + 1), 1000)

   const stop = watch(count, x => {
      console.log("watch", x)
      if (count() > 10) stop()
   })

   return <div>Hello {count()}</div>
}

render(() => <App />, document.getElementById("app"))
