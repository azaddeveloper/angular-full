import { Component,ViewContainerRef,ViewChild} from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import {TimesheetService} from './timesheet.service';
import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BsModalComponent } from 'ng2-bs3-modal';
import { TimeConvert } from '../pipes/timeconvter.pipe';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component ({
   selector: 'timesheet',
   templateUrl: './opentimesheet.component.html',
   styleUrls:['./timesheet.component.css'],
   providers:[TimesheetService,ChangeFormat,TimeConvert]
})
export class OpenTimesheetComponent  {
    
    login_user_id:number;
    company_id:number;
    encoded_timesheet_id:any;
    timesheet_info:any = '';
    date_range:any = '';
    customers:any = '';
    width:any = '';
    non_customer:any ='';
    overall_total_time_array:any = '';
    filter_type:any='time';
    currency:any;
    @ViewChild('edittime')
    edittime:BsModalComponent;
    Edit_date:any='';
    edit_task_list:any = '';
    hidden_total_time:number = 0;
    is_manager:number;
    approver_details:any = '';
    approver_id:any='';
    is_admin:any='';
    comments:any='';
    approver_comment:any='';
    loader:boolean = false;
    image:any = '';
    background:any;

    confirmClicked:any ='';
    cancelClicked:any = true;
    constructor(public loginservice:LoginService,public router:Router ,public time:TimeConvert,private route: ActivatedRoute,public toastr: ToastsManager,vcr: ViewContainerRef,public timesheetservice:TimesheetService,public builder:FormBuilder,public changedate:ChangeFormat){
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.currency = user_info.currency;
        this.is_manager = user_info.is_manager;
        this.approver_id = user_info.approver_id;
        this.is_admin = user_info.is_administrator;
        this.route.params.subscribe(para=>{
            this.encoded_timesheet_id  = para.id;
        });
        this.get_timesheet_detail();
        this.toastr.setRootViewContainerRef(vcr);
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
    get_timesheet_detail(){
        this.loader = true;
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "timesheet_id":this.encoded_timesheet_id
        }
        this.timesheetservice.timesheet_detail(info).subscribe(
            data=>{ 
                this.timesheet_info = data.timesheet_detail.info;
                this.date_range = data.timesheet_detail.date_range;
                this.customers = data.timesheet_detail.customers;
                this.width = (this.timesheet_info.total_days * 100);
                this.non_customer = data.non_customer;
                this.overall_total_time_array = data.date_total_time;
                this.approver_details = this.timesheet_info.approver_details;
                this.comments = this.timesheet_info.timesheet_comment;
                this.approver_comment = this.timesheet_info.approver_comment;
                this.loader = false;
            }
        )
    }
    convert_time(time,type=''){
        if(type == 'total' && (time == null || time ==0)){
            return "0:00";
        }else if(time == null || time == 0){
            return '-';
        }else{
            let hours:any = (time / 60);
                hours = parseInt(hours)
            let minutes:any  = (time - (parseInt(hours) * 60))+'';
            if (minutes.length == 1) {
                minutes = '0'+ minutes;
            }
            
            return hours+':'+minutes;
        }
    }

    convert_price(price,type=''){
        if(type == 'total' && (price == 0 || price == undefined) ){
            return '0.00';
        }else if(price == 0 || price == undefined){
            return '-';
        }else{
            price =  price +'';
            if(price.indexOf(".") != -1){
                return price;
            }else{
                return price+'.00';
            }
        }
    }

