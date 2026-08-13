import { MediaClient } from './mediaClient';
import type { MediaClientConfig } from './mediaTypes';

export class RoomManager {
  private static instance: RoomManager | null = null;
  private currentClient: MediaClient | null = null;

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public async joinRoom(config: MediaClientConfig): Promise<MediaClient> {
    if (this.currentClient) {
      this.currentClient.disconnect();
    }

    const client = new MediaClient(config);
    await client.connect();
    this.currentClient = client;
    return client;
  }

  public leaveRoom(): void {
    if (this.currentClient) {
      this.currentClient.disconnect();
      this.currentClient = null;
    }
  }

  public getCurrentClient(): MediaClient | null {
    return this.currentClient;
  }
}

export const roomManager = RoomManager.getInstance();
