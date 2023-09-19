import { app, BrowserWindow, BrowserView, dialog, ipcMain, globalShortcut } from 'electron';
import { fork } from 'child_process';
import { createSocket } from 'dgram';
import { join } from 'path';
import { release } from 'os';
import { address } from 'ip';

import { s3clientconfiguration as config } from './modules/configurator/presentation';
import { log } from './modules/logger/presentation';

let login: BrowserWindow;
let panel: BrowserWindow;
let viewEvaluetion: BrowserView;
let viewForward: BrowserView;
let viewTerminalsCall: BrowserView;
let child: any;
let panelBounds: any;
const client = createSocket('udp4');
const BROADCAST = {
  PORT: 6024,
  BROADCAST_ADDR: '192.168.1.255',
};

const arrRange = address().split('.');
BROADCAST.BROADCAST_ADDR = `${arrRange[0]}.${arrRange[1]}.${arrRange[2]}.255`;

log.business.info(`Windows Version: ${release()}`);
log.business.info(`Meu IP: ${address()}`);

function receiveBroadcastServer() {
  const port = 6025;
  const server = createSocket('udp4');

  server.on('error', function (error) {
    log.errors.error(`Error: ${error}`);
    server.close();
  });

  server.on('listening', function () {
    const address = server.address();
    log.business.info(`UDP Server listening on ${address.address}: ${address.port}`);
    server.setBroadcast(true);
  });

  server.on('message', function (message, rinfo) {
    // console.log('Message from Server: ' + rinfo.address + ':' + rinfo.port + ' - ' + message);
    if (message.toString() === 'paper-not-present') {
      return serverPaperNotPresent();
    }
    const server = config.sectionConfiguration('server');
    const data = JSON.parse(message.toString());
    if (data.servername === server.servername) {
      return sumMyFilaList(data.filas);
    }
    return;
  });

  server.on('close', function () {
    console.log('Socket is closed !');
  });

  server.bind(port);
}

function sumMyFilaList(filas: unknown) {
  // const filas = JSON.parse(message.toString());
  panel.webContents.send('changeFila', filas);
}

function createPanel() {
  panel = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    type: 'toolbar',
    width: 850,
    height: 40,
    minHeight: 0,
    x: 600,
    y: 20,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    closable: false,
    frame: false,
    kiosk: false,
    movable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: false,
    useContentSize: true,
    hasShadow: false,
  });
  // panel.setIgnoreMouseEvents(true);
  panel.setBackgroundColor('#00000003');
  panel.setAlwaysOnTop(true, 'screen-saver', 1);
  panel.loadURL('http://localhost:4005/');
  // panel.webContents.openDevTools();
}

function createPanelVertical() {
  panel = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    type: 'toolbar',
    width: 45,
    height: 300,
    minHeight: 50,
    minWidth: 30,
    x: 600,
    y: 20,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    closable: false,
    frame: false,
    kiosk: false,
    movable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    useContentSize: true,
    hasShadow: false,
  });
  panel.setAlwaysOnTop(true, 'screen-saver', 1);
  panel.loadURL('http://localhost:4005/vertical');
  //panel.webContents.openDevTools();
}

function createPanelAdm() {
  panel = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    // type: 'toolbar',
    width: 850,
    height: 300,
    minHeight: 0,
    x: 600,
    y: 20,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    closable: true,
    frame: true,
    kiosk: false,
    movable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: false,
    useContentSize: true,
    hasShadow: false,
  });
  // panel.setIgnoreMouseEvents(true);
  panel.setBackgroundColor('#00000003');
  panel.setAlwaysOnTop(true, 'screen-saver', 1);
  panel.loadURL('http://localhost:4005/paneladm');
  // panel.webContents.openDevTools();
}

function createPanelLogin() {
  login = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    width: 600,
    height: 400,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    closable: true,
    frame: false,
    kiosk: true,
    movable: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    center: true,
  });
  login.loadURL('http://localhost:4005/login');
  // login.webContents.openDevTools();
}

