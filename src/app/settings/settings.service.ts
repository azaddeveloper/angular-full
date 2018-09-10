import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
const URL = environment.API_url;
let company_setting_info = URL + '/settings/get_compant_setting_info';
let check_company_exist = URL + "/settings/is_company_email_exists";
let save_company_info = URL + '/settings/save_company_info';
let get_department_by_division = URL + '/settings/get_department_by_division';
let change_company_calendar = URL+'/settings/change_company_calendar';
let change_company_default_day = URL+'/settings/change_company_default_day';
let update_division_status = URL+'/settings/update_division_status';
let delete_division = URL+"/settings/delete_division";
let add_division =URL+'/settings/add_division';
let update_division = URL+"/settings/update_division_name";
let update_department_status = URL+'/settings/update_department_status';
let delete_department = URL+'/settings/delete_department';
let update_department_name = URL+'/settings/update_department_name';
let add_department = URL+'/settings/add_department';
let change_setting = URL+'/settings/change_setting';
let add_status = URL+"/settings/add_status";
let delete_status = URL+"/settings/delete_status";
let change_category_chargeable_status = URL+"/settings/changeCategoryChargeStatus";
let update_catgory_name = URL+'/settings/update_catgory_name';
let updateTaskCategoryStatus = URL+'/settings/updateTaskCategoryStatus';
let delete_category = URL+'/settings/delete_category';
let insert_category = URL +"/settings/insert_category";
let get_sub_category = URL+'/settings/setSubCategory';
let update_stafflevel = URL+'/settings/update_staff_level_name';
let update_stafflevel_status  = URL +'/settings/update_stafflevel_status';
let delete_staffLevel = URL +'/settings/delete_staffLevel';
let insert_stafflevel = URL+'/settings/insert_stafflevel';
let update_skill_name = URL+"/settings/update_skill_name";
let update_skill_status = URL+'/settings/update_skill_status';
let delete_skill = URL+'/settings/delete_skill';
let insert_skill = URL+"/settings/create_skills";
let modules_status = URL+"/settings/change_module_status";
let change_oauth_status = URL+'/settings/create_application'; 
let get_edit_user_info = URL+'/user/get_edit_user_info';
let chk_user_email_exist = URL+'/user/is_email_exists';
let get_department_by_division_url = URL+"/user/get_department_by_division";
let update_company_user_url = URL+'/user/update_company_user';
let is_company_user_exists = URL+'/user/is_company_user_exists';
let update_customer_user_info = URL+"/user/update_customer_user_info";
let delete_customerUser = URL+'/user/delete_customerUser';
let delete_company_user =URL+"/user/delete_user";

@Injectable()
export class SettingsService {

  constructor(public http: HttpClient) { }
  handler(error) {
    return Observable.throw(error.json().error || 'server error');
  }

  get_company_info(company_id, user_id) {
    let body = new HttpParams()
      .set('user_id', user_id)
      .set('company_id', company_id);

    return this.http.get(company_setting_info, { params: body }).catch(this.handler);
  }

  is_company_exist(company_id, value) {
    let body = new HttpParams()
      .set('value', value)
      .set('company_id', company_id);

    return this.http.post(check_company_exist, body).catch(this.handler);
  }

  change_company_info(data) {
    let body = new HttpParams()
      .set('info', JSON.stringify(data.info))
      .set('company_id', data.company_id);

    return this.http.post(save_company_info, body).catch(this.handler);
  }
  get_department_by_divisionid(division_id, company_id) {
    let body = new HttpParams()
      .set('division_id', division_id)
      .set('company_id', company_id)
    return this.http.get(get_department_by_division, { params: body })
      .catch(this.handler);
  }

  change_company_calendar_setting(data){
    let body = new HttpParams()
        .set('info',JSON.stringify(data));
    
    return this.http.post(change_company_calendar,body).catch(this.handler);
  }

  change_company_default_day(data){
    let body = new HttpParams()
        .set('info',JSON.stringify(data));
    return this.http.post(change_company_default_day,body).catch(this.handler);
  }

