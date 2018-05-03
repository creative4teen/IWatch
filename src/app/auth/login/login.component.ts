import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Router, Routes } from '@angular/router';

import { AuthService } from '../auth.service';
import { UIService } from '../../shared/ui.service';
import { ShareDataService } from '../../common/share-data.service';

import { Church } from '../../common/church.model';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    isLoading = false;

    private loadingSubs: Subscription;

    constructor(private authService: AuthService, 
                private _router: Router,
                private uiService: UIService, 
                public sharedDataService: ShareDataService) {
    }


    ngOnInit() {
        this.loadingSubs = this.uiService.loadingStateChanged.subscribe(isLoading => {
            this.isLoading = isLoading;
        });
        this.loginForm = new FormGroup({
            languageSelect: new FormControl('', { validators: [Validators.required] }),
            churchType: new FormControl('', {validators: [Validators.required]}),
            homeChurchSelect:  new FormControl('', {validators: [Validators.required]}),
            email: new FormControl('', {validators: [Validators.required, Validators.email]}),
            password: new FormControl('', { validators: [Validators.required] }),
            mobile: new FormControl('', { validators: [Validators.required] })
        });

        this.loginForm.controls['languageSelect'].setValue(this.sharedDataService.language);
        this.loginForm.controls['churchType'].setValue(this.sharedDataService.type);
        this.loginForm.controls['homeChurchSelect'].setValue(this.sharedDataService.homeChurch);
        this.loginForm.controls['email'].setValue(this.sharedDataService.email);
        this.loginForm.controls['password'].setValue(this.sharedDataService.password);
        this.loginForm.controls['mobile'].setValue(this.sharedDataService.mobile);
    }

    
    validArray(array){
        for (let str of array) {
            if (str==null || str.length==0)  {
                return false;
            }
        }
        return true;
    }


    onSubmit() {
        this.sharedDataService.email = this.loginForm.get("email").value;
        this.sharedDataService.password = this.loginForm.get("password").value;
        this.sharedDataService.mobile = this.loginForm.get('mobile').value;
        //
        this.sharedDataService.saveToCookies();
        //
        this.authService.login({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        });
    }


    languageChanged( lang: string ){
        if (lang != null){
            this.sharedDataService.language = lang;
            this.sharedDataService.saveToCookies();
            // this.sharedDataService.touchJSON();
        }
        this._router.navigate(['login']);
    }


    homeChanged(homeCh : Church){
        this.sharedDataService.homeChurch = homeCh;
        this.sharedDataService.saveToCookies();
        // location.reload();
        this._router.navigate(['login']);
    }


    typeChanged( ty: string ){
        if (ty != null){
            this.sharedDataService.type = ty;
            this.sharedDataService.saveToCookies();
        }
        this._router.navigate(['login']);
    }
    

    ngOnDestroy() {
        if (this.loadingSubs) {
            this.loadingSubs.unsubscribe();
        }
    }

    
}
