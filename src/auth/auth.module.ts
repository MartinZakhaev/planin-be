import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

/**
 * Auth Module
 * 
 * This module provides Swagger documentation for Better Auth endpoints.
 * Actual authentication is handled by Better Auth via toNodeHandler in main.ts.
 */
@Module({
    controllers: [AuthController],
})
export class LocalAuthModule { }
