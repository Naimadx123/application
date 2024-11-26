import { Event } from '~/structures/event';
import { client } from '~/index';
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
    logger.info(`Application is in ${client.guilds.cache.size} server${client.guilds.cache.size === 1 ? '' : 's'}`);
  }
}
