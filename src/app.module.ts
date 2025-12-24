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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
