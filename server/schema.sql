CREATE TABLE users (
  id uuid NOT NULL PRIMARY KEY,
  username text NOT NULL,
  password text NOT NULL
);
INSERT INTO users (id, username, password) VALUES ('370bc450-2ade-4900-a3ef-3a906cca6d8c','test','test');

CREATE TABLE oauth_clients (
  id text NOT NULL PRIMARY KEY,
  client_secret text NOT NULL,
  redirect_uri text NOT NULL,
  name text NOT NULL,
  logo text NOT NULL
);
INSERT INTO oauth_clients (id, client_secret, redirect_uri, name, logo) VALUES ('the_client_id','the_client_secret','http://localhost:8000/auth','client app','http://robohash.org/0UR.png?set=set1');

CREATE TABLE oauth_access_tokens (
  access_token text NOT NULL PRIMARY KEY,
  client_id text NOT NULL REFERENCES client(id),
  user_id uuid NOT NULL REFERENCES user(id),
  expires timestamp without time zone NOT NULL
);

CREATE TABLE oauth_auth_codes (
  auth_code text NOT NULL PRIMARY KEY,
  client_id text NOT NULL REFERENCES client(id),
  user_id uuid  NOT NULL REFERENCES user(id),
  expires timestamp without time zone NOT NULL
);
