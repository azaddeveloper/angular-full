import { Component, ElementRef, ViewChild, ViewContainerRef, EventEmitter,ChangeDetectionStrategy  } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { BsModalComponent } from 'ng2-bs3-modal';
import { TaskpopupComponent } from '../taskpopup/taskpopup.component';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { TimeConvert } from '../pipes/timeconvter.pipe';
import { ChangeFormat } from '../pipes/changeformat.pipe';
import { LoginService } from '../login/login.service';
import { Observable } from 'rxjs/Rx';
declare const $: any;
import {environment} from '../../environments/environment';
import {
    CalendarEvent,
    CalendarEventAction,
    CalendarEventTimesChangedEvent
} from 'angular-calendar';

@Component({
    selector: 'todo',
    templateUrl: './todo.component.html',
    styleUrls: ['./todo.component.css'],
    providers: [TimeConvert, MatDialogConfig, ChangeFormat]
})
export class TodoComponent {

    viewDate: Date = new Date();
    events: Observable<any>;
    calender_view: any = 'weekly';
    today:Date = new Date();
    other_user_task_status: boolean;
    other_team_member_tasks: any = '';
    taskclear: string = '';
    tasks: any;
    task_input: any = '';
    week: {
        first?: string,
        last?: string
    } = {};
    options: any = {
        revertOnSpill: true
    }
    capacity: Array<any> = [];
    date_format: any = '';
    today_date: any = '';
    @ViewChild('recurrencewindow')
    recurrencewindow: BsModalComponent;
    @ViewChild('rightclickcomment')
    rightclickcomment: BsModalComponent;
    @ViewChild('rightclickdelete')
    rightclickdelete: BsModalComponent;
    @ViewChild('popupdeleteoption')
    popupdeleteoption: BsModalComponent;
    @ViewChild('showbacklogtask')
    showbacklogtask: BsModalComponent;
    @ViewChild('taskactualtime')
    taskactualtime: BsModalComponent;
    task_detail: any = '';
    status: any = '';
    projects:any = '';
    team:any = '';
    login_user_id: number;
    // filter variables
    filter_sorting: any = "";
    filter_color: any = "";
    filter_status: any = "";
    filter_project = 'all';
    filter_user: any = '';
    status_array:any = [];
    status_all:any = 0;
    user_filter_calendar_name:any = 'My Calendar';
    company_id: any = '';
    Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/';
    default_task_status: any = '';
    type_rec: any = '';
    colors: any = '';
    comment_data: any = '';
    task_another_info: any = '';
    nonSchedulleTask: any = '';
    backlog_array: any = [];
    date_array: any = '';
    user_capacity: any = '';
    actual_time_status: number;
    on_complete_actual_time: number;
    user_task_type: any = '';
    is_authenticated: boolean = false;
    image: any = '';
    background: any;
    new_task_initial_data: any = '';
    // month calendar data & filter variables
    month_start_date:Date;
    monthly_data: any = [];

    calendar_capacity:boolean = false;
    calendar_summary:boolean = false;
    calendar_task:boolean = false;

    // filter related variables

    colorshow:any = false;
    statusshow:any = false;
    projectshow:any = false;
    sortshow:any = false;
    userteam:any = false;
    constructor(public route: Router, public loginservice: LoginService, public changeFormat: ChangeFormat, public dialogConfig: MatDialogConfig, public time: TimeConvert, public dialog: MatDialog, public taskservice: TaskService, public toastr: ToastsManager, vcr: ViewContainerRef, public router: Router, private DragulaService: DragulaService, public ElementRef: ElementRef) {
        
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.getTask();
        this.toastr.setRootViewContainerRef(vcr);
        DragulaService.drop.subscribe((value) => {
            const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
            let allIndex = this.getAllElementIndex(bagTarget);
            const newIndex = elTarget ? this.getElementIndex(elTarget) : bagTarget.childElementCount;
            if(this.calender_view == 'weekly'){
                this.dragtask(value, newIndex, allIndex);
            }else{
                this.monthly_drag_task(value, newIndex, allIndex);
            }
        });
        this.background = localStorage.getItem('user_background_type');
        if (this.background == 'Image') {
            this.image = this.Image_url + localStorage.getItem('user_background_name');
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        } else if (this.background == 'DefaultImage') {
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        } else {
            this.image = localStorage.getItem('user_background_name');
            $("body").css('background',this.image);
        }
    }
    ngAfterViewInit() {
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
        this.loginservice.timer_task_data.subscribe(data => {
            if (data != '') {
                let d = JSON.parse(JSON.stringify(data));
                this.tasks.forEach(element => {
                    element.task_list.forEach((element1, index) => {
                        if (element1.task_id == d.task_id) {
                            element.task_list[index] = d;
                        }
                    });
                });
                this.other_team_member_tasks.forEach((element) => {
                    element.task_list.forEach((element1, index) => {
                        if (element1.task_id == d.task_id) {
                            element.task_list[index] = d;
                        }
                    });
                });
                this.monthly_data.forEach((element) => {
                    element.task_list.forEach((element1 ,index)=> {
                        if (element1.task_id == d.task_id) {
                            element.task_list[index] = d;
                        }
                    });
                });
                this.loginservice.update_timer_data('');
            }
        })

        setTimeout(()=>{ 
            var left = $('#calendar_move').width();
            $('#calendar_move').scrollLeft(left+450);
        }, 1000);
    }
    getElementIndex(el: HTMLElement): number {
        return [].slice.call(el.parentElement.children).indexOf(el);
    }
    getAllElementIndex(el: HTMLElement) {
        let arrayIndex = [].slice.call(el.children);
        let index: Array<any> = [];
        arrayIndex.forEach(element => {
            var id = element.id.replace('task_', '');
            index.push(id);
        });
        return index;
    }

