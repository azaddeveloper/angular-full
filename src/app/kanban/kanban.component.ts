import { Component,ViewChild,ViewContainerRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { TaskService} from '../services/task.service';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { KanbanService } from '../kanban/kanban.service';
import {TaskpopupComponent} from '../taskpopup/taskpopup.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA,MatDialogConfig} from '@angular/material';
import { BsModalComponent } from 'ng2-bs3-modal';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {TimeConvert} from '../pipes/timeconvter.pipe';
import {ChangeFormat} from '../pipes/changeformat.pipe';
declare const $: any;
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
@Component ({
   selector: 'kanban',
   templateUrl: './kanban.component.html',
   styleUrls: ['./kanban.css'],
   providers:[KanbanService,TimeConvert,MatDialogConfig,ChangeFormat]
})
export class KanbanComponent  {
    taskclear:string = '';
    today: number = Date.now();
    tasks:any;
    Image_url:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/';
    login_user_id:number;
    company_id:number;
    kanban_status:any = '';
    today_date:any ='';
    task_detail:any='';
    comment_data:any = '';
    task_another_info:any = '';
    type_rec:any = '';
    @ViewChild('recurrencewindow')
    recurrencewindow: BsModalComponent;
    @ViewChild('rightclickcomment')
    rightclickcomment:BsModalComponent;
    @ViewChild('rightclickdelete')
    rightclickdelete:BsModalComponent;
    @ViewChild('popupdeleteoption')
    popupdeleteoption: BsModalComponent;
    @ViewChild('taskactualtime')
    taskactualtime:BsModalComponent;
    on_complete_actual_time:number;
    actual_time_status:number;
    filter_user:any ='';
    filter_project = 'all';
    filter_user_color_id:any="";
    filter_user_due_date:any="";
    user_filter_board_name:any = 'My Boards';
    projects:any = '';
    team:any = '';
    color :any="";
    is_authenticated:boolean = false;
    image:any = '';
    background:any;

    // filter related variable with default values

    colorshow:any = false;
    duedateshow:any = false;
    constructor(public loginservice:LoginService,public changeFormat:ChangeFormat,private dialogConfig:MatDialogConfig,private time:TimeConvert ,public toastr: ToastsManager,vcr: ViewContainerRef,private taskservice:TaskService, public dialog: MatDialog,public router:Router,private DragulaService:DragulaService,public kanbanservice:KanbanService){
        // this.loginservice.isAuthenticated.take(1).subscribe(authenticated=>{
        //     this.is_authenticated = authenticated;
        // })
        // if(!this.is_authenticated){
        //     this.router.navigateByUrl('');
        // }else{
        //     this.loginservice.currentUser.subscribe(data=>{
        //         this.login_user_id = data.user_id;
        //         this.company_id = data.company_id;
        //     })
        //     this.getKanbanTask();
        // }
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.getKanbanTask();
        this.toastr.setRootViewContainerRef(vcr);
        DragulaService.drop.subscribe((value) => {
            const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
            let allIndex = this.getAllElementIndex(bagTarget);
            const newIndex = elTarget ? this.getElementIndex(elTarget) : bagTarget.childElementCount;
            this.dragtask(value,newIndex,allIndex);
        });
        this.background = localStorage.getItem('user_background_type');
        if(this.background == 'Image'){
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/'+localStorage.getItem('user_background_name');
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        }else if(this.background == 'DefaultImage'){
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        }else{
            this.image = localStorage.getItem('user_background_name');
            $("body").css('background',this.image);
        }

        
    }

    ngAfterViewInit(){
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
        this.loginservice.timer_task_data.subscribe(data=>{
            if(data !=''){
                let d = JSON.parse(JSON.stringify(data));
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == d.task_id){ 
                            this.tasks[index].status_task.splice(index1,1);
                        }
                    });
                    if(element.task_status_id == d.task_status_id){
                        this.tasks[index].status_task.splice(0,0,d);
                    }
                });
                this.loginservice.update_timer_data('');
            }
        })
    }
    getElementIndex(el: HTMLElement): number {
        return [].slice.call(el.parentElement.children).indexOf(el);
    }
    getAllElementIndex(el:HTMLElement){
        let arrayIndex = [].slice.call(el.children);
        let index:Array<any> = [];
        arrayIndex.forEach(element => { 
            var id = element.id.replace('task_','');
            index.push(id);
        });
        return index;
    }
    /**
     * Get task task list
     */

    getKanbanTask() {
        let data: any = {
            'user_id': this.login_user_id,
            'company_id': this.company_id
        };
        this.kanbanservice.getKanbanTask(data).subscribe(
            data => {
                this.filter_user = data.info.kanban_team_user_id;
                this.filter_project = data.info.kanban_project_id;
                this.tasks = data.info.task_status;
                this.color=data.info.color_codes;
                this.filter_user_color_id=data.info.last_rember_values.user_color_id;
                this.filter_user_due_date=data.info.last_rember_values.due_task;
                this.projects = data.info.projects;
                this.team = data.info.team;
                this.tasks = data.info.task_status;
                this.today_date = data.info.today;
                this.actual_time_status = data.info.actual_time_status;
                if(this.filter_user == '0'){
                    this.projects.forEach(element => {
                        if(element.project_id == this.filter_project){
                            this.user_filter_board_name = element.project_title;
                        }
                    });
                }else{
                    if(this.filter_user == this.login_user_id){
                        this.user_filter_board_name = 'My Boards';
                    }else{
                        this.team.forEach(element => {
                            if(element.user_id == this.filter_user){
                                this.user_filter_board_name = element.first_name+' '+element.last_name;
                            }
                        });
                    }
                }
            },
            error => {

            });
    }

    add_task(status_id){
        let hide:any = document.querySelector("#task"+status_id);
        hide.style.display="none";

        let show:any  = document.querySelector("#inputtag"+status_id);
        show.style.display = 'block';
        
        let task:any = document.querySelector("#tasktag"+status_id);
        task.focus();
    }

    create_task(task_name,status_id,type){
        let data1:any = {
            "user_id":this.login_user_id,
            "task_title":task_name,
            "status_id":status_id,
            "company_id":this.company_id,
            "project":this.filter_project,
            "task_allocated_user_id":this.filter_user    
        };
        this.kanbanservice.add_task(data1).subscribe(
            data => { 
                this.tasks.forEach((element,index) => {
                    if(element.task_status_id == status_id){
                        this.tasks[index].status_task.splice(0,0,data.task_info);
                    }
                });
                if(type=='enter'){
                    this.open(data.task_info);
                }
                let hide:any = document.querySelector("#task"+status_id);
                hide.style.display="block";

                let show:any  = document.querySelector("#inputtag"+status_id);
                show.style.display = 'none';
                 this.taskclear = '';
                
            },
            error=>{ 
            });
    }

    changetag(status_id) {
        let hide: any = document.querySelector("#task" + status_id);
        hide.style.display = "block";

        let show: any = document.querySelector("#inputtag" + status_id);
        show.style.display = 'none';
        this.taskclear = '';

    }
    save_task_pos(task_id){
        let value:number;
        let display1:any = document.querySelector("#hide_show_"+task_id);
        let change_icon:any = document.querySelector('#chnage_icon_'+task_id);
        if(display1.style.display == "block"){
            value = 0;
            display1.style.display = "none";
            change_icon.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
        }else{
            value = 1;
            display1.style.display = "block";
            change_icon.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i>'
        }
        let data1 = {
            "task_id":task_id,
            "user_id":this.login_user_id,
            "value":value
        };
        this.taskservice.save_task_pos(data1).subscribe(data=>{
                this.tasks.forEach((element, index) => {
                    element.status_task.forEach((element1, index1) => {
                        if (element1.task_id == task_id) {
                            this.tasks[index].status_task[index1].task_ex_pos = value;
                        }
                    });
                });
        },
        error=>{

        });
    }
    compress_table(status_id){
        let hide:any = document.querySelector("#th_hide_"+status_id);
        let show:any = document.querySelector("#th_show_"+status_id);
        let td_show:any = document.querySelector("#td_show_"+status_id);
        let td_hide:any = document.querySelector("#td_hide_"+status_id);
        show.style.display = 'none';
        hide.style.display = '';
        td_show.style.display = 'none';
        td_hide.style.display = '';
    }
    expand_table(status_id){
        let hide:any = document.querySelector("#th_hide_"+status_id);
        let show:any = document.querySelector("#th_show_"+status_id);
        let td_show:any = document.querySelector("#td_show_"+status_id);
        let td_hide:any = document.querySelector("#td_hide_"+status_id);
       // if(show.style.display == "none"){
            show.style.display = 'table-cell';
            hide.style.display = 'none';
            td_show.style.display = 'table-cell';
            td_hide.style.display = 'none';
      //  }
    }
    return_count(array){
        return array.length;
    }

    /**
     * Open task modal popup
     */
    open(task_info,type='') { 
        if ($('.comm-box  a').hasClass("after_timer_on")) return !1;
        this.task_detail = task_info;
        this.dialogConfig.disableClose = true;
        this.dialogConfig.width = "800px";
        this.dialogConfig.data = {
            task_info: this.task_detail,
            type: this.type_rec,
            access:'',
            status_id:this.task_detail.task_status_id
        }
        let dialogRef = this.dialog.open(TaskpopupComponent,this.dialogConfig);
          dialogRef.componentInstance.change_array.subscribe(data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == this.task_detail.task_id){
                            this.tasks[index].status_task[index1].task_id = data; 
                        }
                    });
                });
            
          })
          dialogRef.afterClosed().subscribe(result => { 
            if(result.status == 'hide'){
                this.comment_data = this.task_another_info;
               this.popupdeleteoption.open();
            }else if(result.status == 'single'){
               this.comment_data = JSON.stringify(this.task_detail);
               this.delete_task('','occurrence');
            }else{
                this.task_detail = result.info;
                this.comment_data = '';
                this.update_task(result.status);
            }
          });
    }

    recurrence_close(){
        this.recurrencewindow.close();
    }
    recurrence_open(task){
         this.task_detail =  JSON.parse(JSON.stringify(task));
         this.task_another_info = JSON.stringify(task);
         this.recurrencewindow.open();
    }
 
    recurrence(type,task_id){
         if(type == 'series'){
             this.task_detail.task_id = task_id;
             this.task_detail.master_task_id = 0;
             this.type_rec = '';
         }else{
             this.task_detail.frequency_type = 'one_off';
             this.type_rec = 'occurrence';
         }
         this.recurrencewindow.close();
         this.open(this.task_detail,'');
         
    }
    /**
     * Save task info when user close task popup
     * @param form task info
     */
    update_task(form){
        let info = form.value; 
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "task_info":this.task_detail,
            "start_date":'',
            "info":info,
            "from":'kanban'
        };
        let remove:boolean;
        this.taskservice.updatetask(data1).subscribe(
            data => {  
                this.tasks.forEach((element,index) => {
                     element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){ 
                            if(element1.task_status_id == data.task_info.tasks.task_status_id){
                               this.tasks[index].status_task[index1] = data.task_info.tasks;
                            }else{
                                this.tasks[index].status_task.splice(index1,1);
                                remove = true;
                            }
                        }else{
                            if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence'){
                                if(element1.task_status_id == data.task_info.tasks.task_status_id){
                                    this.tasks[index].status_task[index1] = data.task_info.tasks;
                                 }else{
                                    this.tasks[index].status_task.splice(index1,1);
                                    remove = true;
                                 }
                            } else if(element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                if(element1.task_status_id == data.task_info.tasks.task_status_id){
                                    this.tasks[index].status_task[index1] = data.task_info.tasks;
                                 }else{
                                    this.tasks[index].status_task.splice(index1,1);
                                    remove = true;
                                 }
                            }else if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off'){
                                if(element1.task_status_id == data.task_info.tasks.task_status_id){
                                    this.tasks[index].status_task[index1] = data.task_info.tasks;
                                 }else{
                                    this.tasks[index].status_task.splice(index1,1);
                                    remove = true;
                                 }
                            }
                        }
                    });
                });
                this.tasks.forEach((element,index) => {
                    if(remove == true && element.task_status_id == data.task_info.tasks.task_status_id){
                        this.tasks[index].status_task.splice(0,0,data.task_info.tasks);
                    }
                });
                if(this.type_rec == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":this.task_detail.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":this.task_detail.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.splice(0,0,info.task);
                                }
                            });
                            this.type_rec = '';
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error=>{ 
                
            }
        );
    }
    /**
     * Delete task from kanban board
     * @param task task-id
     * @param type delete type
     */
    delete_task(task,type){
        if(type == 'single'){ 
            let data1:any = {
                "company_id":this.company_id,
                "task_info":task,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{
                    this.tasks.forEach((element,index) => {
                        element.status_task.forEach((element1,index1) => {
                            if(element1.task_id == task.task_id){ 
                                this.tasks[index].status_task.splice(index1,1);
                            }
                         });
                    });
                },
                error =>{
                }
            );
        }else{
            let info = JSON.parse(this.comment_data);
            let data1:any = {
                "company_id":this.company_id,
                "task_info":info,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{
                    this.tasks.forEach((element,index) => {
                        element.status_task.forEach((element1,index1) => {
                            if(element1.task_id == info.task_id && type == 'occurrence'){ 
                                this.tasks[index].status_task.splice(index1,1);
                                let rec_detail:any = {
                                    "user_id":info.task_allocated_user_id,
                                    "company_id":this.company_id,
                                    "task_id":info.master_task_id             
                                 };
                                this.kanbanservice.getNextInstance(rec_detail).subscribe(
                                    info=>{
                                        this.tasks.forEach((element,index) => {
                                            if(element.task_status_id == info.task.task_status_id){
                                                this.tasks[index].status_task.push(info.task);
                                            }
                                        });
                                    },error=>{
                                        console.log(error);
                                    }
                                )
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'series'){
                                this.tasks[index].status_task.splice(index1,1);
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date){
                                this.tasks[index].status_task.splice(index1,1);
                            }
                         });
                    });
                    this.close_right_click_delete();
                    this.close_taskpopup_option();
                    this.comment_data = '';
                    this.task_another_info = '';
                },
                error =>{
                }
            );
        }
    }
    /**
     * Close taskpopup delete option modal popup
     */
    close_taskpopup_option(){
        this.comment_data = '';
        this.task_another_info = '';
        this.popupdeleteoption.close();
    }
    /**
     * Open modal popup for getting task actual time
     */
    open_actual_time_popup(data){
        
        if(data.task_category_id =='0' && data.task_sub_category_id =='0' && data.task_status_name !='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }else{
                this.comment_data = data;
                this.on_complete_actual_time = 0;
                this.taskactualtime.open();
        }
    }
    /**
     * Close actual time popup
     */
    close_actual_time_popup(save = ''){
        if(save == ''){
            let checkbox:any = document.querySelectorAll("#is_completed_"+this.comment_data.task_id);
            checkbox[0].checked = false;
        }
        this.comment_data = '';
        this.on_complete_actual_time = 0;
        this.taskactualtime.close();
    }
    /**
     * Check time validation
     */
    change_actual_time(data):void{
        let value = data.task_actual_time.value;
        let hour: any = 0;
        let minute: any = 0;
        length = value.length;
        var numbers = /^[0-9]+$/;
        if (value.match(numbers)) {
            if (length > 4) {
                this.on_complete_actual_time = 0;
                data.task_actual_time.value = '';
                this.toastr.error('Only 4 digit number is allowed.', '', { positionClass: "toast-top-center" });
            } else if (length == 1 || length == 2) {
                hour = value;
                this.on_complete_actual_time = hour*60;
                data.task_actual_time.value = this.time.transform(hour*60);
            } else if (length == 3 || length == 4) {
                hour = (value / 100);
                hour = parseInt(hour)
                minute = (value - (parseInt(hour) * 100));
                if (minute > 59) {
                    hour++;
                    minute = minute - 60;
                }
                var total_time = hour*60 + minute;
                this.on_complete_actual_time = total_time;
                data.task_actual_time.value = this.time.transform(total_time);
            }
        } else {
            this.toastr.error('Please number is allowed. ', '', { positionClass: "toast-top-center" });
            data.task_actual_time.value = '';
            this.on_complete_actual_time = 0;
        }
        

    }
    /**
     * Save actual in db
     */
    save_actual_time(from){
        let task_info1 = this.comment_data;
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":1,
            "company_id":this.company_id,
            'time':this.on_complete_actual_time
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == task_info1.task_id){ 
                            this.tasks[index].status_task.splice(index1,1);
                        }
                    });
                    if(element.task_status_id == data.info.task_status_id){
                        this.tasks[index].status_task.splice(0,0,data.info);
                    }
                });
                if(task_info1.is_prerequisite_task == 1){
                    this.taskservice.check_completed_task_dependency(dependency).subscribe(
                        data=>{
                            this.tasks.forEach((element,index) => {
                                element.status_task.forEach((element1,index1) => {
                                    if(element1.task_id == task_info1.prerequisite_task_id){ 
                                        this.tasks[index].status_task.splice(index1,1);
                                    }
                                });
                                if(element.task_status_id == data.depent_task.task_status_id){
                                    this.tasks[index].status_task.splice(0,0,data.depent_task);
                                }
                            });
                        },error=>{
                            console.log(error);
                    });
                }
               this.close_actual_time_popup('close');
               from.task_actual_time.value = '';
            },
            error=>{ 
               
            }
        );
    }
    /**
     * Click on the checkbox complete task with actual time.
     * @param task_info 
     */
    is_completed(task_info){
        let task_info1:any = JSON.parse(JSON.stringify(task_info));
        if(task_info1.task_status_name == 'Completed'){
            status = '0';
        }else{
            status = '1';
        }
        
        if(task_info1.task_category_id =='0' && task_info1.task_sub_category_id =='0' && task_info1.task_status_name !='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":status,
            "company_id":this.company_id,
            "time":''
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                    this.tasks.forEach((element,index) => {
                        element.status_task.forEach((element1,index1) => {
                            if(element1.task_id == task_info1.task_id){ 
                                this.tasks[index].status_task.splice(index1,1);
                            }
                        });
                        if(element.task_status_id == data.info.task_status_id){
                            this.tasks[index].status_task.splice(0,0,data.info);
                        }
                    });
                    if(task_info1.is_prerequisite_task == 1){
                        this.taskservice.check_completed_task_dependency(dependency).subscribe(
                            data=>{
                                this.tasks.forEach((element,index) => {
                                    element.status_task.forEach((element1,index1) => {
                                        if(element1.task_id == task_info1.prerequisite_task_id){ 
                                            this.tasks[index].status_task.splice(index1,1);
                                        }
                                    });
                                    if(element.task_status_id == data.depent_task.task_status_id){
                                        this.tasks[index].status_task.splice(0,0,data.depent_task);
                                    }
                                });
                            },error=>{
                                console.log(error);
                        });
                    }
               
            },
            error=>{ 
               
            }
        );
    }
    
    /**
     * Complete Task steps from task widget on calendaview
     */

    completed_step(task_detail,step_title,value){
        if(value){
            status = '1';
        }else{
            status = '0';
        }
        let task_info1 = {
            "info":task_detail,
            "is_completed":status,
            "step_title":step_title
        }
        this.taskservice.complete_step(task_info1).subscribe(data=>{
            this.tasks.forEach((element,index) => {
                element.status_task.forEach((element1,index1) => {
                    if(element1.task_id == task_detail.task_id){ 
                        this.tasks[index].status_task[index1] = data.info;
                    }
                 });
            });
            if(data.status == 'occurrence'){
                let rec_detail:any = {
                    "user_id":task_detail.task_allocated_user_id,
                    "company_id":this.company_id,
                    "task_id":task_detail.master_task_id             
                 };
                this.kanbanservice.getNextInstance(rec_detail).subscribe(
                    info=>{
                        this.tasks.forEach((element,index) => {
                            if(element.task_status_id == info.task.task_status_id){
                                this.tasks[index].status_task.splice(0,0,info.task);
                            }
                        });
                    },error=>{
                        console.log(error);
                    }
                )
            }
        },
        error=>{

        });
    }
    /**
     * Drag & drop task on kanban board.
     * @param value task_id
     * @param ind index no.
     * @param indexALL all task index no.
     */
    dragtask(value,ind,indexALL){  
        let id = value[1].id;
        let id1 = document.querySelector("#"+id).closest('td').id;
        let new_id = id.replace('task_','');
        let id2:any = id1.split('_');
        let task_info:any = '';
        this.tasks.forEach((element, index) => {
            element.status_task.forEach((element1, index1) => {
                if (element1.task_id == new_id) {
                    task_info = element1;
                }
            });
        });
        let move_status_id:any = id2[2];
        let data1:any = {
            "user_id":this.login_user_id,
            "task_id":new_id,
            "company_id":this.company_id,
            "task_info":task_info,
            "index":indexALL,
            "move_status_id":move_status_id
        };
        
        this.taskservice.kanbandragTask(data1).subscribe(
                data => { console.log(data);
                    if(data.task_info !=''){
                        this.tasks.forEach((element,index) => {
                            element.status_task.forEach((element1,index1) => {
                                if(element1.task_id == new_id){ 
                                    this.tasks[index].status_task.splice(index1,1);
                                }
                            });
                            if(element.task_status_id == move_status_id){
                                this.tasks[index].status_task.splice((ind-1),0,data.task_info);
                            }
                        });
                    }
                    if(data.status == 'occurrence'){
                        let rec_detail:any = {
                            "user_id":task_info.task_allocated_user_id,
                            "company_id":this.company_id,
                            "task_id":task_info.master_task_id             
                         };
                        this.kanbanservice.getNextInstance(rec_detail).subscribe(
                            info=>{
                                this.tasks.forEach((element,index) => {
                                    if(element.task_status_id == info.task.task_status_id){
                                        this.tasks[index].status_task.splice(0,0,info.task);
                                    }
                                });
                            },error=>{
                                console.log(error);
                            }
                        )
                    }
                },
                error=>{ 
                    
                }
            );
        
    }
    /**
     * function for kanban filter
     * @param value for user id and project id
     * @param type for check call by user_id or project id
     */
    kanban_filter(value='',type=''){
        if(type == 'user_filter'){
            this.filter_user=value;
            if(value == 'me'){
                this.filter_user = this.login_user_id;
                this.user_filter_board_name = 'My Boards';
            }else{
                this.team.forEach(element => {
                    if(element.user_id == this.filter_user){
                        this.user_filter_board_name = element.first_name+' '+element.last_name;
                    }
                });
            }
            this.filter_project='all';
        }else if(type == 'project_filter'){
            this.filter_user="0";
            this.filter_project=value;
            if(this.filter_project == 'all'){
                this.user_filter_board_name = 'My Boards';
            }else{
                this.projects.forEach(element => {
                    if(element.project_id == value){
                        this.user_filter_board_name = element.project_title;
                    }
                });
            }
        }else{
            this.filter_user=this.filter_user;
            this.filter_project=this.filter_project;  
        }
        let filter_data:any = {
            "filter_user_id":this.filter_user,
            "filter_project":this.filter_project,
            "filter_user_color_id":this.filter_user_color_id,
            "filter_user_due_date":this.filter_user_due_date,
            "user_id":this.login_user_id,
            "company_id":this.company_id
        };
        this.kanbanservice.kanban_filter(filter_data).subscribe(
            result=>{
                console.log(result);
                this.tasks = result.info.task_status;
             },
             error => {
        });
    }
    /**
     * function for change prirory on right click
     * @param task_id 
     * @param priority 
     * @param task_info 
     */
    change_priority(task_id,priority,task_info){
        let data1:any = {
            "task_id":task_id,
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "task_priority":priority,
            "task_info":task_info
        };
        this.taskservice.change_priority(data1).subscribe(
            data=>{
                 this.tasks.forEach((element,index) => {
                        element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].status_task[index1] = data.info;
                        }
                        });
                    });
                    if(data.status == 'occurrence'){
                        let rec_detail:any = {
                            "user_id":data.info.task_allocated_user_id,
                            "company_id":this.company_id,
                            "task_id":data.info.master_task_id             
                         };
                        this.kanbanservice.getNextInstance(rec_detail).subscribe(
                            info=>{
                                this.tasks.forEach((element,index) => {
                                    if(element.task_status_id == info.task.task_status_id){
                                        this.tasks[index].status_task.push(info.task);
                                    }
                                });
                            },error=>{
                                console.log(error);
                            }
                        )
                    }
                
            },
            error =>{
            }
        );
    }
    /**
     * function for change task color on right click
     * @param task_id 
     * @param color_id 
     * @param task_info 
     */
    change_task_color(task_id,color_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "task_info":task_info,
            "user_id":this.login_user_id,
            "color_id":color_id
        };
        this.taskservice.change_color(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                    if(element1.task_id == task_id){ 
                        this.tasks[index].status_task[index1] = data.info;
                    }
                    });
                });
                if(data.status == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":data.info.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":data.info.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.push(info.task);
                                }
                            });
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error =>{
            }
        );
    }
    add_watch_list(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "watch_list":1,
            "task_info":task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                    if(element1.task_id == task_id){ 
                        this.tasks[index].status_task[index1] = data.info;
                    }
                    });
                });
                if(data.status == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":data.info.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":data.info.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.push(info.task);
                                }
                            });
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error =>{
            }
        );
    }
    remove_watch_list(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "watch_list":0,
            "task_info":task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                    if(element1.task_id == task_id){ 
                        this.tasks[index].status_task[index1] = data.info;
                    }
                    });
                });
                if(data.status == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":data.info.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":data.info.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.push(info.task);
                                }
                            });
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error =>{
            }
        );
    }
    update_due_date(event,info){ 
        let new_date = this.changeFormat.transform(event);
        let data1:any = {
            "company_id":this.company_id,
            "task_info":info,
            "user_id":this.login_user_id,
            "type":'due_date',
            'date':new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                    if(element1.task_id == info.task_id){ 
                        this.tasks[index].status_task[index1] = data.info;
                    }
                    });
                });
                if(data.status == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":data.info.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":data.info.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.push(info.task);
                                }
                            });
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error =>{
            }
        );
    }
    copy_task(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "task_info":task_info,
            "user_id":this.login_user_id
        };
        this.taskservice.copy_task(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                     if(element.task_status_id ==data.info.task_status_id){ 
                        this.tasks[index].status_task.push(data.info);
                    }
                     
                });
                 
            },
            error =>{
            }
        );
    }
    rightclick_comment(task_id,task_data){
        this.comment_data = JSON.stringify(task_data);
        this.rightclickcomment.open();
    }
    close_rightclick_comment(){
        this.comment_data = '';
        this.rightclickcomment.close();
    }
    save_comment(form){
        let info = JSON.parse(form.info.value);
        let comment = form.right_task_comment.value;
        if(comment !=''){
            let data1:any = {
                "company_id":this.company_id,
                "task_info":info,
                "user_id":this.login_user_id,
                "comment":comment
            };
            this.taskservice.right_click_comment(data1).subscribe(
                data=>{
                      this.tasks.forEach((element,index) => {
                            element.status_task.forEach((element1,index1) => {
                                if(element1.task_id == info.task_id){ 
                                    this.tasks[index].status_task[index1] = data.info;
                                }
                            });
                        });
                        if(data.status == 'occurrence'){
                            let rec_detail:any = {
                                "user_id":data.info.task_allocated_user_id,
                                "company_id":this.company_id,
                                "task_id":data.info.master_task_id             
                             };
                            this.kanbanservice.getNextInstance(rec_detail).subscribe(
                                info=>{
                                    this.tasks.forEach((element,index) => {
                                        if(element.task_status_id == info.task.task_status_id){
                                            this.tasks[index].status_task.push(info.task);
                                        }
                                    });
                                },error=>{
                                    console.log(error);
                                }
                            )
                        }
                    form.right_task_comment.value = '';
                    this.close_rightclick_comment();
                },
                error =>{
                }
            );
        }else{
            this.toastr.error('Please enter comment.','',{positionClass:'toast-top-center'});
        }
    }

    /**
     * Move task on right click on the task
     */
    move_task(task_id,task_detail){
        let info = {
            "task_id":task_id,
            "task_info":task_detail,
            "user_id":this.login_user_id,
            "company_id":this.company_id
        }
        this.taskservice.move_task(info).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.status_task.forEach((element1,index1) => {
                        if(element1.task_id == task_detail.task_id){
                            this.tasks[index].status_task.splice(index1,1);
                        }        
                    });
                    if(element.task_status_id == data.task_info.task_status_id){
                        this.tasks[index].status_task.splice(0,0,data.task_info);
                    }
                });
                if(data.status == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":data.info.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":data.info.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{
                            this.tasks.forEach((element,index) => {
                                if(element.task_status_id == info.task.task_status_id){
                                    this.tasks[index].status_task.splice(0,0,info.task);
                                }
                            });
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error=>{

            });
    }

    right_click_delete(task_data){
        this.comment_data = JSON.stringify(task_data);
        this.rightclickdelete.open();
    }
    close_right_click_delete(){
        this.comment_data = '';
        this.rightclickdelete.close();
    }

    save_task_for_timer(b, c, d, e, f) {
        if ($("#task_" + b).hasClass("before_timer")) return !1;
        var g = $("#timer_task_id").val();
        if (g) {
            var h = $("#or_color_" + g).val();
            $("#task_" + g).css("border", "1px solid " + h)
        }
        if ("1" != e) {
            let task_info:any = '';
            this.tasks.forEach(element => { 
                element.status_task.forEach((element1, index1) => {
                    if(element1.task_id == b){
                        task_info = element1;
                    }
                })
            });
            $.ajax({
                type: "post",
                url: environment.API_url+"/calender/save_task",
                data: {
                    task_info: JSON.stringify(task_info),
                    task_id: b,
                    user_id:this.login_user_id,
                    company_id:this.company_id
                },
                success: (info)=> { 
                    var data  = info.data;
                    this.tasks.forEach(element => { 
                        element.status_task.forEach((element1, index1) => {
                            if(element1.task_id == b){
                               element.status_task[index1] = data;
                            }
                        })
                    });
                    $("#timer_task_id").val(data.task_id);
                    var d = $("#or_color_" + data.task_id).val();
                    $("#task_" + data.task_id).css("border", "1px dashed " + d)
                }
            });
        } else {
            $("#timer_task_id").val(b);
            var j = $("#or_color_" + b).val();
            $("#task_" + b).css("border", "1px dashed " + j)
        }
        $("#task_com_status").val(f), $(".full_task div").addClass("before_timer"), $(".comm-box  a").removeClass("after_timer_on"),
            Observable.timer(2e3).subscribe(x => {
                this.loginservice.update_timer_task(c);
            });

    }
   
    chk_task_recurrence(task_id){
        if(task_id.indexOf("child") != -1){
            return 0;
        }else{
            return 1;
        }
    }

}   