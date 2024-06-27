import fs from 'fs';
import ssdxConfig from 'dto/ssdx-config.dto.js';

export function fetchConfig(): ssdxConfig {
  try {
    return JSON.parse(
      fs.readFileSync('ssdx-config.json', 'utf8')
    ) as ssdxConfig;
  } catch (error) {
    throw new Error(
      'Failed to parse ssdx-config.json, make sure it is a valid JSON file with correct structure. See documentation.'
    );
  }
}
