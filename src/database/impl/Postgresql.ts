import { Pool } from 'pg';
import type { Logger } from 'pino';
import { DatabaseA } from '~/database/DatabaseA.ts';

type Row = Record<string, string | number | boolean | null>;

export default class Postgresql extends DatabaseA {
  declare db: Pool;

  constructor(config: object, logger: Logger) {
    super(logger);
    this.db = new Pool(config);
  }

  async insert(table: string, data: Partial<Row>): Promise<void> {
    const client = await this.db.connect();
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders});`;
      await client.query(query, values);
    } finally {
      client.release();
    }
  }

  async get(table: string, where?: Partial<Row>): Promise<Row[]> {
    const client = await this.db.connect();
    try {
      const conditions = where
        ? Object.keys(where)
            .map((key, i) => `${key} = $${i + 1}`)
            .join(' AND ')
        : '';
      const query = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''};`;
      const values = where ? Object.values(where) : [];
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async update(table: string, data: Partial<Row>, where: Partial<Row>): Promise<void> {
    const client = await this.db.connect();
    try {
      const setClause = Object.keys(data)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(', ');
      const whereClause = Object.keys(where)
        .map((key, i) => `${key} = $${i + Object.keys(data).length + 1}`)
        .join(' AND ');
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause};`;
      const values = [...Object.values(data), ...Object.values(where)];
      await client.query(query, values);
    } finally {
      client.release();
    }
  }

  async delete(table: string, where: Partial<Row>): Promise<void> {
    const client = await this.db.connect();
    try {
      const whereClause = Object.keys(where)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(' AND ');
      const query = `DELETE FROM ${table} WHERE ${whereClause};`;
      const values = Object.values(where);
      await client.query(query, values);
    } finally {
      client.release();
    }
  }
}
