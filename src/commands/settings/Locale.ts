import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  Collection,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { client } from '~/index';
import { type Locale as LocaleType, type I18nFunction } from '~/lib/I18n';
import { Command } from '~/structures/Command.ts';
import { Embed } from '~/structures/Embed.ts';

export default class Locale extends Command {
  public constructor() {
    super(
      new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setName('locale')
        .setNameLocalizations({
          pl: 'język',
          'es-ES': 'idioma',
        })
        .setDescription('Change the locale of the bot.')
        .setDescriptionLocalizations({
          pl: 'Zmień język bota.',
          'es-ES': 'Cambia el idioma del bot.',
        })
        .addStringOption(option =>
          option
            .setName('locale')
            .setNameLocalizations({
              pl: 'język',
              'es-ES': 'idioma',
            })
            .setDescription('The new locale of the bot.')
            .setDescriptionLocalizations({
              pl: 'Nowy język bota.',
              'es-ES': 'El nuevo idioma del bot.',
            })
            .setRequired(true)
            .addChoices(
              { name: 'English', value: 'EN' },
              { name: 'Polski', value: 'PL' },
              { name: 'Español', value: 'ES' }
            )
        )
    );
    this.requiresDb();
  }

  /**
   * The cooldown for changing the locale per server.
   * Cooldown: 1 minute
   */
  private readonly cooldowns = new Collection<string, number>();

  public async run(interaction: ChatInputCommandInteraction, $: I18nFunction): Promise<unknown> {
    if (this.cooldowns.has(interaction.guildId!)) {
      if (Date.now() - this.cooldowns.get(interaction.guildId!)! < 60 * 1000) {
        const embed = new Embed().setDefaults(interaction.user).setDescription($('modules.locale.cooldown'));

        return await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }

      this.cooldowns.delete(interaction.guildId!);
    }
    const locale = interaction.options.getString('locale', true);
    const result = await client.database.get('Locales', { guildID: interaction.guildId });

    if (result.length > 0 && locale === 'EN') {
      await client.database.delete('Locales', {
        guildID: interaction.guildId,
      });
    } else if (result.length < 1) {
      await client.database.insert('Locales', {
        guildID: interaction.guildId,
        locale,
      });
    } else if (result.length > 0) {
      await client.database.update(
        'Locales',
        {
          locale,
        },
        {
          guildID: interaction.guildId,
        }
      );
    }
    // this.cooldowns.set(interaction.guildId!, Date.now());

    if (!result) {
      const embed = new Embed().setDefaults(interaction.user).setDescription($('modules.locale.error'));

      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const embed = new Embed()
      .setDefaults(interaction.user)
      .setDescription(
        client.i18n.translate(
          interaction.options.getString('locale', true).toLowerCase() as LocaleType,
          'modules.locale.success'
        )
      );

    await interaction.reply({
      embeds: [embed],
    });
  }
}
