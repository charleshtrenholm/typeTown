import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatFormFieldModule, MatInputModule } from '@angular/material';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { HttpService } from './http.service';
import * as io from 'socket.io-client';



export interface DialogData {
  hostname: string;
  gametitle: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 't y p e t o w n';

  constructor(
    public dialog: MatDialog,
    private _router: Router
  ) { }

  ngOnInit(){
    console.log("Type land");
  }

  showCreateGame(){
    const dialogRef = this.dialog.open(GameFormDialog, {
      width: '500px'
    })
  }

  showJoinGroups(){
    const dialogRef = this.dialog.open(ViewGamesDialog, {
      width: '500px'
    })
  }

  showReadRules(){
    this._router.navigate(['/'])
  }

}

@Component({
  selector: 'game-form-dialog',
  templateUrl: 'game-form-dialog.html',
})

//GAME FORM MODAL

export class GameFormDialog implements OnInit { 

  hostname: string;
  gametitle: string;

  constructor(
    public dialogRef: MatDialogRef<GameFormDialog>,
    private _router: Router,
    private _http: HttpService,
    private _form: MatFormFieldModule,
    private _input: MatInputModule,
  ) {}

  socket: any;

  ngOnInit(){
  this.socket = io();
  }

  cancel(){
    this.dialogRef.close();
  }

  docId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345567890'
    
    for(let i = 0; i < 5; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }


  submitData(){
    let gameData = {
      id: this.docId(),
      hostname: this.hostname,
      gametitle: this.gametitle
    }
    this.socket.emit('addGame', gameData)
    this.socket.on('addedGame', data => {
      console.log('this is the data ', data )
      this._router.navigate([`game/${data.id}/${data.playerId}`])
      this.dialogRef.close()
    })
  }

}

//VIEW GAMES MODAL

@Component({
  selector: 'view-games-dialog',
  templateUrl: 'view-games-dialog.html'
})

export class ViewGamesDialog implements OnInit {

  socket: any;
  games: any;
  username: string;

  constructor(
    public dialogRef: MatDialogRef<ViewGamesDialog>,
    private _router: Router
  ) { }

  ngOnInit(){
    this.socket = io();
    this.socket.emit('lookForGames')
    this.socket.on('gameAdded', data => {
      console.log("we have a game: ", data)
      this.games = data.data;
    })
  }

  joinGame(id) { 
    this.socket.emit('newPlayer', {username: this.username, id: id});
    this.socket.on('joinOK', data => {  
      console.log('JOIN OK; JOIN USERNAME: ', data);
      this.dialogRef.close()
      this._router.navigate([`game/${data.id}/${data.playerId}`])
     })
  }


}
