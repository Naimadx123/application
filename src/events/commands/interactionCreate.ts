import type { Interaction } from 'discord.js';
import { client } from '~/index';
import { type Locale } from '~/lib/i18n';
import { logger } from '~/lib/logger';
import { Event } from '~/structures/event';

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

    await command.run(interaction, (key: string, vars?: Record<string, string>) =>
      client.i18n.translate(locale as Locale, key, vars)
    );
  }
}
