// @ts-ignore
import * as dayjs from 'dayjs';
// @ts-ignore
import * as duration from 'dayjs/plugin/duration';
// @ts-ignore
import { garage, winners } from "./app.ts";
// @ts-ignore
import { carModel } from "./images.ts";

dayjs.extend(duration);

interface RenderTableOptions {
  sort: string
  order: string
}

export function renderWinnersTable(renderTableOptions: RenderTableOptions = {
  sort: "id",
  order: "ASC"
}) {
  const table: HTMLTableElement | null = document.querySelector('.table-result');
  const tBody: HTMLTableSectionElement = table!.tBodies[0];

  fetch(`${winners}?_sort=${renderTableOptions.sort}&_order=${renderTableOptions.order}`)
  .then(res => res.json())
  .then(async (arrayOfWinners: {id: number, time: number, wins: number}[]) => {
    tBody.innerHTML = '';
    for (let i = 0; i < arrayOfWinners.length; i++) {
      const winnerObj = arrayOfWinners[i];
      const carResponse = await fetch(`${garage}/${winnerObj.id}`)
      const carObj = await carResponse.json();
      const tr = document.createElement('tr');
      const tds = `
        <td>${i + 1}</td>
        <td>${carModel(carObj.color)}</td>
        <td>${carObj.name}</td>
        <td>${winnerObj.wins}</td>
        <td>${dayjs.duration(Math.round(winnerObj.time)).format('m:ss.SSS')}</td>
      `;
      tr.innerHTML = tds;
      tBody.appendChild(tr);
    }
  })
}

export function onTableHeaderClick(e: Event) {
  const target = (<HTMLTableCellElement>e.target);

  if (target.hasAttribute('data-sort')) {
    if (!target.hasAttribute('data-order')) {
      target.setAttribute('data-order', 'ASC');
    }
    const sort: string = target.dataset.sort!;
    const order: string = target.dataset.order!;

    renderWinnersTable({sort, order});

    target.setAttribute('data-order', target.getAttribute('data-order') === 'ASC' ? 'DESC' : 'ASC');
  }
}