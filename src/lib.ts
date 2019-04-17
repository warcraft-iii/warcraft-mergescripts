/**
 * @File   : lib.ts
 * @Author : Dencer (tdaddon@163.com)
 * @Link   : https://dengsir.github.io
 * @Date   : 4/17/2019, 4:23:49 PM
 */

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

export default async function run(input: string, output: string) {
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
