import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Reportservice } from './report.service'
import { FormControl, ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { TaskService } from '../services/task.service';
import { ChangeFormat } from '../pipes/changeformat.pipe';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  providers: [Reportservice, ChangeFormat]
})
export class ReportComponent {
  users: any = '';
  divisions: any = '';
  category: any = '';
  projects: any = '';
  departments: any = '';
  sub_category: any = '';
  customers: any = '';
  login_user_id: any = '';
  company_id: any = '';
  reportfilterform: FormGroup;
  view: any = [];
  report_data: any = [];
  showtable: boolean = false;
  today: number = Date.now();
  chk_owner: any = '';
  chk_manager: any = '';
  isprojectuser: number = 0;
  isshowallprojectuser: number = 1;
  customer_module_activation: number = 1;//condition for show customer filter or not
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'buffer' };
  totaltableheader: any = {
    ["Time allocation by category"]: ['Category', 'Sub category', 'User', 'Day', 'Time Allocated (Hrs)', 'Time Spent (Hrs)'],
    ["Last login per user"]: ['User', 'Manager', 'Divisions', 'Departments', 'Last login date / time'],
    ["Login history by user"]: ['User', 'Divisions', 'Departments', 'Last login date / time'],
    ["List of overdue tasks"]: ['Task ID', 'Task Name', 'Allocated to', 'Manager', 'Task Owner', 'Priority', 'Project', 'Category', 'Sub Category', 'Due Date', 'DaysOverdue', 'Estimated Time (Hrs)', 'Time Spent (Hrs)', 'Task Status', 'Customer Name', 'External ID', 'No of interruptions logged for this task'],
    ["Activity by Category"]: ['Category', 'User', 'Start date', 'To date', 'Time allocated (Hrs)', 'Time spent (Hrs)'],
    ["Tasks due this week by user"]: ['Task Id', 'User', 'Due Date', 'Task Name', 'Task Status', 'Estimated Time (Hrs)', 'Time Spent (Hrs)', 'No of interruptions', 'Priority', 'Project', 'Task owner', 'Colour', 'Category', 'Sub Category', 'Customer Name', 'External ID'],
    ["Time allocated by project"]: ['Project', 'Start Date', 'End Date', 'Project Section', 'User', 'Customer Name', 'External ID', 'Time Allocated (Hrs)', 'Time Spent(Hrs)'],
    ["Interruptions by type and by user"]: ['Task Id', 'Task Name', 'Task Category', 'User', 'Customer Name', 'External ID', 'Interruption', 'Date'],
    ["Daily time allocation by user"]: ['Date', 'User', 'Estimated Time (Hrs)', 'Time Spent (Hrs)'],
    ["Daily Time allocation per category and sub category"]: ['Day', 'Category', 'Sub category', 'User', 'Estimated Time (Hrs)', 'Time Spent (Hrs)'],
    ["List of tasks"]: ['Task ID', 'Task Name', 'Task Owner', 'Allocated to', 'User department', 'User division', 'Priority', 'Colour', 'Project', 'Task Status', 'Task Category', 'Task Sub Category', 'Time allocated (Hrs)', 'Actual Time (Hrs)', 'Creation Date', 'Scheduled Date', 'Due Date', 'Customer Name', 'External ID', 'Base Cost', 'Estimated Total Cost', 'Base Charge', 'Estimated Total Revenue', 'No of interruptions logged for this task'],
    ["My tasks allocated to other users"]: ['Task Name', 'Task Status', 'Task Creation Date', 'Due Date', 'Scheduled Date', 'Allocated To'],
    ["Timer work log"]: ['Task Id', 'Task Name', 'Task Status', 'User', 'Project Name', 'Customer Name', 'External ID', 'Interruption', 'Comment', 'Base Cost', 'Estimated Total Cost', 'Base Charge', 'Estimated Total Revenue', 'Date',],
  };

    charts_data = [];
    viewchart: any[] = [1500, 400];
    filtertab1:boolean;
    // options
    roundDomains = true;
    showXAxis = true;
    showYAxis = true;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = 'Dates';
    showYAxisLabel = true;
    yAxisLabel = 'Actual time in hours';
    colorScheme = {
      domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA','#FGG456']
    };
  
  constructor(public loginservice:LoginService,public reportService: Reportservice, private formBuilder: FormBuilder, private changeFormat: ChangeFormat, public toastr: ToastsManager, vcr: ViewContainerRef, private taskservice: TaskService) {
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    /** form for task filter  */
    this.reportfilterform = this.formBuilder.group({
      report_title: ['', Validators.required],
      from_date: new FormControl(''),
      to_date: new FormControl(''),
      user_id: new FormControl(''),
      division_id: new FormControl(''),
      department_id: new FormControl(''),
      category_id: new FormControl(''),
      sub_category_id: new FormControl(''),
      project_id: new FormControl(''),
      customer_id: new FormControl(''),
    });
    this.toastr.setRootViewContainerRef(vcr);
    this.getreportFormfield();
    $("body").css('background',"#fff");
  }
  ngAfterViewInit(){
    if (localStorage.getItem('timer_task_id') != '') {
        var task_id = localStorage.getItem('timer_task_id');
        var title = localStorage.getItem('timer_task_title');
        $("#timer_task_id").val(task_id);
        this.loginservice.update_timer_task(title);
    }
}
  /**
   * function for get filter form data
   */
  getreportFormfield() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id
    };
    this.reportService.getreportFormfield(params).subscribe(data => {
      this.users = data.list.users; //user list
      this.divisions = data.list.divisions; // division list
      this.category = data.list.category; //category list
      this.projects = data.list.user_projects; //project list
      this.departments = data.list.departments; // department list
      this.sub_category = data.list.sub_category; // sub category list 
      this.customers = data.list.customers; //customer list
      this.chk_owner = data.list.chk_owner;  // check owner
      this.chk_manager = data.list.chk_manager; // check mangaer 
      /* if user is login user remove it*/
      this.users.forEach((element, index) => {
        if (element.user_id == this.login_user_id) {
          this.users.splice(index, 1);
        }
      });
    });
  }
  /**
   * function for get filterd data
   */
  run_report() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "filters": this.reportfilterform.value
    };
    this.reportService.run_report(params).subscribe(data => {
      this.charts_data.length = 0;
      this.showtable = true; // condition for show table or not
      if(this.reportfilterform.value.report_title != 'Actual time by category over a period of time'){
        this.filtertab1 = false;
        let index = this.reportfilterform.value.report_title; //take the reoprt name
        this.view = this.totaltableheader[index];  // put in view array for show table header
        this.report_data = data.list; // show table body data
      }else{
        if(data.list !=''){
          this.filtertab1 = true;
          this.charts_data = data.list;
        }else{
          this.filtertab1 = false;
        }
      }
    });
  }
  /**
   * function for check to_date condition with from_date if to_date is less then from date return error 
   */
  checkto_date() {
    let from_date = this.reportfilterform.value.from_date;
    let to_date = this.reportfilterform.value.to_date;
    if (to_date <= from_date) {
      this.reportfilterform.controls['to_date'].setValue("");
      this.toastr.error('To Date must be Greater then from date', '', { positionClass: "toast-top-center" });
    }
  }
  /**
   * function for check from_date condition with to_date if from_date is greter  then to_date return error 
   */
  checkfrom_date() {
    let from_date = this.reportfilterform.value.from_date;
    let to_date = this.reportfilterform.value.to_date;
    if (to_date != '') {
      if (from_date >= to_date) {
        this.reportfilterform.controls['from_date'].setValue("");
        this.toastr.error('From Date must be Less then to date', '', { positionClass: "toast-top-center" });
      }
    }
  }
  /**
   * function for get sub category by it's cateogry
   */
  get_sub_category() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "category_id": this.reportfilterform.value.category_id
    };
    this.reportService.get_sub_category(params).subscribe(data => {
      this.sub_category = data.list;
    });
  }
  /**
   * function for get division by it's department
   */
  get_division() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "division_id": this.reportfilterform.value.division_id
    };
    this.reportService.get_division(params).subscribe(data => {
      this.departments = data.list;
    });
  }
  /**
   * function for users list by project
   */
  get_project_users() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "project_id": this.reportfilterform.value.project_id
    };
    this.reportService.get_project_users(params).subscribe(data => {
      this.users = data.list;
      this.isprojectuser = data.isprojectuser;
      this.isshowallprojectuser = data.isshowallprojectuser;
    });
  }
  /**
   * function for export table in xlsx
   */
  export(): void {
    if(this.reportfilterform.value.report_title !='Actual time by category over a period of time'){
      let params = {
        "user_id": this.login_user_id,
        "company_id": this.company_id,
        "filters": this.reportfilterform.value
      };
      this.reportService.run_report(params).subscribe(data => {
        let date = this.changeFormat.transform(this.today);
        let index = this.reportfilterform.value.report_title;
        this.view = this.totaltableheader[index];
        this.report_data = data.list;
        this.showtable = true;
        let fileName: string = "Export_" + data.view + "_" + date + ".xlsx";
        /* make the worksheet */
        const ws = XLSX.utils.json_to_sheet(data.list);
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, fileName);
      });
    }else{
      // var doc = new jsPDF();
      // doc.addImage(document.getElementsByTagName('ngx-charts-bar-vertical-2d'), "JPG", 10,100,200)
      // console.log();
      // // doc.text('Hello world!', 10, 10)
      // doc.save('a4.pdf')
    }
  }

  /**
   * Report chart
   */
  drawChart() {
        
      }
}