/**
 * @File   : index.ts
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 1:27:20 PM
 */

import program from 'commander';
import fs from 'mz/fs';
import path from 'path';

const LUA = '.lua';
const LUA_REG = new RegExp(LUA + '$');

async function getAllFiles(p: string, r: string[] = []) {
    for (let file of await fs.readdir(p)) {
        const name = path.basename(file);
        if (name.startsWith('.') || name.startsWith('@')) {
            continue;
        }

        file = path.join(p, file);
        const stats = await fs.stat(file);
        if (stats.isDirectory()) {
            await getAllFiles(file, r);
        } else if (stats.isFile()) {
            r.push(file);
        }
    }
    return r;
}

async function run(input: string, output: string) {
    await fs.writeFile(
        output,
        [
            (await fs.readFile(path.join(__dirname, '../resources/debug.lua'))).toString().replace(/\s+/g, ' '),
            ...(await Promise.all(
                (await getAllFiles(input))
                    .filter(file => path.extname(file).toLowerCase() === LUA)
                    .map(async file => {
                        const name = path
                            .relative(input, file)
                            .replace(LUA_REG, '')
                            .replace(/[\\\/]/g, '.');
                        const body = await fs.readFile(file, { encoding: 'utf-8' });
                        return `_PRELOADED['${name}']=[==========[${body}]==========]`;
                    })
            )),
            `require('war3map')`
        ].join('\n\n')
    );
}

async function main() {
    program
        .version('0.0.1')
        .description('Welcome!')
        .arguments('<input>')
        .option('-o, --output <output>', 'Output file')
        .parse(process.argv);

    // if (!program.output || program.args.length < 1) {
    //     program.outputHelp();
    //     return;
    // }

    // if (!(await fs.exists(program.output))) {
    //     program.outputHelp();
    //     return;
    // }

    run(program.args[0], program.output);
}

main();
