var assert = require('assert')
var sublevel = require('subleveldown')
var jwt = require('jsonwebtoken')
var createLock = require('level-lock')

/**
* @name townshipResetPasswordToken
* @param {Object} db – instance of a level db. See https://npmjs.com/level
* @param {Object} config – configuration object
* @param {string} config.algorithm – **Optional.** JWA algorithm, default is `HS256` (HMAC/SHA256 with secret). You must specify your key type if using a keypair.
* @param {string} config.secret – **Optional.** Secret used for signing and verifying tokens
* @param {string} config.publicKey – **Optional.** Public key used to sign tokens
* @param {string} config.privateKey – **Optional.** Private key used to verify tokens
* @example
*
* var resetTokens = require('township-reset-password-token')
*
* var reset = resetTokens(db, {
*   secret: 'choose something more secret'
* })
*
* reset.create({ accountKey: 'key for an account' }, function (err, token) {
*   if (err) return console.log(err)
*
*   reset.confirm({ accountKey: 'key for an account', token: token }, function (err) {
*     if (err) return console.log('token not confirmed')
*     console.log('token confirmed')
*   })
* })
*/
module.exports = function townshipResetPasswordToken (db, config) {
  assert(typeof db === 'object', 'level db is required')
  config = config || {}

  var resetdb = sublevel(db, 'township-reset-password', { valueEncoding: 'json' })
  var reset = { db: resetdb }

  var secret = config.secret
  var publicKey = config.publicKey
  var privateKey = config.privateKey
  var algorithm = config.algorithm
  var secretOrPrivateKey = privateKey || secret
  var secretOrPublicKey = publicKey || secret

  function lock (key, mode) {
    return createLock(resetdb, key, mode)
  }

  /**
  * create a password reset token
  * @name create
  * @param {Object} options – required options object
  * @param {String} options.accountKey – required key for the account that is being reset
  * @example
  *
  * reset.create({ accountKey: 'key for an account' }, function (err, token) {
  *   if (err) return console.log(err)
  *   // send token in email
  * })
  */
  function create (options, callback) {
    if (typeof options !== 'object') return callback(new Error('options object is required'))
    if (typeof options.accountKey !== 'string') return callback(new Error('options.accountKey string is required'))

    options.expiresIn = options.expiresIn || '30m'
    var accountKey = options.accountKey
    delete options.accountKey
    if (algorithm) options.algorithm = algorithm

    const release = lock(accountKey)

    jwt.sign({ accountKey: accountKey }, secretOrPrivateKey, options, function (err, token) {
      if (err) {
        release()
        return callback(err)
      }

      resetdb.put(accountKey, { token: token, accountKey: accountKey }, function (err) {
        release()
        if (err) return callback(err)
        callback(null, token)
      })
    })
  }

  /**
  * confirm a password reset token
  * @name confirm
  * @param {Object} options – required options object
  * @param {String} options.accountKey – required key for the account that is being reset
  * @example
  * // receive token via http request
  * reset.confirm({ accountKey: 'key for an account', token: token }, function (err) {
  *   if (err) return console.log('token not confirmed')
  *   console.log('token confirmed')
  * })
  */
  function confirm (options, callback) {
    if (typeof options !== 'object') return callback(new Error('options object is required'))
    if (typeof options.accountKey !== 'string') return callback(new Error('options.accountKey string is required'))
    if (typeof options.token !== 'string') return callback(new Error('options.token string is required'))

    var accountKey = options.accountKey
    delete options.accountKey
    if (algorithm) options.algorithm = algorithm

    const release = lock(accountKey)

    resetdb.get(accountKey, function (err, data) {
      if (err) {
        release()
        return callback(new Error('reset token not found'))
      }

      if (options.token !== data.token) {
        release()
        return callback(new Error('invalid reset token'))
      }

      jwt.verify(options.token, secretOrPublicKey, options, function (err, decoded) {
        release()
        if (err) return callback(err)
        resetdb.del(accountKey, callback)
      })
    })
  }

  reset.create = create
  reset.confirm = confirm
  return reset
}
