import { Event } from '~/structures/event';
import { client } from '..';
import { logger } from '~/lib/logger';

export default class Ready extends Event {
  public constructor() {
    super({
      name: 'ready',
      once: true,
    });
  }

  public async run(): Promise<void> {
    logger.info('Client has started up successfully!');
    logger.info(`  ├── Guilds: ${client.guilds.cache.size}`);
    logger.info(`  └── Commands: ${client.commands.size}`);

    client.application?.commands.set(client.commands.map(command => command.data));
  }
}
