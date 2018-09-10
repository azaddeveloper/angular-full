import { Component, OnInit, ViewContainerRef, EventEmitter, Injectable, Output, ViewChild } from '@angular/core';
import { SettingsService } from './settings.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BsModalComponent } from 'ng2-bs3-modal';
import { LoginService } from '../login/login.service';
import {environment} from '../../environments/environment';
declare var $:any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css','../../assets/css/admin_css.css'],
  providers: [SettingsService]
})
export class SettingsComponent implements OnInit {
  login_user_id: number;
  company_id: number;
  company_info: any = '';
  companySettings: FormGroup;
  timezone: any = '';
  countries: any = '';
  other_info: any = '';
  change_company_logo_config: any = { // Change this to your upload POST address:  
    url: environment.API_url + '/settings/change_company_image',
    method: 'post',
    clickable: true,
    paramName: "company_logo",
    previewTemplate: "<span></span>",
    autoReset: 1000,
  };
  @Output() change_company_logo: EventEmitter<any> = new EventEmitter<any>();
  @Output() customer_access: EventEmitter<any> = new EventEmitter<any>();
  calendar: any = '';
  days: any = [];
  division_id: any = '';
  currency_code: any = '';
  customer_module: number;
  timesheet_module: number;
  xero_integration_status: number;
  pricing_module: number;
  external_user_access: number;
  app_info: any = '';
  loader: boolean = false;
  is_owner: number;
  @ViewChild('reason')
  reason: BsModalComponent;
  @ViewChild('externalCustomer')
  externalCustomer:BsModalComponent;
  user_list: any = '';
  external_users: any = '';
  update_user_status: boolean = false;
  updated_user_info: any = '';
  frm_add_user: FormGroup;
  edit_user_info: any = '';
  externalcustomerform:FormGroup;
  customers:any = '';
  external_customer_data:any ='';
  reason_other:any = false;
  constructor(public loginservice:LoginService,public toastr: ToastsManager, vcr: ViewContainerRef, public setting_service: SettingsService, public builder: FormBuilder) {
    this.companySettings = this.builder.group({
      company_name: [null, Validators.required],
      phone: [null],
      company_email: [null, [Validators.required, Validators.email], this.check_email_exist.bind(this)],
      country: [null, Validators.required],
      address: [null],
      date_format: [null],
      timezone: [null]
    });
    this.toastr.setRootViewContainerRef(vcr);

    this.externalcustomerform = this.builder.group({
      customer_user_first:[null,Validators.required],
      customer_user_mail:[null,[Validators.required,Validators.email],this.check_external_user_email_exist.bind(this)],
      customer_user_last:[null,Validators.required],
      parent_customer:[null,Validators.required]
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
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.pricing_module = user_info.pricing_module_status;
    this.customer_module = user_info.customer_module_activation;
    this.timesheet_module = user_info.timesheet_module_status;
    this.currency_code = user_info.currency_code;
    this.xero_integration_status = user_info.xero_integration_status;
    this.is_owner = user_info.is_owner;
    this.external_user_access = user_info.external_user_access;
    this.get_company_info();
    this.set_sortable();
    this.frm_add_user = this.builder.group({
      first_name: [null, Validators.compose([Validators.pattern("^[a-zA-Z]+$"), Validators.required])],
      last_name: [null, Validators.compose([Validators.pattern("^[a-zA-Z]+$"), Validators.required])],
      email: [null, [Validators.required, Validators.email], this.check_user_email_exist.bind(this)],
      usertimezone: [null, Validators.required],
      user_division: [null],
      user_department: [null],
      user_skills: [null],
      user_staff_level: [null],
      approver_select: [null],
      selected_manager: [null],
      manager_list:[null],
      is_admin: [null],
      is_manager: [null],
      user_status: [null],
      customer_access: [null],
      xero_export_access: [null],
      MON_closed: [null],
      MON_hours: [{ value: '', disable: false }, [Validators.required]],
      TUE_closed: [null],
      TUE_hours: [{ value: '', disable: false }, [Validators.required]],
      WED_closed: [null],
      WED_hours: [{ value: '', disable: false }, [Validators.required]],
      THU_closed: [null],
      THU_hours: [{ value: '', disable: false }, [Validators.required]],
      FRI_closed: [null],
      FRI_hours: [{ value: '', disable: false }, [Validators.required]],
      SAT_closed: [null],
      SAT_hours: [{ value: '', disable: false }, [Validators.required]],
      SUN_closed: [null],
      SUN_hours: [{ value: '', disable: false }, [Validators.required]]
    });
  }

  get_company_info() {
    this.loader = true;
    this.setting_service.get_company_info(this.company_id, this.login_user_id).subscribe(
      data => {
        this.division_id = data.info.division_id;
        this.company_info = data.info.company_info;
        this.companySettings.controls['company_name'].setValue(this.company_info.company_name);
        this.companySettings.controls['phone'].setValue(this.company_info.company_phoneno);
        this.companySettings.controls['company_email'].setValue(this.company_info.company_email);
        this.companySettings.controls['address'].setValue(this.company_info.company_address);
        this.companySettings.controls['date_format'].setValue(this.company_info.company_date_format);
        this.companySettings.controls['timezone'].setValue(this.company_info.company_timezone);
        this.companySettings.controls['country'].setValue(this.company_info.country_id);
        this.timezone = data.info.timezone;
        this.countries = data.info.countries;
        this.calendar = data.info.calender;
        this.app_info = data.info.app_info;
        this.set_delault_days(this.calendar);
        this.other_info = data.info;
        this.change_company_logo_config.params = {
          "company_id": this.company_id,
          "company_old_logo": this.company_info.company_logo
        }
        this.user_list = data.info.users;
        this.external_users = data.info.customer_users;
        this.customers = data.info.customers;
        this.loader = false;
      },
      error => {
        this.loader = false;
        console.log(error);
      }
    )
  }

  check_email_exist(control: AbstractControl) {
    return this.setting_service.is_company_exist(this.company_id, control.value).map(res => {
      return res.status ? { exist: true } : null;
    });
  }

  save_setting(data) {
    let info = {
      "info": data,
      "company_id": this.company_id
    }
    this.setting_service.change_company_info(info).subscribe(
      info => {
        this.company_info.company_name = data.company_name;
      }
    )
  }

  setCompanyDepartment(division_id) {
    this.setting_service.get_department_by_divisionid(division_id, this.company_id).subscribe(
      data => {
        this.other_info.department = data.info;
      }
    )
  }

  update_company_logo_image(data) {
    let info = data[1];
    if (info.message == 'success') {
      this.toastr.success('Company logo changed successfully.', '');
      this.company_info.company_logo = info.image_name;
      let detail = {
        type:'company_image',
        status:info.image_name
      }
      this.loginservice.change_module_status(detail);
    } else {
      this.toastr.error('The filetype you are attempting to upload is not allowed.', '');
      this.company_info.company_logo = info.image_name;
    }
  }

  change_time(value) {
    let hours: any = (value / 60);
    hours = parseInt(hours)
    let minutes: any = (value - (parseInt(hours) * 60));
    if (hours == '0' && minutes == '0') {
      return '0m';
    } else if (hours != '0' && minutes == '0') {
      return hours + 'h';
    } else if (hours == '0' && minutes != '0') {
      return minutes + 'm';
    } else {
      return hours + 'h' + minutes + 'm';
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
        this.calendar.MON_closed = day_status;
        this.calendar.MON_hours = day_value
        break;
      case 'TUE':
        this.calendar.TUE_closed = day_status;
        this.calendar.TUE_hours = day_value
        break;
      case 'WED':
        this.calendar.WED_closed = day_status;
        this.calendar.WED_hours = day_value
        break;
      case 'THU':
        this.calendar.THU_closed = day_status;
        this.calendar.THU_hours = day_value
        break;
      case 'FRI':
        this.calendar.FRI_closed = day_status;
        this.calendar.FRI_hours = day_value
        break;
      case 'SAT':
        this.calendar.SAT_closed = day_status;
        this.calendar.SAT_hours = day_value
        break;
      case 'SUN':
        this.calendar.SUN_closed = day_status;
        this.calendar.SUN_hours = day_value
        break;
    }
    let info = {
      "company_id": this.company_id,
      "day_closed": day_name + '_closed',
      "day_closed_value": day_status,
      "day_hours": day_name + "_hours",
      "day_hours_value": day_value
    }
    this.setting_service.change_company_calendar_setting(info).subscribe(
      data => {
        this.set_delault_days(this.calendar);
      }
    )
  }

  convet_time(value, day_name, access = '') {
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
      this.toastr.error('only allowed number is allowed. ', '', );
    }
    let day_value = (hour * 60) + minute;
    if (access == 'user_edit') {
      if (day_value == 0) {
        day_value = '';
      }
      this.update_user_calendar_value(day_name, day_value)
    } else {
      this.update_company_calendar(day_name, day_value);
    }
  }

  update_company_calendar(day_name, day_value) {
    switch (day_name) {
      case 'MON':
        this.calendar.MON_hours = day_value
        break;
      case 'TUE':
        this.calendar.TUE_hours = day_value
        break;
      case 'WED':
        this.calendar.WED_hours = day_value
        break;
      case 'THU':
        this.calendar.THU_hours = day_value
        break;
      case 'FRI':
        this.calendar.FRI_hours = day_value
        break;
      case 'SAT':
        this.calendar.SAT_hours = day_value
        break;
      case 'SUN':
        this.calendar.SUN_hours = day_value
        break;
    }
    if (day_value != 0) {
      let info = {
        "company_id": this.company_id,
        "day_closed": day_name + '_closed',
        "day_closed_value": '1',
        "day_hours": day_name + "_hours",
        "day_hours_value": day_value
      }
      this.setting_service.change_company_calendar_setting(info).subscribe(
        data => {

        }
      )
    }
  }

  change_company_working_day(value) {

    let info = {
      "company_id": this.company_id,
      "fisrt_day_of_week": value
    }

    this.setting_service.change_company_default_day(info).subscribe(
      data => {

      }
    )
  }

  set_delault_days(calendar) {
    this.days.length = 0;
    if (calendar.MON_closed == 1) {
      this.days.push('Monday');
    }
    if (calendar.TUE_closed == 1) {
      this.days.push('Tuesday');
    }
    if (calendar.WED_closed == 1) {
      this.days.push('Wednesday');
    }
    if (calendar.THU_closed == 1) {
      this.days.push('Thursday');
    }
    if (calendar.FRI_closed == 1) {
      this.days.push('Friday');
    }
    if (calendar.SAT_closed == 1) {
      this.days.push('Saturday');
    }
    if (calendar.SUN_closed == 1) {
      this.days.push('Sunday');
    }

  }

  change_division_status(id, value) {
    let status = 'Inactive';
    if (value == true) {
      status = 'Active';
    }
    let info = {
      "id": id,
      "value": status
    }
    this.setting_service.update_division_status(info).subscribe();
  }

  delete_division(id) {
    this.setting_service.delete_division(id).subscribe(data => {
      this.other_info.divisions.forEach((element, index) => {
        if (element.division_id == id) {
          this.other_info.divisions.splice(index, 1);
        }
      });
    });
  }

  add_division(value) {
    if (value == '') {
      this.toastr.error('Please enter division name.', '');
    } else {
      this.setting_service.add_division(value, this.company_id).subscribe(
        data => {
          if (data.success == false) {
            this.toastr.error('There is an existing record with this division name.', '');
          } else {
            this.other_info.divisions.length = 0;
            this.other_info.divisions = data.divisions;
            if (data.departments != '') {
              this.other_info.department.length = 0;
              this.other_info.department = data.departments;
            }
          }
        }
      )
    }
  }

  update_division(id, value) {
    this.setting_service.update_division(id, value, this.company_id).subscribe(
      data => {
        if (data.success == false) {
          this.toastr.error('There is an existing record with this division name.', '');
          this.other_info.divisions.forEach((element, index) => {
            if (element.division_id == id) {
              this.other_info.divisions[index] = data.result;
            }
          });
        }
      }
    )
  }

  change_department_status(id, value) {
    let status = 'Inactive';
    if (value == true) {
      status = 'Active';
    }

    this.setting_service.update_department_status(id, status).subscribe();
  }

  delete_department(id) {
    this.setting_service.delete_department(id).subscribe(data => {
      this.other_info.department.forEach((element, index) => {
        if (element.department_id == id) {
          this.other_info.department.splice(index, 1);
        }
      });
    });
  }

  update_department(id, value, division_id) {
    this.setting_service.update_department(id, value, division_id, this.company_id).subscribe(
      data => {
        if (data.success == false) {
          this.toastr.error('There is an existing record with this department name.', '');
          this.other_info.department.forEach((element, index) => {
            if (element.department_id == id) {
              this.other_info.department[index] = data.result;
            }
          });
        }
      }
    )
  }

  add_department(value) {
    if (value == '') {
      this.toastr.error('Please enter department name.', '');
    } else {
      this.setting_service.add_department(value, this.division_id, this.company_id).subscribe(
        data => {
          if (data.success == false) {
            this.toastr.error('There is an existing record with this department name.', '');
          } else {
            this.other_info.department.length = 0;
            this.other_info.department = data.department;
          }
        }
      )
    }
  }

  change_setting(name, value) {
    let status = 0;
    if (value == true) {
      status = 1;
    }
    this.setting_service.change_setting(name, status, this.company_id).subscribe();
  }

  delete_status(id) {
    this.setting_service.delete_status(id, this.company_id).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('You can not delete status due to some task already assigned to it.', '');
        } else {
          this.other_info.taskStatus.forEach((element, index) => {
            if (element.task_status_id == id) {
              this.other_info.taskStatus.splice(index, 1);
            }
          });
        }
      }
    )
  }

  add_status(status_name) {
    this.setting_service.add_status(status_name, this.company_id).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('There is an existing record with this task status name.', '');
        } else {
          this.other_info.taskStatus = data.status;
        }
      }
    )
  }

  make_chargeable_category(value, category_id) {
    let status = 0;
    if (value == true) {
      status = 1;
    }
    this.setting_service.make_charegable_category(status, category_id, this.company_id).subscribe();
  }

  update_category_name(category_id, name) {
    let info = {
      "company_id": this.company_id,
      "type": 'cat',
      "name": name,
      "category_id": category_id,
      'sub_category_id': 0
    }
    this.setting_service.update_category_name(info).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('There is an existing record with this category name.', '');
          this.other_info.ParentTaskCategory.forEach((element, index) => {
            if (element.category_id == category_id) {
              this.other_info.ParentTaskCategory[index] = data.result;
            }
          });
        }
      }
    );
  }

  change_category_status(category_id, value) {
    let status = 'Inactive';
    if (value == true) {
      status = 'Active';
    }

    this.setting_service.category_status(status, category_id).subscribe();
  }

  delete_category(category_id) {
    this.setting_service.delete_category(category_id).subscribe(
      data => {
        this.other_info.ParentTaskCategory.forEach((element, index) => {
          if (element.category_id == category_id) {
            this.other_info.ParentTaskCategory.splice(index, 1);
          }
        });
      }
    )
  }

  addCategory(category_name) {
    if (category_name == '') {
      this.toastr.error('Please enter category name.', '');
    } else {
      let info = {
        "company_id": this.company_id,
        "name": category_name,
        "parent_category_id": 0
      }
      this.setting_service.create_category(info).subscribe(
        data => {
          if (data.status == false) {
            this.toastr.error('There is an existing record with this category name.', '');
          } else {
            this.other_info.ParentTaskCategory.push(data.status);
          }
        }
      )
    }
  }

  update_sub_category_name(sub_category_id, name, parent_category_id) {
    let info = {
      "company_id": this.company_id,
      "type": 'sub',
      "name": name,
      "category_id": parent_category_id,
      'sub_category_id': sub_category_id
    }
    this.setting_service.update_category_name(info).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('There is an existing record with this sub-category name.', '');
          this.other_info.subTaskCategory.forEach((element, index) => {
            if (element.category_id == sub_category_id) {
              this.other_info.subTaskCategory[index] = data.result;
            }
          });
        }
      }
    );
  }

  delete_subcategory(id) {
    this.setting_service.delete_category(id).subscribe(
      data => {
        this.other_info.subTaskCategory.forEach((element, index) => {
          if (element.category_id == id) {
            this.other_info.subTaskCategory.splice(index, 1);
          }
        });
      }
    )
  }

  add_subcategory(name) {
    if (name == '') {
      this.toastr.error('Please enter sub-category name.', '');
    } else {
      let info = {
        "company_id": this.company_id,
        "name": name,
        "parent_category_id": this.other_info.parent_category_id
      }
      this.setting_service.create_category(info).subscribe(
        data => {
          if (data.status == false) {
            this.toastr.error('There is an existing record with this sub-category name.', '');
          } else {
            this.other_info.subTaskCategory.push(data.status);
          }
        }
      )
    }
  }

  get_subcategory_list() {
    this.setting_service.get_sub_category_list(this.company_id, this.other_info.parent_category_id).subscribe(
      data => {
        this.other_info.subTaskCategory.length = 0;
        this.other_info.subTaskCategory = data.result;
      }
    )
  }

  update_stafflevel_name(staff_id, name) {
    this.setting_service.update_stafflevel_name(name, staff_id, this.company_id).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('There is an existing record with this staff level name.', '');
          this.other_info.staffLevels.forEach((element, index) => {
            if (element.staff_level_id == staff_id) {
              this.other_info.staffLevels[index] = data.result;
            }
          });
        }
      }
    )
  }

  change_staff_status(staff_id, value) {
    let status = 'Inactive';
    if (value == true) {
      status = 'Active';
    }

    this.setting_service.stafflevel_status(staff_id, status).subscribe();
  }

  delete_staff_level(id) {
    this.setting_service.delete_staffLevel(id).subscribe(
      data => {
        this.other_info.staffLevels.forEach((element, index) => {
          if (element.staff_level_id == id) {
            this.other_info.staffLevels.splice(index, 1);
          }
        });
      }
    )
  }

  create_staff_level(name) {
    if (name == '') {
      this.toastr.error('Please enter staff level name.', '');
    } else {

      this.setting_service.insert_stafflevel(name, this.company_id).subscribe(
        data => {
          if (data.status == false) {
            this.toastr.error('There is an existing record with this staff level name.', '');
          } else {
            this.other_info.staffLevels.push(data.status);
          }
        }
      )
    }
  }

  update_skill_name(id, name) {
    this.setting_service.change_skill_name(id, name, this.company_id).subscribe(
      data => {
        if (data.status == false) {
          this.toastr.error('There is an existing record with this skill name.', '');
          this.other_info.skills.forEach((element, index) => {
            if (element.skill_id == id) {
              this.other_info.skills[index] = data.result;
            }
          });
        }
      }
    )
  }

  change_skill_status(skill_id, value) {
    let status = 'Inactive';
    if (value == true) {
      status = 'Active';
    }

    this.setting_service.change_skill_status(skill_id, status).subscribe();
  }

  delete_skill(skill_id) {
    this.setting_service.delete_skill(skill_id).subscribe(
      data => {
        this.other_info.skills.forEach((element, index) => {
          if (element.skill_id == skill_id) {
            this.other_info.skills.splice(index, 1);
          }
        });
      }
    )
  }

  insert_skill(name) {
    if (name == '') {
      this.toastr.error('Please enter skill name.', '');
    } else {

      this.setting_service.insert_skills(name, this.company_id).subscribe(
        data => {
          if (data.status == false) {
            this.toastr.error('There is an existing record with this skill name.', '');
          } else {
            this.other_info.skills.push(data.status);
          }
        }
      )
    }
  }

  change_status(access, status) {
    let user_info = JSON.parse(localStorage.getItem('info'));
    if (access == 'customer') {
      if (status == true) {
        this.customer_module = 1;
        this.customer_access.emit(1);
        user_info.customer_module_activation = 1;
        localStorage.setItem('info', JSON.stringify(user_info));
      } else {
        this.customer_module = 0;
        this.customer_access.emit(0);
        user_info.customer_module_activation = 0;
        localStorage.setItem('info', JSON.stringify(user_info));
      }
      let detail = {
        status:this.customer_module,
        type:'customer'
      }
      this.loginservice.change_module_status(detail);
    } else if (access == 'price') {
      if (status == true) {
        this.pricing_module = 1;
        user_info.pricing_module_status = 1;
        localStorage.setItem('info', JSON.stringify(user_info));
      } else {
        this.pricing_module = 0;
        user_info.pricing_module_status = 0;
        localStorage.setItem('info', JSON.stringify(user_info));
      }
      let detail = {
        status:this.pricing_module,
        type:'price'
      }
      this.loginservice.change_module_status(detail);
    } else if (access == 'timesheet') {
      if (status == true) {
        this.timesheet_module = 1;
        user_info.timesheet_module_status = 1;
        localStorage.setItem('info', JSON.stringify(user_info));
      } else {
        this.timesheet_module = 0;
        user_info.timesheet_module_status = 0;
        localStorage.setItem('info', JSON.stringify(user_info));
      }
      let detail = {
        status:this.timesheet_module,
        type:'timesheet'
      }
      this.loginservice.change_module_status(detail);
    } else if (access == 'currency') {
      this.other_info.currency.forEach((element, index) => {
        if (element.currency_code == this.currency_code) {
          user_info.currency = element.currency_symbol;
        }
      });
      user_info.currency_code = this.currency_code;
      localStorage.setItem('info', JSON.stringify(user_info));
    }else if(access == 'xero'){
      if (status == true) {
        this.xero_integration_status = 1;
        user_info.xero_integration_status = 1;
        localStorage.setItem('info', JSON.stringify(user_info));
      } else {
        this.xero_integration_status = 0;
        user_info.xero_integration_status = 0;
        localStorage.setItem('info', JSON.stringify(user_info));
      }
    }
    let access1 = 0;
    if (access != 'currency') {
      if (status) {
        access1 = 1;
      }
    } else {
      access1 = this.currency_code;
    }
    this.setting_service.change_status_value(access, access1, this.company_id).subscribe(data=>{
      if(access == 'xero' && access1 == 1){
          $.ajax({
            url: 'http://localhost/schedullo/xero?authenticate=1',
            success: function(data){
              window.location.href = data;
            }
        });
      }
   });
  }

  change_oauth_status(status) {
    let client_id = '';
    if (this.app_info != '') {
      client_id = this.app_info.client_id;
    }
    let val = 0;
    if (status) {
      val = 1;
    }
    this.setting_service.change_oauth_status(val, client_id, this.company_id).subscribe(
      data => {
        this.app_info = data.status;
      }
    )
  }

  open_reason_modal() {
    this.reason.open();
  }

  close_reason_modal() {
    this.reason.close();
  }

  close_account(info) {
    let reason = info.close_reason.value;
    let info1 = info.close_reason_other.value;
    if (reason == '') {
      this.toastr.error('Please select a reason', '');
    } else if (reason == 'Other' && info1 == '') {
      this.toastr.error('Please add a vaild reason in text box.', '');
    } else {
      this.close_reason_modal();
    }
  }

  editCompanyUser(user_id) {
    this.update_user_status = true;
    this.user_list.forEach(element => {
      if (element.user_id == user_id) {
        this.updated_user_info = element;
      }
    });
    if (this.updated_user_info != '') {
      let info = {
        "user_id": user_id,
        "company_id": this.company_id
      }
      this.setting_service.get_edit_user_info(info).subscribe(
        data => {
          this.edit_user_info = data.data;
          this.edit_user_info.managers.forEach((element, index) => {
            if (element.user_id == user_id) {
              this.edit_user_info.managers.splice(index, 1);
            }
          });
          this.edit_user_info.user_managers.forEach(element1 => {
            this.edit_user_info.managers.forEach((element,index) => {
              if(element1.manager_id == element.user_id){
                this.edit_user_info.managers.splice(index,1);
              }  
            });
          });
          this.frm_add_user.controls['selected_manager'].setValue('');
          this.frm_add_user.controls['manager_list'].setValue('');
          let division = data.data.division.split(',');
          let department = data.data.department.split(',');
          let skills = data.data.skills.split(',');
          this.frm_add_user.controls['user_division'].setValue(division);
          this.frm_add_user.controls['user_department'].setValue(department);
          this.frm_add_user.controls['user_skills'].setValue(skills);
          this.frm_add_user.controls['approver_select'].setValue(this.updated_user_info.timesheet_approver_id);
          this.frm_add_user.controls['MON_closed'].setValue(this.edit_user_info.user_info.MON_closed == 1 ? true : false);
          this.frm_add_user.controls['MON_hours'].setValue(this.change_time(this.edit_user_info.user_info.MON_hours));
          this.frm_add_user.controls['TUE_closed'].setValue(this.edit_user_info.user_info.TUE_closed == 1 ? true : false);
          this.frm_add_user.controls['TUE_hours'].setValue(this.change_time(this.edit_user_info.user_info.TUE_hours));
          this.frm_add_user.controls['WED_closed'].setValue(this.edit_user_info.user_info.WED_closed == 1 ? true : false);
          this.frm_add_user.controls['WED_hours'].setValue(this.change_time(this.edit_user_info.user_info.WED_hours));
          this.frm_add_user.controls['THU_closed'].setValue(this.edit_user_info.user_info.THU_closed == 1 ? true : false);
          this.frm_add_user.controls['THU_hours'].setValue(this.change_time(this.edit_user_info.user_info.THU_hours));
          this.frm_add_user.controls['FRI_closed'].setValue(this.edit_user_info.user_info.FRI_closed == 1 ? true : false);
          this.frm_add_user.controls['FRI_hours'].setValue(this.change_time(this.edit_user_info.user_info.FRI_hours));
          this.frm_add_user.controls['SAT_closed'].setValue(this.edit_user_info.user_info.SAT_closed == 1 ? true : false);
          this.frm_add_user.controls['SAT_hours'].setValue(this.change_time(this.edit_user_info.user_info.SAT_hours));
          this.frm_add_user.controls['SUN_closed'].setValue(this.edit_user_info.user_info.SUN_closed == 1 ? true : false);
          this.frm_add_user.controls['SUN_hours'].setValue(this.change_time(this.edit_user_info.user_info.SUN_hours));
          if (this.edit_user_info.user_info.MON_closed == 0) {
            this.frm_add_user.controls['MON_hours'].disable();
          } else {
            this.frm_add_user.controls['MON_hours'].enable();
          }
          if (this.edit_user_info.user_info.TUE_closed == 0) {
            this.frm_add_user.controls['TUE_hours'].disable();
          } else {
            this.frm_add_user.controls['TUE_hours'].enable();
          }
          if (this.edit_user_info.user_info.WED_closed == 0) {
            this.frm_add_user.controls['WED_hours'].disable();
          } else {
            this.frm_add_user.controls['WED_hours'].enable();
          }
          if (this.edit_user_info.user_info.THU_closed == 0) {
            this.frm_add_user.controls['THU_hours'].disable();
          } else {
            this.frm_add_user.controls['THU_hours'].enable();
          }
          if (this.edit_user_info.user_info.FRI_closed == 0) {
            this.frm_add_user.controls['FRI_hours'].disable();
          } else {
            this.frm_add_user.controls['FRI_hours'].enable();
          }
          if (this.edit_user_info.user_info.SAT_closed == 0) {
            this.frm_add_user.controls['SAT_hours'].disable();
          } else {
            this.frm_add_user.controls['SAT_hours'].enable();
          }
          if (this.edit_user_info.user_info.SUN_closed == 0) {
            this.frm_add_user.controls['SUN_hours'].disable();
          } else {
            this.frm_add_user.controls['SUN_hours'].enable();
          }
        }
      )
      this.frm_add_user.controls['first_name'].setValue(this.updated_user_info.first_name);
      this.frm_add_user.controls['last_name'].setValue(this.updated_user_info.last_name);
      this.frm_add_user.controls['email'].setValue(this.updated_user_info.email);
      this.frm_add_user.controls['usertimezone'].setValue(this.updated_user_info.user_time_zone);
      this.frm_add_user.controls['is_admin'].setValue(this.updated_user_info.is_administrator == 1 ? true : false);
      this.frm_add_user.controls['is_manager'].setValue(this.updated_user_info.is_manager == 1 ? true : false);
      this.frm_add_user.controls['user_status'].setValue(this.updated_user_info.user_status == 'Active' ? true : false);
      this.frm_add_user.controls['user_staff_level'].setValue(this.updated_user_info.staff_level);
      this.frm_add_user.controls['customer_access'].setValue(this.updated_user_info.customer_module_access == 1 ? true : false);
      this.frm_add_user.controls['xero_export_access'].setValue(this.updated_user_info.xero_access == 1 ? true : false);

    }

  }
  cancel() {
    this.update_user_status = false;
    this.updated_user_info = '';
  }

  update_user(detail) {
    this.loader= true;
    let user_managers = [];
    let manager_list = [];
    this.edit_user_info.managers.forEach((element, index) => {
      manager_list.push(element.user_id);
    });
    this.edit_user_info.user_managers.forEach((element, index) => {
      user_managers.push(element.manager_id);
    });
    let info = {
      "user_id": this.updated_user_info == ''?'':this.updated_user_info.user_id,
      "company_id": this.company_id,
      "info": detail,
      "managers":manager_list,
      "user_managers":user_managers
    }
    
    this.setting_service.update_company_user_url(info).subscribe(
      data => {
        if(this.updated_user_info !=''){
          this.user_list.forEach((element,index) => {
            if(element.user_id == this.updated_user_info.user_id){
              this.user_list[index] = data.data;
            }
          });
        }else{
          this.user_list.push(data.data);
          this.other_info.total_company_users = this.user_list.length; 
        }
        this.cancel();
        this.loader =false;
      },
      error=>{
        console.log(error);
        this.loader = false;
      }
    )
  }

  set_user_calendar_day(value, day_name) {
    let day_value = 0;
    let day_status = 0;
    if (value == true) {
      day_value = 480;
      day_status = 1;
    }
    switch (day_name) {
      case 'MON':
        this.frm_add_user.controls['MON_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['MON_hours'].disable();
        } else {
          this.frm_add_user.controls['MON_hours'].enable();
        }
        break;
      case 'TUE':
        this.frm_add_user.controls['TUE_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['TUE_hours'].disable();
        } else {
          this.frm_add_user.controls['TUE_hours'].enable();
        }
        break;
      case 'WED':
        this.frm_add_user.controls['WED_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['WED_hours'].disable();
        } else {
          this.frm_add_user.controls['WED_hours'].enable();
        }
        break;
      case 'THU':
        this.frm_add_user.controls['THU_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['THU_hours'].disable();
        } else {
          this.frm_add_user.controls['THU_hours'].enable();
        }
        break;
      case 'FRI':
        this.frm_add_user.controls['FRI_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['FRI_hours'].disable();
        } else {
          this.frm_add_user.controls['FRI_hours'].enable();
        }
        break;
      case 'SAT':
        this.frm_add_user.controls['SAT_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['SAT_hours'].disable();
        } else {
          this.frm_add_user.controls['SAT_hours'].enable();
        }
        break;
      case 'SUN':
        this.frm_add_user.controls['SUN_hours'].setValue(this.change_time(day_value));
        if (day_status == 0) {
          this.frm_add_user.controls['SUN_hours'].disable();
        } else {
          this.frm_add_user.controls['SUN_hours'].enable();
        }
        break;
    }
  }

  update_user_calendar_value(day_name, day_value) {
    switch (day_name) {
      case 'MON':
        if (day_value != 0) {
          this.frm_add_user.controls['MON_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['MON_hours'].setValue('');
        }
        break;
      case 'TUE':
        if (day_value != 0) {
          this.frm_add_user.controls['TUE_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['TUE_hours'].setValue('');
        }
        break;
      case 'WED':
        if (day_value != 0) {
          this.frm_add_user.controls['WED_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['WED_hours'].setValue('');
        }
        break;
      case 'THU':
        if (day_value != 0) {
          this.frm_add_user.controls['THU_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['THU_hours'].setValue('');
        }
        break;
      case 'FRI':
        if (day_value != 0) {
          this.frm_add_user.controls['FRI_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['FRI_hours'].setValue('');
        }
        break;
      case 'SAT':
        if (day_value != 0) {
          this.frm_add_user.controls['SAT_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['SAT_hours'].setValue('');
        }
        break;
      case 'SUN':
        if (day_value != 0) {
          this.frm_add_user.controls['SUN_hours'].setValue(this.change_time(day_value));
        } else {
          this.frm_add_user.controls['SUN_hours'].setValue('');
        }
        break;
    }
  }

  check_user_email_exist(control: AbstractControl) {
    let info = {
      "user_id": this.updated_user_info.user_id,
      "company_id": this.company_id,
      "email_id": control.value
    }
    return this.setting_service.chk_user_email_exist(info).map(res => {
      return res.status ? { exist: true } : null;
    });
  }

  getDepartmentList() {
    let info = {
      "company_id": this.company_id,
      "division": this.frm_add_user.get('user_division').value
    }
    this.setting_service.get_department_by_division_url(info).subscribe(data => {
      this.edit_user_info.company_department = data.list;
    })
  }

  push_right_box(){
    let data = this.frm_add_user.get('manager_list').value;
    this.edit_user_info.managers.forEach((element,index) => {
      data.forEach(element1 => {
        if(element.user_id == element1){
            let info = {
             "manager_id":element.user_id,
             "first_name":element.first_name,
             "last_name":element.last_name
            }
            this.edit_user_info.user_managers.push(info);
            this.edit_user_info.managers.splice(index,1);
        }  
      });
    });
  }
  push_left_box(){
    let data = this.frm_add_user.get('selected_manager').value;
    this.edit_user_info.user_managers.forEach((element,index) => {
      data.forEach(element1 => {
        if(element.manager_id == element1){
            let info = {
             "user_id":element.manager_id,
             "first_name":element.first_name,
             "last_name":element.last_name
            }
            this.edit_user_info.managers.push(info);
            this.edit_user_info.user_managers.splice(index,1);
        }  
      });
    });
  }

  add_new_user(){
    this.update_user_status = true;
    this.updated_user_info = '';
    let info = {
      "user_id": '',
      "company_id": this.company_id
    }
    this.setting_service.get_edit_user_info(info).subscribe(
      data => {
        this.edit_user_info = data.data;
        this.frm_add_user.controls['selected_manager'].setValue('');
        this.frm_add_user.controls['manager_list'].setValue('');
        this.frm_add_user.controls['user_division'].setValue('');
        this.frm_add_user.controls['user_department'].setValue('');
        this.frm_add_user.controls['user_skills'].setValue('');
        this.frm_add_user.controls['approver_select'].setValue('');
        this.frm_add_user.controls['MON_closed'].setValue(true);
        this.frm_add_user.controls['MON_hours'].setValue(this.change_time(480));
        this.frm_add_user.controls['TUE_closed'].setValue(true);
        this.frm_add_user.controls['TUE_hours'].setValue(this.change_time(480));
        this.frm_add_user.controls['WED_closed'].setValue(true);
        this.frm_add_user.controls['WED_hours'].setValue(this.change_time(480));
        this.frm_add_user.controls['THU_closed'].setValue(true);
        this.frm_add_user.controls['THU_hours'].setValue(this.change_time(480));
        this.frm_add_user.controls['FRI_closed'].setValue(true);
        this.frm_add_user.controls['FRI_hours'].setValue(this.change_time(480));
        this.frm_add_user.controls['SAT_closed'].setValue(false);
        this.frm_add_user.controls['SAT_hours'].setValue(this.change_time(0));
        this.frm_add_user.controls['SUN_closed'].setValue(false);
        this.frm_add_user.controls['SUN_hours'].setValue(this.change_time(0));
        this.frm_add_user.controls['MON_hours'].enable();
        this.frm_add_user.controls['TUE_hours'].enable();
        this.frm_add_user.controls['WED_hours'].enable();
        this.frm_add_user.controls['THU_hours'].enable();
        this.frm_add_user.controls['FRI_hours'].enable();
        this.frm_add_user.controls['SAT_hours'].disable();
        this.frm_add_user.controls['SUN_hours'].disable();
        
      }
    )
    this.frm_add_user.controls['first_name'].setValue('');
    this.frm_add_user.controls['last_name'].setValue('');
    this.frm_add_user.controls['email'].setValue('');
    this.frm_add_user.controls['usertimezone'].setValue('');
    this.frm_add_user.controls['is_admin'].setValue(false);
    this.frm_add_user.controls['is_manager'].setValue(false);
    this.frm_add_user.controls['user_status'].setValue(true);
    this.frm_add_user.controls['user_staff_level'].setValue('');
    this.frm_add_user.controls['customer_access'].setValue(false);
    this.frm_add_user.controls['xero_export_access'].setValue(false);

  }

  open_external_customer_modal(data){
    if(data !=''){
      this.external_customer_data = data;
      this.externalcustomerform.controls['customer_user_first'].setValue(this.external_customer_data.first_name);
      this.externalcustomerform.controls['customer_user_last'].setValue(this.external_customer_data.last_name);
      this.externalcustomerform.controls['customer_user_mail'].setValue(this.external_customer_data.email);
      this.externalcustomerform.controls['parent_customer'].setValue(this.external_customer_data.customer_user_id);
    }else{
      this.external_customer_data = '';
      this.externalcustomerform.controls['customer_user_first'].setValue('');
      this.externalcustomerform.controls['customer_user_last'].setValue('');
      this.externalcustomerform.controls['customer_user_mail'].setValue('');
      this.externalcustomerform.controls['parent_customer'].setValue('');
    }
    this.externalCustomer.open();
  }
  close_external_customer_modal(){
    this.external_customer_data = '';
    this.externalCustomer.close();
  }

  check_user_under_manager(){
    if(this.edit_user_info.count > 0){
      this.frm_add_user.controls['is_manager'].setValue(true);
      this.toastr.error('Please remove employees reporting to the user before removing manager\'s rights.', '');
    }
  }

  check_external_user_email_exist(control: AbstractControl) {
    let info = {
      "user_id": this.external_customer_data !=''?this.external_customer_data.user_id:'',
      "value": control.value,
      'company_id':this.company_id
    }
    return this.setting_service.is_company_user_exists(info).map(res => {
      return res.status ? { exist: true } : null;
    });
  }

  update_external_customer_data(value){
    let user_id = this.external_customer_data !=''?this.external_customer_data.user_id:'';
    let info = {
      "user_id": user_id,
      "company_id":this.company_id,
      "info":value
    }
    this.setting_service.update_customer_user_info(info).subscribe(
      data=>{
        if(user_id !=''){
          this.external_users.forEach((element,index) => {
            if(element.user_id == user_id){
              this.external_users[index] = data.info;
            }
          });
        }else{
          this.external_users.push(data.info);
        }
        this.close_external_customer_modal();
      }
    )
  }

  delete_external_user(user_id,task_count){
    if(task_count == 0){
      this.setting_service.delete_customerUser(user_id).subscribe(
        data=>{
          this.external_users.forEach((element,index) => {
            if(element.user_id == user_id){
              this.external_users.splice(index,1);
            }
          });
          this.toastr.success('External user has been deleted successfully.','');
        }
      )
    }else{
      this.toastr.error('You can not delete Customer user due to some task already assigned to it.', '');
    }
  }

  delete_user(user_id){
    this.setting_service.delete_user(user_id).subscribe(
      data=>{
        this.user_list.forEach((element,index) => {
          if(element.user_id == user_id){
            this.user_list.splice(index,1);
          }
        });
        this.toastr.success('User has been deleted successfully.','');
        this.other_info.total_company_users = this.user_list.length; 
      }
    )
  }

  set_sortable(){
    $("#company_divisions").sortable({
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
          var t = $(this).attr("id");
          var new_position = $("#" + t).sortable("toArray");
          $.ajax({
            url:environment.API_url+'/settings/set_division_seq',
            type:'post',
            data:{new_position:new_position},
            success:function(responseData){
            }
        });
      }});
      $("#company_divisions" ).disableSelection();
      $("#company_departments").sortable({
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
            var t = $(this).attr("id");
            var new_position = $("#" + t).sortable("toArray");
            $.ajax({
              url:environment.API_url+'/settings/set_company_department_seq',
              type:'post',
              data:{new_position:new_position},
              success:function(responseData){
              }
          });
        }});
      $("#company_departments" ).disableSelection();
      $("#addStatus" ).sortable({
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
                  url:environment.API_url+'/settings/updateTaskSequence',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
         
        });
        $( "#addStatus" ).disableSelection();

        $("#company_mainCategory" ).sortable({
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
                  url:environment.API_url+'/settings/setMainCategorySeq',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
        });
        $( "#company_mainCategory" ).disableSelection();

        $("#company_subTaskCategory" ).sortable({
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
                  url:environment.API_url+'/settings/setMainCategorySeq',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
        });
        $( "#company_subTaskCategory" ).disableSelection();

        $("#company_staffLevels" ).sortable({
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
                  url:environment.API_url+'/settings/set_company_staff_levels_seq',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
        });
        $( "#company_staffLevels" ).disableSelection();

        $("#company_skills" ).sortable({
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
                  url:environment.API_url+'/settings/set_company_skills_seq',
                  type:'post',
                  data:{new_position:new_position},
                  success:function(responseData){
                  }
              });
          },
        });
        $( "#company_skills" ).disableSelection();
  }
}
