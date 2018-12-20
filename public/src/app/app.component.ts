import { Component, OnInit, Inject } from '@angular/core';
// import { GameComponent } from './game/game.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatFormFieldModule, MatInputModule } from '@angular/material';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { TypeGameService } from './type-game.service';
import { Observable, Subscription } from 'rxjs'
import { Socket } from 'ngx-socket-io';



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

  constructor(public dialog: MatDialog) { }

  ngOnInit(){
    console.log("Type land");
  }

  showCreateGame(){
    const dialogRef = this.dialog.open(GameFormDialog, {
      width: '500px'
    })
  }

}

@Component({
  selector: 'game-form-dialog',
  templateUrl: 'game-form-dialog.html',
})

//GAME FORM MODAL

export class GameFormDialog { 

  redirectId = this.socket.fromEvent<any>('addedGame')
  hostname: string;
  gametitle: string;
  private _gameSub: Subscription;
  gameData: Observable<any>

  constructor(
    public dialogRef: MatDialogRef<GameFormDialog>,
    private _router: Router,
    private _http: HttpService,
    private _typeGameService: TypeGameService,
    private _form: MatFormFieldModule,
    private _input: MatInputModule,
    private socket: Socket
  ) {}

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
    let observable = this._http.postNewGame(gameData)
    observable.subscribe(data => {
      console.log("THIS IS THE DATA WE GOT BAaaaaCK", data)
      this._router.navigate(['/game/' + data['id']])
    })
  }

  // submitData(){
  //   let gameData = {
  //     hostname: this.hostname,
  //     gametitle: this.gametitle
  //   }
  //   let observable = this._typeGameService.newTypeGame(gameData);
  //   observable.subscribe(data => {
  //     console.log("this is the addedGame", this.redirectId);
  //   })
  // }

}

//VIEW GAMES MODAL

@Component({
  selector: 'view-games-dialog',
  template: 'view-games-dialog.html'
})

export class ViewGamesDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewGamesDialog>,
    private typeGameService: TypeGameService
  ) { }
}
