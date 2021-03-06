import { fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import Room from '@yomo/presencejs/dist/room';
import Cursor from './cursor';
import { getScale } from '../helper';
import {
    CursorMessage,
    MovementMessage,
    TextMessage,
    OfflineMessage,
} from '../types';

export default class Me extends Cursor {
    private room: Room | undefined;
    private onlineSubscription: Subscription | undefined;
    private mousemoveSubscription: Subscription | undefined;
    private mousePositionSubscription: Subscription | undefined;

    constructor({
        id,
        x,
        y,
        name = '',
        avatar = '',
    }: {
        id: string;
        x: number;
        y: number;
        name?: string;
        avatar?: string;
    }) {
        super(id, x, y, name, avatar);
        this.mousemoveSubscription = this.subscribeMousemove();
    }

    goOnline(room: Room) {
        this.room = room;
        this.online(room);
        this.onlineSubscription = this.subscribeOnline(room);
        if (this.mousePositionSubscription) {
            this.mousePositionSubscription.unsubscribe();
        }
        this.mousePositionSubscription = this.subscribeMousePosition(room);
    }

    async goOffline() {
        if (this.room) {
            this.room.publish<OfflineMessage>('offline', {
                id: this.id,
            });
        }

        if (this.mousemoveSubscription) {
            this.mousemoveSubscription.unsubscribe();
            this.mousemoveSubscription = undefined;
        }

        if (this.mousePositionSubscription) {
            this.mousePositionSubscription.unsubscribe();
            this.mousePositionSubscription = undefined;
        }

        if (this.onlineSubscription) {
            this.onlineSubscription.unsubscribe();
            this.onlineSubscription = undefined;
        }

        return await new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }

    sendMessage(message: string) {
        if (this.room) {
            this.room.publish<TextMessage>('text', {
                id: this.id,
                message: message,
            });
        }
    }

    private online(room: Room) {
        room.publish<CursorMessage>('online', {
            id: this.id,
            x: 0,
            y: 0,
            name: this.name,
            avatar: this.avatar,
        });
    }

    private subscribeOnline(room: Room) {
        return room.fromServer<any>('online').subscribe(() => {
            room.publish<CursorMessage>('sync', {
                id: this.id,
                x: this.x,
                y: this.y,
                name: this.name,
                avatar: this.avatar,
            });
        });
    }

    private subscribeMousemove() {
        const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');

        return mousemove$.subscribe(event => {
            const { clientX, clientY } = event;
            super.move(clientX, clientY);
            this.onMove({ mouseX: clientX, mouseY: clientY });
        });
    }

    private subscribeMousePosition(room: Room) {
        const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');

        const movement$ = mousemove$.pipe(
            map(event => {
                const { scaleX, scaleY } = getScale(
                    event.clientX,
                    event.clientY
                );
                return {
                    id: this.id,
                    x: scaleX,
                    y: scaleY,
                };
            })
        );

        return room.bindServer<MovementMessage>(movement$, 'movement');
    }
}