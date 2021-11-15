import { createSignal } from "solid-js"
import { createWatch } from "../src"

const [count, setCount] = createSignal(0)

let lastValue = 0

createWatch(count, x => {
   lastValue = x
})

setCount(2)

lastValue
