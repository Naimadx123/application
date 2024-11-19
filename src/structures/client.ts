import { Collection, Client as DiscordClient, type ClientOptions } from 'discord.js';

import path from 'path';

import { PrismaClient } from '@prisma/client';
import { logger } from '~/lib/logger';
import { getFiles } from '~/lib/utils';
import type { Command } from '~/structures/command';
import type { Event } from './event';

export class Client<Ready extends boolean = true> extends DiscordClient<Ready> {
  public readonly prisma = new PrismaClient();
  public readonly commands = new Collection<string, Command>();

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

  public async registerEvents(): Promise<void> {
    await this.registerItems<Event>(path.join(__dirname, '..', 'events'), '.ts', event => {
      const handler = (...args: Parameters<Event['run']>) => event.run(...args);
      event.once ? this.once(event.name, handler) : this.on(event.name, handler);
    });
    logger.info('Events have been registered!');
  }

  public async registerCommands(): Promise<void> {
    await this.registerItems<Command>(path.join(__dirname, '..', 'commands'), '.ts', command => {
      this.commands.set(command.data.name, command);
    });
    this.on('ready', () => {
      this.application?.commands.set(this.commands.map(command => command.data));
      logger.info('Commands have been registered!');
    });
  }

  public async init(): Promise<void> {
    try {
      await Promise.all([this.registerEvents(), this.registerCommands()]);
      await this.login();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}
