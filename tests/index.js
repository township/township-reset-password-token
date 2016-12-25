var test = require('tape')
var memdb = require('memdb')
var resetTokens = require('../index')

var publicKey = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAvmJlA/DZl3SVKNl0OcyVbsMTOmTM
qU0Avhmcl6r8qxkBgjwArIxQr7G7v8m0LOeFIklnmF3sYAwA+8llHGFReV8ASW4w
5AUC8ngZThaH9xk6DQscaMmoEFPN5thWpNcwMgUFYovBtPLwtAZjYr9Se+UT/5k4
VltW7ko6SHbCfMgUUbU=
-----END PUBLIC KEY-----`

var privateKey = `-----BEGIN EC PRIVATE KEY-----
MIHbAgEBBEFmz7VMXRtCPTlBETqMMx/mokyA3xPXra2SkcA7Xh0N6sgne1rgSZNU
ngT6TR3XLfBOt5+p5GRW6p1FVtn+vtPyRKAHBgUrgQQAI6GBiQOBhgAEAL5iZQPw
2Zd0lSjZdDnMlW7DEzpkzKlNAL4ZnJeq/KsZAYI8AKyMUK+xu7/JtCznhSJJZ5hd
7GAMAPvJZRxhUXlfAEluMOQFAvJ4GU4Wh/cZOg0LHGjJqBBTzebYVqTXMDIFBWKL
wbTy8LQGY2K/UnvlE/+ZOFZbVu5KOkh2wnzIFFG1
-----END EC PRIVATE KEY-----`

test('using a secret', function (t) {
  var db = memdb()
  var reset = resetTokens(db, {
    secret: 'choose a better secret'
  })

  reset.create({ accountKey: 'key for an account' }, function (err, token) {
    t.ifErr(err)
    t.equal(typeof token, 'string')

    reset.confirm({ accountKey: 'key for an account', token: token }, function (err) {
      t.ifErr(err)
      t.end()
    })
  })
})

test('using a keypair', function (t) {
  var db = memdb()
  var reset = resetTokens(db, {
    publicKey: publicKey,
    privateKey: privateKey,
    algorithm: 'ES512'
  })

  reset.create({ accountKey: 'key for an account' }, function (err, token) {
    t.ifErr(err)
    t.equal(typeof token, 'string')

    reset.confirm({ accountKey: 'key for an account', token: token }, function (err) {
      t.ifErr(err)
      t.end()
    })
  })
})
