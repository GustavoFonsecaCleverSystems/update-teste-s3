/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
let conf: any;
let confTerminal: any;
let confirmation: any;
let axiosConf: any;
let currentSenha: any = null;
let segundos = 0;
let timer: any;
let count = 0;
let filasAll = [];
const relogio = document.getElementById('time') as HTMLInputElement;

window.onload = async function () {
  // @ts-expect-error
  confirmation = window.electronAPI.confirmation;

  // @ts-expect-error
  conf = await window.electronAPI.configuration();
  // @ts-expect-error
  confTerminal = await window.electronAPI.terminal;

  if (confTerminal.avaliacao === '0') {
    const buttonEvaluetion = document.querySelector('#avaliar') as HTMLElement;
    if (!buttonEvaluetion) return console.log('Error element');
    buttonEvaluetion.style.display = 'none';
  }

  if (confTerminal.encaminhar === '0') {
    const buttonForward = document.querySelector('#encaminhar') as HTMLElement;
    if (!buttonForward) return console.log('Error element');
    buttonForward.style.display = 'none';
  }

  axiosConf = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
    },
  };
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    await axios.get(`${server}/s3client/filas`, axiosConf);
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
  // @ts-expect-error
  window.electronAPI.onListenChangeFila((args) => {
    changeFila(args);
  });
};

function changeFila(filas: []) {
  const filasTerminal = confTerminal.posFilaLista;

  // Filtrar filas e somar quando tiver a filtragem
  const somaFila = filas
    .map((fila: any) => {
      for (const idFila of filasTerminal) {
        if (fila.senhafila === Number(idFila)) return fila;
      }
    })
    .filter((index) => index !== undefined)
    .reduce((soma: number, fila: any) => {
      soma += fila.fila;
      return soma;
    }, 0);
  const numberFila = document.getElementById('fila') as HTMLInputElement;
  numberFila.innerHTML = String(somaFila);
  showAllFilas(filas);
}

function showAllFilas(filas: []) {
  filasAll = filas;
  const allFilas = document.getElementById('all-filas');
  if (allFilas !== null) {
    allFilas.innerHTML = '';
  }
  filas.forEach((fila: any) => {
    const filaElement = document.createElement('p');
    filaElement.innerText = `${fila.nomefila}: ${fila.fila}`;
    allFilas?.appendChild(filaElement);
  });
}

function showWindowAllFilas(vertical: number) {
  // @ts-expect-error
  window.electronAPI.ipc.send('set-window-show-filas', filasAll.length, vertical);
}

function hideWindowAllFilas() {
  // @ts-expect-error
  window.electronAPI.ipc.send('set-window-hide-filas');
}

async function chamar() {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Chamar nova senha`,
  });
  if (currentSenha !== null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button-chamar');
  }
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const data = await axios.get(
      `${server}/chamada/chamarsenha/${conf.idterminal}/false`,
      axiosConf,
    );
    // @ts-expect-error
    window.electronAPI.ipc.send('show-senha', data.data);

    if (data.data !== null) {
      currentSenha = data.data;

      // @ts-expect-error
      window.electronAPI.ipc.send('logger', {
        type: 'business',
        message: `Senha ${data.data.senhatexto} foi chamada.`,
      });

      const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
      senhaAtual.innerHTML = data.data.senhatexto;
      start();
      count = 0;
    }
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: `Erro ao Chamar Senha -> Error: ${error}`,
    });
    // @ts-expect-error
    if (axios.isAxiosError(error)) {
      if (count < 3) {
        tryRequisition(1);
      } else {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'error',
          message: `Tentativas feitas, Servidor não responde...`,
        });
        // @ts-expect-error
        window.electronAPI.ipc.send('server-not-found');
        count = 0;
      }
    }
  }
}

async function rechamar() {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Rechamar senha`,
  });
  if (currentSenha === null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button');
  }
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const data = await axios.get(
      `${server}/chamada/chamarsenha/${conf.idterminal}/true`,
      axiosConf,
    );
    // @ts-expect-error
    window.electronAPI.ipc.send('show-senha', data.data);

    if (data.data !== null) {
      currentSenha = data.data;
      // @ts-expect-error
      window.electronAPI.ipc.send('logger', {
        type: 'business',
        message: `Senha ${data.data.senhatexto} foi rechamada.`,
      });
      restart();
      count = 0;
    }
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: `Erro ao Rechamar Senha -> Error: ${error}`,
    });
    // @ts-expect-error
    if (axios.isAxiosError(error)) {
      if (count < 3) {
        tryRequisition(2);
      } else {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'error',
          message: `Tentativas feitas, Servidor não responde...`,
        });
        // @ts-expect-error
        window.electronAPI.ipc.send('server-not-found');
        count = 0;
      }
    }
  }
}

function desistiu() {
  if (currentSenha === null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button');
  }

  if (confirmation === '1') {
    // @ts-expect-error
    const isGiveUp = window.electronAPI.ipc.sendSync('confirmation', 1);
    if (isGiveUp) callDesistiu();
  } else {
    callDesistiu();
  }
}

