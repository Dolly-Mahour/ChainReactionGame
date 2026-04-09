import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoxInfo } from './box-info';
import * as bootstrap from 'bootstrap';
import { WebsocketService } from './websocket-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgFor, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {

  playerId: number = Math.floor(Math.random() * 1000000);
  myTurn: boolean = false;

  constructor(private ws: WebsocketService) {
  }
  title = 'ChainReactionGame';
  roomId: string = '';
  lockedColor: string = "";
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  @ViewChild('connectedToast') connectedToast!: ElementRef;
  ngAfterViewInit() {
    
    this.ws.onMessage((data: any) => {
      if (data.type === "connected") {
        console.log("Toast triggered");
      const toast = new bootstrap.Toast(this.connectedToast.nativeElement);
      toast.show();
      return;
    }
      if (data.type === "player_assign") {
        this.playerId = data.player;
        this.myTurn = data.turn === this.playerId;
        return;
      }

      if (data.type === "start") {
        this.gameStarted = true;
        this.myTurn = data.turn === this.playerId;
        return;
      }

      if (data.type === "player_update") {
        this.playersCount = data.players_count;
        return;
      }
      if (data.type === "game_winner") {
        this.showWinModal();
      }
      if (data.type === "move") {

        if (data.player === this.playerId) return;

        this.lockedColor = this.colors[this.clickCounts % this.countOfcolorsInGame];
        this.boxClicked(data.row, data.col, true);
        this.clickCounts++;

        this.myTurn = data.turn === this.playerId;
      }

    });
  }

  playerName: string = '';
  joinCode: string = '';
  gameStarted: boolean = false;
  isHost: boolean = false;
  clickCounts = 0;
  colors: string[] = ["red", "lime"];
  rows: number = 18;
  playersCount: number = 0;
  columns: number = 8;
  whoOutedThePlayer: string = "";

  gridOfGame: BoxInfo[][] = Array.from({ length: this.rows }, (_, rowIndex) =>
    Array.from({ length: this.columns }, (_, columnIndex) => ({
      rowIndex,
      columnIndex,
      isBoxClickedOnce: false,
      colorInBox: "",
      numberOfBalls: 0
    }))
  );

  listOfBoxesAdded: BoxInfo[] = [];
  countOfcolorsInGame: number = 2;
  i: number = 0;
  currentTurnColor: string = "Red ";
  currentNumberOfBalls: number[] = [];

  async boxClicked(rowIndex: number, colIndex: number, isExploading: boolean = false) {

    if (!isExploading && !this.myTurn) {
      this.showModal();
      return;
    }
    if (!isExploading) {
      this.currentTurnColor = this.colors[this.clickCounts % this.countOfcolorsInGame];
      this.lockedColor = this.currentTurnColor;
      this.i = this.clickCounts % this.countOfcolorsInGame;
    } else {
      this.currentTurnColor = this.lockedColor;

    }

    if (this.gridOfGame[rowIndex][colIndex].isBoxClickedOnce) {

      if ((this.gridOfGame[rowIndex][colIndex].colorInBox != this.colors[this.i]) && !isExploading && this.gridOfGame[rowIndex][colIndex].colorInBox != "") {
        this.showModal();
        return;
      }

      this.gridOfGame[rowIndex][colIndex].colorInBox = this.currentTurnColor;

      if ((rowIndex == 0 && colIndex == 0) || (rowIndex == 0 && colIndex == 7) || (rowIndex == 17 && colIndex == 0)
        || (rowIndex == 17 && colIndex == 7)) {

        this.findIfPlayerIsPlaying();

        this.gridOfGame[rowIndex][colIndex].isBoxClickedOnce = false;
        // this.gridOfGame[rowIndex][colIndex].colorInBox = "";

        await this.cornerExplodeLogic(rowIndex, colIndex);
      }

      else if (rowIndex == 0 || rowIndex == 17 || colIndex == 0 || colIndex == 7) {
        this.findIfPlayerIsPlaying();
        if (this.gridOfGame[rowIndex][colIndex].numberOfBalls == 2) {

          this.gridOfGame[rowIndex][colIndex].isBoxClickedOnce = false;
          // this.gridOfGame[rowIndex][colIndex].colorInBox = "";

          await this.borderExplodeLogic(rowIndex, colIndex);
        }
        else {
          this.gridOfGame[rowIndex][colIndex].numberOfBalls++;
          this.popSound();
        }
      }

      else {
        this.findIfPlayerIsPlaying();
        if (this.gridOfGame[rowIndex][colIndex].numberOfBalls == 3) {

          this.gridOfGame[rowIndex][colIndex].isBoxClickedOnce = false;
          // this.gridOfGame[rowIndex][colIndex].colorInBox = "";
          await this.centerExplodeLogic(rowIndex, colIndex);
        }
        else {
          this.gridOfGame[rowIndex][colIndex].numberOfBalls++;
          this.popSound();
        }
      }
    }

    else {
      this.gridOfGame[rowIndex][colIndex].isBoxClickedOnce = true;
      this.gridOfGame[rowIndex][colIndex].colorInBox = this.currentTurnColor;
      this.gridOfGame[rowIndex][colIndex].numberOfBalls++;
      this.popSound();
    }

    if (!isExploading) {

      if (this.clickCounts > 1) {
        this.findIfPlayerIsPlaying();
        this.i = this.clickCounts % this.countOfcolorsInGame;
      }

      this.ws.sendMove({
        row: rowIndex,
        col: colIndex,
        player: this.playerId
      });

      this.myTurn = false;
      this.clickCounts++;

    }

    this.listOfBoxesAdded.push(this.gridOfGame[rowIndex][colIndex]);
    this.closeTurnModal();
  }

  async cornerExplodeLogic(rowIndex: number, colIndex: number) {

    if (rowIndex == 0 && colIndex == 0) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex, colIndex + 1, true);

      await this.delay(120);
      await this.boxClicked(rowIndex + 1, colIndex, true);
    }

    else if (rowIndex == 0 && colIndex == 7) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex + 1, colIndex, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex - 1, true);
    }

    else if (rowIndex == 17 && colIndex == 0) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex - 1, colIndex, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex + 1, true);
    }

    else if (rowIndex == 17 && colIndex == 7) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex, colIndex - 1, true);

      await this.delay(120);
      await this.boxClicked(rowIndex - 1, colIndex, true);
    }
  }

  async borderExplodeLogic(rowIndex: number, colIndex: number) {

    if (colIndex == 0) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex + 1, colIndex, true);

      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex - 1, colIndex, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex + 1, true);
    }

    else if (colIndex == 7) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex + 1, colIndex, true);

      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex - 1, colIndex, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex - 1, true);
    }

    else if (rowIndex == 0) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex + 1, colIndex, true);

      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
      await this.boxClicked(rowIndex, colIndex - 1, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex + 1, true);
    }

    else if (rowIndex == 17) {
      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;

      await this.boxClicked(rowIndex - 1, colIndex, true);

      await this.delay(120);
      this.gridOfGame[rowIndex][colIndex].numberOfBalls--;

      await this.boxClicked(rowIndex, colIndex - 1, true);

      await this.delay(120);
      await this.boxClicked(rowIndex, colIndex + 1, true);
    }
  }

  async centerExplodeLogic(rowIndex: number, colIndex: number) {

    await this.delay(120);
    this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
    await this.boxClicked(rowIndex + 1, colIndex, true);

    await this.delay(120);
    this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
    await this.boxClicked(rowIndex - 1, colIndex, true);

    await this.delay(120);
    this.gridOfGame[rowIndex][colIndex].numberOfBalls--;
    await this.boxClicked(rowIndex, colIndex + 1, true);

    await this.delay(120);
    await this.boxClicked(rowIndex, colIndex - 1, true);
  }

  showModal() {
    new bootstrap.Modal(document.getElementById('gameModal')!).show();
  }

  closeTurnModal() {
    new bootstrap.Modal(document.getElementById('gameModal')!).hide();
  }

  showWinModal() {
    new bootstrap.Modal(document.getElementById('winnerModal')!).show();
  }

  ballCounts(count: number): number[] {
    return Array.from({ length: count });
  }


  findIfPlayerIsPlaying() {
    this.whoOutedThePlayer = "";
    let colorsInGame: string[] = [];
    let isInGame: boolean = false;
    for (let color of this.colors) {
      let isExists = this.gridOfGame.some(row =>
        row.some(box => box.colorInBox == color)
      );

      if (isExists) {
        this.whoOutedThePlayer = color;
        colorsInGame.push(color);
      }
    }

    this.colors = colorsInGame;
    this.countOfcolorsInGame = this.colors.length;
    this.stopPopSound();
    if (this.colors.length == 1) {
      this.showWinModal();
    }
  }



  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  createRoom() {
    this.roomId = this.generateRoomCode();
    this.isHost = true;
    this.ws.connect(this.roomId);

  }
  @ViewChild('codeErrorToast') toastRef!: ElementRef;
  joinRoom() {
    if (!this.joinCode) {
      const toast = new bootstrap.Toast(this.toastRef.nativeElement);
      toast.show();
      return;
    }

    this.roomId = this.joinCode;
    this.isHost = false;

    this.ws.connect(this.roomId);
  }
  RefreshPage() {
    window.location.reload();
  }
  @ViewChild('clipboardToast') clipboardToast!: ElementRef;
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = new bootstrap.Toast(this.clipboardToast.nativeElement);
      toast.show();
    });
  }
  popSound() {
    const audio = new Audio('ball-pop.mp4');
    // audio.playbackRate = 4;
    audio.play();
  }
  stopPopSound() {
    const audio = new Audio('ball-pop.mp4');
    audio.pause();
  }
}