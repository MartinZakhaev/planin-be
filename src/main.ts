import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const express = app.getHttpAdapter().getInstance();

  // CORS configuration - MUST be before Better Auth handler
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Your Next.js frontend URL
    credentials: true, // Required for cookies/session
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  };

  // Apply CORS to all routes including Better Auth
  express.use(cors(corsOptions));

  // Better Auth 1.4.7+ route handler workaround
  // This ensures requests to /api/auth/* are routed correctly
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

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
