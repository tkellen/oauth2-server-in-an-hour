# oauth2-server-in-an-hour
> it isn't pretty, but it's a working base to start from

# Setup
1. Clone repo.
2. `npm install`
3. `npm start`
4. Visit http://localhost:8000
5. Click login
6. Enter test/test
7. Authorize the app.
8. Copy the access_token and use it at http://localhost:4000/secret?access_token=token-here
9. Yay.

*Okay, this actually took like two hours and it was only possible thanks to thomseddon's [oauth2-server](https://github.com/thomseddon/node-oauth2-server) module.*
