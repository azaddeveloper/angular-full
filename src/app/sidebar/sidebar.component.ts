import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';

@Component ({
   selector: 'sidebar',
   templateUrl: './sidebar.component.html',
   
})
export class SidebarComponent  implements OnInit{
    customer_module_access:number;
    pricing_module_status:number;
    timesheet_module_status:number;
    is_manger:number;
    user_access:any='';
    constructor(public login_service:LoginService){
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.customer_module_access  = user_info.customer_module_activation;
        this.pricing_module_status = user_info.pricing_module_status;
        this.timesheet_module_status = user_info.timesheet_module_status;
        this.is_manger = user_info.user_count;
        this.login_service.get_user_access(user_info.user_id).subscribe(
            data=>{
                this.user_access = data.info;
            }
        )
    } 
    ngOnInit(){
        this.login_service.module_access$.subscribe(
            data=>{
                if(data !=''){
                   let info = JSON.parse(JSON.stringify(data));
                    if(info.type == 'customer'){
                        this.customer_module_access = info.status;
                    }else if(info.type == 'timesheet'){
                        this.timesheet_module_status = info.status;
                    }
                }
            }
        )
    }
    
}