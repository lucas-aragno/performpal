const Operation = require('../../src/Operation')
const { exec } = require('child_process')

class StartRepository extends Operation {
  constructor () {
    super()
    this.step(this.gitInit)
    this.step(this.addAll)
    this.step(this.firstCommit)
    this.step(({params}) => this.addRemote(params))
    this.step(this.push)
  }

  async gitInit () {
    await exec('git init .')
  }

  async addAll () {
    await exec('git add .')
  }

  async firstCommit () {
    await exec('git commmit -m "First Commit"')
  }

  async addRemote (params) {
    await exec(`git remote add origin ${params.remote}`)
  }

  async push () {
    await exec('git push -u origin master')
  }
}

module.exports = StartRepository