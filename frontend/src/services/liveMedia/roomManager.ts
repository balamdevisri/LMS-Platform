import { MediaClient } from './mediaClient';
import { LiveKitMediaClient } from './livekitMediaClient';
import type { MediaClientConfig, IMediaClient } from './mediaTypes';

/**
 * Resolves active media engine from environment variables.
 * Default is ALWAYS 'p2p'. Opt-in to 'sfu' requires explicit VITE_MEDIA_ENGINE=sfu.
 */
export const getActiveMediaEngine = (): 'p2p' | 'sfu' => {
  const envEngine = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_ENGINE) ||
    ''
  )
    .toLowerCase()
    .trim();

  if (envEngine === 'sfu') {
    return 'sfu';
  }
  return 'p2p';
};

export class RoomManager {
  private static instance: RoomManager | null = null;
  private currentClient: IMediaClient | null = null;

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public async joinRoom(config: MediaClientConfig): Promise<IMediaClient> {
    if (this.currentClient) {
      this.currentClient.disconnect();
    }

    const engine = getActiveMediaEngine();
    console.log(`[MEDIA_ENGINE] Initializing media engine: ${engine.toUpperCase()}`);

    let client: IMediaClient;
    if (engine === 'sfu') {
      client = new LiveKitMediaClient(config);
    } else {
      client = new MediaClient(config);
    }

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

  public getCurrentClient(): IMediaClient | null {
    return this.currentClient;
  }
}

export const roomManager = RoomManager.getInstance();
