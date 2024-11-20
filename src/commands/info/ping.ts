import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';

import { Command } from '~/structures/command';
import { Embed } from '~/structures/embed';
import type { I18nFunction } from '~/lib/i18n';

export default class Ping extends Command {
  public constructor() {
    super(
      new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setName('ping')
        .setDescription('Check the latency of our services.')
        .setDescriptionLocalizations({
          pl: 'Sprawdź opóźnienie naszych serwisów.',
          'es-ES': 'Verifica la latencia de nuestros servicios.',
        })
    );
  }

  public async run(interaction: ChatInputCommandInteraction, $: I18nFunction): Promise<void> {
    const embed = new Embed()
      .setDefaults(interaction.user)
      .setDescription(':ping_pong: ' + $('commands.ping.success'))
      .addFields([
        {
          name: $('commands.ping.fields.websocket'),
          value: `${interaction.client.ws.ping}ms`,
          inline: true,
        },
        {
          name: $('commands.ping.fields.database'),
          value: `0ms`,
          inline: true,
        },
        {
          name: $('commands.ping.fields.api'),
          value: `0ms`,
          inline: true,
        },
      ]);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel($('commands.ping.buttons.reportIssues'))
        .setURL('https://discord.gg/92uqkS7Zyt'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel($('commands.ping.buttons.servicesStatus'))
        .setURL('https://meteors.cc/status')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
