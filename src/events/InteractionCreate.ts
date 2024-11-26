import { type Interaction } from 'discord.js';
import { client } from '~/index';
import { Event } from '~/structures/Event';
import commandHandler from '~/events/commands/commandHandler';

export default class InteractionCreate extends Event {
  public constructor() {
    super({
      name: 'interactionCreate',
      once: false,
    });
  }

  public async run(interaction: Interaction): Promise<void> {
    let locale = 'en';

    if (client.dbConnected && interaction.guild) {
      const result = await client.database.get('Locales', { guildID: interaction.guildId });

      if (result && result?.length > 0) {
        const guild = result[0];
        if (guild && typeof guild.locale === 'string') locale = guild.locale?.toLowerCase();
      }
    }

    /**
     * Handling commands
     */
    if (interaction.isChatInputCommand()) {
      await commandHandler(interaction, locale);
    }
  }
}
