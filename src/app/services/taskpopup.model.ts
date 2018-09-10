export class Taskpopupform{
    task_id:any="";
    master_task_id:number=0;
    is_prerequisite_task:number=0;
    prerequisite_task_id:number=0;
    multi_allocation_task_id:number=0;
    task_company_id:number=0;
    task_project_id:number=0;
    section_id:number=0;
    subsection_id:number=0;
    section_order:number=0;
    subsection_order:number=0;
    task_order:any="";
    task_title:any="";
    task_description:any="";
    is_personal:number=0;
    task_priority:string="None";
    task_status_id:number;
    task_division_id:any="";
    task_department_id:any="";
    task_category_id:any="";
    task_color_id:number=0;
    task_staff_level_id:number=0;
    task_sub_category_id:number=0;
    task_skill_id:any="";
    task_due_date:any="";
    task_scheduled_date:any="";
    task_orig_scheduled_date:any="";
    task_orig_due_date:any="";
    is_scheduled:number=0;
    task_time_estimate:any="";
    task_owner_id:number;
    task_allocated_user_id:number;
    locked_due_date:number=0;
    task_time_spent:any="";
    frequency_type:any="one_off";
    recurrence_type:any="";
    Daily_every_day:any="";
    Daily_every_weekday:any="";
    Weekly_every_week_no:any="";
    Weekly_week_day:any="";
    monthly_radios:any="";
    Monthly_op1_1:any="";
    Monthly_op1_2:any="";
    Monthly_op2_1:any="";
    Monthly_op2_2:any="";
    Monthly_op2_3:any="";
    Monthly_op3_1:any="";
    Monthly_op3_2:any="";
    yearly_radios:any="";
    Yearly_op1:any="";;
    Yearly_op2_1:any="";
    Yearly_op2_2:any="";
    Yearly_op3_1:any="";
    Yearly_op3_2:any="";
    Yearly_op3_3:any="";
    Yearly_op4_1:any="";
    Yearly_op4_2:any="";
    start_on_date:any="";
    no_end_date:any="";
    end_after_recurrence:number=0;
    end_by_date:any="";
    Daily_every_week_day:any="";
    customer_id:any="";
    profile_image:any="";
    first_name:any="";
    last_name:any="";
    color_id:number=0;
    task_status_name:any="";
    allocated_user_name:any="";
    owner_name:any="";
    watch:number=0;
    tm:number=0;
    comment_data:any='';
    steps_data:any='';
    file_data:any='';
    dependency_data:any='';
}