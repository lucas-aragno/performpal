const Operation = require('../../src/Operation')

class PlaceAnOrder extends Operation {
  constructor () {
    super()
    this.step(this.addSideItem)
    this.step(this.addDrink)
    this.step(({params, options}) => this.doubleItem({options, params: { itemToDouble: 'side' }}))
    this.step(this.AddMainItem)
  }

  AddMainItem ({options}) {
    options['main'] = 'burguer'
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