function close() {
  setTimeout(() => {
    child.kill('SIGINT');
    app.exit(0);
    process.exit(0);
  }, 500);
}

function serverNotFound() {
  log.business.info(`Server Not Found`);
  dialog.showErrorBox('Servidor não encontrado!', 'Favor verifique o servidor e tente novamente.');
}

function showMessageError(title: string, desc: string) {
  dialog.showErrorBox(title, desc);
}

function notImplemented() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Ops!',
    message: 'Essa funcionalidade ainda não foi implementada!',
  });
}

function showSenha(senha: any) {
  if (senha === null) {
    log.business.info(`Não existem senhas a serem chamada!`);
    return dialog.showMessageBox({
      type: 'info',
      title: 'Ops!',
      message: 'Não existem senhas a serem chamada!',
    });
  }
  if (
    senha.senhanomecliente === null ||
    senha.senhanomecliente === '' ||
    senha.senhanomecliente === undefined
  ) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Senha Chamada',
      message: `Chamando senha ${senha.senhatexto}`,
    });
  } else {
    dialog.showMessageBox({
      type: 'info',
      title: 'Senha Chamada',
      message: `Chamando senha ${senha.senhatexto}, cliente ${senha.senhanomecliente}`,
    });
  }
}

function desabilitButton() {
  log.business.info(`Botão desabilitado, precisa chamar uma senha primeiro!`);
  dialog.showMessageBox({
    type: 'warning',
    title: 'Ops!',
    message: 'Você precisa chamar uma senha primeiro!',
  });
}

function desabilitButtonChamar() {
  log.business.info(`Botão desabilitado, precisa liberar o atendimento para chamar outra senha!`);
  dialog.showMessageBox({
    type: 'warning',
    title: 'Ops!',
    message: 'Você precisa liberar o atendimento para chamar outra senha!',
  });
}

function serverPaperNotPresent() {
  dialog
    .showMessageBox(panel, {
      type: 'warning',
      title: 'Impressora sem papel',
      message: `Impressora encontra-se sem papel, favor troque a bobina`,
    })
    .then((box) => {
      //
    })
    .catch((err) => {
      log.errors.error(err);
    });
}

function confirmation(button: number) {
  let messagestr = '';
  let detailstr = '';
  switch (button) {
    case 1:
      messagestr = 'Finalizar sem atendimento?';
      detailstr = 'Isso será considerado como uma desistencia!';
      break;
    case 2:
      messagestr = 'Finalizar atendimento?';
      break;

    default:
      break;
  }
  const resp = dialog.showMessageBoxSync({
    type: 'question',
    title: 'Finalizar',
    buttons: ['Finalizar', 'Cancelar'],
    detail: detailstr,
    message: messagestr,
  });
  return resp;
}

function closeView() {
  panel.setBrowserView(null);
  //panel.setBounds(panelBounds);
  panel.setBounds({ width: panelBounds.width, height: panelBounds.height });
}

function showEvaluation() {
  viewEvaluetion = new BrowserView({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });
  panel.setBrowserView(viewEvaluetion);
  panelBounds = panel.getBounds();
  panel.setBounds({ width: 850, height: 200 });
  viewEvaluetion.setBounds({ x: 0, y: 0, width: 800, height: 200 });

  viewEvaluetion.webContents.loadURL('http://localhost:4005/avaliacao');
}

function showFilasEncaminhar(senha: any) {
  viewForward = new BrowserView({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });
  panel.setBrowserView(viewForward);
  panelBounds = panel.getBounds();
  panel.setBounds({ width: 850, height: 200 });
  viewForward.setBounds({ x: 0, y: 0, width: 800, height: 200 });
  // viewForward.webContents.openDevTools();

  viewForward.webContents.loadURL(`http://localhost:4005/encaminhar?idsenha=${senha.idsenha}`);
}

