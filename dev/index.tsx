import { Component, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import {
   createFilteredEffect,
   whenever,
   stoppable,
   debounce,
   pausable,
} from '../src'

const App: Component = () => {
   const [count, setCount] = createSignal(0)

   const countLoop = () => {
      setTimeout(() => {
         setCount(p => p + 1)
         countLoop()
      }, Math.random() * 1000)
   }
   countLoop()

   const { stop, toggle } = createFilteredEffect(
      stoppable(
         pausable(
            debounce(
               count,
               x => {
                  console.log('watch', x)
                  if (count() > 15) stop()
               },
               { wait: 300 },
            ),
            { active: false },
         ),
      ),
   )
   toggle(true)

   createFilteredEffect([count, () => ''], x => {})

   return <div>Hello {count()}</div>
}

render(() => <App />, document.getElementById('root'))
