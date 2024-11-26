import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export abstract class Command {
  public readonly data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

  public isDbRequired = false;

  public constructor(data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder) {
    this.data = data;
  }

  public requiresDb(): Command {
    this.isDbRequired = true;
    return this;
  }

  public abstract run(interaction: ChatInputCommandInteraction, i18n: (key: string) => string): Promise<unknown>;
}
