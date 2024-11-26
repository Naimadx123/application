import { DatabaseTypes } from '~/database/DatabaseTypes.ts';
import type { Logger } from 'pino';
import dotenv from 'dotenv';
import type { DatabaseA } from '~/database/DatabaseA';
import { getFiles } from '~/lib/utils.ts';
import path from 'path';
import 'reflect-metadata';

dotenv.config();

export default class DatabaseManager {
  private dbInstance: DatabaseA | undefined;
  private logger: Logger;
  private isInitialized: Promise<void>;

  constructor(type: DatabaseTypes, path: string, logger: Logger) {
    this.logger = logger;
    this.isInitialized = this.initializeDatabase(type, path)
      .then(async db => {
        this.dbInstance = db;
        await this.createTables();
      })
      .catch(err => {
        this.logger.error('Failed to initialize the database:', err);
        throw err;
      });
  }

  private async initializeDatabase(type: DatabaseTypes, path: string): Promise<DatabaseA> {
    let dbClass;
    switch (type) {
      case DatabaseTypes.SQLITE: {
        const module = await import('./impl/SQLite');
        dbClass = module.default || module;
        return new dbClass(path, this.logger);
      }
      case DatabaseTypes.POSTGRES: {
        const url = new URL(path);
        const pgConfig = {
          user: url.username,
          password: url.password,
          host: url.hostname,
          port: url.port ? parseInt(url.port, 10) : 5432,
          database: url.pathname.slice(1),
          ssl: {
            require: true,
          },
        };
        const module = await import('./impl/Postgresql');
        dbClass = module.default || module;
        return new dbClass(pgConfig, this.logger);
      }
      default:
        throw new Error('Unsupported database type');
    }
  }

  async getInstance(): Promise<DatabaseA> {
    await this.isInitialized;
    if (!this.dbInstance) {
      throw new Error('Database not initialized yet');
    }
    return this.dbInstance;
  }

  async createTables() {
    const files = await getFiles(path.join(__dirname, '.', 'tables'), '.ts');

    files.map(async file => {
      const module = await import(file);
      const ItemClass = module.default || module;
      await this.dbInstance?.createTableFromClass(ItemClass);
    });
  }
}
