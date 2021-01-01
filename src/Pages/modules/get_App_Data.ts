import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';
import log from './log';

// eslint-disable-next-line @typescript-eslint/naming-convention
<<<<<<< HEAD
const Load_APP_HOME_PATH = () => {
  try {
    return path.join(ipcRenderer.sendSync('get-home-path'), '.usp');
=======
export const Load_APP_HOME_PATH = () => {
  try {
    return ipcRenderer.sendSync('get-home-path');
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
  } catch (e_) {
    log('Could Not Load App Home Path', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could Not Load App Home Path\n\n${e_}`,
    });
  }
  return '';
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const Load_APPSETTINGS = () => {
  const VALUE = {
    APP_SETTINGS: '',
    APP_SETTINGS_PATH: '',
  };
  try {
    const APP_HOME_PATH = Load_APP_HOME_PATH();

    VALUE.APP_SETTINGS_PATH = path.join(APP_HOME_PATH, 'Appsetting.json');
    VALUE.APP_SETTINGS = JSON.parse(
      fs.readFileSync(VALUE.APP_SETTINGS_PATH).toString()
    );
  } catch (e_) {
    log('Could not Load App Settings', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load App Settings\n\n${e_}`,
    });
  }

  return VALUE;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const Load_CCODES = () => {
<<<<<<< HEAD
  const VALUE = {
    CCODES: '',
    CCODES_PATH: '',
  };

  try {
    const APP_HOME_PATH = Load_APP_HOME_PATH();

    VALUE.CCODES_PATH = path.join(APP_HOME_PATH, 'Communication_Codes.json');
    VALUE.CCODES = JSON.parse(fs.readFileSync(VALUE.CCODES_PATH).toString());
  } catch (e_) {
    log('Could not Load Communication Codes', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load Communication Codes\n\n${e_}`,
    });
  }
  return VALUE;
};

export const { APP_SETTINGS, APP_SETTINGS_PATH } = Load_APPSETTINGS();
export const { CCODES, CCODES_PATH } = Load_CCODES();
=======
  return ipcRenderer.sendSync('get-CCODES');
};

export const { APP_SETTINGS, APP_SETTINGS_PATH } = Load_APPSETTINGS();
export const { CCODES } = Load_CCODES();
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
export const APP_HOME_PATH = Load_APP_HOME_PATH();
