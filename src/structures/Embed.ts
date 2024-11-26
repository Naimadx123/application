import { EmbedBuilder, User } from 'discord.js';

export class Embed extends EmbedBuilder {
  constructor() {
    super();
  }

  setDefaults(author?: User) {
    this.setColor(0xe3223b);

    if (author) {
      this.setAuthor({
        name: author.displayName === author.username ? author.username : `${author.username} (${author.displayName})`,
        iconURL: author.displayAvatarURL(),
        url: `https://discord.com/users/${author.id}`,
      });
    }

    return this;
  }
}
