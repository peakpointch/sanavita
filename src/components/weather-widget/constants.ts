import { WeatherDay, WeatherForecast } from "./types";

export const currentWeather: WeatherDay = {
  coord: {
    lon: 8.2184,
    lat: 47.479,
  },
  weather: [
    {
      id: 800,
      main: "Clear",
      description: "clear sky",
      icon: "01d",
    },
  ],
  base: "stations",
  main: {
    temp: -2.83,
    feels_like: -4.75,
    temp_min: -4.08,
    temp_max: -0.93,
    pressure: 1015,
    humidity: 76,
    sea_level: 1015,
    grnd_level: 961,
  },
  visibility: 10000,
  wind: {
    speed: 1.37,
    deg: 205,
    gust: 3.14,
  },
  clouds: {
    all: 5,
  },
  dt: 1767789940,
  sys: {
    type: 2,
    id: 2106767,
    country: "CH",
    sunrise: 1767770036,
    sunset: 1767801136,
  },
  timezone: 3600,
  id: 2657976,
  name: "Windisch",
  cod: 200,
};

export const forecast: WeatherForecast = {
  cod: "200",
  message: 0,
  cnt: 40,
  list: [
    {
      dt: 1767711600,
      main: {
        temp: -4.89,
        feels_like: -4.89,
        temp_min: -4.89,
        temp_max: -2.9,
        pressure: 1018,
        sea_level: 1018,
        grnd_level: 963,
        humidity: 88,
        temp_kf: -1.99,
      },
      weather: [
        {
          id: 803,
          main: "Clouds",
          description: "broken clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 84,
      },
      wind: {
        speed: 0.09,
        deg: 306,
        gust: 0.11,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-06 15:00:00",
    },
    {
      dt: 1767722400,
      main: {
        temp: -4.68,
        feels_like: -4.68,
        temp_min: -4.68,
        temp_max: -4.27,
        pressure: 1019,
        sea_level: 1019,
        grnd_level: 964,
        humidity: 89,
        temp_kf: -0.41,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 87,
      },
      wind: {
        speed: 0.55,
        deg: 277,
        gust: 0.43,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-06 18:00:00",
    },
    {
      dt: 1767733200,
      main: {
        temp: -5.46,
        feels_like: -5.46,
        temp_min: -5.74,
        temp_max: -5.46,
        pressure: 1020,
        sea_level: 1020,
        grnd_level: 965,
        humidity: 96,
        temp_kf: 0.28,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 93,
      },
      wind: {
        speed: 0.5,
        deg: 239,
        gust: 0.44,
      },
      visibility: 4297,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-06 21:00:00",
    },
    {
      dt: 1767744000,
      main: {
        temp: -6.86,
        feels_like: -6.86,
        temp_min: -6.86,
        temp_max: -6.86,
        pressure: 1021,
        sea_level: 1021,
        grnd_level: 964,
        humidity: 99,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 99,
      },
      wind: {
        speed: 0.22,
        deg: 248,
        gust: 0.29,
      },
      visibility: 736,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-07 00:00:00",
    },
    {
      dt: 1767754800,
      main: {
        temp: -7.35,
        feels_like: -7.35,
        temp_min: -7.35,
        temp_max: -7.35,
        pressure: 1021,
        sea_level: 1021,
        grnd_level: 964,
        humidity: 100,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 99,
      },
      wind: {
        speed: 0.36,
        deg: 180,
        gust: 0.26,
      },
      visibility: 1545,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-07 03:00:00",
    },
    {
      dt: 1767765600,
      main: {
        temp: -4.59,
        feels_like: -4.59,
        temp_min: -4.59,
        temp_max: -4.59,
        pressure: 1020,
        sea_level: 1020,
        grnd_level: 963,
        humidity: 99,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 97,
      },
      wind: {
        speed: 0.4,
        deg: 148,
        gust: 0.33,
      },
      visibility: 3913,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-07 06:00:00",
    },
    {
      dt: 1767776400,
      main: {
        temp: -8.13,
        feels_like: -8.13,
        temp_min: -8.13,
        temp_max: -8.13,
        pressure: 1020,
        sea_level: 1020,
        grnd_level: 963,
        humidity: 87,
        temp_kf: 0,
      },
      weather: [
        {
          id: 803,
          main: "Clouds",
          description: "broken clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 81,
      },
      wind: {
        speed: 0.28,
        deg: 128,
        gust: 0.5,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-07 09:00:00",
    },
    {
      dt: 1767787200,
      main: {
        temp: -3.01,
        feels_like: -3.01,
        temp_min: -3.01,
        temp_max: -3.01,
        pressure: 1017,
        sea_level: 1017,
        grnd_level: 961,
        humidity: 63,
        temp_kf: 0,
      },
      weather: [
        {
          id: 802,
          main: "Clouds",
          description: "scattered clouds",
          icon: "03d",
        },
      ],
      clouds: {
        all: 50,
      },
      wind: {
        speed: 1.2,
        deg: 173,
        gust: 2.27,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-07 12:00:00",
    },
    {
      dt: 1767798000,
      main: {
        temp: -3.93,
        feels_like: -3.93,
        temp_min: -3.93,
        temp_max: -3.93,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 959,
        humidity: 74,
        temp_kf: 0,
      },
      weather: [
        {
          id: 803,
          main: "Clouds",
          description: "broken clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 69,
      },
      wind: {
        speed: 0.44,
        deg: 102,
        gust: 0.52,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-07 15:00:00",
    },
    {
      dt: 1767808800,
      main: {
        temp: -6.27,
        feels_like: -6.27,
        temp_min: -6.27,
        temp_max: -6.27,
        pressure: 1015,
        sea_level: 1015,
        grnd_level: 959,
        humidity: 88,
        temp_kf: 0,
      },
      weather: [
        {
          id: 803,
          main: "Clouds",
          description: "broken clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 84,
      },
      wind: {
        speed: 0.61,
        deg: 193,
        gust: 0.51,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-07 18:00:00",
    },
    {
      dt: 1767819600,
      main: {
        temp: -4.78,
        feels_like: -7,
        temp_min: -4.78,
        temp_max: -4.78,
        pressure: 1016,
        sea_level: 1016,
        grnd_level: 961,
        humidity: 93,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.39,
        deg: 225,
        gust: 3.04,
      },
      visibility: 11,
      pop: 0.23,
      snow: {
        "3h": 0.14,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-07 21:00:00",
    },
    {
      dt: 1767830400,
      main: {
        temp: -4.49,
        feels_like: -7.4,
        temp_min: -4.49,
        temp_max: -4.49,
        pressure: 1017,
        sea_level: 1017,
        grnd_level: 961,
        humidity: 96,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.81,
        deg: 247,
        gust: 5.28,
      },
      visibility: 3885,
      pop: 0.3,
      snow: {
        "3h": 0.19,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-08 00:00:00",
    },
    {
      dt: 1767841200,
      main: {
        temp: -3.43,
        feels_like: -6.44,
        temp_min: -3.43,
        temp_max: -3.43,
        pressure: 1016,
        sea_level: 1016,
        grnd_level: 961,
        humidity: 92,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.99,
        deg: 252,
        gust: 6.21,
      },
      visibility: 10000,
      pop: 0.2,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-08 03:00:00",
    },
    {
      dt: 1767852000,
      main: {
        temp: -5.6,
        feels_like: -7.99,
        temp_min: -5.6,
        temp_max: -5.6,
        pressure: 1017,
        sea_level: 1017,
        grnd_level: 961,
        humidity: 95,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.42,
        deg: 242,
        gust: 3.24,
      },
      visibility: 6607,
      pop: 0.12,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-08 06:00:00",
    },
    {
      dt: 1767862800,
      main: {
        temp: -2.07,
        feels_like: -4.59,
        temp_min: -2.07,
        temp_max: -2.07,
        pressure: 1017,
        sea_level: 1017,
        grnd_level: 962,
        humidity: 83,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.8,
        deg: 226,
        gust: 5.75,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-08 09:00:00",
    },
    {
      dt: 1767873600,
      main: {
        temp: 2.3,
        feels_like: -0.77,
        temp_min: 2.3,
        temp_max: 2.3,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 960,
        humidity: 68,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 3.04,
        deg: 224,
        gust: 11.44,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-08 12:00:00",
    },
    {
      dt: 1767884400,
      main: {
        temp: 1.84,
        feels_like: -1.66,
        temp_min: 1.84,
        temp_max: 1.84,
        pressure: 1013,
        sea_level: 1013,
        grnd_level: 959,
        humidity: 88,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 3.48,
        deg: 224,
        gust: 11.57,
      },
      visibility: 10000,
      pop: 0.21,
      snow: {
        "3h": 0.13,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-08 15:00:00",
    },
    {
      dt: 1767895200,
      main: {
        temp: 2.48,
        feels_like: -0.62,
        temp_min: 2.48,
        temp_max: 2.48,
        pressure: 1012,
        sea_level: 1012,
        grnd_level: 958,
        humidity: 95,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 3.13,
        deg: 234,
        gust: 12.11,
      },
      visibility: 10000,
      pop: 0.2,
      rain: {
        "3h": 0.13,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-08 18:00:00",
    },
    {
      dt: 1767906000,
      main: {
        temp: 3.68,
        feels_like: 0.05,
        temp_min: 3.68,
        temp_max: 3.68,
        pressure: 1010,
        sea_level: 1010,
        grnd_level: 956,
        humidity: 93,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 4.32,
        deg: 208,
        gust: 13.11,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        "3h": 1.54,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-08 21:00:00",
    },
    {
      dt: 1767916800,
      main: {
        temp: 5.73,
        feels_like: 2.05,
        temp_min: 5.73,
        temp_max: 5.73,
        pressure: 1007,
        sea_level: 1007,
        grnd_level: 954,
        humidity: 88,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 5.44,
        deg: 236,
        gust: 15.36,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        "3h": 1.26,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-09 00:00:00",
    },
    {
      dt: 1767927600,
      main: {
        temp: 6.84,
        feels_like: 3.24,
        temp_min: 6.84,
        temp_max: 6.84,
        pressure: 1002,
        sea_level: 1002,
        grnd_level: 950,
        humidity: 80,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 5.98,
        deg: 222,
        gust: 17.48,
      },
      visibility: 10000,
      pop: 0.1,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-09 03:00:00",
    },
    {
      dt: 1767938400,
      main: {
        temp: 6.04,
        feels_like: 1.49,
        temp_min: 6.04,
        temp_max: 6.04,
        pressure: 1002,
        sea_level: 1002,
        grnd_level: 950,
        humidity: 82,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10n",
        },
      ],
      clouds: {
        all: 95,
      },
      wind: {
        speed: 8.11,
        deg: 232,
        gust: 19.47,
      },
      visibility: 10000,
      pop: 0.36,
      rain: {
        "3h": 0.54,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-09 06:00:00",
    },
    {
      dt: 1767949200,
      main: {
        temp: 5.13,
        feels_like: 0.06,
        temp_min: 5.13,
        temp_max: 5.13,
        pressure: 1002,
        sea_level: 1002,
        grnd_level: 949,
        humidity: 81,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10d",
        },
      ],
      clouds: {
        all: 43,
      },
      wind: {
        speed: 8.92,
        deg: 234,
        gust: 18.29,
      },
      visibility: 10000,
      pop: 0.4,
      rain: {
        "3h": 0.21,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-09 09:00:00",
    },
    {
      dt: 1767960000,
      main: {
        temp: 4.94,
        feels_like: 0.44,
        temp_min: 4.94,
        temp_max: 4.94,
        pressure: 1002,
        sea_level: 1002,
        grnd_level: 949,
        humidity: 82,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10d",
        },
      ],
      clouds: {
        all: 65,
      },
      wind: {
        speed: 6.99,
        deg: 237,
        gust: 15.83,
      },
      visibility: 10000,
      pop: 0.24,
      rain: {
        "3h": 0.19,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-09 12:00:00",
    },
    {
      dt: 1767970800,
      main: {
        temp: 3.87,
        feels_like: -0.49,
        temp_min: 3.87,
        temp_max: 3.87,
        pressure: 1001,
        sea_level: 1001,
        grnd_level: 948,
        humidity: 76,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13d",
        },
      ],
      clouds: {
        all: 80,
      },
      wind: {
        speed: 5.88,
        deg: 237,
        gust: 12.64,
      },
      visibility: 10000,
      pop: 0.42,
      snow: {
        "3h": 0.27,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-09 15:00:00",
    },
    {
      dt: 1767981600,
      main: {
        temp: 0.76,
        feels_like: -3.22,
        temp_min: 0.76,
        temp_max: 0.76,
        pressure: 1002,
        sea_level: 1002,
        grnd_level: 949,
        humidity: 94,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 74,
      },
      wind: {
        speed: 3.81,
        deg: 233,
        gust: 11.39,
      },
      visibility: 10000,
      pop: 1,
      snow: {
        "3h": 0.71,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-09 18:00:00",
    },
    {
      dt: 1767992400,
      main: {
        temp: 1.52,
        feels_like: -3.5,
        temp_min: 1.52,
        temp_max: 1.52,
        pressure: 1003,
        sea_level: 1003,
        grnd_level: 949,
        humidity: 85,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 98,
      },
      wind: {
        speed: 5.95,
        deg: 226,
        gust: 12.87,
      },
      visibility: 10000,
      pop: 0.2,
      snow: {
        "3h": 0.1,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-09 21:00:00",
    },
    {
      dt: 1768003200,
      main: {
        temp: 1.09,
        feels_like: -4.61,
        temp_min: 1.09,
        temp_max: 1.09,
        pressure: 1003,
        sea_level: 1003,
        grnd_level: 949,
        humidity: 93,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 99,
      },
      wind: {
        speed: 7.24,
        deg: 230,
        gust: 15.51,
      },
      visibility: 4681,
      pop: 0.3,
      snow: {
        "3h": 0.28,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-10 00:00:00",
    },
    {
      dt: 1768014000,
      main: {
        temp: 0.91,
        feels_like: -4.57,
        temp_min: 0.91,
        temp_max: 0.91,
        pressure: 1004,
        sea_level: 1004,
        grnd_level: 950,
        humidity: 96,
        temp_kf: 0,
      },
      weather: [
        {
          id: 601,
          main: "Snow",
          description: "snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 6.6,
        deg: 240,
        gust: 16.54,
      },
      visibility: 599,
      pop: 1,
      snow: {
        "3h": 2.21,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-10 03:00:00",
    },
    {
      dt: 1768024800,
      main: {
        temp: 1.02,
        feels_like: -4.63,
        temp_min: 1.02,
        temp_max: 1.02,
        pressure: 1005,
        sea_level: 1005,
        grnd_level: 951,
        humidity: 93,
        temp_kf: 0,
      },
      weather: [
        {
          id: 601,
          main: "Snow",
          description: "snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 7.06,
        deg: 244,
        gust: 16.51,
      },
      visibility: 3566,
      pop: 1,
      snow: {
        "3h": 1.89,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-10 06:00:00",
    },
    {
      dt: 1768035600,
      main: {
        temp: 1.1,
        feels_like: -4.68,
        temp_min: 1.1,
        temp_max: 1.1,
        pressure: 1007,
        sea_level: 1007,
        grnd_level: 953,
        humidity: 91,
        temp_kf: 0,
      },
      weather: [
        {
          id: 601,
          main: "Snow",
          description: "snow",
          icon: "13d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 7.43,
        deg: 245,
        gust: 16.58,
      },
      visibility: 7043,
      pop: 1,
      snow: {
        "3h": 1.58,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-10 09:00:00",
    },
    {
      dt: 1768046400,
      main: {
        temp: 1.71,
        feels_like: -4.01,
        temp_min: 1.71,
        temp_max: 1.71,
        pressure: 1008,
        sea_level: 1008,
        grnd_level: 954,
        humidity: 86,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 7.76,
        deg: 241,
        gust: 16.63,
      },
      visibility: 10000,
      pop: 1,
      snow: {
        "3h": 0.78,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-10 12:00:00",
    },
    {
      dt: 1768057200,
      main: {
        temp: 1.67,
        feels_like: -3.73,
        temp_min: 1.67,
        temp_max: 1.67,
        pressure: 1010,
        sea_level: 1010,
        grnd_level: 956,
        humidity: 84,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13d",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 6.91,
        deg: 247,
        gust: 15.26,
      },
      visibility: 7501,
      pop: 0.78,
      snow: {
        "3h": 0.5,
      },
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-10 15:00:00",
    },
    {
      dt: 1768068000,
      main: {
        temp: 0.66,
        feels_like: -4.46,
        temp_min: 0.66,
        temp_max: 0.66,
        pressure: 1012,
        sea_level: 1012,
        grnd_level: 958,
        humidity: 96,
        temp_kf: 0,
      },
      weather: [
        {
          id: 601,
          main: "Snow",
          description: "snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 5.7,
        deg: 249,
        gust: 13,
      },
      visibility: 930,
      pop: 1,
      snow: {
        "3h": 1.58,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-10 18:00:00",
    },
    {
      dt: 1768078800,
      main: {
        temp: 0.61,
        feels_like: -4.37,
        temp_min: 0.61,
        temp_max: 0.61,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 960,
        humidity: 98,
        temp_kf: 0,
      },
      weather: [
        {
          id: 601,
          main: "Snow",
          description: "snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 5.4,
        deg: 258,
        gust: 11.59,
      },
      visibility: 75,
      pop: 1,
      snow: {
        "3h": 2.25,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-10 21:00:00",
    },
    {
      dt: 1768089600,
      main: {
        temp: 0.73,
        feels_like: -3.45,
        temp_min: 0.73,
        temp_max: 0.73,
        pressure: 1018,
        sea_level: 1018,
        grnd_level: 963,
        humidity: 98,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 4.09,
        deg: 261,
        gust: 8.92,
      },
      pop: 1,
      snow: {
        "3h": 0.81,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-11 00:00:00",
    },
    {
      dt: 1768100400,
      main: {
        temp: -0.95,
        feels_like: -3.35,
        temp_min: -0.95,
        temp_max: -0.95,
        pressure: 1022,
        sea_level: 1022,
        grnd_level: 967,
        humidity: 96,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04n",
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 1.84,
        deg: 272,
        gust: 6.45,
      },
      visibility: 10000,
      pop: 0.14,
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-11 03:00:00",
    },
    {
      dt: 1768111200,
      main: {
        temp: -5.24,
        feels_like: -5.24,
        temp_min: -5.24,
        temp_max: -5.24,
        pressure: 1025,
        sea_level: 1025,
        grnd_level: 968,
        humidity: 99,
        temp_kf: 0,
      },
      weather: [
        {
          id: 600,
          main: "Snow",
          description: "light snow",
          icon: "13n",
        },
      ],
      clouds: {
        all: 93,
      },
      wind: {
        speed: 1.02,
        deg: 297,
        gust: 0.95,
      },
      visibility: 6170,
      pop: 0.29,
      snow: {
        "3h": 0.1,
      },
      sys: {
        pod: "n",
      },
      dt_txt: "2026-01-11 06:00:00",
    },
    {
      dt: 1768122000,
      main: {
        temp: -3.92,
        feels_like: -3.92,
        temp_min: -3.92,
        temp_max: -3.92,
        pressure: 1026,
        sea_level: 1026,
        grnd_level: 970,
        humidity: 95,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 94,
      },
      wind: {
        speed: 0.63,
        deg: 17,
        gust: 0.82,
      },
      visibility: 4478,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-11 09:00:00",
    },
    {
      dt: 1768132800,
      main: {
        temp: -0.59,
        feels_like: -0.59,
        temp_min: -0.59,
        temp_max: -0.59,
        pressure: 1024,
        sea_level: 1024,
        grnd_level: 969,
        humidity: 88,
        temp_kf: 0,
      },
      weather: [
        {
          id: 804,
          main: "Clouds",
          description: "overcast clouds",
          icon: "04d",
        },
      ],
      clouds: {
        all: 90,
      },
      wind: {
        speed: 0.52,
        deg: 64,
        gust: 0.36,
      },
      visibility: 10000,
      pop: 0,
      sys: {
        pod: "d",
      },
      dt_txt: "2026-01-11 12:00:00",
    },
  ],
  city: {
    id: 2657976,
    name: "Windisch",
    coord: {
      lat: 47.479,
      lon: 8.2184,
    },
    country: "CH",
    population: 6689,
    timezone: 3600,
    sunrise: 1767683652,
    sunset: 1767714669,
  },
};
