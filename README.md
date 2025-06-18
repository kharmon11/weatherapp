# WeatherApp

A full-stack weather application that displays current and forecast weather information for user-selected locations. It features a modern React + TypeScript frontend, a FastAPI backend, and integrations with OpenWeatherMap and Google Maps APIs.

## 🌐 Live Demo

[View App](https://weather.kenharmon.net)

## ✨ Features

- 🔍 Search weather by city name or use browser geolocation
- 🌤️ Displays current and 8-day weather forecasts
- 🗺️ Embedded map of the selected location using Google Maps JavaScript API
- 🧭 Geocoding with Google Maps API
- ⚡ Fast, modern frontend built with Vite and React
- 📡 Backend API powered by FastAPI
- 🌍 Hosted on Google Cloud App Engine

## 🧰 Tech Stack

| Layer       | Tech                                                      |
|-------------|-----------------------------------------------------------|
| Frontend    | React 19.1.0, TypeScript, Vite, Sass, @vis.gl/react-google-maps |
| Backend     | FastAPI, Python 3.11, Gunicorn, Uvicorn                 |
| Data APIs   | OpenWeatherMap, Google Maps API                          |
| Deployment  | Google Cloud App Engine                                   |
| Node.js     | v22.11.0                                                  |
| Dependencies| Axios, React Icons, Recharts, Pydantic                  |

## 🚀 Getting Started

### Prerequisites

- Node.js v22.11.0
- Python 3.11.12
- Google Maps API Key (Maps JavaScript + Geocoding enabled)
- OpenWeatherMap API Key

### 1. Clone the repository

```bash
git clone https://github.com/kharmon11/weatherapp.git
cd weatherapp
```

### 2. Backend Setup

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env
# Add your API keys and configuration values to .env

uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd client
npm install  # or pnpm install

cp .env.example .env
# Add your environment variables to .env

npm run dev  # or pnpm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
weatherapp/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Sass stylesheets
│   ├── public/             # Static assets
│   ├── dist/               # Production build output
│   ├── .env                # Frontend environment variables
│   └── package.json
├── server/                 # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── openweathermap.py  # Weather API routes
│   │   ├── dist/           # Frontend build (copied from client/dist)
│   │   └── main.py         # FastAPI application entry point
│   ├── .env                # Backend environment variables
│   ├── app.yaml            # Google App Engine configuration
│   └── requirements.txt
└── README.md
```

## 🔧 Environment Variables

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_JAVASCRIPT_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_MAP_ID=your_google_maps_map_id
VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID=your_google_analytics_measurement_id  # Optional
```

### Backend (.env)

```bash
ENV=development    # Use "production" for production 
ALLOWED_ORIGINS=http://localhost:5173
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
GOOGLE_MAPS_GEOCODING_KEY=your_google_maps_api_key
```

## 🔑 API Keys Setup

### OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Subscribe to the "One Call API 3.0" plan
3. Copy your API key to the backend `.env` file

### Google Maps API
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
    - Maps JavaScript API
    - Geocoding API
4. Create credentials (API Key)
5. Add the API key to both frontend and backend `.env` files

## 📋 Available Scripts

### Frontend
- `npm run dev` (or `pnpm run dev`) - Start development server
- `npm run build` (or `pnpm run build`) - Build for production and copy to server
- `npm run copy-dist` - Copy built files to server/app/dist
- `npm run lint` - Run ESLint

### Backend
- `uvicorn app.main:app --reload` - Start development server
- `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app` - Start production server

## 🚀 Deployment

The application is deployed on Google Cloud App Engine with the following configuration:

### Production Build Process
1. **Frontend Build**: Run `npm run build` (or `pnpm run build`) to build the React app and automatically copy the dist folder to the server
2. **Backend Deployment**: The FastAPI server serves both the API and the static frontend files in production

### Google App Engine Configuration
- **Runtime**: Python 3.11
- **Server**: Gunicorn with 4 workers using Uvicorn workers
- **Auto-scaling**: Targets 65% CPU utilization
- **Environment**: Production environment variables are configured in `app.yaml`

### Deployment Steps
1. Build the frontend: `cd client && npm run build`
2. Deploy to App Engine: `gcloud app deploy server/app.yaml`
3. The app will be available at your App Engine URL

### Environment Setup
Make sure to configure your production environment variables in `server/app.yaml`:
- `ALLOWED_ORIGINS` should include your production domains
- API keys should be securely configured
- `ENV` should be set to "production"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ken Harmon**
- Website: [kenharmon.net](https://weather.kenharmon.net)
- GitHub: [@kharmon11](https://github.com/kharmon11)

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Google Maps Platform](https://developers.google.com/maps) for mapping services
- [React](https://reactjs.org/) and [FastAPI](https://fastapi.tiangolo.com/) communities