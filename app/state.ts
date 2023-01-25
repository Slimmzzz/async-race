// @ts-ignore
import { ITrack } from "./oneCarTrack.ts"

interface ICommonState {
  page: number
  tracksOnPage: ITrack[]
  isRaceRunning: boolean
  finishedCars: []
  carNames: string[]
  carModels: string[]
  carsTotal: number
}

export const commonState: ICommonState = {
  page: 1,
  tracksOnPage: [],
  isRaceRunning: false,
  finishedCars: [],  
  carNames: ['Audi', 'BMW', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Lada', 'Mazda', 'Mercedes', 'Mitsubishi', 'Nissan', 'Renault', 'Skoda', 'Toyota', 'Volkswagen'],
  carModels: ['Eclipse', 'Outlander', 'CLS', '6', 'Lantra', 'LandCruiser', 'Almera', 'Phaeton', 'Vesta', 'Civic', 'Megane', 'Fabia', 'E63 AMG', 'A6', '530'],
  carsTotal: 0
}
