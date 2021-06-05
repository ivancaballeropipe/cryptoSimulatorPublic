import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;
  readonly uri: string = "http://localhost:3000";

  constructor() {
    this.socket = io(this.uri);
  }

  
  listen(eventName: any) {
    return new Observable((subscriber) => {
        this.socket.on(eventName, (data: any) => {
            subscriber.next(data);
        });   
    });
  }

  close() {
    this.socket.close();   
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

}
