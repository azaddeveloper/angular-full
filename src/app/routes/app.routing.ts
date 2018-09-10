import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes, Params } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { TodoComponent } from '../todo/todo.component';
import { KanbanComponent } from '../kanban/kanban.component';
import { ProjectComponent } from '../projects/project.component';
import { EditProject } from '../projects/editproject.component';
import { CustomerComponent } from '../customer/customer.component';
import { OpencustomerComponent } from '../customer/opencustomer.component';
import { TimesheetComponent } from '../timesheet/timesheet.component';
import { OpenTimesheetComponent } from '../timesheet/opentimesheet.component';
import { UsersettingComponent } from '../usersetting/usersetting.component';
import { SettingsComponent } from '../settings/settings.component';
import { ReportComponent } from '../report/report.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TeamdashboardComponent } from '../teamdashboard/teamdashboard.component';
import { CapacitydashboardComponent } from '../capacitydashboard/capacitydashboard.component';
import { PricingComponent } from '../pricing/pricing.component';
import { SearchComponent } from '../search/search.component';
const appRoutes: Routes = [
  { path: '', redirectTo: '/home/login', pathMatch: 'full' },
  { path: 'home/:id', component: LoginComponent },
  { path: 'todo', component: TodoComponent },
  { path: 'kanban', component: KanbanComponent },
  { path: 'projects', component: ProjectComponent },
  { path: 'editproject/:id', component: EditProject },
  { path: 'opencustomer/:id', component: OpencustomerComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'timesheet', component: TimesheetComponent },
  { path: 'opentimesheet/:id', component: OpenTimesheetComponent },
  { path: 'my_settings', component: UsersettingComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'report', component: ReportComponent },
  { path: 'user/dashboard', component: DashboardComponent },
  { path: 'user/teamdashboard', component: TeamdashboardComponent },
  { path: 'user/capacity_dashboard', component: CapacitydashboardComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'search', component: SearchComponent }

];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);