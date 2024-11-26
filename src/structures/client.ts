import { Collection, Client as DiscordClient, type ClientOptions } from 'discord.js';

import path from 'path';

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '~/lib/logger';
import { getFiles } from '~/lib/utils';
import type { Command } from '~/structures/command';
import type { Event } from './event';
import { Cobalt } from '~/lib/cobalt';
import { I18n } from '~/lib/i18n';

export class Client<Ready extends boolean = true> extends DiscordClient<Ready> {
  public readonly prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
  public readonly i18n = new I18n();
  public readonly cobalt = new Cobalt();
  public readonly commands = new Collection<string, Command>();
  public dbConnected = false;

  public constructor(options: ClientOptions) {
    super(options);
  }

  private async registerItems<T>(dir: string, extension: string, handler: (item: T) => void): Promise<void> {
    const files = await getFiles(dir, extension);
    await Promise.all(
      files.map(async file => {
        const module = await import(file);
        const item: T = new module.default();
        handler(item);
      })
    );
  }

  private async registerEvents(): Promise<void> {
    await this.registerItems<Event>(path.join(__dirname, '..', 'events'), '.ts', event => {
      const handler = (...args: Parameters<Event['run']>) => event.run(...args);
      event.once ? this.once(event.name, handler) : this.on(event.name, handler);
    });
    logger.info('Events have been registered!');
  }

  private async registerCommands(): Promise<void> {
    await this.registerItems<Command>(path.join(__dirname, '..', 'commands'), '.ts', command => {
      this.commands.set(command.data.name, command);
    });
  }

  private async checkPrismaConnection(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.dbConnected = true;
      logger.info('Connected to Database');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientInitializationError) {
        logger.error(`Error connecting to Database (${e.errorCode}): ${e.message}`);
      } else {
        logger.error('Unexpected database connection error:', e);
      }
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async init(): Promise<void> {
    try {
      await Promise.all([
        this.checkPrismaConnection(),
        this.registerEvents(),
        this.registerCommands(),
        this.i18n.init(),
      ]);
      await this.login();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}
