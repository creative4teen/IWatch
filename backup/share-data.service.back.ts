// Angular
// https://www.npmjs.com/package/firebase-nodejs

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// import { AngularFirestore } from 'angularfire2/firestore';
//  FirebaseListObservable and FirebaseObjectObservable   -->   AngularFireList and AngularFireObject
import { AngularFireDatabase, AngularFireList, AngularFireDatabaseModule } from 'angularfire2/database';

import { Subject } from 'rxjs/Subject';
import { Subscription, Observable } from 'rxjs';

import { CookieService } from 'angular2-cookie/core';

import { Church } from './church.model';
import { Item } from './item.model';
import { Group } from './group.model';
import { ActivityInfo } from './activity-info.model';


@Injectable()
export class ShareDataService {

    email: string;
    password: string;
    mobile: string;
    language: string;
    group: string;

    private fbSubs: Subscription[] = [];

    homeChurch: Church;
    // churchArray: Church[];
    churchObservable: Observable<any[]>;
    // private CHURCHJSON: string;

    runningActivity: ActivityInfo;
    activityChanged = new Subject<ActivityInfo>();
    // activityInfoArray: ActivityInfo[];
    activityInfoObservable: Observable<any[]>;
    // private ACTIVITYJSON: string;
    // private activitiesSubs: Subscription[] = [];

    // groupArray: Group[];
    groupObservable: Observable<any[]>;
    // private GROUPJSON: string;
    // private groupSubs: Subscription[] = [];
    
    // itemArray: Item[];
    itemObservable: Observable<any[]>;
    // private ITEMJSON: string;
    // private itemSubs: Subscription[] = [];
    

    constructor(private db: AngularFireDatabase,
                // private _http: Http,
                private _cookieService:CookieService) {
        this.fetchChurches();
        this.fetchActivityInfoes();
        this.fetchGroups();
        this.fetchItems();
        this.language = "en";
        this.group = "out";
        //
        this.loadFromCookies();
    }


    cancelSubscriptions(){
       //  this.fbSubs.forEach(sub => sub.unsubscribe());
    }
    

    getCookie(key: string){
        return this._cookieService.get(key);
    }


    touchJSON(){
        // this.CHURCHJSON = JSON.stringify(this.churchArray);
        // this.ACTIVITYJSON = JSON.stringify(this.activityInfoArray);
        // this.GROUPJSON = JSON.stringify(this.groupArray);
        // this.ITEMJSON =  JSON.stringify(this.itemArray);
        // console.log(this.CHURCHJSON);
        // console.log(this.ACTIVITYJSON);
        // console.log(this.GROUPJSON);
        // console.log(this.ITEMJSON);
        
        // var ch = this._http.get('assets/churches.json').map((response: Response) => response.json());
        // ch.subscribe( res => { this.churchArray = res; this.addChurchesToDatabase(); } );
        // var act = this._http.get('assets/activities.json').map((response: Response) => response.json());
        // act.subscribe( res => { this.activityInfoArray = res; this.addActivitiesToDatabase(); } );
        // var it = this._http.get('assets/items.json').map((response: Response) => response.json());
        // it.subscribe( res => { this.itemArray = res; this.addItemsToDatabase(); } );
        // var gr = this._http.get('assets/groups.json').map((response: Response) => response.json());
        // gr.subscribe( res => { this.groupArray = res; this.addGroupsToDatabase(); } );
    }


    // private addChurchesToDatabase() {
    //     for(var i=0; i<this.churchArray.length; i++){
    //         this.db.collection('churches').add(this.churchArray[i]);
    //     }
    // }
      
    // private addActivitiesToDatabase() {
    //     for(var i=0; i<this.activityInfoArray.length; i++){
    //         this.db.collection('activities').add(this.activityInfoArray[i]);
    //     }
    // }

    // private addItemsToDatabase() {
    //     for(var i=0; i<this.itemArray.length; i++){
    //         this.db.collection('items').add(this.itemArray[i]);
    //     }
    // }

    // private addGroupsToDatabase() {
    //     for(var i=0; i<this.groupArray.length; i++){
    //         this.db.collection('groups').add(this.groupArray[i]);
    //     }
    // }

    loadFromCookies(){
        this.email = this._cookieService.get('email');
        this.password = this._cookieService.get('password');
        this.mobile = this._cookieService.get('mobile');
        this.language = this._cookieService.get('language');
        var js = this._cookieService.get('homeChurch')
        if (js){
            this.homeChurch = JSON.parse(js);
        }
        else {
            js = "{\"id\":\"0\",\"uid\":\"-100\",\"name\":\"Ontario Church\",\"name_zh\":\"安省教会\",\"web\":\"\",\"address\":\"Ontario, Canada\",\"description\":\"\",\"description_zh\":\"\"}";
            this.homeChurch = JSON.parse(js);
        }
    }


    saveToCookies(){
        if (this.homeChurch != null){
            this._cookieService.put('homeChurch', JSON.stringify(this.homeChurch));
        }
        if (this.email){
            this._cookieService.put('email', this.email);
        }
        if (this.password){
            this._cookieService.put('password', this.password);
        }
        if (this.mobile){
            this._cookieService.put('mobile', this.mobile);
        }
        
        if (this.language=='zh'){
            this._cookieService.put('language', this.language);
        }
        else {
            this.language = 'en';
            this._cookieService.put('language', this.language);
        }
    }

    
    filterChurchObservable(): Observable<Church[]> { //FirebaseListObservable<Church[]>
        return this.churchObservable;
    }


    fetchChurches() {
        this.churchObservable = this.db.list('/churches').valueChanges();
        this.fetchItems();
        this.fetchGroups();
    }

    

    filterActivityInfoObservable(): Observable<ActivityInfo[]> {
        if (this.homeChurch==null || this.homeChurch.uid=="-100"){
            return this.activityInfoObservable.filter(c=>c.group==this.group);
        }
        else {
            this.activityInfoObservable.filter( c=>{ return c.church_uid==this.homeChurch.uid && c.group==this.group;} );
        }
    }
    

    fetchItems() {
        this.itemObservable = this.db.list('/items');
        this.churchObservable.forEach( ch => ch.items = this.itemObservable.filter( it => it.church_uid==ch.uid ) );
    }
  
    
    fetchGroups() {
        this.groupObservable = this.db.list('/items');
        this.churchObservable.forEach( ch =>  ch.groups = this.groupObservable.filter( gr => gr.church_uid==ch.uid ));
    }
    
    
    fetchActivityInfoes() {
        this.activityInfoObservable = this.db.list('/activities');
    }



    startActivity(selectedId: string) {
        this.runningActivity = this.activityInfoObservable.find( ex => ex.id === selectedId );
        this.runningActivity.records.push(this.email+":: join ..."+new Date());
        this.db.object('activities/' + selectedId).update({records : this.runningActivity.records});
        this.activityChanged.next( this.runningActivity );
    }
  

    completeActivity() {
        this.runningActivity.records.push(this.email+":: done ...");
        this.db.object('activities/' + this.runningActivity.id).update({records : this.runningActivity.records});
        this.activityChanged.next(null);
    }
  

    cancelActivity(progress: number) {
        this.runningActivity.records.push(this.email+":: left ...");
        this.db.object('activities/' + this.runningActivity.id).update({records : this.runningActivity.records});
        this.activityChanged.next(null);
    }
  
    
    getRunningActivity() {
        return this.runningActivity;
    }
      
      
}
