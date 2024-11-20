import fs from 'fs/promises';
import { logger } from './logger';
import path from 'path';

export type Locale = 'en' | 'pl' | 'es';
export type I18nFunction = (key: string, vars?: Record<string, string>) => string;

export interface Translations {
  [key: string]: string | Translations;
}

export class I18n {
  private readonly locales: Record<Locale, Translations> = { en: {}, pl: {}, es: {} };

  constructor(private readonly supportedLanguages: Locale[] = ['en', 'pl', 'es']) {}

  public async init(basePath = path.join(__dirname, '../../locales')): Promise<void> {
    await Promise.all(
      this.supportedLanguages.map(async lang => {
        try {
          const filePath = path.join(basePath, `${lang}.json`);
          const fileContent = await fs.readFile(filePath, 'utf8');
          this.locales[lang] = JSON.parse(fileContent);
        } catch (error) {
          logger.error(`Failed to load locale '${lang}':`, error);
        }
      })
    );
  }

  public translate(lang: Locale, key: string, vars?: Record<string, string>): string {
    const translation =
      this.resolveNestedKey(this.locales[lang], key) ?? this.resolveNestedKey(this.locales.en, key) ?? key;

    return vars ? translation.replace(/\{(\w+)\}/g, (_, varName) => vars[varName] ?? `{${varName}}`) : translation;
  }

  private resolveNestedKey(obj: Translations, key: string): string | undefined {
    const parts = key.split('.');
    let value: string | Translations | undefined = obj;

    for (const part of parts) {
      if (typeof value === 'object' && value !== null && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  }
}
