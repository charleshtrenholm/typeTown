import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { TypeGame } from './type-game'
import { Observable, of } from 'rxjs'
// import 'rxjs/add/observable/of'

@Injectable({
  providedIn: 'root'
})
export class TypeGameService {

  currentTypeGame = this.socket.fromEvent<TypeGame>('type-game')
  typeGames = this.socket.fromEvent<string[]>('type-games')

  constructor(private socket: Socket) { }

  getTypeGame(id: string){
    this.socket.emit('getGame', id);
  }

  newTypeGame(data): Observable<any> {
   return of(this.socket.emit('addGame', {id: this.docId(), data: data }));
  }

  private docId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345567890'
    
    for(let i = 0; i < 5; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }


}
