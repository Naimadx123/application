import { Table } from '~/decorators/table';
import { Column } from '~/decorators/column';

@Table('Logs')
export default class Logs {
  @Column({ primary: true, autoincrement: true })
  id!: number;

  @Column()
  guildID!: string;

  @Column()
  channelID!: string;
}
