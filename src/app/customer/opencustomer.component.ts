import { Component, OnInit, ViewChild,ViewContainerRef } from '@angular/core';
import { TaskService } from '../services/task.service';
import { CustomerService } from './customer.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import { FormControl, ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChangeFormat } from '../pipes/changeformat.pipe';
import { Router } from '@angular/router';
import { TaskpopupComponent } from '../taskpopup/taskpopup.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { KanbanService } from '../kanban/kanban.service';
import { ProjectService } from '../projects/project.service';
import { LoginService } from '../login/login.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
declare const $: any;
@Component({
    selector: 'app-customer',
    templateUrl: './opencustomer.component.html',
    styleUrls: ['./customer.component.css'],
    providers: [CustomerService, KanbanService, ProjectService, ChangeFormat, MatDialogConfig]
})
export class OpencustomerComponent implements OnInit {
    login_user_id: any = "";
    company_id: any = "";
    routeSub: any = "";
    customerId: any = "";
    customerData: Array<any> = [];
    customerDataform: FormGroup;
    projectDataform: FormGroup;
    taskfilterform: FormGroup;
    inviteCustomerform: FormGroup;
    form_user: any = "";
    today: number = Date.now();
    @ViewChild('editCustomer')
    editCustomer: BsModalComponent;
    @ViewChild('addProject')
    addProject: BsModalComponent;
    @ViewChild('inviteCustomer')
    inviteCustomer: BsModalComponent;
    @ViewChild('recurrencewindow')
    recurrencewindow: BsModalComponent;
    @ViewChild('rightclickdelete')
    rightclickdelete: BsModalComponent;
    form_customer_list: any = "";
    projects: any = "";
    tasks: Array<any> = [];
    task_status: any = "";
    total_customer_project: any = '';
    project_page_number: any = '';
    total_customer_task: any = '';
    task_page_number: any = '';
    customer_users: any = '';
    Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
    external_user_access: number; // External user access permisssion
    is_owner: number;//compay owner
    customer_access: number; // edit/add customer access
    pricing_module_status: number;//pricing module access
    task_detail: any = "";
    type_rec: any = "";
    task_data: any = '';
    hide_task_future: number = 1;
    taskpopupdata: any = '';
    currency: any;
    image: any = '';
    background: any;

