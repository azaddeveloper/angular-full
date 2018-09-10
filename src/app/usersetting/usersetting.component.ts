import { Component, OnInit ,ViewContainerRef,EventEmitter} from '@angular/core';
import {LoginService} from '../login/login.service';
import {UsersettingService} from './usersetting.service';
import { FormGroup, FormBuilder, Validators,AbstractControl } from '@angular/forms';
import {TaskService} from '../services/task.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {PasswordMatchValidation} from './custom.validation';
declare var $:any;
import {environment} from '../../environments/environment';
@Component({
  selector: 'app-usersetting',
  templateUrl: './usersetting.component.html',
  styleUrls: ['./usersetting.component.css','../../assets/css/admin_css.css'],
  providers:[UsersettingService]
})
export class UsersettingComponent implements OnInit {
  
  login_user_id:number;
  company_id:number;
  user_info:any='';
  Image_url:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
  other_info:any = '';
  userinfosetting:FormGroup;
  is_admin:number;
  color:any;
  loader:boolean = false;
  add_background_config:any= { // Change this to your upload POST address:  
    url: environment.API_url+'/user/upload_background_image',
    method:'post' ,
    clickable:true,
    paramName: "background_image",
    previewTemplate:"<span></span>",
    autoReset:1000,
 };
 change_profile_config:any= { // Change this to your upload POST address:  
  url: environment.API_url+'/user/myprofile_logo',
  method:'post' ,
  clickable:true,
  paramName: "profile_image",
  previewTemplate:"<span></span>",
  autoReset:1000,
};
changePassword:FormGroup;
notification:any='';
colors:any='';
gmail_sync:number;
outlook_sync:number;
password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,16}$/;
gmail_auth_url:any = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=761985955733-lgulhp7pheogabuv29k4codqtgajtcsp.apps.googleusercontent.com&redirect_uri=http://192.168.1.2/schedullo/user/gmail_access&state=12345&scope=https://www.googleapis.com/auth/calendar&prompt=consent&access_type=offline";

