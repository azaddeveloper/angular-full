import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
let URL = environment.API_url;
let get_projects = URL+'/project/get_project_list';
let insert_project = URL+'/project/insert_project';
let project_list_by_filter = URL+'/project/get_project_list_by_filter';
let get_prject_info = URL +'/project/get_project_info';
let edit_project = URL+'/project/edit_project';
let add_task = URL +'/project/add_task';
let add_comment = URL+'/project/add_comment';
let delete_comment = URL +'/project/deletecomment';
let add_link = URL+'/project/add_project_link';
let delete_file = URL+'/project/delete_project_file';
let replace_project_link = URL+'/project/replace_link';
let update_section_name_url = URL+'/project/update_project_section_name';
let create_sub_section_url =URL+'/project/create_sub_section';
let delete_subsection_url = URL +'/project/deleteSubSection';
let create_section_url = URL+'/project/create_section';
let delete_section_url = URL+'/project/delete_section';
let update_project_title = URL+'/project/save_project_tilte';
let refresh_project_finance = URL+"/project/update_finance_info";
let add_project_team_member = URL +'/project/add_project_team_member';
let remove_user = URL+"/project/deleteuser";
let change_task_status_id = URL+'/project/change_status';
let copy_project = URL+'/project/copy_project';
let delete_project = URL+"/project/delete_project";
let search_project = URL+'/project/search_project';
@Injectable()

export class ProjectService {
    constructor(private http: HttpClient) {
        
    }

    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    get_projects(data){
        let myParams = new HttpParams()
                .set('user_id',data.user_id)
                .set('company_id',data.company_id);
        return this.http.get(get_projects,{params:myParams}).catch(this.handler);
    }

    add_project(data){
        let body = new HttpParams()
        .set('user_id', data.user_id)
        .set("project_info",JSON.stringify(data.project))
        .set('company_id', data.company_id);
         return this.http.post(insert_project,body).timeout(40000).catch(this.handler);
    }

    project_filter(data){
        let myParams = new HttpParams()
        .set('user_id',data.user_id)
        .set('filter',data.filter)
        .set('company_id',data.company_id);
        return this.http.get(project_list_by_filter,{params:myParams}).catch(this.handler);
    }

    project_detail(data){
        let body = new HttpParams()
        .set('user_id', data.user_id)
        .set("project_id",data.project_id)
        .set('company_id', data.company_id);
         return this.http.get(get_prject_info,{params:body}).timeout(40000).catch(this.handler);
    }

    edit_project(data){
        let body = new HttpParams()
        .set('project_id', data.project_id)
        .set('company_id',data.company_id)
        .set("project_info",JSON.stringify(data.project));
        return this.http.post(edit_project,body).timeout(40000).catch(this.handler);
    }

    add_task(data){
        let body = new HttpParams()
        .set('project_id', data.project_id)
        .set('task_title',data.task_title)
        .set('section_id',data.section_id)
        .set('subsection_id',data.sub_section_id)
        .set('company_id',data.company_id)
        .set("user_id",data.user_id);
        return this.http.post(add_task,body).catch(this.handler);
    }

    add_comment(data){
        let body = new HttpParams()
        .set('project_id', data.project_id)
        .set('comment',data.comment)
        .set("user_id",data.user_id);
        return this.http.post(add_comment,body).catch(this.handler);
    }

    delete_comment(data){
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('comment_id', data.comment_id)
            .set('project_id', data.project_id);
        return this.http.get(delete_comment,{params:myParams}).catch(this.handler);
    }

    add_project_link(data){
        let body = new HttpParams()
        .set('file_info', JSON.stringify(data));
        return this.http.post(add_link,body).catch(this.handler);
    }
    delete_file(data){
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('file_id', data.file_id)
            .set('project_id', data.project_id);
        return this.http.get(delete_file,{params:myParams}).catch(this.handler);
    }
    replace_link(data){
        let body = new HttpParams()
        .set('project_id', data.project_id)
        .set('replace_file_name',data.file_name)
        .set('replace_file_link',data.file_link)
        .set('rep_fil',data.task_file_id)
        .set("user_id",data.user_id);
        return this.http.post(replace_project_link,body).catch(this.handler);
    }

    update_section_name(data){
        let body = new HttpParams()
        .set('section_id', data.section_id)
        .set('section_title',data.section_title);
        
        return this.http.post(update_section_name_url,body).catch(this.handler);
    }

    create_sub_section(info){
        let body = new HttpParams()
        .set('section_id', info.section_id)
        .set('section_name',info.section_name)
        .set('project_id',info.project_id)
        .set('user_id',info.user_id);
        
        return this.http.post(create_sub_section_url,body).catch(this.handler);
    }

    delete_subsection(info){
        let myParams = new HttpParams()
            .set('section_id', info.section_id)
            .set('subsection_id', info.subsection_id)
            .set('project_id', info.project_id);
        return this.http.get(delete_subsection_url,{params:myParams}).catch(this.handler);
    }

    create_section(info){
        let body = new HttpParams()
        .set('section_name',info.section_name)
        .set('project_id',info.project_id)
        .set('user_id',info.user_id);
        
        return this.http.post(create_section_url,body).catch(this.handler);
    }

    delete_section(section_id,project_id){
        let params = new HttpParams()
            .set('section_id',section_id)
            .set('project_id',project_id);
            return this.http.get(delete_section_url,{params:params}).catch(this.handler);
    }

    update_title(title,project_id){
        let params = new HttpParams()
            .set('title',title)
            .set('project_id',project_id);
            return this.http.get(update_project_title,{params:params}).catch(this.handler);
    }
    update_finance_info(project_id,company_id){
        let params = new HttpParams()
            .set('company_id',company_id)
            .set('project_id',project_id);
            return this.http.get(refresh_project_finance,{params:params}).catch(this.handler);
    }

    add_team_member(project_id,user_id,is_owner){
        let body = new HttpParams()
        .set('is_owner',is_owner)
        .set('project_id',project_id)
        .set('user_id',user_id);
        
        return this.http.post(add_project_team_member,body).catch(this.handler);
    }
    remove_user(data){
        let body = new HttpParams()
        .set('company_id',data.company_id)
        .set('project_id',data.project_id)
        .set('project_user_id',data.project_user_id)
        .set('user_id',data.user_id);
        
        return this.http.request('delete',remove_user,{body:body}).catch(this.handler);
    }

    copy_project(data){
        let body = new HttpParams()
        .set('company_id',data.company_id)
        .set('project_id',data.project_id)
        .set('user_id',data.user_id);
        
        return this.http.post(copy_project,body).catch(this.handler);
    }

    delete_project(data){
        let body = new HttpParams()
        .set('company_id',data.company_id)
        .set('project_id',data.project_id)
        .set('status',data.status)
        .set('select_project',data.select_project)
        .set('user_id',data.user_id);
        
        return this.http.request('delete',delete_project,{body:body}).catch(this.handler);
    }

    search_project(search,status,company_id,user_id){
        let params = new HttpParams()
            .set('company_id',company_id)
            .set('status',status)
            .set('user_id',user_id)
            .set('search',search);
            return this.http.get(search_project,{params:params}).catch(this.handler);
    }
    
}