const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const oauthserver = require('oauth2-server');

const db = require('./lib/db');

const server = module.exports = express();

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(session({
  secret: 'supa secret yo',
  resave: true,
  saveUninitialized: true
}))

server.oauth = oauthserver({
  model: require('./lib/model'),
  grants: ['authorization_code'],
  debug: true
});

server.all('/oauth/token', server.oauth.grant());

// just for easy debugging
server.get('/', function (req, res) {
  res.send(req.session);
});

// this is the first endpoint you hit during an oauth dance.
// you should arrive with a client_id and a redirect_uri in the
// query params, and they should match a client listed in the
// database under oauth_clients
server.get('/oauth/authorize', function (req, res, next) {
  // if nobody is logged in, punt us to a login screen that
  // will redirect us back here once a session has been
  // established. we can't continue until we know which
  // account to associate with the requesting service.
  if (!req.session.user) {
    res.redirect([
      '/login?redirect='+req.path,
      '&client_id='+req.query.client_id,
      '&redirect_uri='+req.query.redirect_uri
      ].join(''));
  } else {
    // add logic here to automatically bounce the user back
    // to the requesting service if they already have a valid
    // token for this client_id in oauth_access_tokens

    // if they haven't already approved the service, let's start
    // that process now... first, look up the client application
    // so we can show information about it on the authorization page
    db.get([
      'SELECT * FROM oauth_clients',
      'WHERE id=$1'
    ].join(' '), [req.query.client_id], function (err, client) {
      // add logic here to handle the case where the provided
      // client_id doesn't exist

      // show a nice approval page
      res.render('authorize', {
        client: client,
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri
      });
    });
  }
});

// choosing yes or no on the authorize screen sends us here
server.post('/oauth/authorize', [
  // if you somehow were able to get here while not logged in,
  // there is a problem.  boot the user back to a login screen
  function (req, res, next) {
    if (!req.session.user) {
      return res.redirect([
        '/login?client_id='+req.query.client_id,
        '&redirect_uri='+req.query.redirect_uri
      ].join(''));
    }
    next();
  },
  // if you made it here, the user approved your request
  // to allow the requesting service to access their account
  // now we bounce you back to the request_uri you specified
  // in the database
  server.oauth.authCodeGrant(function (req, next) {
    var error = null;
    var allowed = req.body.allow === 'yes';
    var user = req.session.user;
    next(error, allowed, user.id, user);
  })
]);

// just a login screen
server.get('/login', function (req, res) {
  res.render('login', {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// handle logins, intelligently redirecting back to oauth pages if needed.
server.post('/login', function (req, res, next) {
  db.get([
    'SELECT * FROM users',
    'WHERE username=$1 AND password=$2'
  ].join(' '), [req.body.username, req.body.password], function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else if (!user) {
      res.render('login', {
        redirect: req.body.redirect,
        client_id: req.body.client_id,
        redirect_uri: req.body.redirect_uri
      });
    } else {
      req.session.user = user;
      res.redirect([
        req.body.redirect,
        '?client_id='+req.body.client_id,
        '&redirect_uri='+req.body.redirect_uri
      ].join(''));
    }
  });
});

// you can only get here with an access token!
server.get('/secret', server.oauth.authorise(), function (req, res) {
  res.send('Welcome to the secret area!');
});

server.use(server.oauth.errorHandler());

server.listen(4000)

console.log('oauth server listening on port 8080');
