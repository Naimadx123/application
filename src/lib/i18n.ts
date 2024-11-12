import fs from 'fs';
import path from 'path';
import logger from './logger';

export type I18nFunction = (key: string) => string;

export type Locale = 'en' | 'pl' | 'es';
export type Translations = Record<string, string>;

class I18n {
  private readonly supportedLanguages: Locale[] = ['en', 'pl', 'es'];
  private locales: Record<Locale, Translations>;

  constructor() {
    this.locales = {} as Record<Locale, Translations>;
    this.loadLocales();
  }

  /**
   * Loads translation files for all supported languages.
   * Reads JSON files from the 'locales' directory and parses them into the locales object.
   */
  private loadLocales() {
    this.supportedLanguages.forEach(lang => {
      const filePath = path.join(__dirname, '../..', 'locales', `${lang}.json`);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        this.locales[lang] = JSON.parse(fileContent);
        logger.info(`Loaded locale '${lang}'`);
      } catch (error) {
        logger.error(`Failed to load locale '${lang}':`, error);
        this.locales[lang] = {};
      }
    });
  }

  /**
   * Translates a given key into the specified language.
   * Falls back to English ('en') if the key is not found in the requested language.
   * If the key is still not found, returns the key itself as a fallback.
   *
   * @param lang - The target locale for translation.
   * @param key - The translation key, which can be a nested path separated by dots.
   * @returns The translated string or the key itself if translation is not found.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public __(lang: Locale, key: string): string {
    logger.debug(`Translating ${key} in ${lang}`);

    const keys = key.split('.');

    /**
     * Helper function to recursively retrieve the translation value from the translations object.
     *
     * @param localeTranslations - The translations object for a specific locale.
     * @param keys - An array of keys representing the path to the desired translation.
     * @returns The translated string if found, otherwise undefined.
     */
    const getTranslation = (locale: Translations | string | undefined): string | Translations | undefined => {
      let result: Translations | string | undefined = locale;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return undefined;
        }
      }
      return result;
    };

    // Try the requested language, then fall back to 'en'
    const translation = getTranslation(this.locales[lang]) ?? getTranslation(this.locales.en);

    // Return the translation if it's a string, otherwise return the key as fallback
    return typeof translation === 'string' ? translation : key;
  }
}

export default new I18n();
