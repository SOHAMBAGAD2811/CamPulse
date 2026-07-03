const fs = require('fs');
const glob = require('glob'); // Not installed? Let's use simple recursion.
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(path.join(dir, f));
    }
  });
}

const targetDir = './app';

walkDir(targetDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace removeItem with signOut
  if (content.includes('localStorage.removeItem("campuspulse_uid")') || content.includes("localStorage.removeItem('campuspulse_uid')")) {
    content = content.replace(/localStorage\.removeItem\(['"]campuspulse_uid['"]\)/g, "signOut({ callbackUrl: '/' })");
  }

  // Replace getItem with getSession
  if (content.includes('localStorage.getItem("campuspulse_uid")') || content.includes("localStorage.getItem('campuspulse_uid')")) {
    content = content.replace(/localStorage\.getItem\(['"]campuspulse_uid['"]\)/g, "((await getSession())?.user as any)?.uid");
  }

  // Add imports if modified and not already present
  if (content !== originalContent) {
    if (!content.includes('next-auth/react')) {
      const importStmt = 'import { getSession, signOut } from "next-auth/react";\n';
      // Insert after "use client"; if it exists, else at top
      if (content.startsWith('"use client";')) {
        content = content.replace('"use client";', '"use client";\n' + importStmt);
      } else {
        content = importStmt + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Refactored: " + filePath);
  }
});
console.log("Refactoring complete.");
