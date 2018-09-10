import { Component, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import { TaskpopupComponent } from '../taskpopup/taskpopup.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Observable } from 'rxjs/Rx';
import { ChangeFormat } from '../pipes/changeformat.pipe';
declare const $: any;
import { Chart } from 'chart.js';
declare let TOTAL_TIME: any;
import { environment } from '../../environments/environment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { TaskService } from '../services/task.service';
@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [ChangeFormat, MatDialogConfig]
})
export class HeaderComponent implements OnInit {
    info: any = '';
    company_info: any = '';
    Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
    company_list: any = '';
    company_id: any = '';
    @ViewChild('feedback')
    feedback: BsModalComponent;
    fileToUpload: File = null;
    feedbackdata: FormGroup;
    login_user_id: number;
    is_admin: number;
    pricing_module: number;
    customer_module: number;
    notifications: any = '';
    notification_count: number;
    interruptions: number;
    @ViewChild('work_log')
    work_log: BsModalComponent;
    worklog: FormGroup;
    worklog_data: any = '';
    worklog_dates: any = '';
    company_logo:any = '';

    @ViewChild('statistics')
    statistics: BsModalComponent;
    @ViewChild('barCanvas1') barCanvas1;
    barChart: any = '';
    @ViewChild('barCanvas2') barCanvas2;
    barChart2: any = '';
    loader: boolean = false;
    view: any[] = [600, 400];
    stacked_graph = [];
    // options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = '';
    showYAxisLabel = true;
    yAxisLabel = '';
    timer_access: boolean;
    colorScheme = {
        domain: ['rgb(51, 102, 204)',
            'rgb(220, 57, 18)',
            'rgb(255, 153, 0)',
            'rgb(16, 150, 24)',
            'rgb(153, 0, 153)',
            'rgb(0, 153, 198)']
    };

    type_rec: any = '';
    task_detail: any = '';
    task_another_info: any = '';
    constructor(public taskservice: TaskService, public dialogConfig: MatDialogConfig, public dialog: MatDialog, public time_format: ChangeFormat, public toastr: ToastsManager, vcr: ViewContainerRef, public router: Router, public loginservice: LoginService, public builder: FormBuilder) {
        this.get_login_user_info();
        this.company_list = JSON.parse(localStorage.getItem('company_list'));
        this.feedbackdata = this.builder.group({
            rating: ['good'],
            like_description: [null, Validators.required],
            improve_description: [null, Validators.required],

        })
        Observable.interval(1000 * 60 * 15).subscribe(x => {
            this.load_notifiaction();
        });
        this.toastr.setRootViewContainerRef(vcr);

        this.worklog = this.builder.group({
            worklog_start_date: [null, Validators.required],
            worklog_end_date: [null, Validators.required]
        })
        if (localStorage.getItem('timer_task_id') != 'undefined' || localStorage.getItem('timer_task_id') != '') {
            // $("#timer_show").on('click',()=>{
            //     var self = this;
            this.showhide();
            // })
            this.loginservice.timer_notification.subscribe(data => {
                if (data != '') {
                    this.chk_task_selected(data, '');
                }
            })
        }

    }
    ngOnInit() {
        if ($('#from').val() == 'from_kanban' || $('#from').val() == 'from_calendar' || $('#from').val() == 'weekView' || $('#from').val() == 'from_project') {
            this.timer_access = true;
        }
        this.loginservice.module_access$.subscribe(
            data => {
                if (data != '') {
                    let info = JSON.parse(JSON.stringify(data));
                    if (info.type == 'price') {
                        this.pricing_module = info.status;
                    }
                }
            }
        )
        this.loginservice.module_access$.subscribe(
            data => {
                if (data != '') {
                    let info = JSON.parse(JSON.stringify(data));
                    if (info.type == 'company_image') {
                        this.company_logo = info.status;
                    } else if (info.type == 'user_image') {
                        this.info.profile_image = info.status;
                    }
                }
            }
        )

    }

