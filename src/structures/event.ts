import type { ClientEvents } from 'discord.js';

export abstract class Event {
  public readonly name: string;
  public readonly once: boolean;

  public constructor({ name, once }: { name: keyof ClientEvents; once: boolean }) {
    this.name = name;
    this.once = once;
  }

  public abstract run(...args: unknown[]): unknown;
}
