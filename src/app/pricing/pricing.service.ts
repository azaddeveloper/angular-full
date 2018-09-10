import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
let URL = environment.API_url;
let get_pricing_data = URL+'/price/get_pricing_data';
let get_customer_pricing_info = URL+'/price/get_customer_pricing_info';
let update_user_rate = URL+'/price/update_user_rate';
let update_customer_rate = URL+"/price/update_customer_rate";
let update_category_rate = URL+"/price/update_category_rate";
let add_categoty = URL+'/price/add_categoty';
let remove_category = URL+'/price/remove_category';
let update_user_rate_under_customer  =URL+'/price/update_user_rate_under_customer';
let get_pagination_data = URL+"/price/get_more_users";
let get_employee_by_search = URL+'/price/get_employee_by_search';
let get_more_users_under_customer = URL+'/price/get_more_users_under_customer';
let get_users_under_customer_by_search = URL+"/price/get_users_under_customer_by_search";
@Injectable()

export class PricingService {

  constructor(public http:HttpClient) { }
    handler(error) {
      return Observable.throw(error.json().error || 'server error');
  }

  get_price_data(data){
      let myParams = new HttpParams()
              .set('user_id',data.user_id)
              .set('company_id',data.company_id);
      return this.http.get(get_pricing_data,{params:myParams}).catch(this.handler);
  }

  get_customer_info(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('user_id',data.user_id)
              .set('company_id',data.company_id);
      return this.http.get(get_customer_pricing_info,{params:myParams}).catch(this.handler);
  }

  update_user_rate(data){
    let myParams = new HttpParams()
              .set('type',data.type)
              .set('user_id',data.user_id)
              .set('price',data.price);
      return this.http.request('put',update_user_rate,{body:myParams}).catch(this.handler);
  }

  update_customer_rate(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('company_id',data.company_id)
              .set('rate',data.price);
      return this.http.request('put',update_customer_rate,{body:myParams}).catch(this.handler);
  }

  update_category_rate(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('company_id',data.company_id)
              .set('category_id',data.category_id)
              .set('value',data.price);
      return this.http.request('put',update_category_rate,{body:myParams}).catch(this.handler);
  }
  add_category(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('company_id',data.company_id)
              .set('category_id',data.category_id)
              .set('category_name',data.category_name)
              .set('rate',data.rate);
      return this.http.post(add_categoty,myParams).catch(this.handler);
  }

  remove_category(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('company_id',data.company_id)
              .set('category_id',data.category_id)
              
      return this.http.request('delete',remove_category,{body:myParams}).catch(this.handler);
  }

  update_user_rate_under_customer(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('company_id',data.company_id)
              .set('user_id',data.user_id)
              .set('value',data.rate)
              
      return this.http.post(update_user_rate_under_customer,myParams).catch(this.handler);
  }

  get_pagination_data(data){
    let myParams = new HttpParams()
              .set('user_id',data.user_id)
              .set('page',data.page)
              .set('search',data.search)
              .set('company_id',data.company_id);
      return this.http.get(get_pagination_data,{params:myParams}).catch(this.handler);
  }

  get_employee_by_search(data){
    let myParams = new HttpParams()
              .set('search',data.search)
              .set('company_id',data.company_id);
      return this.http.get(get_employee_by_search,{params:myParams}).catch(this.handler);
  }

  get_more_users_under_customer(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('page',data.page)
              .set('search',data.search)
              .set('company_id',data.company_id);
      return this.http.get(get_more_users_under_customer,{params:myParams}).catch(this.handler);
  }

  get_users_under_customer_by_search(data){
    let myParams = new HttpParams()
              .set('customer_id',data.customer_id)
              .set('search',data.search)
              .set('company_id',data.company_id);
      return this.http.get(get_users_under_customer_by_search,{params:myParams}).catch(this.handler);
  }
}
