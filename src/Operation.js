let stepIndex = 0
let failureIndex = 0

class Operation {
  constructor () {
    this._steps = []
    this._failures = []
    this._options = {}
  }

  step (stepFunction) {
    let step = this._steps.push(stepFunction)
    return step
  }

  failure (failureFunction) {
    let failure = this._failures.push(failureFunction)
    return failure
  }

  get steps () {
    return this._steps
  }

  get failures () {
    return this._failures
  }

  set failures (failureArray) {
    this._failures = failureArray
  }

  set steps (stepArray) {
    this._steps = stepArray
  }

  addSteps ({stepArray}) {
    this._steps = [...this._steps, ...stepArray]
  }

  addFailures ({failureArray}) {
    this._failures = [...this._failures, ...failureArray]
  }

  async fail ({error, params, options}) {
    while (this._failures.length > failureIndex) {
      await this._failures[failureIndex]({error, params, options})
      failureIndex += 1
      break
    }
  }

  async execute ({step, params, options}) {
    return await step({params, options})
  }

  async run ({params}) {
    stepIndex = 0
    failureIndex = 0
    let result = null
    while(this._steps.length > stepIndex) {
      try {
        result = await this.execute({step: this._steps[stepIndex], params, options: this._options})
      } catch (error) {
        result = await this.fail({error, params, options: this._options})
      }
      stepIndex += 1
    }
    return result
  }
}

module.exports = Operation