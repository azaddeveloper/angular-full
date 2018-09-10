import { Component, OnInit,ViewChild } from '@angular/core';
import {TeamdashboardService} from './teamdashboard.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { TaskpopupComponent } from '../taskpopup/taskpopup.component';
import { TaskService } from '../services/task.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { Chart } from 'chart.js';
import { LoginService } from '../login/login.service';
declare const $: any;

@Component({
  selector: 'app-teamdashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.css'],
  providers:[TeamdashboardService,MatDialogConfig,ChangeFormat]
})
export class TeamdashboardComponent implements OnInit {
  login_user_id:number;
  company_id:number;
  todo_list:any= '';
  Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
  team_priority:any = '';
  team_duration:any = 'today';
  task_detail:any = '';
  task_type: any = '';
  type_rec:any = '';
  task_data:any = '';
  pending_task:any = '';
  overdue_task:any = '';
  @ViewChild('recurrencewindow')
  recurrencewindow: BsModalComponent;
  new_task_info:any = '';
  this_week:boolean = true;
  team_time_thisweek:any = '';
  @ViewChild('barCanvas') barCanvas;
  @ViewChild('barCanvas1') barCanvas1;
  barChart: any;
  barChart1:any;
  cate:any=[];
  cate_data:any = [];
  color_array:any = [];
  next:any = false;
  prevoius:any = false;
  constructor(public loginservice:LoginService,public change_format:ChangeFormat,public team_service :TeamdashboardService, private dialog: MatDialog, private dialogConfig: MatDialogConfig, private taskservice: TaskService) { }

