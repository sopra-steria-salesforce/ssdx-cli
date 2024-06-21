import fs from 'fs';
import ssdxConfig from '../../dto/ssdx-config.dto.js';

export function fetchConfig(): ssdxConfig {
  return JSON.parse(fs.readFileSync('ssdx-config.json', 'utf8')) as ssdxConfig;
}
