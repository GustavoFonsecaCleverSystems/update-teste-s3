/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
let terminalConf: any;
let confAxios: any;
let allFila = [];

window.onload = async function () {
  // @ts-expect-error
  terminalConf = await window.electronAPI.terminal;

  confAxios = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
    },
  };
  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    await axios.get(`${server}/s3client/filas`, confAxios);
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
  const filasTerminal = terminalConf.posFilaLista;

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

async function* generateSequence(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    // Wow, can use await!
    await new Promise((resolve) => setTimeout(resolve, 1));

    yield i;
  }
}

async function showAllFilas(filas: []) {
  allFila = filas;
  const tableAllFilas = document.getElementById('all-filas') as HTMLTableElement;
  if (tableAllFilas === null) {
    return;
  }
  const generator = generateSequence(0, tableAllFilas.rows.length);

  for await (const index of generator) {
    if (tableAllFilas.rows.length > 2) {
      tableAllFilas.deleteRow(1);
    }
  }

  filas.forEach((fila: any) => {
    const row = tableAllFilas.insertRow(1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    cell1.innerHTML = fila.nomefila;
    cell2.innerHTML = fila.fila;
  });
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

async function relPorPeriodo() {
  try {
    const inputDateStart = document.getElementById('dateStart') as HTMLInputElement;
    const inputDateEnd = document.getElementById('dateEnd') as HTMLInputElement;

    if (!inputDateStart.value || !inputDateEnd.value) {
      // @ts-expect-error
      window.electronAPI.ipc.send('message-error', {
        title: 'Data não escolhida',
        desc: `Escolha data inicial e final para gerar relatórios`,
      });
      return;
    }

    const dateStart = `${inputDateStart.value}T00:00:00`;
    const dateEnd = `${inputDateEnd.value}T23:59:00`;

    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const response = await axios.get(`${server}/report/exportsenhas/${dateStart}/${dateEnd}`, {
      responseType: 'blob',
    });
    downloadFile(response);
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

async function relPorTerminal() {
  try {
    const inputDateStart = document.getElementById('dateStart') as HTMLInputElement;
    const inputDateEnd = document.getElementById('dateEnd') as HTMLInputElement;

    if (!inputDateStart.value || !inputDateEnd.value) {
      // @ts-expect-error
      window.electronAPI.ipc.send('message-error', {
        title: 'Data não escolhida',
        desc: `Escolha data inicial e final para gerar relatórios`,
      });
      return;
    }

    const dateStart = `${inputDateStart.value}T00:00:00`;
    const dateEnd = `${inputDateEnd.value}T23:59:00`;

    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const response = await axios.get(`${server}/report/terminal/${dateStart}/${dateEnd}`, {
      responseType: 'blob',
    });
    downloadFile(response);
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}
async function relPorPrioridade() {
  try {
    const inputDateStart = document.getElementById('dateStart') as HTMLInputElement;
    const inputDateEnd = document.getElementById('dateEnd') as HTMLInputElement;

    if (!inputDateStart.value || !inputDateEnd.value) {
      // @ts-expect-error
      window.electronAPI.ipc.send('message-error', {
        title: 'Data não escolhida',
        desc: `Escolha data inicial e final para gerar relatórios`,
      });
      return;
    }

    const dateStart = `${inputDateStart.value}T00:00:00`;
    const dateEnd = `${inputDateEnd.value}T23:59:00`;

    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const response = await axios.get(`${server}/report/prioridade/${dateStart}/${dateEnd}`, {
      responseType: 'blob',
    });
    downloadFile(response);
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
  }
}

function downloadFile(response: any) {
  const fileURL = window.URL.createObjectURL(new Blob([response.data]));
  const fileLink = document.createElement('a');
  fileLink.href = fileURL;

  const fileName = response.headers['content-disposition'].split('filename=')[1].split('.')[0];
  const extension = response.headers['content-disposition'].split('.')[1].split(';')[0];

  fileLink.setAttribute('download', `${fileName}.${extension}`);
  fileLink.setAttribute('target', '_blank');
  document.body.appendChild(fileLink);
  fileLink.click();
  fileLink.remove();
}

/* function showWindowAllFilas(vertical: number) {
  // @ts-expect-error
  window.electronAPI.ipc.send('set-window-show-filas', allFila.length, vertical);
}

function hideWindowAllFilas() {
  // @ts-expect-error
  window.electronAPI.ipc.send('set-window-hide-filas');
} */

/* async function chamar() {
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
      confAxios,
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
} */

/* async function rechamar() {
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
      confAxios,
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
} */

/* function desistiu() {
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
} */

/* async function callDesistiu() {
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
      confAxios,
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
} */

/* function finalizar() {
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
} */

/* async function callFinalizar() {
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
        confAxios,
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
} */

/* async function avaliar() {
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
} */

/* async function callAvaliar(note: number) {
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
      confAxios,
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
} */

/* async function encaminhar() {
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
} */

/* function more(vertical: number) {
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
} */

/* async function callOtherTerminal() {
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
} */

/* function closeAttendance() {
  currentSenha = null;
  const senhaAtual = document.getElementById('senha-atual') as HTMLInputElement;
  senhaAtual.innerHTML = '0';
  stop();
  count = 0;
} */

/* function startTime() {
  timer = setInterval(function () {
    segundos++;
    relogio.innerHTML = criaHoraDosSegundos(segundos);
  }, 1000);
} */

/* function criaHoraDosSegundos(segundos: number): string {
  const data = new Date(segundos * 1000);
  return data.toLocaleTimeString('pt-BR', {
    hour12: false,
    timeZone: 'UTC',
  });
} */

/* function restart() {
  clearInterval(timer);
  relogio.innerHTML = '00:00:00';
  segundos = 0;
  startTime();
} */

/* function start() {
  clearInterval(timer);
  startTime();
} */

/* function stop() {
  clearInterval(timer);
  relogio.innerHTML = '00:00:00';
  segundos = 0;
} */

/* function tryRequisition(func: number) {
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
} */
