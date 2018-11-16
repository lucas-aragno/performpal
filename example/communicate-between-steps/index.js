const PlaceOrder = require('./PlaceOrder')

generateOrder = async () => {
  let order = await (new PlaceOrder()).run({})
  console.log(order)
}

generateOrder()