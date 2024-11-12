import { GatewayIntentBits, Partials } from 'discord.js';

import logger from '~/lib/logger';
import { Client } from '~/structures';

export const client = new Client({
  intents: Object.values(GatewayIntentBits).map(bit => bit) as GatewayIntentBits[],
  partials: Object.values(Partials).map(bit => bit) as Partials[],
  allowedMentions: {
    repliedUser: false,
  },
});

(async (): Promise<void> => {
  logger.info('Starting application...');
  await client.init();
})();
