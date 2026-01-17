import { SetMetadata } from '@nestjs/common';

export const CHECK_ACCESS_KEY = 'check_access';

/**
 * Supported resource types for access checking
 */
export type AccessResourceType = 'project' | 'organization';

export interface AccessCheckConfig {
    resourceType: AccessResourceType;
    /** Optional: specify which param contains the resource ID (default: 'id') */
    idParam?: string;
}

/**
 * Decorator to mark routes that require resource ownership/access check.
 * Uses the :id route param by default to identify the resource.
 * 
 * @example
 * @CheckAccess('project')
 * @Get(':id')
 * findOne(@Param('id') id: string) { ... }
 * 
 * @example
 * @CheckAccess('project', 'projectId')
 * @Get(':projectId/tasks')
 * getTasks(@Param('projectId') projectId: string) { ... }
 */
export const CheckAccess = (resourceType: AccessResourceType, idParam: string = 'id') =>
    SetMetadata(CHECK_ACCESS_KEY, { resourceType, idParam } as AccessCheckConfig);
