import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})


export class GameComponent implements OnInit {

  keys = {
    192: {value: '`', altValue: '~', style: false},
    49: {value: '1', altValue: '!', style: false},
    50: {value: '2', altValue: '@', style: false},
    51: {value: '3', altValue: '#', style: false},
    52: {value: '4', altValue: '$', style: false},
    53: {value: '5', altValue: '%', style: false},
    54: {value: '6', altValue: '^', style: false},
    55: {value: '7', altValue: '&', style: false},
    56: {value: '8', altValue: '*', style: false},
    57: {value: '9', altValue: '(', style: false},
    48: {value: '0', altValue: ')', style: false},
    189: {value: '-', altValue: '_', style: false},
    187: {value: '=', altValue: '+', style: false},
    8: {value: 'delete', altValue: 'delete', style: false},
    9: {value: 'tab', altValue: 'tab', style: false},
    81: {value: 'q', altValue: 'Q', style: false},
    87: {value: 'w', altValue: 'W', style: false},
    69: {value: 'e', altValue: 'E', style: false},
    82: {value: 'r', altValue: 'R', style: false},
    84: {value: 't', altValue: 'T', style: false},
    89: {value: 'y', altValue: 'Y', style: false},
    85: {value: 'u', altValue: 'U', style: false},
    73: {value: 'i', altValue: 'I', style: false},
    79: {value: 'o', altValue: 'O', style: false},
    80: {value: 'p', altValue: 'P', style: false},
    219: {value: '[', altValue: '{', style: false},
    221: {value: ']', altValue: '}', style: false},
    220: {value: '|', altValue: '|', style: false},
    20: {value: 'caps lock', altValue: 'capsLock', style: false},
    65: {value: 'a', altValue: 'A', style: false},
    83: {value: 's', altValue: 'S', style: false},
    68: {value: 'd', altValue: 'D', style: false},
    70: {value: 'f', altValue: 'F', style: false},
    71: {value: 'g', altValue: 'G', style: false},
    72: {value: 'h', altValue: 'H', style: false},
    74: {value: 'j', altValue: 'J', style: false},
    75: {value: 'k', altValue: 'K', style: false},
    76: {value: 'l', altValue: 'L', style: false},
    186: {value: ';', altValue: ':', style: false},
    222: {value: "'", altValue: '"', style: false},
    13: {value: 'return', altValue: 'return', style: false},
    16: {value: 'shift', altValue: 'shift', style: false},
    90: {value: 'z', altValue: 'Z', style: false},
    88: {value: 'x', altValue: 'X', style: false},
    67: {value: 'c', altValue: 'C', style: false},
    86: {value: 'v', altValue: 'V', style: false},
    66: {value: 'b', altValue: 'B', style: false},
    78: {value: 'n', altValue: 'N', style: false},
    77: {value: 'm', altValue: 'M', style: false},
    188: {value: ',', altValue: '<', style: false},
    190: {value: '.', altValue: '>', style: false},
    191: {value: '/', altValue: '?', style: false},
    32: {value:' ',  altValue: ' ', style: false}
  }

  typeText = "Did you ever hear the Tragedy of Darth Plagueis the wise? I thought not. It's not a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life... He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful... the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. It's ironic he could save others from death, but not himself."
  gameHasStarted: boolean;
  shiftIsOn: boolean;
  typeArray: any[];
  typeIndex: number;
  totalNumberTyped: number;
  numberIncorrect: number;

  constructor() { }

  //LISTEN FOR KEYDOWN EVENTS:::::

  @HostListener("window: keydown", ['$event'])
  keyDownEvent(event) {

    this.keys[event.keyCode].style = true;
    if (!this.gameHasStarted){
      this.gameHasStarted;
    }
    if(event.keyCode === 16){ //checks for shift
      this.shiftIsOn = true;
    } else {
    this.checkTyping(event, this.typeIndex);
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
    // this.typeArray = this.typeText.split('');
    this.shiftIsOn = false;
    this.gameHasStarted = false;
    this.typeArray = []
    this.typeIndex = 0;
    this.totalNumberTyped = 0;
    this.numberIncorrect = 0;
    for(var i = 0; i < this.typeText.length; i++){
      let character = {
        char: this.typeText.charAt(i),
        wasTyped: false,
        gotWrong: false,
        isCurrent: false,
      }
      this.typeArray.push(character);
    }
    console.log("TYPE ARRAY", this.typeArray);

  }

  checkTyping(e, n){
    console.log("HERES THE STUFF", e, this.typeArray[n])
    // this.typeArray[n].isCurrent = false;
    // this.typeArray[n + 1].isCurrent = true;
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
    console.log("EEEEEE", e.key)
    if (letter !== this.typeArray[n].char){
      console.log("YOU DID BAD MY GUY");
      this.typeArray[n].gotWrong = true;
      this.numberIncorrect++
    }
    this.typeArray[n].wasTyped = true;
    this.totalNumberTyped++;
    this.typeIndex++;
  }

  // setStyle(w){
  //   let styles = {
  //     'background-color' : this.typeArray[w].gotWrong ? 'rgb(230, 10, 94)' : 'rgb(26,25,25)',
  //     'color' : this.typeArray[w].wasTyped ? 'rgb(254, 238, 13)' : 'white',
  //   }
  // }

  spaceTest(){
    console.log("PooPoo")
  }

}