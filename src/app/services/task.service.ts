import { Injectable } from '@angular/core';
import { Http , Response,RequestOptions,Headers,URLSearchParams } from '@angular/http';
import { Observable,BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/do';
import {environment} from '../../environments/environment';
import { Token } from '@angular/compiler';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';
import {Taskpopupform} from './taskpopup.model';
let URL = environment.API_url;

let taskListURL = URL+'/calender/gettasklist';
let changeViewUrl = URL+'/calender/changeView';
let taskInfoUrl = URL+'/calender/getTaskInfo';
let subcategory = URL+'/calender/getsubcategory';
let getProjectInfo = URL+'/calender/getProjectInfo';
let addStep = URL+'/calender/Steps';
let deleteStep = URL+'/calender/deleteStep';
let comments = URL+'/calender/comments';
let delete_comment = URL+'/calender/delete_comment';
let addLink = URL+'/calender/addLink';
let deleteFile  =URL+'/calender/delete_file';
let addfile = URL+'/calender/addFiles';
let remove_dependency = URL+'/calender/remove_task_dependency';
let addDependencies =URL+'/calender/add_dependencies';
let updatetask = URL+'/calender/update_task';
let addTask = URL+'/calender/addTask';
let dragUrl = URL+'/calender/dragTask';
let change_priority = URL +'/calender/change_priority';
let watch_list = URL+'/calender/watch_list';
let change_status = URL+'/calender/changestatus';
let copy_task = URL+'/calender/copy_task';
let change_color = URL+'/calender/change_color';
let rightclickcomment = URL+'/calender/right_click_comment';
let delete_task = URL+'/calender/delete_task';
let complete_task = URL+'/calender/complete_task';
let update_task_date  =URL+'/calender/update_task_date';
let change_company_fields = URL+'/calender/change_popup_fields';
let complete_step = URL+'/calender/complete_step';
let update_backlog_task = URL+'/calender/update_backlog_task';
let save_task_pos = URL +'/calender/save_task_pos';
let save_other_user_task_status = URL+'/calender/save_show_other_users_task';
let check_completed_dependency = URL+'/calender/check_completed_dependency';
let add_search_dependancy = URL +'/calender/add_search_dependancy';
let get_department_by_division = URL +'/calender/get_department_by_division';
let listtask = URL +'/calender/listtask';
let kanbandragUrl = URL +'/calender/drag_drop_task';
let move_task_url = URL +'/calender/move_task';
let update_step = URL+'/calender/update_step';
let change_allocated_user_url = URL+"/calender/change_allocated_user";
let add_new_task = URL+'/calender/add_new_task';
let monthly_calendar_data = URL+'/calender/monthly_calendar_data';
let update_monthly_calendar_top_filter = URL+'/calender/update_monthly_calendar_top_filter';

let change_monthly_view = URL+'/calender/change_monthly_view';
@Injectable()
export class TaskService {
    taskPopup = new Taskpopupform;
    
   constructor(private http: HttpClient){}

   
   getTaskList(loginingo){
         let myParams = new HttpParams()
        .set('user_id', loginingo.user_id)
        .set('company_id', loginingo.company_id);
        
        return this.http.get(taskListURL,{params:myParams})
        .catch(this.handler);
        
    }
    changeView(info){
       
            let myParams = new HttpParams()
            .set('user_id', info.user_id)
            .set('company_id', info.company_id)
            .set('type',info.type)
            .set('date',info.date)
            .set('filters',JSON.stringify(info.filters));    
            
            return this.http.get(changeViewUrl,{params:myParams})
            .catch(this.handler);
    }

    getTaskInfo(info){
        let myParams = new HttpParams()
            .set('user_id', info.user_id)
            .set('company_id', info.company_id)
            .set('task_id',info.task_id)
            .set('access',info.access)
            .set('project_id',info.project_id);
            
            return this.http.get(taskInfoUrl,{params:myParams})
            .catch(this.handler);
    }

    handler(error){
        return Observable.throw(error.json().error || 'server error');
    }
    
    getSubcategory(info){
        let myParams = new HttpParams()
            .set('category_id', info.category_id)
            .set('company_id', info.company_id);
            
            return this.http.get(subcategory,{params:myParams})
            .catch(this.handler);
    }
    getProjectInfo(info){
        let myParams = new HttpParams()
        .set('project_id', info.project_id)
        .set('company_id', info.company_id);
        
        return this.http.get(getProjectInfo,{params:myParams})
        .catch(this.handler);
    }

    addstep(info){
        let body = new HttpParams()
        .set('step_title',info.step_title)
        .set('user_id',info.user_id)
        .set('task_id',info.task_id)
        .set('task_info',JSON.stringify(info.task_info));
       
        return this.http.post(addStep, body).catch(this.handler);
    }

    deleteStep(info){
        let myParams = new HttpParams()
        .set('step_id', info.step_id)
        .set('task_id', info.task_id);
        
        return this.http.get(deleteStep,{params:myParams})
        .catch(this.handler);
    }

    addcomment(info){
        let body = new HttpParams()
        .set('comment',info.comment)
        .set('user_id',info.user_id)
        .set("comment_id",info.comment_id)
        .set('type',info.type)
        .set('task_id',info.task_id);
       
        return this.http.post(comments, body).catch(this.handler);
    }
    deleteComment(info){
        let myParams = new HttpParams()
        .set('comment_id', info.comment_id)
        .set('task_id', info.task_id)
        .set("user_id",info.user_id);
        
        return this.http.get(delete_comment,{params:myParams})
        .catch(this.handler);
    }

    addlink(info){
        let body = new HttpParams()
        .set('file_link',info.file_link)
        .set('file_name',info.file_name)
        .set('user_id',info.user_id)
        .set('task_id',info.task_id)
        .set('task_info',JSON.stringify(info.task_info));
       
        return this.http.post(addLink, body).catch(this.handler);
    }

    deleteFile(info){
        let myParams = new HttpParams()
        .set('file_id', info.file_id)
        .set('task_id', info.task_id)
        .set("user_id",info.user_id);
        
        return this.http.get(deleteFile,{params:myParams}).timeout(40000)
        .catch(this.handler);
    }

    addfile(info){
        let body = new HttpParams()
        .set('xml',info.xml)
        .set('user_id',info.user_id)
        .set('task_id',info.task_id)
        .set('task_info',JSON.stringify(info.task_info));
       
        return this.http.post(addfile, body).catch(this.handler);
    }

    removeDependecy(info){
        let myParams = new HttpParams()
        .set('dependent_task_id', info.dependent_task_id)
        .set('task_id', info.task_id)
        .set("user_id",info.user_id)
        .set('company_id',info.company_id)
        .set('type',info.type);
        
        return this.http.get(remove_dependency,{params:myParams}).timeout(40000)
        .catch(this.handler);
    }

    dependencies(info){
        let body = new HttpParams()
        .set('company_id',info.company_id)
        .set('user_id',info.user_id)
        .set('task_id',info.task_id)
        .set('dependent_task_title',info.dependent_task_title)
        .set('task_allocated_user_id',info.task_allocated_user_id)
        .set('status_id',info.status_id)
        .set('dependent_task_due_date',info.dependent_task_due_date);
       
        return this.http.post(addDependencies, body).catch(this.handler);
    }

    updatetask(info){
        let body = new HttpParams()
        .set('company_id',info.company_id)
        .set('user_id',info.user_id)
        .set('info',JSON.stringify(info.info))
        .set('start_date',info.start_date)
        .set('from',info.from)
        .set('task_info',JSON.stringify(info.task_info));
       
        return this.http.post(updatetask, body).catch(this.handler);
    }

    add_task(info){
        let body = new HttpParams()
        .set('company_id',info.company_id)
        .set('user_id',info.user_id)
        .set('task_title',info.task_title)
        .set('scheduled_date',info.scheduled_date)
        .set('task_allocated_user_id',info.task_allocated_user_id)
        .set('project_id',info.project_id)
        .set('task_status_id',info.task_status_id);
       
        return this.http.post(addTask, body).catch(this.handler);
    }
    dragTask(data){
        let body = new HttpParams()
        .set('task_id',data.task_id)
        .set('task_scheduled_date',data.task_scheduled_date)
        .set('user_id',data.user_id)
        .set('task_info',JSON.stringify(data.task_info))
        .set('index',data.index)
        .set("company_id",data.company_id);
        return this.http.post(dragUrl, body).timeout(40000)
            .catch(this.handler);
    }

    change_priority(info){
        let body = new HttpParams()
        .set('task_id',info.task_id)
        .set('priority',info.task_priority)
        .set('user_id',info.user_id)
        .set('task_info',JSON.stringify(info.task_info))
        .set("company_id",info.company_id);
        return this.http.post(change_priority, body).timeout(40000)
            .catch(this.handler);
    }

    watch_list(info){
        let body = new HttpParams()
        .set('task_id',info.task_id)
        .set('watch_list',info.watch_list)
        .set('task_info',JSON.stringify(info.task_info))
        .set("company_id",info.company_id);
        return this.http.post(watch_list, body).timeout(40000)
            .catch(this.handler);
    }
    change_status(info){
        let body = new HttpParams()
        .set('task_id',info.task_id)
        .set('task_status_id',info.status_id)
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set("company_id",info.company_id);
        return this.http.post(change_status, body).timeout(40000)
            .catch(this.handler);
    }

    copy_task(info){
        let body = new HttpParams()
        .set('task_id',info.task_id)
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set("company_id",info.company_id);
        return this.http.post(copy_task, body).timeout(40000)
            .catch(this.handler);
    }

    change_color(info){
        let body = new HttpParams()
        .set('task_id',info.task_id)
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set('color_id',info.color_id)
        .set("company_id",info.company_id);
        return this.http.post(change_color, body).timeout(40000)
            .catch(this.handler);
    }

    right_click_comment(info){
        let body = new HttpParams()
        .set('comment',info.comment)
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set("company_id",info.company_id);
        return this.http.post(rightclickcomment, body).timeout(40000)
            .catch(this.handler);
    }

    delete_task(info){
        let body = new HttpParams()
        .set('delete_type',info.type)
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set("company_id",info.company_id);
        return this.http.post(delete_task, body)
            .catch(this.handler);
    }

    complete_task(info){
        let body = new HttpParams()
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set('task_id',info.task_id)
        .set('is_completed',info.is_completed)
        .set('time',info.time)
        .set("company_id",info.company_id);
        return this.http.post(complete_task, body)
            .catch(this.handler);
    }
    update_task_date(info){
        let body = new HttpParams()
        .set('task_info',JSON.stringify(info.task_info))
        .set('user_id',info.user_id)
        .set('date',info.date)
        .set('type',info.type)
        .set("company_id",info.company_id);
        return this.http.post(update_task_date, body)
            .catch(this.handler);
    }
   
    change_company_fields(info){
        let body = new HttpParams()
        .set('type',info.type)
        .set('status',info.status)
        .set("company_id",info.company_id);
        return this.http.post(change_company_fields, body)
            .catch(this.handler);
    }
    complete_step(info){
        let body = new HttpParams()
        .set('info',JSON.stringify(info.info))
        .set('is_completed',info.is_completed)
        .set('step_title',info.step_title);
        return this.http.post(complete_step, body)
            .catch(this.handler);
    }

    update_backlog_task(data){
        let body = new HttpParams()
        .set('company_id',data.company_id)
        .set('user_id',data.user_id) 
        .set('data',JSON.stringify(data.data));
      return this.http.post(update_backlog_task, body).timeout(40000)
           .catch(this.handler);
   }

   save_task_pos(info){
    let myParams = new HttpParams()
    .set('task_id', info.task_id)
    .set('user_id',info.user_id)
    .set('value',info.value);
    
    return this.http.get(save_task_pos,{params:myParams}).timeout(40000)
    .catch(this.handler);
   }

   status_show_other_users_task(info){
    let myParams = new HttpParams()
    .set('user_id',info.user_id)
    .set('value',info.value);
    
    return this.http.get(save_other_user_task_status,{params:myParams})
    .catch(this.handler);
   }

   check_completed_task_dependency(data){
    let myParams = new HttpParams()
    .set('user_id', data.user_id)
    .set('task_id',data.task_id)
    .set('company_id', data.company_id);
    
    return this.http.get(check_completed_dependency,{params:myParams})
    .catch(this.handler);
   }
   add_search_dependancy(data){
        let myParams = new HttpParams()
        .set('search_task_id',data.task_id)
        .set('dep_task_id',data.dependent_task_id)
        .set('user_id',data.user_id)
        .set('company_id',data.company_id);
        
        return this.http.post(add_search_dependancy,myParams).timeout(40000)
        .catch(this.handler);
    }
    get_department_by_divisionid(data,company_id){
        let body = new HttpParams()
        .set('division_ids',data)
        .set('company_id',company_id)
        return this.http.get(get_department_by_division,{params:body})
        .catch(this.handler);
    }
    get_task_data(data){
        let myParams = new HttpParams()
        .set('term', data.term)
        .set('searchDate',data.date)
        .set('main_task_id',data.task_id)
        .set('user_id',data.user_id)
        .set('company_id',data.company_id);
        
        return this.http.post(listtask,myParams)
        .catch(this.handler);
   }
   /**
     * Drag & drop task service
     */
    kanbandragTask(data){
        let body = new HttpParams()
        .set('task_id',data.task_id)
        .set('move_status_id',data.move_status_id)
        .set('user_id',data.user_id)
        .set('task_info',JSON.stringify(data.task_info))
        .set('index',data.index)
        .set("company_id",data.company_id);
        return this.http.post(kanbandragUrl, body).timeout(40000)
            .catch(this.handler);
    }

    /**
     * Move right side task from kanban 
     */
    move_task(data){
        let body = new HttpParams()
        .set('task_id',data.task_id)
        .set('user_id',data.user_id)
        .set('task_info',JSON.stringify(data.task_info))
        .set("company_id",data.company_id);
        return this.http.post(move_task_url, body).timeout(40000)
            .catch(this.handler);
    }

    update_step(data){
        let body = new HttpParams()
        .set('task_id',data.task_id)
        .set('step_title',data.step_title)
        .set("step_id",data.step_id);
        return this.http.post(update_step, body).timeout(40000)
            .catch(this.handler);
    }

    change_allocated_user(data){
        let body = new HttpParams()
            .set('task_info',JSON.stringify(data.task_info))
            .set('user_id',data.user_id);
            return this.http.post(change_allocated_user_url,body).catch(this.handler);
    }
     /**
     * function for insert task data
     * @param data 
     * @param info 
     */
    insert_task_data(data,info,from){

        let body = new HttpParams()
        .set('data',JSON.stringify(data))
        .set('from',from)
        .set('info',JSON.stringify(info))
        return this.http.post(add_new_task, body).timeout(40000)
            .catch(this.handler);
    }

    monthly_calendar_data(data){
        let body = new HttpParams()
        .set('user_id',data.user_id)
        .set('company_id',data.company_id)
        return this.http.post(monthly_calendar_data, body).timeout(40000)
            .catch(this.handler);
    }

    update_monthly_calendar_top_filter(data){
        let body = new HttpParams()
        .set('user_id',data.user_id)
        .set('info',JSON.stringify(data.info))
        return this.http.post(update_monthly_calendar_top_filter, body).timeout(40000)
            .catch(this.handler);
    }

    change_monthly_view(data){
        let body = new HttpParams()
        .set('user_id',data.user_id)
        .set('company_id',data.company_id)
        .set('type',data.type)
        .set('date',data.date)
        .set('filters',JSON.stringify(data.filters))
        return this.http.post(change_monthly_view, body).timeout(40000)
            .catch(this.handler);
    }
}