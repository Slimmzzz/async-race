// @ts-ignore
import * as dayjs from 'dayjs';
// @ts-ignore
import * as duration from 'dayjs/plugin/duration';
// @ts-ignore
import { garagePage } from "./page-layout.ts";
// @ts-ignore
import { Track, ITrack } from "./oneCarTrack.ts";
// @ts-ignore
import { commonState } from "./state.ts";
// @ts-ignore
import { renderWinnersTable, onTableHeaderClick } from "./winners-table.ts";
// @ts-ignore
import { onCreate, onUpdateCar, onRaceClick, onCarFinished, onGenerate, onRaceStop } from './event-handlers.ts';

dayjs.extend(duration);

export const baseURL = 'http://localhost:3000';

export const garage: string = `${baseURL}/garage`;
export const winners: string = `${baseURL}/winners`;
export let carsGarage: Element | null = document.querySelector('.cars-garage');

type queryType = {key: string, value: number};

const queryParamsString = (queryParams: queryType[]): string => queryParams.length 
  ? `?${queryParams.map(obj => `${obj.key}=${obj.value}`).join('&')}`
  : '';

const getAllCars = async (queryParams: queryType[]) => {
  const res = await fetch(`${garage}${queryParamsString(queryParams)}`);
  const data = await res.json();
  return [data, res.headers.get('X-Total-Count')];
}

export const createCar = async (name: string, color: string) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const res = await fetch(garage, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name, color
    })
  });
  return await res.json();
}

window.addEventListener('load', async () => {
  const root: HTMLDivElement = document.createElement('div');
  root.innerHTML = garagePage;
  document.body.appendChild(root);
  let carsGarage: Element | null = document.querySelector('.cars-garage');

  async function renderPage(): Promise<void> {
    const [ cars, total ] = await getAllCars([{key: '_page', value: commonState.page}, {key: '_limit', value: 7}]);
    (<Number>commonState.carsTotal) = Number(total);
    (<HTMLSpanElement>document.querySelector('#cars-total-count'))!.textContent = total;
    (<HTMLSpanElement>document.querySelector('#page-num'))!.textContent = commonState.page;
    cars.forEach((carObj: CarObj) => {
      const track: ITrack = new Track();
      track.appendCar(carObj);
      commonState.tracksOnPage.push(track);
      carsGarage!.appendChild(track.trackElement);
    });
  }

  async function onCreate(event: Event) {
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
  
  function onGenerate() {
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
  
  async function navigateToAnotherPage(pageNum: number): Promise<void> {
    (<Number>commonState.page) = pageNum;
    while (commonState.tracksOnPage.length) {
      const track: Track = commonState.tracksOnPage[0];
      track.destroyClientOnly();
    }
    await renderPage();
    (<HTMLSpanElement>document.querySelector('#page-num'))!.textContent = String(pageNum);
  }

  function isPageExist(pageNum: number): Boolean {
    if (pageNum < 1) {
      return false;
    }
    let pagesCount: number = commonState.carsTotal / 7;
    if (String(pagesCount).indexOf('.') === -1) {
      pagesCount = Math.floor(pagesCount) - 1;
    }
    pagesCount = Math.floor(pagesCount);
    if (pageNum > pagesCount + 1) {
      return false;
    }
    return true;
  }

  function onNextPage(): void {
    const pageNum = commonState.page + 1;
    if (isPageExist(pageNum)) {
      navigateToAnotherPage(pageNum);
    }
  }

  function onPreviousPage(): void {
    const pageNum = commonState.page - 1;
    if (isPageExist(pageNum)) {
      navigateToAnotherPage(pageNum);
    }
  }

  document.addEventListener('car-finished', onCarFinished);
  (<HTMLTableElement>document.querySelector('.table-result thead'))!.addEventListener('click', onTableHeaderClick);
  (<HTMLButtonElement>document.querySelector('.next-page'))!.addEventListener('click', onNextPage);
  (<HTMLButtonElement>document.querySelector('.prev-page'))!.addEventListener('click', onPreviousPage);
  (<HTMLButtonElement>document.querySelector('.generate-cars'))!.addEventListener('click', onGenerate);
  (<HTMLButtonElement>document.querySelector('.stop-race'))!.addEventListener('click', onRaceStop);
  (<HTMLButtonElement>document.querySelector('.start-race'))!.addEventListener('click', onRaceClick);
  (<HTMLButtonElement>document.querySelector('#update-car-button'))!.addEventListener('click', onUpdateCar);
  (<HTMLButtonElement>document.querySelector('#create-car-button'))!.addEventListener('click', onCreate);
  (<HTMLButtonElement>document.querySelector('.to-garage'))!.addEventListener('click', () => {
    (<HTMLDivElement>document.querySelector('#garage-page'))!.setAttribute('style', 'display: block;');
    (<HTMLDivElement>document.querySelector('#winners-page'))!.setAttribute('style', 'display: none;');
  });
  (<HTMLButtonElement>document.querySelector('.to-winners'))!.addEventListener('click', () => {
    (<HTMLDivElement>document.querySelector('#garage-page'))!.setAttribute('style', 'display: none;');
    (<HTMLDivElement>document.querySelector('#winners-page'))!.setAttribute('style', 'display: block;');
  });
  (<HTMLDivElement>document.querySelector('#winner'))!.addEventListener('click', () => {
    (<HTMLDivElement>document.querySelector('#winner'))!.setAttribute('style', 'display:none;');
  })
  document.addEventListener('remove-car-from-garage', (e) => {
    const { id } = (<CustomEvent>e).detail;
    const trackToDeleteIndex = commonState.tracksOnPage.findIndex((track: Track) => {
      const car: Track = track.car;
      return car.id === id as Number;
    });
    commonState.tracksOnPage.splice(trackToDeleteIndex, 1);
    commonState.carsTotal = commonState.carsTotal - 1;
    (<HTMLSpanElement>document.querySelector('#cars-total-count'))!.textContent = commonState.carsTotal;
  });
  
  renderPage();
  renderWinnersTable();
});

export type CarObj = carObj; 

interface carObj {
  color: string,
  name: string,
  id: number
}