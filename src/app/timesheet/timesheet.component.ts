import { Component,ViewContainerRef,ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {TimesheetService} from './timesheet.service';
import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BsModalComponent } from 'ng2-bs3-modal';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component ({
   selector: 'timesheet',
   templateUrl: './timesheet.component.html',
   providers:[TimesheetService,ChangeFormat]
})
export class TimesheetComponent  {
    
    xero_integration_status:number;
    xero_user_access:number;
    login_user_id:number;
    company_id:number;
    timesheet_list:any = [];
    user_list:any;
    filtertimesheet:FormGroup;
    message:any;
    is_admin:number;
    @ViewChild('addNewTimesheet')
    addNewTimesheet: BsModalComponent;
    max_timesheet_date:any;
    timesheet_creation_access:any;
    addTimesheet:FormGroup;
    total_timesheet:number;
    page_number:any='';
    image:any = '';
    background:any;
    constructor(public loginservice:LoginService,public toastr: ToastsManager,vcr: ViewContainerRef,public timesheetservice:TimesheetService,public builder:FormBuilder,public changedate:ChangeFormat){
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.is_admin = user_info.is_administrator;
        this.xero_integration_status = user_info.xero_integration_status;
        this.xero_user_access = user_info.xero_user_access;
        this.get_timesheet_list();
        this.toastr.setRootViewContainerRef(vcr);
        this.filtertimesheet = this.builder.group({
            timesheet_status:['draft'],
            timesheet_user:['all'],
            timesheet_from_date:[null],
            timesheet_to_date:[null]
        });
        this.addTimesheet = this.builder.group({
            timesheet_start_date:[null,Validators.required],
            timesheet_end_date:[null,Validators.required],
            timesheet_user_id:['',Validators.required]
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
    }
    get_timesheet_list(){
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id
        }
        this.timesheetservice.get_timesheet_list(info).subscribe(
            data=>{
                this.message = 'Cannot export timesheet that is not approved';
                this.timesheet_list = data.timesheet_list.timesheets_list;
                this.user_list = data.timesheet_list.userslist; 
                this.max_timesheet_date = data.timesheet_list.max_date;
                this.timesheet_creation_access = data.timesheet_list.user_access;
                this.total_timesheet = data.timesheet_list.total_records;
                this.addTimesheet.controls['timesheet_start_date'].setValue(new Date(this.max_timesheet_date));
            },
            error=>{
                
            }
        )
    }

    convert_time(time){
        let hours:any = (time / 60);
			hours = parseInt(hours)
		let minutes:any  = (time - (parseInt(hours) * 60))+'';
        if (minutes.length == 1) {
            minutes = '0'+ minutes;
        }
        
        return hours+':'+minutes;
    }
    /**
     * Timesheet filters
     */
    filter_timesheet(){
        let info = this.filtertimesheet.value;
        let to_date = '';
        let from_date = '';
        if(info.timesheet_from_date != null){
            from_date = this.changedate.transform(info.timesheet_from_date);
        }
        if(info.timesheet_to_date != null){
            to_date = this.changedate.transform(info.timesheet_to_date);
        }
        if(to_date !='' && from_date !=''){
            if(to_date < from_date){
                this.filtertimesheet.controls['timesheet_to_date'].setValue(null);
                this.toastr.error('End date must be greater than or equal to start date. ', '');
            }
        }
        let filter_info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "status":info.timesheet_status,
            "user":info.timesheet_user,
            "from_date":from_date,
            "to_date":to_date
        }
        if(info.timesheet_status == 'draft' || info.timesheet_status == 'submitted'){
            this.message = 'Cannot export timesheet that is not approved';
        }else if(info.timesheet_status == 'exported'){
            this.message = 'Cannot export timesheet that is already exported';
        }else{
            this.message = null;
        }
        this.timesheetservice.timesheet_filter(filter_info).subscribe(
            data=>{
                this.timesheet_list = data.timesheet_list.timesheets_list;
                this.total_timesheet = data.timesheet_list.total_record;
                this.page_number = '';
            },
            error=>{

            }
        )
    }

    delete_timesheet(timesheet_id){
        this.timesheetservice.delete_timesheet(timesheet_id,this.company_id).subscribe(
            data=>{
                this.timesheet_list.forEach((element,index) => {
                    if(element.timesheet_id == timesheet_id){
                        this.timesheet_list.splice(index,1);
                    }
                });
            }
        )
    }

    open_add_timesheet_modal(){
        this.addTimesheet.reset();
        this.addTimesheet.controls['timesheet_start_date'].setValue(new Date(this.max_timesheet_date));
        this.addTimesheet.controls['timesheet_user_id'].setValue(this.login_user_id);
        this.addNewTimesheet.open();
    }

    close_add_timesheet_modal(){
        this.addNewTimesheet.close();
    }

    new_timesheet(data){
        let start_date = this.changedate.transform(data.timesheet_start_date);
        let end_date = this.changedate.transform(data.timesheet_end_date);
        if (end_date < start_date) {
            this.addTimesheet.controls['timesheet_end_date'].setValue(null);
            this.toastr.error('End date must be greater than or equal to start date. ', '');
        }else{
            let info = {
                "user_id":this.login_user_id,
                "company_id":this.company_id,
                "timesheet_start_date":start_date,
                "timesheet_end_date":end_date,
                "timesheet_user_id":data.timesheet_user_id
            }
            this.timesheetservice.create_new_timesheet(info).subscribe(
                data=>{
                    this.timesheet_list.push(data.timesheet.timesheet_info);
                    this.max_timesheet_date = data.timesheet.max_date;
                    this.close_add_timesheet_modal();
                }
            )
        }

    }

    apply_pagination(page_no){
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "page_no":page_no,
            "search":this.filtertimesheet.value
        }
        this.timesheetservice.pagination(info).subscribe(
            data=>{
                this.timesheet_list = data.timesheet_list;
                this.page_number = page_no;
            }
        )
    }
    excel_generate(){
        
    }
}