    replace_space(task) {
        return task.replace(" ", "");
    }
    /**
     * Open task modal popup
     */
    open(task_info, type = '') {
        if ($('.comm-box  a').hasClass("after_timer_on")) return !1;
        this.user_task_type = type;
        this.task_detail = task_info;
        this.dialogConfig.disableClose = true;
        this.dialogConfig.width = "800px";
        this.dialogConfig.data = {
            task_info: this.task_detail,
            type: this.type_rec,
            access: '',
            status_id:this.task_detail.task_status_id
        }
        let dialogRef = this.dialog.open(TaskpopupComponent, this.dialogConfig);
        dialogRef.componentInstance.change_array.subscribe(data => {
            if (this.user_task_type == 'other_user') {
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == this.task_detail.task_id) {
                            this.other_team_member_tasks[index].task_list[index1].task_id = data;
                        }
                    });
                });
            } else {
                if(this.calender_view == 'weekly'){
                    this.tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == this.task_detail.task_id) {
                                this.tasks[index].task_list[index1].task_id = data;
                            }
                        });
                    });
                }else{
                    this.monthly_data.forEach((element,index) => {
                        element.task_list.forEach((element1 ,index1)=> {
                            if (element1.task_id == this.task_detail.task_id) {
                                this.monthly_data[index].task_list[index1].task_id = data;
                            }
                        });
                    });
                }
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result.status == 'hide') {
                this.comment_data = this.task_another_info;
                this.popupdeleteoption.open();
            } else if (result.status == 'single') {
                this.comment_data = JSON.stringify(this.task_detail);
                this.delete_task('', 'occurrence');
            }else if (result.type == 'add') {
                this.insertTask(result.status, result.info);
            }  else {
                this.task_detail = result.info;
                this.comment_data = '';
                this.update_task(result.status);
            }
        });
    }
    /**
     * Get task list for rendering calendar view.
     */
    getTask() {
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id
        };
        this.taskservice.getTaskList(data1).subscribe(
            data => { 
                localStorage.setItem('status', JSON.stringify(data.info.task_status));
                this.status = JSON.parse(localStorage.getItem('status'));
                this.default_task_status = this.get_task_status_id_by_name('Ready');
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if (data.info.show_other_user_task == 1) {
                    this.other_user_task_status = true; // other users task status for hide/show
                } else {
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.nonSchedulleTask = data.nonSchedulleTask;
                this.colors = data.info.color_codes;
                this.filter_project = data.info.calender_project_id;
                this.filter_user = data.info.calender_team_user_id;
                this.filter_sorting = data.info.calender_sorting;
                this.filter_color = data.info.cal_user_color_id;
                this.filter_status = data.info.left_task_status_id;

                
                let data1 = this.filter_status+'';
                let array = data1.split(',');
                array.forEach(element => {
                    this.status_array.push(element);  
                });
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks = data.task_list;
                
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.projects = data.info.projects;
                this.team = data.info.team;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.actual_time_status = data.info.actual_time_status;
                
                if(this.filter_user == '0'){
                    this.projects.forEach(element => {
                        if(element.project_id == this.filter_project){
                            this.user_filter_calendar_name = element.project_title;
                        }
                    });
                }else{
                    if(this.filter_user == this.login_user_id){
                        this.user_filter_calendar_name = 'My Calendar';
                    }else{
                        this.team.forEach(element => {
                            if(element.user_id == this.filter_user){
                                this.user_filter_calendar_name = element.first_name+' '+element.last_name;
                            }
                        });
                    }
                }
                this.set_capacity_bar();
            },
            error => {
                console.log(error);
            });

    }

    change_view(type) {
        if (type == 'pre') {
            var date = this.week.last;
        } else {
            var date = this.week.last;
        }
        this.filter_user = this.login_user_id;

        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "type": type,
            "date": date,
            "filters": ''
        };
        this.taskservice.changeView(data1).subscribe(
            data => {
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if (data.info.show_other_user_task == 1) {
                    this.other_user_task_status = true; // other users task status for hide/show
                } else {
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();

            },
            error => {
            }
        );
    }

    change_add_icon(index) {
        let hide: any = document.querySelector("#task" + index);
        hide.style.display = "none";

        let show: any = document.querySelector("#inputtag" + index);
        show.style.display = 'block';

        let task: any = document.querySelector("#tasktag" + index);
        task.focus();
    }

    create_task(task_name, date, index, keyword) {
        let data1: any = {
            "user_id": this.login_user_id,
            "task_title": task_name,
            "scheduled_date": date,
            "task_status_id": this.default_task_status,
            "company_id": this.company_id,
            "task_allocated_user_id": this.filter_user,
            "project_id": this.filter_project
        };

        this.taskservice.add_task(data1).subscribe(
            data => {
                this.tasks.forEach(element => {
                    if (element.date == date) {
                        element.task_list.push(data.task_info);
                    }
                });
                if (keyword == 'enter') {
                    this.open(data.task_info);
                }
                let hide: any = document.querySelector("#task" + index);
                hide.style.display = "block";

                let show: any = document.querySelector("#inputtag" + index);
                show.style.display = 'none';
                this.taskclear = '';
            },
            error => {
            });
    }

    changetag(index) {
        let hide: any = document.querySelector("#task" + index);
        hide.style.display = "block";

        let show: any = document.querySelector("#inputtag" + index);
        show.style.display = 'none';
        this.taskclear = '';

    }
    /**
     * Use when click on compress/expand icon on the task widget.
     * @param index 
     * @param index2 
     * @param task_id 
     */
    save_task_pos(task_id) {
        let value: number;
        let display1: any = document.querySelector("#hide_show_" + task_id);
        let change_icon: any = document.querySelector('#chnage_icon_' + task_id);
        if (display1.style.display == "block") {
            value = 0;
            display1.style.display = "none";
            change_icon.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
        } else {
            value = 1;
            display1.style.display = "block";
            change_icon.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i>'
        }
        let data1 = {
            "task_id": task_id,
            "user_id": this.login_user_id,
            "value": value
        };
        this.taskservice.save_task_pos(data1).subscribe(data => {

            this.other_team_member_tasks.forEach((element, index) => {
                element.task_list.forEach((element1, index1) => {
                    if (element1.task_id == task_id) {
                        this.other_team_member_tasks[index].task_list[index1].task_ex_pos = value;
                    }
                });
            });

            this.tasks.forEach((element, index) => {
                element.task_list.forEach((element1, index1) => {
                    if (element1.task_id == task_id) {
                        this.tasks[index].task_list[index1].task_ex_pos = value;
                    }
                });
            });

        },
            error => {

            });

    }

    dragtask(value, ind, indexALL) {
        let id = value[1].id;
        let id1 = document.querySelector("#" + id).closest('td').id;
        let new_id = id.replace('task_', '');
        let id2: any = id1.split('_');
        let task_info: any = '';
        this.tasks.forEach((element, index) => {
            element.task_list.forEach((element1, index1) => {
                if (element1.task_id == new_id) {
                    task_info = element1;
                }
            });
        });
        let move_date: any = id2[1];
        var date = new Date(move_date).toDateString();
        let scheduled_date = this.changeFormat.transform(date);
        let data1: any = {
            "user_id": this.login_user_id,
            "task_id": new_id,
            "task_scheduled_date": scheduled_date,
            "company_id": this.company_id,
            "task_info": task_info,
            "index": indexALL
        };

        this.taskservice.dragTask(data1).subscribe(
            data => {
                this.tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == new_id) {
                            this.tasks[index].task_list.splice(index1, 1);
                        }
                    });
                    if (element.date == scheduled_date) {
                        this.tasks[index].task_list.splice((ind - 1), 0, data.task_info);
                    }
                });
            },
            error => {

            }
        );

    }

    is_completed(task_info) {
        let task_info1: any = JSON.parse(JSON.stringify(task_info));
        if (task_info1.task_status_name == 'Completed') {
            status = '0';
        } else {
            status = '1';
        }
        if(task_info1.task_category_id =='0' && task_info1.task_sub_category_id =='0' && task_info1.task_status_name !='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }
        let data1: any = {
            "task_info": task_info1,
            "user_id": this.login_user_id,
            "task_id": task_info1.task_id,
            "is_completed": status,
            "company_id": this.company_id,
            "time": ''
        };
        let dependency = {
            "task_id": task_info1.prerequisite_task_id,
            "user_id": task_info1.task_allocated_user_id,
            "company_id": this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_info1.task_id) {
                            this.other_team_member_tasks[index].task_list[index1] = data.info;
                        }
                    });
                });

                this.tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_info1.task_id) {
                            this.tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                if (task_info1.is_prerequisite_task == 1) {
                    this.taskservice.check_completed_task_dependency(dependency).subscribe(
                        data => {
                            this.tasks.forEach((element, index) => {
                                element.task_list.forEach((element1, index1) => {
                                    if (element1.task_id == task_info1.prerequisite_task_id) {
                                        this.tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                            this.other_team_member_tasks.forEach((element, index) => {
                                element.task_list.forEach((element1, index1) => {
                                    if (element1.task_id == task_info1.prerequisite_task_id) {
                                        this.other_team_member_tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.other_team_member_tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.other_team_member_tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                        }, error => {
                            console.log(error);
                        });
                }

            },
            error => {

            }
        );
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

    get_status_name_by_id(id) {
        let status: any = JSON.parse(localStorage.getItem('status'));
        let status_name = '';
        status.forEach(element => {// console.log(element);
            if (element.task_status_id == id) {
                status_name = element.task_status_name;
            }
        });
        return status_name;
    }

    update_task(form) {
        let info = form.value;
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "task_info": this.task_detail,
            "info": info,
            "start_date": this.calender_view == 'weekly'?this.week.first:this.month_start_date,
            "from": this.calender_view == 'weekly'?'calendar':'monthly'
        };

        this.taskservice.updatetask(data1).subscribe(
            data => {
                if (this.user_task_type == 'other_user') {
                    this.other_team_member_tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
                                this.other_team_member_tasks[index].task_list[index1] = data.task_info.tasks;
                            } else {
                                if (element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                } else if (element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                }
                                if (this.task_detail.frequency_type == 'one_off') {
                                    if (element1.task_id.search(this.task_detail.task_id) > 0) {
                                        this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                        this.type_rec = 'add';
                                    }
                                }
                            }
                        });

                        if (data.task_info.tasks.task_scheduled_date == element.date && this.task_detail.frequency_type == 'one_off' && this.type_rec == 'add') {
                            this.other_team_member_tasks[index].task_list.push(data.task_info.tasks);
                        }

                    });

                    if (this.task_detail.frequency_type == 'recurrence') {
                        this.other_team_member_tasks.forEach((element, index) => {
                            data.task_info.tasks.forEach((element1, index1) => {
                                if (element.date == element1.date && element1.task_list != '') {
                                    this.other_team_member_tasks[index].task_list.push(element1.task_list[0]);
                                }
                            });
                        });
                    }
                } else {
                    if(this.calender_view == 'weekly'){
                        this.tasks.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
                                    this.tasks[index].task_list[index1] = data.task_info.tasks;
                                } else {
                                    if (element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                                        this.tasks[index].task_list.splice(index1, 1);
                                    } else if (element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                                        this.tasks[index].task_list.splice(index1, 1);
                                    }
                                    if (this.task_detail.frequency_type == 'one_off') {
                                        if (element1.task_id.search(this.task_detail.task_id) > 0) {
                                            this.tasks[index].task_list.splice(index1, 1);
                                            this.type_rec = 'add';
                                        }
                                    }
                                }
                            });

                            if (data.task_info.tasks.task_scheduled_date == element.date && this.task_detail.frequency_type == 'one_off' && this.type_rec == 'add') {
                                this.tasks[index].task_list.push(data.task_info.tasks);
                            }
                        });

                        if (this.task_detail.frequency_type == 'recurrence') {
                            this.tasks.forEach((element, index) => {
                                data.task_info.tasks.forEach((element1, index1) => {
                                    if (element.date == element1.date && element1.task_list != '') {
                                        this.tasks[index].task_list.push(element1.task_list[0]);
                                    }
                                });
                            });
                        }
                        this.set_capacity_bar();
                    }else{
                        this.monthly_data.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
                                    this.monthly_data[index].task_list[index1] = data.task_info.tasks;
                                } else {
                                    if (element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                                        this.monthly_data[index].task_list.splice(index1, 1);
                                    } else if (element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                                        this.monthly_data[index].task_list.splice(index1, 1);
                                    }
                                    if (this.task_detail.frequency_type == 'one_off') {
                                        if (element1.task_id.search(this.task_detail.task_id) > 0) {
                                            this.monthly_data[index].task_list.splice(index1, 1);
                                            this.type_rec = 'add';
                                        }
                                    }
                                }
                            });
    
                            if (data.task_info.tasks.task_scheduled_date == element.date && this.task_detail.frequency_type == 'one_off' && this.type_rec == 'add') {
                                this.monthly_data[index].task_list.push(data.task_info.tasks);
                            }
                        });
    
                        if (this.task_detail.frequency_type == 'recurrence') {
                            this.monthly_data.forEach((element, index) => {
                                data.task_info.tasks.forEach((element1, index1) => {
                                    if (element.date == element1.date && element1.task_list != '') {
                                        this.monthly_data[index].task_list.push(element1.task_list[0]);
                                    }
                                });
                            });
                        }
                        this.set_monthly_view_after_update();
                    }
                }
                this.type_rec = '';
                // this.close();
            },
            error => {

            }
        );
    }

    render_project_filter(id) {
        let date = this.week.first;
        let u: any = '0';
        if (id == 'all') {
            u = this.login_user_id;
            this.user_filter_calendar_name = 'My Calendar';
        }else{
            this.projects.forEach(element => {
                if(element.project_id == id ){
                    this.user_filter_calendar_name = element.project_title;
                }
            });
        }

        let filter_array = {
            "filter_user": u,
            "filter_project": id,
            "calender_sorting": this.filter_sorting,
            "user_color": this.filter_color,
            "filter_status": this.filter_status
        };
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "type": "current",
            "date": date,
            "filters": filter_array
        };
        this.taskservice.changeView(data1).subscribe(
            data => {
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if (data.info.show_other_user_task == 1) {
                    this.other_user_task_status = true; // other users task status for hide/show
                } else {
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.filter_project = data.info.calender_project_id;
                this.filter_user = data.info.calender_team_user_id;
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();

            },
            error => {


            });
    }
    filter_calendar(id) {
        let date = this.week.first;
        if (id == 'me') {
            id = this.login_user_id;
            this.user_filter_calendar_name = 'My Calendar';
        }else{
            this.team.forEach(element => {
                if(element.user_id == id){
                    this.user_filter_calendar_name = element.first_name+' '+element.last_name;
                }
            });
        }
        let filter_array = {
            "filter_user": id,
            "filter_project": 'all',
            "calender_sorting": this.filter_sorting,
            "user_color": this.filter_color,
            "filter_status": this.filter_status
        };
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "type": "current",
            "date": date,
            "filters": filter_array
        };
        this.taskservice.changeView(data1).subscribe(
            data => {
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if (data.info.show_other_user_task == 1) {
                    this.other_user_task_status = true; // other users task status for hide/show
                } else {
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.filter_project = data.info.calender_project_id;
                this.filter_user = data.info.calender_team_user_id;
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();

            },
            error => {
            });
    }
    recurrence_close() {
        this.recurrencewindow.close();
    }
    recurrence_open(task, type) {
       this.user_task_type = type;
       this.task_detail = JSON.parse(JSON.stringify(task));
       this.task_another_info = JSON.stringify(task);    
       this.recurrencewindow.open();
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
        this.open(this.task_detail, this.user_task_type);

    }

    change_weekly_calendar_view_by_date(event: MatDatepickerInputEvent<Date>) {
        
            let date = this.changeFormat.transform(event.value);
            let data1: any = {
                "user_id": this.login_user_id,
                "company_id": this.company_id,
                "type": 'pre',
                "date": date,
                "filters": '',
            };
            this.taskservice.changeView(data1).subscribe(
                data => {
                    this.capacity.length = 0;
                    this.date_format = data.info.date_format;
                    this.today_date = data.info.today;
                    this.tasks = data.task_list;
                    this.week.first = data.info.start_date;
                    this.week.last = data.info.end_date;
                    this.date_array = data.info.date_arr;
                    this.user_capacity = data.info.capacity;
                    this.set_capacity_bar();
                    this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                    if (data.info.show_other_user_task == 1) {
                        this.other_user_task_status = true; // other users task status for hide/show
                    } else {
                        this.other_user_task_status = false; // other users task status for hide/show
                    }

                },
                error => {
                }
            );
        
    }

    change_priority(task_id, priority, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "task_priority": priority,
            "task_info": task_info
        };
        this.taskservice.change_priority(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if(task_info.task_scheduled_date == element.date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });

                    this.tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }

            },
            error => {
            }
        );
    }

    add_watch_list(task_id, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "watch_list": 1,
            "task_info": task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });

                    this.tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }

            },
            error => {
            }
        );
    }
    remove_watch_list(task_id, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "watch_list": 0,
            "task_info": task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });

                    this.tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }

            },
            error => {
            }
        );
    }

    right_click_change_status(task_id, status_id, task_info) {
        let status_name = this.get_status_name_by_id(status_id);
        
        if(task_info.task_category_id =='0' && task_info.task_sub_category_id =='0' && status_name =='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "status_id": status_id,
            "task_info": task_info,
            "user_id": this.login_user_id
        };
        this.taskservice.change_status(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });

                    this.tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }

            },
            error => {
            }
        );
    }

    copy_task(task_id, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "task_info": task_info,
            "user_id": this.login_user_id
        };
        this.taskservice.copy_task(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if (element.date == data.info.task_scheduled_date && data.info.task_allocated_user_id != this.login_user_id) {
                            this.other_team_member_tasks[index].task_list.push(data.info);
                        }
                    });

                    this.tasks.forEach((element, index) => {
                        if (element.date == data.info.task_scheduled_date && data.info.task_allocated_user_id == this.login_user_id) {
                            this.tasks[index].task_list.push(data.info);
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if (element.date == data.info.task_scheduled_date && data.info.task_allocated_user_id == this.login_user_id) {
                            this.monthly_data[index].task_list.push(data.info);
                        }
                    });
                    this.set_monthly_view_after_update();
                }

            },
            error => {
            }
        );
    }

    change_task_color(task_id, color_id, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "task_info": task_info,
            "user_id": this.login_user_id,
            "color_id": color_id
        }; 
        this.taskservice.change_color(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.tasks.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == task_info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }
            },
            error => {
            }
        );
    }

    rightclick_comment(task_id, task_data) {
        this.comment_data = JSON.stringify(task_data);
        this.rightclickcomment.open();
    }
    close_rightclick_comment() {
        this.comment_data = '';
        this.rightclickcomment.close();
    }

    save_comment(form) {
        let info = JSON.parse(form.info.value);
        let comment = form.right_task_comment.value;
        if (comment != '') {
            let data1: any = {
                "company_id": this.company_id,
                "task_info": info,
                "user_id": this.login_user_id,
                "comment": comment
            };
            this.taskservice.right_click_comment(data1).subscribe(
                data => {

                    this.other_team_member_tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == info.task_id) {
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });

                    this.tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == info.task_id) {
                                this.tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });

                    form.right_task_comment.value = '';
                    this.close_rightclick_comment();
                },
                error => {
                }
            );
        } else {
            this.toastr.error('Please enter comment.', '', { positionClass: 'toast-top-center' });
        }
    }

    right_click_delete(task_data) {
        this.comment_data = JSON.stringify(task_data);
        this.rightclickdelete.open();
    }
    close_right_click_delete() {
        this.comment_data = '';
        this.rightclickdelete.close();
    }

    close_taskpopup_option() {
        this.comment_data = '';
        this.task_another_info = '';
        this.popupdeleteoption.close();
    }
    delete_task(task, type) {
        if (type == 'single') {
            let data1: any = {
                "company_id": this.company_id,
                "task_info": task,
                "user_id": this.login_user_id,
                "type": type
            };
            this.taskservice.delete_task(data1).subscribe(
                data => {
                    if(this.calender_view == 'weekly'){
                        this.other_team_member_tasks.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task.task_id) {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                }
                            });
                        });

                        this.tasks.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task.task_id) {
                                    this.tasks[index].task_list.splice(index1, 1);
                                }
                            });
                        });
                        this.set_capacity_bar();
                    }else{
                        this.monthly_data.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == task.task_id) {
                                    this.monthly_data[index].task_list.splice(index1, 1);
                                }
                            });
                        });
                        this.set_monthly_view_after_update();
                    }
                },
                error => {
                }
            );
        } else {
            let info:any = '';
            info = JSON.parse(this.comment_data);
            
            let data1: any = {
                "company_id": this.company_id,
                "task_info": info,
                "user_id": this.login_user_id,
                "type": type
            };
            this.taskservice.delete_task(data1).subscribe(
                data => {
                    if(this.calender_view == 'weekly'){
                        this.other_team_member_tasks.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id && type == 'occurrence') {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'series') {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date) {
                                    this.other_team_member_tasks[index].task_list.splice(index1, 1);
                                }
                            });
                        });
                        this.tasks.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id && type == 'occurrence') {
                                    this.tasks[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'series') {
                                    this.tasks[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date) {
                                    this.tasks[index].task_list.splice(index1, 1);
                                }
                            });
                        });
                    }else{
                        this.monthly_data.forEach((element, index) => {
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id && type == 'occurrence') {
                                    this.monthly_data[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'series') {
                                    this.monthly_data[index].task_list.splice(index1, 1);
                                }
                                if ((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date) {
                                    this.monthly_data[index].task_list.splice(index1, 1);
                                }
                            });
                        });
                        this.set_monthly_view_after_update();
                    }
                    this.close_right_click_delete();
                    this.close_taskpopup_option();
                    this.comment_data = '';
                    this.task_another_info = '';
                },
                error => {
                }
            );
        }
    }

    update_due_date(event, info) {
        
        let new_date = this.changeFormat.transform(event);
        let data1: any = {
            "company_id": this.company_id,
            "task_info": info,
            "user_id": this.login_user_id,
            "type": 'due_date',
            'date': new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        if(element.date == info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id) {
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.tasks.forEach((element, index) => {
                        if(element.date == info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id) {
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        if(element.date == info.task_scheduled_date){
                            element.task_list.forEach((element1, index1) => {
                                if (element1.task_id == info.task_id) {
                                    this.monthly_data[index].task_list[index1] = data.info;
                                }
                            });
                        }
                    });
                    this.set_monthly_view_after_update();
                }
            },
            error => {
            }
        );
    }

    update_scheduled_date(event, info) {
        
        let new_date = this.changeFormat.transform(event);
        let data1: any = {
            "company_id": this.company_id,
            "task_info": info,
            "user_id": this.login_user_id,
            "type": 'scheduled_date',
            'date': new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data => {
                if(this.calender_view == 'weekly'){
                    this.other_team_member_tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == info.task_id) {
                                this.other_team_member_tasks[index].task_list.splice(index1, 1);
                            }
                        });
                        if (element.date == data.info.task_scheduled_date) {
                            this.other_team_member_tasks[index].task_list.unshift(data.info);
                        }
                    });
                    this.tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == info.task_id) {
                                this.tasks[index].task_list.splice(index1, 1);
                            }
                        });
                        if (element.date == data.info.task_scheduled_date) {
                            this.tasks[index].task_list.unshift(data.info);
                        }
                    });
                }else{
                    this.monthly_data.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == info.task_id) {
                                this.monthly_data[index].task_list.splice(index1, 1);
                            }
                        });
                        if (element.date == data.info.task_scheduled_date) {
                            this.monthly_data[index].task_list.unshift(data.info);
                        }
                    });
                    this.set_monthly_view_after_update();
                }
            },
            error => {
            }
        );
    }

    /***********function for sort calerder value******************************* */
    sortcalenderfilter(filter_status) {
        let date = this.week.first;
        this.filter_status = filter_status.join(',');
        let filter_array = {
            "filter_user": this.filter_user,
            "filter_project": this.filter_project,
            "calender_sorting": this.filter_sorting,
            "user_color": this.filter_color,
            "filter_status": this.filter_status
        };
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "type": "current",
            "date": date,
            "filters": filter_array
        };
        this.taskservice.changeView(data1).subscribe(
            data => {
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if (data.info.show_other_user_task == 1) {
                    this.other_user_task_status = true; // other users task status for hide/show
                } else {
                    this.other_user_task_status = false; // other users task status for hide/show
                }

            },
            error => {


            });

    }

    /**
     * Complete Task steps from task widget on calendaview
     */

    completed_step(task_detail, step_title, value) {
        if (value) {
            status = '1';
        } else {
            status = '0';
        }
        let task_info1 = {
            "info": task_detail,
            "is_completed": status,
            "step_title": step_title
        }
        this.taskservice.complete_step(task_info1).subscribe(data => {
            this.other_team_member_tasks.forEach((element, index) => {
                element.task_list.forEach((element1, index1) => {
                    if (element1.task_id == task_detail.task_id) {
                        this.other_team_member_tasks[index].task_list[index1] = data.info;
                    }
                });
            });
            this.tasks.forEach((element, index) => {
                element.task_list.forEach((element1, index1) => {
                    if (element1.task_id == task_detail.task_id) {
                        this.tasks[index].task_list[index1] = data.info;
                    }
                });
            });
        },
            error => {

            });
    }
    showbacklogtaskpopup() {
        let modal: any = document.querySelector('.taskpopup2').closest('.modal-dialog');
        modal.style.width = '800px';
        this.showbacklogtask.open();
    }
    closebacklogpopup() {
        this.showbacklogtask.close();
    }
    schedulledtaskdata(date, id) {
        var firstday = new Date(date).toDateString();
        let date1 = new Date(firstday).getFullYear() + "-" + ((new Date(firstday).getMonth() + 1).toString().
            length == 1 ? ("0" + (new Date(firstday).getMonth() + 1)) : (new Date(firstday).getMonth() + 1))
            + "-" + (new Date(firstday).getDate().toString().length == 1 ? ("0" + new Date(firstday).getDate())
                : new Date(firstday).getDate());
        let backlog = {
            task_id: id,
            scheduled_date: date1
        };
        if (this.backlog_array) {
            if (this.backlog_array.find(x => x.task_id === id)) {
                let itemIndex = this.backlog_array.findIndex(item => item.task_id == id);
                this.backlog_array[itemIndex] = backlog;
            }
            else {
                this.backlog_array.push(backlog);
            }
        }

    }
    submitnonscheduletask() {
        let data1: any = {
            "company_id": this.company_id,
            "user_id": this.login_user_id,
            "data": this.backlog_array
        };
        if (this.backlog_array.length > 0) {
            this.taskservice.update_backlog_task(data1).subscribe(
                data => {
                    this.tasks.forEach((element1, index1) => {
                        data.info.forEach((element2, index2) => {
                            if (element1.date == element2.task_scheduled_date) {
                                this.tasks[index1].task_list.push(element2);
                            }
                        });

                    });
                    this.nonSchedulleTask.forEach((element3, index) => {
                        this.backlog_array.forEach(element4 => {
                            if (element3.task_id == element4.task_id) {
                                this.nonSchedulleTask.splice(index, 1);
                            }
                        });
                    });
                    this.backlog_array.length = 0;
                    this.closebacklogpopup();
                },
                error => {
                }
            );
        }

    }

    set_capacity_bar() {
        this.capacity.length = 0;
        let date_arr = this.date_array;
        let capacity = this.user_capacity;
        date_arr.forEach(element => {
            var estimate_time = 0;
            var spent_time = 0;
            this.tasks.forEach(element1 => {
                if (element == element1.date) {
                    element1.task_list.forEach(element2 => {
                        estimate_time += parseInt(element2.task_time_estimate);
                        spent_time += parseInt(element2.task_time_spent);
                    });
                }
            });
            var d = new Date(element);
            var dayName = d.toString().split(' ')[0];
            let cap = 0;
            if (dayName == 'Mon') {
                cap = capacity.MON_hours;
            } else if (dayName == 'Tue') {
                cap = capacity.TUE_hours;
            } else if (dayName == 'Wed') {
                cap = capacity.WED_hours;
            } else if (dayName == 'Thu') {
                cap = capacity.THU_hours;
            } else if (dayName == 'Fri') {
                cap = capacity.FRI_hours;
            } else if (dayName == 'Sat') {
                cap = capacity.SAT_hours;
            } else if (dayName == 'Sun') {
                cap = capacity.SUN_hours;
            }
            if (cap > estimate_time) {
                var estcolor = (estimate_time * 100) / cap;
                if (estimate_time != 0) {
                    var spentcolor = (spent_time * 100) / estimate_time;
                } else {
                    var spentcolor = (spent_time * 100) / cap;
                }
            } else {
                var spentcolor = (spent_time * 100) / estimate_time;
                var capColor = (cap * 100) / estimate_time;
            }
            var array = { "estimate_time": estimate_time, "spent_time": spent_time, "capacity": cap, "spentcolor": spentcolor, "capColor": capColor, "estcolor": estcolor,'dayname':dayName };
            this.capacity.push(array);

        });

    }
    /**
     * Open modal popup for getting task actual time
     */
    open_actual_time_popup(data) {
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
    close_actual_time_popup(save = '') {
        if (save == '') {
            let checkbox: any = document.querySelectorAll("#is_completed_" + this.comment_data.task_id);
            checkbox[0].checked = false;
        }
        this.comment_data = '';
        this.on_complete_actual_time = 0;
        this.taskactualtime.close();
    }
    /**
     * Check time validation
     */
    change_actual_time(data): void {
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
                this.on_complete_actual_time = hour * 60;
                data.task_actual_time.value = this.time.transform(hour * 60);
            } else if (length == 3 || length == 4) {
                hour = (value / 100);
                hour = parseInt(hour)
                minute = (value - (parseInt(hour) * 100));
                if (minute > 59) {
                    hour++;
                    minute = minute - 60;
                }
                var total_time = hour * 60 + minute;
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
    save_actual_time(from) {
        let task_info1 = this.comment_data;
        let data1: any = {
            "task_info": task_info1,
            "user_id": this.login_user_id,
            "task_id": task_info1.task_id,
            "is_completed": 1,
            "company_id": this.company_id,
            'time': this.on_complete_actual_time
        };
        let dependency = {
            "task_id": task_info1.prerequisite_task_id,
            "user_id": task_info1.task_allocated_user_id,
            "company_id": this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_info1.task_id) {
                            this.other_team_member_tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                this.tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_info1.task_id) {
                            this.tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                if (task_info1.is_prerequisite_task == 1) {
                    this.taskservice.check_completed_task_dependency(dependency).subscribe(
                        data => {
                            this.tasks.forEach((element, index) => {
                                element.task_list.forEach((element1, index1) => {
                                    if (element1.task_id == task_info1.prerequisite_task_id) {
                                        this.tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                            this.other_team_member_tasks.forEach((element, index) => {
                                element.task_list.forEach((element1, index1) => {
                                    if (element1.task_id == task_info1.prerequisite_task_id) {
                                        this.other_team_member_tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.other_team_member_tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.other_team_member_tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                        }, error => {
                            console.log(error);
                        });
                }
                this.close_actual_time_popup('close');
                this.set_capacity_bar();
                from.task_actual_time.value = '';
            },
            error => {

            }
        );
    }
    /**
     * Update status for showing other users task on calendar.
     * @param param status
     */
    hidden_other_user_task(param) {
        this.other_user_task_status = param;
        let status: number;
        if (param == true) {
            status = 1;
        } else {
            status = 0;
        }
        let detail = {
            "user_id": this.login_user_id,
            "value": status
        };
        this.taskservice.status_show_other_users_task(detail).subscribe(data => {

        }, error => {
            console.log(error);
        })
    }

    save_task_for_timer(b, c, d, e, f) {
        if ($("#task_" + b).hasClass("before_timer")) return !1;
        var g = $("#timer_task_id").val();
        if (g) {
            var h = $("#or_color_" + g).val();
            $("#task_" + g).css("border", "1px solid " + h)
        }
        if ("1" != e) {
            let task_info: any = '';
            this.tasks.forEach(element => {
                element.task_list.forEach((element1, index1) => {
                    if (element1.task_id == b) {
                        task_info = element1;
                    }
                })
            });
            $.ajax({
                type: "post",
                url: environment.API_url + "/calender/save_task",
                data: {
                    task_info: JSON.stringify(task_info),
                    task_id: b,
                    user_id: this.login_user_id,
                    company_id: this.company_id
                },
                success: (info) => {
                    var data = info.data;
                    this.tasks.forEach(element => {
                        element.task_list.forEach((element1, index1) => {
                            if (element1.task_id == b) {
                                element.task_list[index1] = data;
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
        $("#task_com_status").val(f), $(".full_task div").addClass("before_timer"), $(".comm-box a").removeClass("after_timer_on"),
            Observable.timer(2e3).subscribe(x => {
                this.loginservice.update_timer_task(c);
            });

    }

    chk_task_recurrence(task_id) {
        if (task_id.indexOf("child") != -1) {
            return 0;
        } else {
            return 1;
        }
    }

    working_day(data) {
        let info = JSON.parse(JSON.stringify(data));
        let wd = '';
        info.forEach(element => {
            if (element.wd) {
                wd = element.wd
            }
        });
        return wd;
    }
    string_length(project_title, title) {
        let value = '';
        if (project_title != null) {
            value = project_title + ' - ' + title;
        } else {
            value = title
        }
        let length = value.length;
        let name = value;
        if (length > 20) {
            name = value.substring(0, 20) + '...';
        }
        return name;
    }
    /**
     * Chnage monthly calendar view
     * @param view 
     */
    change_calendar_view(view) {
        if(view == 'monthly'){
            let info = {
                user_id: this.login_user_id,
                company_id: this.company_id
            }
            this.taskservice.monthly_calendar_data(info).subscribe(
                data => {
                    this.viewDate = new Date(data.month_start_date);
                    this.month_start_date = data.month_start_date;
                    let filters = data.show_calendar_filter;
                    if(filters){
                        if(filters.capacity ==1){
                            this.calendar_capacity = true
                        }else{
                            this.calendar_capacity = false
                        }
                        if(filters.summary == 2){
                            this.calendar_summary = true;
                        }else{
                            this.calendar_summary = false;
                        }
                        if(filters.task == 3){
                            this.calendar_task = true;
                        }else{
                            this.calendar_task = false;
                        }
                    }
                    this.team = data.team;
                    this.monthly_data = data.tasks;
                    this.set_monthly_view_after_update();
                    this.calender_view = view;
                    
                }
            )
        }else{
            let data1: any = {
                "user_id": this.login_user_id,
                "company_id": this.company_id,
                "type": "current",
                "date": this.week.first,
                "filters": ''
            };
            this.taskservice.changeView(data1).subscribe(
                data => {
                    this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                    if (data.info.show_other_user_task == 1) {
                        this.other_user_task_status = true; // other users task status for hide/show
                    } else {
                        this.other_user_task_status = false; // other users task status for hide/show
                    }
                    this.filter_project = data.info.calender_project_id;
                    this.filter_user = data.info.calender_team_user_id;
                    this.capacity.length = 0;
                    this.date_format = data.info.date_format;
                    this.today_date = data.info.today;
                    this.tasks = data.task_list;
                    this.team = data.info.team;
                    this.week.first = data.info.start_date;
                    this.week.last = data.info.end_date;
                    this.date_array = data.info.date_arr;
                    this.user_capacity = data.info.capacity;
                    this.set_capacity_bar();
    
                },
                error => {
                });
            this.calender_view = view;
        }
    }
    /**
     * Return monthly calendar capacity
     * @param date 
     */
    return_monthly_calendar_capacity(date) {
        var d = new Date(date);
        var dayName = d.toString().split(' ')[0];
        let cap = 0;
        let capacity = this.user_capacity;
        if (dayName == 'Mon') {
            cap = capacity.MON_hours;
        } else if (dayName == 'Tue') {
            cap = capacity.TUE_hours;
        } else if (dayName == 'Wed') {
            cap = capacity.WED_hours;
        } else if (dayName == 'Thu') {
            cap = capacity.THU_hours;
        } else if (dayName == 'Fri') {
            cap = capacity.FRI_hours;
        } else if (dayName == 'Sat') {
            cap = capacity.SAT_hours;
        } else if (dayName == 'Sun') {
            cap = capacity.SUN_hours;
        }
        return cap;
    }

    /**
     * Return total allcoation time for monthly calendar day wise
     * @param date 
     */
    return_total_allocateion(date) {
        let new_date = this.changeFormat.transform(date);
        let total_estimation = 0;
        this.monthly_data.forEach(element => {
            if (element.date == new_date) {
                element.task_list.forEach(element1 => {
                    total_estimation = Number(total_estimation) + Number(element1.task_time_estimate);
                });
            }
        }
        )
        return total_estimation;
    }
    /**
     * Return completed task count monthly view
     * @param date 
     */
    return_total_completed_task_count(date) {
        let new_date = this.changeFormat.transform(date);
        let completed = 0;

        this.monthly_data.forEach(element => {
            if (element.date == new_date) {
                element.task_list.forEach(element1 => {
                    if (element1.task_status_name == 'Completed') {
                        completed = Number(completed) + Number(1);
                    }
                });
            }
        }
        )
        return completed;
    }
    /**
     * Return scheduled task count on monthly view
     * @param date Re
     */
    return_total_schuduled_task_count(date) {
        let new_date = this.changeFormat.transform(date);
        let scheduled = 0;

        this.monthly_data.forEach(element => {
            if (element.date == new_date) {
                element.task_list.forEach(element1 => {
                    scheduled = Number(scheduled) + Number(1);

                });
            }
        }
        )
        return scheduled;
    }
    /**
     * Return du & overdue task count on monthly view.
     * @param date 
     * @param type 
     */
    return_total_due_task_count(date, type) {
        let new_date = this.changeFormat.transform(date);
        let due = 0;
        let today = this.changeFormat.transform(new Date());
        this.monthly_data.forEach(element => {
            if (element.date == new_date) {
                element.task_list.forEach(element1 => {
                    if (type == 'due' && element1.task_due_date == new_date && element1.task_status_name == 'Completed') {
                        due = Number(due) + Number(1);
                    } else if (type == 'overdue' && element1.task_due_date < today && element1.task_status_name != 'Completed') {
                        due = Number(due) + Number(1);
                    }
                });
            }
        }
        )
        return due;
    }
    /**
     * Hide/show monthly calendar data
     * @param type 
     * @param value 
     */
    hide_show_calendar_data(type,value){
        if(type == 'capacity'){
            this.calendar_capacity = value;
        }else if(type == 'summary'){
            this.calendar_summary = value
        }else{
            this.calendar_task = value
        }
        let info ={
            user_id:this.login_user_id,
            info:{
                capacity:this.calendar_capacity== true?1:0,
                summary:this.calendar_summary== true?2:0,
                task:this.calendar_task== true?3:0
            }
        }
        this.taskservice.update_monthly_calendar_top_filter(info).subscribe();
    }
    /**
     * On monthly view change month view.
     * @param type 
     */
    change_monthly_view(type){
        let info = {
            user_id:this.login_user_id,
            company_id:this.company_id,
            type:type,
            date:this.month_start_date,
            filters:''
        }
        this.taskservice.change_monthly_view(info).subscribe(
            data=>{
                this.viewDate = new Date(data.month_start_date);
                this.month_start_date = data.month_start_date;
                    let filters = data.show_calendar_filter;
                    if(filters){
                        if(filters.capacity ==1){
                            this.calendar_capacity = true
                        }else{
                            this.calendar_capacity = false
                        }
                        if(filters.summary == 2){
                            this.calendar_summary = true;
                        }else{
                            this.calendar_summary = false;
                        }
                        if(filters.task == 3){
                            this.calendar_task = true;
                        }else{
                            this.calendar_task = false;
                        }
                    }
                    this.monthly_data.length =0;
                    this.monthly_data = data.tasks;
                    this.set_monthly_view_after_update();
            }
        )
    }
    /**
     * After update monthly view data re-render monthly view
     */
    set_monthly_view_after_update(){
        // this.events.length = 0;
        let event:any = [];
        this.monthly_data.forEach(element => {
            element.task_list.forEach(element1 => {
                let info = {
                    start: new Date(element1.task_scheduled_date),
                    title: element1.task_title,
                    wd: element.working_day,
                    task_allocated_time: element1.task_time_estimate,
                    private: element1.locked_due_date,
                    task_id: element1.task_id,
                    project_title: element1.project_title,
                    color_code: element1.color_code,
                    outside_color_code: element1.outside_color_code,
                    task_priority: element1.task_priority,
                    frequency_type:element1.frequency_type,
                    info: (element1),
                }
                event.push(info);
            });
            if (element.task_list == '') {
                let info = {
                    start: new Date(element.date),
                    title: '',
                    wd: element.working_day,
                    task_allocated_time: '',
                    private: '',
                    task_id: '',
                    project_title: '',
                    color_code: '',
                    outside_color_code: '',
                    task_priority:'',
                }
                event.push(info);
            }
        });
        this.events = event;
       
    }
    /**
     * Initialize new task creation data
     */
    new_task(date) {
        let logininfo = JSON.parse(localStorage.getItem('info'));
        this.new_task_initial_data = this.taskservice.taskPopup;
        this.new_task_initial_data.task_status_id = this.get_task_status_id_by_name('Ready');
        this.new_task_initial_data.task_allocated_user_id = this.login_user_id;
        this.new_task_initial_data.task_company_id = this.company_id;
        this.new_task_initial_data.owner_name = logininfo.username;
        this.new_task_initial_data.task_owner_id = this.login_user_id;
        this.new_task_initial_data.completed_depencencies = 0;
        this.new_task_initial_data.task_scheduled_date = this.changeFormat.transform(date);
        this.new_task_initial_data.task_due_date = this.changeFormat.transform(date);
        this.new_task_initial_data.start_on_date = this.changeFormat.transform(date);
        this.open(this.new_task_initial_data,'');
    }
    /**
     * Create new task from monthly calendar view
     * @param data task_info
     * @param info 
     */
    insertTask(data, info) {
        this.taskservice.insert_task_data(data.value, info,'monthly').subscribe(
            data => {  
                if(info.frequency_type == 'one_off'){
                    this.monthly_data.forEach((element,index) => {
                        if(element.date == data.info.task_scheduled_date){
                            this.monthly_data[index].task_list.push(data.info);
                        }
                    });   
                }else{
                    data.info.forEach(element1 => {
                        this.monthly_data.forEach((element,index) => {
                            if(element.date == element1.date && element1.task_list !=''){
                                this.monthly_data[index].task_list.push(element1.task_list[0]);
                            }
                        });
                    });
                }
                this.set_monthly_view_after_update();
                // this.tasks.push(data.info);
        });
    }


    checkstatus(task_status_id){
        let data = this.filter_status+'';
        let new_array= data.split(',');
        let status = false;
        new_array.forEach(element => { 
            if(element == task_status_id){
                status = true;
            }
        });
        return status;
     }
    
     allchecked(check){
        let checked:any = document.querySelectorAll('.newcheckbox_task1');
        if(check){
            this.status_array.push('all');
            for (var div of checked) {
                div.checked = true;
                var i = this.status_array.indexOf(div.value);
                if(i == -1){
                this.status_array.push(div.value);
                }
            }
            this.status_all = 0;
        }else{
            this.status_array.splice(0,1);
            for (var div of checked) {
                div.checked = false;
                var index = this.status_array.indexOf(div.value); 
                this.status_array.splice(index,1);
            }
            this.status_all = 1;
        }
        if(this.calender_view == 'monthly'){
            this.monthly_filters();
         }else{
            this.sortcalenderfilter(this.status_array);
         }
     }

     checkedOtherStatus(status_id,check){
        let checked:any = document.querySelector('.newcheckbox_task2');
        var index = this.status_array.indexOf("all");
        if(index == 0){ 
            this.status_array.splice(index,1);
            checked.checked = 0;
        }

        if(check){
            var index = this.status_array.indexOf(status_id); 
                if(index == -1){
                    this.status_array.push(status_id);
                }
        }else{
            var index = this.status_array.indexOf(status_id); 
                this.status_array.splice(index,1);
        }
        this.status_all = 1;
        if(this.calender_view == 'monthly'){
            this.monthly_filters();
         }else{
            this.sortcalenderfilter(this.status_array);
         }
     }

    footerfilter(){
         if(this.calender_view == 'monthly'){
            this.monthly_filters();
         }else{
            this.sortcalenderfilter(this.status_array);
         }
    }

    monthly_filters(){
        this.filter_status = this.status_array.join(',');
        if(this.filter_project == 'all'){
            this.filter_user = this.login_user_id;
        }
            let filter_array = {
                "filter_user": this.filter_user,
                "filter_project": this.filter_project,
                "calender_sorting": this.filter_sorting,
                "user_color": this.filter_color,
                "filter_status": this.filter_status
            };
            let data1: any = {
                "user_id": this.login_user_id,
                "company_id": this.company_id,
                "type": "current",
                "date": this.month_start_date,
                "filters": filter_array
            }; 
            this.taskservice.change_monthly_view(data1).subscribe(
                data=>{
                    this.viewDate = new Date(data.month_start_date);
                    this.month_start_date = data.month_start_date;
                    this.monthly_data.length =0;
                    this.monthly_data = data.tasks;
                    this.team = data.team;
                    this.set_monthly_view_after_update();
                }
            )
    }

    monthly_drag_task(value, ind, indexALL){
        let task_id = value[1].id.replace('task_', '');
        let task_info: any = '';
        this.monthly_data.forEach(element => {
            element.task_list.forEach(element1 => {
                if (element1.task_id == task_id) {
                    task_info = element1;
                }
            });
        });
        let move_date: any =  value[2].id.replace('date_', '');
        var date = new Date(move_date).toDateString();
        let scheduled_date = this.changeFormat.transform(date);
        let data1: any = {
            "user_id": this.login_user_id,
            "task_id": task_id,
            "task_scheduled_date": scheduled_date,
            "company_id": this.company_id,
            "task_info": task_info,
            "index": indexALL
        };

        this.taskservice.dragTask(data1).subscribe(
            data => {
                this.monthly_data.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_id) {
                            this.monthly_data[index].task_list.splice(index1, 1);
                        }
                    });
                    if (element.date == scheduled_date) {
                        this.monthly_data[index].task_list.splice((ind - 1), 0, data.task_info);
                    }
                });
                this.set_monthly_view_after_update();
            },
            error => {

            }
        );
    }

    change_monthly_calendar_view_by_date(event: MatDatepickerInputEvent<Date>){ 
        let info = {
            user_id:this.login_user_id,
            company_id:this.company_id,
            type:'',
            date:this.changeFormat.transform(event.value),
            filters:''
        }
        this.taskservice.change_monthly_view(info).subscribe(
            data=>{
                this.viewDate = new Date(data.month_start_date);
                this.month_start_date = data.month_start_date;
                    let filters = data.show_calendar_filter;
                    if(filters){
                        if(filters.capacity ==1){
                            this.calendar_capacity = true
                        }else{
                            this.calendar_capacity = false
                        }
                        if(filters.summary == 2){
                            this.calendar_summary = true;
                        }else{
                            this.calendar_summary = false;
                        }
                        if(filters.task == 3){
                            this.calendar_task = true;
                        }else{
                            this.calendar_task = false;
                        }
                    }
                    this.monthly_data.length =0;
                    this.monthly_data = data.tasks;
                    this.set_monthly_view_after_update();
            }
        )
    }

    check_wek_day(date){
        var d = new Date(date);
        var dayName = d.toString().split(' ')[0];
        if(dayName == 'Mon'){
            return true;
        }else{
            return false;
        }
    }
}
