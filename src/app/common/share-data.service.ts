// Angular
// https://www.npmjs.com/package/firebase-nodejs

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Subscription, Observable } from 'rxjs';

import { CookieService, CookieOptionsArgs } from 'angular2-cookie/core';
// import { CookieService } from 'ngx-cookie-service';

import { User } from './user.model';
import { Church } from './church.model';
import { Item } from './item.model';
import { Media } from "./media.model";
import { Group } from './group.model';
import { ChurchActivity } from './church-activity.model';
import { forEach } from '@firebase/util';


@Injectable()
export class ShareDataService {

    email: string;
    password: string;
    mobile: string;
    language: string;
    type: string;
    userLogin: User;

    private fbSubs: Subscription[] = [];

    homeChurch: Church;
    churchArray: Church[];
    // churchObservable: Observable<Church[]>;

    currentTemplate: ChurchActivity;
    templateArray: ChurchActivity[];
    
    runningActivity: ChurchActivity;
    activityChanged = new Subject<ChurchActivity>();


    constructor(private db: AngularFirestore,
                private _http: Http,
                private _cookieService:CookieService) {
        this.touchJSON();
        this.loadFromCookies();
    }


    cancelSubscriptions(){
       //  this.fbSubs.forEach(sub => sub.unsubscribe());
    }
    

    getCookie(key: string){
        return this._cookieService.get(key);
    }


    touchJSON(){
        // const collection$: Observable<Item> = collection.valueChanges()
        // collection$.subscribe(data => console.log(data) )

        // console.log( JSON.stringify(this.templateArray) );
        // console.log( JSON.stringify(this.churchArray) );
        
        var ch = this._http.get('assets/churches.json').map((response: Response) => response.json());
        ch.subscribe( res => { 
                                this.churchArray = res; 
                                for(let i=0; i<this.churchArray.length; i++){
                                    this.db.collection("churchArray").add( JSON.parse(JSON.stringify(this.churchArray[i])) );
                                }
                                this.refreshDBChurch();
                            } );
        var ch = this._http.get('assets/templates.json').map((response: Response) => response.json());
        ch.subscribe( res => { 
                                this.templateArray = res; 
                                for(let i=0; i<this.templateArray.length; i++){
                                    this.db.collection('templatesArray').add( JSON.parse(JSON.stringify(this.templateArray[i])) );
                                }
                                this.refreshDBActivity('templatesArray');
                            } );
    }


    private refreshDBActivity(activitiesPath : string){
        this.db.collection(activitiesPath)
            .snapshotChanges()
            .map(docArray => {
                return docArray.map(doc => {
                        return {
                            id: doc.payload.doc.id,
                            parent_id:  doc.payload.doc.data().parent_id?doc.payload.doc.data().parent_id:null,
                            group: doc.payload.doc.data().group,
                            time: doc.payload.doc.data().time,
                            name: doc.payload.doc.data().name?doc.payload.doc.data().name:"",
                            title: doc.payload.doc.data().title?doc.payload.doc.data().title:"",
                            text: doc.payload.doc.data().text?doc.payload.doc.data().text:"",
                            description: doc.payload.doc.data().description?doc.payload.doc.data().description:"",
                            medias: doc.payload.doc.data().medias?doc.payload.doc.data().medias:"",
                            state: doc.payload.doc.data().state?doc.payload.doc.data().state:"running",
                            keywords: doc.payload.doc.data().keywords?doc.payload.doc.data().keywords:"",
                            starting: doc.payload.doc.data().starting?doc.payload.doc.data().starting:new Date()
                        };
                    });
                })
                .subscribe((acts: ChurchActivity[]) => {
                                for (let a=0; a < acts.length; a++) {
                                    for(let k=0; k < acts[a].medias.length; k++){
                                        this.db.collection(activitiesPath).doc(acts[a].id)
                                                    .collection('mediaArray').add(acts[a].medias[k]);
                                        this.cleanDBMedia(activitiesPath, acts[a]);
                                    }
                                }
                            },  error => {} );
    }


    private cleanDBMedia(activitiesPath:string, act:ChurchActivity){
        // this.db.collection(activitiesPath).doc(act.id).update({medias:null});
    }


    private cleanDBChurch(church:Church){
        // this.db.collection("activityArray").doc(church.id).update({activities:null, groups:null, items:null});
    }


