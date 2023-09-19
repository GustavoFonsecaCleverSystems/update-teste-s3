import app from './config/app';
import env from './config/env';

import { log } from '../logger/presentation';

app.listen(env.port, () => log.business.info(`Server started at: http://localhost:${env.port}`));
