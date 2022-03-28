import fs from 'fs';
import commandLineArgs from 'command-line-args';

const optionDefinitions = [{ name: 'type', alias: 't', type: String }]; // major, minor, patch
const options = commandLineArgs(optionDefinitions);

if (!options.type) {
    console.log('No symantic versioning type supplied: --type');
    process.exit(1);
}

const increaseVersion = () => {
    let parts = currentVersion.split('.');
    switch (options.type) {
        case 'major':
            parts[0] = parseInt(parts[0]) + 1;
            break;
        case 'minor':
            parts[1] = parseInt(parts[1]) + 1;
            break;
        case 'patch':
            parts[2] = parseInt(parts[2]) + 1;
            break;
    }
    return parts.join('.');
};

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
    currentVersion = pkg.version,
    newVersion = increaseVersion();

if (currentVersion == newVersion) {
    process.exit(1);
}

// package.json
pkg.version = newVersion;

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 4), {
    encoding: 'utf8',
});

// version.ts
let ts = fs.readFileSync('./src/lib/version.ts', 'utf8');
ts = ts.replace(`'${currentVersion}'`, `'${newVersion}'`);
fs.writeFileSync('./src/lib/version.ts', ts, {
    encoding: 'utf8',
});

// README.md
let rm = fs.readFileSync('./README.md', 'utf8');
rm = rm.replace(`version-${currentVersion}`, `version-${newVersion}`);
fs.writeFileSync('./README.md', rm, {
    encoding: 'utf8',
});
