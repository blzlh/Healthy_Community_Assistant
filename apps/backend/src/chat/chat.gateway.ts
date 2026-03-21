import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { DefaultEventsMap, Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

type ChatUser = {
  id: string;
  email?: string | null;
};

type SocketData = { user?: ChatUser };
type AuthedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

type JoinRoomPayload = {
  roomId?: string;
};

type ChatMessagePayload = {
  roomId?: string;
  text?: string;
};

type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  createdAt: string;
  user: ChatUser;
};

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
  },
  path: '/socket.io',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly history = new Map<string, ChatMessage[]>();

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: AuthedSocket) {
    const token = this.extractBearerToken(client);
    if (!token) {
      client.emit('chat:error', { message: 'Missing bearer token' });
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.authService.getUser(token);
      if (!user?.id) {
        client.emit('chat:error', { message: 'Invalid user' });
        client.disconnect(true);
        return;
      }

      client.data.user = { id: user.id, email: user.email ?? null };
      await client.join('room:global');
      client.emit('chat:ready', {
        roomId: 'global',
        user: client.data.user,
      });

      const history = this.history.get('global') ?? [];
      client.emit('chat:history', { roomId: 'global', messages: history });

      this.logger.log(`connected socket=${client.id} user=${user.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unauthorized';
      this.logger.warn(`unauthorized socket=${client.id} message=${message}`);
      client.emit('chat:error', { message });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    this.logger.log(
      `disconnected socket=${client.id} user=${client.data.user?.id ?? 'unknown'}`,
    );
  }

  @SubscribeMessage('chat:join')
  async joinRoom(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const user = client.data.user;
    if (!user?.id) {
      client.emit('chat:error', { message: 'Unauthorized' });
      client.disconnect(true);
      return;
    }

    const roomId = (payload.roomId ?? 'global').trim() || 'global';
    const roomKey = `room:${roomId}`;
    await client.join(roomKey);
    client.emit('chat:joined', { roomId });

    const history = this.history.get(roomId) ?? [];
    client.emit('chat:history', { roomId, messages: history });

    this.logger.log(`join room=${roomId} socket=${client.id} user=${user.id}`);
  }

  @SubscribeMessage('chat:message')
  sendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: ChatMessagePayload,
  ) {
    const user = client.data.user;
    if (!user?.id) {
      client.emit('chat:error', { message: 'Unauthorized' });
      client.disconnect(true);
      return;
    }

    const roomId = (payload.roomId ?? 'global').trim() || 'global';
    const text = (payload.text ?? '').trim();
    if (!text) {
      return;
    }

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      roomId,
      text,
      createdAt: new Date().toISOString(),
      user,
    };

    const list = this.history.get(roomId) ?? [];
    const next = [...list, message].slice(-50);
    this.history.set(roomId, next);

    this.server.to(`room:${roomId}`).emit('chat:message', message);
    this.logger.log(
      `message room=${roomId} user=${user.id} len=${text.length}`,
    );
  }

  private extractBearerToken(client: Socket) {
    const authToken = (client.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (authToken) {
      const normalized = authToken.trim();
      return normalized.startsWith('Bearer ')
        ? normalized.slice(7)
        : normalized;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7).trim();
    }

    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') {
      const normalized = queryToken.trim();
      return normalized.startsWith('Bearer ')
        ? normalized.slice(7)
        : normalized;
    }

    return '';
  }
}
