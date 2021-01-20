import { ipcRenderer } from 'electron';

const selectDirectory = async ({
  defaultPath = null,
  multiSelections = false,
}) => {
  let options = {
    properties: ['openDirectory'],
    defaultPath,
  };
  if (defaultPath) options.defaultPath = defaultPath;
  if (multiSelections) options.properties.push('multiSelections');
  return ipcRenderer.invoke('select-dialog', options);
};

const selectFile = async ({ defaultPath = null, multiSelections = false }) => {
  let options = {
    properties: ['openFile'],
    defaultPath,
  };
  if (defaultPath) options.defaultPath = defaultPath;
  if (multiSelections) options.properties.push('multiSelections');
  return ipcRenderer.invoke('select-dialog');
};

export { selectDirectory, selectFile };
