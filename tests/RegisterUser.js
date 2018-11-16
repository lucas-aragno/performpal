const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const RegisterUser = require('./fixtures/RegisterUser')
const InMemoryRepository = require('./services/InMemoryRepository')
const ConsoleMailer = require('./services/ConsoleMailer')

const { assert, expect } = chai
chai.use(chaiAsPromised)

describe('Register User', () => {
  describe('with correct params', () => {
    before(async () => {    
      this.mailer = new ConsoleMailer()
      this.repository = new InMemoryRepository()
      this.email = 'test@test.com'
      let password = 'security'
      let params = {email: this.email, password, userRepository: this.repository, emailService: this.mailer }
      this.result = await (new RegisterUser()).run({params})
    })

    it('creates a user with the given email', async () => {
      let user = await this.repository.userExists({ email: this.email })
      assert.isNotNull(user)
    })

    it('has email and user on results', () => {
      let { user, emailSent } = this.result
      assert.isDefined(user)
      assert.isDefined(emailSent)
    })

    it('has a hashed password', () => {
      let { user } = this.result
      assert.isNotEmpty(user.password)
      assert.notEqual(user.password, 'security')
    })
  })

  describe('with an email that already exists', () => {
    before(async () => {
      this.mailer = new ConsoleMailer()
      this.repository = new InMemoryRepository()
      this.email = 'test@test.com'
      let password = 'security'
      let params = {email: this.email, password, userRepository: this.repository, emailService: this.mailer }
      this.result = await (new RegisterUser()).run({params})
    })

    it('fails when trying to create a duplicated user', async () => {
      let params = {email: this.email, password: '123456', userRepository: this.repository, emailService: this.mailer }
      await expect((new RegisterUser()).run({params})).be.rejected
    })
  })
})
