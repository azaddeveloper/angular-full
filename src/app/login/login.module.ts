import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent} from './login.component';
import { FormsModule,ReactiveFormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { LoginService} from './login.service';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent
    
  ],

  providers: [
    LoginService
  ]
})
export class LoginModule {}