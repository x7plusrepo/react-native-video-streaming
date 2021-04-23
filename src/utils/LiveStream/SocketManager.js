import io from 'socket.io-client';
import { Logger } from '../Global';
import { Constants } from '../Global';

const EVENT_JOIN_ROOM = 'join-room';
const EVENT_LEAVE_ROOM = 'leave-room';
const EVENT_LIST_LIVE_STREAM = 'list-live-stream';
const EVENT_BEGIN_LIVE_STREAM = 'begin-live-stream';
const EVENT_FINISH_LIVE_STREAM = 'finish-live-stream';
const EVENT_SEND_HEART = 'send-heart';
const EVENT_SEND_MESSAGE = 'send-message';
const EVENT_PREPARE_LIVE_STREAM = 'prepare-live-stream';
const EVENT_SEND_REPLAY = 'replay';

class SocketManager {
  socket = null;

  constructor() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }
    SocketManager.instance = this;
    this.socket = io(Constants.STREAM_SOCKET_URL, { reconnectionAttempts: 3 });
    this.setupListenDefaultEvents();
    return this;
  }

  setupListenDefaultEvents() {
    this.socket.on('connect', () => {
      Logger.instance.log('connect');
    });
    this.socket.on('disconnect', () => {
      Logger.instance.log('disconnect');
    });
    this.socket.on('connect_error', (error) => {
      console.log('--- crn_dev --- socket_connect_error:', error);
    });

    this.socket.on('connect_timeout', (timeout) => {
      console.log('--- crn_dev --- socket_connect_timeout:', timeout);
    });

    this.socket.on('error', (error) => {
      console.log('--- crn_dev --- socket_error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('--- crn_dev --- socket_disconnect_reason:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnect_attemptNumber:',
        attemptNumber,
      );
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnect_attempt_attemptNumber:',
        attemptNumber,
      );
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnecting_attemptNumber:',
        attemptNumber,
      );
    });

    this.socket.on('reconnect_error', (error) => {
      console.log('--- crn_dev --- socket_reconnect_error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('--- crn_dev --- socket_reconnect_failed');
    });
  }

  //
  // ──────────────────────────────────────────────────────────────── I ──────────
  //   :::::: L I S T E N   E V E N T : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────
  //

  listenPrepareLiveStream(callback = () => null) {
    this.socket.on(EVENT_PREPARE_LIVE_STREAM, () => {
      Logger.instance.log(`${EVENT_PREPARE_LIVE_STREAM} :`);
      return callback();
    });
  }

  listenBeginLiveStream(callback = () => null) {
    this.socket.on(EVENT_BEGIN_LIVE_STREAM, (data) => {
      Logger.instance.log(`${EVENT_BEGIN_LIVE_STREAM} :`, data);
      return callback(data);
    });
  }

  listenFinishLiveStream(callback = () => null) {
    this.socket.on(EVENT_FINISH_LIVE_STREAM, (data) => {
      Logger.instance.log(`${EVENT_FINISH_LIVE_STREAM} :`, data);
      return callback(data);
    });
  }

  listenListLiveStream(callback = () => null) {
    this.socket.on(EVENT_LIST_LIVE_STREAM, (data) => {
      Logger.instance.log(`${EVENT_LIST_LIVE_STREAM} :`, data);
      return callback(data);
    });
  }

  listenSendHeart(callback = () => null) {
    this.socket.on(EVENT_SEND_HEART, () => {
      Logger.instance.log(`${EVENT_SEND_HEART} :`);
      return callback();
    });
  }

  listenSendMessage(callback = () => null) {
    this.socket.on(EVENT_SEND_MESSAGE, (data) => {
      Logger.instance.log(`${EVENT_SEND_MESSAGE} :`);
      return callback(data);
    });
  }

  listenReplay(callback = () => null) {
    this.socket.on(EVENT_SEND_REPLAY, (data) => {
      Logger.instance.log(`${EVENT_SEND_REPLAY} :`);
      return callback(data);
    });
  }

  //
  // ──────────────────────────────────────────────────────────── I ──────────
  //   :::::: E M I T   E V E N T : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────
  //

  emitPrepareLiveStream({ streamerId, roomName }) {
    this.socket.emit(EVENT_PREPARE_LIVE_STREAM, { streamerId, roomName });
  }

  emitJoinRoom({ streamerId, userId }) {
    this.socket.emit(EVENT_JOIN_ROOM, { streamerId, userId });
  }

  emitLeaveRoom({ streamerId, userId }) {
    this.socket.emit(EVENT_LEAVE_ROOM, { streamerId, userId });
  }

  emitBeginLiveStream({ streamerId, roomName }) {
    this.socket.emit(EVENT_BEGIN_LIVE_STREAM, { streamerId, roomName });
  }

  emitFinishLiveStream({ streamerId }) {
    this.socket.emit(EVENT_FINISH_LIVE_STREAM, { streamerId });
  }

  emitListLiveStream() {
    this.socket.emit(EVENT_LIST_LIVE_STREAM);
  }

  emitSendHeart({ streamerId, userId }) {
    this.socket.emit(EVENT_SEND_HEART, { streamerId, userId });
  }

  emitSendMessage({ streamerId, userId, message }) {
    this.socket.emit(EVENT_SEND_MESSAGE, { streamerId, userId, message });
  }

  emitReplay({ streamerId, userId }) {
    this.socket.emit(EVENT_SEND_REPLAY, { streamerId, userId });
  }
}

const instance = new SocketManager();
Object.freeze(instance);

export default SocketManager;
