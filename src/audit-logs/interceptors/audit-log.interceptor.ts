import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Audit Log Interceptor
 * 
 * Automatically logs POST, PATCH, and DELETE requests to the audit_logs table.
 * Captures: user, action, entity table, entity ID, IP, user-agent.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // Only log write operations
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const user = request.user;
        const ip = this.extractIp(request);
        const userAgent = request.headers['user-agent'] || null;
        const path = request.route?.path || request.url;
        const entityTable = this.extractEntityTable(path);
        const action = this.mapMethodToAction(method);

        // Get entity ID from params if available
        const entityId = request.params?.id || null;

        return next.handle().pipe(
            tap({
                next: async (responseData) => {
                    // Extract entity ID from response for CREATE operations
                    let logEntityId = entityId;
                    if (method === 'POST' && responseData?.id) {
                        logEntityId = responseData.id;
                    }

                    // Skip logging for audit-logs endpoint itself to prevent recursion
                    if (entityTable === 'audit-logs') {
                        return;
                    }

                    try {
                        await this.prisma.auditLog.create({
                            data: {
                                userId: user?.id || null,
                                action: action,
                                entityTable: entityTable,
                                entityId: logEntityId,
                                meta: this.sanitizeRequestBody(request.body) || undefined,
                                ip: ip,
                                userAgent: userAgent,
                            },
                        });
                    } catch (error) {
                        // Log error but don't fail the request
                        console.error('Failed to create audit log:', error);
                    }
                },
            }),
        );
    }

    private mapMethodToAction(method: string): string {
        const actionMap: Record<string, string> = {
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };
        return actionMap[method] || method;
    }

    private extractEntityTable(path: string): string {
        // Remove leading slash and query params
        const cleanPath = path.split('?')[0].replace(/^\//, '');
        // Get the first segment (e.g., "users" from "/users/:id")
        const segments = cleanPath.split('/');
        return segments[0] || 'unknown';
    }

    private extractIp(request: any): string | null {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || request.connection?.remoteAddress || null;
    }

    private sanitizeRequestBody(body: any): Record<string, any> | null {
        if (!body || typeof body !== 'object') {
            return null;
        }

        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'accessToken', 'refreshToken'];
        const sanitized = { ...body };

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }
}
