const Operation = require('../../src/Operation')

function UserAlreadyExistsException ({email}) {
  this.message = `user with email ${email} already exists`
}

const CheckUserDatabaseException = () => {
  this.message = 'Error checking database for this user'
}

const HashPasswordException = () => {
  this.message = 'oops'
}

const EmailException = ({ email }) => {
  this.message = `Error sending email to ${email}`
}

const SaveRecordException = ({ record }) => {
  this.message = `Error saving record ${record}`
}

class RegisterUser extends Operation {
  constructor () {
    super()
    this.step(({options, params: { email, userRepository } }) => this.checkIfUserExists({ options, params: { email, userRepository } }))
    this.failure(this.userAlreadyExistsFailure)
    this.step(({options, params: { password }}) => this.hashPassword({ options, params: { password } }))
    this.failure(this.hashPasswordFailure)
    this.step(({options, params: { email, userRepository }}) => this.createUserOnRepository({ options, params: { email, userRepository } }))
    this.failure(({params: { email }}) => this.saveRecordFailure({email}))
    this.step(({options, params: { email, emailService }}) => this.sendEmailToUser({ options, params: { email, emailService } }))
    this.failure(({params: { email }}) => this.sendEmailFailure({email}))
    this.step(({options}) => this.finalizeRegister({options}))
  }

  async checkIfUserExists ({options, params: { email, userRepository }}) {
    try {
      let userExists = await userRepository.userExists({email})
      if (userExists) {
        this.fail({error: 'user already exists', options, params})
      }
    } catch (e) {
      throw new CheckUserDatabaseException()
    }
  }

  async hashPassword ({ options, params: { password } }) {
    options['hashedPassword'] = 'fdsbdshjfbdshjfbdshjak!!!!'
    options['test'] = 1234
  }

  async createUserOnRepository ({ options, params: { email, password, userRepository }}) {
    try {
      let userCreated = await userRepository.createUser({ email, password: options['hashedPassword'] })
      options['user'] = userCreated
    } catch (e) {
      throw new Error(e)
    }
  }

  async sendEmailToUser ({ options, params: { email, emailService }}) {
    try {
      let mail = await emailService.sendTo({email})
      options['emailSent'] = mail
    } catch (e) {
      throw new Error(e)
    }
  }

  finalizeRegister ({ options }) {
    let { emailSent, user } = options
    return { emailSent, user }
  }

  hashPasswordFailure ({error}) {
    throw new HashPasswordException()
  }

  userAlreadyExistsFailure ({ error, options, params: {email} }) {
    throw new UserAlreadyExistsException({ email })
  }

  saveRecordFailure ({ params: { email } }) {
    throw new SaveRecordException({ record: `with email ${email}`})
  }

  sendEmailFailure ({ params: { email } }) {
    throw new EmailException({ email })
  }
}

module.exports = RegisterUser