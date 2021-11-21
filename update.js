const { readFileSync, writeFileSync, existsSync } = require('fs');
const { registerFont, createCanvas, loadImage } = require('canvas');

// Searches if a .env file exists, will take OSU_TOKEN env var anyways (GitHub secret)
let token = '';
if (existsSync('.env')) require('dotenv').config();
token = process.env.OSU_TOKEN;


registerFont('assets/notosans.ttf', { family: 'Noto Sans', weight: '400'});

const canvas = createCanvas(800, 400);
const ctx = canvas.getContext('2d');

ctx.font = '40px Noto Sans';
ctx.fillStyle = '#ffffff';
let xx = 50, yy = 90;

(async function () {
    const playcounts = await require('./getPlaycounts')(token, '16775174');
    const statuses = (readFileSync('statusRaw.txt', { encoding: 'utf-8' }))
        .split('\n') // IF USED IN WINDOWS, use \r\n instead
        .map((e, i) => {
            if (playcounts[i] > 5000) return { t: 'complete', c: '#35a200' };
            else if (e == '1') return { t: 'in progress', c: '#0000ff'};
            else return { t: 'unvisited', c: '#a00000' };
        });

    const bg = await loadImage('assets/bg.png');
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Modes
    for (let mode of ['Standard:', 'Taiko:', 'CtB:', 'Mania:']) {
        ctx.fillText(mode, xx, yy);
        yy += 80;
    }

    // Progress
    xx = 280; yy = 92; // idk why but it looks more centered with yy 92 lol
    for (let mode of playcounts) {
        ctx.fillText(mode + ' / 5000', xx, yy);
        yy += 80;
    }

    // Statuses
    xx = 550; yy = 90;
    for (let { c, t } of statuses) {
        ctx.fillStyle = c;
        ctx.fillText(t, xx, yy);
        yy += 80;
    } 
})().then(() => {
    // Writes canvas buffer to the path given
    const output = 'output/result.png';
    writeFileSync(output, canvas.toBuffer());
    console.log('\033[92;40m[Success] \033[0m' + 'Created image to ' + output);
}).catch(e => console.log('\033[91;40m[Error] \033[0m' + e));

