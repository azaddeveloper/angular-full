import { Component,ViewChild, OnInit ,ViewContainerRef} from '@angular/core';
import { Router,Params,ActivatedRoute } from '@angular/router';
import { ProjectService } from './project.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import {FormControl} from '@angular/forms';
import { ReactiveFormsModule, FormsModule,FormGroup, FormBuilder, Validators,FormArray } from '@angular/forms';
import {TaskService} from '../services/task.service';
import { ChangeFormat} from '../pipes/changeformat.pipe';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {TaskpopupComponent} from '../taskpopup/taskpopup.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA,MatDialogConfig} from '@angular/material';
import {KanbanService} from '../kanban/kanban.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {TimeConvert} from '../pipes/timeconvter.pipe';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import {LoginService} from '../login/login.service';
declare const $: any;
import {environment} from '../../environments/environment';
@Component ({
   selector: 'editproject',
   templateUrl: './editproject.component.html',
   styleUrls:['./project.component.css'],
   providers:[ ProjectService,ChangeFormat,MatDialogConfig,KanbanService,TimeConvert]
})
export class EditProject implements OnInit {
    project_id:any;
    today: number = Date.now();
    login_user_id:any;
    company_id:any;
    project_info:any='';
    customers:any;
    division:any;
    form_general:FormGroup;
    departments:any;
    sections:any;
    subsections:any;
    task_detail:any;
    type_rec:any;
    comment_data:any;
    task_another_info:any;
    project_team:any='';
    Image_url:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
    project_owner:number;
    project_comments:any='';
    project_files:any ='';
    project_history:any = '';
    @ViewChild('recurrencewindow')
    recurrencewindow: BsModalComponent;
    @ViewChild('project_file_replace')
    project_file_replace:BsModalComponent;
    @ViewChild('taskactualtime')
    taskactualtime:BsModalComponent;
    @ViewChild('addprojectteam')
    addprojectteam:BsModalComponent;
    comment_error:boolean=false;
    replace_link:boolean;
    on_complete_actual_time:number;
    actual_time_status:number;
    add_file_config:any= { // Change this to your upload POST address:  
        url: environment.API_url+'/project/add_project_file',
        method:'post' ,
        clickable:true,
        paramName: "project_file",
        previewTemplate:"<span></span>",
        autoReset:1000,
    };
    replace_file_config: any = { // Change this to your upload POST address:  
        url: environment.API_url+'/project/replace_file',
        method: 'post',
        clickable: true,
        paramName: "project_file_replace",
        previewTemplate: "<span></span>",
        autoReset: 1000,
    }; 
    is_customer_user:number = 0;
    task_status_list:any = '';
    filter_status:any = 'opt';
    filter_user:any ='all';
    task_completed_id:any='';
    pricing_module_status:number = 1;
    customer_module_activation:number = 1;
    finance_info:any='';
    popup_member_list:any='';
    edit_status_id:any = [];
    edit_allocated_user_id:any=[];
    is_authenticated:boolean= false;
    image:any = '';
    background:any;
    currency:any='';
    Image_url1:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/';

    generalinfo:any = false;
    financeinfo:any = false;
    projectteam:any = false;
    projectcomment:any = false;
    projectfile:any = false;
    projecthistory:any = false;
    project_file:any = false;
    constructor(public loginservice:LoginService ,public DragulaService:DragulaService,public time:TimeConvert,private kanbanservice:KanbanService ,public toastr: ToastsManager,vcr: ViewContainerRef,public dialog: MatDialog,private dialogConfig:MatDialogConfig,private route: ActivatedRoute,private changeFormat:ChangeFormat, private taskservice:TaskService, public router:Router,private projectservice:ProjectService,private formBuilder:FormBuilder){
        
        this.toastr.setRootViewContainerRef(vcr);
        this.form_general = this.formBuilder.group({
            project_start_date: new FormControl(new Date()),
            project_end_date: new FormControl(new Date()),
            project_customer_id:new FormControl('0'),
            project_division_id:new FormControl({value:'0'}),
            project_department_id:new FormControl(),
            project_description:new FormControl('',Validators.required),
            project_status: ['', Validators.required],
        })
        this.today = this.changeFormat.transform(this.today);
        let status:any = JSON.parse(localStorage.getItem('status'));
        status.forEach(element => {
            let array = {
                "value":element.task_status_id,
                "text":element.task_status_name
            }
            this.edit_status_id.push(array);
            if(element.task_status_name == 'Completed'){
                this.task_completed_id = element.task_status_id;
            }
        });
        this.task_status_list = JSON.parse(localStorage.getItem('status'));
        DragulaService.drop.subscribe((value) => {
            const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
            let allIndex = this.getAllElementIndex(bagTarget);
            const newIndex = elTarget ? this.getElementIndex(elTarget) : bagTarget.childElementCount;
            // this.dragtask(value,newIndex,allIndex);
        });
        
    }
    ngOnInit(){
        this.route.params.subscribe(para=>{
            this.project_id  = para.id;
        })
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
        //     this.get_project_info();
        // }
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.currency = user_info.currency;
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
        this.get_project_info();
    }

