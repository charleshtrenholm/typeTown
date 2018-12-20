import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent, GameFormDialog } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule,
         MatButtonModule, 
         MatSnackBarModule,
         MatDialogModule,
         MatFormFieldModule,
         MatInputModule } from '@angular/material';
import { GameComponent } from './game/game.component';
import { MultiPlayerComponent } from './multi-player/multi-player.component'
import { FormsModule } from '@angular/forms';
import { HttpService } from './http.service'
import { HttpClientModule } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:6789', options: {}}

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MultiPlayerComponent,
    GameFormDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config)
  ],
  exports: [
    MatGridListModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  entryComponents: [GameFormDialog, AppComponent],
  providers: [GameFormDialog, AppComponent, HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
