// @ts-ignore
import { carModel } from "./images.ts";

export class Car {
  _color: string
  _name: string
  id: number
  xPos: number
  isFinished: boolean
  isBroken: boolean
  carDiv: HTMLDivElement
  
  constructor(color: string, name: string, id: number) {
    this._color = color;
    this._name = name;
    this.id = id;
    this.xPos = 0;
    this.isFinished = false;
    this.isBroken = false;
    this.carDiv = document.createElement('div');
    this.carDiv.innerHTML = carModel(this._color);
  }

  get color() {
    return this._color;
  }
  set color(color) {
    this._color = color;
  }

  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }

  get carElementDiv() {
    return this.carDiv;
  }
}