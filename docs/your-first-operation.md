
## Your First Operation

Let's say you want to build a node app that pushes code from a folder to a new github repository you can create a class `StartRepository.js` that would look like this:

```javascript
const { Operation } = require('perfompal')

class StartRepository extends Operation {
  constructor () {
    super()
    this.step(this.gitInit)
    this.step(this.addAll)
    this.step(this.firstCommit)
    this.step(this.addRemote)
    this.step(this.push)
  }

  gitInit () {
    console.log('init')
  }

  addAll () {
    console.log('add all')
  }

  firstCommit () {
    console.log('first commit')
  }

  addRemote () {
    console.log('add remote')
  }

  push () {
    console.log('push')
  }
}

module.exports = StartRepository
```

This is how most of our **performpal** classes will look like.

notice that almost everything will be set up on the class' constructor, we call `this.step` to add a new function for our operation to perform. Keep in mind that the operations will run in order.

Then we can run our operation like this:

```javascript
const StartRepository = require('./StartRepository')

let startRepositoryOperation = new StartRepository()
startRepositoryOperation.run({})
```

If we run that we will get an output like this one:

```bash
Lucass-MacBook-Pro:simple-operation laragno$ node index.js

init
add all
first commit
add remote
push
```

So far so good, running an operation is simple you can just instantiate the class and call the `.run` method **it's important to add the {}** since that means we are not going to use any parameters for this particular operation.

Right now we are not doing anything with the Operation other than just console.log's let's change that.

```javascript
const StartRepository = require('./StartRepository')

let params = { remote: 'http://github.com/something/something.git' 
}

let startRepositoryOperation = new StartRepository()
startRepositoryOperation.run({params})
```

Now we are sending over a `remote` parameter that will be used to configure the remote for our repository.

Let's change our app so it uses that remote variable:

```javascript
const { Operation } = require('perfompal')

class StartRepository extends Operation {
  constructor () {
    super()
    this.step(this.gitInit)
    this.step(this.addAll)
    this.step(this.firstCommit)
    this.step(({params}) => this.addRemote(params))
    this.step(this.push)
  }

  gitInit () {
    console.log('init')
  }

  addAll () {
    console.log('add all')
  }

  firstCommit () {
    console.log('first commit')
  }

  addRemote (params) {
    console.log(`add remote ${params.remote}`)
  }

  push () {
    console.log('push')
  }
}

module.exports = StartRepository
```

As you can see in this example we can use the parameters on some steps by just wrapping the step on a function that takes `{params}` as an argument and then pass it down to the step function.

If we run this now our output will look like this:

```javascript
init
add all
first commit
add remote http://github.com/something/something.git
push
```

Now let's actually make it do something:

```javascript
const { Operation } = require('perfompal')
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
```

We did a couple of major changes here, first we added `child_process` as a dependency so we can run commands from node, and since `exec` is promise/callback based we had to add `async` and `await` there is no problem with this since `Operation` can run async operations.

We can test our code going to the folder we want to generate our repo

```bash
Lucass-MacBook-Pro:demo-folder laragno$ cd my-new-repo-folder
```

And run our script 

```bash
Lucass-MacBook-Pro:my-new-repo-folder laragno$  node ../path/to/our/script/index.js
```

We wont be seeing anything since we are not printing anything to the console but after the script runs we can check if a `.git` folder was created:

```bash
Lucass-MacBook-Pro:my-new-repo-folder laragno$ ls .git/
HEAD		branches	config		description	hooks		info		objects		refs
```

It works! now let's print the result of the push.
The `.run` method of the `Operation` will allways return the value returned by the last step of the operation. Since we are not returning anything on our `push` step our result will be undefined for now so first let's change that on our class

```javascript
  async push () {
    let pushOutput = await exec('git push -u origin master')
    return pushOutput
  }
```

and in our `index.js`

```javascript
const StartRepository = require('./StartRepository')

let params = { remote: 'http://github.com/something/something.git' }
let startRepositoryOperation = new StartRepository()

const createRepo = async () => {
  let result = await startRepositoryOperation.run({params})
  console.log(result)
}

createRepo()

```

Here we just wrapped our operation call since now is an async operation and we need to wait to its completed before we can `console.log`.

Congratulations you just built your first performpal operation!