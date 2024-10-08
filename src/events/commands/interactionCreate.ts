import { Event } from '~/structures';
import type { Interaction } from 'discord.js';
import { client } from '~/index';
import i18n, { type Locale } from '~/lib/i18n';
import logger from '~/lib/logger';

export default class InteractionCreate extends Event {
  public constructor() {
    super({
      name: 'interactionCreate',
      once: false,
    });
  }

  public async run(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`Command ${interaction.commandName} not found!`);
      return;
    }

    let locale = 'en';

    if (interaction.guild) {
      const guild = await client.prisma.guild
        .findUnique({
          where: {
            id: interaction.guildId!,
          },
          select: {
            locale: true,
          },
        })
        .catch(err => {
          console.log(err);
          return undefined;
        });

      if (guild) locale = guild.locale.toLowerCase();
    }

    await command.run(interaction, key => i18n.__(locale as Locale, key));
  }
}
