import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const svgPath = path.resolve(__dirname, 'board.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Regex para capturar IDs de paths con GPIO o GND
const regexId = /<path[^>]*id="([^"]*(GPIO|GND|5v5|3v3)[^"]*)"[^>]*>/gi;

const ids = [];
let match;
while ((match = regexId.exec(svgContent)) !== null) {
  ids.push(match[1]);
}

console.log('IDs encontrados para mantener:', ids);

