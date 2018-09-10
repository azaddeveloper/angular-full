import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
let URL = environment.API_url;
let get_search_task_data = URL+'/search/get_search_task_data';
let get_filter_data = URL+"/search/get_filter_data";
let get_saved_filter_data = URL+'/search/get_saved_filter_data';
let delete_filter = URL+"/search/delete_filter";
let create_new_filter =URL+'/search/create_new_filter';
let update_filter = URL+'/search/update_filter';
let export_excel = URL+'/search/export_excel';
@Injectable()
export class SearchService {

  constructor(public http:HttpClient) { }
  handler(error) {
    return Observable.throw(error.json().error || 'server error');
  }

  get_search_data(data){
    let myParams = new HttpParams()
    .set('user_id',data.user_id)
    .set('company_id',data.company_id);
    return this.http.get(get_search_task_data,{params:myParams}).catch(this.handler);
  }

  get_filter_data(data){
    let myParams = new HttpParams()
    .set('user_id',data.user_id)
    .set('info',JSON.stringify(data.info))
    .set('company_id',data.company_id);
    return this.http.post(get_filter_data,myParams).catch(this.handler);
  }

  get_saved_filter_data(data){
    let myParams = new HttpParams()
    .set('user_id',data.user_id)
    .set('filter_id',data.filter_id)
    .set('company_id',data.company_id);
    return this.http.get(get_saved_filter_data,{params:myParams}).catch(this.handler);
  }

  delete_filter(filter_id){
    let myParams = new HttpParams()
    .set('filter_id',filter_id)
    
    return this.http.request('delete',delete_filter,{params:myParams}).catch(this.handler);
  }

  create_new_filter(data){
    let myParams = new HttpParams()
    .set('user_id',data.user_id)
    .set('info',JSON.stringify(data.info))
    .set('filter_title',data.filter_title)
    .set('columns',JSON.stringify(data.columns))
    .set('company_id',data.company_id);
    return this.http.post(create_new_filter,myParams).catch(this.handler);
  }

  update_filter(data){
    let myParams = new HttpParams()
    .set('info',JSON.stringify(data.info))
    .set('columns',JSON.stringify(data.columns))
    .set('filter_id',data.filter_id);
    return this.http.post(update_filter,myParams).catch(this.handler);
  }
  excel_data(data){
    let myParams = new HttpParams()
    .set('info',JSON.stringify(data.info))
    .set('user_id',data.user_id)
    .set('company_id',data.company_id)
    .set('columns',JSON.stringify(data.columns))
    return this.http.post(export_excel,myParams).catch(this.handler);
  }
}
