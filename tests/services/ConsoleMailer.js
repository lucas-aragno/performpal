class ConsoleMailer {
  constructor () {
    if (!this.instance) {
      this.instance = this
    }
  }

  sendTo ({email}) {
    return new Promise((resolve, reject) => {
      try {
        resolve(`<doctype html><html><body> hello ${email}</body></html>`)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = ConsoleMailer