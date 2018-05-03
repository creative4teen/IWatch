import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { RequestOptions, RequestMethod, Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ShareDataService } from '../common/share-data.service';
import { Media } from '../common/media.model';
import 'rxjs/Rx';


@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit, OnDestroy {
    @Output() sidenavToggle = new EventEmitter<void>();

    isAuth = false;
    authSubscription: Subscription;
    ongoing = false;
    activitySubscription: Subscription;

    title: string;
    meetingdate: Date;

    updateResult: string = "";

    constructor(public authService : AuthService, private http: Http, public shareDataService: ShareDataService) {}

    ngOnInit() {
        this.authSubscription = this.authService.authChange.subscribe(authStatus => {
            this.isAuth = authStatus;
        });
        //
        this.activitySubscription = this.shareDataService.activityChanged.subscribe(
            act => {
                if (act) {
                    this.ongoing = true;
                } else {
                    this.ongoing = false;
                }
            }
        );
    }



    ngOnDestroy() {
        this.authSubscription.unsubscribe();
        
        if (this.activitySubscription) {
            this.activitySubscription.unsubscribe();
        }
    }


  
    onLogout() {
        this.authService.logout();
    }



    selectActivity(form: NgForm) {
        let activityid = form.value.activityid;
        this.updateResult = "";
    
        if (this.shareDataService.runningActivity==null || this.shareDataService.runningActivity.id != activityid){
            let act = this.shareDataService.selectActivity(activityid);
        }
    }
    


    createActivityFromTemplate(form: NgForm) {
        let tempid = form.value.templateid;
        this.updateResult = "";

        if (this.shareDataService.runningActivity==null || this.shareDataService.runningActivity.parent_id != tempid){
            let act = this.shareDataService.startNewActivity(tempid);
        }
    }


    

    onFileChange(event: EventTarget, med:Media) {
        let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
        let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
        med.upload = null;
        med.uploadResult = null;
        //
        if (target.files && target.files.length > 0){
            let files: FileList = target.files;
            if (files[0].size < 4*1024*1024){
                med.upload = files[0];
            }
            else {
                med.uploadResult = med.type + ":" + med.name + " ~ '文件太大(须小于4M)'";
            }
        }
    }


    addMedia(){
        let md = new Media();
        md.type = "picture";
        md.name = "媒体名称";
        md.url = "http://";
        this.shareDataService.runningActivity.mediaArray.push(md);
        this.shareDataService.addMediaToActivity(md);
    }


    removeMedia(md:Media){
        this.shareDataService.removeMediaOfActivity(md);
    }


    updateActivity(updateForm:NgForm){
        this.updateResult = "";

        // updateForm.controls;
        for(let i=0; i<this.shareDataService.runningActivity.mediaArray.length; i++){
            let md = this.shareDataService.runningActivity.mediaArray[i];
            if (md.upload != null && md.uploadResult==null){
                let formData:FormData = new FormData();
                let fname =  this.shareDataService.formatFullDate(new Date()) + "_" + this.shareDataService.runningActivity.id 
                                                                    + md.upload.name.substring(md.upload.name.lastIndexOf("."));
                md.url = "http://watch.churchserve.org/uploads/" + fname;
                formData.append('uploaded_file', md.upload, fname);
                let headers = new Headers();
                headers.append('Content-Type', 'multipart/form-data');
                headers.append('Accept', 'application/json');
    
                this.http.post("uploader.php", formData)
                    .catch(error => {
                        // this.shareDataService.runningActivity.webpic = "";
                        md.uploadResult = md.type+":"+md.name+" ~ '上传异常-" + error + "'";
                        return md.uploadResult;
                    } )
                    .subscribe(
                        data => {
                            this.shareDataService.updateMediaArrayOnRunningActivity();
                        },
                        error => {
                            md.url = "上传错误";
                            md.uploadResult = md.type+":"+md.name+" ~ '上传错误-" + error + "'";
                        }
                    );
            }
        }

        this.shareDataService.updateMediaArrayOnRunningActivity();
        this.updateResult = "'更新成功'";
    }

    
}
