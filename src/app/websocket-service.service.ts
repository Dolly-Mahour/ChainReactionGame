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
    this.socket = new WebSocket(`wss://chain-reaction-backend-f39z.onrender.com/ws/game/${roomId}/`);
    // this.socket.onopen = () => {
    //   console.log("Connected ✅");
    // };

    this.socket.onerror = (err) => {
      console.log("Error ❌", err);
    };

    this.socket.onclose = () => {
      console.log("Closed ⚠️");
    };
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