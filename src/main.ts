import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Better Auth 1.4.7+ route handler workaround
  // This ensures requests to /api/auth/* are routed correctly
  const express = app.getHttpAdapter().getInstance();
  express.all(/^\/api\/auth\/.*$/, toNodeHandler(auth));

  const config = new DocumentBuilder()
    .setTitle('Planin API Documentation')
    .setDescription('Planin API for construction project management')
    .setVersion('1.0')
    .addTag('Planin')
    .addTag('Authentication')
    .addBearerAuth()
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'better-auth.session_token',
      description: 'Better Auth session cookie',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
