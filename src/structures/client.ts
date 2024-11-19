import { Collection, Client as DiscordClient, type ClientOptions } from 'discord.js';

import fs from 'fs/promises';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { logger } from '~/lib/logger';
import type { Command } from '~/structures/command';
import type { Event } from './event';

export class Client<Ready extends boolean = true> extends DiscordClient<Ready> {
  public readonly prisma = new PrismaClient();
  public readonly commands = new Collection<string, Command>();

  public constructor(options: ClientOptions) {
    super(options);
  }

  public async registerEvents(): Promise<void> {
    logger.info('Registering events...');

    const eventsDir = path.join(__dirname, '..', 'events');

    const eventFiles = await this.getFiles(eventsDir, '.ts');

    for (const file of eventFiles) {
      const eventModule = await import(file);
      const event: Event = new eventModule.default();

      if (event) {
        if (event.once) {
          this.once(event.name, (...args) => event.run(...args));
        } else {
          this.on(event.name, (...args) => event.run(...args));
        }
      }
    }

    logger.info('Events have been registered!');
  }

  public async registerCommands(): Promise<void> {
    logger.info('Registering commands...');

    const commandsDir = path.join(__dirname, '..', 'commands');

    const commandFiles = await this.getFiles(commandsDir, '.ts');

    for (const file of commandFiles) {
      const commandModule = await import(file);
      const command: Command = new commandModule.default();

      if (command) {
        this.commands.set(command.data.name, command);
      }
    }

    this.on('ready', () => {
      this.application?.commands.set(this.commands.map(command => command.data));
      logger.info('Commands have been registered!');
    });
  }

  private async getFiles(dir: string, extension: string): Promise<string[]> {
    let files: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        files = files.concat(await this.getFiles(itemPath, extension));
      } else if (item.isFile() && item.name.endsWith(extension)) {
        files.push(itemPath);
      }
    }

    return files;
  }

  public async init(): Promise<void> {
    await this.registerEvents();
    await this.registerCommands();

    await this.login().catch(error => {
      console.error(error);
      process.exit(1);
    });
  }
}
