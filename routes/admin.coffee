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

  usr = req.body.user
  pwd = req.body.pwd
  user = null

  for u in app.settings['users']
    if (u.user == usr && u.pwd == pwd)
      user = u
      break

  if not user
    res.render "login", 
      title: "Login"
      errors: [ "Неправильная пара логин/пароль" ]
    return
  

  shasum = crypto.createHash('sha1')
  shasum.update(usr + pwd + secret)

  user.session = shasum.digest('hex');

  res.cookie 'tx_session', user.session, 
    expires: new Date(Date.now() + oneDay)
    httpOnly: true
    path: '/'
  
  res.cookie 'login', user.user, 
    expires: new Date(Date.now() + oneDay)
    httpOnly: true
    path: '/'

  res.redirect('/admin/index');

logout = (req, res) ->
  res.cookie 'tx_session', null
    expires: new Date(1)
    path: '/'
  res.cookie 'login', null
    expires: new Date(1)
    path: '/'

  res.redirect('/')


# Auth middleware
checkAuth = (req, res, next) ->
  if req.path.match /^\/admin\/(login|logout)/
    return next()

  sess = req.cookies.tx_session

  if (sess != undefined)
    for user in app.settings['users']
      if (user.session == sess)
        return next() 

  res.redirect('/admin/login');


module.exports = (expressapp) ->
  app = expressapp

  # Check auth
  app.all '^/admin*$', checkAuth

  # Routes
  app.get '/admin/?(index)?', index
  app.get '/admin/logout', logout
  app.all '/admin/login', login

  return @   