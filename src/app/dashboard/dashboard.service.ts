import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
const URL = environment.API_url;
let getdashboard = URL + '/Userdashboard/getUserDashboard';
let NextInstanceUrl = URL + '/kanban/get_next_recurring_instance';
let todo_Ajax = URL + '/userdashboard/todo_Ajax';
let update_due_date = URL + "/Calender/updateDueDate";
let update_scheduled_date = URL +"/calender/updateSchedulledDate";
let delete_watch_list = URL+'/userdashboard/delete_watch_list';
let task_nextweek = URL+"/userdashboard/task_nextweek";
let task_previousweek = URL+"/userdashboard/task_previousweek";
let capacity_dashboard = URL+"/userdashboard/get_capacity_dashboard_info";
let ajax_capacity_dashboard = URL+'/userdashboard/ajax_capacity_dashboard';
let ajax_capacity_dashboard_data = URL+"/userdashboard/ajax_change_date_data";
@Injectable()
export class DashboardService {

  constructor(private http: HttpClient) { }
  handler(error) {
    return Observable.throw(error.json().error || 'server error');
  }
  getdashboard(data) {
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set("company_id", data.company_id);

    return this.http.get(getdashboard, { params: myParams }).catch(this.handler);
  }
  /**
     * Get kanban next recurring instance
     */
  getNextInstance(data) {
    let myParams = new HttpParams()
      .set('user_id', data.user_id)
      .set('task_id', data.task_id)
      .set('company_id', data.company_id);

    return this.http.get(NextInstanceUrl, { params: myParams }).timeout(40000).catch(this.handler);
  }
  todo_ajax(data) {
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set('type', data.type)
      .set('duration', data.duration)
      .set("company_id", data.company_id);

    return this.http.get(todo_Ajax, { params: myParams }).catch(this.handler);
  }

  update_due_date(data) {
    let myParams = new HttpParams()
    .set("user_id", data.user_id)
    .set('date', data.date)
    .set('post_data', JSON.stringify(data.data))
    .set('type',data.type)
    .set('duration',data.duration)
    .set("company_id", data.company_id);

    return this.http.request('put',update_due_date,{body:myParams}).catch(this.handler);
  }

  update_scheduled_date(data) {
    let myParams = new HttpParams()
    .set("user_id", data.user_id)
    .set('date', data.date)
    .set('post_data', JSON.stringify(data.data))
    .set('type',data.type)
    .set('duration',data.duration)
    .set("company_id", data.company_id);

    return this.http.request('put',update_scheduled_date,{body:myParams}).catch(this.handler);
  }

  delete_watch_list(id){
    let myParams = new HttpParams()
    .set("id", id);
    return this.http.request('delete',delete_watch_list,{body:myParams}).catch(this.handler);
  }

  get_nextweek_task(user_id,company_id){
    let myParams = new HttpParams()
      .set("user_id", user_id)
      .set("company_id", company_id);

    return this.http.get(task_nextweek, { params: myParams }).catch(this.handler);
  }

  get_preweek_task(user_id,company_id){
    let myParams = new HttpParams()
      .set("user_id", user_id)
      .set("company_id", company_id);

    return this.http.get(task_previousweek, { params: myParams }).catch(this.handler);
  }

  get_capacity_dashboard(data) {
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set("company_id", data.company_id);

    return this.http.get(capacity_dashboard, { params: myParams }).catch(this.handler);
  }
  ajax_capacity_dashboard(data){
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set('type',data.type)
      .set('user_filter',data.user_filter)
      .set('select_user',data.select_user)
      .set('date',data.date)
      .set("company_id", data.company_id);

    return this.http.get(ajax_capacity_dashboard, { params: myParams }).catch(this.handler);
  }

  get_data_on_filter_apply(data){
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set('start_date',data.start_date)
      .set('end_date',data.end_date)
      .set("company_id", data.company_id);

    return this.http.get(ajax_capacity_dashboard_data, { params: myParams }).catch(this.handler);
  }
}


