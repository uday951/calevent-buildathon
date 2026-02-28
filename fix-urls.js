import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace in template literals: `http://localhost:5000/api`
    content = content.replace(/`http:\/\/localhost:5000(\/.*?)`/g, "`${import.meta.env.VITE_BACKEND_URL}$1`");
    
    // Replace in single quotes: 'http://localhost:5000'
    content = content.replace(/'http:\/\/localhost:5000(\/.*?)'/g, "`${import.meta.env.VITE_BACKEND_URL}$1`");

    // Replace in double quotes: "http://localhost:5000"
    content = content.replace(/"http:\/\/localhost:5000(\/.*?)"/g, "`${import.meta.env.VITE_BACKEND_URL}$1`");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
