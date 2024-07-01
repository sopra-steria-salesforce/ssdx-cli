#! /usr/bin/env node

import cli from './cli/cli.js';

const myCli = new cli();
await myCli.init();
myCli.run();
