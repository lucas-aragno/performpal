## Communicate between steps

From our previous example you should be familiar with steps as small chunks of the business logic needed to perform one "use case".

But they not necessarily should or need to be isolated we can communicate information between steps using the `options` argument.

For example, let's say we have a restaurant app and one use case is to place an order one operation `PlaceOrder` could look like this:

```javascript
const { Operation } = require('performpal')
class PlaceOrder extends Operation {
  constructor () {
    super()
    this.step(this.addSideItem)
    this.step(this.addDrink)
    this.step(({params, options}) => this.doubleItem({options, params: { itemToDouble: 'side' }}))
    this.step(this.AddMainItem)
  }

  AddMainItem ({options}) {
    options['main'] = 'burger'
    return options
  }

  addSideItem ({options}) {
    options['side'] = 'fries'
  }

  addDrink ({options}) {
    options['drink'] = 'coke'
  }

  doubleItem ({options, params}) {
    let { itemToDouble } = params
    options[itemToDouble] = `double ${options[itemToDouble]}` 
  }
}

module.exports = PlaceAnOrder
```

In this example we have an operation `PlaceOrder` that generates an order, each step adds one thing to the `options` argument that moves from one step to the next.

The most important steps to notice are `doubleItem` in which we are saying double the `itemToDouble` variable in the params argument (that it's harcoded to be `fries`) this method grabs the item from the `options` object and updates it.

The other step is the final one, `AddMainItem` that returns the `options` object and remember, whatever the last step returns is going to be the result of the whole operation so if we run this:

```javascript
const PlaceOrder = require('./PlaceOrder')

generateOrder = async () => {
  let order = await (new PlaceOrder()).run({})
  console.log(order)
}

generateOrder()
```

It will generate something like this:

```bash
Lucass-MacBook-Pro:operation-2 laragno$ node example/communicate-between-steps/index.js
{ side: 'double fries', drink: 'coke', main: 'burger' }
```