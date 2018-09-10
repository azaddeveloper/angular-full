import { Component, ViewContainerRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from './login.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { PasswordMatchValidation } from '../usersetting/custom.validation';
declare const grecaptcha:any;
declare const $:any;
@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    user: {
        userName?: string,
        password?: string
    } = {};
    error: any;
    iserror: boolean = false;
    login_form: FormGroup;
    company_list: any = [];
    company_count: number = 0;
    login_window: boolean = true;
    forgetpassword_window: boolean = false;
    forget_password: FormGroup;
    reset_password_window: boolean = false;
    changePassword: FormGroup;
    reset_user_id: any = '';
    singup_window: boolean = false;
    password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,16}$/;
    image: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';

    sign_up_form: FormGroup;
    background_image:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
    constructor(private activeroute: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef, public loginservice: LoginService, public route: Router, private formBuilder: FormBuilder) {
        this.login_form = this.formBuilder.group({
            email: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
            password: [null, Validators.required],
            company_id: [null]
        });
        this.forget_password = this.formBuilder.group({
            forget_email: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]]
        })
        this.toastr.setRootViewContainerRef(vcr);

        this.activeroute.params.subscribe(data => {
            if (data.id != 'login') {
                this.resetpassword(window.atob(data.id));
            }
        })
        this.changePassword = this.formBuilder.group({
            new_password: [null, [Validators.required, Validators.pattern(this.password_pattern)]],
            confirm_password: [null, [Validators.required]]
        }, {
                validator: PasswordMatchValidation.MatchPassword // password match validation method
            })

        this.sign_up_form = this.formBuilder.group({
            first_name: [null, [Validators.pattern("^[a-zA-Z]+$"), Validators.required]],
            last_name: [null, [Validators.pattern("^[a-zA-Z]+$"), Validators.required]],
            email: [null, [Validators.required, Validators.email], this.check_email_exist.bind(this)],
            new_password: [null, [Validators.required, Validators.pattern(this.password_pattern)]],
            confirm_password: [null, [Validators.required]],
            company_name: [null]
        }, {
                validator: PasswordMatchValidation.MatchPassword // password match validation method
            })

            $("body").css('background',"url("+this.background_image+") center center / 100% no-repeat fixed");
    }

    getcompany_list(email) {
        this.loginservice.getcompany_list(email).subscribe(
            data => {
                this.company_list = data.info.companys
                this.login_form.controls['company_id'].setValue(this.company_list[0].company_id);
                this.company_count = this.company_list.length;
                localStorage.setItem('company_list',JSON.stringify(this.company_list));
            },
            error => {

            }
        )
    }

    login(form) {
        let data = form.value;
        let loginInfo = {
            email: data.email,
            password: window.btoa(data.password),
            "company_id": data.company_id
        };
        this.loginservice.getlogin(loginInfo).subscribe(
            data1 => {
                if (data1.response == 'success') {
                    localStorage.setItem('user_background_type', data1.data.user_background_type);
                    localStorage.setItem('user_background_name', data1.data.user_background_name);
                    localStorage.setItem('info', JSON.stringify(data1.data))
                    localStorage.setItem('login_info',JSON.stringify(loginInfo));
                    this.route.navigate(['/todo']);
                }
                if (data1.response == 'error') {
                    this.error = data1.message;
                    this.iserror = true;
                }
            },
            error => {

            });
    }

    password_forget(value) {
        this.loginservice.forget_password(value.forget_email).subscribe(
            data => {
                if (data.message == 'success') {
                    this.toastr.success('Your request has been sent. Please check your email', '');
                } else {
                    this.toastr.error('Email Address Not Found.', '');
                }
                this.forgetpassword_window = false;
                this.login_window = true;
                $("body").css('background',"url("+this.background_image+") center center / 100% no-repeat fixed");
            }
        )
    }

    resetpassword(data) {
        $("body").css('background',"#fff");
        this.reset_password_window = true;
        this.login_window = false;
        this.forgetpassword_window = false;
        this.singup_window = false;
        this.reset_user_id = data;
    }

    back_login() {
        this.route.navigateByUrl('');
        this.reset_password_window = false;
        this.login_window = true;
        this.singup_window = false;
        $("body").css('background',"url("+this.background_image+") center center / 100% no-repeat fixed");
    }

    update_password(data) {
        let info = {
            'password': data.new_password,
            'id': this.reset_user_id
        }
        this.loginservice.reset_password(info).subscribe(
            data => {
                if (data.message == 1) {
                    this.toastr.success('Your password has been reset successfully.', '');
                }
                this.route.navigateByUrl('');
                this.reset_password_window = false;
                this.login_window = true;
                this.reset_user_id = '';
                $("body").css('background',"url("+this.background_image+") center center / 100% no-repeat fixed");
            }
        )
    }

    sign_up(): void {
        this.sign_up_form.reset();
        this.singup_window = true;
        this.login_window = false;
        this.forgetpassword_window = false;
        $("body").css('background',"#FFF");
    }

    check_email_exist(control: AbstractControl) {
        return this.loginservice.is_email_exist(control.value).map(res => {
            return res.status ? { exist: true } : null;
        });
    }

    create_new_company(data) {
        // grecaptcha.execute();

        this.loginservice.sign_up(data).subscribe(
            data=>{
                if(data.status.status == 'success'){
                    this.toastr.success('Company has been registered successfully.', '');
                }
                this.sign_up_form.reset();
                this.login_window =true;
                this.singup_window = false;
            }
        )
    }

}