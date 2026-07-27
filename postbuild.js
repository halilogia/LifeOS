import fs from 'fs';

console.log('Post-build: Copying assets...');

const filesToCopy = [
  { src: 'src/manifest.json', dest: 'dist/manifest.json' }
];

const dirsToCopy = [
  { src: 'src/data', dest: 'dist/data' },
  { src: 'icons', dest: 'dist/icons' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.warn(`Warning: Source file ${src} does not exist.`);
  }
});

dirsToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied directory ${src} -> ${dest}`);
  } else {
    console.warn(`Warning: Source directory ${src} does not exist.`);
  }
});

console.log('Post-build completed successfully!');