    change_view(){
        this.loader = true;
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "timesheet_id":this.encoded_timesheet_id,
            "filter":this.filter_type
        }
        this.timesheetservice.apply_timesheet_filter(info).subscribe(
            data=>{
                if(this.filter_type == 'time'){
                    this.timesheet_info.total_hours = data.timesheet_detail.total_hours;
                }
                this.customers = data.timesheet_detail.customers;
                this.non_customer = data.non_customer;
                this.overall_total_time_array = data.date_total_time;
                this.loader = false;
            }
        )
    }

    open_edit_time_modal(customer_id,date){
        if(this.timesheet_info.timesheet_status == 'Draft'){
            let info = {
                "company_id":this.company_id,
                "date":date,
                'customer_id':customer_id,
                "timesheet_user_id":this.timesheet_info.timesheet_user_id
            }
            this.timesheetservice.one_day_data(info).subscribe(
                data=>{
                    this.hidden_total_time = 0;
                    this.Edit_date = date;
                    this.edit_task_list = data.info.tasks;
                    this.edit_task_list.forEach((element,index) => {
                        this.hidden_total_time = Number(this.hidden_total_time) + Number(element.billed_time);
                        this.edit_task_list[index].task_time_estimate = Math.floor(element.task_time_estimate/60)+'h'+(element.task_time_estimate%60)+'m';
                        this.edit_task_list[index].task_time_spent = Math.floor(element.task_time_spent/60)+'h'+(element.task_time_spent%60)+'m';
                        this.edit_task_list[index].billed_time = Math.floor(element.billed_time/60)+'h'+(element.billed_time%60)+'m';
                    });
                    this.edittime.open();
                }
            )
        }
    }
    close_edit_time_modal(){
        this.edittime.close();
    }
    // check validation
    change_time(value,actual_time,task_id):void{
        let hour: any = 0;
        let minute: any = 0;
        length = value.length;
        var numbers = /^[0-9]+$/;
        if(value != actual_time){
            if (value.match(numbers)) {
                if (length > 4) {
                    this.toastr.error('Only 4 digit number is allowed.', '');
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
                this.edit_task_list.forEach((element,index) => {
                    if(element.task_id == task_id){
                        this.edit_task_list[index].billed_time = hour+'h'+minute+'m';
                    }
                });
            } else {
                this.toastr.error('Only number is allowed. ', '');
                this.edit_task_list.forEach((element,index) => {
                    if(element.task_id == task_id){
                        this.edit_task_list[index].billed_time = ''; 
                    }
                });
            }
        }
    }

    save_task_time(){
        let info = {
            "company_id":this.company_id,
            "date":this.Edit_date,
            "info":this.edit_task_list,
            "timesheet_id":this.encoded_timesheet_id
        }
        this.timesheetservice.update_data(info).subscribe(
            data=>{
                this.timesheet_info.days_changed = data.info.total_changed_days;
                // condition for updating time for customer or non-customer date

                if(data.info.customer_id == '' || data.info.customer_id == 0){
                    this.non_customer.date.forEach(element => {
                        if(element.date == this.Edit_date){  
                            element.time = data.info.current_time;
                            element.exception_task = data.info.exception_flag;
                            element.day_changed_task = data.info.day_change_flag;
                        }
                    });
                    this.non_customer.time = Number(this.non_customer.time) + Number(data.info.current_time);
                    this.non_customer.time = this.non_customer.time - this.hidden_total_time;
                }else{
                    this.customers.forEach(element => {
                        if(element.customer_id == data.info.customer_id){
                            element.data.forEach((element1,index) => {
                                if(element1.date == this.Edit_date){ 
                                    element.data[index].time = data.info.current_time;
                                    element.data[index].exception_task = data.info.exception_flag;
                                    element.data[index].day_changed_task = data.info.day_change_flag;
                                }
                            });
                            element.total_time = Number(element.total_time) + Number(data.info.current_time);
                            element.total_time = element.total_time - this.hidden_total_time;
                        }
                    });
                }
                //update time row wise
                this.overall_total_time_array.date_wise_total.forEach(element => {
                    if(element.date == this.Edit_date){
                        element.time = Number(element.time) + Number(data.info.current_time);
                        element.time = element.time - this.hidden_total_time;
                    }
                });
                //  update overall timesheet time
                this.overall_total_time_array.overall_total_time = Number(this.overall_total_time_array.overall_total_time) + Number(data.info.current_time);
                this.overall_total_time_array.overall_total_time = this.overall_total_time_array.overall_total_time - this.hidden_total_time;
                
                // update widget time
                this.timesheet_info.total_hours = Number(this.timesheet_info.total_hours) + Number(data.info.current_time);
                this.timesheet_info.total_hours = this.timesheet_info.total_hours - this.hidden_total_time;
                
                this.close_edit_time_modal();
            }
        )
    }

    change_widget_time(time){
        if(time == undefined){
            return '0h00m';
        }
        let hour = Math.floor(time / 60);
        let minutes = (time % 60) + '';
        if (minutes.length == 1) {
            minutes = '0' + minutes;
        }
        return hour+'h'+minutes+'m';
    }

    save_as_draft(comment){
        let comment_id = 0;
        if(this.comments != ''){
            comment_id = this.comments.comment_id;
        }
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "comment":comment.timesheet_comment.value,
            "company_id":this.company_id,
            "comment_id":comment_id,
            "timesheet_user_id":this.timesheet_info.timesheet_user_id
        }
        this.timesheetservice.save_as_draft(info).subscribe(
            data=>{ 
                this.comments = data.comment;
            }
        )
    }
    submit_for_approval(comment){
        let comment_id = 0;
        if(this.comments != ''){
            comment_id = this.comments.comment_id;
        }
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "comment":comment.timesheet_comment.value,
            "company_id":this.company_id,
            "comment_id":comment_id,
            "timesheet_user_id":this.timesheet_info.timesheet_user_id,
            "approver_id":this.approver_id,
            "user_id":this.login_user_id
        }
        this.timesheetservice.submit_timesheet(info).subscribe(
            data=>{ 
                this.comments = data.comment;
                this.timesheet_info.timesheet_status = data.status;
            }
        )
    }

    recall(){
       let info = {
           "user_id":this.login_user_id,
           "company_id":this.company_id,
           "timesheet_id":this.encoded_timesheet_id,
           "timesheet_user_id":this.timesheet_info.timesheet_user_id
       } 
       this.timesheetservice.timesheet_recall(info).subscribe(
           data=>{
               this.timesheet_info.timesheet_status = data.status;
           }
       )
    }

    timesheet_approve(){
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "company_id":this.company_id
        }
        this.timesheetservice.approve_timesheet(info).subscribe(
            data=>{
                this.timesheet_info.timesheet_status = data.status;
            }
        )
    }

    return_as_draft(){
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "company_id":this.company_id
        }
        this.timesheetservice.return_to_draft(info).subscribe(
            data=>{
                this.timesheet_info.timesheet_status = data.status;
            }
        ) 
    }

    export_cancel(){
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "company_id":this.company_id
        }
        this.timesheetservice.cancel_timesheet_export(info).subscribe(
            data=>{
                this.timesheet_info.timesheet_status = data.status;
            }
        ) 
    }

    delete_timesheet(){
        this.timesheetservice.delete_timesheet(this.timesheet_info.timesheet_id,this.company_id).subscribe(
            data=>{
                this.router.navigate(['/timesheet']);
            }
        ) 
    }

    timesheet_approver_comment(comment){
        let comment_id = 0;
        if(this.approver_comment != ''){
            comment_id = this.approver_comment.comment_id;
        }
        let info = {
            "timesheet_id":this.encoded_timesheet_id,
            "comment":comment,
            "company_id":this.company_id,
            "comment_id":comment_id,
            "timesheet_user_id":this.timesheet_info.timesheet_user_id
        }
        this.timesheetservice.approver_comment(info).subscribe(
            data=>{ 
                this.approver_comment = data.comment;
            }
        )
    }
}