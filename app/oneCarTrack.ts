// @ts-ignore
import { garage, winners } from "./app.ts";
// @ts-ignore
import { Car } from "./carConstructor.ts";
// @ts-ignore
import { flag } from "./images.ts"

export interface ITrack {
  placeToAddCar: HTMLDivElement | null
  wrapper: HTMLDivElement;
  carNameElement: HTMLSpanElement | null
  car: Car | null
  trackElement: HTMLDivElement
  onStart: () => void
  onStop: () => void
  onCarStarted: () => void
  onCarStopped: () => void
  selectCar: (e?: Event) => void
  removeCar: (e: Event) => void
  appendCar: (carObj: { color: string; name: string; id: number; wins?: number | undefined; }) => void
}

export class Track implements ITrack {
  placeToAddCar: HTMLDivElement | null
  wrapper: HTMLDivElement;
  carNameElement: HTMLSpanElement | null
  car: Car | null
  onStart: () => void
  onStop: () => void
  onCarStarted: () => void
  onCarStopped: () => void
  selectCar: (e?: Event) => void
  removeCar: (e: Event) => void

  constructor() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('car-wrapper');
    wrapper.innerHTML = this.markup;
    this.wrapper = wrapper;
    this.placeToAddCar = this.wrapper.querySelector('.car-road');
    this.carNameElement = this.wrapper.querySelector('.car-name');
    this.car = null;
    this.onStart = () => {
      this.car.start();
    }
    this.onStop = () => {
      this.car.stop();
    }
    this.onCarStarted = () => {
      (<HTMLButtonElement>this.wrapper.querySelector('.run'))!.disabled = true;
      (<HTMLButtonElement>this.wrapper.querySelector('.stop'))!.disabled = false;
    }
    this.onCarStopped = () => {
      (<HTMLButtonElement>this.wrapper.querySelector('.run'))!.disabled = false;
      (<HTMLButtonElement>this.wrapper.querySelector('.stop'))!.disabled = true;
    }
    this.selectCar = () => {
      if (this.car !== null) {
        const updateCarBtn = (<HTMLButtonElement>document.querySelector('#update-car-button'));
        const inputCarName = (<HTMLInputElement>document.querySelector('#carName-update'));
        const inputCarColor = (<HTMLInputElement>document.querySelector('#carColor-update'));

        updateCarBtn!.disabled = false;
        inputCarName!.disabled = false;
        inputCarColor!.disabled = false;

        updateCarBtn!.setAttribute('data-id', this.car.id);
        inputCarName!.value = this.car.name;
        inputCarColor!.value = this.car.color;
      }
    }
    this.removeCar = (e) => {
      fetch(`${garage}/${this.car.id}`, {
        method: 'DELETE'
      }).then(() => {
        fetch(`${winners}/${this.car.id}`, {
          method: 'DELETE'
        });
        document.dispatchEvent(new CustomEvent('remove-car-from-garage', {
          detail: {
            id: this.car.id
          }
        }));
        this.car.destroy();

        (<HTMLButtonElement>this.wrapper.querySelector('.car-details'))!.removeEventListener('click', this.selectCar);
        (<HTMLButtonElement>this.wrapper.querySelector('.run'))?.removeEventListener('click', this.onStart);
        (<HTMLButtonElement>this.wrapper.querySelector('.stop'))?.removeEventListener('click', this.onStop);
        this.wrapper.removeEventListener('car-started', this.onCarStarted);
        this.wrapper.removeEventListener('car-stopped', this.onCarStopped);
        (<HTMLButtonElement>e.target).removeEventListener('click', this.removeCar);

        this.trackElement.parentNode?.removeChild(this.trackElement);
      });
    }
  }
  
  get markup(): string {
    return `<div class="cars-options">
      <button class="button white car-details">SELECT</button>
      <button class="button white car-remove">REMOVE</button>
      <span class="car-name"></span>
    </div>
    <div class="car-track">
      <button class="self-options run">A</button>
      <button disabled class="self-options stop">B</button>
      <div class="car-road">
      </div>
      </div>`
  }

  get trackElement(): HTMLDivElement {
    return this.wrapper;
  }

  appendCar(carObj: { color: string; name: string; id: number; wins?: number | undefined; }) {
    const car = new Car(carObj.color, carObj.name, carObj.id, carObj.wins);
    const finishFlag: HTMLDivElement = document.createElement('div');
    finishFlag.classList.add('flag');
    finishFlag.innerHTML = flag;
    this.placeToAddCar!.appendChild(car.carElementDiv);
    this.placeToAddCar!.appendChild(finishFlag);
    this.carNameElement!.textContent = car.name;
    this.car = car;

    const startBtn: HTMLButtonElement | null = this.wrapper.querySelector('.run');
    const stopBtn: HTMLButtonElement | null = this.wrapper.querySelector('.stop');
    const selectBtn: HTMLButtonElement | null = this.wrapper.querySelector('.car-details');
    const removeCarBtn: HTMLButtonElement | null = this.wrapper.querySelector('.car-remove');

    startBtn?.addEventListener('click', this.onStart);
    this.wrapper.addEventListener('car-started', this.onCarStarted);
    stopBtn!.addEventListener('click', this.onStop);
    this.wrapper.addEventListener('car-stopped', this.onCarStopped);
    selectBtn?.addEventListener('click', this.selectCar);
    removeCarBtn?.addEventListener('click', this.removeCar);
  }

  destroy() {
    const click = new PointerEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    (<HTMLButtonElement>this.wrapper.querySelector('.car-remove'))!.dispatchEvent(click);
  }

  destroyClientOnly() {
    this.car.destroy();

    document.dispatchEvent(new CustomEvent('remove-car-from-garage', {
      detail: {
        id: this.car.id
      }
    }));

    (<HTMLButtonElement>this.wrapper.querySelector('.car-details'))!.removeEventListener('click', this.selectCar);
    (<HTMLButtonElement>this.wrapper.querySelector('.run'))!.removeEventListener('click', this.onStart);
    (<HTMLButtonElement>this.wrapper.querySelector('.stop'))!.removeEventListener('click', this.onStop);
    this.wrapper.removeEventListener('car-started', this.onCarStarted);
    this.wrapper.removeEventListener('car-stopped', this.onCarStopped);
    (<HTMLButtonElement>this.wrapper.querySelector('.car-remove'))!.removeEventListener('click', this.removeCar);

    this.trackElement.parentNode!.removeChild(this.trackElement);
  }
}