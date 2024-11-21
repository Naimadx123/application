import * as fs from 'fs';
import * as path from 'path';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const LOCALES_DIR = path.join(__dirname, '../locales');
const MASTER_FILE = 'en.json';

async function loadLanguageFiles(): Promise<Record<string, TranslationObject>> {
  const files = fs.readdirSync(LOCALES_DIR);
  const translations: Record<string, TranslationObject> = {};

  for (const file of files) {
    if (file.endsWith('.json')) {
      const languageCode = path.basename(file, '.json');
      const filePath = path.join(LOCALES_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      translations[languageCode] = content;
    }
  }

  return translations;
}

function compareKeys(
  master: TranslationObject,
  translation: TranslationObject,
  language: string,
  basePath = ''
): { missing: string[]; extra: string[] } {
  const missing: string[] = [];
  const extra: string[] = [];
  const masterKeys = Object.keys(master);
  const translationKeys = Object.keys(translation);

  for (const key of masterKeys) {
    const fullKeyPath = basePath ? `${basePath}.${key}` : key;
    if (!(key in translation)) {
      missing.push(fullKeyPath);
    } else if (typeof master[key] === 'object' && typeof translation[key] === 'object') {
      const nestedResult = compareKeys(
        master[key] as TranslationObject,
        translation[key] as TranslationObject,
        language,
        fullKeyPath
      );
      missing.push(...nestedResult.missing);
      extra.push(...nestedResult.extra);
    }
  }

  for (const key of translationKeys) {
    const fullKeyPath = basePath ? `${basePath}.${key}` : key;
    if (!(key in master)) {
      extra.push(fullKeyPath);
    }
  }

  return { missing, extra };
}

async function validateTranslations(): Promise<void> {
  console.log('Validating translations...');

  const translations = await loadLanguageFiles();
  const master = translations[MASTER_FILE.replace('.json', '')];
  const errors: string[] = [];

  if (!master) {
    throw new Error(`Master file (${MASTER_FILE}) not found in /locales directory`);
  }

  for (const [language, translation] of Object.entries(translations)) {
    if (language === MASTER_FILE.replace('.json', '')) continue;

    const { missing, extra } = compareKeys(master, translation, language);
    if (missing.length > 0) {
      errors.push(`Missing keys in ${language}: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      errors.push(`Extra keys in ${language}: ${extra.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    console.error('\nValidation Errors:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  } else {
    console.log('All translations are valid!');
  }
}

validateTranslations().catch(err => {
  console.error('An error occurred during validation:', err);
  process.exit(1);
});
