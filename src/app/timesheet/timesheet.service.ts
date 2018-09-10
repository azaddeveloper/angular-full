import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
const URL = environment.API_url;
let timesheet_list_url = URL +"/timesheet/get_timesheet_list";
let timesheet_filter_url = URL +'/timesheet/timesheet_filter';
let delete_timesheet_url = URL +'/timesheet/delete_timesheet';
let create_timesheet_url = URL +'/timesheet/create_timesheet';
let pagination_url = URL +"/timesheet/apply_pagination";
let timesheet_detail_url  = URL +"/timesheet/timesheet_detail";
let change_timesheet_url = URL +'/timesheet/change_timesheet';
let get_one_day_data_url = URL+'/timesheet/get_one_day_task_data';
let update_task_data_url = URL+'/timesheet/update_task_data';
let save_as_draft = URL+'/timesheet/save_as_draft';
let submit_timesheet_url = URL+'/timesheet/submit_timesheet';
let timesheet_recall_url = URL+'/timesheet/timesheet_recall';
let approve_timesheet_url = URL+'/timesheet/approve_timesheet';
let return_to_draft_url = URL+'/timesheet/return_to_draft';
let cancel_timesheet_export_url = URL+'/timesheet/cancel_timesheet_export';
let approver_comment_url = URL+'/timesheet/approver_comment';
@Injectable()

export class TimesheetService {
    constructor(private http: HttpClient){
        
    }
    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    get_timesheet_list(data){
       let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id);
        return this.http.get(timesheet_list_url, { params: myParams }).catch(this.handler);
    }

    timesheet_filter(data){
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id)
            .set('user',data.user)
            .set('from_date',data.from_date)
            .set('to_date',data.to_date)
            .set('status',data.status);
        return this.http.get(timesheet_filter_url, { params: myParams }).catch(this.handler);
    }

    delete_timesheet(timesheet_id,company_id){
        let myParams = new HttpParams()
            .set('timesheet_id', timesheet_id)
            .set('company_id', company_id);
        return this.http.request('delete',delete_timesheet_url, { body: myParams }).catch(this.handler);
    }

    create_new_timesheet(data){
        let body = new HttpParams()
            .set('user_id', data.user_id)
            .set('timesheet_start_date',data.timesheet_start_date)
            .set('timesheet_end_date',data.timesheet_end_date)
            .set('timesheet_user_id',data.timesheet_user_id)
            .set('company_id', data.company_id);
        return this.http.post(create_timesheet_url,body).catch(this.handler);
    }

    pagination(data){
        let parms = new HttpParams()
        .set('company_id',data.company_id)
        .set('user_id',data.user_id)
        .set('page_no',data.page_no)
        .set('search',JSON.stringify(data.search));
        return this.http.get(pagination_url,{params:parms}).catch(this.handler);
    }

    timesheet_detail(data){
        let parms = new HttpParams()
        .set('company_id',data.company_id)
        .set('user_id',data.user_id)
        .set('timesheet_id',data.timesheet_id);
        return this.http.get(timesheet_detail_url,{params:parms}).catch(this.handler);
    }

    apply_timesheet_filter(data){
        let parms = new HttpParams()
        .set('company_id',data.company_id)
        .set('user_id',data.user_id)
        .set('filter',data.filter)
        .set('timesheet_id',data.timesheet_id);
        return this.http.get(change_timesheet_url,{params:parms}).catch(this.handler);
    }

    one_day_data(data){
        let parms = new HttpParams()
        .set('company_id',data.company_id)
        .set('timesheet_user_id',data.timesheet_user_id)
        .set('date',data.date)
        .set('customer_id',data.customer_id);
        return this.http.get(get_one_day_data_url,{params:parms}).catch(this.handler);
    }

    update_data(data){
        let myParams = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('date',data.date)
        .set('info',JSON.stringify(data.info))
        .set('company_id', data.company_id);
        return this.http.request('put',update_task_data_url, { body: myParams }).catch(this.handler);
    }

    save_as_draft(data){
        let body = new HttpParams()
            .set('timesheet_id', data.timesheet_id)
            .set('comment',data.comment)
            .set('comment_id',data.comment_id)
            .set('timesheet_user_id',data.timesheet_user_id)
            .set('company_id', data.company_id);
        return this.http.post(save_as_draft,body).catch(this.handler);
    }
    submit_timesheet(data){
        let body = new HttpParams()
            .set('timesheet_id', data.timesheet_id)
            .set('comment',data.comment)
            .set('comment_id',data.comment_id)
            .set('approver_id',data.approver_id)
            .set('user_id',data.user_id)
            .set('timesheet_user_id',data.timesheet_user_id)
            .set('company_id', data.company_id);
        return this.http.post(submit_timesheet_url,body).catch(this.handler);
    }

    timesheet_recall(data){
        let body = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('user_id',data.user_id)
        .set('timesheet_user_id',data.timesheet_user_id)
        .set('company_id', data.company_id);
        return this.http.post(timesheet_recall_url,body).catch(this.handler);
    }

    approve_timesheet(data){
        let body = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('company_id', data.company_id);
        return this.http.post(approve_timesheet_url,body).catch(this.handler);
    }
    return_to_draft(data){
        let body = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('company_id', data.company_id);
        return this.http.post(return_to_draft_url,body).catch(this.handler);
    }

    cancel_timesheet_export(data){
        let body = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('company_id', data.company_id);
        return this.http.post(cancel_timesheet_export_url,body).catch(this.handler);
    }

    approver_comment(data){
        let body = new HttpParams()
        .set('timesheet_id', data.timesheet_id)
        .set('comment',data.comment)
        .set('comment_id',data.comment_id)
        .set('timesheet_user_id',data.timesheet_user_id)
        .set('company_id', data.company_id);
        return this.http.post(approver_comment_url,body).catch(this.handler);
    }
}