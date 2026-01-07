export type WeatherIcon =
  | "01d"
  | "01n"

  // Few Clouds
  | "02d"
  | "02n"
  | "03d"
  | "03n"
  | "04d"
  | "04n"
  | "09d"
  | "09n"

  // Rain
  | "10d"
  | "10n"
  | "11d"
  | "11n"
  | "13d"
  | "13n"
  | "50d"
  | "50n";

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: WeatherIcon;
}

export interface WeatherMain {
  feels_like: number;
  temp: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf?: number;
}

export interface Coord {
  lon: number;
  lat: number;
}

export interface Clouds {
  all: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

export interface Rain {
  "3h"?: number;
}

export interface Snow {
  "3h"?: number;
}

export interface WeatherDay {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: WeatherMain;
  visibility: number;
  wind: Wind;
  rain?: Rain;
  snow?: Snow;
  clouds?: Clouds;
  dt: number;
  dt_txt?: string;
  sys:
    | {
        type: number;
        id: number;
        country: string;
        sunrise: number;
        sunset: number;
      }
    | {
        pod: string;
      };
  timezone: number;
  id: number;
  name: string;
  cod: number;
  pop?: number;
}

export interface WeatherDayForecast {
  weather: Weather[];
  main: WeatherMain;
  visibility?: number;
  wind: Wind;
  rain?: Rain;
  snow?: Snow;
  clouds?: Clouds;
  dt: number;
  dt_txt?: string;
  sys:
    | {
        type: number;
        id: number;
        country: string;
        sunrise: number;
        sunset: number;
      }
    | {
        pod: string;
      };
  pop?: number;
}

export interface WeatherCity {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherForecast {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDayForecast[];
  city: WeatherCity;
}
