/**
 * Junta chaves de portal-pages-extra.{pt,en}.json aos ficheiros principais i18n.
 * Executar: node scripts/merge-portal-i18n.cjs
 */
const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '../public/assets/i18n');

function merge(lang) {
  const mainPath = path.join(i18nDir, `${lang}.json`);
  const extraPath = path.join(__dirname, `portal-pages-extra.${lang}.json`);
  if (!fs.existsSync(extraPath)) {
    console.error('Missing:', extraPath);
    process.exit(1);
  }
  const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  const extra = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
  Object.assign(main, extra);
  fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');
  console.log('Merged portal keys into', mainPath);
}

merge('pt');
merge('en');
