import { SettingJson } from '../entities';
import { Settings } from '../interfaces';
import * as config from '../config';

import axios from 'axios';
import fs from 'fs';

type JsonObj = typeof config.config;
type KeysJsonObj = keyof JsonObj;

export class S3ClientConfiguration implements Settings {
  allConfiguration(): SettingJson {
    return config.config;
  }
  sectionConfiguration(section: KeysJsonObj): SettingJson {
    return config.config[section];
  }

  writeConfig(): void {
    try {
      const allConf = this.allConfiguration();
      fs.writeFileSync(config.configpath, JSON.stringify(allConf));
    } catch (error) {
      console.log(error);
    }
  }

  getServer(): string {
    const host = this.sectionConfiguration('server').host;
    const port = this.sectionConfiguration('server').port;
    return `http://${host}:${port}/api`;
  }

  async s3liteConfiguration(): Promise<SettingJson> {
    const server = this.getServer();
    const terminal = this.sectionConfiguration('terminal');
    const data = await axios.get(`${server}/s3client/settings/${terminal.idterminal}`);
    return data.data;
  }
}