    get_login_user_info() {
        let user_info = JSON.parse(localStorage.getItem('info'));
        let user_id = user_info.user_id;
        this.login_user_id = user_info.user_id;
        this.pricing_module = user_info.pricing_module_status;
        this.customer_module = user_info.customer_module_activation;
        this.is_admin = user_info.is_administrator;
        this.company_id = user_info.company_id;
        this.loginservice.get_login_user_data(user_id, this.company_id).subscribe(
            data => {
                this.info = data.info.user_info;
                this.company_info = data.info.company_info;
                this.company_logo = this.company_info.company_logo;
                this.notifications = data.info.notification;
                this.notification_count = data.info.notification_count;
                this.interruptions = data.info.interruptions;
            }
        )
    }

    logout() {
        localStorage.clear();
        this.router.navigateByUrl('');
    }

    switch_company(new_company_id) {
        if (this.company_id != new_company_id) {
            let data = JSON.parse(localStorage.getItem('login_info'));
            let loginInfo = {
                email: data.email,
                password: data.password,
                company_id: new_company_id
            };
            this.loginservice.getlogin(loginInfo).subscribe(
                data1 => {
                    if (data1.response == 'success') {
                        localStorage.setItem('user_background_type', data1.data.user_background_type);
                        localStorage.setItem('user_background_name', data1.data.user_background_name);
                        localStorage.setItem('info', JSON.stringify(data1.data))
                        localStorage.setItem('login_info', JSON.stringify(loginInfo));
                        window.location.reload();
                    }

                },
                error => {

                });
        }
    }

    /**
     * Open task modal popup
     */
    open(task_info, type = '') {
        this.task_detail = task_info;
        this.dialogConfig.disableClose = true;
        this.dialogConfig.width = "800px";
        this.dialogConfig.data = {
            task_info: this.task_detail,
            type: this.type_rec,
            access: '',
            status_id: this.task_detail.task_status_id
        }
        let dialogRef = this.dialog.open(TaskpopupComponent, this.dialogConfig);
        dialogRef.componentInstance.change_array.subscribe(data => {

        })
        dialogRef.afterClosed().subscribe(result => {
            if (result.status == 'single') {
                this.task_another_info = this.task_detail;
                this.delete_task(this.task_another_info, 'occurrence');
            } else {
                this.task_detail = result.info;
                this.task_another_info = '';
                this.update_task(result.status);
            }
        });
    }
    open_notification_task(task_id, allocated_user_id,notification_id,timesheet_id ='') {
        let info = {
            user_id:this.login_user_id,
            company_id:this.company_id,
            task_id:task_id,
            allocated_user_id :allocated_user_id,
            notification_id:notification_id,
            timesheet_id:timesheet_id
        }
        this.loginservice.get_task_info(info).subscribe(
            data => {
                this.notification_count = data.total;
                this.notifications.forEach(element => {
                    if(element.task_notification_id == notification_id){
                        element.is_read = 1;
                    }
                });
                if(task_id !='0'){
                    this.open(data.info, '');
                }else{
                    this.router.navigateByUrl('/opentimesheet/'+data.timesheet_id);
                }
            }
        )
    }

    delete_task(task, type) {
        let data1: any = {
            "company_id": this.company_id,
            "task_info": task,
            "user_id": this.login_user_id,
            "type": ''
        };
        this.taskservice.delete_task(data1).subscribe(
            data => {
                // this.loginservice.update_timer_data(task);
                this.task_another_info = '';
                this.task_detail = '';
            },
            error => {
            }
        );

    }

    update_task(form) {
        let info = form.value;
        let data1: any = {
            "user_id": this.login_user_id,
            "company_id": this.company_id,
            "task_info": this.task_detail,
            "info": info,
            "start_date": '',
            "from": ''
        };

        this.taskservice.updatetask(data1).subscribe(
            data => {
                this.loginservice.update_timer_data(data.task_info.tasks);
                this.type_rec = '';
                this.task_another_info = '';
                this.task_detail = '';
            },
            error => {

            }
        );
    }
    open_feedback_modal() {
        this.feedback.open()
    }

