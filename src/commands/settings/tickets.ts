import {
  ApplicationIntegrationType,
  ChannelType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { Command } from '~/structures';
import type { I18nFunction } from '~/lib/i18n';

export default class Locale extends Command {
  public constructor() {
    super(
      new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setName('tickets')
        .setNameLocalizations({
          pl: 'zgłoszenia',
          'es-ES': 'soporte',
        })
        .setDescription('Set-up ticketing system.')
        .setDescriptionLocalizations({
          pl: 'Skonfiguruj system zgłoszeń.',
          'es-ES': 'Configurar sistema de soporte.',
        })
        .addSubcommand(subcommand =>
          subcommand
            .setName('create')
            .setNameLocalizations({
              pl: 'utwórz',
              'es-ES': 'crear',
            })
            .setDescription('Create a new ticket configuration.')
            .setDescriptionLocalizations({
              pl: 'Utwórz nową konfigurację zgłoszeń.',
              'es-ES': 'Crear una nueva configuración de soporte.',
            })
            .addStringOption(option =>
              option
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the new ticket configuration.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa nowej konfiguracji zgłoszeń.',
                  'es-ES': 'El nombre de la nueva configuración de soporte.',
                })
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('delete')
            .setNameLocalizations({
              pl: 'usuń',
              'es-ES': 'eliminar',
            })
            .setDescription('Delete an existing ticket panel.')
            .setDescriptionLocalizations({
              pl: 'Usuń istniejący panel zgłoszeń.',
              'es-ES': 'Eliminar un panel de soporte existente.',
            })
            .addStringOption(option =>
              option
                .setAutocomplete(true)
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the ticket panel.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa panelu zgłoszeń.',
                  'es-ES': 'El nombre del panel de soporte.',
                })
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('category')
            .setNameLocalizations({
              pl: 'kategoria',
              'es-ES': 'categoría',
            })
            .setDescription('Set a category for the ticketing system.')
            .setDescriptionLocalizations({
              pl: 'Ustaw kategorię dla systemu zgłoszeń.',
              'es-ES': 'Establecer una categoría para el sistema de soporte.',
            })
            .addStringOption(option =>
              option
                .setAutocomplete(true)
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the ticket panel.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa panelu zgłoszeń.',
                  'es-ES': 'El nombre del panel de soporte.',
                })
            )
            .addChannelOption(option =>
              option
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildCategory)
                .setName('category')
                .setNameLocalizations({
                  pl: 'kategoria',
                  'es-ES': 'categoría',
                })
                .setDescription('Select the category channel for the ticketing system.')
                .setDescriptionLocalizations({
                  pl: 'Wybierz kanał kategorii dla systemu zgłoszeń.',
                  'es-ES': 'Selecciona el canal de categoría para el sistema de soporte.',
                })
            )
        )
        .addSubcommandGroup(group =>
          group
            .setName('staff')
            .setNameLocalizations({
              pl: 'personel',
              'es-ES': 'personal',
            })
            .setDescription('Manage staff roles for the ticketing system.')
            .setDescriptionLocalizations({
              pl: 'Zarządzaj rolami personelu dla systemu zgłoszeń.',
              'es-ES': 'Gestionar roles de personal para el sistema de soporte.',
            })
            .addSubcommand(subcommand =>
              subcommand
                .setName('add')
                .setNameLocalizations({
                  pl: 'dodaj',
                  'es-ES': 'agregar',
                })
                .setDescription('Add a staff role.')
                .setDescriptionLocalizations({
                  pl: 'Dodaj rolę personelu.',
                  'es-ES': 'Agregar un rol de personal.',
                })
                .addStringOption(option =>
                  option
                    .setAutocomplete(true)
                    .setRequired(true)
                    .setName('name')
                    .setNameLocalizations({
                      pl: 'nazwa',
                      'es-ES': 'nombre',
                    })
                    .setDescription('The name of the ticket panel.')
                    .setDescriptionLocalizations({
                      pl: 'Nazwa panelu zgłoszeń.',
                      'es-ES': 'El nombre del panel de soporte.',
                    })
                )
                .addRoleOption(option =>
                  option
                    .setRequired(true)
                    .setName('role')
                    .setNameLocalizations({
                      pl: 'rola',
                      'es-ES': 'rol',
                    })
                    .setDescription('The staff role to add.')
                    .setDescriptionLocalizations({
                      pl: 'Rola personelu do dodania.',
                      'es-ES': 'El rol de personal a agregar.',
                    })
                )
            )
            .addSubcommand(subcommand =>
              subcommand
                .setName('remove')
                .setNameLocalizations({
                  pl: 'usuń',
                  'es-ES': 'eliminar',
                })
                .setDescription('Remove a staff role.')
                .setDescriptionLocalizations({
                  pl: 'Usuń rolę personelu.',
                  'es-ES': 'Eliminar un rol de personal.',
                })
                .addStringOption(option =>
                  option
                    .setAutocomplete(true)
                    .setRequired(true)
                    .setName('name')
                    .setNameLocalizations({
                      pl: 'nazwa',
                      'es-ES': 'nombre',
                    })
                    .setDescription('The name of the ticket panel.')
                    .setDescriptionLocalizations({
                      pl: 'Nazwa panelu zgłoszeń.',
                      'es-ES': 'El nombre del panel de soporte.',
                    })
                )
                .addRoleOption(option =>
                  option
                    .setRequired(true)
                    .setName('role')
                    .setNameLocalizations({
                      pl: 'rola',
                      'es-ES': 'rol',
                    })
                    .setDescription('The staff role to remove.')
                    .setDescriptionLocalizations({
                      pl: 'Rola personelu do usunięcia.',
                      'es-ES': 'El rol de personal a eliminar.',
                    })
                )
            )
            .addSubcommand(subcommand =>
              subcommand
                .setName('list')
                .setNameLocalizations({
                  pl: 'lista',
                  'es-ES': 'listar',
                })
                .setDescription('List all staff roles.')
                .setDescriptionLocalizations({
                  pl: 'Wyświetl wszystkie role personelu.',
                  'es-ES': 'Listar todos los roles de personal.',
                })
                .addStringOption(option =>
                  option
                    .setAutocomplete(true)
                    .setRequired(true)
                    .setName('name')
                    .setNameLocalizations({
                      pl: 'nazwa',
                      'es-ES': 'nombre',
                    })
                    .setDescription('The name of the ticket panel.')
                    .setDescriptionLocalizations({
                      pl: 'Nazwa panelu zgłoszeń.',
                      'es-ES': 'El nombre del panel de soporte.',
                    })
                )
            )
            .addSubcommand(subcommand =>
              subcommand
                .setName('clear')
                .setNameLocalizations({
                  pl: 'wyczyść',
                  'es-ES': 'borrar',
                })
                .setDescription('Clear all staff roles.')
                .setDescriptionLocalizations({
                  pl: 'Wyczyść wszystkie role personelu.',
                  'es-ES': 'Borrar todos los roles de personal.',
                })
                .addStringOption(option =>
                  option
                    .setAutocomplete(true)
                    .setRequired(true)
                    .setName('name')
                    .setNameLocalizations({
                      pl: 'nazwa',
                      'es-ES': 'nombre',
                    })
                    .setDescription('The name of the ticket panel.')
                    .setDescriptionLocalizations({
                      pl: 'Nazwa panelu zgłoszeń.',
                      'es-ES': 'El nombre del panel de soporte.',
                    })
                )
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('threads')
            .setNameLocalizations({
              pl: 'wątki',
              'es-ES': 'hilos',
            })
            .setDescription('Enable or disable threads for the ticketing system.')
            .setDescriptionLocalizations({
              pl: 'Włącz lub wyłącz wątki w systemie zgłoszeń.',
              'es-ES': 'Habilitar o deshabilitar hilos para el sistema de soporte.',
            })
            .addStringOption(option =>
              option
                .setAutocomplete(true)
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the ticket panel.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa panelu zgłoszeń.',
                  'es-ES': 'El nombre del panel de soporte.',
                })
            )
            .addBooleanOption(option =>
              option
                .setRequired(true)
                .setName('enabled')
                .setNameLocalizations({
                  pl: 'włączone',
                  'es-ES': 'habilitado',
                })
                .setDescription('Whether to enable or disable threads.')
                .setDescriptionLocalizations({
                  pl: 'Czy włączyć, czy wyłączyć wątki.',
                  'es-ES': 'Si habilitar o deshabilitar hilos.',
                })
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('naming')
            .setNameLocalizations({
              pl: 'nazewnictwo',
              'es-ES': 'nomenclatura',
            })
            .setDescription('Change the strategy of naming ticket channels.')
            .setDescriptionLocalizations({
              pl: 'Zmień strategię nazewnictwa kanałów zgłoszeń.',
              'es-ES': 'Cambiar la estrategia de nomenclatura de los canales de tickets.',
            })
            .addStringOption(option =>
              option
                .setAutocomplete(true)
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the ticket panel.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa panelu zgłoszeń.',
                  'es-ES': 'El nombre del panel de soporte.',
                })
            )
            .addStringOption(option =>
              option
                .setRequired(true)
                .setName('strategy')
                .setNameLocalizations({
                  pl: 'strategia',
                  'es-ES': 'estrategia',
                })
                .setDescription('The new strategy of naming ticket channels.')
                .setDescriptionLocalizations({
                  pl: 'Nowa strategia nazewnictwa kanałów zgłoszeń.',
                  'es-ES': 'La nueva estrategia de nomenclatura de los canales de tickets.',
                })
                .addChoices(
                  {
                    name: 'Username',
                    value: 'username',
                    name_localizations: {
                      pl: 'Nazwa użytkownika',
                      'es-419': 'Nombre de usuario',
                    },
                  },
                  {
                    name: 'User ID',
                    value: 'userid',
                    name_localizations: {
                      pl: 'ID użytkownika',
                      'es-419': 'ID de usuario',
                    },
                  },
                  {
                    name: 'Unique (Set of random characters)',
                    value: 'unique',
                    name_localizations: {
                      pl: 'Unikalny (Losowe znaki)',
                      'es-419': 'Unico (Caracteres aleatorios)',
                    },
                  }
                )
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('claiming')
            .setNameLocalizations({
              pl: 'przejmowanie',
              'es-ES': 'reclamación',
            })
            .setDescription('Change the claiming behavior of tickets.')
            .setDescriptionLocalizations({
              pl: 'Zmień sposób przejmowania zgłoszeń.',
              'es-ES': 'Cambiar el comportamiento de reclamación de tickets.',
            })
            .addStringOption(option =>
              option
                .setAutocomplete(true)
                .setRequired(true)
                .setName('name')
                .setNameLocalizations({
                  pl: 'nazwa',
                  'es-ES': 'nombre',
                })
                .setDescription('The name of the ticket panel.')
                .setDescriptionLocalizations({
                  pl: 'Nazwa panelu zgłoszeń.',
                  'es-ES': 'El nombre del panel de soporte.',
                })
            )
            .addBooleanOption(option =>
              option
                .setRequired(true)
                .setName('status')
                .setNameLocalizations({
                  pl: 'status',
                  'es-ES': 'estado',
                })
                .setDescription('Enable or disable the ability to claim tickets.')
                .setDescriptionLocalizations({
                  pl: 'Włącz lub wyłącz możliwość przejmowania zgłoszeń.',
                  'es-ES': 'Habilitar o deshabilitar la capacidad de reclamar tickets.',
                })
            )
        )
    );
  }

  public async run(interaction: ChatInputCommandInteraction, __: I18nFunction): Promise<unknown> {
    return undefined;
  }
}
