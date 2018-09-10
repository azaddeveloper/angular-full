import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
let URL = environment.API_url;
let kanbantaskUrl = URL + '/kanban/getkanbantask';
let NextInstanceUrl = URL +'/kanban/get_next_recurring_instance';
let kanban_filter = URL + '/kanban/kanban_filter';
let add_task_url = URL +'/kanban/add_task';
@Injectable()

export class KanbanService {
    token: any = "";
    constructor(private http: HttpClient) {
        this.token = localStorage.getItem('accesstoken');
    }

    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    getKanbanTask(data) {
        // let myHeaders = new HttpHeaders()
            // .append('Authorization','Bearer '+this.token);

        let myParams = new HttpParams()
            .append('user_id', data.user_id)
            .append('company_id', data.company_id);

        return this.http.get(kanbantaskUrl, { params: myParams }).timeout(40000).catch(this.handler);
    }
    /**
     * Get kanban next recurring instance
     */
    getNextInstance(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('task_id',data.task_id)
            .set('company_id', data.company_id);

        return this.http.get(NextInstanceUrl, { params: myParams }).timeout(40000).catch(this.handler);
    }
    kanban_filter(filter_data){
        // let myHeaders = new HttpHeaders()
        // .append('Authorization','Bearer '+this.token);
        let myParams = new HttpParams()
        .append('filter_user_id', filter_data.filter_user_id)
        .append('filter_project', filter_data.filter_project)
        .append('filter_user_color_id', filter_data.filter_user_color_id)
        .append('filter_user_due_date', filter_data.filter_user_due_date)
        .append('user_id', filter_data.user_id)
        .append('company_id', filter_data.company_id);
         return this.http.get(kanban_filter, { params: myParams }).timeout(40000).catch(this.handler);
    }

    add_task(data){
        let body = new HttpParams()
        .set('user_id', data.user_id)
        .set('task_title',data.task_title)
        .set('status_id',data.status_id)
        .set('project',data.project)
        .set('task_allocated_user_id',data.task_allocated_user_id)
        .set('company_id', data.company_id);
         return this.http.post(add_task_url,body).timeout(40000).catch(this.handler);
    }
    
}