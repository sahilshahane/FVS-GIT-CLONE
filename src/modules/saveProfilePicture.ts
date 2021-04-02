import fs from 'fs';
import Downloader from 'nodejs-file-downloader';
import log from 'electron-log';
import path from 'path';
import { APP_HOME_PATH } from './get_AppData';

const SaveFromLocal: (from: string, to: string) => Promise<string> = (
  from,
  to
) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(from, to, (err) => {
      if (err) reject(err);
      resolve(path.resolve(to));
    });
  });
};

const DownloadFile: (url: string, to: string) => Promise<string> = (
  url,
  to
) => {
  return new Promise((resolve, reject) => {
    log.info('Profile Pic Downloading Started');

    const downloader = new Downloader({
      url,
      directory: path.dirname(to),
      fileName: path.basename(to),
      cloneFiles: false,
    });

    downloader
      .download()
      .then(() => resolve(path.resolve(to)))
      .then(() => log.info('Profile Pic Downloading Finished'))
      .catch((err: unknown) => {
        log.error('Profile Pic Downloading Failed', err);
        reject(err);
      });
  });
};

const saveProfilePicture = ({
  type,
  url,
}: {
  type: 'file' | 'url';
  url: string;
}) => {
  const SAVE_TO = path.join(APP_HOME_PATH, 'profile.jpg');

  // eslint-disable-next-line default-case
  switch (type) {
    case 'file':
      return SaveFromLocal(url, SAVE_TO);
    case 'url':
      return DownloadFile(url, SAVE_TO);
  }
};

export default saveProfilePicture;
