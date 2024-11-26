import type { Logger } from 'pino';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Pool } from 'pg';

type Row = Record<string, string | number | boolean | null>;
type Constructor = new (...args: unknown[]) => unknown;
interface ColumnOptions {
  primary?: boolean;
  autoincrement?: boolean;
}

export abstract class DatabaseA {
  public logger: Logger;
  public db: Database<sqlite3.Database, sqlite3.Statement> | undefined | Pool;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  abstract get(table: string, where?: Partial<Row>): Promise<Row[]>;
  abstract insert(table: string, data: Partial<Row>): Promise<void>;
  abstract update(table: string, data: Partial<Row>, where: Partial<Row>): Promise<void>;
  abstract delete(table: string, where: Partial<Row>): Promise<void>;

  async createTableFromClass(target: Constructor) {
    if (!this.db) return;

    const tableName = Reflect.getMetadata('tableName', target);
    const columns: { name: string | symbol; options?: ColumnOptions }[] = Reflect.getMetadata(
      'columns',
      target.prototype
    );

    if (!tableName || !columns) {
      throw new Error('Missing metadata for table or columns');
    }

    const columnDefinitions = columns.map(column => {
      const columnType = Reflect.getMetadata('design:type', target.prototype, column.name);
      const sqlType = this.mapJsTypeToSqlType(columnType.name);
      const options = column.options || {};
      const clauses = [
        `"${String(column.name)}" ${sqlType}`,
        options.primary ? 'PRIMARY KEY' : '',
        options.autoincrement && this.db instanceof Pool ? 'GENERATED ALWAYS AS IDENTITY' : '',
        options.autoincrement && !(this.db instanceof Pool) ? 'AUTOINCREMENT' : '',
      ].filter(Boolean);
      return clauses.join(' ');
    });

    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')});`;
    if (this.db instanceof Pool) {
      const client = await this.db.connect();
      try {
        await client.query(createTableSQL);
      } finally {
        client.release();
      }
    } else if (this.db) {
      await this.db.run(createTableSQL);
    }
  }

  private mapJsTypeToSqlType(jsType: string): string {
    switch (jsType) {
      case 'Number':
        return 'INTEGER';
      case 'String':
        return 'TEXT';
      case 'Boolean':
        return 'BOOLEAN';
      default:
        throw new Error(`Unsupported type: ${jsType}`);
    }
  }

  protected async initializeDatabase(file: string): Promise<void> {
    this.db = await open<sqlite3.Database, sqlite3.Statement>({
      filename: file,
      driver: sqlite3.Database,
    });
  }
}
