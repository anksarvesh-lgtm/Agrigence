import React, { useEffect, useState } from 'react';
import { WeatherIcon } from './WeatherIcon';
import { MapPin } from 'lucide-react';

export const WeatherHeroWidget: React.FC = () => {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [city, setCity] = useState<string>('Detecting...');

    useEffect(() => {
        fetchWeather(25.26, 83.26);
        setCity("Chandauli, UP");
    }, []);

    const reverseGeocode = async (lat: number, lon: number) => {
        try {
           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
           const data = await res.json();
           if(data.address) {
              setCity(data.address.city || data.address.state_district || data.address.state || "Unknown Location");
           }
        } catch(e) {
           setCity("Location Found");
        }
    };

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
            const response = await fetch(url);
            const data = await response.json();
            setWeatherData(data);
        } catch (e) {
            console.error("Weather fetch failed", e);
        }
    };

    if (!weatherData) return null;

    return (
        <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-6 flex items-center gap-3 sm:gap-6 text-white w-max shadow-xl min-w-0 sm:min-w-[280px]">
            <WeatherIcon code={weatherData.current_weather.weathercode} className="scale-75 sm:scale-100" />
            <div>
               <div className="flex items-center gap-1.5 text-[10px] sm:text-sm font-bold opacity-90 mb-0.5 sm:mb-1 tracking-wider uppercase">
                  <MapPin size={12} className="sm:w-[14px]" /> <span className="truncate max-w-[80px] sm:max-w-none">{city}</span>
               </div>
               <div className="text-2xl sm:text-5xl font-light font-mono tracking-tighter shadow-black drop-shadow-md">
                  {Math.round(weatherData.current_weather.temperature)}°<span className="text-sm sm:text-2xl text-white/70 tracking-normal border-white/20">C</span>
               </div>
            </div>
        </div>
    );
};
