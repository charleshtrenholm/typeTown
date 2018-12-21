import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';
import { MultiPlayerComponent } from './multi-player/multi-player.component'; 


const routes: Routes = [
  {path: "game", component: GameComponent},
  {path: 'game/:id/:playerId', component: MultiPlayerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
