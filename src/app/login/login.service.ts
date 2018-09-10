import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {login} from './login.modal';
import {environment} from '../../environments/environment';
const url = environment.API_url;
let getcompany_list_url = url+'/home/usercompanyList';
let login_url = url+'/home/login';
let get_login_user_info = url+'/home/login_user_info';
let forget_password = url+'/home/forget_password';
let reset_password = url+'/home/reset_password';
let chk_email_exist = url+'/home/chk_email_exist';
let signUp = url+'/home/signUp';
let send_feedback = url+'/home/send_feedback';
let get_user_access = url+'/home/get_user_access';
let deleteNotification = url+'/home/deleteNotification';
let get_letestnotification = url+'/home/get_letestnotification';
let NotyRead = url+'/home/NotyRead';
let work_log_data = url+'/home/work_log';
let edit_worklog_comment = url+'/home/edit_worklog_comment';
let get_timer_graph_data = url+'/home/get_timer_graph_data';
let get_task_info  = url+'/calender/get_task_info';
@Injectable()

export class LoginService {
    private currentUserSubject = new BehaviorSubject<login>(new login());
    public currentUser = this.currentUserSubject.asObservable().distinctUntilChanged();
    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject;
    
    private bSubject = new BehaviorSubject(''); 
    public timer_notification = this.bSubject.asObservable();

    private bSubject1 = new BehaviorSubject(''); 
    public timer_task_data = this.bSubject1.asObservable();

    /**
     * Access module using observable
     */

    private module = new BehaviorSubject(''); 
    public module_access$ = this.module.asObservable();

   constructor(private http: HttpClient) {
        this.isAuthenticated.take(1).subscribe(data=>{
            console.log(data);
        })
    }

    change_module_status(status){
        this.module.next(status);
    }

    update_timer_data(data){
        this.bSubject1.next(data);
    }
    update_timer_task(task_title){
        this.bSubject.next(task_title);
    }

    getcompany_list(email){
        let body = new HttpParams()
        .set('email',email);
        return this.http.post(getcompany_list_url,body).catch(this.handler);
    }

    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    getlogin(data){
        let body = new HttpParams()
        .set('password',data.password)
        .set('company_id',data.company_id)
        .set('email',data.email);
        return this.http.post(login_url,body).catch(this.handler);
        // return this.http.post(login_url,body).map(data1=>{ 
        //     // this.setData(data1);
        //     return data1;
        // }).catch(this.handler);
    }
    setData(data){
        this.currentUserSubject.next(data.data);
        // Set isAuthenticated to true
        this.isAuthenticatedSubject.next(true);
    }

    get_login_user_data(user_id,company_id){
        let body = new HttpParams()
        .set('user_id',user_id)
        .set('company_id',company_id);
        return this.http.get(get_login_user_info,{params:body}).catch(this.handler);
    }
    forget_password(email){
        let body = new HttpParams()
        .set('email',email);
        return this.http.post(forget_password,body).catch(this.handler);
    }
    reset_password(data){
        let body = new HttpParams()
        .set('password',data.password)
        .set('id',data.id);
        return this.http.post(reset_password,body).catch(this.handler);
    }

    is_email_exist(email){
        let body = new HttpParams()
        .set('email',email)
        return this.http.get(chk_email_exist,{params:body}).catch(this.handler);
    }
    sign_up(data){
        let body = new HttpParams()
        .set('first_name',data.first_name)
        .set('last_name',data.last_name)
        .set('email',data.email)
        .set('company_name',data.company_name)
        .set('password',data.new_password)
        .set('plan_id','6')
        return this.http.post(signUp,body).catch(this.handler);
    }
    send_feedback(filetoupload:File,data,user_id,company_id){
        const formData: FormData = new FormData();
        if(filetoupload){
         formData.append('feedback_file', filetoupload, filetoupload.name);
        }
        formData.append('rating',data.rating);
        formData.append('like_description',data.like_description);
        formData.append('improve_description',data.improve_description)
        formData.append('user_id',user_id)
        formData.append('company_id',company_id)
        return this.http
        .post(send_feedback, formData)
        .map(() => { return true; })
        
    }

    get_user_access(user_id){
        let params = new HttpParams()
        .set('user_id',user_id)
        return this.http.get(get_user_access,{params:params}).catch(this.handler);
    }

    deleteNotification(id,user_id){
        let params = new HttpParams()
        .set('notification_id',id)
        .set('user_id',user_id)
        return this.http.request('delete',deleteNotification,{body:params}).catch(this.handler);
    }

    get_letestnotification(user_id){
        let params = new HttpParams()
        .set('user_id',user_id)
        return this.http.get(get_letestnotification,{params:params}).catch(this.handler);
    }

    read_all_notification(user_id){
        let params = new HttpParams()
        .set('user_id',user_id)
        return this.http.request('put',NotyRead,{body:params}).catch(this.handler);
    }

    work_log_data(user_id,from_date,to_date,company_id){
        let params = new HttpParams()
        .set('user_id',user_id)
        .set('from_date',from_date)
        .set('to_date',to_date)
        .set("company_id",company_id)
        return this.http.post(work_log_data,params).catch(this.handler);
    }

    edit_worklog_comment(comment_id,comment){
        let body = new HttpParams()
        .set('comment_id',comment_id)
        .set('comment',comment)
        return this.http.post(edit_worklog_comment,body).catch(this.handler);
    }

    get_timer_graph_data(user_id,company_id){
        let body = new HttpParams()
        .set('company_id',company_id)
        .set('user_id',user_id)
        return this.http.post(get_timer_graph_data,body).catch(this.handler);
    }
    get_task_info(data){
        let body = new HttpParams()
        .set('company_id',data.company_id)
        .set('task_id',data.task_id)
        .set('task_allocated_user_id',data.allocated_user_id)
        .set('user_id',data.user_id)
        .set('notification_id',data.notification_id)
        .set('timesheet_id',data.timesheet_id)
        return this.http.post(get_task_info,body).catch(this.handler);
    }
}