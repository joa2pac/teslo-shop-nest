import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  handleConnection(client: Socket) {

      const token = client.handshake.headers.authentication as string;
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify( token );
      } catch(error) {
        client.disconnect();
        return;
      }
      console.log({ payload })
 
      this.messagesWsService.registerCliente( client );

      this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient( client.id );

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {

    console.log(client.id, payload)


  }

}
