import { io, Socket } from 'socket.io-client';
import { Toast } from '@components/toast';
import { useRootStore } from '@store/index';
import mitt from 'mitt'; // Import mitt
// Khởi tạo mitt emitter
export const emitter = mitt();

interface SocketOptions {
  server: string;
  key: string;
  userId: string;
}

const createInstance = ({ server, key, userId }: SocketOptions): Socket => {
  return io(server, {
    auth: {
      key,
      userId
    },
    transports: ['websocket', 'polling']
  });
};

const SocketIoClient = {
  instance: null as Socket | null,
  server: '',

  subscribe(server: string, key: string, userId: string): Socket {
    if (!this.server) {
      this.server = server;
    }

    if (!this.instance) {
      this.instance = createInstance({ server, key, userId });
    }

    return this.instance;
  },

  getInstance(): Socket | null {
    return this.instance;
  }
};

interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

const RealtimeSrv = {
  client: null as Socket | null,

  init(server: string, key: string, userId: string): void {
    this.client = SocketIoClient.subscribe(server, key, userId);
    this.client.on('server_event', (data: RealtimeEvent) => {
      switch (data?.action_type) {
        case 'new_notification': {
          emitter.emit('NEW_NOTIFICATION', data?.action_data);
          !window.location.hash.includes('#/practice/') && Toast('default', data?.action_data?.title, 'top-right');
          useRootStore.getState().addNotificationCount();
          break;
        }
        case 'stop_exam': {
          emitter.emit('STOP_EXAM', data?.action_data);
          break;
        }

        default:
          break;
      }
    });
  }
};

export default RealtimeSrv;
