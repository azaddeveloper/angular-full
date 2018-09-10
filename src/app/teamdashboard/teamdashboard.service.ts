import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
const URL = environment.API_url;
let teamdashboard = URL + '/Userdashboard/team_dashboard';
let team_todo_Ajax = URL+"/userdashboard/team_todo_Ajax";
let NextInstanceUrl = URL + '/kanban/get_next_recurring_instance';
let task_team_nextweek = URL+"/userdashboard/task_team_nextweek";
let task_team_previousweek = URL+"/userdashboard/task_team_previousweek";
let update_due_date = URL + "/Calender/updateDueDate";
let update_scheduled_date = URL +"/calender/updateSchedulledDate";
@Injectable()
export class TeamdashboardService {

  constructor(public http:HttpClient) { }
  handler(error) {
    return Observable.throw(error.json().error || 'server error');
  }
  get_teamdashboard(data) {
    let myParams = new HttpParams()
      .set("user_id", data.user_id)
      .set("company_id", data.company_id);

    return this.http.get(teamdashboard, { params: myParams }).catch(this.handler);
  }

  todo_team_ajax(data){
    let myParams = new HttpParams()
    .set("user_id", data.user_id)
    .set('type',data.type)
    .set('duration',data.duration)
    .set("company_id", data.company_id);

  return this.http.get(team_todo_Ajax, { params: myParams }).catch(this.handler);

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

    get_nextweek_task(user_id,company_id){
      let myParams = new HttpParams()
        .set("user_id", user_id)
        .set("company_id", company_id);
  
      return this.http.get(task_team_nextweek, { params: myParams }).catch(this.handler);
    }
  
    get_preweek_task(user_id,company_id){
      let myParams = new HttpParams()
        .set("user_id", user_id)
        .set("company_id", company_id);
  
      return this.http.get(task_team_previousweek, { params: myParams }).catch(this.handler);
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
}