  update_division_status(data){
    let body = new HttpParams()
        .set('value',data.value)
        .set('id',data.id);
    return this.http.post(update_division_status,body).catch(this.handler);
  }
  delete_division(id){
    let body = new HttpParams()
        .set('id',id);
    return this.http.request('delete',delete_division,{body:body}).catch(this.handler);
  }

  add_division(name,company_id){
    let body = new HttpParams()
        .set('division_name',name)
        .set('company_id',company_id);
    return this.http.post(add_division,body).catch(this.handler);
  }

  update_division(id,value,company_id){
    let body = new HttpParams()
        .set('company_id',company_id)
        .set('division_name',value)
        .set('id',id);
    return this.http.request('put',update_division,{body:body}).catch(this.handler);
  }

  update_department_status(id,value){
    let body = new HttpParams()
        .set('value',value)
        .set('id',id);
    return this.http.request('put',update_department_status,{body:body}).catch(this.handler);
  }

  delete_department(id){
    let body = new HttpParams()
        .set('id',id);
    return this.http.request('delete',delete_department,{body:body}).catch(this.handler);
  }

  update_department(id,value,division_id,company_id){
    let body = new HttpParams()
        .set('division_id',division_id)
        .set('company_id',company_id)
        .set('department_name',value)
        .set('id',id);
    return this.http.request('put',update_department_name,{body:body}).catch(this.handler);
  }

  add_department(name,division_id,company_id){
    let body = new HttpParams()
        .set('department_name',name)
        .set('division_id',division_id)
        .set('company_id',company_id);
    return this.http.post(add_department,body).catch(this.handler);
  }

  change_setting(name,value,company_id){
    let body = new HttpParams()
        .set('company_id',company_id)
        .set('value',value)
        .set('name',name);
    return this.http.request('put',change_setting,{body:body}).catch(this.handler);
  }

  add_status(status_name,company_id){
    let body = new HttpParams()
        .set('status_name',status_name)
        .set('company_id',company_id);
    return this.http.post(add_status,body).catch(this.handler);
  }

  delete_status(status_id,company_id){
    let body = new HttpParams()
        .set('company_id',company_id)
        .set('status_id',status_id)
        
    return this.http.request('delete',delete_status,{body:body}).catch(this.handler);
  }

  make_charegable_category(status,category_id,company_id){
    let body = new HttpParams()
        .set('status',status)
        .set('category_id',category_id)
        .set('company_id',company_id);
    return this.http.post(change_category_chargeable_status,body).catch(this.handler);
  }

  update_category_name(info){
    let body = new HttpParams()
        .set('name',info.name)
        .set('category_id',info.category_id)
        .set('company_id',info.company_id)
        .set('type',info.type)
        .set('sub_category_id',info.sub_category_id)
        
    return this.http.post(update_catgory_name,body).catch(this.handler);
  }

  category_status(status,category_id){
    let body = new HttpParams()
        .set('category_id',category_id)
        .set('status',status)
        
    return this.http.request('put',updateTaskCategoryStatus,{body:body}).catch(this.handler);
  }
  
  delete_category(category_id){
    let body = new HttpParams()
        .set('category_id',category_id)
    return this.http.request('delete',delete_category,{body:body}).catch(this.handler);
  }

  create_category(data){
      let body = new HttpParams()
          .set('category_name',data.name)
          .set('parent_category_id',data.parent_category_id)
          .set('company_id',data.company_id)
          
      return this.http.post(insert_category,body).catch(this.handler);
  }
  
  get_sub_category_list(company_id,parent_category_id){
    let body = new HttpParams()
    .set('parent_category_id', parent_category_id)
    .set('company_id', company_id);

  return this.http.get(get_sub_category, { params: body }).catch(this.handler);
  }

