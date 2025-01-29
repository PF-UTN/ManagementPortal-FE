const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const libName = process.argv[2];

if (!libName) {
  console.error('Please provide a library name.');
  process.exit(1);
}

const command = `ng generate library ${libName} --prefix=mp`;
execSync(command, { stdio: 'inherit' });

const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

if (tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths[libName]) {
    delete tsconfig.compilerOptions.paths[libName];
}

tsconfig.compilerOptions.paths[`@${libName}`] = [`projects/${libName.toLowerCase()}/src/public-api`];

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

console.log(`Library ${libName} generated and tsconfig.json updated.`);