    ngAfterViewInit(){
        if (localStorage.getItem('timer_task_id') != '') {
            var task_id = localStorage.getItem('timer_task_id');
            var title = localStorage.getItem('timer_task_title');
            $("#timer_task_id").val(task_id);
            this.loginservice.update_timer_task(title);
        }
    }
    getElementIndex(el: HTMLElement): number {
        return [].slice.call(el.parentElement.children).indexOf(el);
    }
    getAllElementIndex(el:HTMLElement){
        let arrayIndex = [].slice.call(el.children);
        let index:Array<any> = [];
        arrayIndex.forEach(element => { 
            var id = element.id.replace('task_','');
            index.push(id);
        });
        return index;
    }
    get_project_info(){
        let info = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "project_id":this.project_id
        }
        this.projectservice.project_detail(info).subscribe(
            data=>{ 
                this.project_info = data.info.project_info; // project info
                this.customers = data.info.customers; // customer list
                this.division = data.info.division; // division
                this.departments = data.info.departments; //department
                this.sections = data.info.section; // project section with task list
                this.subsections = data.info.subSection; //project subsection with task list
                this.project_team = data.info.members; // project team
                this.project_team.forEach(element => {
                    let array = {
                        "value":element.user_id,
                        "text":(element.first_name + element.last_name)
                    }
                    this.edit_allocated_user_id.push(array);
                });
                this.project_owner = data.info.is_project_owner; // project owmer
                this.project_comments = data.info.comments; // project comments
                this.project_files = data.info.files; //project files
                this.project_history = data.info.history; //project history
                this.finance_info = data.info.finance_info; // project finance detail
                this.add_file_config.params ={
                    "project_id":this.project_info.project_id,
                    "user_id":this.login_user_id
                }
                this.popup_member_list = data.info.member_lst; // add memeber popup user list
                this.actual_time_status = data.info.actual_time_status; // actual time status
                this.form_general.controls['project_status'].setValue(this.project_info.project_status);
                this.form_general.controls['project_division_id'].setValue(this.project_info.division_id);
                this.form_general.controls['project_department_id'].setValue(this.project_info.department_id);
                this.form_general.controls['project_customer_id'].setValue(this.project_info.project_customer_id);
                this.form_general.controls['project_description'].setValue(this.project_info.project_desc);
                this.form_general.controls['project_start_date'].setValue(this.project_info.project_start_date);
                this.form_general.controls['project_end_date'].setValue(this.project_info.project_end_date);
            },
            error=>{

            }
        )
    }
    /**
     * update project info
     * @param value 
     */
    update_project_info(value){
        let project = {
            "project_id":this.project_info.project_id,
            "company_id":this.company_id,
            "project":{
                //  'project_title':value.project_title,
                 "project_description":value.project_description,
                 "project_start_date":this.changeFormat.transform(value.project_start_date),
                 "project_end_date":this.changeFormat.transform(value.project_end_date),
                 "project_division":value.project_division_id,
                 "project_department":value.project_department_id,
                 "project_customer":value.project_customer_id,
                 "project_status":value.project_status
            }
        };
        this.projectservice.edit_project(project).subscribe(
            data=>{
                console.log(data);
            },
            error=>{

            }
        )
    }

    getdepartment(division_id){
        this.taskservice.get_department_by_divisionid(division_id,this.company_id).subscribe(
           data=>{ 
               this.departments=data.data;
           },
           error =>{
            
            }
       );
   }
   /**
     * Open task modal popup
     */
    open(task_info,type='') { 
         this.task_detail = task_info;
         this.dialogConfig.disableClose = true;
         this.dialogConfig.width = "800px";
         this.dialogConfig.data = {
             task_info: this.task_detail,
             type: this.type_rec,
             access:'project',
             status_id:this.task_detail.task_status_id
         }
         let dialogRef = this.dialog.open(TaskpopupComponent,this.dialogConfig);
           dialogRef.componentInstance.change_array.subscribe(data=>{
            if(this.task_detail.section_id !='0' && this.task_detail.subsection_id !='0'){
                this.subsections[this.task_detail.section_id].forEach((element1,index1) => {
                    if(this.task_detail.section_id == element1.main_section && this.task_detail.subsection_id == element1.section_id){
                        element1.task_list.forEach((element2,index2) => {
                            if(element2.task_id == this.task_detail.task_id){
                                element1.task_list[index2].task_id = data;
                            }
                        })
                    }
                })
            }else if(this.task_detail.section_id == '0' && this.task_detail.subsection_id !='0'){
                this.sections.forEach(element => {
                    if(element.section_id == this.task_detail.subsection_id){
                        element.task_list.forEach((element1,index) => {
                            if(element1.task_id == this.task_detail.task_id){
                                element.task_list[index].task_id = data;
                            }
                        })
                    }
                })
            }
           })
           dialogRef.afterClosed().subscribe(result => { 
            if(result.status == 'single'){
                this.comment_data = JSON.stringify(this.task_detail);
                if(this.task_detail.master_task_id!='0' && this.type_rec == 'occurrence'){
                    this.delete_task('','occurrence');
                }else if(this.task_detail.frequency_type == 'one_off'){
                    this.delete_task(this.task_detail,'single');
                }else{
                    this.delete_task('','series');
                }
             }else{
                 this.task_detail = result.info;
                 this.comment_data = '';
                 this.update_task(result.status);
             }
           });
     }
    recurrence_close(){
        this.recurrencewindow.close();
    }
    recurrence_open(task){
         this.task_detail =  JSON.parse(JSON.stringify(task));
         this.task_another_info = JSON.stringify(task);
         this.recurrencewindow.open();
    }
 
    recurrence(type,task_id){
         if(type == 'series'){
             this.task_detail.task_id = task_id;
             this.task_detail.master_task_id = 0;
             this.type_rec = '';
         }else{
             this.task_detail.frequency_type = 'one_off';
             this.type_rec = 'occurrence';
         }
         this.recurrencewindow.close();
         this.open(this.task_detail);
         
    }
    /**
     * Save task info when user close task popup
     * @param form task info
     */
    update_task(form){
        let info = form.value; 
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "task_info":this.task_detail,
            "start_date":'',
            "info":info,
            "from":'project'
        };
        this.taskservice.updatetask(data1).subscribe(
            data => {  
                if(this.task_detail.section_id !='0' && this.task_detail.subsection_id !='0'){
                    this.subsections[this.task_detail.section_id].forEach((element1,index1) => {
                        if(this.task_detail.section_id == element1.main_section && this.task_detail.subsection_id == element1.section_id){
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){
                                    element1.task_list[index2] = data.task_info.tasks;
                                }else{
                                    if(element2.master_task_id == this.task_detail.task_id && this.task_detail.frequency_type =='recurrence' && data.task_info.tasks.frequency_type == 'recurrence'){
                                        element1.task_list[index2] = data.task_info.tasks;
                                    }else if(element2.task_id == this.task_detail.task_id && element2.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                        element1.task_list[index2] = data.task_info.tasks;
                                    }else if(element2.master_task_id == this.task_detail.task_id && element2.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off'){
                                        element1.task_list[index2] = data.task_info.tasks;
                                    }
                                }
                            });
                        }
                    });
                }else if(this.task_detail.section_id == '0' && this.task_detail.subsection_id !='0'){
                    this.sections.forEach(element => {
                        if(element.section_id == this.task_detail.subsection_id){
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){
                                    element.task_list[index] = data.task_info.tasks;
                                }else{
                                    if(element1.master_task_id == this.task_detail.task_id && this.task_detail.frequency_type =='recurrence' && data.task_info.tasks.frequency_type == 'recurrence'){
                                        element.task_list[index] = data.task_info.tasks;
                                    }else if(element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                        element.task_list[index] = data.task_info.tasks;
                                    }else if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off'){
                                        element.task_list[index] = data.task_info.tasks;
                                    }
                                }
                            });
                        }
                    });
                }
                
                if(this.type_rec == 'occurrence'){
                    let rec_detail:any = {
                        "user_id":this.task_detail.task_allocated_user_id,
                        "company_id":this.company_id,
                        "task_id":this.task_detail.master_task_id             
                     };
                    this.kanbanservice.getNextInstance(rec_detail).subscribe(
                        info=>{ 
                            let task_info = info.task;
                            if(task_info.section_id !='0' && task_info.subsection_id !='0'){
                                this.subsections[task_info.section_id].forEach((element1,index1) => {
                                    if(task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id){
                                       element1.task_list.push(task_info);
                                    }
                                });
                            }else if(task_info.section_id == '0' && task_info.subsection_id !='0'){
                                this.sections.forEach(element => {
                                    if(element.section_id == task_info.subsection_id){
                                        element.task_list.push(task_info);
                                    }
                                });
                            }
                            this.type_rec = '';
                        },error=>{
                            console.log(error);
                        }
                    )
                }
            },
            error=>{ 
                
            }
        );
    }
   /**
     * Delete task from kanban board
     * @param task task-id
     * @param type delete type
     */
    delete_task(task,type){
        if(type == 'single'){ 
            let data1:any = {
                "company_id":this.company_id,
                "task_info":task,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{ 
                    if(task.section_id !='0' && task.subsection_id !='0'){
                        this.subsections[task.section_id].forEach((element1,index1) => {
                            if(task.section_id == element1.main_section && task.subsection_id == element1.section_id){
                                element1.task_list.forEach((element2,index2) => {
                                    if(element2.task_id == task.task_id){
                                        element1.task_list.splice(index2,1);
                                    }
                                });
                            }
                        });
                    }else if(task.section_id == '0' && task.subsection_id !='0'){
                        this.sections.forEach(element => {
                            if(element.section_id == task.subsection_id){
                                element.task_list.forEach((element1,index) => {
                                    if(element1.task_id == task.task_id){
                                        element.task_list.splice(index,1);
                                    }
                                });
                            }
                        });
                    }
                },
                error =>{
                }
            );
        }else{
            let info:any;
            if(task !=''){
                info = task;
            }else{
                info = JSON.parse(this.comment_data);
            }
            let data1:any = {
                "company_id":this.company_id,
                "task_info":info,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{ 
                    if(info.section_id !='0' && info.subsection_id !='0'){
                        this.subsections[info.section_id].forEach((element1,index1) => {
                            if(info.section_id == element1.main_section && info.subsection_id == element1.section_id){
                                element1.task_list.forEach((element2,index2) => {
                                    if(element2.task_id == info.task_id && type == 'occurrence'){
                                        element1.task_list.splice(index2,1);
                                        let rec_detail: any = {
                                            "user_id": info.task_allocated_user_id,
                                            "company_id": this.company_id,
                                            "task_id": info.master_task_id
                                        };
                                        this.kanbanservice.getNextInstance(rec_detail).subscribe(
                                            info => {
                                                let task_info = info.task;
                                                this.subsections[task_info.section_id].forEach((element1, index1) => {
                                                    if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                                                        element1.task_list.push(task_info);
                                                    }
                                                });
                                                this.type_rec = '';
                                            }, error => {
                                                console.log(error);
                                            }
                                        )
                                    }
                                    if (element1.master_task_id == info.task_id && type == 'series' && info.frequency_type =='recurrence') {
                                        element1.task_list.splice(index2, 1);
                                    }
                                });
                            }
                        });
                    }else if(info.section_id == '0' && info.subsection_id !='0'){
                        this.sections.forEach(element => {
                            if(element.section_id == info.subsection_id){
                                element.task_list.forEach((element1,index) => {
                                    if(element1.task_id == info.task_id && type == 'occurrence'){
                                        element.task_list.splice(index,1);
                                        let rec_detail: any = {
                                            "user_id": info.task_allocated_user_id,
                                            "company_id": this.company_id,
                                            "task_id": info.master_task_id
                                        };
                                        this.kanbanservice.getNextInstance(rec_detail).subscribe(
                                            info => {
                                                let task_info = info.task;
                                                this.sections.forEach(element => {
                                                    if (element.section_id == task_info.subsection_id) {
                                                        element.task_list.push(task_info);
                                                    }
                                                });
                                                this.type_rec = '';
                                            }, error => {
                                                console.log(error);
                                            }
                                        )
                                    }
                                    if ((element1.master_task_id == info.task_id) && info.frequency_type == 'recurrence' && type == 'series') {
                                        element.task_list.splice(index, 1);
                                    }
                                    if((element1.task_id == info.task_id) && info.frequency_type == 'recurrence' && type == 'series'){
                                        element.task_list.splice(index, 1);
                                    }
                                });
                            }
                        });
                    }
                    this.comment_data = '';
                    this.task_detail ='';
                    this.task_another_info = '';
                },
                error =>{
                }
            );
        }
    }
    /**
     * Add new task in project
     */
     add_task(task_title,section_id,sub_section_id,type) {
        let add_task = {
            "task_title":task_title,
            "project_id":this.project_info.project_id,
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "section_id":section_id,
            "sub_section_id":sub_section_id
        }
        this.projectservice.add_task(add_task).subscribe(
            data=>{
                let task_info = data.task_info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.push(task_info);
                        }
                    });
                    this.display_add_button(task_info.subsection_id);
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.push(task_info);
                        }
                    });
                    this.display_add_button(task_info.subsection_id);
                }
                if(type == 'enter'){
                    this.open(task_info);
                }
                
            },
            error=>{

            }
        )
    }

    hide_add_button(id){
        let input:any = document.querySelector("#add_task_"+id);
        let button:any = document.querySelector("#button_"+id);
        input.style.display ='block';
        button.style.display = 'none';
        input.focus();
    }

    display_add_button(id){
        let input: any = document.querySelector("#add_task_" + id);
        let button: any = document.querySelector("#button_" + id);
        input.style.display = 'none';
        button.style.display = 'block';
    }

    subsection_hide(id){
        let subsection:any = document.querySelector("#subsection_"+id);
        let icon:any = document.querySelector("#icon_"+id);
        if(subsection.style.display == 'block'){
            subsection.style.display = 'none';
            icon.innerHTML = '<i class="icon-chevron-right default_color"></i>';
        }else{
            subsection.style.display = 'block';
            icon.innerHTML = '<i class="icon-chevron-down default_color"></i>';
        }
    }

    section_hide(id){
        let section:any = document.querySelector("#section_"+id);
        let icon:any = document.querySelector("#icon_"+id);
        if(section.style.display == 'block'){
            section.style.display = 'none';
            icon.innerHTML = '<i class="icon-chevron-right default_color"></i>';
        }else{
            section.style.display = 'block';
            icon.innerHTML = '<i class="icon-chevron-down default_color"></i>';
        }
    }
    string_length(value){
        let length = value.length;
        let name = value;
        if(length >15){
            name = value.substring(0,15)+'...';
        }
        return name;
    }
    get_extension(value){ 
        return value.substring(value.lastIndexOf(".")+1);
    }

    /**
     * Insert new comment on the project
     */
    add_project_comment(form){
        let comment = form.project_comment.value;
        if(comment == ''){
            this.comment_error = true;
        }else{
            let detail = {
                "project_id":this.project_info.project_id,
                "user_id":this.login_user_id,
                "comment":comment
            }
            this.projectservice.add_comment(detail).subscribe(
                data=>{
                    this.project_comments = data.comments;
                    form.project_comment.value = '';
                    this.toastr.success('Comment added successfully.','');
                },
                error=>{

                }
            )
        }
    }
    /**
     * delete project comments
     */

     delete_comment(comment_id){
         let info={
             "user_id":this.login_user_id,
             "project_id":this.project_info.project_id,
             "comment_id":comment_id
         }
         this.projectservice.delete_comment(info).subscribe(
             data=>{
                 this.project_comments = data.comments;
                 this.toastr.success('Comment deleted successfully.','');
             }
         )
     }

     /**
      * add new link in project
      */
     add_link(data1){
         let file_name = data1.prj_file_name.value;
         let file_link = data1.prj_file_link.value;
         if(file_link == '' || file_name ==''){
            this.toastr.error('Please enter file link.','',{positionClass:"toast-top-center"});
         }else{
            let info ={
                "user_id":this.login_user_id,
                "project_id":this.project_info.project_id,
                "file_name":file_name,
                "file_link":file_link
            }
            this.projectservice.add_project_link(info).subscribe(
                data=>{
                    this.project_files.splice(0,0,data.file);
                    data1.prj_file_name.value = '';
                    data1.prj_file_link.value = '';
                    this.toastr.success('File added successfully.','');
                }
            )
        }
     }
     /**
      * Delete file from project
      */
     delete_file(file_id){
         let info = {
             "user_id":this.login_user_id,
             "project_id":this.project_info.project_id,
             "file_id":file_id
         }
         this.projectservice.delete_file(info).subscribe(
             data=>{
                this.toastr.success('File deleted successfully','',{positionClass:"toast-top-center"});
                 this.project_files.forEach((element,index) => {
                     if(element.task_file_id == file_id){
                         this.project_files.splice(index,1);
                     }
                 });
             }
         )
     }
     /**
      * Drag & drop add file
      * @param data file info
      */
     Addfile(data){
         let file = data[1].file;
         this.project_files.splice(0,0,file);
         this.toastr.success('File added successfully.','');
     }
     /**
      * File replace modal popup open
      */
     open_replace_file_popup(file_id){
         this.type_rec = file_id;
         this.project_file_replace.open();
         this.replace_file_config.params = {
            "project_id":this.project_info.project_id,
            "user_id":this.login_user_id,
            "rep_fil":file_id
        }
     }
     close_replace_file_popup(){
         this.project_file_replace.close();
         this.type_rec = '';
         this.replace_link = false;
     }
     /**
      * update file array after upload new file
      * @param data upload file info
      */
     replace_file(data){
        let file = data[1].file;
        this.project_files.forEach((element,index) => {
           if(element.task_file_id == file.task_file_id){
               this.project_files[index] = file;
           } 
        });
        this.close_replace_file_popup();
        this.toastr.success('File replaced successfully.','');
     }

     replace_project_link(data){
        let file_name = data.replace_file_name.value;
        let file_link = data.replace_file_link.value;
        if(file_link == '' || file_name ==''){
           this.toastr.error('Please enter file link.','');
        }else{
           let info ={
               "user_id":this.login_user_id,
               "project_id":this.project_info.project_id,
               "file_name":file_name,
               "file_link":file_link,
               "task_file_id":this.type_rec
           }
           this.projectservice.replace_link(info).subscribe(
               detail=>{
                    this.project_files.forEach((element,index) => {
                        if(element.task_file_id == detail.file.task_file_id){
                            this.project_files[index] = detail.file;
                        } 
                    });
                   this.close_replace_file_popup();
                   data.replace_file_name.value = '';
                   data.replace_file_link.value = '';
                   this.type_rec = '';
                   this.toastr.success('File replaced successfully.','');
               }
           )
       }
     }
     /**
      * Update project section &subsection name
      * @param value New section or subsection anme
      * @param section_id id
      */
     update_section_name(value,section_id){
        let info={
            "section_id":section_id,
            "section_title":value
        }
        this.projectservice.update_section_name(info).subscribe(data=>{});
     }

     create_sub_section(main_section_id,value){
         if(value == ''){
            this.toastr.error('Please enter sub-section name.','');
         }else{
            let info ={
                "user_id":this.login_user_id,
                "project_id":this.project_info.project_id,
                "section_id":main_section_id,
                "section_name":value
            }
            this.projectservice.create_sub_section(info).subscribe(
                data=>{
                    this.subsections[main_section_id].push(data.subsection);
                }
            )
        }
     }
     /**
      * Delete subsection from project
      * @param mainsection_id 
      * @param subsection_id 
      */
     delete_subsection(mainsection_id,subsection_id){
         let info = {
             "project_id":this.project_info.project_id,
             "section_id":mainsection_id,
             "subsection_id":subsection_id
         }
        this.projectservice.delete_subsection(info).subscribe(
            data=>{
                this.subsections[mainsection_id].forEach((element,index) => {
                    if(element.section_id == subsection_id){
                        this.subsections[mainsection_id].splice(index,1);
                    }
                });
            }
        )
     }

     /**
      * create section
      */
     create_section(section_value){
         if(section_value == ''){
            this.toastr.error('Please enter section name.','');
         }else{
            let info = {
                "project_id":this.project_info.project_id,
                "user_id":this.login_user_id,
                "section_name":section_value
            }
            this.projectservice.create_section(info).subscribe(
                data=>{
                    this.sections.push(data.section);
                    this.subsections[data.section.section_id] = [];
                },
                error=>{
                    console.log(error);
                }
            )
        }
     }
     /**
      * Delete project section
      * @param section_id peoject section id
      */
     delete_section(section_id){
         this.projectservice.delete_section(section_id,this.project_info.project_id).subscribe(
             data=>{
                 this.sections.forEach((element,index) => {
                     if(element.section_id == section_id){
                         this.sections.splice(index,1);
                     }
                 });

                 this.subsections[section_id].length = 0;
             }
         )
     }

     /**
      * update project title
      */
     save_project_title(value){
         this.projectservice.update_title(value,this.project_info.project_id).subscribe(data=>{});
     }
     /**
     * Open modal popup for getting task actual time
     */
    open_actual_time_popup(data){
        
        if(data.task_category_id =='0' && data.task_sub_category_id =='0' && data.task_status_name !='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }else{
            this.comment_data = data;
            this.on_complete_actual_time = 0;
            this.taskactualtime.open();
        }
    }
    /**
     * Close actual time popup
     */
    close_actual_time_popup(save = ''){
        if(save == ''){
            let checkbox:any = document.querySelectorAll("#is_completed_"+this.comment_data.task_id);
            checkbox[0].checked = false;
        }
        this.comment_data = '';
        this.on_complete_actual_time = 0;
        this.taskactualtime.close();
    }
    /**
     * Check time validation
     */
    change_actual_time(data):void{
        let value = data.task_actual_time.value;
        let hour: any = 0;
        let minute: any = 0;
        length = value.length;
        var numbers = /^[0-9]+$/;
        if (value.match(numbers)) {
            if (length > 4) {
                this.on_complete_actual_time = 0;
                data.task_actual_time.value = '';
                this.toastr.error('Only 4 digit number is allowed.', '', { positionClass: "toast-top-center" });
            } else if (length == 1 || length == 2) {
                hour = value;
                this.on_complete_actual_time = hour*60;
                data.task_actual_time.value = this.time.transform(hour*60);
            } else if (length == 3 || length == 4) {
                hour = (value / 100);
                hour = parseInt(hour)
                minute = (value - (parseInt(hour) * 100));
                if (minute > 59) {
                    hour++;
                    minute = minute - 60;
                }
                var total_time = hour*60 + minute;
                this.on_complete_actual_time = total_time;
                data.task_actual_time.value = this.time.transform(total_time);
            }
        } else {
            this.toastr.error('Please number is allowed. ', '', { positionClass: "toast-top-center" });
            data.task_actual_time.value = '';
            this.on_complete_actual_time = 0;
        }
        

    }
    /**
     * Save actual in db
     */
    save_actual_time(from){
        let task_info1 = this.comment_data;
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":1,
            "company_id":this.company_id,
            'time':this.on_complete_actual_time
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                let task_info = data.info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == task_info.task_id){
                                    element1.task_list[index2] = task_info;
                                }
                            });
                        }
                    });
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == task_info.task_id){
                                    element.task_list[index] = task_info;
                                }
                            });
                        }
                    });
                }
                if(task_info1.is_prerequisite_task == 1){
                    this.taskservice.check_completed_task_dependency(dependency).subscribe(
                        data=>{
                            if (task_info1.section_id != '0' && task_info1.subsection_id != '0') {
                                this.subsections[task_info1.section_id].forEach((element1, index1) => {
                                    if (task_info1.section_id == element1.main_section && task_info1.subsection_id == element1.section_id) {
                                        element1.task_list.forEach((element2,index2) => {
                                            if(element2.task_id == task_info1.prerequisite_task_id){
                                                element1.task_list[index2].task_status_id = data.info.task_status_id;
                                                element1.task_list[index2].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                                element1.task_list[index2].completed_depencencies = data.info.completed_depencencies;
                                            }
                                        });
                                    }
                                });
                            } else if (task_info1.section_id == '0' && task_info1.subsection_id != '0') {
                                this.sections.forEach(element => {
                                    if (element.section_id == task_info1.subsection_id) {
                                        element.task_list.forEach((element1,index) => {
                                            if(element1.task_id == task_info1.prerequisite_task_id){
                                                element.task_list[index].task_status_id = data.info.task_status_id;
                                                element.task_list[index].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                                element.task_list[index].completed_depencencies = data.info.completed_depencencies;
                                            }
                                        });
                                    }
                                });
                            }
                        },error=>{
                            console.log(error);
                    });
                }
               this.close_actual_time_popup('close');
               from.task_actual_time.value = '';
               this.comment_data = '';
            },
            error=>{ 
               
            }
        );
    }
    /**
     * Completed  task using checkobox
     * @param task_info 
     */
    is_completed(task_info:JSON){
        let task_info1:any = JSON.parse(JSON.stringify(task_info));
        if(task_info1.task_status_name == 'Completed'){
            status = '0';
        }else{
            status = '1';
        }
        
        if(task_info1.task_category_id =='0' && task_info1.task_sub_category_id =='0' && task_info1.task_status_name !='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":status,
            "company_id":this.company_id,
            "time":''
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                let task_info = data.info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == task_info.task_id){
                                    element1.task_list[index2] = task_info;
                                }
                            });
                        }
                    });
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == task_info.task_id){
                                    element.task_list[index] = task_info;
                                }
                            });
                        }
                    });
                }
                    if(task_info1.is_prerequisite_task == 1){
                        this.taskservice.check_completed_task_dependency(dependency).subscribe(
                            data=>{
                                if (task_info1.section_id != '0' && task_info1.subsection_id != '0') {
                                    this.subsections[task_info1.section_id].forEach((element1, index1) => {
                                        if (task_info1.section_id == element1.main_section && task_info1.subsection_id == element1.section_id) {
                                            element1.task_list.forEach((element2,index2) => {
                                                if(element2.task_id == task_info1.prerequisite_task_id){
                                                    element1.task_list[index2].task_status_id = data.info.task_status_id;
                                                    element1.task_list[index2].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                                    element1.task_list[index2].completed_depencencies = data.info.completed_depencencies;
                                                }
                                            });
                                        }
                                    });
                                } else if (task_info1.section_id == '0' && task_info1.subsection_id != '0') {
                                    this.sections.forEach(element => {
                                        if (element.section_id == task_info1.subsection_id) {
                                            element.task_list.forEach((element1,index) => {
                                                if(element1.task_id == task_info1.prerequisite_task_id){
                                                    element.task_list[index].task_status_id = data.info.task_status_id;
                                                    element.task_list[index].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                                    element.task_list[index].completed_depencencies = data.info.completed_depencencies;
                                                }
                                            });
                                        }
                                    });
                                }
                            },error=>{
                                console.log(error);
                        });
                    }
               
            },
            error=>{ 
               
            }
        );
    }

    get_status_name_by_id(id){
        let status:any = JSON.parse(localStorage.getItem('status'));
        let status_id = '';
        status.forEach(element => {// console.log(element);
            if(element.task_status_id == id){
                status_id = element.task_status_name;
            }
        });
        return status_id;
    }

    /**
     * Project filter condo
     */
    check_filter_condition(task_status_id,due_date,task_allocated_user_id){
        let task_status:any;
        if(this.filter_status =='ut'){
             if(due_date > this.changeFormat.transform(this.today) && due_date !='0000-00-00' && (this.filter_user == 'all' ||this.filter_user == task_allocated_user_id )){
                task_status = true;
             }else{
                 task_status = false;
             }
        }else if(this.filter_status =='tt'){
            if(due_date == this.changeFormat.transform(this.today) && due_date !='0000-00-00' && (this.filter_user == 'all' ||this.filter_user == task_allocated_user_id )){
                task_status = true;
            }else{
                task_status = false;
            }
        }else if(this.filter_status == 'ot'){
            if(due_date < this.changeFormat.transform(this.today) && due_date !='0000-00-00' && this.task_completed_id != task_status_id && (this.filter_user == 'all' ||this.filter_user == task_allocated_user_id )){
                task_status = true;
            }else{
                task_status = false;
            }
        }else if(this.filter_status =='all'){
            if(this.filter_user == 'all' ||this.filter_user == task_allocated_user_id){
                task_status = true;
            }else{
                task_status = false;
            }
        }else if(this.filter_status =='opt'){
            if(this.task_completed_id!=task_status_id && (this.filter_user == 'all' ||this.filter_user == task_allocated_user_id )){
                task_status = true;
            }else{
                task_status = false;
            }
        }else if(this.filter_status == 'ct'){
            if(this.task_completed_id == task_status_id && (this.filter_user == 'all' ||this.filter_user == task_allocated_user_id )){
                task_status = true;
            }else{
                task_status = false;
            }
        }
        return task_status;
    }
    /**
     * Update finance info
     */
    refresh_finance_info(){
        this.projectservice.update_finance_info(this.project_info.project_id,this.company_id).subscribe(
            data=>{
                this.finance_info = data.info;
            },
            error=>{

            }
        )
    }
    open_add_team_modal(){
        this.addprojectteam.open();
    }

    close_add_team_modal(){
        this.addprojectteam.close();
    }

    add_new_member(data){
        let user = data.user_id.value;
        let type = data.another_project_owner.checked;
        if(user == ''){
            this.toastr.error('Please select a user. ', '');
        }else{
            let is_owner:number = 0;
            if(type == true){
                is_owner = 1;
            }
            this.projectservice.add_team_member(this.project_info.project_id,user,is_owner).subscribe(
                data=>{
                    this.project_team = data.members;
                    this.popup_member_list.forEach((element,index) => {
                        if(element.user_id == user){
                            this.popup_member_list.splice(index,1);
                        }
                    });
                    this.close_add_team_modal();
                    let checkbox:any = document.querySelectorAll("#another_project_owner");
                        checkbox[0].checked = false;
                },
                error=>{

                }
            )
        }
    }

    remove_user(id){
        let info={
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "project_id":this.project_info.project_id,
            "project_user_id":id
        };
        this.projectservice.remove_user(info).subscribe(
            data=>{
                this.project_team = data.members;
                this.popup_member_list = data.members_list;
            }
        )
    }

    change_task_status(status_id,task_info){
        this.task_detail = task_info;
        let info = {
            "task_id":task_info.task_id,
            "company_id":this.company_id,
            "user_id":this.login_user_id,
            "task_info":task_info,
            "status_id":status_id
        }
        this.taskservice.change_status(info).subscribe(
            data=>{
                this.commonly_update_task_list(data);
            }
        )
    }

    change_allocated_user(user_id,task_info){
        this.task_detail = task_info;
        let info = {
            "user_id":user_id,
            "task_info":task_info
        }
        this.taskservice.change_allocated_user(info).subscribe(
            data=>{
                 this.commonly_update_task_list(data);
            },
            error=>{

            }
        )
    }
    change_due_date(date:Date,task_info:JSON):void{
        this.task_detail = task_info;
        let new_date = this.changeFormat.transform(date);
        let data1:any = {
            "company_id":this.company_id,
            "task_info":task_info,
            "user_id":this.login_user_id,
            "type":'due_date',
            'date':new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data=>{
                this.commonly_update_task_list(data);
            },
            error=>{

            }
        )
    }

    commonly_update_task_list(data):void{
        if(this.task_detail.section_id !='0' && this.task_detail.subsection_id !='0'){
            this.subsections[this.task_detail.section_id].forEach((element1,index1) => {
                if(this.task_detail.section_id == element1.main_section && this.task_detail.subsection_id == element1.section_id){
                    element1.task_list.forEach((element2,index2) => {
                        if(element2.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){
                            element1.task_list[index2] = data.info;
                        }else{
                            if(element2.master_task_id == this.task_detail.task_id && this.task_detail.frequency_type =='recurrence' && data.info.frequency_type == 'recurrence'){
                                element1.task_list[index2] = data.info;
                            }else if(element2.task_id == this.task_detail.task_id && element2.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                element1.task_list[index2] = data.info;
                            }else if(element2.master_task_id == this.task_detail.task_id && element2.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off'){
                                element1.task_list[index2] = data.info;
                            }
                        }
                    });
                }
            });
        }else if(this.task_detail.section_id == '0' && this.task_detail.subsection_id !='0'){
            this.sections.forEach(element => {
                if(element.section_id == this.task_detail.subsection_id){
                    element.task_list.forEach((element1,index) => {
                        if(element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){
                            element.task_list[index] = data.info;
                        }else{
                            if(element1.master_task_id == this.task_detail.task_id && this.task_detail.frequency_type =='recurrence' && data.info == 'recurrence'){
                                element.task_list[index] = data.info;
                            }else if(element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                element.task_list[index] = data.info;
                            }else if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'one_off'){
                                element.task_list[index] = data.info;
                            }
                        }
                    });
                }
            });
        }
        
        if(data.status == 'occurrence'){
            let rec_detail:any = {
                "user_id":this.task_detail.task_allocated_user_id,
                "company_id":this.company_id,
                "task_id":this.task_detail.master_task_id             
             };
            this.kanbanservice.getNextInstance(rec_detail).subscribe(
                info=>{ 
                    let task_info = info.task;
                    if(task_info.section_id !='0' && task_info.subsection_id !='0'){
                        this.subsections[task_info.section_id].forEach((element1,index1) => {
                            if(task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id){
                               element1.task_list.push(task_info);
                            }
                        });
                    }else if(task_info.section_id == '0' && task_info.subsection_id !='0'){
                        this.sections.forEach(element => {
                            if(element.section_id == task_info.subsection_id){
                                element.task_list.push(task_info);
                            }
                        });
                    }
                    this.type_rec = '';
                },error=>{
                    console.log(error);
                }
            )
        }
        this.task_detail = '';
    }


    change_user_rate(rate,user_id){
        var numbers = /^[0-9\.\:\/]+$/;
        if (rate.match(numbers)) {
            console.log(user_id);
        }else{
            this.toastr.error('Only number is allowed.','');
            this.project_team.forEach((element,index) => {
                if(element.user_id == user_id){ console.log(user_id)
                    this.project_team[index].project_rate = '';
                    this.project_team[index].project_rate = '0.00';
                }
            });
            console.log(this.project_team);
        }
    }

    change_priority(task_id, priority, task_info) {
        
        let data1: any = {
            "task_id": task_id,
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "task_priority": priority,
            "task_info": task_info
        };
        this.taskservice.change_priority(data1).subscribe(
            data => {
                let task_info = data.info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == task_info.task_id){
                                    element1.task_list[index2] = task_info;
                                }
                            });
                        }
                    });
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == task_info.task_id){
                                    element.task_list[index] = task_info;
                                }
                            });
                        }
                    });
                }

            },
            error => {
            }
        );
    }

    right_click_update_due_date(event, info) {
        
        let new_date = this.changeFormat.transform(event);
        let data1: any = {
            "company_id": this.company_id,
            "task_info": info,
            "user_id": this.login_user_id,
            "type": 'due_date',
            'date': new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data => {
                let task_info = data.info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == task_info.task_id){
                                    element1.task_list[index2] = task_info;
                                }
                            });
                        }
                    });
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == task_info.task_id){
                                    element.task_list[index] = task_info;
                                }
                            });
                        }
                    });
                }
            },
            error => {
            }
        );
    }

    right_click_change_status(task_id, status_id, task_info) {
        let status_name = this.get_status_name_by_id(status_id);
        
        if(task_info.task_category_id =='0' && task_info.task_sub_category_id =='0' && status_name =='Completed'){
            this.toastr.error('You can not complete this task as it does not have a category and sub category.','');
            return false;
        }
        let data1: any = {
            "task_id": task_id,
            "company_id": this.company_id,
            "status_id": status_id,
            "task_info": task_info,
            "user_id": this.login_user_id
        };
        this.taskservice.change_status(data1).subscribe(
            data => {
                let task_info = data.info;
                if (task_info.section_id != '0' && task_info.subsection_id != '0') {
                    this.subsections[task_info.section_id].forEach((element1, index1) => {
                        if (task_info.section_id == element1.main_section && task_info.subsection_id == element1.section_id) {
                            element1.task_list.forEach((element2,index2) => {
                                if(element2.task_id == task_info.task_id){
                                    element1.task_list[index2] = task_info;
                                }
                            });
                        }
                    });
                } else if (task_info.section_id == '0' && task_info.subsection_id != '0') {
                    this.sections.forEach(element => {
                        if (element.section_id == task_info.subsection_id) {
                            element.task_list.forEach((element1,index) => {
                                if(element1.task_id == task_info.task_id){
                                    element.task_list[index] = task_info;
                                }
                            });
                        }
                    });
                }

            },
            error => {
            }
        );
    }

}