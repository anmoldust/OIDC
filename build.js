const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend assets...');
execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });

const srcDir = path.join(__dirname, 'frontend', 'dist');
const destDir = path.join(__dirname, 'public');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

fs.cpSync(srcDir, destDir, { recursive: true });
console.log('Successfully prepared ./public directory for Render static site release!');
