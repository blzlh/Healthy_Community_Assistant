import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DbService implements OnApplicationShutdown {
  public readonly db: NodePgDatabase<typeof schema>;
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const host = this.configService.get<string>('DB_HOST') ?? 'localhost';
    const port = Number(this.configService.get<string>('DB_PORT') ?? 5432);
    const user = this.configService.get<string>('DB_USER') ?? 'postgres';
    const password =
      this.configService.get<string>('DB_PASSWORD') ?? 'postgres';
    const database = this.configService.get<string>('DB_NAME') ?? 'postgres';
    const sslEnabled = this.configService.get<string>('DB_SSL') === 'true';

    const connectionString =
      databaseUrl ??
      `postgresql://${user}:${password}@${host}:${port}/${database}`;

    this.pool = new Pool({
      connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
