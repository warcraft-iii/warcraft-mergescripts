/**
 * @File   : index.ts
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 1:27:20 PM
 */

import program from 'commander';
import fs from 'mz/fs';
import { run } from './lib';

async function main() {
    program
        .version('0.0.1')
        .description('Welcome!')
        .arguments('<input>')
        .option('-o, --output <output>', 'Output file')
        .parse(process.argv);

    if (!program.output || program.args.length < 1) {
        program.outputHelp();
        return;
    }

    if (!(await fs.exists(program.args[0]))) {
        program.outputHelp();
        return;
    }
    run(program.args[0], program.output);
}

main();
