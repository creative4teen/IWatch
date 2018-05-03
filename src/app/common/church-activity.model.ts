import { Media } from "./media.model";

export interface ChurchActivity {
    id: string;
    parent_id: string;
    name: string;
    description: string;
    title: string;
    text: string;
    keywords: string;
    state: string;

    group: string;  //all, youth, brothers, sisters
    time: string;  //June 23, 2018 - Aug 12, 2018 | 9.0-16.0 | 0111110

    starting?: Date;
    
    medias?: Media[];

    mediaArray?: Media[];
    records?: string[];

}
