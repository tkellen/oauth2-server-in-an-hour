const OAUTH = {
  CLIENT: 'http://localhost:8000',
  SERVER: 'http://localhost:4000',
  CLIENT_ID: 'the_client_id',
  CLIENT_SECRET: 'the_client_secret',
  REDIRECT_URI: '/auth'
};

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const request = require('superagent');

const client = express();

client.set('views', path.join(__dirname, 'views'));
client.set('view engine', 'jade');
client.use(bodyParser.urlencoded({extended: true}));
client.use(bodyParser.json());

client.get('/', function (req, res) {
  res.render('home', OAUTH);
});

// the oauth dance is almost over! after the user has approved
// the requesting service (this client), they are bounced
// back to this route, with a ?code parameter. now we have to
// send that back to the oauth server, along with our client
// secret. if we get a 200 response back, it will contain our
// access code.  at long last!
client.get(OAUTH.REDIRECT_URI, function (req, res)
{
  if (req.query.code !== '500') {
    request.
      post(OAUTH.SERVER+'/oauth/token').
      type('form').
      send({
        client_id: OAUTH.CLIENT_ID,
        client_secret: OAUTH.CLIENT_SECRET,
        redirect_uri: OAUTH.CLIENT+OAUTH.REDIRECT_URI,
        code: req.query.code,
        grant_type: 'authorization_code'
      }).
      end(function (result) {
        res.send(result.body);
      });
  } else {
    res.send(req.query);
  }
});

client.listen(8000);
console.log('oauth requesting service listening on port 8000');
