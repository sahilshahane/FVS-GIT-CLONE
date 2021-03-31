import fs from 'fs';
import request from 'request';
import progress from 'request-progress';
import { ipcRenderer } from 'electron';

// const Load_APP_HOME_PATH = () => {
//   return ipcRenderer.sendSync('get-APP_HOME_PATH');
// };

// let APP_HOME_PATH = Load_APP_HOME_PATH();
// let APP_SETTINGS = {};

// eslint-disable-next-line @typescript-eslint/naming-convention
const saveProfilePicture_FILE = async (from: fs.PathLike, to: fs.PathLike) => {
  const handle = (err: NodeJS.ErrnoException | null) => {
    if (err) return false;
    return to;
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  return new Promise((resolve) => {
    fs.copyFile(from, to, (err) => {
      resolve(handle(err));
    });
  });
};

const downloadFile = async (url: any, to: string) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return new Promise((resolve) => {
    try {
      // The options argument is optional so you can omit it
      progress(request(url), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
        throttle: 0,
      })
        .on('progress', (state: any) => {
          const { percent } = state;
          // The state is an object that looks like this:
          // {
          //     percent: 0.5,               // Overall percent (between 0 to 1)
          //     speed: 554732,              // The download speed in bytes/sec
          //     size: {
          //         total: 90044871,        // The total payload size in bytes
          //         transferred: 27610959   // The transferred payload size in bytes
          //     },
          //     time: {
          //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
          //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
          //     }
          // }
          console.log('Download Progress : ', percent);
        })
        .on('error', (err: any) => {
          resolve(false);
        })
        .on('end', () => {
          resolve(to);
        })
        .pipe(fs.createWriteStream(to));
    } catch (e) {
      resolve(false);
    }
  });
};

const saveProfilePicture = async ({ type, url }) => {
  let result = null;
  const PROFILE_IMG_PATH = url;

  // eslint-disable-next-line default-case
  switch (type) {
    case 'file':
      result = await saveProfilePicture_FILE(url, PROFILE_IMG_PATH);
      break;
    case 'url':
      result = await downloadFile(url, PROFILE_IMG_PATH);
      break;
  }
  return result;
};

export default saveProfilePicture;
