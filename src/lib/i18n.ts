import fs from 'fs/promises';
import { logger } from './logger';
import path from 'path';

export type Locale = 'en' | 'pl' | 'es';
export type TranslationFunction = (key: string, variables?: Record<string, string>) => string;

export type FlatTranslations = Record<string, string>;

export class I18n {
  private readonly translationsByLocale: Record<Locale, FlatTranslations> = { en: {}, pl: {}, es: {} };

  constructor(private readonly availableLocales: Locale[] = ['en', 'pl', 'es']) {}

  public async init(localesPath = path.join(__dirname, '../../locales')): Promise<void> {
    await Promise.all(
      this.availableLocales.map(async locale => {
        try {
          const filePath = path.join(localesPath, `${locale}.json`);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const nestedTranslations = JSON.parse(fileContent);
          this.translationsByLocale[locale] = this.flattenTranslations(nestedTranslations);
        } catch (error) {
          logger.error(`Failed to load locale '${locale}':`, error);
        }
      })
    );
  }

  public translate(locale: Locale, key: string, variables?: Record<string, string>): string {
    const translation = 
      this.translationsByLocale[locale][key] ?? 
      this.translationsByLocale.en[key] ?? 
      key;

    return variables 
      ? translation.replace(/\{(\w+)\}/g, (_, varName) => variables[varName] ?? `{${varName}}`) 
      : translation;
  }

  private flattenTranslations(obj: Record<string, string | Record<string, unknown>>, prefix = ''): FlatTranslations {
    const flattened: FlatTranslations = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        flattened[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, this.flattenTranslations(value as Record<string, string | Record<string, unknown>>, fullKey));
      }
    }

    return flattened;
  }
}
