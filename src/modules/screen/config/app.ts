import express, { Express } from 'express';
import { renderFile } from 'ejs';
import path from 'path';

const app = express();
app.use(express.json());

class App {
  readonly app: Express;
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '..', 'assets')));
    this.app.set('views', path.resolve(__dirname, '..', 'assets'));
    this.app.engine('html', renderFile);
    this.app.set('view engine', 'html');
  }

  routes() {
    this.app.get('/', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'panel.html'));
    });

    this.app.get('/vertical', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'vertical-panel.html'));
    });

    this.app.get('/login', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'login.html'));
    });

    this.app.get('/avaliacao', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'modals', 'avaliacao.html'));
    });

    this.app.get('/encaminhar', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'modals', 'encaminhar.html'));
    });

    this.app.get('/callterminals', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'modals', 'callterminals.html'));
    });

    this.app.get('/paneladm', (req, res) => {
      res.render(path.join(__dirname, '..', 'assets', 'paneladm.html'));
    });
  }
}

export default new App().app;
