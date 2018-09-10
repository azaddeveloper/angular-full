import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { PricingService } from './pricing.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { element } from 'protractor';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  providers: [PricingService]
})
export class PricingComponent implements OnInit {
  today: Date = new Date();
  login_user_id: any;
  company_id: any;
  user_list: any = '';
  customer_base_rate = '';
  customer_list: any = '';
  selected_customer_id: any = 0;
  customer_category: any = '';
  users_under_customer: any = '';
  category: any = '';
  sub_category: any = '';
  currency: any = '';
  login_user_name: any = '';
  //normal user pagination & searching variables
  page_number: number = 1;
  total_users: number = 1;
  serach_user: any = '';

  //under customer users pagination & searching variables

  total_customer_users: any = '';
  page_number1: number = 1;
  search_user_under_customer: any = '';

  image:any = '';
  background:any;
  constructor(public loginservice: LoginService, public price_service: PricingService, public toastr: ToastsManager, vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.currency = user_info.currency;
    this.login_user_name = user_info.username;
    this.get_pricing_data();
    this.background = localStorage.getItem('user_background_type');
    if (this.background == 'Image') {
      this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/' + localStorage.getItem('user_background_name');
      $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
    } else if (this.background == 'DefaultImage') {
      this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
      $("body").css('background',"url("+this.image+") center center / 100% no-repeat fixed");
    } else {
      this.image = localStorage.getItem('user_background_name');
      $("body").css('background',this.image);
    }
  }
  ngAfterViewInit() {
    if (localStorage.getItem('timer_task_id') != '') {
      var task_id = localStorage.getItem('timer_task_id');
      var title = localStorage.getItem('timer_task_title');
      $("#timer_task_id").val(task_id);
      this.loginservice.update_timer_task(title);
    }
  }
  get_pricing_data() {
    let info = {
      "user_id": this.login_user_id,
      "company_id": this.company_id
    }
    this.price_service.get_price_data(info).subscribe(
      data => {
        console.log(data);
        this.user_list = data.list.employee;
        this.customer_list = data.list.customers;
        this.total_users = data.list.total_records;
      }
    )
  }

  change_customer() {
    this.customer_list.forEach(element => {
      if (element.customer_id == this.selected_customer_id) {
        this.customer_base_rate = element.base_rate;
      }
    });
    if (this.selected_customer_id != 0) {
      let info = {
        "user_id": this.login_user_id,
        "company_id": this.company_id,
        "customer_id": this.selected_customer_id
      }
      this.price_service.get_customer_info(info).subscribe(
        data => {
          console.log(data);
          this.category = data.list.category;
          this.users_under_customer = data.list.employee;
          this.customer_category = data.list.customer_category;
          this.sub_category = data.list.sub_category;
          this.total_customer_users = data.list.total_employee;
        }
      )
    }
  }
  show(category_id) {
    let display1: any = document.querySelector("#sub_" + category_id);
    let change_icon: any = document.querySelector('#display_' + category_id);
    if (display1.style.display == "block") {
      display1.style.display = "none";
      change_icon.innerHTML = '<span><i class="icon-chevron-right" ></i></span>';
    } else {
      display1.style.display = "block";
      change_icon.innerHTML = '<span><i class="icon-chevron-down" ></i></span>'
    }
  }

  update_user_price(user_id, type, price) {
    let info = {
      "user_id": user_id,
      'type': type,
      "price": price
    }
    this.price_service.update_user_rate(info).subscribe(
      data => {
        this.user_list.forEach(element => {
          if (element.user_id == user_id) {
            element.rate_updated_date = data.date;
            if (type == 'cost_per_hour') {
              element.cost_per_hour = price;
            } else {
              element.base_charge_rate_per_hour = price;
            }
          }
        });
      }
    )
  }