  ngOnInit() {
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.get_teamdashboard();
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
  get_teamdashboard(){
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id
    }
    this.team_service.get_teamdashboard(info).subscribe(
      data=>{ console.log(data);
        this.todo_list = data.list.teamtodolist;
        this.pending_task = data.list.pending_task;
        this.overdue_task = data.list.overdue_task;
        this.team_time_thisweek = data.list.team_time_this_week;
        data.list.taskByCat.forEach(element => {
          if(element.task_category_id == 0){
            this.cate.push('No Category');
            this.cate_data.push(element.task_time_estimate);
            this.color_array.push(element.color_code)
          }else{
            this.cate.push(element.category_name);
            this.cate_data.push(element.task_time_estimate);
            this.color_array.push(element.color_code)
          }
        });
        this.barChart = new Chart(this.barCanvas.nativeElement, {
          type: 'pie',
          data: {
              labels: ["Allocated", "Not Allocated"],
              datasets: [{
                  data: [data.list.allocated, data.list.nonallocated],
                  backgroundColor: [
                      'rgba(255, 99, 132, 2)',
                      'rgba(54, 162, 235, 2)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)'
                  ],
              }]
            },
            options: {
              tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';
                        if (label) {
                            label += ' : ';
                        }
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        let hours:any = (value / 60);
                          hours = parseInt(hours)
                        let minutes:any  = (value - (parseInt(hours) * 60));
                        let time =  hours+'h '+minutes+'m';
                          
                        label += time;
                        
                        return label;
                    }
                }
            }
          }
          
        });
        this.barChart1 = new Chart(this.barCanvas1.nativeElement, {
        type: 'pie',
        data: {
            labels: this.cate,
            datasets: [{
                data: this.cate_data,
                backgroundColor: this.color_array,
                borderColor: this.color_array
            }],
        },
        options: {
          tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.labels[tooltipItem.index] || '';
                    if (label) {
                        label += ' : ';
                    }
                    let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    let hours:any = (value / 60);
                      hours = parseInt(hours)
                    let minutes:any  = (value - (parseInt(hours) * 60));
                    let time =  hours+'h '+minutes+'m';
                      
                    label += time;
                    
                    return label;
                }
            }
        }
      }
        
    });
        this.intilize_addTask_json();
      }
    )
  }
  time_convert(value){
    let hours:any = (value / 60);
			hours = parseInt(hours)
		let minutes:any  = (value - (parseInt(hours) * 60));
        if(hours == '0' && minutes == '0'){
        return '0m';
      } else if(hours != '0' && minutes == '0'){
        return hours+'h';
      } else if(hours == '0' && minutes != '0'){
        return minutes+'m';
      } else {
        return hours+'h'+minutes+'m';
      }
  }
  string_length(value){
    let length = value.length;
    let name = value;
    if(length >15){
        name = value.substring(0,15)+'...';
    }
    return name;
  }

  get_delay(date){
    let start:any = new Date();
    let end:any = new Date(date);
    var diff:any =  Math.floor(( start - end ) / 86400000);
    return diff;
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
      access: "teamdashboard",
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
      "from": "teamdashboard"
    };
    
    this.taskservice.updatetask(data1).subscribe(
      data => {
        if (this.task_type == 'todo') {
          this.todo_list.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.todo_list[index] = data.task_info.tasks;
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.todo_list[index] = data.task_info.tasks;
                
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.todo_list[index] = data.task_info.tasks;
                
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.todo_list[index] = data.task_info.tasks;
                
              }
            }
          });
        }else if (this.task_type == 'overdue') {
          this.overdue_task.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.overdue_task[index] = data.task_info.tasks;
              
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.overdue_task[index] = data.task_info.tasks;
                
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.overdue_task[index] = data.task_info.tasks;
                
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.overdue_task[index] = data.task_info.tasks;
                
              }
            }
          });
        }else if (this.task_type == 'pending') {
          this.pending_task.forEach((element, index) => {
            if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
              this.pending_task[index] = data.task_info.tasks;
              
            } else {
              if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                this.pending_task[index] = data.task_info.tasks;
                
              } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                this.pending_task[index] = data.task_info.tasks;
                
              } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                this.pending_task[index] = data.task_info.tasks;
                
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
          this.team_service.getNextInstance(rec_detail).subscribe(
            info => {
              if (this.task_type == 'todo') {
                this.todo_list.splice(0, 0, info.task);
              } else if (this.task_type == 'pending') {
                this.pending_task.splice(0, 0, info.task);
              }else if (this.task_type == 'overdue') {
                this.overdue_task.splice(0, 0, info.task);
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
          }else if(this.task_type == 'pending'){
            this.pending_task.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.pending_task.splice(index, 1);
              }
            });
          }else if(this.task_type == 'overdue'){
            this.overdue_task.forEach((element, index) => {
              if (element.task_id == info1.task_id) {
                this.overdue_task.splice(index, 1);
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
          }else if(this.task_type == 'pending'){
            this.pending_task.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.pending_task.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.pending_task.splice(index, 1);
              }
            });
          }else if(this.task_type == 'overdue'){
            this.overdue_task.forEach((element, index) => {
              if (element.task_id == info.task_id && type == 'occurrence') {
                this.overdue_task.splice(index, 1);
              }
              if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                this.overdue_task.splice(index, 1);
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
    this.new_task_info = this.taskservice.taskPopup;
    this.new_task_info.task_status_id = this.get_task_status_id_by_name('Ready');
    this.new_task_info.task_allocated_user_id = this.login_user_id;
    this.new_task_info.task_company_id = this.company_id;
    this.new_task_info.owner_name = logininfo.username;
    this.new_task_info.task_owner_id = this.login_user_id;
    this.new_task_info.completed_depencencies = 0;
    this.new_task_info.task_scheduled_date = new Date();
    this.new_task_info.task_due_date = new Date();
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
      this.taskservice.insert_task_data(data.value, info,'teamdashboard').subscribe(
          data => { 
            this.todo_list.push(data.info);
      });
  }
  filter_apply(){
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "type":this.team_priority,
      "duration":this.team_duration
    }
    this.team_service.todo_team_ajax(info).subscribe(
      data=>{
        this.todo_list.length = 0;
        this.todo_list = data.teamtodolist;
      }
    )
  }

  get_nextweek(){
    this.team_service.get_nextweek_task(this.login_user_id,this.company_id).subscribe(
      data=>{
        this.team_time_thisweek.length = 0;
        this.team_time_thisweek = data.result.team_time_this_week;
      }
    )
  }

  get_previousweek(){
    this.team_service.get_preweek_task(this.login_user_id,this.company_id).subscribe(
      data=>{
        this.team_time_thisweek.length = 0;
        this.team_time_thisweek = data.result.team_time_this_week;
      }
    )
  }

  change_due_date(date,data){
    let new_date = this.change_format.transform(date.value);
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "data":data,
      "date":new_date,
      'type':this.team_priority,
      'duration':this.team_duration
    }
    let task_id = data.task_id;
    this.team_service.update_due_date(info).subscribe(
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
      'type':this.team_priority,
      'duration':this.team_duration
    }
    let task_id = data.task_id;
    this.team_service.update_scheduled_date(info).subscribe(
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
}
