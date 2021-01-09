const fs = require('fs');
const { google } = require('googleapis');
const http = require('http');
const querystring = require('querystring');
const openURLinBrowser = require('open');

const loadCredentials = () => {
  return fs.promises
    .readFile('assets\\installation\\.usp\\credentials.json')
    .catch((err) => {
      if (err) console.log('Error Reading Credentials.json', err);
    });
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const get_Gservice = async () => {
  const credentials = JSON.parse(await loadCredentials());
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { client_secret, client_id, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

const GenerateToken = (TOKEN_PATH, Gservice) => {
  const HOST = 'localhost';
  const PORT = 8080;

  const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
  ];

  const authUrl = Gservice.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    redirect_uri: `http://${HOST}:${PORT}`,
  });

  // openURLinBrowser(authUrl);
  console.log(authUrl);
  const server = http
    .createServer((req, res) => {
      const CODE = querystring.parse(req.url)['/?code'];
      if (CODE) {
        Gservice.getToken(CODE, (err, token) => {
          if (err) {
            return console.error(err);
          }
          // SETTING TOKEN
          Gservice.setCredentials(token);

          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err_) => {
            if (err_)
              return console.error(
                'Error Occured While Writing Token File',
                err_
              );
          });

          // CLOSE THE SERVER
          server.close();
        });
      }
      res.writeHead(200, 'OK', { 'content-type': 'text/plain' });
      res.write('Authorization Complete, You may now close this window.');
      res.end();
    })
    .listen(PORT, HOST, () => {
      // console.log(`Login Server Started at http://${HOST}:${PORT}`);
    });
};

const startLogin = async () => {
  const Gservice = await get_Gservice();

  const TOKEN_PATH = 'token.json';

  fs.readFile(TOKEN_PATH, (err, tokenFile) => {
    if (err) {
      const token = GenerateToken(TOKEN_PATH, Gservice);

      // Setting Token
      Gservice.setCredentials(token);
    } else {
      const token = JSON.parse(tokenFile);

      // Setting Token
      Gservice.setCredentials(token);
    }
  });
};

startLogin();
