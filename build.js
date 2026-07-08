import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');

console.log('Cleaning dist directory...');
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

console.log('Compiling TypeScript...');
try {
  const tscPath = path.resolve('node_modules/typescript/bin/tsc');
  execSync(`node "${tscPath}"`, { stdio: 'inherit' });
  
  console.log('Resolving path aliases...');
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execSync(`${npxCmd} tsc-alias`, { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed');
  process.exit(1);
}

console.log('Copying assets...');
const filesToCopy = [
  { src: 'src/newtab.html', dest: 'dist/newtab.html' },
  { src: 'src/newtab.css', dest: 'dist/newtab.css' },
  { src: 'src/manifest.json', dest: 'dist/manifest.json' }
];

const dirsToCopy = [
  { src: 'src/css', dest: 'dist/css' },
  { src: 'src/data', dest: 'dist/data' },
  { src: 'icons', dest: 'dist/icons' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  }
});

dirsToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied directory ${src} -> ${dest}`);
  }
});

console.log('Build completed successfully!');
