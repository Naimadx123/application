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

export default class Info extends Command {
  public constructor() {
    super(
      new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setName('info')
        .setDescription('Info command')
        .addSubcommand(subcommand =>
          subcommand
            .setName('server')
            .setDescription('Check informations about the server.')
            .setDescriptionLocalizations({
              pl: 'Sprawdź informacje o serwerze.',
              'es-ES': 'Revisa la información del servidor.',
            })
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('user')
            .setDescription('Check informations about a user.')
            .setDescriptionLocalizations({
              pl: 'Sprawdź informacje o użytkowniku.',
              'es-ES': 'Revisa la información de un usuario.',
            })
            .addUserOption(option =>
              option.setName('user').setDescription('The user you want to check').setDescriptionLocalizations({
                pl: 'Użytkownik, którego chcesz sprawdzić.',
                'es-ES': 'El usuario que quieres comprobar.',
              })
            )
        )
    );
  }

  public async run(interaction: ChatInputCommandInteraction, $: I18nFunction): Promise<void> {
    switch (interaction.options.getSubcommand()) {
      case 'user': {
        const user = await interaction.client.users.fetch(interaction.options.getUser('user') || interaction.user);
        if (!user) return;

        const embed = new Embed()
          .setDefaults(user)
          .setTitle($('commands.info.user.title'))
          .setURL(`https://discord.com/users/${user.id}`)
          .setThumbnail(user.displayAvatarURL())
          .setImage((await user.fetch()).bannerURL({ size: 4096 }) || null)
          .setFields([
            {
              name: 'ID',
              value: user.id,
            },
            {
              name: $('commands.info.user.fields.general'),
              value: `${$('commands.info.user.fields.username')}: ${user.username}\n${$('commands.info.user.fields.createdAt')}: ${'<t:' + Math.floor(user.createdTimestamp / 1000) + ':R>' || 'N/a'}
                  `,
            },
          ]);

        const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
        if (member) {
          const roles = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`);

          const rolesString =
            roles.length > 0
              ? roles.slice(0, 4).join(', ') + (roles.length > 4 ? ` (+${roles.length - 4})` : '')
              : 'N/a';

          embed.addFields([
            {
              name: $('commands.info.user.fields.member'),
              value: [
                `${$('commands.info.user.fields.joinedAt')}: <t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
                `${$('commands.info.user.fields.roles')}: ${rolesString}`,
                `${$('commands.info.user.fields.nickname')}: ${member.nickname || 'N/a'}`,
              ].join('\n'),
            },
          ]);
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel($('commands.info.user.buttons.avatar'))
            .setURL(user.displayAvatarURL()),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel($('commands.info.user.buttons.user'))
            .setURL(`https://discord.com/users/${user.id}`)
        );

        interaction.reply({ embeds: [embed], components: [row] });

        break;
      }
      case 'server': {
        if (!interaction.guild) {
          await interaction.reply({
            embeds: [new Embed().setDefaults(interaction.user).setDescription($('commands.info.server.noGuild'))],
          });
          return;
        }

        const embed = new Embed()
          .setDefaults(interaction.user)
          .setTitle(interaction.guild.name)
          .setThumbnail(interaction.guild.iconURL() || null)
          .setFields([
            {
              name: `ID`,
              value: interaction.guild.id,
            },
            {
              name: $('commands.info.server.fields.general'),
              value: [
                `${$('commands.info.server.fields.createdAt')}: <t:${Math.floor(interaction.guild.createdTimestamp! / 1000)}:R>`,
                `${$('commands.info.server.fields.owner')}: <@${interaction.guild.ownerId}>`,
              ].join('\n'),
            },
            {
              name: $('commands.info.server.fields.statistics'),
              value: [
                `${$('commands.info.server.fields.boosts')}: ${interaction.guild.premiumSubscriptionCount}`,
                `${$('commands.info.server.fields.members')}: ${interaction.guild.memberCount}`,
                `${$('commands.info.server.fields.verificationLevel')}: ${interaction.guild.verificationLevel}`,
              ].join('\n'),
            },
          ]);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(`${$('commands.info.server.buttons.logo')}`)
            .setURL(interaction.guild.iconURL() ?? 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        break;
      }
    }
  }
}
