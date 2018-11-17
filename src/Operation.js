let stepIndex = 0

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
    let failureHash = { index: this._steps.length, failureFunction } 
    let failure = this._failures.push(failureHash)
    return failure
  }

  get steps () {
    return this._steps
  }

  get failures () {
    return this._failures
  }

  set failures (failureArray) {
    this._failures = failureArray.map((failureFunction, index) => { failureFunction, index })
  }

  set steps (stepArray) {
    this._steps = stepArray
  }

  async fail ({error, params, options}) {
    const failureToExec = this._failures.find((failure) => failure.index === stepIndex + 1)
    if (failureToExec) {
      await failureToExec['failureFunction']({error, params, options})
    } else {
      throw new Error(`Step failed with error ${error}`)
    }
  }

  async execute ({step, params, options}) {
    return await step({params, options})
  }

  async run ({params}) {
    stepIndex = 0
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