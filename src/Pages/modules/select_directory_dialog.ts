import { ipcRenderer } from 'electron';

const selectDirectory = async (defaultPath = null, multiSelections = false) => {
  let options = {
    properties: ['openDirectory'],
    defaultPath,
    multiSelections,
  };
  if (defaultPath) options.defaultPath = defaultPath;

  return ipcRenderer.invoke('select-dialog', options);
};

const selectFile = async (defaultPath = null, multiSelections = false) => {
  let options = {
    properties: ['openFile'],
    defaultPath,
    multiSelections,
  };
  if (defaultPath) options.defaultPath = defaultPath;

  return ipcRenderer.invoke('select-dialog');
};

export { selectDirectory, selectFile };