    hideproject:any = false;
    hidetask:any = false;
    confirmClicked:any ='';
    cancelClicked:any = true;
    constructor(public toastr: ToastsManager, vcr: ViewContainerRef,public loginservice: LoginService, public projectservice: ProjectService, private router: Router, public customer: CustomerService, private formBuilder: FormBuilder, private route: ActivatedRoute, private changedate: ChangeFormat, private dialog: MatDialog, private dialogConfig: MatDialogConfig, private taskservice: TaskService, private kanbanservice: KanbanService) {
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.toastr.setRootViewContainerRef(vcr);
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.customer_access = user_info.customer_access;
        this.is_owner = user_info.is_owner;
        this.pricing_module_status = user_info.pricing_module_status;
        this.external_user_access = user_info.external_user_access;
        this.currency = user_info.currency;
        this.task_status = JSON.parse(localStorage.getItem('status'));
        this.customerDataform = this.formBuilder.group({
            customer_name: [null, Validators.required],
            customer_external_id: new FormControl(''),
            first_name: new FormControl(''),
            last_name: new FormControl(''),
            internal_owner: new FormControl('0'),
            phone: new FormControl(''),
            parent_customer_id: new FormControl('0'),
            email: ["", [Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
        });
        /*** form for add project */
        this.projectDataform = this.formBuilder.group({
            project_name: [null, Validators.required],
        });
        /** form for task filter  */
        this.taskfilterform = this.formBuilder.group({
            task_search: new FormControl(''),
            statusid: new FormControl('0'),
            owner_id: new FormControl('0'),
            allocated_id: new FormControl('0'),
        });
        /** form for invite customer user */
        this.inviteCustomerform = this.formBuilder.group({
            first_name: [null, Validators.required],
            last_name: [null, Validators.required],
            customer_user_mail: [null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$')], this.check_external_user_email_exist.bind(this)],
        });
        /** get id from url */
        this.routeSub = this.route.params.subscribe(params => {
            this.customerId = params['id'];
            this.opencustomer();

        });
        this.background = localStorage.getItem('user_background_type');
        if (this.background == 'Image') {
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/' + localStorage.getItem('user_background_name');
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        } else if (this.background == 'DefaultImage') {
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        } else {
            this.image = localStorage.getItem('user_background_name');
            $("body").css('background',this.image);
        }
    }

    ngOnInit() {
    }
    ngAfterViewInit() {
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
    }
    opencustomer() {
        let customerdata = {
            customer_id: this.customerId,
            company_id: this.company_id,
            user_id: this.login_user_id
        }
        this.customer.opencustomer(customerdata).subscribe(
            data => {
                console.log(data);
                this.customerData = data.data.customer; // customer list
                this.form_user = data.data.user; // form user list for dropdown
                this.form_customer_list = data.data.form_customer_list; // form customer list for dropdown
                this.projects = data.data.projects;//project list
                this.tasks = data.data.tasks; //task list
                this.total_customer_project = data.data.total_projects; // total project count
                this.total_customer_task = data.data.total_task; // total task count
                this.customer_users = data.data.customer_users; //customer user inviter part
                this.intilize_addTask_json();
            },
            error => {
                console.log(error);
            });
    }

    open_editCustomer() {
        this.form_customer_list.forEach((element1, index) => {
            if (element1.customer_id == this.customerData['customer_id']) {
                this.form_customer_list.splice(index, 1);
            }
        });
        this.editCustomer.open();
        this.customerDataform.controls['customer_name'].setValue(this.customerData['customer_name']);
        this.customerDataform.controls['customer_external_id'].setValue(this.customerData['external_id']);
        this.customerDataform.controls['first_name'].setValue(this.customerData['first_name']);
        this.customerDataform.controls['last_name'].setValue(this.customerData['last_name']);
        this.customerDataform.controls['email'].setValue(this.customerData['email']);
        this.customerDataform.controls['phone'].setValue(this.customerData['phone']);
        this.customerDataform.controls['internal_owner'].setValue(this.customerData['owner_id']);
        this.customerDataform.controls['parent_customer_id'].setValue(this.customerData['parent_customer_id']);

    }
    close_editCustomer() {
        this.editCustomer.close();
    }
    /**
     * 
     * function for update customer data
     */
    update_customer(data) {
        let updateData = {
            "company_id": this.company_id,
            "customerid": this.customerData['customer_id'],
            "data": {
                "first_name": data.first_name,
                "last_name": data.last_name,
                "email": data.email,
                "phone": data.phone,
                "customer_external_id": data.customer_external_id,
                "internal_owner": data.internal_owner,
                "customer_name": data.customer_name,
                "parent_customer_id": data.parent_customer_id,
                "customer_company_id": data.company_id,
                "customerid": this.customerData['customer_id'],
            }
        };
        this.customer.update_customer(updateData).subscribe(
            data => {
                // this.get_customer();
                this.close_editCustomer();
                this.customerData = data.customer;
            },
            error => {
                console.log(error);
            });

    }
    /**
     * change customer status
     */
    changeStatus(id, type) {
        let updateStatusdata = {
            "company_id": this.company_id,
            "id": id,
            "type": type,

        };
        this.customer.changeStatus(updateStatusdata).subscribe(
            data => {
                this.customerData = data.customer.customer;
            },
            error => {
                console.log(error);
            });
    }
    /**
     * function for show add project model
     */
    open_addProject() {
        this.addProject.open();
        // this.customerDataform.controls['customer_name'].setValue(this.customerData['customer_name']);
    }
    /**
    * function for hide add project model
    */
    close_addProject() {
        this.addProject.close();
    }
    /**
     * function for add project data
     */
    addProjectData(data) {
        let project = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "project": {
                'project_title': data.project_name,
                "project_description": "",
                "project_start_date": this.changedate.transform(new Date()),
                "project_end_date": this.changedate.transform(this.today),
                "project_division": "0",
                "project_department": "0",
                "project_customer": this.customerData['customer_id'],
                "project_status": "Open"
            }
        };
        this.projectservice.add_project(project).subscribe(
            data => {
                data.info.encode_id = data.info.encoded_id;
                this.projects.push(data.info);
                this.router.navigateByUrl(["/editproject/"] + data.info.encoded_id);
                this.close_addProject();
                console.log(data);
            },
            error => {

            }
        )
    }
    /**
     * function for task form filter
     */
    taskformfilter() {

        let filterData = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "data": {
                'status_id': this.taskfilterform.value.statusid,
                "owner_id": this.taskfilterform.value.owner_id,
                "allocated_id": this.taskfilterform.value.allocated_id,
                "customer_id": this.customerData['customer_id'],
                "search_text": this.taskfilterform.value.task_search
            }
        };
        this.customer.filtertaskform(filterData).subscribe(
            data => {
                this.tasks = data.task_list.customer_task; //task list
                this.total_customer_task = data.task_list.tatal_customer_task; // total task count
            },
            error => {
                console.log(error);
            });

    }
    delete_customer(customer_id) {
        let company_id = this.company_id;
        this.customer.delete_customer(customer_id, company_id).subscribe(
            data => {
                this.router.navigate(["/customer"]);
            },
            error => {
                console.log(error);
            });
    }
    /**
     * function for customer pagination
     * @param page_no for page number
     */
    customer_project_pagination(page_no) {
        let company_id = this.company_id;
        this.project_page_number = page_no;
        let customer_id = this.customerData['customer_id'];
        let user_id = this.login_user_id;
        this.customer.customer_project_pagination(company_id, page_no, customer_id, user_id).subscribe(
            data => {
                this.projects = data.customer_project_list;//project list
            },
            error => {
                console.log(error);
            });
    }
    customer_task_pagination(page_no) {
        this.task_page_number = page_no;
        let data = {
            "company_id": this.company_id,
            "customer_id": this.customerData['customer_id'],
            "data": {
                "allocated_id": this.taskfilterform.value.allocated_id,
                "owner_id": this.taskfilterform.value.owner_id,
                "statusid": this.taskfilterform.value.statusid,
                "task_search": this.taskfilterform.value.task_search,
                "page_no": page_no

            }
        };
        this.customer.customer_task_pagination(data).subscribe(
            result => {
                this.tasks = result.customer_task_list; //task list    
            },
            error => {
                console.log(error);
            });


    }
    /**
     * function for show invite customer model
     */
    open_inviteCustomer() {
        this.inviteCustomer.open();
        this.inviteCustomerform.controls['first_name'].setValue(this.inviteCustomertData['first_name']);
        this.inviteCustomerform.controls['last_name'].setValue(this.inviteCustomertData['last_name']);
        this.inviteCustomerform.controls['customer_user_mail'].setValue(this.inviteCustomertData['customer_user_mail']);
    }
    /**
    * function for hide invite customer model
    */
    close_inviteCustomer() {
        this.inviteCustomer.close();
    }
    inviteCustomertData(fromdata) {
        let insert_data = {
            "company_id": this.company_id,
            "data": {
                "customer_user_first": fromdata.first_name,
                "customer_user_last": fromdata.last_name,
                "customer_user_mail": fromdata.customer_user_mail,
                "parent_customer": this.customerData['customer_id']
            }
        };
        this.customer.insert_invite_customer(insert_data).subscribe(
            result => {
                this.customer_users.push(result.customer_users);//push array in customer user array
                this.close_inviteCustomer();
            },
            error => {
                console.log(error);
            });

    }
    /**
     * function for delete customer user
     * @param user_id customer user id
     */
    deleteCustomerUser(user_id) {
        this.customer.deleteCustomerUser(user_id).subscribe(
            result => {
                this.customer_users.forEach((element, index) => {
                    if (element.user_id == user_id) {
                        this.customer_users.splice(index, 1);//remove user in customer user array
                    }
                });
            },
            error => {
                console.log(error);
            });
    }
    /**
        * Open task modal popup
        */
    open(task_info, type = '') {

        this.task_detail = task_info;
        this.dialogConfig.disableClose = true;
        this.dialogConfig.width = "800px";
        this.dialogConfig.data = {
            task_info: this.task_detail,
            type: this.type_rec,
            access: "customer",
            status_id: this.task_detail.task_status_id
        }
        let dialogRef = this.dialog.open(TaskpopupComponent, this.dialogConfig);
        dialogRef.componentInstance.change_array.subscribe(data => {
            this.tasks.forEach((element, index) => {
                if (element.task_id == this.task_detail.task_id) {
                    this.tasks[index].task_id = data;
                }
            });

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
    /**
    * Save task info when user close task popup
    * @param form task info
    */
    update_task(form) {
        let info = form.value;
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "task_info": this.task_detail,
            "start_date": '',
            "info": info,
            "from": 'customer'
        };
        let remove: boolean;
        this.taskservice.updatetask(data1).subscribe(
            data => {
                this.tasks.forEach((element, index) => {
                    if (element.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off') {
                        this.tasks[index] = data.task_info.tasks;

                    } else {
                        if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence') {
                            this.tasks[index] = data.task_info.tasks;
                        } else if (element.task_id == this.task_detail.task_id && element.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence') {
                            this.tasks[index] = data.task_info.tasks;
                        } else if (element.master_task_id == this.task_detail.task_id && element.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off') {
                            this.tasks[index] = data.task_info.tasks;

                        }
                    }

                });

                if (this.type_rec == 'occurrence') {
                    let rec_detail: any = {
                        "user_id": this.task_detail.task_allocated_user_id,
                        "company_id": this.company_id,
                        "task_id": this.task_detail.master_task_id
                    };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info => {
                            this.tasks.splice(0, 0, info.task);
                        }, error => {
                            console.log(error);
                        }
                    )
                }
                this.type_rec = '';
            },
            error => {

            }
        );
    }
    recurrence_open(task) {
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
        this.open(this.task_detail);

    }
    /**
     * function for update due date on right click
     * @param event 
     * @param info task detail array
     */
    update_due_date(event, info) {
        let new_date = this.changedate.transform(event);
        let data1: any = {
            "company_id": this.company_id,
            "task_info": info,
            "user_id": this.login_user_id,
            "type": 'due_date',
            'date': new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data => {
                this.tasks.forEach((element, index) => {

                    if (element.task_id == info.task_id) {
                        this.tasks[index] = data.info;
                    }

                });
                if (data.status == 'occurrence') {
                    let rec_detail: any = {
                        "user_id": data.info.task_allocated_user_id,
                        "company_id": this.company_id,
                        "task_id": data.info.master_task_id
                    };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info => {
                            this.tasks.forEach((element, index) => {
                                if (element.task_status_id == info.task.task_status_id) {
                                    this.tasks.splice(0, 0, info.task);
                                }
                            });
                        }, error => {
                            console.log(error);
                        }
                    )
                }
                this.type_rec = '';
            },
            error => {
            }
        );
    }
    /**
     * function for copy task on right click
     * @param task_id 
     * @param task_info array
     */
    copy_task(task_id, task_info) {
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "task_info": task_info,
            "user_id": this.login_user_id
        };
        this.taskservice.copy_task(data1).subscribe(
            data => {
                this.tasks.splice(0, 0, data.info);


                this.type_rec = '';
            },
            error => {
            }
        );
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

