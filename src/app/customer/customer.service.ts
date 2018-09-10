import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import {environment} from '../../environments/environment';
let URL = environment.API_url;
let get_customer = URL + '/customer/get_customer_list';
let add_customer = URL + '/customer/add_customer';
let openCustomer = URL + '/customer/openCustomer';
let changeStatus = URL + '/customer/changestatus';
let taskfilter = URL + '/customer/gettaskByFilter';
let search_customer = URL + '/customer/search_customer';
let getMoreCustomer = URL + '/customer/getMoreCustomer';
let delete_customer = URL + '/customer/deleteCustomer';
let getMoreProject = URL + '/customer/getMoreProject';
let getMoreTask = URL + '/customer/getMoreTask';
let add_customer_user_info = URL + '/customer/add_customer_user_info';
let deleteCustomerUser = URL + '/customer/deleteCustomerUser';
let is_company_user_exists = URL+'/user/is_company_user_exists';
@Injectable()

export class CustomerService {
    constructor(private http: HttpClient) {

    }

    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    get_customer(data) {
        let myParams = new HttpParams()
            .set('user_id', data.user_id)
            .set('company_id', data.company_id);
        return this.http.get(get_customer, { params: myParams }).catch(this.handler);
    }
    add_customer(add_customer_data) {
        let body = new HttpParams()
            .set('data', JSON.stringify(add_customer_data.data))
            .set('company_id', add_customer_data.company_id)
            .set('customerid', "")
        return this.http.post(add_customer, body).catch(this.handler);
    }
    update_customer(updateData) {
        let body = new HttpParams()
            .set('data', JSON.stringify(updateData.data))
            .set('company_id', updateData.company_id)
            .set('customerid', updateData.customerid)
        return this.http.post(add_customer, body).catch(this.handler);
    }
    opencustomer(data) {
        let myParams = new HttpParams()
            .set('customerid', data.customer_id)
            .set('company_id', data.company_id)
            .set('user_id', data.user_id);
        return this.http.get(openCustomer, { params: myParams }).catch(this.handler);
    }
    changeStatus(updateStatusdata) {
        let body = new HttpParams()
            .set('id', updateStatusdata.id)
            .set('status', updateStatusdata.type)
            .set('company_id', updateStatusdata.company_id)
        return this.http.post(changeStatus, body).catch(this.handler);
    }
    /**
     * function for filter task form
     */
    filtertaskform(filterdata) {
        let body = new HttpParams()
            .set('data', JSON.stringify(filterdata.data))
            .set('company_id', filterdata.company_id)
            .set('user_id', filterdata.user_id)
        return this.http.post(taskfilter, body).catch(this.handler);
    }
    /**
     * function for customer list filter searach
     */
    search_customer_filter(company_id, search_name) {
        let body = new HttpParams()
            .set('company_id', company_id)
            .set('search_name', search_name)
        return this.http.post(search_customer, body).catch(this.handler);
    }
    /**
     * function for customer pagination
     * @param company_id 
     * @param page 
     */
    customer_pagination(company_id, page_no, search_value) {
        let body = new HttpParams()
            .set('company_id', company_id)
            .set('page_no', page_no)
            .set('search_value', search_value)
        return this.http.post(getMoreCustomer, body).catch(this.handler);
    }
    /**
     * function for delete customer id
     * @param customer_id 
     * @param company_id 
     */
    delete_customer(customer_id, company_id) {
        let body = new HttpParams()
            .set('company_id', company_id)
            .set('customer_id', customer_id)
        return this.http.post(delete_customer, body).catch(this.handler);
    }
    /**
     * function for customr project pagination
     * @param company_id 
     * @param page 
     */
    customer_project_pagination(company_id, page, customer_id, user_id) {
        let body = new HttpParams()
            .set('company_id', company_id)
            .set('page_no', page)
            .set('customer_id', customer_id)
            .set('user_id', user_id);
        return this.http.post(getMoreProject, body).catch(this.handler);
    }
    /**
     * function for customer pagination data
     * @param data array data
     */
    customer_task_pagination(data) {
        let body = new HttpParams()
            .set('allocated_id', data.data.allocated_id)
            .set('owner_id', data.data.owner_id)
            .set('status_id', data.data.statusid)
            .set('search_text', data.data.task_search)
            .set('statusid', data.data.statusid)
            .set('page_no', data.data.page_no)
            .set('company_id', data.company_id)
            .set('customer_id', data.customer_id)
        return this.http.post(getMoreTask, body).catch(this.handler);
    }
    /**
     * function for insert invite customer data
     * @param insert_data array
     */
    insert_invite_customer(insert_data) {
        let body = new HttpParams()
            .set('company_id', insert_data.company_id)
            .set('info', JSON.stringify(insert_data.data))
        return this.http.post(add_customer_user_info, body).catch(this.handler);
    }
    deleteCustomerUser(user_id) {
        let body = new HttpParams()
            .set('customer_user_id', user_id)
        return this.http.post(deleteCustomerUser, body).catch(this.handler);
    }
    deletetask(id) {
        let body = new HttpParams()
            .set('task_id', id)
        return this.http.post(deleteCustomerUser, body).catch(this.handler);
    }

    is_company_user_exists(data){
        let body = new HttpParams()
        .set('value',data.value)
        .set('company_id',data.company_id)
        .set('user_id',data.user_id)
        
        return this.http.post(is_company_user_exists,body).catch(this.handler);
      }
}