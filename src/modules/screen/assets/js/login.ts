/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
let config: any;
let axiosConfig: any;

window.onload = async function () {
  // @ts-expect-error
  config = await window.electronAPI.configuration();

  // @ts-expect-error
  const terminal = window.electronAPI.terminal;

  console.log(terminal);

  axiosConfig = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('TOKEN'),
    },
  };

  if (terminal.tipologin === '1') {
    loginUserWindows();
  }
};

async function loginUserWindows() {
  // @ts-expect-error
  const user = window.electronAPI.user;
  console.log(user);

  const logon = {
    login: user,
    idterminal: config.idterminal,
  };

  // @ts-expect-error
  const server = window.electronAPI.server;
  // @ts-expect-error
  const data = await axios.post(`${server}/login/windows`, logon);
  const token = data.data;
  localStorage.setItem('TOKEN', token);
  axiosConfig.headers.Authorization = 'Bearer ' + localStorage.getItem('TOKEN');

  // @ts-expect-error
  window.electronAPI.ipc.send('logger', {
    type: 'access',
    message: `User ${user} logado no sistema.`,
  });
  // @ts-expect-error
  window.electronAPI.ipc.send('open-panel');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendForm() {
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;

  if (usernameInput.value === '' || passwordInput.value === '') {
    return;
  }

  const logon = {
    login: usernameInput.value,
    password: passwordInput.value,
    idterminal: config.idterminal,
  };

  try {
    // @ts-expect-error
    const server = window.electronAPI.server;
    // @ts-expect-error
    const data = await axios.post(`${server}/login/logon`, logon);
    const token = data.data;
    localStorage.setItem('TOKEN', token);
    axiosConfig.headers.Authorization = 'Bearer ' + localStorage.getItem('TOKEN');
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'access',
      message: `User ${logon.login} logado no sistema.`,
    });
    // @ts-expect-error
    window.electronAPI.ipc.send('open-panel');
  } catch (error) {
    // @ts-expect-error
    window.electronAPI.ipc.send('logger', {
      type: 'error',
      message: error,
    });
    // @ts-expect-error
    const err = error as AxiosError;
    if (err.response.status === 401) {
      // @ts-expect-error
      return window.electronAPI.ipc.send('logger', {
        type: 'error',
        message: 'login ou senha incorretos',
      });
    }
    if (err.response.status === 406) {
      // @ts-expect-error
      return window.electronAPI.ipc.send('logger', {
        type: 'error',
        message: 'Erro de usuário de login',
      });
    }
  }
}
