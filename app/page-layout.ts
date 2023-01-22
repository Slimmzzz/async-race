export const garagePage: string =`
<button class="button green to-garage">TO GARAGE</button>
<button class="button green to-winners">TO WINNERS</button>
<div id="garage-page" style="display:block">
<div class="pages">
</div>
<div class="car-customiser">
<div class="create-car">
<input type="text" name="name" id="carName-create">
<input type="color" name="color" id="carColor-create">
<button id="create-car-button" class="button white create-car-button">CREATE</button>
</div>
<div class="update-car">
<input disabled type="text" name="name" id="carName-update">
<input disabled type="color" name="color" id="carColor-update">
<button disabled id="update-car-button" class="button white create-car-button">UPDATE</button>
</div>  
</div>
<div class="race-buttons">
<button class="button green start-race">RACE</button>
<button class="button green stop-race">RESET</button>
<button class="button white generate-cars">GENERATE CARS</button>
</div>
<h1 class="h1">GARAGE (<span id="cars-total-count"></span>)</h1>
<h2 class="h2">Page #<span id="page-num"></span></h2>
<div class="cars-garage"></div>
<button class="button green prev-page">PREVIOUS</button>
<button class="button green next-page">NEXT</button>
</div>

<div id="winners-page" style="display:none">
<div class="pages">
</div>
<h1 class="h1 winners-quantity">Winners</h1>
<table class="table-result">
<thead>
  <tr class="main-row">
    <td class="td-clickable" data-sort="id">Number</td>
    <td>Car</td>
    <td>Name</td>
    <td class="td-clickable" data-sort="wins">Wins</td>
    <td class="td-clickable" data-sort="time">Best time(seconds)</td>
  </tr>
</thead>
<tbody>
  <tr class="winner-row">
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</tbody>
</table>
</div>

<div class="winner" id="winner" style="display: none">
  <span class="winner-text" id="winner-text"></span>
</div>
`;