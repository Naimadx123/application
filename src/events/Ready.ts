import { Event } from '~/structures/Event.ts';
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

    logger.info(`Commands (${client.commands.size}) have been registered!`);
    for (const category of client.categories.keys()) {
      logger.info(`  📁 ${category}`);
      const commandsInCategory = client.categories.get(category);
      if (commandsInCategory) {
        for (const commandName of commandsInCategory) {
          logger.info(`  ${commandsInCategory.indexOf(commandName) === commandsInCategory.length - 1 ? '└──' : '├──'} ${commandName}`);
        }
      }
    }

    logger.info('Client has started up successfully!');
    logger.info(`Application is in ${client.guilds.cache.size} server(s)`);
  }
}
