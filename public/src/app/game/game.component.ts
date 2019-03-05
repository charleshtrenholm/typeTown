import { Component, OnInit, HostListener, Inject } from '@angular/core';
// import { MAT_SNACK_BAR_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material'
import { Keys } from '../resources/keys'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})


export class GameComponent implements OnInit {


  keys: object;
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
  appComponent: object;

  constructor(
    public snack: MatSnackBar,
    private _keys: Keys
  ) { }

  //LISTEN FOR KEYDOWN EVENTS

  @HostListener("window: keydown", ['$event'])
  keyDownEvent(event) {

    this.keys[event.keyCode].style = true;
    if (!this.gameHasStarted){
      this.gameHasStarted = true;
      this.countDownTimer();
    }
    if(event.keyCode === 32 && event.target == document.body){
      event.preventDefault();
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
    this.keys = this._keys.values
    this.wpm = "0";
    this.totalChars = 0;
    this.totalWords = 0;
    this.secondsLeft = 60;
    this.shiftIsOn = false;
    this.gameHasStarted = false;
    this.typeArray = []
    this.typeIndex = 0;
    this.numberIncorrect = 0;
    this.textFieldContainer = 0
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
  }

  checkScroll(){
    if (this.typeIndex % 50 == 0 && this.typeIndex != 0){
      this.textFieldContainer += 30;
    }
  }

  countDownTimer(){
    var interval = setInterval(()=> {
      this.updateWPM();
      if (this.secondsLeft == 0){
        clearInterval(interval);
        this.endTheGame();
      } else {
      this.secondsLeft--;
      }
    }, 1000)
  }

  endTheGame(){
    console.log("THE GAME IS OVER")
    let snackBarRef = this.snack.open("Game Over! Your final score is " + this.wpm, "dismiss", {
      duration: 10000
    })
    snackBarRef.afterDismissed().subscribe(() => {
      this.ngOnInit();
    })
  }

  updateWPM(){
    let gross = ((this.typeIndex - this.numberIncorrect)/this.avgWordLength);
    let timeElapsed = 60 - this.secondsLeft;
    this.wpm = ((gross)/(timeElapsed/60)).toFixed(3);
  }

}
