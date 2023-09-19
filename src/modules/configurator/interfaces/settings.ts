import { SettingJson } from '../entities';

export interface Settings {
  allConfiguration(): SettingJson;
  sectionConfiguration(section: string): SettingJson;
}
