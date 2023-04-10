<a href="https://promisesaplus.com/">
  <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right">
</a>

# fan.js

`fan.js` is a implementation of the [Promise/A+](https://github.com/promises-aplus/promises-spec) spec written in ES5. It uses a simple and easy-to-understand style that closely matches every line of the spec. `fan.js` is a good example to reference when creating your own Promise and to help you learn the Promise/A+ spec.

## Running the Test Suite
`fan.js` has passed all the tests in the [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

To run all the tests, use the following command:

```shell
npm run test
```

The [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests) organizes tests by spec requirements. If you want to run the tests for a specific requirement, use a command like:

```shell
npm run test -- grep 2.1.2
```

## Useful Resources
- [Promise() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise)
- [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests)
