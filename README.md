# township-reset-password-token

Manage tokens for resetting passwords

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/township-reset-password-token.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/township-reset-password-token
[travis-image]: https://img.shields.io/travis/township/township-reset-password-token.svg?style=flat-square
[travis-url]: https://travis-ci.org/township/township-reset-password-token
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CONDUCT.md

## About

A common part of using passwords for authentication includes resetting passwords and receiving an email with a special link that let's you reset the password.

This module takes care of generating and validating the tokens you use in the special links that get emailed out.

## Install

```sh
npm install --save township-reset-password-token
```

## Usage

```js
var memdb = require('memdb')
var townshipResetPassword = require('township-reset-password-token')

var db = memdb()
var reset = townshipResetPassword(db, {
  secret: 'not a secret' // passed to jsonwebtoken
})

reset.create({ accountKey: 'key for an account' }, function (err, token) {
  if (err) return console.log(err)
  // typically would send the token as part of a link in an email

  // token would then be received by the server in an http request
  reset.confirm({ accountKey: 'key for an account', token: token }, function (err) {
    if (err) return console.log('token not confirmed', err)
    console.log('token confirmed')
  })
})
```

## Documentation
- [API](docs/api.md)
- [Tests](tests/)

### Examples
- [Basic usage](examples/basic-usage.js)
- client/server demo example
  - [client](examples/client.js)
  - [server](examples/server.js)

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Conduct

It's important that this project contributes to a friendly, safe, and welcoming environment for all, particularly for folks that are historically underrepresented in technology. Read this project's [code of conduct](CONDUCT.md)

## License

[ISC](LICENSE.md)
