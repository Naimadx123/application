import { ActivityType, GatewayIntentBits, Partials } from 'discord.js';

import { Client } from '~/structures';

export const client = new Client({
  intents: Object.values(GatewayIntentBits).map(bit => bit) as GatewayIntentBits[],
  partials: Object.values(Partials).map(bit => bit) as Partials[],
  allowedMentions: {
    repliedUser: false,
  },
  presence: {
    activities: [
      {
        name: 'github.com/meteor-discord',
        type: ActivityType.Custom,
      },
    ],
  },
});

(async (): Promise<void> => await client.init())();
