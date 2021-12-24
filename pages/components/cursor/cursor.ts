import { stringToColor } from '../helper/main';
import { MousePosition } from '../types';

export default class Cursor {
    public id: string;
    public x: number;
    public y: number;
    public name: string;
    public avatar: string;
    public color: string;

    constructor(
        id: string,
        x: number,
        y: number,
        name: string,
        avatar: string
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = name;
        this.avatar = avatar;
        this.color = stringToColor(id);
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    onMove(_mousePosition: MousePosition) {}
}