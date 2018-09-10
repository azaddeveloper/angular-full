import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
const URL = environment.API_url;
let user_info_url = URL+'/user/my_setting';
let chech_email_exist = URL+'/user/is_email_exists';
let update_user_info_url = URL+'/user/update_user_info';
let set_background_color = URL+'/user/set_background_color';
let set_default_background = URL+'/user/set_default_background';
let check_old_password_url = URL+'/user/check_old_password';
let change_password_url = URL+'/user/change_password';
let update_notification_info = URL+'/user/set_notification_info';
let change_user_calendar = URL +'/user/save_calendar_setting';
let update_color_name_url = URL+'/user/update_color_name';
let change_color_status_url = URL+'/user/change_color_status';
let change_default_color_url = URL+'/user/change_default_color';
let gmail_integartion = URL+'/user/gmail_integartion';
let outlook_integration = URL+'/user/outlook_integration';
@Injectable()
export class UsersettingService {

  constructor(public http:HttpClient) { }
  handler(error) {
    return Observable.throw(error.json().error || 'server error');
  }

  get_user_info(user_id,company_id){
    let body = new HttpParams()
      .set('user_id',user_id)
      .set('company_id',company_id);

      return this.http.get(user_info_url,{params:body}).catch(this.handler);
  }

  is_email_exist(email_id,user_id,company_id){
    let body = new HttpParams()
    .set('user_id',user_id)
    .set('email',email_id)
    .set('company_id',company_id);

    return this.http.get(chech_email_exist,{params:body}).catch(this.handler);
  }

  update_user_info(data){
    let body = new HttpParams()
      .set('user_id',data.user_id)
      .set('info',JSON.stringify(data.info))
      .set('company_id',data.company_id);

      return this.http.request('put',update_user_info_url,{ body: body }).catch(this.handler);
  }

  set_background_color(color,user_id){
    let body = new HttpParams()
        .set('user_id',user_id)
        .set('color',color);
    
    return this.http.post(set_background_color,body).catch(this.handler);
  }
  set_default_background(user_id){
    let body = new HttpParams()
        .set('user_id',user_id);
    
    return this.http.post(set_default_background,body).catch(this.handler);
  }

  check_old_password(password,user_id){
    let body = new HttpParams()
    .set('user_id',user_id)
    .set('password',password);

    return this.http.get(check_old_password_url,{params:body}).catch(this.handler);
  }

  change_password(new_password,user_id){
    let body = new HttpParams()
        .set('new_password',new_password)
        .set('user_id',user_id);
    
    return this.http.post(change_password_url,body).catch(this.handler);
  }
  change_notification_detail(name,value,user_id){
    let body = new HttpParams()
        .set('name',name)
        .set('value',value)
        .set('user_id',user_id);
    
    return this.http.post(update_notification_info,body).catch(this.handler);
  }

  change_user_calendar_setting(data){
    let body = new HttpParams()
        .set('info',JSON.stringify(data));
    
    return this.http.post(change_user_calendar,body).catch(this.handler);
  }

  update_color_name(name,user_color_id,user_id){
    let body = new HttpParams()
        .set('user_id',user_id)
        .set('user_color_id',user_color_id)
        .set('color_name',name);
    
    return this.http.post(update_color_name_url,body).catch(this.handler);
  }

  update_color_status(status,user_color_id,user_id){
    let body = new HttpParams()
        .set('user_id',user_id)
        .set('user_color_id',user_color_id)
        .set('status',status);
    
    return this.http.post(change_color_status_url,body).catch(this.handler);
  }

  change_default_color(color_id,user_id){
    let body = new HttpParams()
        .set('user_id',user_id)
        .set('color_id',color_id);
    
    return this.http.post(change_default_color_url,body).catch(this.handler);
  }

  gmail_integartion(data){
    let body = new HttpParams()
        .set('user_id',data.user_id)
        .set('status',data.status);
    
    return this.http.post(gmail_integartion,body).catch(this.handler);
  }

  outlook_integration(data){
    let body = new HttpParams()
    .set('user_id',data.user_id)
    .set('status',data.status);

return this.http.post(outlook_integration,body).catch(this.handler);
  }
}