  update_customer_price(rate) {
    let info = {
      "customer_id": this.selected_customer_id,
      "price": rate,
      "company_id": this.company_id
    }
    this.price_service.update_customer_rate(info).subscribe(
      data => {
        this.customer_list.forEach(element => {
          if (element.customer_id == this.selected_customer_id) {
            element.base_rate = rate;
          }
        });
      }
    )
  }
  update_category_price(category_id, rate, type, parent_category_id = '') {
    let info = {
      "category_id": category_id,
      "company_id": this.company_id,
      "price": rate,
      "customer_id": this.selected_customer_id
    }
    this.price_service.update_category_rate(info).subscribe(
      data => {
        if (type == 'main') {
          this.customer_category.forEach(element => {
            if (element.category_id == category_id) {
              element.rate = rate;
              element.updated_date = data.date;
            }
          });
        } else {
          this.sub_category[parent_category_id].forEach(element => {
            if (element.category_id == category_id) {
              element.rate = rate;
              element.updated_date = data.date;
            }
          });
        }

      }
    )
  }

  add_category(data) {
    let category_id = data.customer_category_name.value;
    let rate = data.customer_category_rate.value;
    if (category_id == 0) {
      this.toastr.error('Please select a category.', '');
    } else if (rate == '') {
      this.toastr.error('Please enter a category rate.', '');
    } else if (!rate.match(/^[0-9 .]*$/)) {
      this.toastr.error('Enter only digit.', '');
    } else {
      let category_name = '';
      this.category.forEach(element => {
        if (element.category_id == category_id) {
          category_name = element.category_name;
        }
      });
      let info = {
        "company_id": this.company_id,
        "category_id": category_id,
        "rate": rate,
        "customer_id": this.selected_customer_id,
        "category_name": category_name
      }
      this.price_service.add_category(info).subscribe(
        data => {
          this.customer_category.length = 0;
          this.customer_category = data.info.customer_category;
          this.sub_category.length = 0;
          this.sub_category = data.info.sub_category;
          this.category.length = 0;
          this.category = data.info.category;
        }
      )
    }
  }

  remove_category(category_id) {
    let info = {
      "company_id": this.company_id,
      "category_id": category_id,
      "customer_id": this.selected_customer_id
    }
    this.price_service.remove_category(info).subscribe(
      data => {
        this.customer_category.forEach((element, index) => {
          if (element.category_id == category_id) {
            this.customer_category.splice(index, 1);
          }
        });
        this.category = data.info.category;
      }
    )
  }

  update_user_under_customer_price(user_id, rate) {
    let info = {
      "user_id": user_id,
      "company_id": this.company_id,
      "customer_id": this.selected_customer_id,
      "rate": rate
    }
    this.price_service.update_user_rate_under_customer(info).subscribe(
      data => {
        this.users_under_customer.forEach(element => {
          if (element.user_id == user_id) {
            element.base_rate = rate;
            element.update_date = data.date;
          }
        });
      }
    )
  }

  pagination(page) {
    this.page_number = page;
    let info = {
      "user_id": this.login_user_id,
      "company_id": this.company_id,
      "page": page,
      "search": this.serach_user
    }
    this.price_service.get_pagination_data(info).subscribe(
      data => {
        this.user_list = data.list.users;
      }
    )
  }

  get_user_by_serach(string) {
    this.page_number = 1;
    this.serach_user = string;
    let info = {
      "company_id": this.company_id,
      "search": this.serach_user
    }
    this.price_service.get_employee_by_search(info).subscribe(
      data => {
        this.user_list = data.list.users;
        this.total_users = data.list.total_search_row;
      }
    )
  }

  users_under_customer_pagination(page) {
    this.page_number1 = page;
    let info = {
      "customer_id": this.selected_customer_id,
      "company_id": this.company_id,
      "page": page,
      "search": this.search_user_under_customer
    }
    this.price_service.get_more_users_under_customer(info).subscribe(
      data => {
        this.users_under_customer = data.list.employee;
      }
    )
  }

  get_users_under_customer(search) {
    this.search_user_under_customer = search;
    this.page_number1 = 1;
    let info = {
      "company_id": this.company_id,
      "search": this.search_user_under_customer,
      "customer_id": this.selected_customer_id
    }
    this.price_service.get_users_under_customer_by_search(info).subscribe(
      data => {
        this.users_under_customer = data.list.employee;
        this.total_customer_users = data.list.total_search_row;
      }
    )
  }
}
