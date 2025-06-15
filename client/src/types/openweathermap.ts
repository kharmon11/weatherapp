export interface Rain {
    "1h": number;
}

export interface Snow {
    "1h": number;
}

export interface WeatherConditions {
    description: string;
    icon: string;
    id: number;
    main: string;
}

export interface CurrentWeather {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    rain?: Rain;
    snow?: Snow
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: WeatherConditions[];
}

export interface FeelsLike {
    day: number;
    eve: number;
    morn: number;
    night: number;
}

export interface DailyTemp {
    day: number;
    eve: number;
    max: number;
    min: number;
    morn: number;
    night: number;
}

export interface DailyForecast {
    clouds: number;
    dew_point: number;
    dt: number;
    feels_like: FeelsLike;
    humidity: number;
    moon_phase: number;
    moon_rise: number;
    moon_set: number;
    pop: number;
    pressure: number;
    rain?: number;
    snow?: number;
    summary: string;
    sunrise: number;
    sunset: number;
    temp: DailyTemp;
    uvi: number;
    weather: WeatherConditions[];
    wind_deg: number;
    wind_speed: number;
    wind_gust?: number;
}

export interface MinutelyForecast {
    dt: number;
    precipitation: number;
}

export interface WeatherData {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: CurrentWeather;
    // Include these only if you start using them:
    daily: DailyForecast[];
    // hourly: HourlyForecast[];
    minutely?: MinutelyForecast[];
}

export interface OpenWeatherMapResponse {
    location_text: string;
    lat_string: string;
    lon_string: string;
    data: WeatherData;
}