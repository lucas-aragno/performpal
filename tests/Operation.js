const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const Operation = require('../src/Operation')
const PlaceAnOrder = require('./fixtures/PlaceAnOrder')

const { assert, expect } = chai
chai.use(chaiAsPromised)

describe('Place an order', () => {
  it('should make an order of 3 elements with double fries', async () => {
    let order = await (new PlaceAnOrder()).run({})
    assert.lengthOf(Object.keys(order), '3')
    assert.equal(order['side'], 'double fries')
  })
})

describe('Operation', () => {
  describe('Initalization', () => {
    before(() => {
      this.operation = new Operation();
    })

    afterEach(() => {
      this.operation.steps = []
      this.operation.failures = []
    })
    
    it('receives steps correctly', () => {
      let stepOne = () => 10
      let stepTwo = () => 1 + 1
      this.operation.step(stepOne)
      this.operation.step(stepTwo)
      assert.lengthOf(this.operation.steps, 2)
    })

    it('receives an array of steps', () => {
      let stepOne = () => {}
      let stepTwo = () => 1
      this.operation.addSteps({stepArray: [stepOne, stepTwo]})
      assert.lengthOf(this.operation.steps, 2)
    })

    it('receives failures correctly', () => {
      let handleFailureOne = () => console.error('woopsie')
      let handleFailureTwo = () => console.error('woops')
      this.operation.failure(handleFailureOne)
      this.operation.failure(handleFailureTwo)
      assert.lengthOf(this.operation.failures, 2)
    })

    it('receives an array of failures', () => {
      let handleFailureOne = () => console.error('woopsie')
      let handleFailureTwo = () => console.error('woops')
      this.operation.addFailures({failureArray: [handleFailureOne, handleFailureTwo]})
      assert.lengthOf(this.operation.failures, 2)
    })

    it('adds steps as an array', () => {
      this.operation.steps = [
        () => console.log('hi!'),
        () => 10
      ]
      assert.lengthOf(this.operation.steps, 2)
    })
  })

  describe('Execution', () => {
    before(() => {
      this.operation = new Operation();
    })

    afterEach(() => {
      this.operation.steps = []
      this.operation.failures = []
    })
    it('executes an operation with one step', async () => {
      let stepToExecute = () => 10
      this.operation.step(stepToExecute)
      let result = await this.operation.run({})
      assert.equal(result, 10)
    })

    it('executes an operation with an error and catches it with a failure', async () => {
      let stepToExecute = () => {throw new Error()}
      let consoleLogError = ({error}) => { throw  new Error()}
      this.operation.step(stepToExecute)
      this.operation.failure(consoleLogError)
      await expect(this.operation.run({})).be.rejectedWith(Error)
    })
  })
})