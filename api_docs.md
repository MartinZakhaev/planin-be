# Planin API Documentation

> **Base URL:** `http://localhost:3001`  
> **Authentication:** Session cookie (`better-auth.session_token`) set after sign-in

---

## Table of Contents

1. [Authentication](#authentication)
2. [Units](#units)
3. [Users](#users)
4. [Organizations](#organizations)
5. [Organization Members](#organization-members)
6. [Plans](#plans)
7. [Subscriptions](#subscriptions)
8. [Work Division Catalogs](#work-division-catalogs)
9. [Task Catalogs](#task-catalogs)
10. [Item Catalogs](#item-catalogs)
11. [Projects](#projects)
12. [Project Collaborators](#project-collaborators)
13. [Project Divisions](#project-divisions)
14. [Project Tasks](#project-tasks)
15. [Task Line Items](#task-line-items)
16. [RAB Summaries](#rab-summaries)
17. [RAB Exports](#rab-exports)
18. [Files](#files)
19. [Audit Logs](#audit-logs)

---

## Authentication

All endpoints except authentication are protected. Include the session cookie in requests.

### Sign Up

```http
POST /api/auth/sign-up/email
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "session_token_here",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2025-12-25T00:00:00.000Z"
  }
}
```

### Sign In

```http
POST /api/auth/sign-in/email
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!"
}
```

**Response:** Same as Sign Up (includes session cookie)

### Sign Out

```http
POST /api/auth/sign-out
```

### Get Session

```http
GET /api/auth/get-session
```

**Response:**
```json
{
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": "2025-12-31T00:00:00.000Z"
  },
  "user": { /* user object */ }
}
```

### Change Password

```http
POST /api/auth/change-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldP@ssw0rd!",
  "newPassword": "NewP@ssw0rd!"
}
```

### Forget Password

```http
POST /api/auth/forget-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "redirectTo": "https://myapp.com/reset-password"
}
```

### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewP@ssw0rd!"
}
```

---

## Units

Base path: `/units`

### Create Unit

```http
POST /units
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "M2",
  "name": "Square Meter"
}
```

### Get All Units

```http
GET /units
```

### Get Unit by ID

```http
GET /units/:id
```

### Update Unit

```http
PATCH /units/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "M2",
  "name": "Square Meters"
}
```

### Delete Unit

```http
DELETE /units/:id
```

---

## Users

Base path: `/users`

### Create User (Admin)

```http
POST /users
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "profileFileId": "uuid-optional",
  "role": "user"
}
```

**Note:** For user registration with password, use `/api/auth/sign-up/email` instead.

### Get All Users

```http
GET /users
```

### Get User by ID

```http
GET /users/:id
```

### Update User

```http
PATCH /users/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "role": "staff"
}
```

### Delete User

```http
DELETE /users/:id
```

---

## Organizations

Base path: `/organizations`

### Create Organization

```http
POST /organizations
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Company",
  "code": "MYCO",
  "ownerUserId": "user-uuid"
}
```

### Get All Organizations

```http
GET /organizations
```

### Get Organization by ID

```http
GET /organizations/:id
```

### Update Organization

```http
PATCH /organizations/:id
Content-Type: application/json
```

### Delete Organization

```http
DELETE /organizations/:id
```

---

## Organization Members

Base path: `/organization-members`

### Add Member

```http
POST /organization-members
Content-Type: application/json
```

**Request Body:**
```json
{
  "organizationId": "org-uuid",
  "userId": "user-uuid",
  "role": "MEMBER"
}
```

### Get All Members

```http
GET /organization-members
```

### Get Member by ID

```http
GET /organization-members/:id
```

### Update Member Role

```http
PATCH /organization-members/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### Remove Member

```http
DELETE /organization-members/:id
```

---

## Plans

Base path: `/plans`

### Create Plan

```http
POST /plans
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "PRO",
  "name": "Professional",
  "priceCents": 99000,
  "currency": "IDR",
  "interval": "monthly",
  "maxProjects": 50
}
```

### Get All Plans

```http
GET /plans
```

### Get Plan by ID

```http
GET /plans/:id
```

### Update Plan

```http
PATCH /plans/:id
```

### Delete Plan

```http
DELETE /plans/:id
```

---

## Subscriptions

Base path: `/subscriptions`

### Create Subscription

```http
POST /subscriptions
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "planId": "plan-uuid",
  "status": "ACTIVE"
}
```

### Get All Subscriptions

```http
GET /subscriptions
```

### Get Subscription by ID

```http
GET /subscriptions/:id
```

### Update Subscription

```http
PATCH /subscriptions/:id
```

### Delete Subscription

```http
DELETE /subscriptions/:id
```

---

## Work Division Catalogs

Base path: `/work-division-catalogs`

### Create Division

```http
POST /work-division-catalogs
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "DIV001",
  "name": "Foundation Work",
  "description": "All foundation related tasks"
}
```

### Get All Divisions

```http
GET /work-division-catalogs
```

### Get Division by ID

```http
GET /work-division-catalogs/:id
```

### Update Division

```http
PATCH /work-division-catalogs/:id
```

### Delete Division

```http
DELETE /work-division-catalogs/:id
```

---

## Task Catalogs

Base path: `/task-catalogs`

### Create Task Catalog

```http
POST /task-catalogs
Content-Type: application/json
```

**Request Body:**
```json
{
  "divisionId": "division-uuid",
  "code": "TASK001",
  "name": "Concrete Pouring",
  "description": "Concrete pouring for foundation"
}
```

### Get All Task Catalogs

```http
GET /task-catalogs
```

### Get Task Catalog by ID

```http
GET /task-catalogs/:id
```

### Update Task Catalog

```http
PATCH /task-catalogs/:id
```

### Delete Task Catalog

```http
DELETE /task-catalogs/:id
```

---

## Item Catalogs

Base path: `/item-catalogs`

### Create Item Catalog

```http
POST /item-catalogs
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "MATERIAL",
  "code": "MAT001",
  "name": "Cement",
  "unitId": "unit-uuid",
  "defaultPrice": 75000,
  "description": "Portland cement"
}
```

**Type enum:** `MATERIAL`, `MANPOWER`, `TOOLS`

### Get All Item Catalogs

```http
GET /item-catalogs
```

### Get Item Catalog by ID

```http
GET /item-catalogs/:id
```

### Update Item Catalog

```http
PATCH /item-catalogs/:id
```

### Delete Item Catalog

```http
DELETE /item-catalogs/:id
```

---

## Projects

Base path: `/projects`

### Create Project

```http
POST /projects
Content-Type: application/json
```

**Request Body:**
```json
{
  "organizationId": "org-uuid",
  "ownerUserId": "user-uuid",
  "name": "Office Building Construction",
  "code": "OBC2025",
  "description": "5-story office building project",
  "location": "Jakarta, Indonesia",
  "taxRatePercent": 11.00,
  "currency": "IDR"
}
```

### Get All Projects

```http
GET /projects
```

### Get Project by ID

```http
GET /projects/:id
```

### Update Project

```http
PATCH /projects/:id
```

### Delete Project

```http
DELETE /projects/:id
```

---

## Project Collaborators

Base path: `/project-collaborators`

### Add Collaborator

```http
POST /project-collaborators
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "userId": "user-uuid",
  "role": "EDITOR"
}
```

**Role options:** `VIEWER`, `EDITOR`, `ADMIN`

### Get All Collaborators

```http
GET /project-collaborators
```

### Get Collaborator by ID

```http
GET /project-collaborators/:id
```

### Update Collaborator Role

```http
PATCH /project-collaborators/:id
```

### Remove Collaborator

```http
DELETE /project-collaborators/:id
```

---

## Project Divisions

Base path: `/project-divisions`

### Add Division to Project

```http
POST /project-divisions
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "divisionId": "division-catalog-uuid",
  "displayName": "Foundation Work",
  "sortOrder": 1
}
```

### Get All Project Divisions

```http
GET /project-divisions
```

### Get Project Division by ID

```http
GET /project-divisions/:id
```

### Update Project Division

```http
PATCH /project-divisions/:id
```

### Delete Project Division

```http
DELETE /project-divisions/:id
```

---

## Project Tasks

Base path: `/project-tasks`

### Add Task to Project

```http
POST /project-tasks
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "projectDivisionId": "project-division-uuid",
  "taskCatalogId": "task-catalog-uuid",
  "displayName": "Concrete Pouring",
  "sortOrder": 1,
  "notes": "Use high-strength concrete"
}
```

### Get All Project Tasks

```http
GET /project-tasks
```

### Get Project Task by ID

```http
GET /project-tasks/:id
```

### Update Project Task

```http
PATCH /project-tasks/:id
```

### Delete Project Task

```http
DELETE /project-tasks/:id
```

---

## Task Line Items

Base path: `/task-line-items`

### Create Line Item

```http
POST /task-line-items
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "projectTaskId": "project-task-uuid",
  "itemCatalogId": "item-catalog-uuid",
  "unitId": "unit-uuid",
  "description": "Portland cement for foundation",
  "quantity": 100,
  "unitPrice": 75000,
  "taxable": true
}
```

### Get All Line Items

```http
GET /task-line-items
```

### Get Line Item by ID

```http
GET /task-line-items/:id
```

### Update Line Item

```http
PATCH /task-line-items/:id
```

### Delete Line Item

```http
DELETE /task-line-items/:id
```

---

## RAB Summaries

Base path: `/rab-summaries`

### Create RAB Summary

```http
POST /rab-summaries
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "createdBy": "user-uuid",
  "version": 1,
  "notes": "Initial estimate"
}
```

### Get All RAB Summaries

```http
GET /rab-summaries
```

### Get RAB Summary by ID

```http
GET /rab-summaries/:id
```

### Update RAB Summary

```http
PATCH /rab-summaries/:id
```

### Delete RAB Summary

```http
DELETE /rab-summaries/:id
```

---

## RAB Exports

Base path: `/rab-exports`

### Create RAB Export

```http
POST /rab-exports
Content-Type: application/json
```

**Request Body:**
```json
{
  "rabSummaryId": "rab-summary-uuid",
  "projectId": "project-uuid",
  "pdfFileId": "file-uuid",
  "xlsxFileId": "file-uuid"
}
```

### Get All RAB Exports

```http
GET /rab-exports
```

### Get RAB Export by ID

```http
GET /rab-exports/:id
```

### Delete RAB Export

```http
DELETE /rab-exports/:id
```

---

## Files

Base path: `/files`

### Upload File Metadata

```http
POST /files
Content-Type: application/json
```

**Request Body:**
```json
{
  "ownerUserId": "user-uuid",
  "projectId": "project-uuid",
  "kind": "DOCUMENT",
  "filename": "report.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 1024000,
  "storagePath": "/uploads/reports/report.pdf"
}
```

**Kind enum:** `DOCUMENT`, `IMAGE`, `SPREADSHEET`, `OTHER`

### Get All Files

```http
GET /files
```

### Get File by ID

```http
GET /files/:id
```

### Update File

```http
PATCH /files/:id
```

### Delete File

```http
DELETE /files/:id
```

---

## Audit Logs

Base path: `/audit-logs`

### Create Audit Log

```http
POST /audit-logs
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "action": "CREATE_PROJECT",
  "entityTable": "projects",
  "entityId": "entity-uuid",
  "meta": { "key": "value" }
}
```

### Get All Audit Logs

```http
GET /audit-logs
```

### Get Audit Log by ID

```http
GET /audit-logs/:id
```

---

## Next.js Integration Example

### API Client Setup

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API Error');
  }
  
  return res.json();
}
```

### Auth Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/api/auth/get-session')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await apiClient('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    await apiClient('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
```

### CRUD Hook Example

```typescript
// hooks/useUnits.ts
import useSWR from 'swr';
import { apiClient } from '@/lib/api';

const fetcher = (url: string) => apiClient(url);

export function useUnits() {
  const { data, error, mutate } = useSWR('/units', fetcher);

  const createUnit = async (unit: { code: string; name: string }) => {
    await apiClient('/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    });
    mutate();
  };

  const updateUnit = async (id: string, unit: Partial<{ code: string; name: string }>) => {
    await apiClient(`/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(unit),
    });
    mutate();
  };

  const deleteUnit = async (id: string) => {
    await apiClient(`/units/${id}`, { method: 'DELETE' });
    mutate();
  };

  return {
    units: data || [],
    isLoading: !error && !data,
    isError: error,
    createUnit,
    updateUnit,
    deleteUnit,
  };
}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |
