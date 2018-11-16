## Complex Use Case

This example is an operation that most applications share, registering a user.

If we break this into steps we will need to:

- Check if the user exists on our database
- Hash the user's password
- Persist the record
- Send an email

For that we can write up an operation which looks like this one:

```javascript
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
    options['hashedPassword'] = password.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); 
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
```

There is a lot going on here, if you want to see this running go to the `tests/RegisterUser.js` file in this repository.

First, let's talk about the parameters that this operation needs.

We will need an `email` a `password` but *also* I'm sending to the operation a `UserRepository`, that could be your `User` collection in mongoDB or `User` table in SQL or `users.txt` file for that matter, this way we are not binding the operation to an specific framework but you **can** do that if you want.

Same thing with the `emailService` it's going to be an object that has a `sendTo` method that schedules/sends an email to a given user.


Now let's check our constructor:

```javascript
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
```

This are the steps we listed earlier, each step uses a different combination of parameters, some uses just email other emails and the data repository, etc.

However there is a new thing here, the `this.failure` method. This work just like `step` but what this functions will be doing is catching exceptions on previous steps.

So if something breaks on `checkIfUserExists` the operation will execute `userAlreadyExistsFailure`, if something breaks on `hashPassword` `hashPasswordFailure` will be executed and so for it. Everything will be executed in the same order is declared. An important note is that if anything fails the next `failure` will be executed and then the operation will end.

All the failures in this example are pretty straightforward some of them use parameters to return a better error message, and for the sake of clarity I have declared a few "custom" Errors on top of the file to use based on the failure.

Let's check out each step in order:

### Check if user exists

```javascript

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
```

This step takes the email and the userRepository as parameters, it checks if a user exists if a user does exists it fails (which will trigger the next failure in line, `userAlreadyExistsFailure`) if the user doesnt exist and nothing broke while checking `userRepository` we just move along to the next step.


### Hash Password

```javascript
  hashPassword ({ options, params: { password } }) {
    options['hashedPassword'] = password.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); 
  }
```

This one is not an async method, it just takes the `password` parameter and it will use the `options` parameter to pass down the hashed password to the next step.

Here we just hash the password using a simple alorithm but you could import something like `argon2` perform and await and a `try/catch` block to fail if something happens.

### Create User

```javascript
  async createUserOnRepository ({ options, params: { email, userRepository }}) {
    try {
      let userCreated = await userRepository.createUser({ email, password: options['hashedPassword'] })
      options['user'] = userCreated
    } catch (e) {
      throw new Error(e)
    }
  }
```

This method takes email and userRepository from the parameters and it will use the `options` to get the `hashedPassword` from the previous step and to save the user after it's created.

If everything goes well we will move to the next step with the created user on the `user` key on the options parameter, if something fails it will throw an `Error` that will trigger the next `failure` in line `saveRecordFailure`.

### Send Email

```javascript
  async sendEmailToUser ({ options, params: { email, emailService }}) {
    try {
      let mail = await emailService.sendTo({email})
      options['emailSent'] = mail
    } catch (e) {
      throw new Error(e)
    }
  }
```

This step is also simple, it uses the `email` and the `emailService` from the parameters and it will store the email sent into the `options` parameter, if it fails it will trigger the next failure.


### Finish!

```javascript
  finalizeRegister ({ options }) {
    let { emailSent, user } = options
    return { emailSent, user }
  }
```

This step is just for the sake or a clean `result` object, we just use the `options` parameter to get the user that was created and the email that was sent and we return them as the result of the whole operation.


Now we can call it:

```javascript
      const mailer = new ConsoleMailer()
      const repository = new InMemoryRepository()
      let email = 'test@test.com'
      let password = 'security'

      const registerController = async () => {
        let params = { email, password, userRepository: repository, emailService: mailer }
        let result = await (new RegisterUser()).run({params})
        return result
      }

      registerController()
```

That will return something like:

```
{
  emailSent: '<doctype html><html><body> hello test@test.com</body></html>',
  user: { 
    email: 'test@test.com',
    password: 'ffnb43rui42bfdhbfdj'
  }
}
```

And we could use this same operation to create an `express` endpoint:

```javascript
  // ....
  const mailer = new SengridMailer()
  const repository = new mongooseUserCollection()
  app.post(`users/register`, async (req, res) => {
    logger.info({ message: 'Registering user', user: req.body });
    try {
      let { email, password } = req.body
      let params = { email, password, userRepository: repository, emailService: mailer }
      let result = await (new RegisterUser()).run({params})
      res.status(200).json({ user });
    } catch (error) {
      logger.error({ error });
      res.status(500);
    }
  });
```

That way we could remove all the validation logic (check if user exists) and the email sending from the controller, the hashing from the user model leaving it just as an HTTP endpoint.

And you can use Operations on every framework and even without performpal and implementing your own.
