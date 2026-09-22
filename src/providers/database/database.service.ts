import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('Missing database url configuration');
    }

    // 1. Create a native pg connection pool
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // 2. Wrap it inside the Prisma driver adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ database connected');
    } catch (error) {
      console.log('❌ error trying to connect to the database');
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 database disconnected');
  }
}