                this.tasks.forEach((element, index) => {
                    if (element.task_id == task_id) {
                        this.tasks[index] = data.info;
                    }

                });
                if (data.status == 'occurrence') {
                    let rec_detail: any = {
                        "user_id": data.info.task_allocated_user_id,
                        "company_id": this.company_id,
                        "task_id": data.info.master_task_id
                    };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info => {
                            this.tasks.splice(0, 0, info.task);

                        }, error => {
                            console.log(error);
                        }
                    )
                }


            },
            error => {
            }
        );
    }
    update_scheduled_date(event, info) {
        let new_date = this.changedate.transform(event);
        let data1: any = {
            "company_id": this.company_id,
            "task_info": info,
            "user_id": this.login_user_id,
            "type": 'scheduled_date',
            'date': new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data => {
                this.tasks.forEach((element, index) => {

                    if (element.task_id == info.task_id) {
                        this.tasks[index] = data.info;
                    }

                });
                if (data.status == 'occurrence') {
                    let rec_detail: any = {
                        "user_id": data.info.task_allocated_user_id,
                        "company_id": this.company_id,
                        "task_id": data.info.master_task_id
                    };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info => {
                            this.tasks.splice(0, 0, info.task);

                        }, error => {
                            console.log(error);
                        }
                    )
                }
            },
            error => {
            }
        );
    }

    right_click_delete(task_data, where = '') {
        if (where == 'from_delete') {
            this.hide_task_future = 0;
        } else {
            this.hide_task_future = 1;
        }
        this.task_data = JSON.stringify(task_data);
        this.rightclickdelete.open();
    }
    close_right_click_delete() {
        this.task_data = '';
        this.rightclickdelete.close();
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

                    this.tasks.forEach((element, index) => {
                        if (element.task_id == task.task_id) {
                            this.tasks.splice(index, 1);
                        }
                    });

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

                    this.tasks.forEach((element, index) => {
                        if (element.task_id == info.task_id && type == 'occurrence') {
                            this.tasks.splice(index, 1);
                        }
                        if ((element.task_id.search(info.master_task_id) > 0) && type == 'series') {
                            this.tasks.splice(index, 1);
                        }
                        if ((element.task_id.search(info.master_task_id) > 0) && type == 'future' && element.task_scheduled_date > data.date) {
                            this.tasks.splice(index, 1);
                        }
                    });
                    this.close_right_click_delete();
                    this.task_data = '';

                },
                error => {
                }
            );
        }
    }
    task_form_filter_reset() {
        this.taskfilterform.controls['task_search'].setValue("");
        this.taskfilterform.controls['statusid'].setValue("0");
        this.taskfilterform.controls['owner_id'].setValue("0");
        this.taskfilterform.controls['allocated_id'].setValue("0");
        this.taskformfilter();
    }
    intilize_addTask_json() {
        let logininfo = JSON.parse(localStorage.getItem('info'));
        this.taskpopupdata = this.taskservice.taskPopup;
        this.taskpopupdata.task_status_id = this.get_task_status_id_by_name('Ready');
        this.taskpopupdata.task_allocated_user_id = this.login_user_id;
        this.taskpopupdata.task_company_id = this.company_id;
        this.taskpopupdata.owner_name = logininfo.username;
        this.taskpopupdata.task_owner_id = this.login_user_id;
        this.taskpopupdata.customer_id = this.customerData['customer_id'];
        this.taskpopupdata.completed_depencencies = 0;
        this.taskpopupdata.task_scheduled_date = '0000-00-00';
        this.taskpopupdata.task_due_date = '0000-00-00';
    }

    insertTask(data, info) {
        this.taskservice.insert_task_data(data.value, info, 'customer').subscribe(
            data => {
                this.tasks.push(data.info);
            });
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
    replace_space(task) {
        return task.replace(" ", "");
    }

    check_external_user_email_exist(control: AbstractControl) {
        let info = {
            "user_id": '',
            "value": control.value,
            'company_id': this.company_id
        }
        return this.customer.is_company_user_exists(info).map(res => {
            return res.status ? { exist: true } : null;
        });
    }

    convert_price(price) {

        price = price + '';
        if (price.indexOf(".") != -1) {
            return price;
        } else {
            return price + '.00';
        }

    }
}
