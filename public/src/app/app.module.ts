import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent, GameFormDialog, ViewGamesDialog } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule,
         MatButtonModule, 
         MatSnackBarModule,
         MatDialogModule,
         MatFormFieldModule,
         MatInputModule } from '@angular/material';
import { GameComponent } from './game/game.component';
import { MultiPlayerComponent, WaitingScreenDialog } from './multi-player/multi-player.component'
import { FormsModule } from '@angular/forms';
import { HttpService } from './http.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { Keys } from './resources/keys';

const config: SocketIoConfig = { url: 'http://localhost:6789', options: {}}

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MultiPlayerComponent,
    GameFormDialog,
    WaitingScreenDialog,
    ViewGamesDialog
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
  entryComponents: [GameFormDialog, AppComponent, WaitingScreenDialog, MultiPlayerComponent, ViewGamesDialog],
  providers: [Keys, GameFormDialog, WaitingScreenDialog, MultiPlayerComponent, AppComponent, HttpService, ViewGamesDialog],
  bootstrap: [AppComponent]
})
export class AppModule { }
