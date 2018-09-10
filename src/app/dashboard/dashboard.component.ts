import { Component, OnInit, ViewChild ,ElementRef} from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { TaskpopupComponent } from '../taskpopup/taskpopup.component';
import { TaskService } from '../services/task.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { LoginService } from '../login/login.service';
declare var AmCharts:any;
declare var $:any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService, MatDialogConfig,ChangeFormat]
})
export class DashboardComponent implements OnInit {
  today: number = Date.now();
  login_user_id: any = '';
  Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
  company_id: any = '';
  overdue_tasks: any = '';
  planned_hours: any = '';
  backlog_tasks: any = '';
  remaing_tasks_count: any = '';
  remaing_tasks_time: any = '';
  watchlist: any = '';
  task_detail: any = "";
  type_rec: any = "";
  task_data: any = '';
  todo_list: any = '';
  date_format: any = "";
  pending_task: any = '';
  last_login_task: any = '';
  task_thisweek: any = '';
  taskpopupdata: any = '';
  this_week:boolean = true;
  task_type: any = ''; // this var is used to identify which type of task have been opened is task popup for updating array. 
  @ViewChild('recurrencewindow')
  recurrencewindow: BsModalComponent;
  todo_priority_filter:any = '';
  todo_date_filter:any = 'today';
  options: any = {
    revertOnSpill: true
  }
  next:any = false;
  prevoius:any = false;
  constructor(public loginservice:LoginService,public elementRef:ElementRef,private DragulaService:DragulaService,public change_format:ChangeFormat,private dashboardservice: DashboardService, private dialog: MatDialog, private dialogConfig: MatDialogConfig, private taskservice: TaskService) {
    DragulaService.drop.subscribe((value) => {
      const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
      let allIndex = this.getAllElementIndex(bagTarget);
      const newIndex = elTarget ? this.getElementIndex(elTarget) : bagTarget.childElementCount;
      console.log(allIndex);
      // this.dragtask(value,newIndex,allIndex);
    }); 
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
  getElementIndex(el: HTMLElement): number {
      return [].slice.call(el.parentElement.children).indexOf(el);
  }
  getAllElementIndex(el:HTMLElement){
      let arrayIndex = [].slice.call(el.children);
      let index:Array<any> = [];
      arrayIndex.forEach(element => { 
          var id = element.id.replace('sortableItem_','');
          index.push(id);
      });
      return index;
  }
  ngOnInit() {
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.getdashboard();
    
  }
  
  getdashboard() {
    let params = {
      "user_id": this.login_user_id,
      "company_id": this.company_id
    };
    this.dashboardservice.getdashboard(params).subscribe(data => {
      console.log(data);
      this.overdue_tasks = data.list.overdue_tasks;
      this.planned_hours = data.list.planned_hours;
      this.backlog_tasks = data.list.backlog_tasks;
      this.remaing_tasks_count = data.list.remaing_tasks_count;
      this.remaing_tasks_time = data.list.remaing_tasks_time;
      this.watchlist = data.list.watchlist;//watchlist array
      this.todo_list = data.list.todolist;
      this.date_format = data.list.site_setting_date;
      this.pending_task = data.list.pending_task;
      this.last_login_task = data.list.last_login_task;
      this.task_thisweek = data.list.task_thisweek;
      this.intilize_addTask_json();
      this.draw_time_allocation_chart(data.list.graph_array,data.list.graph_array1);
    });

  }
  replace_space(task) {
    return task.replace(" ", "");
  }
  open(task_info, type = '') {
    this.task_type = type; 
    this.task_detail = task_info;
    this.dialogConfig.disableClose = true;
    this.dialogConfig.width = "800px";
    this.dialogConfig.data = {
      task_info: this.task_detail,
      type: this.type_rec,
      access: "dashboard",
      status_id:this.task_detail.task_status_id
    }
    let dialogRef = this.dialog.open(TaskpopupComponent, this.dialogConfig);
    dialogRef.componentInstance.change_array.subscribe(data => {
      if (this.task_type == 'todo') {
        this.todo_list.forEach((element, index) => {
          if (element.task_id == this.task_detail.task_id) {
            this.todo_list[index].task_id = data;
          }
        });
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result.status == 'single') {
        this.task_data = JSON.stringify(result.info);
        if (this.task_detail.master_task_id != '0' && this.type_rec == 'occurrence') {
          this.delete_task(this.task_data, 'occurrence');
        } else if (this.task_detail.frequency_type == 'one_off') {
          this.delete_task(this.task_data, 'single');
        } else {
          this.delete_task(this.task_data, 'series');
        }
      } else if (result.type == 'add') {
        this.insertTask(result.status, result.info);
      } else if (result.type == 'update') {
        this.task_detail = result.info;
        this.update_task(result.status);
      }
    });
  }

  update_task(form) {

    let info = form.value;
    let data1: any = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "task_info": this.task_detail,
      "start_date": '',
      "info": info,
      "from": "dashboard"
    };
    
    this.taskservice.updatetask(data1).subscribe(
      data => {
        if (this.task_type == 'watch') {
          this.watchlist.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              if(this.task_detail.watch == 0){
                  this.watchlist.splice(index,1);
              }else{
                this.watchlist[index] = data.task_info.tasks;
              }
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                if(this.task_detail.watch == 0){
                    this.watchlist.splice(index,1);
                }else{
                  this.watchlist[index] = data.task_info.tasks;
                }
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                if(this.task_detail.watch == 0){
                    this.watchlist.splice(index,1);
                }else{
                  this.watchlist[index] = data.task_info.tasks;
                }
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                if(this.task_detail.watch == 0){
                    this.watchlist.splice(index,1);
                }else{
                  this.watchlist[index] = data.task_info.tasks;
                }
              }
            }
          });
        } else if (this.task_type == 'todo') {
          this.todo_list.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.todo_list[index] = data.task_info.tasks;
              if(data.task_info.tasks.watch == 1){
                this.watchlist.splice(0,0,data.task_info.tasks);
              }
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.todo_list[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.todo_list[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.todo_list[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              }
            }
          });
        }else if (this.task_type == 'pending') {
          this.pending_task.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.pending_task[index] = data.task_info.tasks;
              if(data.task_info.tasks.watch == 1){
                this.watchlist.splice(0,0,data.task_info.tasks);
              }
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.pending_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.pending_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.pending_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              }
            }
          });
        }else if (this.task_type == 'last_login') {
          this.last_login_task.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.last_login_task[index] = data.task_info.tasks;
              if(data.task_info.tasks.watch == 1){
                this.watchlist.splice(0,0,data.task_info.tasks);
              }
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.last_login_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.last_login_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.last_login_task[index] = data.task_info.tasks;
                if(data.task_info.tasks.watch == 1){
                  this.watchlist.splice(0,0,data.task_info.tasks);
                }
              }
            }
          });
        }
        if (this.type_rec == 'occurrence') {
          let rec_detail: any = {
            "user_id": this.task_detail.task_allocated_user_id,
            "company_id": this.company_id,
            "task_id": this.task_detail.master_task_id
          };
          this.dashboardservice.getNextInstance(rec_detail).subscribe(
            info => {
              if (this.task_type == 'todo') {
                this.todo_list.splice(0, 0, info.task);
              } else if (this.task_type == 'watch') {
                this.watchlist.splice(0, 0, info.task);
              }else if (this.task_type == 'pending') {
                this.pending_task.splice(0, 0, info.task);
              }else if (this.task_type == 'last_login') {
                this.last_login_task.splice(0, 0, info.task);
              }
              
            }, error => {
              console.log(error);
            }
          )
        }
        this.type_rec = '';
        //  this.task_type = '';
      },
      error => {

      }
    );
  }

  recurrence_open(task, type) {
    this.task_type = type;
    this.task_detail = JSON.parse(JSON.stringify(task));
    this.recurrencewindow.open();
  }
  recurrence_close() {
    this.recurrencewindow.close();
  }
  recurrence(type, task_id) {
    if (type == 'series') {
      this.task_detail.task_id = task_id;
      this.task_detail.master_task_id = 0;
      this.type_rec = '';
    } else {
      this.task_detail.frequency_type = 'one_off';
      this.type_rec = 'occurrence';
    }
    this.recurrencewindow.close();
    this.open(this.task_detail, this.task_type);

  }

  delete_task(task, type) {
    if (type == 'single') {
      let info1 = JSON.parse(task);
      let data1: any = {
        "company_id": this.company_id,
        "task_info": info1,
        "user_id": this.login_user_id,
        "type": type
      };
      this.taskservice.delete_task(data1).subscribe(
        data => {
          if (this.task_type == 'todo') {
            this.todo_list.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.todo_list.splice(index, 1);
              }
            });
          }else if(this.task_type == 'watch'){
            this.watchlist.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.watchlist.splice(index, 1);
              }
            });
          }else if(this.task_type == 'pending'){
            this.pending_task.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.pending_task.splice(index, 1);
              }
            });
          }else if(this.task_type == 'last_login'){
            this.last_login_task.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.last_login_task.splice(index, 1);
              }
            });
          }
          this.task_type = '';
        },
        error => {
        }
      );

    } else {
      let info = JSON.parse(this.task_data);
      // let info = task;

      let data1: any = {
        "company_id": this.company_id,
        "task_info": info,
        "user_id": this.login_user_id,
        "type": type
      };
      this.taskservice.delete_task(data1).subscribe(
        data => {
          if (this.task_type == 'todo') {
            this.todo_list.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.todo_list.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.todo_list.splice(index, 1);
              }
            });
          }else if(this.task_type == 'watch'){
            this.todo_list.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.watchlist.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.watchlist.splice(index, 1);
              }
            });
          }else if(this.task_type == 'pending'){
            this.pending_task.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.pending_task.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.pending_task.splice(index, 1);
              }
            });
          }else if(this.task_type == 'last_login'){
            this.last_login_task.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.last_login_task.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.last_login_task.splice(index, 1);
              }
            });
          }
          this.task_data = '';
          this.task_type = '';
        },
        error => {
        }
      );
    }
  }
  intilize_addTask_json() {
    let logininfo = JSON.parse(localStorage.getItem('info'));
    this.taskpopupdata = this.taskservice.taskPopup;
    this.taskpopupdata.task_status_id = this.get_task_status_id_by_name('Ready');
    this.taskpopupdata.task_allocated_user_id = this.login_user_id;
    this.taskpopupdata.task_company_id = this.company_id;
    this.taskpopupdata.owner_name = logininfo.username;
    this.taskpopupdata.task_owner_id = this.login_user_id;
    this.taskpopupdata.completed_depencencies = 0;
    this.taskpopupdata.task_scheduled_date = new Date();
    this.taskpopupdata.task_due_date = new Date();
  }
  get_task_status_id_by_name(name) {
    let status: any = JSON.parse(localStorage.getItem('status'));
    let status_id = '';
    status.forEach(element => {
      if (element.task_status_name == name) {
        status_id = element.task_status_id;
      }
    });
    return status_id;
  }
  insertTask(data, info) {
      this.taskservice.insert_task_data(data.value, info,'dashboard').subscribe(
          data => { 
              this.todo_list.push(data.info);
              if(data.info.watch == 1){
                this.watchlist.splice(0,0,data.info);
              }
      });
  }

  apply_filter(){
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "type":this.todo_priority_filter,
      "duration":this.todo_date_filter
    }
    this.dashboardservice.todo_ajax(info).subscribe(
      data=>{
        this.todo_list.length = 0;
        this.todo_list = data.data;
      }
    )
  }
  widget_task(type){
    this.todo_date_filter = type;
    this.todo_priority_filter = '';
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "type":this.todo_priority_filter,
      "duration":this.todo_date_filter
    }
    this.dashboardservice.todo_ajax(info).subscribe(data=>{
      this.todo_list.length = 0;
      this.todo_list = data.data;
    })
  }

  change_due_date(date,data){
    let new_date = this.change_format.transform(date.value);
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "data":data,
      "date":new_date,
      'type':this.todo_priority_filter,
      'duration':this.todo_date_filter
    }
    let task_id = data.task_id;
    this.dashboardservice.update_due_date(info).subscribe(
      data=>{
        this.todo_list.forEach((element,index) => {
          if(element.task_id == task_id){
            if(data.status == 1){
              this.todo_list[index] = data.data;
            }else{
              this.todo_list.splice(index,1);
            }
          }
        });
      }
    )
  }

  change_scheduled_date(date,data){
    let new_date = this.change_format.transform(date.value);
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "data":data,
      "date":new_date,
      'type':this.todo_priority_filter,
      'duration':this.todo_date_filter
    }
    let task_id = data.task_id;
    this.dashboardservice.update_scheduled_date(info).subscribe(
      data=>{
        this.todo_list.forEach((element,index) => {
          if(element.task_id == task_id){
            if(data.status == 1){
              this.todo_list[index] = data.data;
            }else{
              this.todo_list.splice(index,1);
            }
          }
        });
      }
    )
  }

  delete_watch_list(id){
    this.dashboardservice.delete_watch_list(id).subscribe(
      data=>{
        this.watchlist.forEach((element,index) => {
          if(element.id == id){
            this.watchlist.splice(index,1);
          }
        });
      }
    )
  }

  get_nextweek(){
    this.dashboardservice.get_nextweek_task(this.login_user_id,this.company_id).subscribe(
      data=>{
        this.task_thisweek.length = 0;
        this.task_thisweek = data.result.task_thisweek;
      }
    )
  }

  get_previousweek(){
    this.dashboardservice.get_preweek_task(this.login_user_id,this.company_id).subscribe(
      data=>{
        this.task_thisweek.length = 0;
        this.task_thisweek = data.result.task_thisweek;
      }
    )
  }

  string_length(value){
    let length = value.length;
    let name = value;
    if(length >15){
        name = value.substring(0,15)+'...';
    }
    return name;
  }

  draw_time_allocation_chart(value,graph){
    let array = [];
    graph.forEach(element => { 
      let array1 = {
        "balloonFunction": function(item) {
           return "<span style='font-size:14px'><b>"+item.graph.title+"</b> : <b>" +(item.values.value) + "</b></span>";
         },
         "fillAlphas": 0.8,
         "labelText": "",
         "lineAlpha": 0.3,
         "title": element,
         "type": "column",
         "color": "#000000",
         "valueField":element,
       };
       array.push(array1);
    });
      AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "theme": "light",
        "depth3D": 20,
        "angle": 30,
        "legend": {
          "horizontalGap": 10,
          "useGraphSettings": true,
          "markerSize": 10
        },
        "valueAxes": [ {
          "stackType": "regular",
          "axisAlpha": 0,
          "gridAlpha": 0,
          "minimum": 0,
          "maximum": 1200	,
          "autoGridCount":false,
          "gridCount": 12,
          "labelFunction": function(value) {
              return Math.round(value/60);
          } 
        } ],
        "categoryField": "Date",
        "categoryAxis": {
          "gridPosition": "start",
          "axisAlpha": 0,
          "gridAlpha": 0,
          "position": "left"
        },
        "dataProvider": value,
        "graphs":array
      });
   }
  time_convert(value){
    let hours:any = (value / 60);
			hours = parseInt(hours)
    let minutes:any  = (value - (parseInt(hours) * 60))+'';
    if (minutes.length == 1) {
        minutes = '0'+ minutes;
    }
      return hours+'h'+minutes;
  }
}
