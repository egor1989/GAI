app = null

crypto = require 'crypto'

secret = "y8tHachup4aPhaKUThA3$USWa"
oneDay = 60 * 60 * 24 * 1000


index = (req, res) ->
  res.render 'admin/index',
    title: "Manager panel"

login = (req, res) ->
  if req.method == "GET"
    res.render 'login', 
      title: "Login"
    return

  user = req.body.user
  pwd = req.body.pwd
  found = false

  users = app.settings['users']

  for cnt in [0..users.length]
    if (users[cnt].user == user && users[cnt].pwd == pwd)
      found = true
      break

  if (!found)
    res.render "login", 
      title: "Login"
      errors: [ "Неправильная пара логин/пароль" ]
    return


  shasum = crypto.createHash('sha1')
  shasum.update(user + pwd + secret)

  users[cnt].session = shasum.digest('hex');


  res.cookie 'tx_session', users[cnt].session, 
    expires: new Date(Date.now() + oneDay)
    httpOnly: true
  
  res.cookie 'login', users[cnt].user, 
    expires: new Date(Date.now() + oneDay)
    httpOnly: true

  res.redirect('/admin/index');



logout = (req, res) ->
  res.cookie 'tx_session'
    expires: new Date(1)
    path: '/'
  res.clearCookie('login')

  res.redirect('/')

module.exports = (expressapp) ->
  app = expressapp
  @index = index
  @login = login
  @logout = logout
  return @   