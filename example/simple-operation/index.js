const StartRepository = require('./StartRepository')

let params = { remote: 'http://github.com/something/something.git' }
let startRepositoryOperation = new StartRepository()

const createRepo = async () => {
  let result = await startRepositoryOperation.run({params})
  console.log(result)
}

createRepo()

