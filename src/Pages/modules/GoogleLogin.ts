import fs from 'fs';
import { google } from 'googleapis';
import http from 'http';
import querystring from 'querystring';
import openURLinBrowser from 'open';
import path from 'path';
import portfinder from 'portfinder';
import { APP_HOME_PATH } from './get_App_Data';

const loadCredentials = () => {
  return fs.promises
    .readFile(path.join(APP_HOME_PATH, 'credentials.json'))
    .catch((err) => {
      if (err) throw err;
    });
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const get_Gservice = async () => {
  const credentials = JSON.parse(await loadCredentials());
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { client_secret, client_id, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

const createScerver: (
  PORT: number,
  HOST: string,
  handler: (query: querystring.ParsedUrlQuery) => void,
  message?: string
) => http.Server = (
  PORT = 8080,
  HOST = 'localhost',
  handler,
  message = 'Authorization Complete, You may now close this window.'
) => {
  const server = http.createServer((req, res) => {
    const query = querystring.parse(req.url);

    handler(query);

    res.writeHead(200, 'OK', { 'content-type': 'text/plain' });
    res.write(message);
    res.end();
  });

  server.listen(PORT, HOST);
  server.close();
  return server;
};

export default async (callback?: (error?: any, data?: any) => void) => {
  try {
    const Gservice = await get_Gservice();

    portfinder.getPort((err_, PORT) => {
      const TOKEN_PATH = path.join(APP_HOME_PATH, 'token.json');
      const HOST = 'localhost';

      const SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
      ];

      const authUrl = Gservice.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        redirect_uri: `http://${HOST}:${PORT}`,
      });

      openURLinBrowser(authUrl);

      const handler = (query: any) => {
        if (query['/?code']) {
          Gservice.getToken(query['/?code'], (err, token) => {
            if (err) throw err;

            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err_) => {
              if (err_) throw err_;
              if (callback) callback(null, {});
            });
          });
        }
      };
      return createScerver(PORT, HOST, handler);
    });
  } catch (err) {
    if (callback) callback(err, null);
  }

  return null;
};
