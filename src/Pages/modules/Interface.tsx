import { useContext } from 'react';
import fs from 'fs';
import path from 'path';
import { RoutingContext } from '../Components/FS_Navigation_Bar';
import { APP_HOME_PATH } from './get_AppData';

const DirectoryInfo = path.join(APP_HOME_PATH, 'folder-metadata\\info.json');

function getHomeFolderInfo() {
  return fs.promises.readFile(DirectoryInfo, 'utf-8');
}

async function updateFolderInfo(info: {
  displayName: string;
  syncStatus?: boolean;
  localLocation: string;
}) {
  if (!info.syncStatus) info.syncStatus = false;

  const stream = fs.createReadStream(DirectoryInfo, {
    highWaterMark: 100,
  });
  let jsonData = '';
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of stream) {
    jsonData += data.toString();
  }

  jsonData = { info: [...JSON.parse(jsonData).info, info] };

  fs.writeFile(DirectoryInfo, JSON.stringify(jsonData), (err) => {
    console.log('There was an error while updating the info.txt file', err);

    // Reload, from useReloader.js
    const { updateRoute } = useContext(RoutingContext);
    updateRoute(null);
  });
}

export default {
  getHomeFolderInfo,
  updateFolderInfo,
};
