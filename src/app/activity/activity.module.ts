import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ActivityComponent } from './activity.component';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { ActivityRoutingModule } from './activity-routing.module';

@NgModule({
  declarations: [
    ActivityComponent
  ],
  imports: [
    SharedModule,
    ActivityRoutingModule
  ]
})
export class ActivityModule {}
