import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, Embed } from '~/structures';

import type { I18nFunction } from '~/lib/i18n';

export default class Info extends Command {
  public constructor() {
    super(
      new SlashCommandBuilder()
        .setName('info')
        .setDescription('Info command')
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

  public async run(interaction: ChatInputCommandInteraction, __: I18nFunction): Promise<void> {
    switch (interaction.options.getSubcommand()) {
      case 'user': {
        const user = await interaction.client.users.fetch(interaction.options.getUser('user') || interaction.user);
        if (!user) return;

        const embed = new Embed()
          .setDefaults(user)
          .setTitle(__('commands.info.user.title'))
          .setURL(`https://discord.com/users/${user.id}`)
          .setThumbnail(user.displayAvatarURL())
          .setImage((await user.fetch()).bannerURL({ size: 4096 }) || null)
          .setFields([
            {
              name: 'ID',
              value: user.id,
            },
            {
              name: __('commands.info.user.fields.general'),
              value: `${__('commands.info.user.fields.username')}: ${user.username}\n${__('commands.info.user.fields.createdAt')}: ${'<t:' + Math.floor(user.createdTimestamp / 1000) + ':R>' || 'N/A'}
                  `,
            },
          ]);

        const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
        if (member) {
          embed.addFields([
            {
              name: __('commands.info.user.fields.member'),
              value: `${__('commands.info.user.fields.joinedAt')}: <t:${Math.floor(member.joinedTimestamp! / 1000)}:R>\n${__('commands.info.user.fields.roles')}: ${member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(r => `<@&${r.id}>`)
                .slice(0, 4)
                .join(
                  ', '
                )}${member.roles.cache.size > 4 ? ` (+${member.roles.cache.size - 4})` : ''}\n${__('commands.info.user.fields.nickname')}: ${member.nickname || 'N/A'}`,
            },
          ]);
        }

        interaction.reply({ embeds: [embed] });

        break;
      }
    }
  }
}
