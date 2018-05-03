import { ShareDataService } from '../common/share-data.service';

import { ChurchActivity } from './church-activity.model';
import { Group } from './group.model';
import { Item } from './item.model';


export class Church {
    id: string;
    uid: string;
    name: string;
    web: string;
    type: string;
    address: string;
    description: string;
    paypal: string;
    admin: string;
	wechat: string;
    whatsapp: string;
    facebook: string;

    activities: ChurchActivity[];
    groups: Group[];
    items: Item[];

    activityArray: ChurchActivity[];
    groupArray: Group[];
    itemArray: Item[];
    
    constructor(private sharedDataService: ShareDataService) {}    

    get prefername(): string {
        if (this.name==null){
            return "111";
        }
        var res = this.name.split("##");
        if (res.length <= 1){
            return this.name;
        }
        if (this.sharedDataService.language==='zh'){
            return res[1];
        }   
        else {
            return res[0];
        }
    }

    set prefername(newName: string) {
    }

    
    get preferdescription(): string {
        if (this.description==null){
            return "";
        } 
        var res = this.description.split("##");
        if (res.length == 1){
            return this.description;
        }
        if (this.sharedDataService.language==='zh'){
            return res[1];
        }   
        else {
            return res[0];
        }
    }

    set preferdescription(newName: string) {
    }

    
}