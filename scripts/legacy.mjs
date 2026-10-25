// Builds dist/assets/app.legacy.js, the bundle for Chromium 38 (webOS 3.x TVs). Runs after `vite build` (npm run build).
// 1. vite build with HEARTH_LEGACY=1 -> dist-legacy/assets/app.js (ES2015, custom properties emulated, see src/lib/cssvars.ts)
// 2. Babel lowers it to ES5 (syntax only; no polyfills are added by Babel)
// 3. core-js-bundle (every polyfill, applied only where the engine lacks the feature) is put in front of it
// The page loads this file only when the engine has no CSS custom properties; every other TV loads app.js.
import {execSync} from 'node:child_process';
import {readFileSync, writeFileSync, rmSync, existsSync} from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

rmSync('dist-legacy', {recursive: true, force: true});
execSync('npx vite build', {stdio: 'inherit', env: {...process.env, HEARTH_LEGACY: '1'}});

const source = readFileSync('dist-legacy/assets/app.js', 'utf8');
const lowered = babel.transformSync(source, {
	babelrc: false, configFile: false, sourceType: 'script', compact: true, comments: false,
	presets: [[require.resolve('@babel/preset-env'), {targets: {chrome: '38'}, modules: false}]]
}).code;
const polyfills = readFileSync(require.resolve('core-js-bundle/minified.js'), 'utf8').replace(/\/\/# sourceMappingURL=.*$/m, '');

if (!existsSync('dist/assets')) throw new Error('run `vite build` first (npm run build)');
writeFileSync('dist/assets/app.legacy.js', polyfills + '\n' + lowered + '\n');
rmSync('dist-legacy', {recursive: true, force: true});
console.log(`dist/assets/app.legacy.js: ${Math.round((polyfills.length + lowered.length) / 1024)} KB (ES5 + polyfills)`);
