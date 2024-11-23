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
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName('info')
        .setDescription('...')
        .addSubcommand(subcommand =>
          subcommand
            .setName('user')
            .setDescription('Get detailed information about a user.')
            .setDescriptionLocalizations({
              pl: 'Uzyskaj szczegółowe informacje o użytkowniku.',
              'es-ES': 'Obtén información detallada sobre un usuario.',
            })
            .addUserOption(option =>
              option
                .setName('user')
                .setNameLocalizations({
                  pl: 'użytkownik',
                  'es-ES': 'usuario',
                })
                .setDescription('Select the user to retrieve information about.')
                .setDescriptionLocalizations({
                  pl: 'Wybierz użytkownika, aby uzyskać informacje.',
                  'es-ES': 'Selecciona al usuario para obtener información.',
                })
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('server')
            .setNameLocalizations({
              pl: 'serwer',
              'es-ES': 'servidor',
            })
            .setDescription('Get detailed information about the server.')
            .setDescriptionLocalizations({
              pl: 'Uzyskaj szczegółowe informacje o serwerze.',
              'es-ES': 'Obtén información detallada sobre el servidor.',
            })
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('role')
            .setNameLocalizations({
              pl: 'rola',
              'es-ES': 'rol',
            })
            .setDescription('Get detailed information about a role.')
            .setDescriptionLocalizations({
              pl: 'Uzyskaj szczegółowe informacje o roli.',
              'es-ES': 'Obtén información detallada sobre un rol.',
            })
            .addRoleOption(option =>
              option
                .setName('role')
                .setNameLocalizations({
                  pl: 'rola',
                  'es-ES': 'rol',
                })
                .setDescription('Select the role to retrieve information about.')
                .setDescriptionLocalizations({
                  pl: 'Wybierz rolę, aby uzyskać informacje.',
                  'es-ES': 'Selecciona el rol para obtener información.',
                })
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('application')
            .setNameLocalizations({
              pl: 'aplikacja',
              'es-ES': 'aplicación',
            })
            .setDescription('Get detailed information about an application.')
            .setDescriptionLocalizations({
              pl: 'Uzyskaj szczegółowe informacje o aplikacji.',
              'es-ES': 'Obtén información detallada sobre una aplicación.',
            })
            .addStringOption(option =>
              option
                .setName('application')
                .setNameLocalizations({
                  pl: 'aplikacja',
                  'es-ES': 'aplicación',
                })
                .setDescription('Identifier of the application.')
                .setDescriptionLocalizations({
                  pl: 'Identyfikator aplikacji.',
                  'es-ES': 'Identificador de la aplicación.',
                })
            )
        )
    );
  }

  public async run(interaction: ChatInputCommandInteraction, $: I18nFunction): Promise<void> {
    const getStatusIcon = (status: boolean) =>
      status ? '<:greendot:1267111982117421097>' : '<:reddot:1267111988907999243>';

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
          .setDefaults()
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL() || undefined,
            url: `https://discord.com/guilds/${interaction.guild.id}`,
          })
          .setTitle($('commands.info.server.title'))
          .setThumbnail(interaction.guild.iconURL() || null)
          .setImage(interaction.guild.bannerURL({ size: 4096 }) || null)
          .setFields([
            {
              name: 'ID',
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
            .setLabel($('commands.info.server.buttons.icon'))
            .setURL(interaction.guild.iconURL() || 'https://meteors.cc/')
            .setDisabled(interaction.guild.iconURL() === null)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        break;
      }

      case 'role': {
        const role = interaction.options.getRole('role', true);

        const embed = new Embed()
          .setDefaults(interaction.user)
          .setTitle(role.name)
          .setFields([
            {
              name: 'ID',
              value: role.id,
            },
            {
              name: $('commands.info.role.fields.general'),
              value: [
                `${$('commands.info.role.fields.name')}: ${role.name}`,
                `${$('commands.info.role.fields.position')}: ${role.position}`,
                `${$('commands.info.role.fields.members')}: ${role.members.size}`,
                `${$('commands.info.role.fields.created')}: <t:${Math.floor(role.createdTimestamp / 1000)}:R>`,
              ].join('\n'),
            },
            {
              name: $('commands.info.role.fields.other'),
              value: [
                `${$('commands.info.role.fields.color')}: #${role.color.toString(16).padStart(6, '0')}`,
                `${$('commands.info.role.fields.hoist')}: ${role.hoist ? '<:greendot:1267111982117421097>' : '<:reddot:1267111988907999243>'}`,
                `${$('commands.info.role.fields.mentionable')}: ${role.mentionable ? '<:greendot:1267111982117421097>' : '<:reddot:1267111988907999243>'}`,
              ].join('\n'),
            },
          ]);

        interaction.reply({ embeds: [embed] });

        break;
      }

      case 'application': {
        const applicationId = interaction.options.getString('application') || interaction.client.application.id;
        const data = await fetch(`https://discord.com/api/v10/oauth2/applications/${applicationId}/rpc`).then(res =>
          res.json()
        );

        if (!data) {
          interaction.reply({
            embeds: [new Embed().setDefaults(interaction.user).setDescription($('commands.info.app.noApp'))],
          });
          return;
        }

        const formatField = (label: string, value: boolean) =>
          `${$(`commands.info.app.fields.${label}`)}: ${getStatusIcon(value)}`;

        const embed = new Embed()
          .setDefaults(interaction.user)
          .setThumbnail(`https://cdn.discordapp.com/avatars/${applicationId}/${data.icon}?size=1024`)
          .setTitle(data.name)
          .setFields([
            { name: 'ID', value: applicationId },
            {
              name: $('commands.info.app.fields.general'),
              value: ['verified', 'monetized', 'discoverable', 'bot_public']
                .map(key => formatField(key, data[`is_${key}`] || data[key]))
                .join('\n'),
            },
            {
              name: $('commands.info.app.fields.links'),
              value: [
                `[${$('commands.info.app.fields.invite')}](https://discord.com/api/oauth2/authorize?client_id=${applicationId}&permissions=8&scope=applications.commands)`,
                data.terms_of_service_url && `[${$('commands.info.app.fields.tos')}](${data.terms_of_service_url})`,
                data.privacy_policy_url &&
                  `[${$('commands.info.app.fields.privacy_policy')}](${data.privacy_policy_url})`,
              ].join('\n'),
            },
          ]);

        if (data.tags?.length) {
          embed.addFields([{ name: $('commands.info.app.fields.tags'), value: data.tags.join(', ') }]);
        }

        if (data.description) {
          embed.setDescription(data.description);
        }

        interaction.reply({ embeds: [embed] });

        break;
      }
    }
  }
}