    close_feedback_modal() {
        this.feedback.close();
    }

    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }
    send_feedback_request(data) {
        this.loader = true;
        this.loginservice.send_feedback(this.fileToUpload, data, this.login_user_id, this.company_id).subscribe(
            data => {
                this.loader = false;
                this.feedbackdata.reset();
                this.fileToUpload = null;
                this.close_feedback_modal();
            }
        );
    }

    delete_notification(id) {
        this.loginservice.deleteNotification(id, this.login_user_id).subscribe(
            data => {
                this.notification_count = data.info;
                this.notifications.forEach((element, index) => {
                    if (id == element.task_notification_id) {
                        this.notifications.splice(index, 1)
                    }
                });
            }
        )
    }

    load_notifiaction() {
        this.loginservice.get_letestnotification(this.login_user_id).subscribe(
            data => {
                let new_notifications = data.info;
                this.notifications = this.notifications.concat(new_notifications);
                this.notification_count = Number(this.notification_count) + Number(new_notifications.length)
            }
        )
    }

    read_all_notification() {
        this.loginservice.read_all_notification(this.login_user_id).subscribe(
            data => {
                this.notifications.forEach(element => {
                    element.is_read = 1;
                });
                this.notification_count = 0;
            }
        )
    }

    showhide() {
        $('#common-sortbybox').hide();
        $("#common-projbox").hide();
        $("#common-statusbox").hide();
        $("#common-duedatebox").hide();
        $("#common-teambox").hide();
        $('#common-calendbox').hide();
        if ($('#common-timerbox').is(':visible')) {
            $('#common-timerbox').hide();
            $("#is_timer_on").val("0");
            // if (localStorage.getItem('timer_status') != 'stop' && localStorage.getItem('timer_task_id') !='') {
            //     this.toastr.warning('Your timer is still running in the background.', 'Click on the Timer icon to display it again.');
            // }
        } else {
            $('#common-timerbox').show();
            $("#common-timerbox").draggable();
            $("#is_timer_on").val("1");
        }
        $('#common-colorbox').hide();
    }

    selectTask() {
        $("#timer_task_title").show();
        $("#timer_task_title").html('Click on the task to start timer.');
        $("#common-timerbox").css("height", "265px");
        localStorage.setItem('timer_status', '');
        return false;
    }

    select_task() {

        $("#timer").timer('reset');
        $(".full_task div").removeClass("before_timer");
        $(".comm-box  a").addClass("after_timer_on");
        $(".taskbox  a").addClass("after_timer_on");
        this.selectTask();
    }
    // Init timer start
    start_interruption() {
        let startagain: any = Math.round(new Date().getTime() / 1000);
        var stop: any = localStorage.getItem('stop_time');
        var stop1 = parseInt(stop);
        var duration: any = startagain - stop;

        if (localStorage.getItem('duration'))
            duration = duration + parseInt(localStorage.getItem('duration'));
        localStorage.setItem('start_again', startagain);
        localStorage.setItem('duration', duration);

        $("#timer").timer('resume');
        $("#is_timer_popup").val('1');
        $("#start_interruption").hide();
        $("#stop").show();
        //$("#change_tak").show();
        localStorage.setItem('timer_status', '');
    }

    // reason select
    select_reason() {
        $("#common-timerbox").css("height", "265px");
    }

    //Resume timer
    resume_timer() {
        $('#timer').timer('resume');
        $("#is_timer_popup").val('1');
        $("#reason_div").hide();
        $("#timer_div").show();
        $("#start").hide();
        $("#stop").show();
        $("#change_tak").show();
    }

    // Init timer pause
    stop_timer() {
        $("#timer_div").hide();
        $("#reason_div").show();
        $("#common-timerbox").css("height", "295px");
    }

    end_task() {
        if ($('#task_com_status').val() === 'red') {
            this.toastr.error('You cannot change status of the main task as its dependent tasks are still not completed.', '');
            return false;
        } else {
            this.end_task_timer();
        }

    }
    sec2TimeObj(sec) {
        var hours: any = 0, minutes: any = Math.floor(sec / 60), seconds;

        // Hours
        if (sec >= 3600) {
            hours = Math.floor(sec / 3600);
        }
        if (hours < 10) {
            hours = '0' + hours;
        }
        // Minutes
        if (sec >= 3600) {
            minutes = Math.floor(sec % 3600 / 60);
        }
        // Prepend 0 to minutes under 10
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        // Seconds
        seconds = sec % 60;
        // Prepend 0 to seconds under 10
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }
    end_task_timer() {
        var comment = $("#timer_comment").val();

        var start_time = localStorage.getItem('start_again');
        var currenttime = Math.round(new Date().getTime() / 1000);
        var timer_time = currenttime - parseInt(start_time);

        var minutes = timer_time / 60;
        var tobject = this.sec2TimeObj(timer_time);
        var total_time = tobject.hours + ':' + tobject.minutes + ':' + tobject.seconds;
        var task_id = $("#timer_task_id").val();
        if (total_time) {
            var a = total_time.split(':'); // split it at the colons
            var minutes = (+a[0]) * 60 + (+a[1]);
            $.ajax({
                type: "post",
                url: environment.API_url + '/calender/save_time',
                data: { task_id: task_id, user_id: this.login_user_id, company_id: this.company_id, time: total_time, name: 'completed', timer_comment: comment },
                success: (data) => {
                    var data = $.parseJSON(data);
                    var task_time = data.total_spent_time;
                    var scope_time_div = task_time.split("/");
                    if (scope_time_div[1] != "0m") {
                        $("#task_time_" + task_id).show();
                    }
                    $("#task_time_" + task_id).html(data.total_spent_time);
                    $("#timer").html("00:00:00");
                    $("#timer").timer('pause');
                    $("#is_timer_popup").val('0');
                    $("#hdn_timer").val('');
                    $("#total_interruptions").html(data.interruptions);
                    $("#reason_div").hide();
                    $("#timer_div").show();
                    $("#stop").hide();
                    $("#change_tak").hide();
                    $("#start").hide();
                    $("#select_task").show();
                    $("#timer_task_title").hide();
                    $("#timer_comment").hide();
                    $("#timer_comment").val('');
                    $("#total_timer").html("00:00:00");
                    this.loginservice.update_timer_data(data.task_info);

                },
                error: function (data) {

                    this.toastr.error("Please check your internet connection."),
                        console.log("Ajax request not received!");
                }
            });
        }
        localStorage.setItem('timer_task_id', '');
        localStorage.setItem('start_time', '');
        localStorage.setItem('stop_time', '');
        localStorage.setItem('duration', '');
        localStorage.setItem('timer_status', '');
        localStorage.setItem('start_again', '');
        localStorage.setItem('total_time', '');
        localStorage.setItem('timer_task_title', '');
    }

    change_task() {

        var start_time = localStorage.getItem('start_again');
        var currenttime = Math.round(new Date().getTime() / 1000);
        var timer_time = currenttime - parseInt(start_time);

        var min = timer_time / 60;
        var tobject = this.sec2TimeObj(timer_time);
        var total_time = tobject.hours + ':' + tobject.minutes + ':' + tobject.seconds;

        var task_id = $("#timer_task_id").val();
        if (localStorage.getItem('timer_status') && localStorage.getItem('timer_status') == 'stop') { } else {
            if (total_time) {
                var a = total_time.split(':'); // split it at the colons
                var minutes = (+a[0]) * 60 + (+a[1]);
                $.ajax({
                    type: "post",
                    url: environment.API_url + '/calender/save_time',
                    data: { task_id: task_id, time: total_time, user_id: this.login_user_id, company_id: this.company_id },
                    success: (data) => {

                        var data = $.parseJSON(data);
                        var task_time = data.total_spent_time;
                        var scope_time_div = task_time.split("/");
                        if (scope_time_div[1] != "0m") {
                            $("#task_time_" + task_id).show();
                        }
                        $("#task_time_" + task_id).html(data.total_spent_time);
                        $('#timer').timer('pause');
                        $("#is_timer_popup").val('0');
                        $("#hdn_timer").val('');
                        $("#total_interruptions").html(data.interruptions);
                        this.loginservice.update_timer_data(data.task_info);

                    }
                });
            }
        }
        $("#is_timer_popup").val('1');

        localStorage.setItem('timer_task_id', '');
        localStorage.setItem('start_time', '');
        localStorage.setItem('stop_time', '');
        localStorage.setItem('duration', '');
        localStorage.setItem('timer_status', '');
        localStorage.setItem('start_again', '');
        localStorage.setItem('total_time', '');
        localStorage.setItem('timer_task_title', '');
        //$("#timer_task_id").val('');
        this.select_task();

    }

    add_interruption(val) {
        var comment = $("#timer_comment").val();
        if (val) {

            var task_id = $("#timer_task_id").val();
            var start_time = localStorage.getItem('start_again');
            var currenttime: any = Math.round(new Date().getTime() / 1000);
            var timer_time = currenttime - parseInt(start_time);

            var minutes = timer_time / 60;
            var tobject = this.sec2TimeObj(timer_time);
            var total_time = tobject.hours + ':' + tobject.minutes + ':' + tobject.seconds;

            localStorage.setItem('stop_time', currenttime);
            localStorage.setItem('timer_status', 'stop');
            $.ajax({
                type: 'post',
                url: environment.API_url + '/calender/save_time',
                data: { user_id: this.login_user_id, company_id: this.company_id, task_id: task_id, time: total_time, interruption: JSON.stringify(val), timer_comment: comment },
                success: (data) => {//alert(data);
                    var data = $.parseJSON(data);
                    var task_time = data.total_spent_time;
                    var scope_time_div = task_time.split("/");
                    if (scope_time_div[1] != "0m") {
                        $("#task_time_" + task_id).show();
                    }
                    $("#task_time_" + task_id).html(data.total_spent_time);
                    $('#timer').timer('pause');
                    $("#is_timer_popup").val('0');
                    $("#hdn_timer").val($("#timer").html());
                    $("#total_interruptions").html(data.interruptions);
                    $("#reason_div").hide();
                    $("#timer_div").show();
                    $("#stop").hide();
                    //$("#change_tak").show();
                    //$("#endtask").hide();
                    $("#start").hide();
                    $("#start_interruption").show();
                    $("#timer_comment").show();
                    $("#timer_comment").val('');

                    let hr: any = Math.floor(data.total_timer_time / 60);
                    let min: any = data.total_timer_time - (hr * 60);
                    let sec = '00';

                    if (min < 10) { min = '0' + min; }
                    if (hr < 10) { hr = '0' + hr; }
                    this.loginservice.update_timer_data(data.task_info);

                    var spent_time = hr + ':' + min + ':' + sec;
                    $("#total_timer").html(spent_time);

                }
            });
        }
    }

    get_date_range_work_flow(data) {
        let from_date = data.worklog_start_date;
        let to_date = data.worklog_end_date;
        console.log(data)
        this.loginservice.work_log_data(this.login_user_id, this.time_format.transform(from_date), this.time_format.transform(to_date), this.company_id).subscribe(
            data => {
                this.worklog_data = data.info;
                this.worklog_dates = data.dates
            }
        )
    }

    worklog_reset() {
        this.worklog.reset();
        this.loginservice.work_log_data(this.login_user_id, '', '', this.company_id).subscribe(
            data => {
                this.worklog_data = data.info;
                this.worklog_dates = data.dates
            }
        )
    }

    open_work_log_modal() {
        this.work_log.open();
        this.loginservice.work_log_data(this.login_user_id, '', '', this.company_id).subscribe(
            data => {
                this.worklog_data = data.info;
                this.worklog_dates = data.dates
            }
        )
    }

    close_work_log_modal() {
        this.work_log.close();
        this.worklog.reset();
    }

    convert_time(time) {
        let data = time.split(':');
        let hr = data[0];
        let min = data[1];
        let sec = data[2];

        if (hr > 0) {
            time = hr + 'h ' + min + 'm ' + sec + 's';
        } else if (min > 0) {
            time = min + 'm ' + sec + 's';
        } else if (sec > 0) {
            time = sec + 's';
        } else {
            time = '0s';
        }
        return time;
    }

    add_worklog_comment(comment, id) {
        this.loginservice.edit_worklog_comment(id, comment).subscribe();
    }

    open_statistics_modal() {
        this.statistics.open();
        this.loginservice.get_timer_graph_data(this.login_user_id, this.company_id).subscribe(
            data => {
                let info = data.info;
                this.barChart = new Chart(this.barCanvas1.nativeElement, {
                    type: 'bar',
                    data: {
                        labels: info.timer_label,
                        datasets: [{
                            label: 'Spent time per day(In minutes)',
                            data: info.timer_data,
                            backgroundColor: [
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                            ],
                            borderColor: [
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                                'rgba(51, 102, 204,1)',
                            ],
                            borderWidth: 1,
                        }]
                    },
                    options: {
                        title: {
                            display: true,
                            text: 'Time spent last 7 days'
                        }
                    }
                });

                this.barChart2 = new Chart(this.barCanvas2.nativeElement, {
                    type: 'pie',
                    data: {
                        labels: info.pie_chart_label,
                        datasets: [{
                            data: info.pie_chart_data,
                            backgroundColor: [
                                'rgb(51, 102, 204)',
                                'rgb(220, 57, 18)',
                                'rgb(255, 153, 0)',
                                'rgb(16, 150, 24)',
                                'rgb(153, 0, 153)',
                                'rgb(0, 153, 198)'
                            ],
                            borderColor: [
                                'rgb(51, 102, 204)',
                                'rgb(220, 57, 18)',
                                'rgb(255, 153, 0)',
                                'rgb(16, 150, 24)',
                                'rgb(153, 0, 153)',
                                'rgb(0, 153, 198)'
                            ],
                        }]
                    },
                    options: {
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Last 7 days Interruptions'
                        }
                    }

                });

                this.stacked_graph = info.stacked_graph_data;

            }

        )
    }
    close_statistics_modal() {
        this.statistics.close();
    }
    rectime(time) {
        let hr: any = Math.floor(time / 60);
        let min: any = time - (hr * 60);
        let sec = '00';

        if (min < 10) { min = '0' + min; }
        if (hr < 10) { hr = '0' + hr; }
        return hr + ':' + min + ':' + sec;
    }
    chk_task_selected(title, time) {
        $(".full_task div a").unbind('click', false);
        $(".task_tasksort ul li a").unbind('click', false);
        $("#timer_task_title").show();
        $("#timer_task_title").html('Task : ' + title);
        localStorage.setItem('timer_task_title', title);
        var spent_time = this.rectime(time);
        var task_id = $("#timer_task_id").val();
        // $("#total_timer").html(spent_time);
        var start_time = 0;
        var cdate = new Date();
        var time: any = Math.round(cdate.getTime() / 1000);
        var old_task_id = localStorage.getItem('timer_task_id');
        var oldtime = localStorage.getItem('start_time');
        if (old_task_id == task_id && oldtime != '') {
            var oldtime1 = parseInt(oldtime);
            start_time = time - oldtime1;

            if (localStorage.getItem('duration')) {
                start_time = start_time - parseInt(localStorage.getItem('duration'));
            }

        } else {
            $("#timer").timer('reset');
            localStorage.setItem('timer_task_id', task_id);
            localStorage.setItem('start_time', time);
            localStorage.setItem('timer_status', '')
            localStorage.setItem('start_again', time);
        }

        $("#is_timer_popup").val('1');
        TOTAL_TIME = localStorage.getItem('total_time') ? parseInt(localStorage.getItem('total_time')) : 0;
        if (task_id) {
            if (start_time == 0) {
                $.ajax({
                    type: 'post',
                    url: environment.API_url + '/calender/spent_time',
                    data: { task_id: task_id },
                    success: function (time) {
                        let hr: any = Math.floor(time / 60);
                        let min: any = time - (hr * 60);
                        let sec = '00';

                        if (min < 10) { min = '0' + min; }
                        if (hr < 10) { hr = '0' + hr; }
                        var spent_time = hr + ':' + min + ':' + sec;
                        $("#total_timer").html(spent_time);
                        var time: any = parseInt(time) * 60;
                        localStorage.setItem('total_time', time);
                    }
                });
            }
            if (localStorage.getItem('timer_status') && localStorage.getItem('timer_status') == 'stop') {
                var oldtime1 = parseInt(oldtime);
                start_time = parseInt(localStorage.getItem('stop_time')) - oldtime1;

                if (localStorage.getItem('duration'))
                    start_time = start_time - parseInt(localStorage.getItem('duration'));


                $("#total_timer").html(this.rectime(TOTAL_TIME));
                $('#timer').timer({
                    editable: true,
                    seconds: start_time
                });


                $('#timer').timer('pause');
                $("#start_interruption").show();
                $("#stop").hide();
            }
            else {
                $('#timer').timer({
                    editable: true,
                    seconds: start_time
                });
                $("#start_interruption").hide();
                $("#stop").show();
            }
            // hasTimer = true;


            //$(this).addClass('hidden');
            $('#stop').removeClass('hidden');
            $("#select_task").hide();
            $("#start").hide();
            $("#resumeme").hide();
            if ($('#from').val() == 'from_kanban' || $('#from').val() == 'from_calendar' || $('#from').val() == 'weekView' || $('#from').val() == 'from_project') {
                $("#change_tak").show();
            }

            $("#timer_comment").show();
            //$("#endtask").show();
        } else {
            return false;
        }
    }
}