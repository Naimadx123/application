import { Table } from '~/decorators/table';
import { Column } from '~/decorators/column';

@Table('Locales')
export default class Locales {
  @Column({ primary: true, autoincrement: true })
  id!: number;

  @Column()
  guildID!: string;

  @Column()
  locale!: string;
}