async function callDesistiu() {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Desistir senha`,
  });
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const dataAxios = await axios.get(
      `${server}/chamada/desistiu/${conf.idterminal}/${currentSenha.idsenha}`,
      axiosConf,
    );
    if (dataAxios.data !== null) {
      // @ts-expect-error
      window.electronAPI.ipc.send('logger', {
        type: 'business',
        message: `Senha ${currentSenha.senhatexto} foi desistida.`,
      });
      const isLiberada = dataAxios.data;
      if (isLiberada) currentSenha = null;
      const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
      senhaAtual.innerHTML = '0';
      stop();
      count = 0;
    }
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: `Erro ao Desistir Senha -> Error: ${error}`,
    });
    // @ts-expect-error
    if (axios.isAxiosError(error)) {
      if (count < 3) {
        tryRequisition(3);
      } else {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'error',
          message: `Tentativas feitas, Servidor não responde...`,
        });
        // @ts-expect-error
        window.electronAPI.ipc.send('server-not-found');
        count = 0;
      }
    }
  }
}

function finalizar() {
  if (currentSenha === null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button');
  }
  if (confirmation === '1') {
    // @ts-expect-error
    const isFinish = window.electronAPI.ipc.sendSync('confirmation', 2);
    if (isFinish) callFinalizar();
  } else {
    callFinalizar();
  }
}

async function callFinalizar() {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Finalizar senha`,
  });
  try {
    if (currentSenha !== null) {
      // @ts-expect-error
      const server = window.electronAPI.server;
      // @ts-expect-error
      const data = await axios.get(
        `${server}/chamada/liberar/${conf.idterminal}/${currentSenha.idsenha}`,
        axiosConf,
      );
      if (data.data !== null) {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'business',
          message: `Senha ${currentSenha.senhatexto} foi finalizada.`,
        });
        const isLiberada = data.data;
        if (isLiberada) currentSenha = null;
        const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
        senhaAtual.innerHTML = '0';
        stop();
        count = 0;
      }
    }
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: `Erro ao Finalizar Senha -> Error: ${error}`,
    });
    // @ts-expect-error
    if (axios.isAxiosError(error)) {
      if (count < 3) {
        tryRequisition(4);
      } else {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'error',
          message: `Tentativas feitas, Servidor não responde...`,
        });
        // @ts-expect-error
        window.electronAPI.ipc.send('server-not-found');
        count = 0;
      }
    }
  }
}

async function avaliar() {
  if (currentSenha === null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button');
  }
  try {
    // @ts-expect-error
    window.electronAPI.ipc.send('avaliacao');
    // @ts-expect-error
    window.electronAPI.onNoteEvaluetion((note) => {
      if (note) {
        callAvaliar(note);
      }
    });
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

async function callAvaliar(note: number) {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Avaliar senha`,
  });
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const data = await axios.get(
      `${server}/chamada/avaliar/${conf.idterminal}/${currentSenha.idsenha}/${note}`,
      axiosConf,
    );
    if (data.data !== null) {
      // @ts-expect-error
      window.electronAPI.ipc.send('logger', {
        type: 'business',
        message: `Senha ${currentSenha.senhatexto} foi avaliada.`,
      });
      const isLiberada = data.data;
      if (isLiberada) currentSenha = null;
      const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
      senhaAtual.innerHTML = '0';
      stop();
      count = 0;
    }
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: `Erro ao Avaliar Senha -> Error: ${error}`,
    });
    // @ts-expect-error
    if (axios.isAxiosError(error)) {
      if (count < 3) {
        tryRequisition(5);
      } else {
        // @ts-expect-error
        window.electronAPI.ipc.send('logger', {
          type: 'error',
          message: `Tentativas feitas, Servidor não responde...`,
        });
        // @ts-expect-error
        window.electronAPI.ipc.send('server-not-found');
        count = 0;
      }
    }
  }
}

async function encaminhar() {
  if (currentSenha === null) {
    // @ts-expect-error
    return window.electronAPI.ipc.send('desabilit-button');
  }
  try {
    // @ts-expect-error
    window.electronAPI.ipc.send('forward', currentSenha);
    // @ts-expect-error
    window.electronAPI.onCloseAttendance(() => {
      closeAttendance();
    });
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

function more(vertical: number) {
  const dropdowns = document.getElementsByClassName('dropdown-more');
  let i;
  for (i = 0; i < dropdowns.length; i++) {
    const openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      // @ts-expect-error
      window.electronAPI.ipc.send('close-modal', vertical);
      openDropdown.classList.remove('show');
    } else {
      document.getElementById('moreDropdown')?.classList.toggle('show');
      // @ts-expect-error
      window.electronAPI.ipc.send('set-window-show-more', vertical);
    }
  }
}

async function callOtherTerminal() {
  try {
    document.getElementById('moreDropdown')?.classList.toggle('show');
    // @ts-expect-error
    window.electronAPI.ipc.send('call-other-terminal', currentSenha);
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

function closeAttendance() {
  currentSenha = null;
  const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
  senhaAtual.innerHTML = '0';
  stop();
  count = 0;
}

async function fechar() {
  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'business',
    message: `Desligar Sistema`,
  });
  try {
    // @ts-expect-error
    window.electronAPI.ipc.send('closer');
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

function startTime() {
  timer = setInterval(function () {
    segundos++;
    relogio.innerHTML = criaHoraDosSegundos(segundos);
  }, 1000);
}

function criaHoraDosSegundos(segundos: number): string {
  const data = new Date(segundos * 1000);
  return data.toLocaleTimeString('pt-BR', {
    hour12: false,
    timeZone: 'UTC',
  });
}

function restart() {
  clearInterval(timer);
  relogio.innerHTML = '00:00:00';
  segundos = 0;
  startTime();
}

function start() {
  clearInterval(timer);
  startTime();
}

function stop() {
  clearInterval(timer);
  relogio.innerHTML = '00:00:00';
  segundos = 0;
}

function tryRequisition(func: number) {
  switch (func) {
    case 1: {
      count += 1;
      chamar();
      break;
    }
    case 2: {
      count += 1;
      rechamar();
      break;
    }
    case 3: {
      count += 1;
      callDesistiu();
      break;
    }
    case 4: {
      count += 1;
      callFinalizar();
      break;
    }
    case 5: {
      count += 1;
      avaliar();
      break;
    }
  }
}
