import { Component, OnInit,ViewChild } from '@angular/core';
import {DashboardService } from '../dashboard/dashboard.service';
import { Chart } from 'chart.js';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { LoginService } from '../login/login.service';
declare const $: any;
@Component({
  selector: 'app-capacitydashboard',
  templateUrl: './capacitydashboard.component.html',
  styleUrls: ['./capacitydashboard.component.css','../../assets/css/admin_css.css'],
  providers:[DashboardService,ChangeFormat]
})
export class CapacitydashboardComponent implements OnInit {
  today: number = Date.now();
  login_user_id: any = '';
  Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
  company_id: any = '';
  date_range:any= [];
  filter_user:any = [];
  customer_list:any = [];
  project_list:any = [];
  data = [];
  info:any='';
  currency:any;
  // capcatiy graph option
  view: any[] = [100, 80];
  colorScheme = {
    domain: ['#00a99e', '#F3F3F3']
  };

  capacity_info:any = [];
  start_date:Date;
  end_date:Date;
  loader:boolean = false;
  @ViewChild('barCanvas1') barCanvas1;
  barChart:any='';
  category_analysis_graph = [];
   
  // category graph option
    category_graph_type = 'day';
    view1: any[] = [600, 400];
    legendTitle = '';
    showXAxis = true;
    showYAxis = true;
    showLegend = true;
    showXAxisLabel = true;
    showYAxisLabel = true;
    showGridLines = false;
  
  @ViewChild('barCanvas3') barCanvas3;
  barChart3:any='';

  planned_width:number =0 ;
  active_user_widget:number = 0;
  // planned capacity button info
  onText = 'Graph';
  offText = 'Numerial';
  onColor = 'blue';
  offColor = 'green';
  graph_type = true;
  // top header related to team list
  onText1 = 'Me';
  offText1 = 'Team';
  onColor1 = 'blue';
  offColor1 = 'green';
  user_filter = 'me';

  filter:boolean = true;
  is_admin:number;
  is_manager:number;
  select_user:any;
  user_list:any = [];

  //billable & non-billlable graph info
  hours_data:any = '';
  cost_data:any = '';
  onText2 = 'Hours';
  offText2 = '$';
  billable_graph_type:boolean = true;

  //gauge meter graph
    gaugeType = "arch";
    gaugeValue = 0;
    gaugeAppendText = "%";


  constructor(public loginservice:LoginService, public dashboard_service:DashboardService,public chnage_format:ChangeFormat) { 
    $("body").css('background',"#fff");
  }

  ngOnInit() {
    let user_info = JSON.parse(localStorage.getItem('info'));
    this.login_user_id = user_info.user_id
    this.company_id = user_info.company_id;
    this.currency = user_info.currency;
    this.is_admin = user_info.is_administrator;
    this.is_manager = user_info.is_manager;
    this.select_user = this.login_user_id;
    this.get_capacity_info();
  }
  ngAfterViewInit(){
    if (localStorage.getItem('timer_task_id') != '') {
        var task_id = localStorage.getItem('timer_task_id');
        var title = localStorage.getItem('timer_task_title');
        $("#timer_task_id").val(task_id);
        this.loginservice.update_timer_task(title);
    }
 }
  get_capacity_info(){
    this.loader = true;
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id
    }
    this.dashboard_service.get_capacity_dashboard(info).subscribe(
      data=>{ 
        this.date_range = data.list.date_range;
        this.filter_user = data.list.filter_list;
        this.capacity_info = data.list;
        this.start_date = data.list.start_date;
        this.end_date = data.list.end_date;
        this.info = data.list.info;
        this.user_list = data.list.users;
        this.customer_list = data.list.customers;
        this.project_list = data.list.projects
        // billable & nono-billable graph data
        this.hours_data = data.list.hour_array;
        this.cost_data = data.list.cost_array;
        this.draw_graph_billable_cost();
        this.gaugeValue = data.list.total_task;
        this.change_graph_data();
        this.completed_task_chart(data.list.on_time,data.list.late);
        if(data.list.active_user != 0){
          this.active_user_widget = Math.round((this.filter_user.length * 100)/data.list.active_user);
        }else{
          this.active_user_widget = 0;
        }
        if(data.list.planned_time!= 0){
          this.planned_width =  Math.round(((this.capacity_info.actual_time/60) * 100)/(this.capacity_info.planned_time/60));
        }else{
          this.planned_width = 0;
        }
        this.capacity_info.planned_time = this.time_convert(this.capacity_info.planned_time);
        this.capacity_info.actual_time = this.time_convert(this.capacity_info.actual_time);
        this.loader =false;

        
      },error=>{
        this.loader = false;
      }
    )
  }

  date_change(date){
    this.start_date = this.chnage_format.transform(date[0]);
    this.end_date = this.chnage_format.transform(date[1]);
    let info = {
      "user_id":this.login_user_id,
      "company_id":this.company_id,
      "start_date":this.start_date,
      'end_date':this.end_date
    }
    this.loader =true;
    this.dashboard_service.get_data_on_filter_apply(info).subscribe(
      data=>{
        this.date_range = data.list.date_range;
        this.filter_user = data.list.filter_list;
        this.capacity_info = data.list;
        this.start_date = data.list.start_date;
        this.end_date = data.list.end_date;
        this.info = data.list.info;
        this.change_graph_data();
        this.gaugeValue = data.list.total_task;
        this.customer_list = data.list.customers;
        this.project_list = data.list.projects
        this.completed_task_chart(data.list.on_time,data.list.late);
        if(data.list.active_user != 0){
          this.active_user_widget = Math.round((this.filter_user.length * 100)/data.list.active_user);
        }else{
          this.active_user_widget = 0;
        }
        if(data.list.planned_time!= 0){
          this.planned_width =  Math.round(((this.capacity_info.actual_time/60) * 100)/(this.capacity_info.planned_time/60));
        }else{
          this.planned_width = 0;
        }
        this.capacity_info.planned_time = this.time_convert(this.capacity_info.planned_time);
        this.capacity_info.actual_time = this.time_convert(this.capacity_info.actual_time);

        //billable & non-billable graph data

        this.hours_data = data.list.hour_array;
        this.cost_data = data.list.cost_array;
        this.draw_graph_billable_cost();

        this.loader = false;
      }
    )
  }

  completed_task_chart(on_time,late){
    if(on_time != 0 || late != 0){
      this.barChart = new Chart(this.barCanvas1.nativeElement, {
        type: 'doughnut',
        data: {
            labels: ["On Time", "Late"],
            datasets: [{
                data: [on_time, late],
                backgroundColor: [
                    '#00A99E',
                    'red'
                ],
                borderColor: [
                  '#00A99E',
                    'red'
                ],
            }]
          },
          options: {
            legend: {
              display: false,
            }
        }
        
      });
    }else{
      this.barChart = new Chart(this.barCanvas1.nativeElement, {
        type: 'doughnut',
        data: {
            labels: ["Not Completed any Task"],
            datasets: [{
                data: [100],
                backgroundColor: [
                    'grey'
                ],
                borderColor: [
                  'gray'
                ],
            }]
          },
          options: {
            legend: {
              display: false,
            },
            tooltips: {
              callbacks: {
                  label: function(tooltipItem, data) {
                      var label = data.labels[tooltipItem.index] || '';
                      if (label) {
                          label += ' : 0';
                      }
                      return label;
                  }
              }
            }
        }
        
      });
    }
  }
  time_convert(value,user_id =''){
    if(user_id !=''){
      value = (value['user'][user_id]);
      if(value == 0){
        return '';
      }
    }
    let hours:any = (value / 60);
			hours = parseInt(hours)
    let minutes:any  = (value - (parseInt(hours) * 60))+'';
    if (minutes.length == 1) {
        minutes = '0'+ minutes;
    }
      return hours+'h'+minutes;
      
  }

  graph_data(date,user_id){
    this.data.length = 0;
    let value = this.info[user_id][date];
    this.data.push(value);
    return this.data;
  }
  change_view(type,date){
    
    let info = {
      'user_id':this.login_user_id,
      'company_id':this.company_id,
      'type':type,
      'date':date,
      'user_filter':this.user_filter,
      'select_user':this.select_user
    }

    this.dashboard_service.ajax_capacity_dashboard(info).subscribe(
      data=>{ 
        this.date_range = data.list.date_range;
        this.filter_user = data.list.filter_list;
        this.capacity_info = data.list;
        this.start_date = data.list.start_date;
        this.end_date = data.list.end_date;
        this.info = data.list.info;
        this.customer_list = data.list.customers;
        this.project_list = data.list.projects;
        this.gaugeValue = data.list.total_task;
        this.change_graph_data();
        this.completed_task_chart(data.list.on_time,data.list.late);
        if(data.list.active_user != 0){
          this.active_user_widget = Math.round((this.filter_user.length * 100)/data.list.active_user);
        }
        if(data.list.planned_time!= 0){
          this.planned_width =  Math.round(((this.capacity_info.actual_time/60) * 100)/(this.capacity_info.planned_time/60));
        }
        this.capacity_info.planned_time = this.time_convert(this.capacity_info.planned_time);
        this.capacity_info.actual_time = this.time_convert(this.capacity_info.actual_time);
        //billable & non-billable graph data

        this.hours_data = data.list.hour_array;
        this.cost_data = data.list.cost_array;
        this.draw_graph_billable_cost();
      }
    )
  }

  convert_price(value){
    return  parseFloat(value).toFixed(2);
  }

  onFlagChange(value){
    this.filter = value;
    if(value){
      this.user_filter = 'me';
      this.select_user = this.login_user_id;
      this.apply_team();
    }else{
      this.user_filter = 'team';
    }
  }

  ongraphChange(value){
    this.graph_type = value;
  }

  apply_team(){
    this.loader = true;
    let info = {
      'user_id':this.login_user_id,
      'company_id':this.company_id,
      'type':'current',
      'date':this.start_date,
      'user_filter':this.user_filter,
      'select_user':this.select_user
    }
    this.dashboard_service.ajax_capacity_dashboard(info).subscribe(
      data=>{ 
        this.date_range = data.list.date_range;
        this.filter_user = data.list.filter_list;
        this.capacity_info = data.list;
        this.start_date = data.list.start_date;
        this.end_date = data.list.end_date;
        this.info = data.list.info;
        this.customer_list = data.list.customers;
        this.project_list = data.list.projects;
        this.gaugeValue = data.list.total_task;
        this.change_graph_data();
        this.completed_task_chart(data.list.on_time,data.list.late);
        if(data.list.active_user != 0){
          this.active_user_widget = Math.round((this.filter_user.length * 100)/data.list.active_user);
        }
        if(data.list.planned_time!= 0){
          this.planned_width =  Math.round(((this.capacity_info.actual_time/60) * 100)/(this.capacity_info.planned_time/60));
        }
        this.capacity_info.planned_time = this.time_convert(this.capacity_info.planned_time);
        this.capacity_info.actual_time = this.time_convert(this.capacity_info.actual_time);
        this.loader = false;
      },
      error=>{
        console.log(error);
        this.loader = false;
      }
    )
  }

  change_graph_data(){
    this.category_analysis_graph.length = 0;
    if(this.category_graph_type == 'day'){
      this.category_analysis_graph.push(this.capacity_info.day_data);
    }else if(this.category_graph_type == 'week'){
      this.category_analysis_graph.push(this.capacity_info.week_data);
    }else{
      this.category_analysis_graph.push(this.capacity_info.month_data);
    }
  }

  draw_graph_billable_cost(){
    let data;
    if(this.billable_graph_type){
      data = this.hours_data;
    }else{
      data = this.cost_data;
    }
    this.barChart3 = new Chart(this.barCanvas3.nativeElement, {
      type: 'line',
      data: {
        datasets: [
            {
              label: 'billable',
              data: data.billable,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                'rgba(255,99,132,1)',
              ],
              borderWidth: 3,
              fill:false,
              pointHoverBackgroundColor:'rgba(255, 99, 132, 0.2)',
              pointHoverBorderColor:'rgba(255,99,132,1)',
              pointHoverRadius:5,
            },
            {
              label: 'non-billable',
              data: data.non_billable,
              type: 'line',
              backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
              ],
              borderWidth: 3,
              fill:false,
              pointHoverBackgroundColor:'rgba(54, 162, 235, 0.2)',
              pointHoverBorderColor:'rgba(54, 162, 235, 1)',
              pointHoverRadius:5
            }
          ],
          labels: data.dates,
        },
        options: {
          tooltips: {
              mode: 'point',
              callbacks: {
                label: function(tooltipItem, data) {
                  let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                  let time =  value +' h';
                  return time;
                }
            }
          },
          elements: {
            line: {
                tension: 0, // disables bezier curves
            },
          }
        }
      });
  }

  on_change_billable_type(status){
    this.billable_graph_type  = status;
    this.draw_graph_billable_cost();
    
  }
}
