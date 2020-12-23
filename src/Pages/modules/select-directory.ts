import { ipcRenderer } from 'electron';

const selectDirectory = async () => {
  return ipcRenderer.invoke('select-directory');
};

export default selectDirectory;
