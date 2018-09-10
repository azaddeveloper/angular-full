import { Component,ViewChild,ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from './project.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import {FormControl} from '@angular/forms';
import { ReactiveFormsModule, FormsModule,FormGroup, FormBuilder, Validators,FormArray } from '@angular/forms';
import {TaskService} from '../services/task.service';
import { ChangeFormat} from '../pipes/changeformat.pipe';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {LoginService} from '../login/login.service';
declare const $: any;

@Component ({
   selector: 'project',
   templateUrl: './project.component.html',
   styleUrls:['./project.component.css'],
   providers:[ ProjectService,ChangeFormat]
})
export class ProjectComponent  {
    login_user_id:any;
    company_id:any;
    projects:Array<any> = [];
    today: number = Date.now();
    @ViewChild('addproject')
    addproject: BsModalComponent;
    @ViewChild('deleteProject')
    deleteProject:BsModalComponent;
    customers:any;
    division:any;
    department:any='';
    projectData: FormGroup;
    is_customer_user:number;// is customer user access
    customer_module_activation:number;
    is_company_owner:number;
    projects_list:any =[];
    hidden_project_id:any;
    is_authenticated:boolean = false;
    image:any = '';
    background:any;

    project_lists:any = false;
    constructor(public loginservice:LoginService,vcr: ViewContainerRef,public toastr: ToastsManager,private changeFormat:ChangeFormat, private taskservice:TaskService, public router:Router,private projectservice:ProjectService,private formBuilder:FormBuilder){
        // this.loginservice.isAuthenticated.take(1).subscribe(authenticated=>{
        //     this.is_authenticated = authenticated;
        // })
        // if(!this.is_authenticated){
        //     this.router.navigateByUrl('');
        // }else{
        //     this.loginservice.currentUser.subscribe(data=>{
        //         this.login_user_id = data.user_id;
        //         this.company_id = data.company_id;
        //     })
        //     this.get_project();
        // }
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.is_customer_user = user_info.is_customer_user;
        this.customer_module_activation = user_info.customer_module_activation;
        this.is_company_owner = user_info.is_owner;
        this.get_project();
        this.toastr.setRootViewContainerRef(vcr);
        this.projectData = this.formBuilder.group({
            project_title: [null, Validators.required],
            project_start_date: new FormControl(new Date()),
            project_end_date: new FormControl(new Date()),
            project_customer_id:new FormControl('0'),
            project_division_id:new FormControl({value:'0',disabled:false}),
            project_department_id:new FormControl({value:'',disabled:true}),
            project_description:new FormControl(''),
            project_status: ['Open', Validators.required],
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
    ngAfterViewInit(){
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
    }
    get_project(){
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id
        };
        this.projectservice.get_projects(info).subscribe(
            data=>{
                this.projects = data.info.projects;
                this.customers = data.info.customers;
                this.division = data.info.division;
                if(this.division == ''){
                    this.projectData.controls['project_division_id'].disable();   
                }
                console.log(data);
            },
            error=>{
                console.log(error);
            }
        )
    }

    open_add_project(){
        this.addproject.open();
    }
    close_add_project(){
        this.addproject.close();
    }

    getdepartment(division_id){
        this.taskservice.get_department_by_divisionid(division_id,this.company_id).subscribe(
           data=>{ 
               if(data.data !=''){
                    this.projectData.controls['project_department_id'].enable();
               }else{
                    this.projectData.controls['project_department_id'].disable();   
               }
               this.department=data.data;
           },
           error =>{
            }
       );
   }

   create_project(form){
       let project = {
           "user_id":this.login_user_id,
           "company_id":this.company_id,
           "project":{
                'project_title':form.value.project_title,
                "project_description":form.value.project_description,
                "project_start_date":this.changeFormat.transform(form.value.project_start_date),
                "project_end_date":this.changeFormat.transform(form.value.project_end_date),
                "project_division":form.value.project_division_id,
                "project_department":form.value.project_department_id,
                "project_customer":form.value.project_customer_id,
                "project_status":form.value.project_status
           }
       };
       this.projectservice.add_project(project).subscribe(
           data=>{
               this.close_add_project();
               this.projects.splice(0,0,data.info);
               this.projectData.controls['project_title'].setValue('');
               this.projectData.controls['project_description'].setValue(''); 
               this.projectData.controls['project_start_date'].setValue(new Date());
               this.projectData.controls['project_end_date'].setValue(new Date());
               this.projectData.controls['project_division_id'].setValue('0');
               this.projectData.controls['project_department_id'].setValue('');
               this.projectData.controls['project_status'].setValue('Open');
               this.projectData.controls['project_customer_id'].setValue('0');
           },
           error=>{

           }
       )
   }
   /**
    * Show porject list on the selection of project status select box.
    */
   change_status(value){
       let info = {
           "user_id":this.login_user_id,
           "company_id":this.company_id,
           "filter":value
       }
      this.projectservice.project_filter(info).subscribe(
          data=>{ console.log(data.projects);
            this.projects.length = 0;  
            this.projects = data.projects;
          },
          error=>{

          }
      )
   }

   copy_project(project_id){
       let info = {
           "user_id":this.login_user_id,
           'company_id':this.company_id,
           "project_id":project_id
       }
       this.projectservice.copy_project(info).subscribe(
           data=>{
            this.projects.push(data.project);
           },
           error=>{

           }
       )
   }

   open_delete_project_popup(project_id){
       this.projects_list.length = 0;
       this.projects.forEach((element,index)=>{
            if(project_id != element.project_id){
                this.projects_list.push(element);
            }
       });
       this.hidden_project_id = project_id;
       this.deleteProject.open();
   }
   close_delete_project_popup(){
       this.hidden_project_id = '';
       this.deleteProject.close();
   }
   confirm_delete(data1){
        let status = data1.delete_status.value;
        let select_project = data1.select_project.value;
        if(status == ''){
            this.toastr.error('Please select a option.','');
        }else if(status == 'remap' && select_project == ''){
            this.toastr.error('Please select a project.','');
        }else if(status == 'cancel'){
            this.close_delete_project_popup();
        }else{
            let info ={
                "project_id":this.hidden_project_id,
                "status":status,
                "select_project":select_project,
                "user_id":this.login_user_id,
                "company_id":this.company_id
            }
            this.projectservice.delete_project(info).subscribe(
                data=>{
                    this.projects.forEach((element,index) => {
                        if(element.project_id ==this.hidden_project_id){
                            this.projects.splice(index,1);
                        }
                    });
                    this.hidden_project_id = '';
                    data1.delete_status.value = '';
                    this.projects_list.length = 0;
                    this.close_delete_project_popup();
                },
                error=>{

                }
            )
        }
   }

   delete_project(project_id,status=''){
        let detail = {
            "user_id":this.login_user_id,
            "project_id":project_id,
            "company_id":this.company_id,
            "status":status,
            "select_project":''
        }
        this.projectservice.delete_project(detail).subscribe(
            data=>{
                this.projects.forEach((element,index) => {
                    if(element.project_id == project_id){
                        this.projects.splice(index,1);
                    }
                });
            },
            error=>{

            }
        )
   }

   search_project(data){
       let search = data.search.value;
       let status = data.duration.value;
        this.projectservice.search_project(search,status,this.company_id,this.login_user_id).subscribe(
            data=>{
                this.projects = data.projects;
            },
            error=>{
                
            }
        )
   }

}