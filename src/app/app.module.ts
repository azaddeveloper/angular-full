import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { LoginService } from './login/login.service';
import { TaskService } from './services/task.service';
import { TodoComponent } from './todo/todo.component';
import { HeaderComponent } from './header/header.component'
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProjectComponent } from './projects/project.component';
import { routing } from './routes/app.routing';
import { TitleDecode } from './pipes/titledecode.pipe'
import { LoginModule } from './login/login.module';
import { KanbanComponent } from './kanban/kanban.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule, Tooltip } from "ngx-tooltip";
import { TimeConvert } from './pipes/timeconvter.pipe';
import { DragulaModule } from 'ng2-dragula';
import { BsModalModule } from 'ng2-bs3-modal';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatAutocompleteModule, MatSelectModule } from '@angular/material';
import { TaskpopupComponent } from './taskpopup/taskpopup.component';
import { InlineEditorModule } from '@qontu/ngx-inline-editor';
import { GetInitial } from './pipes/getInitial.pipe';
import { CompressString } from './pipes/compressstring.pipe';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { ChangeFormat } from './pipes/changeformat.pipe';
import { ContextMenuModule } from 'ngx-contextmenu';
import { BsDropdownModule, BsDatepickerModule } from 'ngx-bootstrap';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { EditProject } from './projects/editproject.component';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { CapitalizeFirstPipe } from './pipes/capitalizeFirstletter.pipe'; //pipe for capital first letter of the string
import { CustomerComponent } from './customer/customer.component';
import { OpencustomerComponent } from './customer/opencustomer.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimesheetComponent } from './timesheet/timesheet.component'; // timesheet module component
import { OpenTimesheetComponent } from './timesheet/opentimesheet.component'; // edit timeesheet component
import { UsersettingComponent } from './usersetting/usersetting.component'; // user setting component
import { ColorPickerModule } from 'ngx-color-picker';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { SettingsComponent } from './settings/settings.component';
import { ReportComponent } from './report/report.component'; // report module
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeamdashboardComponent } from './teamdashboard/teamdashboard.component';
import { ChartsModule } from 'ng2-charts';
import { BootstrapSwitchModule } from 'angular2-bootstrap-switch';
import { CapacitydashboardComponent } from './capacitydashboard/capacitydashboard.component';
import { NgxGaugeModule } from 'ngx-gauge'; // gauge meter graph for capacity dashboard
import { PricingComponent } from './pricing/pricing.component';
import {SearchComponent} from './search/search.component';
import { CalendarModule } from 'angular-calendar';
@NgModule({
  declarations: [
    AppComponent,
    TodoComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    TitleDecode,
    KanbanComponent,
    TimeConvert,
    TaskpopupComponent,
    GetInitial,
    CompressString,
    ChangeFormat,
    ProjectComponent,
    EditProject,
    CapitalizeFirstPipe,
    CustomerComponent,
    OpencustomerComponent,
    TimesheetComponent,
    UsersettingComponent,
    OpenTimesheetComponent,
    SettingsComponent,
    ReportComponent,
    DashboardComponent,
    TeamdashboardComponent,
    CapacitydashboardComponent,
    PricingComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    LoginModule,
    ReactiveFormsModule,
    HttpClientModule,
    TooltipModule,
    DragulaModule,
    BsModalModule,
    MatDatepickerModule,
    MatNativeDateModule,
    InlineEditorModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    DropzoneModule,
    MatFormFieldModule, MatInputModule,
    MatIconModule,
    ContextMenuModule.forRoot(),
    BsDropdownModule.forRoot(),
    SortableModule.forRoot(),
    MatDialogModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      confirmText: '<i class="glyphicon glyphicon-ok"></i> Yes',
      cancelText: '<i class="glyphicon glyphicon-remove"></i> No'
    }),
    MatAutocompleteModule,
    MatSelectModule,
    BsDatepickerModule.forRoot(),
    NgxPaginationModule,
    ColorPickerModule,
    UiSwitchModule,
    ChartsModule,
    NgxChartsModule,
    BootstrapSwitchModule.forRoot(),
    NgxGaugeModule,
    CalendarModule.forRoot()
  ],
  entryComponents: [TaskpopupComponent],
  providers: [LoginService, TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }
