import { contextBridge, ipcRenderer } from 'electron';
import { userInfo } from 'os';

import { s3clientconfiguration as config } from './modules/configurator/presentation';

const terminal = config.sectionConfiguration('terminal');

contextBridge.exposeInMainWorld('electronAPI', {
  configuration: () => config.s3liteConfiguration(),
  terminal: terminal,
  confirmation: config.sectionConfiguration('panel').confirmation,
  server: config.getServer(),
  ipc: ipcRenderer,
  user: userInfo().username,
  onListenChangeFila: (cb: (data: any) => void) => {
    ipcRenderer.on('changeFila', (event, args) => cb(args));
  },
  onNoteEvaluetion: (cb: (data: any) => void) => {
    ipcRenderer.on('note-evaluetion', (event, args) => cb(args));
  },
  onCloseAttendance: (cb: (data: any) => void) => {
    ipcRenderer.on('close-attendance', (event, args) => cb(args));
  },
});
