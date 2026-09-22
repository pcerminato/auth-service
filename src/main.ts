import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
