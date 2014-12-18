const db = require('./db');

var model = module.exports = {};

model.getClient = function (clientId, clientSecret, callback) {
  var query = [
    'SELECT id, client_secret, redirect_uri',
    'FROM oauth_clients',
    'WHERE id = $1'
  ];
  var params = [clientId];

  if (clientSecret) {
    query.push('AND client_secret = $2');
    params.push(clientSecret);
  }

  db.get(query.join(' '), params, function (err, client) {
    if (err || !client) {
      callback(false);
    } else {
      callback(null, {
        clientId: client.id,
        clientSecret: client.client_secret,
        redirectUri: client.redirect_uri
      });
    }
  });
};

model.getAccessToken = function (bearerToken, callback) {
  var query = [
    'SELECT access_token, client_id, expires, user_id',
    'FROM oauth_access_tokens',
    'WHERE access_token = $1'
  ].join(' ');
  var params = [bearerToken];

  db.get(query, params, function (err, token) {
    if (err || !token) {
      callback(false);
    } else {
      callback(null, {
        accessToken: token.access_token,
        clientId: token.client_id,
        expires: token.expires,
        userId: token.user_id
      });
    }
  });
};

model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  var query = [
    'INSERT INTO oauth_access_tokens',
    '(access_token, client_id, user_id, expires)',
    'VALUES (?, ?, ?, ?)'
  ].join(' ');
  var params = [accessToken, clientId, user.id, expires.getTime()];

  db.run(query, params, function (err, result) {
    if (err) {
      // do something more appropriate if an error happens
      throw err;
    } else {
      callback(null);
    }
  });
};

model.saveAuthCode = function (authCode, clientId, expires, userId, callback) {
  var query = [
    'INSERT INTO oauth_auth_codes',
    '(auth_code, client_id, user_id, expires)',
    'VALUES (?, ?, ?, ?)'
  ].join(' ');
  var params = [authCode, clientId, userId, expires];

  db.run(query, params, function (err, result) {
    if (err) {
      // do something more appropriate if an error happens,
      throw err;
    } else {
      callback(null);
    }
  });
};

model.getAuthCode = function (bearerCode, callback) {
  var query = [
    'SELECT * FROM oauth_auth_codes',
    'WHERE auth_code = $1'
  ].join(' ');
  var params = [bearerCode];

  db.get(query, params, function (err, code) {
    if (err) {
      // do something more appropriate if an error happens,
      // or if a result isn't found, or if a token is expired
      throw err;
    } else {
      callback(null, {
        clientId: code.client_id,
        expires: code.expires,
        userId: code.user_id
      });
    }
  })
};

model.grantTypeAllowed = function (clientId, grantType, callback) {
  // if you want to restrict grant types by client, determine that here
  callback(null, true);
};
