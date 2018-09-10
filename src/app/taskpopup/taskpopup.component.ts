import { Component, OnInit, ViewChild, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { ElementRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { LoginService } from '../login/login.service';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeConvert } from '../pipes/timeconvter.pipe';
import { ChangeFormat } from '../pipes/changeformat.pipe';
@Component({
    selector: 'popup',
    templateUrl: './taskpopup.component.html',
    styleUrls: ['./taskpopup.component.css', '../todo/todo.component.css'],
    providers: [TimeConvert, MatDialogConfig, ChangeFormat]
})
export class TaskpopupComponent {
    company_fields_status: any = '';
    start_date: any;
    end_date: any;
    date_format: any = '';
    today_date: any = '';
    task_detail: any = '';
    status: any = '';
    projects = '';
    team = '';
    login_user_id: any = ''
    task_other_info: any = '';
    recurrStatus: any = '';
    company_id: any = '';
    Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/';
    working_days: Array<any> = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    another_task_info: any = '';
    add_step: boolean;
    addcomment: boolean;
    number = (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);
    task_due_date: any = '';
    dependent_task_due_date: any = new FormControl(new Date());
    default_task_status: any = '';
    dependency: any = '';
    task_start_on_date: any = new FormControl(new Date());
    task_end_by_date: any = new FormControl(new Date());
    weekly_day: Array<any> = [];
    type_rec: any = '';
    steps: boolean;
    dependencies: boolean;
    files: boolean;
    history: boolean;
    colors: any = '';
    comment_data: any = '';
    estimate_time: any = '';
    spent_time: any = '';
    update_task_comment: any = '';
    updatecomment: boolean = false;
    task_list_result: any = '';
    task_division: Array<any> = [];
    task_department: Array<any> = [];
    task_skill: Array<any> = [];
    access: any = ""; // customer access
    task_allocated_users: Array<any> = [];
    options: any = {
        revertOnSpill: true
    };
    config: any = { // Change this to your upload POST address:  
        url: 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/',
        method: 'post',
        params: {
            key: "upload/task_project_files/task_" + this.number + "_${filename}",
            AWSAccessKeyId: "AKIAIKLUOLUR4CJ4WSTA",
            acl: "public-read",
            success_action_status: "201",
            policy: "eyJleHBpcmF0aW9uIjoiMjAxOC0wNC0wNlQxODowNDozNFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJzdGF0aWMuc2NoZWR1bGxvLmNvbSJ9LHsiYWNsIjoicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJGtleSIsInVwbG9hZFwvdGFza19wcm9qZWN0X2ZpbGVzXC8iXSx7InN1Y2Nlc3NfYWN0aW9uX3N0YXR1cyI6IjIwMSJ9LFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsNDE5NDMwNF1dfQ==",
            signature: "FdcNFS4UpZHITJ+cJLcBnnaW0Z0="
        },
        clickable: true,
        maxFilesize: "5MB",
        previewTemplate: "<span></span>",
        autoReset: 1000
    };
    change_array = new EventEmitter();
    is_authenticated: boolean = false;
    last_status_id:number;

    show_link_existing:any = false;
    hiden_comment_id:any ='';
    constructor(public loginservice: LoginService, private changeFormat: ChangeFormat, private time: TimeConvert, public taskservice: TaskService, public toastr: ToastsManager, vcr: ViewContainerRef, public router: Router, private DragulaService: DragulaService, public ElementRef: ElementRef, private dialogRef: MatDialogRef<TaskpopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
        // this.loginservice.isAuthenticated.take(1).subscribe(authenticated=>{
        //     this.is_authenticated = authenticated;
        // })
        // if(!this.is_authenticated){
        //     this.router.navigateByUrl('');
        // }else{
        //         this.loginservice.currentUser.subscribe(data=>{
        //             this.login_user_id = data.user_id;
        //             this.company_id = data.company_id;
        //         })
        // }
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.type_rec = data.type;
        this.last_status_id = data.status_id; 
        this.access = data.access;
        this.show(data.task_info);
        this.toastr.setRootViewContainerRef(vcr);
        DragulaService.drop.subscribe((value) => {
            const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
            let allIndex = this.getAllElementIndex(bagTarget);
            //this.dragtask(value,newIndex,allIndex);
        });
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
    show(task_info) {
        
        this.steps = false;
        this.dependencies = false;
        this.files = false;
        this.history = false;
        this.addcomment = false;
        this.task_detail = task_info;
        this.another_task_info = this.task_detail;
        this.task_due_date = new FormControl(new Date(this.task_detail.task_due_date));
        this.dependent_task_due_date = new FormControl(new Date());
        this.weekly_day.length = 0;
        this.estimate_time = this.time.transform(this.task_detail.task_time_estimate);
        this.spent_time = this.time.transform(this.task_detail.task_time_spent);
        if (this.task_detail.frequency_type == 'recurrence') {
            this.recurrStatus = false;
            this.task_start_on_date = new FormControl(new Date(this.task_detail.start_on_date));
            this.task_end_by_date = new FormControl(new Date(this.task_detail.end_by_date));
            if (this.task_detail.recurrence_type == 2) {
                let week = this.task_detail.Weekly_week_day.split(',');
                week.forEach(element => {
                    this.weekly_day.push(element);
                });
            }
        } else {
            this.recurrStatus = true;
            if (this.task_detail.task_scheduled_date == '0000-00-00') {
                this.task_start_on_date = new FormControl(new Date());
                this.task_end_by_date = new FormControl(new Date());
                this.task_detail.start_on_date = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1).toString().length == 1 ? ("0" + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1)) + "-" + (new Date().getDate().toString().length == 1 ? ("0" + new Date().getDate()) : new Date().getDate());
                this.task_detail.end_by_date = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1).toString().length == 1 ? ("0" + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1)) + "-" + (new Date().getDate().toString().length == 1 ? ("0" + new Date().getDate()) : new Date().getDate());
            } else {
                this.task_start_on_date = new FormControl(new Date(this.task_detail.task_scheduled_date));
                this.task_end_by_date = new FormControl(new Date(this.task_detail.task_scheduled_date));
                this.task_detail.start_on_date = this.changeFormat.transform(this.task_detail.task_scheduled_date);
                this.task_detail.end_by_date = this.changeFormat.transform(this.task_detail.task_scheduled_date);
            }

        }
        let info: any = {
            "task_id": this.task_detail.task_id,
            "company_id": this.task_detail.task_company_id,
            "user_id": this.task_detail.task_allocated_user_id,
            "project_id": this.task_detail.task_project_id,
            "access": this.access
        };
        this.taskservice.getTaskInfo(info).subscribe(
            data => {
                this.company_fields_status = data.info.company_fields_setting;
                this.task_other_info = data.info;
                this.task_division = this.task_detail.task_division_id.split(",");
                this.task_department = this.task_detail.task_department_id.split(",");
                this.task_skill = this.task_detail.task_skill_id.split(",");
                if (data.info.multiple_allcotion_status == true) {
                    this.task_allocated_users = data.info.is_multiallocation_task;
                } else {
                    this.task_allocated_users = this.task_detail.task_allocated_user_id.split(",");
                }
                try {
                    let save = document.querySelector('.btn-xs');
                    save.classList.add('btn-sm');
                    save.classList.remove('btn-xs');
                    let cancel = document.querySelector('.btn-danger');
                    cancel.classList.add('btn-sm');
                    cancel.classList.remove('btn-xs');
                    cancel.classList.remove('btn-danger');
                } catch (error) {

                }
            },
            error => {

            }
        );

    }
    replace_space(task) {
        return task.replace(" ", "");
    }
    close(data) {
        this.dialogRef.close({ "info": this.task_detail, "status": data, "type": 'update' });
    }
    frequency_type(type) {
        if (type == 'recurrence') {
            this.recurrStatus = false;
            if (this.task_detail.frequency_type != 'recurrence') {
                this.task_detail.no_end_date = 1;
                this.recurrence_type('daily');
            }
            this.task_detail.frequency_type = 'recurrence';
        } else {
            this.recurrStatus = true;
            this.task_detail.frequency_type = 'one_off';
            this.task_detail.recurrence_type = 0;
        }
    }

    weekly_recurring(data, value) {
        data = data + '';
        let new_array = data.split(',');
        let status = false;
        new_array.forEach(element => {
            if (element == value) {
                status = true;
            }
        });
        return status;
    }

    recurrence_type(type) {
        let status: any = '';
        if (type == 'daily') {
            status = document.querySelector("#daily_div");
            status.style.display = 'block';
            status = document.querySelector("#weekly_div");
            status.style.display = 'none';
            status = document.querySelector("#monthly_div");
            status.style.display = 'none';
            status = document.querySelector("#yearly_div");
            status.style.display = 'none';
            if (this.task_detail.recurrence_type != 1) {
                this.task_detail.Daily_every_day = 1;
            }
            this.task_detail.recurrence_type = 1;

        } else if (type == 'weekly') {
            status = document.querySelector("#daily_div");
            status.style.display = 'none';
            status = document.querySelector("#weekly_div");
            status.style.display = 'block';
            status = document.querySelector("#monthly_div");
            status.style.display = 'none';
            status = document.querySelector("#yearly_div");
            status.style.display = 'none';
            if (this.task_detail.recurrence_type != 2) {
                this.task_detail.Weekly_every_week_no = 1;
                var d = new Date(this.task_detail.task_scheduled_date);
                let dayno: any = d.getDay();
                this.task_detail.Weekly_week_day = dayno;
                this.weekly_day.push(dayno);
            }
            this.task_detail.recurrence_type = 2;
        } else if (type == 'monthly') {
            status = document.querySelector("#daily_div");
            status.style.display = 'none';
            status = document.querySelector("#weekly_div");
            status.style.display = 'none';
            status = document.querySelector("#monthly_div");
            status.style.display = 'block';
            status = document.querySelector("#yearly_div");
            status.style.display = 'none';
            if (this.task_detail.recurrence_type != 3) {
                this.task_detail.monthly_radios = 1;
                this.task_detail.Monthly_op1_1 = 1;
                this.task_detail.Monthly_op1_2 = 1;
            }
            this.task_detail.recurrence_type = 3;
        } else {
            status = document.querySelector("#daily_div");
            status.style.display = 'none';
            status = document.querySelector("#weekly_div");
            status.style.display = 'none';
            status = document.querySelector("#monthly_div");
            status.style.display = 'none';
            status = document.querySelector("#yearly_div");
            status.style.display = 'block';
            if (this.task_detail.recurrence_type != 4) {
                this.task_detail.yearly_radios = 1;
                this.task_detail.Yearly_op1 = 1;
            }
            this.task_detail.recurrence_type = 4;
        }
    }

    set_daily_recuuring(type) {
        if (type == 1) {
            this.task_detail.Daily_every_day = 1;
            this.task_detail.Daily_every_weekday = 0;
        } else {
            this.task_detail.Daily_every_day = 0;
            this.task_detail.Daily_every_weekday = 1;
        }
    }

    set_weekly_recurr(checked, value) {
        if (checked == true) {
            this.weekly_day.push(value);
        } else {
            let index = this.weekly_day.findIndex(x => x == value);
            if (this.weekly_day.length == 1) {
                this.toastr.error('Atleast one day is required! ', '', { positionClass: "toast-top-center" });
                let checkbox:any = document.querySelectorAll("#weekly_week_day_"+value);
                checkbox[0].checked = true;
            } else {
                this.weekly_day.splice(index, 1);
            }
        }
        this.task_detail.Weekly_week_day = this.weekly_day.join();
    }

    set_monthly_recurring(type) {
        if (type == 1) {
            this.task_detail.monthly_radios = 1
            this.task_detail.Monthly_op1_1 = 1;
            this.task_detail.Monthly_op1_2 = 1;
            this.task_detail.Monthly_op2_1 = '';
            this.task_detail.Monthly_op2_2 = '';
            this.task_detail.Monthly_op2_3 = 0;
            this.task_detail.Monthly_op3_1 = '';
            this.task_detail.Monthly_op3_2 = 0;
        } else if (type == 2) {
            this.task_detail.monthly_radios = 2;
            this.task_detail.Monthly_op2_1 = 'first';
            this.task_detail.Monthly_op2_2 = 'Monday';
            this.task_detail.Monthly_op2_3 = 1;
            this.task_detail.Monthly_op1_1 = 0;
            this.task_detail.Monthly_op1_2 = 0;
            this.task_detail.Monthly_op3_1 = '';
            this.task_detail.Monthly_op3_2 = 0;
        } else {
            this.task_detail.monthly_radios = 3;
            this.task_detail.Monthly_op3_1 = '-5';
            this.task_detail.Monthly_op3_2 = 1;
            this.task_detail.Monthly_op1_1 = 0;
            this.task_detail.Monthly_op1_2 = 0;
            this.task_detail.Monthly_op2_1 = '';
            this.task_detail.Monthly_op2_2 = '';
            this.task_detail.Monthly_op2_3 = 0;
        }
    }

    set_yearly_recurring(type) {
        if (type == 1) {
            this.task_detail.yearly_radios = 1;
            this.task_detail.Yearly_op1 = 1;
            this.task_detail.Yearly_op2_1 = 0;
            this.task_detail.Yearly_op2_2 = 0;
            this.task_detail.Yearly_op3_1 = '';
            this.task_detail.Yearly_op3_2 = '';
            this.task_detail.Yearly_op3_3 = '';
            this.task_detail.Yearly_op4_1 = '';
            this.task_detail.Yearly_op4_2 = '';

        } else if (type == 2) {
            this.task_detail.yearly_radios = 2;
            this.task_detail.Yearly_op2_1 = 1;
            this.task_detail.Yearly_op2_2 = 1;
            this.task_detail.Yearly_op1 = 0;
            this.task_detail.Yearly_op3_1 = '';
            this.task_detail.Yearly_op3_2 = '';
            this.task_detail.Yearly_op3_3 = '';
            this.task_detail.Yearly_op4_1 = '';
            this.task_detail.Yearly_op4_2 = '';

        } else if (type == 3) {
            this.task_detail.yearly_radios = 3;
            this.task_detail.Yearly_op3_1 = 'first';
            this.task_detail.Yearly_op3_2 = 'Monday';
            this.task_detail.Yearly_op3_3 = 'January';
            this.task_detail.Yearly_op1 = 0;
            this.task_detail.Yearly_op2_1 = 0;
            this.task_detail.Yearly_op2_2 = 0;
            this.task_detail.Yearly_op4_1 = '';
            this.task_detail.Yearly_op4_2 = '';
        } else {
            this.task_detail.yearly_radios = 4;
            this.task_detail.Yearly_op4_1 = '-5';
            this.task_detail.Yearly_op4_2 = 'January';
            this.task_detail.Yearly_op1 = 0;
            this.task_detail.Yearly_op2_1 = 0;
            this.task_detail.Yearly_op2_2 = 0;
            this.task_detail.Yearly_op3_1 = '';
            this.task_detail.Yearly_op3_2 = '';
            this.task_detail.Yearly_op3_3 = '';
        }
    }

    setSubCategory(category_id) {
        let data1: any = {
            "category_id": category_id,
            "company_id": this.company_id
        };
        this.taskservice.getSubcategory(data1).subscribe(
            data => {
                
                this.task_other_info.sub_category = data.info.sub_category;
                this.task_other_info.sub_category.forEach((element,index) => {
                    if(index == 0){
                        this.task_detail.task_sub_category_id = element.category_id;
                    }
                });
            },
            error => {

            }
        );
    }

    setSectionOnChange(project_id) {
        let data1: any = {
            "project_id": project_id,
            "company_id": this.company_id
        };
        this.taskservice.getProjectInfo(data1).subscribe(
            data => {
                this.task_other_info.sections = data.info.sections;
                this.task_other_info.team = data.info.team;
                this.task_detail.customer_id = data.info.customer_id;
                this.task_detail.subsection_id = data.info.subsection_id;
            },
            error => {

            }
        );
    }

    changepersonal(value) {
        if (value == true) {
            this.task_detail.is_personal = 1;
        } else {
            this.task_detail.is_personal = 0;
        }
    }
    watch() {
        if (this.task_detail.watch == 0) {
            this.task_detail.watch = 1;
        } else {
            this.task_detail.watch = 0;
        }
    }

    change_color(color_id, color_code) {
        this.task_detail.color_id = color_id;
        this.task_detail.color_code = color_code;
    }

    lockeddueDate(value) {
        if (value == true) {
            this.task_detail.locked_due_date = 1;
        } else {
            this.task_detail.locked_due_date = 0;
        }
    }


    addStep(form) {
        let step_title = form.add_step_title.value;
        if (step_title != '') {
            if (this.task_detail.task_id != '') {
                let data1: any = {
                    "task_id": this.task_detail.task_id,
                    "user_id": this.login_user_id,
                    "step_title": step_title,
                    "task_info": this.another_task_info
                };
                this.taskservice.addstep(data1).subscribe(
                    data => {
                        this.change_array.emit(data.info.task_id);
                        this.task_detail.task_id = data.info.task_id;
                        this.another_task_info.task_id = data.info.task_id;
                        this.task_other_info.steps = data.info.steps;
                        form.add_step_title.value = '';
                        this.add_step = false;
                    },
                    error => {

                    }
                );
            } else {
                let id = this.task_other_info.steps.length;
                id = Number(id) + Number(1);
                let steps_array_data = {
                    "task_step_id": id,
                    "step_title": step_title,
                    "is_completed": "0",
                    "step_sequence": id,
                };
                this.task_other_info.steps.push(steps_array_data);
                form.add_step_title.value = '';
                this.add_step = false;
            }
        } else {
            this.toastr.error('Please add step title', '', { positionClass: 'toast-top-center' });
        }
    }

    delete_step(step_id) {
        if (this.task_detail.task_id != '') {
            let data1: any = {
                "step_id": step_id,
                "task_id": this.task_detail.task_id
            };
            this.taskservice.deleteStep(data1).subscribe(
                data => {
                    this.task_other_info.steps = data.info.steps;
                },
                error => {

                }
            );
        } else {
            this.task_other_info.steps.forEach((element, index) => {
                if (element.task_step_id == step_id) {
                    this.task_other_info.steps.splice(index, 1);
                }
            });
        }
    }

    /**
     * Add new comment on task
     * @param form 
     * @param type 
     */
    insert_comment(form, type) {
        let comment = form.task_comment.value;

        if (comment != '') {
            if (this.task_detail.task_id != '') {
                let comment_id = form.task_comment_id.value;
                let data1: any = {
                    "task_id": this.task_detail.task_id,
                    "user_id": this.login_user_id,
                    "comment": comment,
                    "comment_id": comment_id,
                    "type": type
                };
                this.taskservice.addcomment(data1).subscribe(
                    data => {
                        this.task_other_info.comments = data.comments;
                        form.task_comment.value = '';
                        this.addcomment = false;
                    },
                    error => {

                    });
            } else {
                let id = this.task_other_info.comments.length;
                id = Number(id) + Number(1);

                let comment_id = form.task_comment_id.value;
                let user_name = this.get_user_name_by_id(this.login_user_id);
                let comment_data: any = {
                    "task_id": id,
                    "comment_addeby": this.login_user_id,
                    "task_comment": comment,
                    "comment_id": comment_id,
                    "profile_image": "",
                    "task_comment_id": id,
                    "first_name": user_name.user_first_name,
                    "last_name": user_name.user_last_name,
                };
                if (type == 'update') {
                    this.task_other_info.comments.forEach((element, index) => {
                        if (element.task_comment_id == comment_id) {
                            this.task_other_info.comments[index] = comment_data;
                        }
                    });
                } else {
                    this.task_other_info.comments.push(comment_data);
                }

                form.task_comment.value = '';
                this.addcomment = false;
            }
        } else {
            this.toastr.error('Please enter comment.', '', { positionClass: "toast-top-center" });
        }
    }
    /**
     * Delete task comment
     * @param comment_id task_comment_id
     */
    delete_comment(comment_id) {
        if (this.task_detail.task_id != '') {
            let data1: any = {
                "comment_id": comment_id,
                "task_id": this.task_detail.task_id,
                "user_id": this.login_user_id
            };
            this.taskservice.deleteComment(data1).subscribe(
                data => {
                    this.task_other_info.comments = data.comments;
                },
                error => {

                });
        } else {

            this.task_other_info.comments.forEach((element, index) => {
                if (element.task_comment_id == comment_id) {
                    this.task_other_info.comments.splice(index, 1);
                }
            });
        }
    }


    onUploadSuccess($event) {
        let data1: any = {
            "task_id": this.task_detail.task_id,
            "user_id": this.login_user_id,
            "xml": $event[1],
            "task_info": this.another_task_info
        };
        this.taskservice.addfile(data1).subscribe(
            data => {
                this.task_detail.task_id = data.info.task_id;
                this.another_task_info.task_id = data.info.task_id;
                this.task_other_info.files = data.info.files;
            },
            error => {

            }
        );

    }

    insert_link(form) {
        let file_link = form.file_link.value;
        let file_name = form.file_name.value;
        if (file_link == '') {
            this.toastr.error('Please enter file link.', '', { positionClass: "toast-top-center" });
        } else if (file_name == '') {
            this.toastr.error('Please enter file name.', '', { positionClass: "toast-top-center" });
        } else {
            if (this.task_detail.task_id != '') {
                let data1: any = {
                    "task_id": this.task_detail.task_id,
                    "user_id": this.login_user_id,
                    "file_name": file_name,
                    "file_link": file_link,
                    "task_info": this.another_task_info
                };
                this.taskservice.addlink(data1).subscribe(
                    data => {
                        this.change_array.emit(data.info.task_id);
                        this.task_detail.task_id = data.info.task_id;
                        this.another_task_info.task_id = data.info.task_id;
                        this.task_other_info.files = data.info.files;
                        form.file_link.value = '';
                        form.file_name.value = '';
                    },
                    error => {

                    }
                );
            } else {
                let id = this.task_other_info.comments.length;
                id = Number(id) + Number(1);
                let file_link_data: any = {
                    "task_file_id": id,
                    "task_file_name": file_name,
                    "file_title": "",
                    "file_link": file_link,
                    "file_added_by": this.login_user_id,
                };
                this.task_other_info.files.push(file_link_data);
                form.file_link.value = '';
                form.file_name.value = '';

            }
        }
    }

    delete_file(file_id) {
        if (this.task_detail.task_id != '') {
            let data1: any = {
                "file_id": file_id,
                "task_id": this.task_detail.task_id,
                "user_id": this.login_user_id
            };
            this.taskservice.deleteFile(data1).subscribe(
                data => {
                    this.task_other_info.files = data.files;
                },
                error => {

                });
        } else {
            this.task_other_info.files.forEach((element, index) => {
                if (element.task_file_id == file_id) {
                    this.task_other_info.files.splice(index, 1);
                }
            });
        }
    }

    remove_dependency(dependent_task_id) {
        if (this.task_detail.task_id != '') {
            let data1: any = {
                "dependent_task_id": dependent_task_id,
                "task_id": this.task_detail.task_id,
                "user_id": this.login_user_id,
                "company_id": this.company_id,
                "type": "remove"
            };
            this.taskservice.removeDependecy(data1).subscribe(
                data => {
                    this.task_other_info.dependencies = data.info.dependencies;
                },
                error => {

                });
        } else {
            this.task_other_info.dependencies.forEach((element, index) => {
                if (element.task_id == dependent_task_id) {
                    this.task_other_info.dependencies.splice(index, 1);
                }
            });

        }
    }

    delete_dependency(dependent_task_id) {
        if (this.task_detail.task_id != '') {
            console.log("Yes");
            let data1: any = {
                "dependent_task_id": dependent_task_id,
                "task_id": this.task_detail.task_id,
                "user_id": this.login_user_id,
                "company_id": this.company_id,
                "type": "delete"
            };
            this.taskservice.removeDependecy(data1).subscribe(
                data => {
                    this.task_other_info.dependencies = data.info.dependencies;
                },
                error => {

                });
        } else {
            this.task_other_info.dependencies.forEach((element, index) => {
                if (element.task_id == dependent_task_id) {
                    this.task_other_info.dependencies.splice(index, 1);
                }
            });

        }
    }

    add_dependency(form) {

        let task_title = form.dependent_task_title.value;
        if (task_title == '') {
            this.toastr.error('Please enter dependent task title.', '', { positionClass: "toast-top-center" });
        } else {
            if (this.task_detail.task_id != '') {
                var date = new Date(form.depedent_task_due_date.value).toDateString();
                let due_date = this.changeFormat.transform(date);
                let data1: any = {
                    "dependent_task_title": task_title,
                    "task_id": this.task_detail.task_id,
                    "user_id": this.login_user_id,
                    "company_id": this.company_id,
                    "task_allocated_user_id": form.task_allocated_user_id.value,
                    "status_id": form.dependent_task_status.value,
                    "dependent_task_due_date": due_date
                };
                this.taskservice.dependencies(data1).subscribe(
                    data => {
                        this.task_other_info.dependencies = data.info.dependencies;
                        form.dependent_task_title.value = '';
                        this.dependency = false;

                    },
                    error => {

                    }
                );
            }
            /*******changes for add pop up************/
            else {
                var date = new Date(form.depedent_task_due_date.value).toDateString();
                let due_date = this.changeFormat.transform(date);
                let id = this.task_other_info.dependencies.length;
                id = Number(id) + Number(1);
                let task_status_name = this.get_status_name_by_id(form.dependent_task_status.value);
                let user_name = this.get_user_name_by_id(form.task_allocated_user_id.value);
                let dependency_data_array = {
                    "task_id": '#' + id,
                    "task_title": task_title,
                    "task_allocated_user_id": form.task_allocated_user_id.value,
                    "task_due_date": due_date,
                    "task_status_id": form.dependent_task_status.value,
                    "task_owner_id": this.login_user_id,
                    "first_name": user_name.user_first_name,
                    "last_name": user_name.user_last_name,
                    "task_status_name": task_status_name,
                    "profile_image": ""
                };
                this.task_other_info.dependencies.push(dependency_data_array);
                form.dependent_task_title.value = '';
                this.dependency = false;

            }
        }

    }
    change_due_date(event: MatDatepickerInputEvent<Date>) {
        let due_date = this.changeFormat.transform(event.value);
        this.task_detail.task_due_date = due_date;
    }
    recurring_dates(type, event: MatDatepickerInputEvent<Date>) {
        let due_date = this.changeFormat.transform(event.value);

        if (type == 'start') {
            this.task_detail.start_on_date = due_date;
        } else {
            this.task_detail.end_by_date = due_date;
        }
    }

    set_frequency_date_range(type) {
        if (type == 2) {
            let i: any = document.querySelector('#end_after_recurr');
            i.style.display = 'block';
            let j: any = document.querySelector('#end_by_date');
            j.style.display = 'none';
            if (this.task_detail.end_after_recurrence == 0) {
                this.task_detail.end_after_recurrence = 1;
            }
            this.task_detail.no_end_date = 2;
        } else if (type == 3) {
            let i: any = document.querySelector('#end_after_recurr');
            i.style.display = 'none';
            let j: any = document.querySelector('#end_by_date');
            j.style.display = 'block';
            this.task_detail.no_end_date = 3;
        } else {
            let i: any = document.querySelector('#end_after_recurr');
            i.style.display = 'none';
            let j: any = document.querySelector('#end_by_date');
            j.style.display = 'none';
            this.task_detail.no_end_date = 1;
        }
    }
    change_task_popup_fileds(type, checked) {
        let check: any = 0;
        if (checked == true) {
            check = 1;
        }
        let data1: any = {
            "company_id": this.company_id,
            "type": type,
            "status": check
        };
        this.taskservice.change_company_fields(data1).subscribe(
            data => {
                if (type == 'category') {
                    this.company_fields_status.category = check;
                } else if (type == 'subcategory') {
                    this.company_fields_status.subcategory = check;
                } else if (type == 'division') {
                    this.company_fields_status.division = check;
                } else if (type == 'department') {
                    this.company_fields_status.department = check;
                } else if (type == 'skills') {
                    this.company_fields_status.skills = check;
                } else if (type == 'staff_levels') {
                    this.company_fields_status.staff_levels = check;
                }
            },
            error => {
            }
        );
    }
    completed_step(task_detail, step_title, value) {
        if (value) {
            status = '1';
        } else {
            status = '0';
        }
        if (this.task_detail.task_id != '') {
            let task_info1 = {
                "info": task_detail,
                "is_completed": status,
                "step_title": step_title
            }

            this.taskservice.complete_step(task_info1).subscribe(data => {
                this.change_array.emit(data.info.task_id);
                this.task_detail.task_id = data.info.task_id;
                this.another_task_info.task_id = data.info.task_id;
            },
                error => {

                });
        } else {
            this.task_other_info.steps.forEach((element, index) => {
                if (element.step_title == step_title) {
                    this.task_other_info.steps[index].is_completed = status;
                }
            });

        }
    }
    open_taskpopup_delete() {
        this.close('hide');
    }
    popup_single_delete() {
        this.close('single');
    }

    convettime(value, type) {
        let hour: any = 0;
        let minute: any = 0;
        length = value.length;
        var numbers = /^[0-9\.\:\/]+$/;
        if (value.match(numbers)) {
            var int_regx = /^[0-9]+$/;
            var int_dot_regx = /^[0-9\.\/]+$/;
            if (value.match(int_regx)) {
                if (length > 4) {
                    this.toastr.error('Only allowed 4 digit number.', '', { positionClass: "toast-top-center" });
                } else if (length == 1 || length == 2) {
                    hour = value;
                } else if (length == 3 || length == 4) {
                    hour = (value / 100);
                    hour = parseInt(hour)
                    minute = (value - (parseInt(hour) * 100));
                    if (minute > 59) {
                        hour++;
                        minute = minute - 60;
                    }
                }
            } else if (value.match(int_dot_regx)) {
                let string = value.toString();
                let value_array = string.split(".");
                if (value_array[0].length <= 4 && value_array[1].length <= 2) {

                    hour = parseInt(value_array[0]);
                    minute = parseInt(value_array[1]);
                    if (value_array[1].length == 1) {
                        minute = (value_array[1] * 60) / 10;
                        minute = Math.round(minute);
                    } else {
                        minute = (minute * 60) / 100;
                        minute = Math.round(minute);
                    }
                    if (!hour) {
                        hour = 0;
                    }
                    if (!minute) {
                        minute = 0;
                    }

                } else {
                    this.toastr.error('Not valid. ', '', { positionClass: "toast-top-center" });
                }
            }
            else {
                var check_colon = value.includes(":");
                if (check_colon) { //means present : in value
                    let string = value.toString();
                    let value_array = string.split(":");
                    if (value_array[0].length <= 2 && value_array[1].length <= 2) {
                        hour = parseInt(value_array[0]);
                        minute = parseInt(value_array[1]);

                        if (!hour) {
                            hour = 0;
                        }
                        if (!minute) {
                            minute = 0;
                        }
                    } else {
                        this.toastr.error('Not valid. ', '', { positionClass: "toast-top-center" });
                    }
                }

            }
        } else {
            this.toastr.error('only allowed number. ', '', { positionClass: "toast-top-center" });
        }
        if (type == 'task_time_estimate') {
            this.task_detail.task_time_estimate = (hour * 60) + minute;
            this.estimate_time = this.time.transform(this.task_detail.task_time_estimate);
        } else {
            this.task_detail.task_time_spent = hour * 60 + minute;
            this.spent_time = this.time.transform(this.task_detail.task_time_spent);
        }
    }

    add_search_dependancy(dependent_task_id, task_id, dependencytasksearch) {
        if (this.task_detail.task_id != '') {
            dependencytasksearch.task_name.value = "";
            dependencytasksearch.taskDate.value = "";
            this.task_list_result.length = 0;
            let data1: any = {
                "dependent_task_id": dependent_task_id,
                "task_id": task_id,
                "user_id": this.login_user_id,
                "company_id": this.company_id

            };
            this.taskservice.add_search_dependancy(data1).subscribe(
                data => {
                    this.task_other_info.dependencies = data.info.dependencies;
                },
                error => {
                }
            );
        } else {

            this.task_list_result.forEach((element, index) => {
                if (element.id == dependent_task_id) {
                    let due_date: any = '-';
                    if (element.due_date != 'N/A') {
                        var date = new Date(element.due_date).toDateString();
                        due_date = this.changeFormat.transform(date);
                    }
                    let user_name = this.get_user_name_by_id(element.owner_id);
                    let dependency_data_array = {
                        "task_id": element.id,
                        "task_title": element.task_title,
                        "task_allocated_user_id": element.task_allocated_user_id,
                        "task_due_date": due_date,
                        "task_status_id": element.task_status_id,
                        "task_owner_id": element.owner_id,
                        "first_name": user_name.user_first_name,
                        "last_name": user_name.user_last_name,
                        "task_status_name": element.task_status,
                        "profile_image": ""
                    };
                    this.task_other_info.dependencies.push(dependency_data_array);

                }
            });
        }
    }
    getdepartment() {
        let company_id = this.company_id;
        this.taskservice.get_department_by_divisionid(this.task_division, company_id).subscribe(
            data => {
                this.task_other_info.department = data.data;
            },
            error => {
            }
        );
    }
    get_Task_Value(data, task_id) {
        let data1: any = {
            "term": data.task_name.value,
            "date": data.taskDate.value,
            "task_id": task_id,
            "user_id": this.login_user_id,
            "company_id": this.company_id

        };
        this.taskservice.get_task_data(data1).subscribe(
            data => {
                this.task_list_result = data.data;
            },
            error => {
            }
        );
    }

    updateStepName(value, id) {
        if (this.task_detail.task_id != '') {
            let update = {
                "task_id": this.task_detail.task_id,
                "step_title": value,
                "step_id": id
            }
            this.taskservice.update_step(update).subscribe();
        }
    }

    /**  subham azad code */
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
    get_user_name_by_id(id) {
        let name_array: any = '';
        this.task_other_info.team.forEach(element => {// console.log(element);
            if (element.user_id == id) {
                name_array = {
                    "user_first_name": element.first_name,
                    "user_last_name": element.last_name,
                }

            }
        });
        return name_array;
    }
    /**
     * function for insert new task
     */
    insertTask(data) {
        if (this.task_detail.task_title != '') {
            this.task_detail.steps_data = this.task_other_info.steps;
            this.task_detail.comment_data = this.task_other_info.comments;
            this.task_detail.dependency_data = this.task_other_info.dependencies;
            this.task_detail.file_data = this.task_other_info.files;
            this.dialogRef.close({ "info": this.task_detail, status: data, type: 'add' });
        } else {
            this.toastr.error('Please enter task title. ', '', { positionClass: "toast-top-center" });
        }
    }
    cloce_insert_task() {
        this.dialogRef.close({ "info": '', status: '', type: '' });
    }

    /**  subham azad code close */

    chk_value_exist(value,name){
        var pattern = /^[0-9]+$/
        if(value == 0 || value =='' || !pattern.test(value)){
            this.toastr.error('Only allowed vaild integer.','');
            switch(name){
                case 'Daily_every_day':
                this.task_detail.Daily_every_day = 1;
                break;
                case 'Weekly_every_week_no':
                this.task_detail.Weekly_every_week_no = 1;
                break;
                case 'Monthly_op1_1':
                this.task_detail.Monthly_op1_1 = 1;
                break;
                case 'Monthly_op1_2':
                this.task_detail.Monthly_op1_2 = 1;
                break;
                case 'Monthly_op2_3':
                this.task_detail.Monthly_op2_3 = 1;
                break;
                case 'Monthly_op3_2':
                this.task_detail.Monthly_op3_2 = 1;
                break;
                case 'Yearly_op2_2':
                this.task_detail.Yearly_op2_2 = 1;
                break;
                case 'Yearly_op1':
                this.task_detail.Yearly_op1 = 1;
                break;
                case 'end_after_recurrence':
                this.task_detail.end_after_recurrence = 1;
                break;
            }

        }
    }
    /**
     * Check task have category or not when going to completed
     */
    chk_task_status(){ 
        let status_id = this.task_detail.task_status_id;
        let status_name = this.get_status_name_by_id(status_id);
        if(this.task_detail.task_category_id =='0' && this.task_detail.task_sub_category_id =='0' && status_name =='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            this.task_detail.task_status_id = this.last_status_id;
            this.task_detail.task_status_name = this.get_status_name_by_id(this.last_status_id);
            
        }
        // console.log(this.last_status_id);
    }


    get_status_id_by_name(name) {
        let status: any = JSON.parse(localStorage.getItem('status'));
        let status_id = '';
        status.forEach(element => {// console.log(element);
            if (element.task_status_name == name) {
                status_id = element.task_status_id;
            }
        });
        return status_id;
    }
}
