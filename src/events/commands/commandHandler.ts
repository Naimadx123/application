import {type ChatInputCommandInteraction, codeBlock} from 'discord.js';
import { client } from '~/index';
import { type Locale } from '~/lib/I18n';
import { logger } from '~/lib/logger';
import { Embed } from '~/structures/Embed';


export default
async function commandHandler(interaction: ChatInputCommandInteraction, locale: String): Promise<void>
{

  const command = client.commands.get(interaction.commandName);
  if (!command)
  {
    logger.warn(`Command ${interaction.commandName} not found!`);
    return;
  }

  const translate = (key: string, vars?: Record<string, string>) =>
    client.i18n.translate(locale as Locale, key, vars);

  if (command.isDbRequired && !client.dbConnected)
  {
    const errorEmbed = new Embed()
      .setDefaults(interaction.user)
      .setDescription(translate('common.databaseConnectionError'));

    await interaction.reply({ embeds: [errorEmbed] }).catch(() => null);
    return;
  }

  await command.run(interaction, translate)
    .catch(async (error: unknown) =>
    {

      const errorMessage = error instanceof Error ? error.message : String(error);
      const timestamp = Math.floor(Date.now() / 1000);

      const errorEmbed = new Embed()
        .setDefaults(interaction.user)
        .setDescription(
          translate('common.executionError',
            {
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

      await interaction.reply({ embeds: [errorEmbed] })
        .catch(() => null);

      throw error;
  });
}
