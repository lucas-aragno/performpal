## Performpal

Performpal is a library that provides a way to remove all the business logic from different layers of your application and re structure it with "service objects".

### Installation

```
npm install --save performpal
```

### How to use it

**Performpal** provides an object called **Operation** that acts as an ochestrator between your business logic and endpoints, models, or services. They implement particular use cases of your application like placing an order or registering a new user.

- [Your first operation](docs/your-first-operation.md)
- [Communicate between steps](docs/communicate-between-steps)


performpal is inspired by [traiblazer's operations](http://trailblazer.to/gems/operation/2.0/index.html).
