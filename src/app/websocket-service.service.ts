import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket!: WebSocket;

  private messageCallback: any;

  connect(roomId: string) {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/game/${roomId}/`);

    this.socket.onopen = () => {

      console.log("Connected to WebSocket");
      if (this.messageCallback) {
        this.messageCallback({ type: 'connected' });
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (this.messageCallback) {
        this.messageCallback(data);
      }
    };
  }

  onMessage(callback: any) {
    this.messageCallback = callback;
  }

  sendMove(move: any) {
    this.socket.send(JSON.stringify(move));
  }
}