function showTerminalsCall() {
  closeView();
  viewTerminalsCall = new BrowserView({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });
  panel.setBrowserView(viewTerminalsCall);
  panelBounds = panel.getBounds();
  panel.setBounds({ width: 850, height: 200 });
  viewTerminalsCall.setBounds({ x: 0, y: 0, width: 800, height: 200 });
  //viewTerminalsCall.webContents.openDevTools();

  viewTerminalsCall.webContents.loadURL(`http://localhost:4005/callterminals`);
}

function noneEvaluetion() {
  panel.webContents.send('note-evaluetion', -1);
  closeView();
}

function closeModal() {
  closeView();
}

function closeModalVertical() {
  //panel.setBounds(panelBounds);
  panel.setBounds({ width: panelBounds.width, height: panelBounds.height });
}

function closeAttendance() {
  panel.webContents.send('close-attendance');
  closeView();
}

function searchServer() {
  let notFound: NodeJS.Timeout;
  let sentBroadcast: NodeJS.Timeout;

  client.bind(function () {
    client.setBroadcast(true);
    sentBroadcast = setInterval(broadcastNew, 3000);
    notFound = setTimeout(() => {
      clearInterval(sentBroadcast);
      client.close();
      serverNotFound();
      close();
    }, 20000);
  });

  function broadcastNew() {
    const server = config.sectionConfiguration('server');
    const message = Buffer.from(`${server.servername}`);

    client.on('message', function (msg, info) {
      log.business.info(`Connected in Server Address: ${info.address} `);
      server.host = info.address;
      config.writeConfig();
      clearTimeout(notFound);
      clearInterval(sentBroadcast);
      createPanelLogin();
      //createPanelVertical();
      //createPanel();
      client.close();
    });

    client.send(message, 0, message.length, BROADCAST.PORT, BROADCAST.BROADCAST_ADDR, function () {
      log.business.info(`Procurando server: ${message} `);
    });
  }
}

function connectServer() {
  const server = config.sectionConfiguration('server');
  if (server.host === '') {
    return searchServer();
  }

  let notFound: NodeJS.Timeout;
  let sentConnect: NodeJS.Timeout;

  client.bind(function () {
    client.setBroadcast(false);
    sentConnect = setInterval(connectServerAddress, 3000);
    notFound = setTimeout(() => {
      clearInterval(sentConnect);
      client.close();
      serverNotFound();
      close();
    }, 20000);
  });

  function connectServerAddress() {
    const message = Buffer.from(`${server.servername}`);

    client.on('message', function (msg, info) {
      log.business.info(`Connected in Server Address: ${info.address} `);
      clearTimeout(notFound);
      clearInterval(sentConnect);
      createPanelLogin();
      //createPanelVertical();
      //createPanel();
      client.close();
    });

    client.send(message, 0, message.length, BROADCAST.PORT, `${server.host}`, function () {
      log.business.info(`Tentando conectar no servidor: ${server.host} - ${server.servername}`);
    });
  }
}

function writeLog(logType: string, message: string) {
  switch (logType) {
    case 'business':
    default:
      log.business.info(message);
      break;
    case 'access':
      log.access.info(message);
      break;
    case 'error':
      log.errors.error(message);
      break;
  }
}

function setWindowShowFilas(qtd: number) {
  panelBounds = panel.getBounds();
  const heightFilas = panelBounds.height + qtd * 30;
  panel.setSize(panelBounds.width, heightFilas);
}

function setWindowShowMore() {
  const heightMore = 90;
  panelBounds = panel.getBounds();
  panel.setSize(panelBounds.width, heightMore);
}

function setWindowVerticalShowMore() {
  const heightMore = 300;
  panelBounds = panel.getBounds();
  panel.setSize(250, heightMore);
}

function setWindowVerticalShowFilas(qtd: number) {
  const heightFilas = qtd * 100;
  panelBounds = panel.getBounds();
  panel.setSize(200, heightFilas);
}

