## Performpal

Performpal is a library that provides a way to remove all the business logic from different layers of your application and re structure it with "service objects".

### Installation

```
npm install --save performpal
```

### How to use it

**Performpal** provides an object called **Operation** that acts as an ochestrator between your business logic and endpoints, models, or services. They implement particular use cases of your application like placing an order or registering a new user.

The Operation object provides a "react"-ish way to handle actions for your use cases:


#### Example

```javascript
const { Operation } = require('performpal')
const pug = require('pug')
const emailService = require('../emailService')
const registeredUserEmail = pug.compileFile('../templates/users/register')


class SendEmail extends Operation {
  constructor () {
    super()
    this.steps = [
      this.createEmailBody,
      this.sendEmail
    ]

    this.failures = [
      this.handleSubmitEmailError
    ]
  }

  createEmailBody ({params, options}) {
    let { email } = params
    options['emailBody'] = registeredUserEmail({email})
  }


  sendEmail ({params, options}) {
    const { emailBody } = options
    const { email } = params
    return emailService.send({ email, emailBody })
  }

  handleSubmitEmailError ({params}) {
    const { email } = params
    throw new Error(`Error sending email to ${email}`)
  }
}

module.exports = SendEmail
```

```js
const SendEmail = require('../operations/SendEmail')

app.post('/sendEmail', async (req) => {
  try {
    let { email } = req.body
    let result = await (new SendEmail()).run({params: {email}})
    res.send(200).json({result})
  } catch (error) {
    res.send(500).json({error})
  }
})
```

For more examples check:


- [Your first operation](docs/your-first-operation.md)
- [Communicate between steps](docs/communicate-between-steps.md)
- [Complex Use case](docs/complex-use-case.md)



## Why?

"Service Objects" are a good way to keep business logic away from other application layers. Specially in nodejs that has frameworks like express, koa, hapi, etc that gives to the developer a lot of freedom regarding the implementation of the architecture the lack of a clear division of concerns between layers can be a problem.

Perfompal provides an Object-oriented way to encapsulate business logic into units that are composable.

This allows an easier way to follow a "clean architecture" pattern.

You can learn more of this style on this talks:

- [Clean Architecture and design](https://www.youtube.com/watch?v=Nsjsiz2A9mg)
- [Trailblazer Intro](https://www.youtube.com/watch?v=5rceVs87q48)
- [See You On the Trail](https://www.youtube.com/watch?v=pjXhw_0bCmk)
- [Trailblazer](https://www.youtube.com/watch?v=PJZQkqn8g4U)


Also from this books:

- [Clean Architecture](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Trailblazer](https://leanpub.com/trailblazer)


And Following this guys:

- [Nick (creator of trailblazer)](https://twitter.com/apotonick)


performpal is inspired by [traiblazer's operations](http://trailblazer.to/gems/operation/2.0/index.html).

