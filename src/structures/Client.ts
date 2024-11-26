import { Collection, Client as DiscordClient, type ClientOptions } from 'discord.js';
import path from 'path';
import 'reflect-metadata';
import { logger } from '~/lib/logger';
import { getFiles, isClass } from '~/lib/utils';
import type { Command } from '~/structures/Command';
import type { Event } from './Event';
import { Cobalt } from '~/lib/Cobalt';
import { I18n } from '~/lib/I18n';
import { client } from '~/index';
import type { DatabaseA } from '~/database/DatabaseA';
import { DatabaseTypes } from '~/database/DatabaseTypes.ts';
import DatabaseManager from '~/database/DatabaseManager.ts';

export class Client<Ready extends boolean = true> extends DiscordClient<Ready> {
  public readonly i18n = new I18n();
  public readonly cobalt = new Cobalt();
  public readonly commands = new Collection<string, Command>();
  public readonly categories = new Collection<string, string[]>();
  public dbConnected = false;
  public database!: DatabaseA;

  public constructor(options: ClientOptions) {
    super(options);
    (async () => {
      await this.initDb();
    })();
  }

  private async initDb(): Promise<void> {
    try {
      const type = process.env.DATABASE_URL?.startsWith('postgresql') ? DatabaseTypes.POSTGRES : DatabaseTypes.SQLITE;
      const dbPath = process.env.DATABASE_URL || './database.db';
      const dbManager = new DatabaseManager(type, dbPath, logger);
      this.database = await dbManager.getInstance();
      this.dbConnected = true;
      logger.info('Database initialized successfully.');
    } catch (error) {
      logger.error('Failed to initialize the database:', error);
      process.exit(1);
    }
  }

  private async registerItems<T>(
    dir: string,
    extension: string,
    recursive: boolean,
    handler: (item: T, files: string) => void
  ): Promise<void> {
    const files = await getFiles(dir, extension, recursive);
    await Promise.all(
      files.map(async file => {
        const module = await import(file);
        const ItemClass = module.default || module;
        if (isClass(ItemClass)) {
          const item: T = new ItemClass();
          handler(item, file);
        }
      })
    );
  }

  private async registerEvents(): Promise<void> {
    await this.registerItems<Event>(path.join(__dirname, '..', 'events'), '.ts', true, event => {
      const handler = (...args: Parameters<Event['run']>) => event.run(...args);
      event.once ? this.once(event.name, handler) : this.on(event.name, handler);
    });
    logger.info(`Events have been registered!`);
  }

  private async registerCommands(): Promise<void> {
    await this.registerItems<Command>(path.join(__dirname, '..', 'commands'), '.ts', true, (command, file) => {
      this.commands.set(command.data.name, command);
      const relativePath = path.relative(path.join(__dirname, '..', 'commands'), file);
      const pathSegments = relativePath.split(path.sep);

      if (!this.categories.has(pathSegments[0])) this.categories.set(pathSegments[0], []);
      const commandsInCategory = this.categories.get(pathSegments[0]);
      if (commandsInCategory) commandsInCategory.push(command.data.name);
    });
    client.application?.commands.set(client.commands.map(command => command.data));
    logger.info(`Commands (${client.commands.size}) have been registered!`);
  }

  public async init(): Promise<void> {
    try {
      await Promise.all([this.registerEvents(), this.registerCommands(), this.i18n.init(), this.initDb()]);
      await this.login();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}
