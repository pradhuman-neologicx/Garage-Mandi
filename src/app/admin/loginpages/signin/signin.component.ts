import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  OtpVerify,
  SendOtp,
  SignINRes,
  SignIn,
} from 'src/app/core/model-class/login-signup';
import { Validations } from 'src/app/core/model-class/validations';
import { JwtService } from 'src/app/core/services/jwt.service';
import { LoginService } from 'src/app/core/services/login.service';
import { ApiService } from 'src/app/core/services/api.service';
import { DataService } from 'src/app/core/services/data.service';
import { NotificationService } from 'src/app/core/services/notificationnew.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: [
    trigger('succesfullyMesaage', [
      state(
        'void',
        style({
          transform: 'translateX(-30%)',
          opacity: 0,
        }),
      ),
      transition(':enter, :leave', [
        animate('0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'),
      ]),
    ]),
    trigger('slideIn', [
      state(
        'void',
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        }),
      ),
      transition(':enter', [
        animate(
          '0.5s ease-out',
          style({
            transform: 'translateX(0)', // Final position for slide-in effect
            opacity: 1, // Final opacity
          }),
        ),
      ]),
    ]),
  ],
})
export class SigninComponent {
  title = 'Login';

  Onselectlogin(value: any) {
    this.login = value;
  }
  signIn!: FormGroup;
  openSecondsuccess: boolean = false;
  successName: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiservice: ApiService,
    private dataService: DataService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private loginService: LoginService,
  ) { }
  // validation: Validations = new Validations();
  loginAS!: number;
  email_pattern = '^[A-Za-z0-9_.]+@[a-zA-Z]+(\\.[a-zA-Z]{2,4})+$';
  ngOnInit(): void {
    // this.jwtService.clearStorage();
    this.signIn = this.formBuilder.group({
      Email: [
        '',
        [Validators.required, Validators.pattern(this.email_pattern)],
      ],
      Password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // SignIn: SignIn = new SignIn();
  // SignINRes: SignINRes = new SignINRes();
  errorMessage: any;
  showErrorMessage: boolean = false;
  submitted!: boolean;
  isOtpSent: boolean = false;
  loginType!: number;
  sessionId!: string;
  otp_pattern = '^[0-9]{6}$';

  markAllAsTouched() {
    for (const control in this.signIn.controls) {
      if (this.signIn.controls.hasOwnProperty(control)) {
        this.signIn.controls[control].markAsTouched();
      }
    }
  }
  password: string = 'password';
  show: boolean = false;

  closeModal() {
    this.openSecondsuccess = false;
  }

  togglePasswordVisibility() {
    this.show = !this.show;
    this.password = this.show ? 'text' : 'password';
  }

  login() {
    this.errorMessage = '';
    if (this.signIn.valid) {
      this.submitted = true;
      const formData = new FormData();
      formData.append('email', this.signIn.get('Email')?.value);
      formData.append('password', this.signIn.get('Password')?.value);

      this.loginService.AdminLoginapi(formData).subscribe({
        next: (response: any) => {
          if (response && (response.status === 200 || response.status === 201 || response.status === true || response.token || response.data?.token || !response.error)) {
            this.closeModal();
            this.successName = 'Login';
            setTimeout(() => {
              this.openSecondsuccess = true;
              setTimeout(() => {
                this.openSecondsuccess = false;

                const user = response.user || response.data?.user || {};
                const token = response.token || response.data?.token;

                if (user.id) this.jwtService.savepanelUserId(user.id.toString());
                if (user.name) this.jwtService.saveadminame(user.name);
                if (token) this.jwtService.saveAdminToken(token);

                // Extract role name or slug from the role object, fallback to 'admin'
                const role = user.role?.slug || user.role?.name || 'admin';
                this.jwtService.saveAdminRole(role);

                this.jwtService.isLoggedIn(true);
                this.ngOnInit();
                this.router.navigate(['admin/dashboard']);
              }, 1800);
            }, 200);
          } else {
            this.errorMessage = response.message || 'Invalid Credentials';
            this.submitted = false;
          }
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage = err;
          this.submitted = false;
        }
      });
    } else {
      this.submitted = false;
      this.errorMessage = 'Please enter valid credentials';
      this.signIn.markAllAsTouched();
    }
  }

  findInvalidControls(formName: any) {
    const invalid = [];
    const controls = formName.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log(invalid);
    return invalid;
  }

  resetEmail() {
    this.signIn.reset();
  }
}
