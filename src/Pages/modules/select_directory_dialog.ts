import { ipcRenderer } from 'electron';

const selectDirectory = async () => {
  return ipcRenderer.invoke('select-directory');
};

const selectFile = async () => {
  return ipcRenderer.invoke('select-files');
}

export { selectDirectory, selectFile };
