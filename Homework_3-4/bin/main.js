#!/usr/bin/env node

require("../../opendsu-sdk/builds/output/openDSU");
const { Command } = require('commander');
const program = new Command();

$$.LEGACY_BEHAVIOUR_ENABLED = true;

program
  .name('contract-cli')
  .description('CLI for managing and signing digital contracts using OpenDSU')
  .version('0.1.0');


require('../commands/signContract')(program);
require('../commands/createContract')(program);
require('../commands/loadContract')(program);
require('../commands/verifyContract')(program);
require('../commands/exportContract')(program);
require('../commands/importContract')(program);

program.parse(process.argv);