function setWindowHideFilas() {
  //panel.setBounds(panelBounds);
  panel.setBounds({ width: panelBounds.width, height: panelBounds.height });
}

function listeners() {
  const panel = config.sectionConfiguration('panel');
  ipcMain.on('open-panel', () => {
    login.close();
    if (panel.paineladm === '1') {
      createPanelAdm();
    } else {
      if (panel.orientation === '1') {
        createPanel();
      } else if (panel.orientation === '2') {
        createPanelVertical();
      }
    }
  });

  ipcMain.on('not-implemented', () => {
    notImplemented();
  });

  ipcMain.on('server-not-found', () => {
    serverNotFound();
  });

  ipcMain.on('desabilit-button', () => {
    desabilitButton();
  });

  ipcMain.on('desabilit-button-chamar', () => {
    desabilitButtonChamar();
  });

  ipcMain.on('closer', () => {
    close();
  });

  ipcMain.on('show-senha', (event, senha) => {
    showSenha(senha);
  });

  ipcMain.on('logger', (event, logger) => {
    writeLog(logger.type, logger.message);
  });

  ipcMain.on('message-error', (event, message) => {
    showMessageError(message.title, message.desc);
  });

  ipcMain.on('confirmation', (event, button) => {
    const buttonconfirmation = confirmation(button);
    const fim = buttonconfirmation === 0;
    if (button === 1) {
      return (event.returnValue = fim);
    }
    if (button === 2) {
      return (event.returnValue = fim);
    }
  });

  ipcMain.on('avaliacao', (event) => {
    showEvaluation();
  });

  ipcMain.on('forward', (event, senha) => {
    showFilasEncaminhar(senha);
  });

  ipcMain.on('non-evaluetion', (event) => {
    noneEvaluetion();
  });

  ipcMain.on('close-forward', (event) => {
    closeAttendance();
  });

  ipcMain.on('close-modal', (event, vertical) => {
    if (vertical === 1) closeModalVertical();
    else closeModal();
  });

  ipcMain.on('set-window-show-filas', (event, qtd, vertical) => {
    if (vertical === 1) setWindowVerticalShowFilas(qtd);
    else setWindowShowFilas(qtd);
  });

  ipcMain.on('set-window-hide-filas', (event) => {
    setWindowHideFilas();
  });

  ipcMain.on('set-window-show-more', (event, vertical) => {
    if (vertical === 1) setWindowVerticalShowMore();
    else setWindowShowMore();
  });

  ipcMain.on('call-other-terminal', (event, senha) => {
    showTerminalsCall();
  });
}

function shortcuts() {
  const confEvaluetion = config.sectionConfiguration('evaluetion');
  const evaluetion = {
    pessimo: confEvaluetion.pessimo as string,
    ruim: confEvaluetion.ruim as string,
    regular: confEvaluetion.regular as string,
    bom: confEvaluetion.bom as string,
    otimo: confEvaluetion.otimo as string,
  };
  globalShortcut.register(evaluetion.pessimo, () => {
    panel.webContents.send('note-evaluetion', 1);
    closeView();
  });
  globalShortcut.register(evaluetion.ruim as string, () => {
    panel.webContents.send('note-evaluetion', 2);
    closeView();
  });
  globalShortcut.register(evaluetion.regular as string, () => {
    panel.webContents.send('note-evaluetion', 3);
    closeView();
  });
  globalShortcut.register(evaluetion.bom as string, () => {
    panel.webContents.send('note-evaluetion', 4);
    closeView();
  });
  globalShortcut.register(evaluetion.otimo as string, () => {
    panel.webContents.send('note-evaluetion', 5);
    closeView();
  });
}

app.whenReady().then(() => {
  receiveBroadcastServer();
  child = fork(require.resolve('./modules/screen/server.js'));
  connectServer();
  shortcuts();
  listeners();
});
