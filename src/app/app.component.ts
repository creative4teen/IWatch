import { Component, OnInit } from '@angular/core';

import { ShareDataService } from './common/share-data.service';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private sharedDataService: ShareDataService, private authService: AuthService) {
    }

    ngOnInit() {
        this.authService.initAuthListener();
    }
    
}