    private refreshDBChurch(){
        this.db
        .collection("churchArray")
        .snapshotChanges()
        .map(docArray => {
            return docArray.map(doc => {
                return {
                    id: doc.payload.doc.id,
                    uid: doc.payload.doc.data().uid,
                    paypal: doc.payload.doc.data().paypal,
                    name: doc.payload.doc.data().name,
                    activities: doc.payload.doc.data().activities?doc.payload.doc.data().activities:null,
                    groups:  doc.payload.doc.data().groups?doc.payload.doc.data().groups:null,
                    items:  doc.payload.doc.data().groups?doc.payload.doc.data().items:null,
                    web: doc.payload.doc.data().web,
                    wechat:doc.payload.doc.data().wechat?doc.payload.doc.data().wechat:null,
                    whatsapp:doc.payload.doc.data().whatsapp?doc.payload.doc.data().whatsapp:null,
                    facebook:doc.payload.doc.data().facebook?doc.payload.doc.data().facebook:null,
                    type: doc.payload.doc.data().type,
                    address: doc.payload.doc.data().address,
                    description: doc.payload.doc.data().description,
                    admin:  doc.payload.doc.data().admin
                };
            });
        })
        .subscribe((churches: Church[]) => {
                this.churchArray = churches;
                for(let c=0; c<this.churchArray.length; c++){
                    let church = this.churchArray[c];
                    //
                    for(let a=0; a<church.activities.length; a++){
                        let act:ChurchActivity = church.activities[a];
                        this.db.collection("churchArray").doc( church.id ).collection("activityArray").add(act);
                    }
                    this.refreshDBActivity("churchArray/" + church.id + "/activityArray");

                    for(let g=0; g<church.groups.length; g++){
                        let grp:Group = church.groups[g];
                        this.db.collection("churchArray").doc( church.id ).collection("groupArray").add(grp);
                    }
                    for(let i=0; i<church.items.length; i++){
                        let itm:Item = church.items[i];
                        this.db.collection("churchArray").doc( church.id ).collection("itemArray").add(itm);
                    }

                    this.cleanDBChurch(church);
                }
                //
                let cs = this.churchArray.filter( c => c.uid== this._cookieService.get('homeChurch'));
                if (cs.length > 0){
                    this.homeChurch = cs[0];
                }
                else {
                    this.homeChurch = this.churchArray[0];
                }
            }, error => { } );
    }



    loadFromCookies(){
        if (this.homeChurch == null){
            this.fetchTemplateArray();
            this.fetchChurchArray();
            this.language = "en";

            this.type = this._cookieService.get('type');
            this.email = this._cookieService.get('email');
            this.password = this._cookieService.get('password');
            this.mobile = this._cookieService.get('mobile');
            this.language = this._cookieService.get('language');
            let js = "{\"id\":\"0\",\"uid\":\"-100\",\"name\":\"Ontario Church\",\"web\":\"\",\"address\":\"Ontario, Canada\",\"description\":\"\",\"admin\":\"admin@on.ca\"}";
            this.homeChurch = JSON.parse(js);
        }
    }



    saveToCookies(){
        var expdate = new Date();
        expdate.setDate(expdate.getDate() + 30);
        let opts: CookieOptionsArgs = {
            expires: expdate
        };

        if (this.homeChurch != null){
            // var clone = Object.assign({}, this.homeChurch);
            this._cookieService.put('homeChurch', this.homeChurch.id, opts);
        }
        if (this.type){
            this._cookieService.put('type', this.type, opts);
        }
        if (this.email){
            this._cookieService.put('email', this.email, opts);
        }
        if (this.password){
            this._cookieService.put('password', this.password, opts);
        }
        if (this.mobile){
            this._cookieService.put('mobile', this.mobile, opts);
        }
        
        if (this.language=='zh'){
            this._cookieService.put('language', this.language, opts);
        }
        else {
            this.language = 'en';
            this._cookieService.put('language', this.language, opts);
        }
    }



