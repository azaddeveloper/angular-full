import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
let URL = environment.API_url;
let getreportFormfield = URL + '/Report/getreportFormfields';
let run_report = URL + '/Report/run_report';
let get_sub_category = URL + '/Report/get_sub_category';
let get_department = URL + '/Report/get_department';
let get_project_users = URL + '/Report/get_project_users';
@Injectable()
export class Reportservice {
    constructor(private http: HttpClient) {
    }
    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }
    /**
   * function for get form filters
   */
    getreportFormfield(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id);
        return this.http.get(getreportFormfield, { params: myParams }).catch(this.handler);
    }
    /**
   * function for get form filters data
   */
    run_report(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id)
            .set('filters', JSON.stringify(data.filters));
        return this.http.get(run_report, { params: myParams }).catch(this.handler);
    }
    /**
   * function for get sub category by it's cateogry
   */
    get_sub_category(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id)
            .set('category_id', data.category_id);
        return this.http.get(get_sub_category, { params: myParams }).catch(this.handler);
    }
    /**
  * function for get division by it's department
  */
    get_division(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id)
            .set('division_id', data.division_id);
        return this.http.get(get_department, { params: myParams }).catch(this.handler);
    }
    /**
   * function for users list by project
   */
    get_project_users(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id)
            .set('project_id', data.project_id);
        return this.http.get(get_project_users, { params: myParams }).catch(this.handler);
    }
}