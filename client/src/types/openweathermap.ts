export interface WeatherConditions {
    description: string;
    icon: string;
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
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather: WeatherConditions[];
}

export interface WeatherData {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: CurrentWeather;
    // Include these only if you start using them:
    // daily: DailyForecast[];
    // hourly: HourlyForecast[];
    // minutely: MinutelyForecast[];
}

export interface OpenWeatherMapResponse {
    location_text: string;
    lat_string: string;
    lon_string: string;
    data: WeatherData;
}