import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../services/task.service';
import { CustomerService } from './customer.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import { FormControl, ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css'],
    providers: [CustomerService]
})
export class CustomerComponent implements OnInit {
    today=  Date.now();
    login_user_id: any = "";
    company_id: any = "";
    customers: Array<any> = [];
    form_user: any = "";
    today_date: any = '';
    @ViewChild('addcustomer')
    addcustomer: BsModalComponent;
    customerData: FormGroup;
    edit_customerData: any = "";
    formAddbutton: boolean = true;
    total_customer: any = '';
    page_number: any = '';
    customer_search_value: any = '';
    form_customer_list: Array<any> = [];
    temp_form_customer_list: Array<any> = [];
    customer_access: number; //user level check
    image:any = '';
    background:any;
    constructor(public loginservice:LoginService,public customer: CustomerService, private formBuilder: FormBuilder, public toastr: ToastsManager) {
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.customer_access = user_info.customer_access;
        this.get_customer();
        this.customerData = this.formBuilder.group({
            customer_name: [null, Validators.required],
            customer_external_id: new FormControl(''),
            first_name: new FormControl(''),
            last_name: new FormControl(''),
            internal_owner: new FormControl('0'),
            phone: new FormControl(''),
            parent_customer_id: new FormControl('0'),
            email: ["", [Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
        });
        this.background = localStorage.getItem('user_background_type');
        if(this.background == 'Image'){
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/'+localStorage.getItem('user_background_name');
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        }else if(this.background == 'DefaultImage'){
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
            $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
        }else{
            this.image = localStorage.getItem('user_background_name');
            $("body").css('background',this.image);
        }
    }

    ngOnInit() {
    }
    ngAfterViewInit(){
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
    }
    get_customer() {
        let info = {
            "user_id": this.login_user_id,
            "company_id": this.company_id
        };
        this.customer.get_customer(info).subscribe(
            data => {
                this.customers = data.customer_list.customers;
                this.form_user = data.customer_list.user;
                this.total_customer = data.customer_list.total_pages;
                this.form_customer_list = data.customer_list.form_customer_list;
            },
            error => {
                console.log(error);
            }
        )
    }
    open_addcustomer() {
        this.addcustomer.open();
        this.temp_form_customer_list = this.form_customer_list;
    }
    close_addcustomer() {
        this.addcustomer.close();
        this.formAddbutton = true;
        this.customerData.controls['customer_name'].setValue("");
        this.customerData.controls['customer_external_id'].setValue("");
        this.customerData.controls['first_name'].setValue("");
        this.customerData.controls['last_name'].setValue("");
        this.customerData.controls['email'].setValue("");
        this.customerData.controls['phone'].setValue("");
        this.customerData.controls['internal_owner'].setValue("0");
        this.customerData.controls['parent_customer_id'].setValue("0");

    }
    add_customer(data) {
        let addData = {
            "company_id": this.company_id,
            "data": {
                "first_name": data.first_name,
                "last_name": data.last_name,
                "email": data.email,
                "phone": data.phone,
                "customer_external_id": data.customer_external_id,
                "internal_owner": data.internal_owner,
                "customer_name": data.customer_name,
                "parent_customer_id": data.parent_customer_id,
                "customer_company_id": this.company_id,
            }
        }
        this.customer.add_customer(addData).subscribe(
            data => {
                this.customers.push(data.customer.customer);//push array in customer array
                this.total_customer = this.total_customer + 1; //increase 1 total record
                this.close_addcustomer();
            },
            error => {
                console.log(error);
            });
    }
    edit_customer(id) {
        this.formAddbutton = false;
        this.customers.forEach(element => {
            if (element.customer_id == id) {
                this.edit_customerData = element;
            }
        });
        this.temp_form_customer_list.length = 0;
        this.form_customer_list.forEach((element1, index) => {
            if (element1.customer_id != id) {
                this.temp_form_customer_list.push(element1);
            }
        });

        this.customerData.controls['customer_name'].setValue(this.edit_customerData.customer_name);
        this.customerData.controls['customer_external_id'].setValue(this.edit_customerData.external_id);
        this.customerData.controls['first_name'].setValue(this.edit_customerData.first_name);
        this.customerData.controls['last_name'].setValue(this.edit_customerData.last_name);
        this.customerData.controls['email'].setValue(this.edit_customerData.email);
        this.customerData.controls['phone'].setValue(this.edit_customerData.phone);
        this.customerData.controls['internal_owner'].setValue(this.edit_customerData.owner_id);
        this.customerData.controls['parent_customer_id'].setValue(this.edit_customerData.parent_customer_id);
        this.addcustomer.open();
    }
    update_customer(data) {
        let updateData = {
            "company_id": this.company_id,
            "customerid": this.edit_customerData.customer_id,
            "data": {
                "first_name": data.first_name,
                "last_name": data.last_name,
                "email": data.email,
                "phone": data.phone,
                "customer_external_id": data.customer_external_id,
                "internal_owner": data.internal_owner,
                "customer_name": data.customer_name,
                "parent_customer_id": data.parent_customer_id,
                "customer_company_id": data.company_id,
                "customerid": this.edit_customerData.customer_id,
            }
        };
        this.customer.update_customer(updateData).subscribe(
            data => {
                // this.get_customer();
                this.close_addcustomer();
                this.customers.forEach((element, index) => {
                    if (element.customer_id == data.customer.customer_id) {
                        this.customers[index] = data.customer;
                    }
                });
            },
            error => {
                console.log(error);
            });

    }
    /**
     * function for search customer filter
     */
    search_customer(value) {
        let company_id = this.company_id;
        let search_name = value;
        if (value == '') {
            this.page_number = '';
        }
        this.customer_search_value = value;
        this.customer.search_customer_filter(company_id, search_name).subscribe(
            data => {
                this.customers = data.customer_list.customers;
                this.total_customer = data.customer_list.total_customers;
                if (data.customer_list.total_customers == 0) {
                    this.page_number = '';
                }
            },
            error => {
                console.log(error);
            });
    }
    /**
     * function for customer pagination
     * @param page for page number 
     */
    customer_pagination(page) {
        let company_id = this.company_id;
        this.page_number = page;
        let search_value = this.customer_search_value;
        this.customer.customer_pagination(company_id, page, search_value).subscribe(
            data => {
                this.customers = data.customer_list;

            },
            error => {
                console.log(error);
            });
    }
    /**
     * 
     * @param customer_id 
     */
    delete_customer(customer_id) {
        let company_id = this.company_id;
        this.customer.delete_customer(customer_id, company_id).subscribe(
            data => {
                let id = data.customer_id;
                this.customers.forEach((element, index) => {
                    if (element.customer_id == id) {
                        this.customers.splice(index, 1);
                        this.total_customer = this.total_customer - 1; //decrease 1 in  total record
                    }
                });

            },
            error => {
                console.log(error);
            });
    }

}
