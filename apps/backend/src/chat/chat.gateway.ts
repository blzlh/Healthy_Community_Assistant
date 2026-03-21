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
import { DbService } from '../db/db.service';
import { chatHistory, profiles } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

type ChatUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
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

  constructor(
    private readonly authService: AuthService,
    private readonly dbService: DbService,
  ) {}

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

      // 获取用户 Profile
      const [profile] = await this.dbService.db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1);

      client.data.user = {
        id: user.id,
        email: user.email ?? null,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      };
      await client.join('room:global');
      client.emit('chat:ready', {
        roomId: 'global',
        user: client.data.user,
      });

      const history = await this.getRoomHistory('global');
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

    const history = await this.getRoomHistory(roomId);
    client.emit('chat:history', { roomId, messages: history });

    this.logger.log(`join room=${roomId} socket=${client.id} user=${user.id}`);
  }

  @SubscribeMessage('chat:message')
  async sendMessage(
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

    // 保存到数据库
    const [inserted] = await this.dbService.db
      .insert(chatHistory)
      .values({
        roomId,
        userId: user.id,
        name: user.name ?? null, // 存储姓名快照
        text,
      })
      .returning();

    const message: ChatMessage = {
      id: inserted.id,
      roomId,
      text,
      createdAt: inserted.createdAt.toISOString(),
      user,
    };

    this.server.to(`room:${roomId}`).emit('chat:message', message);
    this.logger.log(
      `message room=${roomId} user=${user.id} len=${text.length}`,
    );
  }

  private async getRoomHistory(roomId: string): Promise<ChatMessage[]> {
    const results = await this.dbService.db
      .select({
        id: chatHistory.id,
        roomId: chatHistory.roomId,
        text: chatHistory.text,
        createdAt: chatHistory.createdAt,
        user: {
          id: chatHistory.userId,
          email: profiles.email,
          name: chatHistory.name, // 优先使用消息存储时的姓名快照
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(chatHistory)
      .leftJoin(profiles, eq(chatHistory.userId, profiles.userId))
      .where(eq(chatHistory.roomId, roomId))
      .orderBy(desc(chatHistory.createdAt))
      .limit(50);

    return results
      .map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))
      .reverse(); // 返回正序的历史记录
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
