import { watchFile, unwatchFile } from 'fs';
import * as cheerio from 'cheerio';
import { getDevice } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import axios from 'axios';
import fg from 'api-dylux';
import fs from 'fs';
import fetch from 'node-fetch';
import * as type from 'file-type';
import { fileURLToPath } from 'url';
import path from 'path';
import { es } from "./lib/total-idiomas.js";

global.botnumber = "";
global.confirmCode = "";
global.owner = [
  ['5491166887146', '>\`\` sebas-MD', true],
  ['5491166887146', '>\`\` sebas-MD', true],
];
global.colabs = [''];
global.mods = [''];
global.prems = ['5491166887146'];

global.APIs = {
  nrtm: 'https://fg-nrtm.ddns.net',
  fgmods: 'https://api.fgmods.xyz'
};

global.fgapis = ['ELhI4IG6', 'Ys3CfFTU', '6IbiVq6V', 'dEBWvxCY'];
global.fgkey = fgapis[Math.floor(fgapis.length * Math.random())];

global.APIKeys = {
  'https://api.fgmods.xyz': `${fgkey}`
};

// Sticker WM
global.packname = 'Akame Ai - WhatsApp Bot';
global.footer = "Akame Ai By KenisawaDev ";
global.author = `KenisawaDev`;
global.wm = 'Akame Ai - KenisawaDev ';

global.insta = 'https://www.instagram.com/';

// Imágenes
global.imagen0 = fs.readFileSync('./src/Sylph_logo.jpg');
global.imagen = fs.readFileSync('./src/Sylph.jpg');
global.imagen3 = 'https://uploader.nyxs.pw/tmp/XpyQ06-1747528593417.jpg';

// Info
global.botName = 'Akame Ai';
global.menu = "https://uploader.nyxs.pw/tmp/XpyQ06-1747528593417.jpg";
global.fglog = 'https://uploader.nyxs.pw/tmp/XpyQ06-1747528593417.jpg';
global.link_ = 'https://chat.whatsapp.com/HySzhMVlV3u0vL6oJbBccb';

// Subbots & Sesiones
global.jadi = "Sesiones/Subbots";
global.syl = "Sesiones/Principal";

// Otros
global.axios = axios;
global.fs = fs;
global.cheerio = cheerio;
global.fg = fg;
global.path = path;
global.yts = yts;
global.fetch = fetch;
global.fileType = type;

global.wait = '⌛ _Espera un momento . . ._';
global.rwait = '⌛';
global.dmoji = '🤭';
global.done = '✅';
global.error = '❌';
global.xmoji = '🔥';

global.multiplier = 69;
global.maxwarn = '2';

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log("Update 'config.js'");
  import(`${file}?update=${Date.now()}`);
});
