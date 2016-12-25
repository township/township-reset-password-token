var request = require('request')

var url = 'http://127.0.0.1:4343/'

var creds = {
  email: 'hi@example.com',
  password: 'badpassword'
}

// user registers
register(creds, function (err, account) {
  if (err) return console.log(err)

  // they forget their password and initiate the reset flow
  reset({ accountKey: account.key }, function (err, info) {
    if (err) return console.log(err)

    // pretend like i've been redirected from the email to a form
    // and this is what's being sent from the form
    var options = {
      accountKey: account.key,
      password: 'badpassword',
      newPassword: 'betterpasswordkinda',
      resetToken: info.resetToken
    }

    // user confirms reset with new password
    confirm(options, function (err) {
      if (err) return console.log(err)

      // user logs in with new password
      login({ email: 'hi@example.com', password: 'betterpasswordkinda' }, function (err) {
        if (err) return console.log(err)
      })
    })
  })
})

function register (creds, callback) {
  request({ url: url + 'account', json: true, body: creds, method: 'POST' }, function (err, res, body) {
    if (err) return callback(err)
    if (res.statusCode >= 400) return callback(body)
    return callback(null, body)
  })
}

function reset (options, callback) {
  request({ url: url + 'reset/' + options.accountKey, json: true, method: 'POST' }, function (err, res, body) {
    if (err) return callback(err)
    if (res.statusCode >= 400) return callback(body)
    return callback(null, body)
  })
}

function confirm (options, callback) {
  request({ url: url + 'reset/' + options.accountKey + '/' + options.resetToken, json: true, body: options, method: 'POST' }, function (err, res, body) {
    if (err) return callback(err)
    if (res.statusCode >= 400) return callback(body)
    return callback(null, body)
  })
}

function login (creds, callback) {
  request({ url: url + 'login', json: true, body: creds, method: 'POST' }, function (err, res, body) {
    if (err) return callback(err)
    if (res.statusCode >= 400) return callback(body)
    return callback(null, body)
  })
}