old_password:any = false;
new_password:any = false;
  constructor(public loginservice:LoginService,public toastr: ToastsManager,vcr: ViewContainerRef,public task_service:TaskService,public user_setting_service:UsersettingService, public login_service:LoginService,public builder:FormBuilder) {
    let store_user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = store_user_info.user_id
        this.company_id = store_user_info.company_id;
        this.is_admin = store_user_info.is_administrator;
        this.gmail_sync = store_user_info.gmail_sync;
        this.outlook_sync = store_user_info.outlook_synchronization_on;
        this.add_background_config.params ={
          "user_id":this.login_user_id
        }
        this.change_profile_config.params = {
          "user_id":this.login_user_id
        }
        this.userinfosetting = this.builder.group({
          first_name:[null, Validators.compose([Validators.required,Validators.maxLength(25),Validators.pattern("^[a-zA-Z]+$")])],
          last_name:[null, Validators.compose([Validators.required,Validators.maxLength(25),Validators.pattern("^[a-zA-Z]+$")])],
          email:[null,[Validators.required,Validators.email],this.check_email_exist.bind(this)],
          mobile:[null, Validators.compose([Validators.pattern('')])],
          user_time_zone:[null,Validators.required],
          user_default_page:[null],
          tag_division:[null],
          tag_department:[null]
        })
        this.toastr.setRootViewContainerRef(vcr);
        this.changePassword = this.builder.group({
          old_password:[null,[Validators.required],this.check_old_password.bind(this)],
          new_password:[null,[Validators.required,Validators.pattern(this.password_pattern)]],
          confirm_password:[null,[Validators.required]]
        }, {
          validator: PasswordMatchValidation.MatchPassword // password match validation method
        })
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
  ngOnInit() {
    this.loader = true;
    this.user_setting_service.get_user_info(this.login_user_id,this.company_id).subscribe(
      data=>{ console.log(data);
        this.user_info = data.info.user_info;
        this.other_info = data.info;
        if(this.user_info.user_background_type == 'Color'){
          this.color = this.user_info.user_background_name;
        }
        this.colors = data.info.colors;
        this.notification = data.info.notification_info;
        this.userinfosetting.controls['first_name'].setValue(this.user_info.first_name);
        this.userinfosetting.controls['last_name'].setValue(this.user_info.last_name);
        this.userinfosetting.controls['email'].setValue(this.user_info.email);
        this.userinfosetting.controls['mobile'].setValue(this.user_info.contact_no);
        this.userinfosetting.controls['user_time_zone'].setValue(this.user_info.user_time_zone);
        this.userinfosetting.controls['user_default_page'].setValue(this.user_info.user_default_page);
        this.userinfosetting.controls['tag_division'].setValue(this.other_info.tags_division.split(','));
        this.userinfosetting.controls['tag_department'].setValue(this.other_info.tags_department.split(','));
        this.loader = false;
        $("#colors_table" ).sortable({
          forcePlaceholderSize: !0,
          scroll: !1,
          placeholder: "drag-place-holder",
          scrollSensitivity: 10,
          scrollSpeed: 40,
          containerPath: "tbody",
          connectWith: "table",
          itemSelector: "tr",
          tolerance: "pointer",
          dropOnEmpty: !0,
          update: function(e, a) {
              var t = $(this).attr("id"),
                  new_position = $("#" + t).sortable("toArray");
              $.ajax({
                  url:environment.API_url+'/user/set_colors_seq',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
        });
        $( "#colors_table" ).disableSelection();
      }
    )
  }

  update_user_info(data){
    this.loader = true;
    let datail = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "info":data
    }
    this.user_setting_service.update_user_info(datail).subscribe(data=>{
      this.toastr.success('Settings saved successfully.', '');
      this.loader = false;
    })
  }

  getdepartment(){ 
    let division = this.userinfosetting.controls['tag_division'].value;
    this.task_service.get_department_by_divisionid(division, this.company_id).subscribe(
      data => { 
        this.other_info.department = data.data;
        this.userinfosetting.controls['tag_department'].setValue(this.other_info.tags_department.split(','));
      },
      error => {
      }
    );
  }

  check_email_exist(control: AbstractControl){
    return this.user_setting_service.is_email_exist(control.value,this.login_user_id,this.company_id).map(res => {
      return res.status ? { exist: true } : null;
    });
  }

  set_background_color(color){
    this.loader = true;
    this.user_setting_service.set_background_color(color,this.login_user_id).subscribe(
      data=>{
        this.user_info.user_background_type = 'Color';
        this.user_info.user_background_name = color;
        localStorage.setItem('user_background_type','Color');
        localStorage.setItem('user_background_name',color);
        this.loader = false;
      }
    )
  }

  Addbackground(data){
    let file = data[1].image;
    this.user_info.user_background_type = 'Image';
    this.user_info.user_background_name = file;
    localStorage.setItem('user_background_type','Image');
    localStorage.setItem('user_background_name',file);
    this.toastr.success('Background Image successfully uploaded.','');
  }

  set_default_background(){
    this.user_setting_service.set_default_background(this.login_user_id).subscribe(
      data=>{
        this.user_info.user_background_type = 'DefaultImage';
        this.user_info.user_background_name = '';
        localStorage.setItem('user_background_type','DefaultImage');
        localStorage.setItem('user_background_name','');
      }
    )
  }

  update_user_image(data){
    let file = data[1].image;
    this.user_info.profile_image = file;
    let detail = {
      type:'user_image',
      status:this.user_info.profile_image
    }
    this.loginservice.change_module_status(detail);
  }
  check_old_password(control: AbstractControl){
    return this.user_setting_service.check_old_password(control.value,this.login_user_id).map(res => {
       return res.status ? null:{ exist: true } ;
    });
  }

  change_password(data){
    this.user_setting_service.change_password(data.new_password,this.login_user_id).subscribe(
      data=>{
        this.toastr.success('Password changed successfully.','');
        this.changePassword.reset();
      }
    )
  }

  change_notification_setting(value,name){
    let status = 0;
    if(value == true){
      status =1;
    }
   this.user_setting_service.change_notification_detail(name,status,this.login_user_id).subscribe(data=>{});
  }

  change_time(value){
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

  set_calendar_day(day_name, value) {
    let day_value = 0;
    let day_status = 0;
    if (value == true) {
      day_value = 480;
      day_status = 1;
    }
    switch (day_name) {
      case 'MON':
        this.user_info.MON_closed = day_status;
        this.user_info.MON_hours = day_value
        break;
      case 'TUE':
        this.user_info.TUE_closed = day_status;
        this.user_info.TUE_hours = day_value
        break;
      case 'WED':
        this.user_info.WED_closed = day_status;
        this.user_info.WED_hours = day_value
        break;
      case 'THU':
        this.user_info.THU_closed = day_status;
        this.user_info.THU_hours = day_value
        break;
      case 'FRI':
        this.user_info.FRI_closed = day_status;
        this.user_info.FRI_hours = day_value
        break;
      case 'SAT':
        this.user_info.SAT_closed = day_status;
        this.user_info.SAT_hours = day_value
        break;
      case 'SUN':
        this.user_info.SUN_closed = day_status;
        this.user_info.SUN_hours = day_value
        break;
    }
    let info = {
      "user_id":this.login_user_id,
      "day_closed":day_name+'_closed',
      "day_closed_value":day_status,
      "day_hours":day_name+"_hours",
      "day_hours_value":day_value
    }
    this.user_setting_service.change_user_calendar_setting(info).subscribe(
      data=>{
        
      }
    )
  }

  update_color_name(name,user_color_id){
    this.user_setting_service.update_color_name(name,user_color_id,this.login_user_id).subscribe(
      data=>{
        this.colors.forEach(element => {
            if(element.user_color_id == user_color_id){
              element.name = name;
            }
        });
      }
    )
  }

  change_color_status(value,user_color_id){
    let status = "Inactive";
    if(value == true){
      status = 'Active';
    }
    this.user_setting_service.update_color_status(status,user_color_id,this.login_user_id).subscribe(
      data=>{
        this.colors.forEach(element => {
          if(element.user_color_id == user_color_id){
            element.status = status;
          }
      });
      }
    )
  }

  change_default_color(value){
    this.user_setting_service.change_default_color(value,this.login_user_id).subscribe(
      data=>{

      }
    )
  }

  convet_time(value,day_name) {
    let hour: any = 0;
    let minute: any = 0;
    length = value.length;
    var numbers = /^[0-9\.\:\/]+$/;
    if (value.match(numbers)) {
      var int_regx = /^[0-9]+$/;
      var int_dot_regx = /^[0-9\.\/]+$/;
      if (value.match(int_regx)) {
        if (length > 4) {
          this.toastr.error('Only allowed 4 digit number.', '');
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
          this.toastr.error('Please enter a valid number.', '');
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
            this.toastr.error('Please enter a vaild number.', '');
          }
        }

      }
    } else {
      this.toastr.error('only allowed number is allowed. ', '',);
    }
    let day_value = (hour * 60) + minute;
    switch (day_name) {
      case 'MON':
        this.user_info.MON_hours = day_value
        break;
      case 'TUE':
        this.user_info.TUE_hours = day_value
        break;
      case 'WED':
        this.user_info.WED_hours = day_value
        break;
      case 'THU':
        this.user_info.THU_hours = day_value
        break;
      case 'FRI':
        this.user_info.FRI_hours = day_value
        break;
      case 'SAT':
        this.user_info.SAT_hours = day_value
        break;
      case 'SUN':
        this.user_info.SUN_hours = day_value
        break;
    }
   if(day_value !=0){
    let info = {
      "user_id":this.login_user_id,
      "day_closed":day_name+'_closed',
      "day_closed_value":'1',
      "day_hours":day_name+"_hours",
      "day_hours_value":day_value
    }
    this.user_setting_service.change_user_calendar_setting(info).subscribe(
      data=>{
        
      }
    )
   }
  }

  gmail_integration(status){
    let s = 0;
    if(status){
      s = 1;
    }
    let info ={
      user_id:this.login_user_id,
      status:s
    }
    let local_data = JSON.parse(localStorage.getItem('info'));
    local_data.gmail_sync = s;
    localStorage.setItem('info', JSON.stringify(local_data))
    this.user_setting_service.gmail_integartion(info).subscribe(
      data=>{
        if(s == 1){
          window.location.href = 'https://accounts.google.com/signin/oauth/oauthchooseaccount?client_id=761985955733-lgulhp7pheogabuv29k4codqtgajtcsp.apps.googleusercontent.com&as=LUaDGrq1wSGOxMnZL59W0g&destination=http%3A%2F%2Flocalhost&approval_state=!ChRkQVpQZERGOHI3ODN0X0xEUlRNahIfUXhRVWdvZGQ3VW9iOEhuU1JuY2dubXAtb2xrQ1R4WQ%E2%88%99ANKMe1QAAAAAW2GcqTEF9cbvKE3fNFspy9qqj3Ilu3kN&xsrfsig=AHgIfE-zm33eAoBQv69E3gAjpmUIl70E2Q&flowName=GeneralOAuthFlow';
        }
      }
    )
  }

  outlook_integration(status){
    let s = 0;
    if(status){
      s = 1;
    }
    let info ={
      user_id:this.login_user_id,
      status:s
    }
    let local_data = JSON.parse(localStorage.getItem('info'));
    local_data.outlook_synchronization_on = s;
    localStorage.setItem('info', JSON.stringify(local_data))
    this.user_setting_service.outlook_integration(info).subscribe(
      data=>{
        if(s == 1){
          window.location.href = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?state=52f47444ef7562e956c164f7d4669329&scope=openid%20profile%20offline_access%20User.Read%20Mail.Read%20Calendars.Read%20Contacts.Read&response_type=code&approval_prompt=auto&redirect_uri=http://localhost/schedullo/user/outlook_synchronization&client_id=79faae9e-b01b-4312-a7b3-30cbc7471095';
        }
      }
    )
  }
}
