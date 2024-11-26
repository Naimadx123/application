import { codeBlock, type Interaction } from 'discord.js';
import { client } from '~/index.ts';
import { type Locale } from '~/lib/I18n.ts';
import { logger } from '~/lib/logger.ts';
import { Event } from '~/structures/Event.ts';
import { Embed } from '~/structures/Embed.ts';
import commandHandler from "~/events/commands/commandHandler.ts";

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

    /**
     * Handling commands
     */
    if (interaction.isChatInputCommand()){

      await commandHandler(interaction, locale)
    }

  }
}
