import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase, open } from 'sqlite';
import type { Logger } from 'pino';
import { DatabaseA } from '~/database/DatabaseA.ts';

type Row = Record<string, string | number | boolean | null>;

export default class SQLite extends DatabaseA {
  declare db: SQLiteDatabase<sqlite3.Database, sqlite3.Statement> | undefined;
  declare logger: Logger;

  constructor(file: string, logger: Logger) {
    super(logger);
    this.create(file).then();
  }

  private async create(file: string): Promise<void> {
    this.db = await open<sqlite3.Database, sqlite3.Statement>({
      filename: file,
      driver: sqlite3.Database,
    });
  }

  async insert(table: string, data: Partial<Row>): Promise<void> {
    if (!this.db) throw new Error('Not connected to database');
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders});`;
    await this.db.run(query, values);
  }

  async get(table: string, where?: Partial<Row>): Promise<Row[]> {
    if (!this.db) throw new Error('Not connected to database');
    const conditions = where
      ? Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ')
      : '';
    const query = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''};`;
    const values = where ? Object.values(where) : [];
    return this.db.all(query, values);
  }

  async update(table: string, data: Partial<Row>, where: Partial<Row>): Promise<void> {
    if (!this.db) throw new Error('Not connected to database');
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause};`;
    const values = [...Object.values(data), ...Object.values(where)];
    await this.db.run(query, values);
  }

  async delete(table: string, where: Partial<Row>): Promise<void> {
    if (!this.db) throw new Error('Not connected to database');
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${whereClause};`;
    const values = Object.values(where);
    await this.db.run(query, values);
  }
}
