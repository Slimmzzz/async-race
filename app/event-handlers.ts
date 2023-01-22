// @ts-ignore
import * as dayjs from 'dayjs';
// @ts-ignore
import * as duration from 'dayjs/plugin/duration';
// @ts-ignore
import { carsGarage, createCar, CarObj, garage, winners, renderPage } from "./app.ts";
// @ts-ignore
import { ICar } from './carConstructor.ts';
// @ts-ignore
import { Track, ITrack } from "./oneCarTrack.ts";
// @ts-ignore
import { commonState } from "./state.ts";
// @ts-ignore
import { renderWinnersTable } from './winners-table.ts';

dayjs.extend(duration);

export async function onCreate(event: Event) {
  event.preventDefault();
  const name = (<HTMLInputElement>document.querySelector('#carName-create'));
  const color = (<HTMLInputElement>document.querySelector('#carColor-create'));
  if (!name.value.trim()) {
    return alert('Не указано название автомобиля');
  }
  const carObj: CarObj = await createCar(name.value, color.value);
  const track: ITrack = new Track();
  commonState.tracksOnPage.push(track);
  track.appendCar(carObj);
  carsGarage!.appendChild(track.trackElement);
  commonState.carsTotal = Number(commonState.carsTotal) + 1;
  (<HTMLSpanElement>document.querySelector('#cars-total-count'))!.textContent = commonState.carsTotal;
  name.value = '';
  color.value = '#000000';
}

export function onUpdateCar(e: Event) {
  if ((<HTMLButtonElement>e.target!).dataset.id) {
    const inputCarName = (<HTMLInputElement>document.querySelector('#carName-update'));
    const inputCarColor = (<HTMLInputElement>document.querySelector('#carColor-update'));
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    fetch(`${garage}/${(<HTMLButtonElement>e.target!).dataset.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: inputCarName.value,
        color: inputCarColor.value
      })
    })
    .then(res => res.json())
    .then((carObj: CarObj) => {
      const carOnPage: Track = commonState.tracksOnPage.find((track: Track) => {
        const car: Track = track.car;
        return car.id === carObj.id;
      }).car;
      carOnPage.carElementDiv.dispatchEvent(new CustomEvent('update-car', {
        detail: carObj
      }));

      inputCarName.value = '';
      inputCarColor.value = '#000000';

      inputCarName.disabled = true;
      inputCarColor.disabled = true;
      (<HTMLButtonElement>e.target).disabled = true;
    });
  }
}

export function onRaceClick(e?: Event) {
  if (commonState.tracksOnPage.length) {
    commonState.isRaceRunning = true;
    commonState.finishedCars = [];
    commonState.tracksOnPage.forEach((track: Track) => {
      const car: Track = track.car;
      car.start();
    });
  }
}

export function onRaceStop(e: Event) {
  if (commonState.isRaceRunning) {
    commonState.isRaceRunning = false;
    commonState.tracksOnPage.forEach((track: Track) => {
      const car: Track = track.car;
      car.stop();
    });
  }
}

export function onCarFinished(e: Event) {
  if (commonState.isRaceRunning) {
    const detail: {car: ICar, time: number} = (<CustomEvent>e).detail;
    commonState.finishedCars.push(detail);
    if (commonState.finishedCars.length === 1) {
      (<HTMLDivElement>document.querySelector('#winner'))!.setAttribute('style', 'display: flex;');
      (<HTMLSpanElement>document.querySelector('#winner-text'))!.textContent = `${detail.car.name} победил. Его время: ${dayjs.duration(Math.round(detail.time)).format('ss.SSS')}c`;
      detail.car.wins += 1;
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      fetch(`${winners}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: detail.car.id,
          time: detail.time,
          wins: detail.car.wins
        })
      })
      .then(res => res.json())
      .then((data: {id: Number, time: Number, wins: number}) => {
        fetch(`${garage}/${data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "wins": data.wins
          })
        });
        renderWinnersTable();
      }).catch(res => {
        if (res.message == `Unexpected token 'E', \"Error: Ins\"... is not valid JSON`) {
          fetch(`${winners}/${detail.car.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              time: detail.time,
              wins: detail.car.wins
            })
          })
          .then(res => res.json())
          .then((data: {id: Number, time: Number, wins: number}) => {
            fetch(`${garage}/${data.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "wins": data.wins
              })
            });
            renderWinnersTable();
          })
        }
      }) 
    }
  }
}

export function onGenerate() {
  Promise.all(
    new Array(100).fill(0).map(async (x) => {
      const nameFirstPart: string = commonState.carNames[Math.floor(Math.random() * commonState.carNames.length)];
      const nameSecondPart: string = commonState.carModels[Math.floor(Math.random() * commonState.carModels.length)];
      const hex: string[] = '0123456789ABCDEF'.split('');
      const name: string = `${nameFirstPart} ${nameSecondPart}`;
      const color: string = '#' + new Array(6).fill(0).map((x) => {
        return hex[Math.floor(Math.random() * 16)];
      })
      .join('');
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return await fetch(garage, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          color,
        })
      })
    })
  ).then(async () => {
    while (commonState.tracksOnPage.length) {
      const track: Track = commonState.tracksOnPage[0];
      track.destroyClientOnly();
    }
    await renderPage();
  });
}
