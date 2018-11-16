class InMemoryRepository {
  constructor () {
    if (!this.instance) {
      this._users = []
      this.instance = this
    }
    return this.instance
  }

  userExists ({email}) {
    return new Promise((resolve, reject) => {
      try {
        let user = this._users.find((user) => user.email === email)
        resolve(user)
      } catch (e) {
        reject(e)
      }
    })
  }

  createUser ({email, password}) {
    return new Promise((resolve, reject) => {
      try {
        this._users.push({email, password})
        let user = this._users.slice(-1)[0]
        resolve(user)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = InMemoryRepository