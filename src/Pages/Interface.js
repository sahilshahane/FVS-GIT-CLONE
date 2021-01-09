import fs from 'fs';
import useReload from './useReloader';

function getHomeFolderInfo(filePath) {
  return fs.promises.readFile(filePath, 'utf-8');
}

async function updateFolderInfo(info) {
  const stream = fs.createReadStream('./info.json', {
    highWaterMark: 100,
  });
  let jsonData = '';
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of stream) {
    jsonData += data.toString();
  }
  jsonData = { info: [...JSON.parse(jsonData).info, info] };
  fs.writeFile('./info.json', JSON.stringify(jsonData), (err) => {
    console.log('There was an error while updating the info.txt file', err);
    useReload();
  });
}

export default {
  getHomeFolderInfo,
  updateFolderInfo,
};
