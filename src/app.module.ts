import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './units/units.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { OrganizationMembersModule } from './organization-members/organization-members.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WorkDivisionCatalogsModule } from './work-division-catalogs/work-division-catalogs.module';
import { TaskCatalogsModule } from './task-catalogs/task-catalogs.module';
import { ItemCatalogsModule } from './item-catalogs/item-catalogs.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectCollaboratorsModule } from './project-collaborators/project-collaborators.module';
import { ProjectDivisionsModule } from './project-divisions/project-divisions.module';
import { ProjectTasksModule } from './project-tasks/project-tasks.module';
import { TaskLineItemsModule } from './task-line-items/task-line-items.module';
import { RabSummariesModule } from './rab-summaries/rab-summaries.module';
import { RabExportsModule } from './rab-exports/rab-exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UnitsModule,
    UsersModule,
    OrganizationsModule,
    OrganizationMembersModule,
    PlansModule,
    SubscriptionsModule,
    WorkDivisionCatalogsModule,
    TaskCatalogsModule,
    ItemCatalogsModule,
    ProjectsModule,
    ProjectCollaboratorsModule,
    ProjectDivisionsModule,
    ProjectTasksModule,
    TaskLineItemsModule,
    RabSummariesModule,
    RabExportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
