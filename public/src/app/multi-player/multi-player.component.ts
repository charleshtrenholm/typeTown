import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import * as io from 'socket.io-client';
import { Keys } from '../resources/keys';

@Component({
  selector: 'app-multi-player',
  templateUrl: './multi-player.component.html',
  styleUrls: ['./multi-player.component.css']
})
export class MultiPlayerComponent implements OnInit {


  keys: any;
  gameID: string;
  typeText = "Did you ever hear the Tragedy of Darth Plagueis the wise? I thought not. It's not a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life... He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful... the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. It's ironic he could save others from death, but not himself."
  gameHasStarted: boolean;
  shiftIsOn: boolean;
  typeArray: any[];
  typeIndex: number;
  numberIncorrect: number;
  textFieldContainer: number;
  secondsLeft: number;
  wpm: string;
  totalChars: number;
  totalWords: number;
  avgWordLength: number;
  appComponent: any;
  players: any;
  player: any;
  socket: any;
  leader: string;

  constructor(
    private _route: ActivatedRoute,
    public dialog: MatDialog,
    private _keys: Keys
  ) { }

  @HostListener("window: keydown", ['$event'])
  keyDownEvent(event) {
    this.keys[event.keyCode].style = true;

    if(event.keyCode === 32 && event.target == document.body){
      event.preventDefault(); //prevents space bar from automatically scrolling target window
    }

    if(event.keyCode === 16){ //checks for shift
      this.shiftIsOn = true;
    } else {
    this.checkTyping(event, this.typeIndex);
    this.checkScroll();
    }
  }

  @HostListener("window: keyup", ['$event'])
  keyUpEvent(event){
    this.keys[event.keyCode].style = false;
    if(event.keyCode === 16){
      this.shiftIsOn = false;
    }
  }

  ngOnInit() {
    this._route.params.subscribe((params: Params) => {
      this.gameID = params.id;
      this.player = params.playerId;
    })
    this.keys = this._keys.values;
    this.leader = '';
    this.socket = io();
    this.wpm = "0";
    this.totalChars = 0;
    this.totalWords = 0;
    this.secondsLeft = 60;
    this.shiftIsOn = false;
    this.gameHasStarted = false;
    this.typeArray = []
    this.typeIndex = 0;
    this.numberIncorrect = 0;
    this.textFieldContainer = 0;

    

    this.socket.emit('getPlayerId');
    this.socket.emit('listenForNewPlayers', this.gameID);

    this.socket.on('updateData', data => {
      console.log('TIME::', data.time);
      this.secondsLeft = data.time;
      this.leader = data.leader;
      this.updateWPM();
      this.socket.emit('playerUpdate', { playerId: this.player, id: this.gameID, wpm: this.wpm});
    })

    this.socket.on('otherPlayerIndex', data => {
      console.log("OTHER PLAYER INDEX DATA: ", data);
    })


    for(var i = 0; i < this.typeText.length; i++){
      this.totalChars++;
      let character = {
        char: this.typeText.charAt(i),
        wasTyped: false,
        gotWrong: false,
        isCurrent: false,
      }
      this.typeArray.push(character);
      if (this.typeText.charAt(i) == " "){
        this.totalWords++;
      }
    }
    this.avgWordLength = this.totalChars/this.totalWords
    this.showWaitingScreen()
  }

  checkTyping(e, n){
    var letter;
    if(this.shiftIsOn){
      letter = e.key.toUpperCase()
      this.typeArray[n].isCurrent = false;
      this.typeArray[n + 1].isCurrent = true;
    } else {
      letter = e.key
      this.typeArray[n].isCurrent = false
      this.typeArray[n + 1].isCurrent = true;
    }
    if (letter !== this.typeArray[n].char){
      this.typeArray[n].gotWrong = true;
      this.numberIncorrect++
    }
    this.typeArray[n].wasTyped = true;
    this.typeIndex++;
    this.socket.emit('playerTypeIndex', {playerId: this.player, id: this.gameID, index: this.typeIndex})
  }

  //TODO: work on scrolling logic;

  checkScroll(){
    if (this.typeIndex % 50 == 0 && this.typeIndex != 0){
      this.textFieldContainer += 30;
    }
  }

  endTheGame(){
    console.log("THE GAME IS OVER")
  }

  updateWPM(){
    let gross = ((this.typeIndex - this.numberIncorrect)/this.avgWordLength);
    let timeElapsed = 60 - this.secondsLeft;
    this.wpm = ((gross)/(timeElapsed/60)).toFixed(3);
  }

  showWaitingScreen(){
    const dialogRef = this.dialog.open(WaitingScreenDialog, {
      width: '500px',
      data: {
        id: this.gameID
      }
    })
    dialogRef.afterClosed().subscribe(() => {
      this.socket.emit('gameHasStarted', this.gameID)
    })
  }

}

//MARK waiting-screen-dialog component .....|||.....|||.....|||.....|||.....|||.....|||

@Component({
  selector: 'waiting-screen-dialog',
  templateUrl: 'waiting-screen-dialog.html'
})

export class WaitingScreenDialog implements OnInit {

  gameID: string;
  playerId: string;
  socket: any;
  players: any;
  countdown: number;
  
  constructor(
    public dialogRef: MatDialogRef<WaitingScreenDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.gameID = this.data.id;
    this.playerId = this.data.playerId
    this.socket = io();
    this.socket.emit('listenForNewPlayers', this.gameID)
    this.socket.on('playerJoined', data => {
      console.log('PLAYER JOINED DATA', data)
      this.players = data.players;
    })
    this.socket.on('playerClickedCountdown', () => {
      this.beginGame()
    })
  }

  beginWasClicked(){
    this.socket.emit('beginWasClicked', this.gameID)
  }

  beginGame(){
    this.countdown = 5
    let interval = setInterval(() => {
      if(this.countdown == 1){
        this.dialogRef.close()
        clearInterval(interval);
      } else {
        this.countdown--;
      }
    }, 1000)
  }

}

//MARK winner-screen-dialog component .....|||.....|||.....|||.....|||.....|||.....|||