    fetchChurchArray() {
        this.fbSubs.push(
            this.db.collection("churchArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                        return {
                            id: doc.payload.doc.id,
                            uid: doc.payload.doc.data().uid,
                            paypal: doc.payload.doc.data().paypal,
                            name: doc.payload.doc.data().name,
                            web: doc.payload.doc.data().web,
                            wechat:doc.payload.doc.data().wechat?doc.payload.doc.data().wechat:null,
                            whatsapp:doc.payload.doc.data().whatsapp?doc.payload.doc.data().whatsapp:null,
                            facebook:doc.payload.doc.data().facebook?doc.payload.doc.data().facebook:null,
                            type: doc.payload.doc.data().type,
                            address: doc.payload.doc.data().address,
                            description: doc.payload.doc.data().description,
                            admin:  doc.payload.doc.data().admin
                        };
                    });
                })
                .subscribe((churches: Church[]) => {
                        this.churchArray = churches;
                        //     //
                        let cs = this.churchArray.filter( c => c.uid== this._cookieService.get('homeChurch'));
                        if (cs.length > 0){
                            this.homeChurch = cs[0];
                        }
                        else {
                            this.homeChurch = this.churchArray[0];
                        }
                    }, error => { } ) 
        );
    }


    public fetchHomeChurch(){
        //     for (let i = 0; i < church.groups.length; i++) {
        //         Object.assign(church.groups[i], {id: i+''})
        //     }
        //     for (let i = 0; i < church.activities.length; i++) {
        //         Object.assign(church.activities[i], {id: i+''})
        //         for(let k=0; k < church.activities[i].medias.length; k++){
        //             Object.assign(church.activities[i].medias[k], {id: k+''});
        //         }
        //     }
        this.fetchActivityArray(this.homeChurch);
        this.fetchGroupArray(this.homeChurch);
        this.fetchItemArray(this.homeChurch);
    }

    public fetchTemplateArray(){
        this.fbSubs.push(
            this.db.collection("templateArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                            return {
                                id: doc.payload.doc.id,
                                parent_id:  doc.payload.doc.data().parent_id?doc.payload.doc.data().parent_id:null,
                                group: doc.payload.doc.data().group,
                                time: doc.payload.doc.data().time,
                                name: doc.payload.doc.data().name?doc.payload.doc.data().name:"",
                                title: doc.payload.doc.data().title?doc.payload.doc.data().title:"",
                                text: doc.payload.doc.data().text?doc.payload.doc.data().text:"",
                                description: doc.payload.doc.data().description?doc.payload.doc.data().description:"",
                                state: doc.payload.doc.data().state?doc.payload.doc.data().state:"running",
                                keywords: doc.payload.doc.data().keywords?doc.payload.doc.data().keywords:"",
                                starting: doc.payload.doc.data().starting?doc.payload.doc.data().starting:new Date()
                            };
                        });
                    })
                    .subscribe((acts: ChurchActivity[]) => {
                                    this.templateArray = acts;
                                    for (let a=0; a < acts.length; a++) {
                                        this.fetchMediaArray("templateArray/"+acts[a].id, acts[a]);
                                    }
                                },  error => {} )
        );
    }


    private fetchActivityArray(church:Church){
        this.fbSubs.push(
            this.db.collection("churchArray").doc(church.id).collection("activityArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                            return {
                                id: doc.payload.doc.id,
                                parent_id:  doc.payload.doc.data().parent_id?doc.payload.doc.data().parent_id:null,
                                group: doc.payload.doc.data().group,
                                time: doc.payload.doc.data().time,
                                name: doc.payload.doc.data().name?doc.payload.doc.data().name:"",
                                title: doc.payload.doc.data().title?doc.payload.doc.data().title:"",
                                text: doc.payload.doc.data().text?doc.payload.doc.data().text:"",
                                description: doc.payload.doc.data().description?doc.payload.doc.data().description:"",
                                state: doc.payload.doc.data().state?doc.payload.doc.data().state:"running",
                                keywords: doc.payload.doc.data().keywords?doc.payload.doc.data().keywords:"",
                                starting: doc.payload.doc.data().starting?doc.payload.doc.data().starting:new Date()
                            };
                        });
                    })
                    .subscribe((acts: ChurchActivity[]) => {
                                    church.activityArray = acts;
                                    for (let a=0; a < acts.length; a++) {
                                        this.fetchMediaArray("churchArray/"+church.id+"/activityArray/"+acts[a].id, acts[a]);
                                    }
                                },  error => {} )
        );
    }


    private fetchItemArray(church: Church) {
        this.fbSubs.push(
            this.db.collection("churchArray").doc(church.id).collection("itemArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                        return {
                            id: doc.payload.doc.id,
                            name: doc.payload.doc.data().name,
                            description: doc.payload.doc.data().description,
                            icon: doc.payload.doc.data().icon,
                            web: doc.payload.doc.data().web,
                            type: doc.payload.doc.data().type,
                            userid: doc.payload.doc.data().userid,
                            history: doc.payload.doc.data().history
                        };
                    });
                })
                .subscribe((items: Item[]) => {
                    church.itemArray = items;
                }, error => {}  )
        );
    }
  

    
    private fetchGroupArray(church: Church) {
        this.fbSubs.push(
            this.db.collection("churchArray").doc(church.id).collection("groupArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                        return {
                            id: doc.payload.doc.id,
                            name: doc.payload.doc.data().name,
                            description: doc.payload.doc.data().description,
                            web: doc.payload.doc.data().web,
                            wechat:doc.payload.doc.data().wechat?doc.payload.doc.data().wechat:null,
                            whatsapp:doc.payload.doc.data().whatsapp?doc.payload.doc.data().whatsapp:null,
                            facebook:doc.payload.doc.data().facebook?doc.payload.doc.data().facebook:null
                        };
                    });
                })
                .subscribe((groups: Group[]) => {
                    church.groupArray = groups;
                }, error => {}  )
        );
    }



    private fetchMediaArray(activityPath:string, act:ChurchActivity){
        this.fbSubs.push(
            this.db.doc(activityPath).collection("mediaArray")
                .snapshotChanges()
                .map(docArray => {
                    return docArray.map(doc => {
                            return {
                                id: doc.payload.doc.id,
                                name: doc.payload.doc.data().name?doc.payload.doc.data().name:"",
                                type: doc.payload.doc.data().type?doc.payload.doc.data().type:"",
                                url: doc.payload.doc.data().url?doc.payload.doc.data().url:""
                            };
                        });
                    })
                    .subscribe((medias: Media[]) => {
                                    act.mediaArray = medias;
                                },  error => {} )
        );
    }



    filterChurchObservable(): Observable<Church[]> {
        if (this.churchArray == null || this.churchArray.length===0){
            return null;
        }
        return Observable.of( this.churchArray.filter(ch=>ch.type==this.type) );
    }

    

    filterActivityObservable(group: string, state: string): Observable<ChurchActivity[]> {
        if (this.homeChurch.activityArray == null || this.homeChurch.activityArray.length===0){
            return null;
        }
        var groupSecs = group.split("|");
        if (this.homeChurch==null || this.homeChurch.uid=="-100"){
            return Observable.of( [] );
        }
        else {
            return Observable.of( 
                            this.homeChurch.activityArray.filter(act =>
                                    {  
                                        if (act.state != state){
                                            return false;
                                        }
                                        var actGroupSecs = act.group.split("|");
                                        for (let ag = 0; ag < actGroupSecs.length; ag++) {
                                            for (let g = 0; g < groupSecs.length; g++) {
                                                if (groupSecs[g].trim() === actGroupSecs[ag].trim()){
                                                    return true;
                                                }
                                            }
                                        }
                                        return false;
                                    }
                                ) 
                            );
        }
    }

    

    filterTemplateObservable(group: string): Observable<ChurchActivity[]> {
        if (this.templateArray == null || this.templateArray.length===0){
            return null;
        }
        var groupSecs = group.split("|");
        return Observable.of( this.templateArray.filter(act =>
                                    {  
                                        var actGroupSecs = act.group.split("|");
                                        for (let ag = 0; ag < actGroupSecs.length; ag++) {
                                            for (let g = 0; g < groupSecs.length; g++) {
                                                if (groupSecs[g].trim() === actGroupSecs[ag].trim()){
                                                    return true;
                                                }
                                            }
                                        }
                                        return false;
                                    }
                            ) 
                        );
    }



    fetchMediasOnType(t:string){
        let mds = this.runningActivity.mediaArray.filter( me => {
                                                        let mes = me.type.toLowerCase().trim();
                                                        let ts = t.split('|'); 
                                                        for(let i=0; i<ts.length; i++){
                                                            if (mes==ts[i].toLowerCase().trim()){
                                                                return true;
                                                            }
                                                        }
                                                        return false;
                                                    } ); 
        return mds;
    }


    
    fetchAMediaOnType(t:string){
        let mds = this.fetchMediasOnType(t); 
        if (!mds || mds.length ==0){
            return null;
        }
        else {
            return mds[0];
        }
    }



    startNewActivity(selectedId: string) {
        var temp = this.templateArray.find( ex => ex.id === selectedId );
        if (temp == null){
            return null;
        }
        this.runningActivity = Object.assign({}, temp);

        if (!this.runningActivity.records){
            this.runningActivity.records = [];
        }
        let day = new Date();
        this.runningActivity.starting = day;
        this.runningActivity.state = "running";
        this.runningActivity.parent_id = temp.id;
        this.runningActivity.title = this.formatDayMonth(day) + " " + this.runningActivity.name;
        this.runningActivity.text = "请输入活动描述\n  活动资料链接-1\n  活动资料链接-2...";
        this.homeChurch.activityArray.push( JSON.parse(JSON.stringify(this.runningActivity)) );
        this.db.collection("churchArray").doc(this.homeChurch.id).update( JSON.parse(JSON.stringify(this.homeChurch))  );
        
        this.activityChanged.next( this.runningActivity );
        //
        return this.runningActivity; 
    }



    formatFullDate(date: Date) {
        const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        let day = '' + date.getDate();
        if (day.length < 2) {
            day = '0' + day;
        }
        let monthIndex = date.getMonth();
        let year = date.getFullYear();
        return year + "_" + monthNames[monthIndex] + "_" + day;
    }



    formatDayMonth(date: Date) {
        const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        let day = '' + date.getDate();
        if (day.length < 2) {
            day = '0' + day;
        }
        let monthIndex = date.getMonth();
        return monthNames[monthIndex] + "_" + day;
    }


    formatShortTime(date: Date) {
        let day = '' + date.getDate();
        if (day.length < 2) {
            day = '0' + day;
        }
        let month = '' + (date.getMonth()+1);
        if (day.length < 2) {
            day = '0' + day;
        }
        let hour = '' + date.getHours();
        let min = '' + date.getMinutes();
        return day + "/" + month + " " + hour + ":" + min;
    }
    

    selectActivity(selectedId: string) {
        var act = this.homeChurch.activityArray.find( ex => ex.id === selectedId );
        if (act == null){
            return null;
        }
        this.runningActivity = act;
        //
        if (!this.runningActivity.records){
            this.runningActivity.records = [];
        }
        this.updateRecordArrayOnRunningActivity();

        this.activityChanged.next(this.runningActivity);
        return this.runningActivity;
    }
    


    joinActivity(selectedId: string) {
        var act = this.homeChurch.activityArray.find( ex => ex.id === selectedId );
        if (act == null){
            return null;
        }
        this.runningActivity = act;
        //
        if (!this.runningActivity.records){
            this.runningActivity.records = [];
        }
        this.runningActivity.records.unshift("join ::" + this.formatShortTime(new Date()) + "::"+ this.email) ;
        this.updateRecordArrayOnRunningActivity();

        this.activityChanged.next(this.runningActivity);
        return this.runningActivity;
    }



    completeActivity() {
        if (!this.runningActivity.records){
            this.runningActivity.records = [];
        }
        this.runningActivity.state = "done";
        this.runningActivity.records.unshift("done ::" + this.formatShortTime(new Date()) + "::"+ this.email) ;
        this.updateRecordArrayOnRunningActivity();
        this.activityChanged.next(null);
    }
  


    leftActivity(progress: number) {
        if (!this.runningActivity.records){
            this.runningActivity.records = [];
        }
        this.runningActivity.records.unshift("left ::" + this.formatShortTime(new Date()) + "::"+ this.email) ;
        this.updateRecordArrayOnRunningActivity();
        this.activityChanged.next(null);
    }
  

    addMediaToActivity(media:Media){
        this.db.collection("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id+"/mediaArray")
                    .add( JSON.parse(JSON.stringify(media)) );
    }



    removeMediaOfActivity(media:Media){
        this.db.doc("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id+"/mediaArray/"+media.id)
                    .delete();
    }



    updateMediaArrayOnRunningActivity(){
        for(let m=0; m<this.runningActivity.mediaArray.length; m++){
            this.db.doc("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id+"/mediaArray/"+this.runningActivity.mediaArray[m].id)
                    .update( JSON.parse(JSON.stringify(this.runningActivity.mediaArray[m])) );
        }
    }


    
    updateRecordArrayOnRunningActivity(){
        // for(let m=0; m<this.runningActivity.mediaArray.length; m++){
        //     this.db.doc("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id+"/mediaArray/"+this.runningActivity.mediaArray[m].id)
        //             .update( JSON.parse(JSON.stringify(this.runningActivity.mediaArray[m])) );
        // }
        this.db.doc("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id)
                .update({records:this.runningActivity.records});
    }
    
    
    getRunningActivity() {
        return this.runningActivity;
    }
      

    updateRunningActivityRecords(rec : string){
        if (this.runningActivity && rec){
            this.runningActivity.records.unshift(rec + " ::" + this.formatShortTime(new Date()) + "::"+ this.email) ;
            this.db.doc("churchArray/"+this.homeChurch.id+"/activityArray/"+this.runningActivity.id).update({records:this.runningActivity.records});
        }
    }
    
      
}
