var http = require('http')
var appa = require('appa')
var send = require('appa/send')
var error = require('appa/error')
var memdb = require('memdb')
var stub = require('nodemailer-stub-transport')
var townshipAccounts = require('township-accounts')
var townshipEmail = require('township-email')
var resetTokens = require('../index')

var db = memdb()
var app = appa()

var secret = 'choose something more secret'

var accounts = townshipAccounts(db, {
  secret: secret
})

var reset = resetTokens(db, {
  secret: secret
})

var email = townshipEmail({
  transport: stub()
})

app.on('/account', function (req, res, ctx) {
  if (req.method === 'POST') {
    return accounts.register(ctx.body, function (err, account) {
      if (err) return error(403, 'problem creating account').pipe(res)
      send(account).pipe(res)
    })
  } else {
    error(405, 'Method not allowed').pipe(res)
  }
})

app.on('/login', function (req, res, ctx) {
  if (req.method === 'POST') {
    return accounts.login(ctx.body, function (err, account) {
      if (err) return error(403, 'problem logging in to account').pipe(res)
      send(account).pipe(res)
    })
  } else {
    error(405, 'Method not allowed').pipe(res)
  }
})

app.on('/reset/:accountKey', function (req, res, ctx) {
  var accountKey = ctx.params.accountKey

  if (req.method === 'POST') {
    accounts.auth.get(accountKey, function (err, authData) {
      if (err) return error(404, 'account not found').pipe(res)

      reset.create({ accountKey: accountKey }, function (err, token) {
        if (err) return error(500, 'problem creating reset token').pipe(res)

        var url = `http://example.com/${accountKey}/${token}`
        var emailOptions = { to: authData.email, from: 'hey@hi.com', url: url }

        email.confirm(emailOptions, function (err, info) {
          if (err) return error(500, 'problem sending confirmation email').pipe(res)

          // pretend like i'm checking my email with a link to fill out a form
          // but just for this demo i'll grab the info i need from this response:
          send({ accountKey: accountKey, resetToken: token }).pipe(res)
        })
      })
    })
  } else {
    error(405, 'Method not allowed').pipe(res)
  }
})

app.on('/reset/:accountKey/:token', function (req, res, ctx) {
  var accountKey = ctx.params.accountKey

  if (req.method === 'POST') {
    accounts.auth.get(accountKey, function (err, authData) {
      if (err) return error(404, 'account not found').pipe(res)

      ctx.body.email = authData.basic.email

      reset.confirm(ctx.params, function (err) {
        if (err) return error(500, 'problem resetting password').pipe(res)

        accounts.updatePassword(ctx.body, function (err, huh) {
          if (err) return error(500, 'problem resetting password').pipe(res)
          send({ reset: 'success' }).pipe(res)
        })
      })
    })
  } else {
    error(405, 'Method not allowed').pipe(res)
  }
})

http.createServer(app).listen(4343, function () {
  app.log.info('server started on http://127.0.0.1:4343')
})
