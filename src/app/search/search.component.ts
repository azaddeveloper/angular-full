import { Component, OnInit,ViewContainerRef, ViewChild } from '@angular/core';
import { SearchService } from './search.service';
import { ChangeFormat } from '../pipes/changeformat.pipe';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BsModalComponent } from 'ng2-bs3-modal';
import * as XLSX from 'xlsx';
declare const $:any;
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SearchService, ChangeFormat]
})
export class SearchComponent implements OnInit {
  today: Date = new Date();
  project: any = '';
  customers: any = '';
  login_user_id: number;
  company_id: number;
  users: any = [];
  date_array = [{ 'name': 'Scheduled Date', "value": "scheduled_date" }, { 'name': 'Completion Date', "value": "completion_date" }, { 'name': 'Due Date', "value": "due_date" }];
  more_array = [{ 'name': 'Category', "value": "category" }, { 'name': 'Sub-category', "value": "subcategory" }, { 'name': 'Division', "value": "division" }, { 'name': 'Department', "value": "department" }, { 'name': 'Task Status', "value": "task_status" }];
  select_project: any = [];
  status: any = [];
  division: any = [];
  department: any = [];
  category: any = [];
  sub_category: any = [];
  user_filter_list: any = [];
  currency: any = [];
  @ViewChild('saveView')
  saveView:BsModalComponent;
  //variable for selecting  multiples value 
  date_type: any = ['scheduled_date'];
  project_list: any = [];
  customer_list: any = [];
  user_list: any = [];
  more_list: any = [];
  category_list: any = [];
  sub_category_list: any = [];
  division_list: any = [];
  department_list: any = [];
  status_list: any = [];
  columns_list: any = ['Task Name', 'Allocated To', 'Project', 'Task Status', 'Completion Date', 'Scheduled Date', 'Due Date', 'Customer Name'];
  task_list: any = '';
  bsRangeValue: Date[];
  select_user_filter:any= '';
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'buffer' };
  constructor(public vcr: ViewContainerRef,public toastr: ToastsManager,public serach_service: SearchService, public change_format: ChangeFormat) { }

  ngOnInit() {
    this.toastr.setRootViewContainerRef(this.vcr);
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.currency = user_info.currency;
    this.get_searching_task_data();
    this.user_list.push(this.login_user_id);
    this.bsRangeValue = [this.change_format.transform(this.today), this.change_format.transform(this.today)];
    $("body").css('background',"#fff");
  }

  get_searching_task_data() {
    let info = {
      "user_id": this.login_user_id,
      "company_id": this.company_id
    }
    this.serach_service.get_search_data(info).subscribe(
      data => {
        this.project = data.list.user_projects;
        this.customers = data.list.customers;
        this.users = data.list.users;
        this.status = data.list.task_status;
        this.category = data.list.main_category;
        this.sub_category = data.list.sub_category;
        this.division = data.list.divisions;
        this.department = data.list.departments;
        this.task_list = data.list.tasks;
        this.user_filter_list = data.list.get_user_filters;
      }
    )
  }

  time_convert(value) {
    let hours: any = (value / 60);
    hours = parseInt(hours)
    let minutes: any = (value - (parseInt(hours) * 60)) + '';
    if (minutes.length == 1) {
      minutes = '0' + minutes;
    }
    return hours + 'h' + minutes;
  }

  convert_price(value) {
    return this.currency + parseFloat(value).toFixed(2);
  }

  apply_filter() {
    let info = {
      info: {
        "user_list": this.user_list,
        "project_list": this.project_list,
        "customer_list": this.customer_list,
        "date_type": this.date_type,
        "category_list": this.category_list,
        "sub_category_list": this.sub_category_list,
        "division_list": this.division_list,
        "department_list": this.department_list,
        "task_status": this.status_list,
        "date_range": this.bsRangeValue
      },
      "user_id": this.login_user_id,
      "company_id": this.company_id
    }

    this.serach_service.get_filter_data(info).subscribe(
      data => {
        this.task_list = data.list;
      }
    )
  }

  date_change(date) {
    let date1 = this.change_format.transform(date[0]);
    let date2 = this.change_format.transform(date[1]);
    this.bsRangeValue = [date1, date2];
    this.apply_filter();
  }

  check_more(value) {
    switch (value) {
      case 'category':
        if (!this.more_list.includes(value)) {
          this.category_list.length = 0;
        }
        break;
      case 'subcategory':
        if (!this.more_list.includes(value)) {
          this.sub_category_list.length = 0;
        }
        break;
      case 'division':
        if (!this.more_list.includes(value)) {
          this.division_list.length = 0;
        }
        break;
      case 'department':
        if (!this.more_list.includes(value)) {
          this.department_list.length = 0;
        }
        break;
      case 'task_status':
        if (!this.more_list.includes(value)) {
          this.status_list.length = 0;
        }
        break;
    }

  }
  apply_user_filter(filter_id) {
    this.select_user_filter = filter_id;
    this.user_filter_list.forEach(element => {
      if (element.filter_id == filter_id) {
        let status = 0;
        let more = [];
        this.columns_list = element.columns;
        if (element.filter_value.projects) {
          this.project_list = element.filter_value.projects;
        } else {
          this.project_list = '';
        }
        if (element.filter_value.customers) {
          this.customer_list = element.filter_value.customers;
        } else {
          this.customer_list = '';
        }
        if (element.filter_value.by_date) {
          this.date_type = element.filter_value.by_date;
        } else {
          this.date_type = '';
        }
        if (element.filter_value.users) {
          this.user_list = element.filter_value.users;
        } else {
          this.user_list = '';
        }
        if (element.filter_value.division) {
          this.division_list = element.filter_value.division;
          status =1;
          more.push('division');
        } else {
          this.division_list = '';
        }
        if (element.filter_value.department) {
          this.department_list = element.filter_value.department;
          status =1;
          more.push('department');
        } else {
          this.department_list = '';
        }
        if (element.filter_value.category) {
          this.category_list = element.filter_value.category;
          status =1;
          more.push('category');
        } else {
          this.category_list = '';
        }
        if (element.filter_value.subcategory) {
          this.sub_category_list = element.filter_value.subcategory;
          status =1;
          more.push('subcategory');
        } else {
          this.sub_category_list = '';
        }
        if (element.filter_value.task_status) {
          this.status_list = element.filter_value.task_status;
          status =1;
          more.push('task_status');
        } else {
          this.status_list = '';
        }
        if (status == 1) {
          this.more_list = more;
        } else {
          this.more_list = '';
        }
        this.bsRangeValue = [element.filter_value.start_date,element.filter_value.end_date];
      }
    });
    let info ={
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "filter_id":filter_id
    }
    this.serach_service.get_saved_filter_data(info).subscribe(
      data=>{
        this.task_list = data.list;
      }
    )
  }

  delete_filter(){
    this.serach_service.delete_filter(this.select_user_filter).subscribe(
      data=>{
        this.user_filter_list.forEach((element,index) => {
          if(element.filter_id == this.select_user_filter){
            this.user_filter_list.splice(index,1)
            this.select_user_filter = '';
            this.reset_data();
            this.toastr.success('Filter has been deleted successfully.','');
          }
        });
      }
    )
  }

  reset_data(){
    this.date_type = ['scheduled_date'];
    this.project_list = [];
    this.customer_list = [];
    this.user_list = [];
    this.more_list = [];
    this.category_list = [];
    this.sub_category_list = [];
    this.division_list = [];
    this.department_list = [];
    this.status_list = [];
    this.columns_list = ['Task Name', 'Allocated To', 'Project', 'Task Status', 'Completion Date', 'Scheduled Date', 'Due Date', 'Customer Name'];
    this.bsRangeValue = [this.change_format.transform(this.today), this.change_format.transform(this.today)];
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "filter_id":''
    }
    this.serach_service.get_saved_filter_data(info).subscribe(
      data=>{
        this.task_list = data.list;
      }
    )  
  }

  open_save_view_modal(){
    this.saveView.open();
  }

  close_save_view_modal(){
    this.saveView.close();
  }

  save_view(value){
    if(value == ''){
      this.toastr.error('Please enter filter title.','');
    }else{
      let info = {
        info: {
          "user_list": this.user_list,
          "project_list": this.project_list,
          "customer_list": this.customer_list,
          "date_type": this.date_type,
          "category_list": this.category_list,
          "sub_category_list": this.sub_category_list,
          "division_list": this.division_list,
          "department_list": this.department_list,
          "task_status": this.status_list,
          "date_range": this.bsRangeValue,
        },
        "user_id": this.login_user_id,
        "company_id": this.company_id,
        "filter_title":value,
        "columns":this.columns_list
      }
      this.serach_service.create_new_filter(info).subscribe(
        data=>{
          this.user_filter_list.push(data.list);
          this.close_save_view_modal();
          this.select_user_filter = data.list.filter_id;
          this.toastr.success('Filter has been saved successfully.','');
        }
      )
    }
    
  }

  update_existing_filter(){
    let info = {
      info: {
        "user_list": this.user_list,
        "project_list": this.project_list,
        "customer_list": this.customer_list,
        "date_type": this.date_type,
        "category_list": this.category_list,
        "sub_category_list": this.sub_category_list,
        "division_list": this.division_list,
        "department_list": this.department_list,
        "task_status": this.status_list,
        "date_range": this.bsRangeValue,
      },
      "filter_id":this.select_user_filter,
      "columns":this.columns_list
    }
    this.serach_service.update_filter(info).subscribe(
      data=>{ 
        this.user_filter_list.forEach((element,index) => {
          if(element.filter_id == this.select_user_filter){
            this.user_filter_list[index] = data.list; 
            this.toastr.success('The view has been updated.','');
          }
        });
      }
    )
  }

  export(): void {
    let info = {
      info: {
        "user_list": this.user_list,
        "project_list": this.project_list,
        "customer_list": this.customer_list,
        "date_type": this.date_type,
        "category_list": this.category_list,
        "sub_category_list": this.sub_category_list,
        "division_list": this.division_list,
        "department_list": this.department_list,
        "task_status": this.status_list,
        "date_range": this.bsRangeValue
      },
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "columns":this.columns_list
    }
    this.serach_service.excel_data(info).subscribe(
      data=>{
          let date = this.change_format.transform(this.today);
          let fileName: string = "Export_Data_"+ date +".xlsx";
          /* make the worksheet */
          const ws = XLSX.utils.json_to_sheet(data.list);
          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          /* save to file */
          XLSX.writeFile(wb, fileName);
      }
    )
      
    
  }
}
