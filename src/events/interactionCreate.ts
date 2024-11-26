import { codeBlock, type Interaction } from 'discord.js';
import { client } from '~/index';
import { type Locale } from '~/lib/i18n';
import { logger } from '~/lib/logger';
import { Event } from '~/structures/event';
import { Embed } from '~/structures/embed';

export default class InteractionCreate extends Event {
  public constructor() {
    super({
      name: 'interactionCreate',
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

    const translate = (key: string, vars?: Record<string, string>) =>
      client.i18n.translate(locale as Locale, key, vars);

    if (command.isDbRequired && !client.dbConnected) {
      const errorEmbed = new Embed()
        .setDefaults(interaction.user)
        .setDescription(translate('common.databaseConnectionError'));

      await interaction.reply({ embeds: [errorEmbed] }).catch(() => null);
      return;
    }

    await command.run(interaction, translate).catch(async (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const timestamp = Math.floor(Date.now() / 1000);

      const errorEmbed = new Embed()
        .setDefaults(interaction.user)
        .setDescription(
          translate('common.executionError', {
            command: command.data.name,
            issueUrl: 'https://github.com/meteor-discord/application/issues/new',
          })
        )
        .addFields([
          {
            name: translate('common.timestamp'),
            value: `<t:${timestamp}:R> (${timestamp})`,
          },
          {
            name: translate('common.error'),
            value: codeBlock('bf', errorMessage),
          },
        ]);

      await interaction.reply({ embeds: [errorEmbed] }).catch(() => null);

      throw error;
    });
  }
}
