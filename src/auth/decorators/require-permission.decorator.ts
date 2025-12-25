import { SetMetadata } from '@nestjs/common';
import { statement } from '../permissions';

export type Resource = keyof typeof statement;
export type Action<R extends Resource> = (typeof statement)[R][number];

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
    resource: Resource;
    action: string; // Type safety is hard here without generic class decorator, easing it to string for now or specific type if possible
}

export const RequirePermission = (resource: Resource, action: string) => SetMetadata(PERMISSIONS_KEY, { resource, action });