  update_stafflevel_name(name,id,company_id){
    let body = new HttpParams()
        .set('name',name)
        .set('id',id)
        .set('company_id',company_id)
        
    return this.http.request('put',update_stafflevel,{body:body}).catch(this.handler);
  }
  stafflevel_status(id,value){
    let body = new HttpParams()
        .set('value',value)
        .set('id',id)
        
    return this.http.request('put',update_stafflevel_status,{body:body}).catch(this.handler);
  }

  delete_staffLevel(id){
    let body = new HttpParams()
        .set('id',id)
        
    return this.http.request('delete',delete_staffLevel,{body:body}).catch(this.handler);
  }

  insert_stafflevel(name,company_id){
    let body = new HttpParams()
          .set('name',name)
          .set('company_id',company_id)
          
      return this.http.post(insert_stafflevel,body).catch(this.handler);
  }

  change_skill_name(skill_id,skill_name,company_id){
    let body = new HttpParams()
        .set('skill_id',skill_id)
        .set('skill_name',skill_name)
        .set('company_id',company_id)
        
    return this.http.request('put',update_skill_name,{body:body}).catch(this.handler);
  }

  change_skill_status(skill_id,status){
    let body = new HttpParams()
        .set('skill_id',skill_id)
        .set('status',status)
        
    return this.http.request('put',update_skill_status,{body:body}).catch(this.handler);
  }

  delete_skill(skill_id){
    let body = new HttpParams()
    .set('skill_id',skill_id)
    
    return this.http.request('delete',delete_skill,{body:body}).catch(this.handler);
  }
  
  insert_skills(name,company_id){
    let body = new HttpParams()
    .set('name',name)
    .set('company_id',company_id)
    
    return this.http.post(insert_skill,body).catch(this.handler);
  }

  change_status_value(name,status,company_id){
    let body = new HttpParams()
    .set('name',name)
    .set('status',status)
    .set('company_id',company_id)
    
    return this.http.request('put',modules_status,{body:body}).catch(this.handler);
  }

  change_oauth_status(status,client_id,company_id){
    let body = new HttpParams()
    .set('status',status)
    .set('company_id',company_id)
    .set('client_id',client_id)
    return this.http.post(change_oauth_status,body).catch(this.handler);
  }

  get_edit_user_info(data){
    let body = new HttpParams()
    .set("user_id",data.user_id)
    .set('company_id',data.company_id);
    return this.http.get(get_edit_user_info,{params:body}).catch(this.handler);
  }

  chk_user_email_exist(data){
    let body = new HttpParams()
    .set('user_id',data.user_id)
    .set('email',data.email_id)
    .set('company_id',data.company_id);

    return this.http.get(chk_user_email_exist,{params:body}).catch(this.handler);
  }

  get_department_by_division_url(data){
    let body = new HttpParams()
    .set('division',data.division)
    .set('company_id',data.company_id);

    return this.http.get(get_department_by_division_url,{params:body}).catch(this.handler);
  }

  update_company_user_url(data){
    let body = new HttpParams()
    .set('info',JSON.stringify(data.info))
    .set('user_id',data.user_id)
    .set('managers',(data.managers))
    .set('user_managers',(data.user_managers))
    .set('company_id',data.company_id);

    return this.http.post(update_company_user_url,body).catch(this.handler);
  }
  is_company_user_exists(data){
    let body = new HttpParams()
    .set('value',data.value)
    .set('company_id',data.company_id)
    .set('user_id',data.user_id)
    
    return this.http.post(is_company_user_exists,body).catch(this.handler);
  }

  update_customer_user_info(data){
    let body = new HttpParams()
    .set('info',JSON.stringify(data.info))
    .set('company_id',data.company_id)
    .set('user_id',data.user_id)
    
    return this.http.post(update_customer_user_info,body).catch(this.handler);
  }
  delete_customerUser(user_id){
    let body = new HttpParams()
    .set('user_id',user_id)
    
    return this.http.request('delete',delete_customerUser,{body:body}).catch(this.handler);
  }

  delete_user(user_id){
    let body = new HttpParams()
    .set('user_id',user_id)
    
    return this.http.request('delete',delete_company_user,{body:body}).catch(this.handler);
  }

}
