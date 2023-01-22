// @ts-ignore
import { baseURL } from "./app.ts";
// @ts-ignore
import { carModel } from "./images.ts";

export interface ICar {
  _color: string
  _name: string
  id: number
  xPos: number
  isBroken: boolean
  carDiv: HTMLDivElement
  velocity: number
  distance: number
  driveTimeout: number | undefined
  _wins: number
  updateCar: (e: Event) => void;
}

export class Car implements ICar {
  _color: string
  _name: string
  id: number
  xPos: number
  isBroken: boolean
  carDiv: HTMLDivElement
  velocity: number
  distance: number
  driveTimeout: number | undefined
  _wins: number
  updateCar: (e: Event) => void;
  
  constructor(color: string, name: string, id: number, wins?: number) {
    this._color = color;
    this._name = name;
    this.id = id;
    this.xPos = 0;
    this.carDiv = document.createElement('div');
    this.carDiv.classList.add('.moving-track');
    this.isBroken = false;
    this.carDiv.innerHTML = carModel(this._color);
    this.carDiv.setAttribute('style', 'width: max-content; position: relative;')
    this.velocity = 0;
    this.distance = 0;
    this.driveTimeout = undefined;
    this._wins = wins || 0;
    this.updateCar = (e) => {
      const detail = (<CustomEvent>e).detail;
      this._color = detail.color;
      this._name = detail.name;

      this.carElementDiv.closest('.car-wrapper')!.querySelector('.car-name')!.textContent = this.name;
      this.carElementDiv.innerHTML = carModel(this.color);
    }

    this.carElementDiv.addEventListener('update-car', this.updateCar);
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

  get wins() {
    return this._wins;
  }

  set wins(n) {
    this._wins = n;
  }
  
  start(): void {
    fetch(`${baseURL}/engine?id=${this.id}&status=started`, {
      method: 'PATCH'
    }).then(res => res.json()).then(obj => {
      this.velocity = obj.velocity;
      this.distance = obj.distance;
      this.drive();
    });
  }

  drive(): void {
    const oneStep: number = (this.velocity * 2000) / this.distance;
    fetch(`${baseURL}/engine?id=${this.id}&status=drive`, {
      method: 'PATCH'
    }).then(res => {
      if (res.status == 500) {
        this.isBroken = true;
      }
    });

    performance.mark(`${this.id}-start`);

    const timeoutCallback = () => {
      if (this.isBroken) {
        clearTimeout(this.driveTimeout);
        performance.mark(`${this.id}-stop`);
        return;
      }
      if (this.xPos > 90) {
        clearTimeout(this.driveTimeout);

        performance.mark(`${this.id}-stop`);
        const ms: number = performance.measure(`race-${this.id}`, `${this.id}-start`, `${this.id}-stop`).duration;
        document.dispatchEvent(new CustomEvent('car-finished', {
          detail: {
            car: this,
            time: ms
          }
        }))
        return;
      }
      this.xPos = this.xPos + oneStep;
      this.carElementDiv.style.left = `${this.xPos}%`;
      this.driveTimeout = setTimeout(timeoutCallback, (1000 / 25));
    }
    
    this.driveTimeout = setTimeout(timeoutCallback, (1000 / 25));

    this.carElementDiv.closest('.car-wrapper')?.dispatchEvent(new CustomEvent('car-started'));
  }

  stop(): void {
    fetch(`${baseURL}/engine?id=${this.id}&status=stopped`, {
      method: 'PATCH'
    }).then(res => res.json).then(() => {
      if (this.driveTimeout) {
        clearTimeout(this.driveTimeout);
      }
      if (this.isBroken) {
        this.isBroken = false;
      }
      this.xPos = 0;
      this.carElementDiv.style.left = this.xPos + 'px';
      this.carElementDiv.closest('.car-wrapper')?.dispatchEvent(new CustomEvent('car-stopped'));
    });
  }

  destroy(): void {
    this.carElementDiv.removeEventListener('update-car', this.updateCar);
  }
}