import React, { useEffect, useState } from 'react';
import { WeatherIcon } from '../../components/WeatherIcon';
import { RefreshCw, MapPin, Droplet, Wind, CloudRain, Sun, Calendar, AlertCircle, TrendingUp, TrendingDown, ThermometerSun } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const KisanWeather: React.FC = () => {
    const { t } = useLanguage();

    const [weatherData, setWeatherData] = useState<any>(null);
    const [city, setCity] = useState<string>('Detecting...');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const initWeatherSystem = () => {
        setRefreshing(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
                reverseGeocode(position.coords.latitude, position.coords.longitude);
            }, () => {
                fetchWeather(25.26, 83.26); // Fallback to Chandauli
                setCity("Chandauli, UP");
            });
        } else {
            fetchWeather(25.26, 83.26);
            setCity("Chandauli, UP");
        }
    };

    useEffect(() => {
        initWeatherSystem();
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
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,soil_moisture_0_to_7cm,evapotranspiration&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&models=best_match`;
            const response = await fetch(url);
            const data = await response.json();
            setWeatherData(data);
        } catch (e) {
            console.error("Weather fetch failed", e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading || !weatherData) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <RefreshCw size={32} className="animate-spin text-[#2d5a27]" />
            </div>
        );
    }

    // Current metrics
    const current = weatherData.current;
    const hourly = weatherData.hourly;
    const daily = weatherData.daily;
    
    // Find current hour index for soil moisture & evapotranspiration
    const currentHourStr = current.time;
    const currentHourIndex = hourly.time.findIndex((t: string) => t === currentHourStr) || 0;
    
    const currentSoilMoisture = hourly.soil_moisture_0_to_7cm[currentHourIndex];
    const currentEvapo = hourly.evapotranspiration[currentHourIndex];
    const currentHumidity = hourly.relative_humidity_2m[currentHourIndex];

    const getDayName = (dateStr: string, index: number) => {
        if(index === 0) return 'Today';
        if(index === 1) return 'Tomorrow';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-stone-50 to-stone-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div>
                   <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-[#2d5a27] font-serif drop-shadow-sm">{t("weather.title")}</h1>
                   <p className="text-sm font-medium text-stone-500 tracking-wide mt-1">{t("weather.subtitle")}</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-stone-700 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white shadow-sm font-medium">
                      <MapPin size={18} className="text-emerald-600" /> <b>{city}</b>
                   </div>
                   <button onClick={initWeatherSystem} className="p-3 text-white bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all active:translate-y-0 shrink-0">
                      <RefreshCw size={22} className={refreshing ? "animate-spin" : ""} />
                   </button>
                </div>
            </div>

            {/* Top Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
                {/* Main Temperature Card (3D Glassy) */}
                <div className="col-span-1 md:col-span-2 relative p-1 rounded-3xl bg-gradient-to-br from-white/20 to-white/0 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] backdrop-blur-xl border border-white/40 overflow-hidden transform transition-transform hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-emerald-900/90 -z-10"></div>
                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/30 rounded-full blur-2xl -z-10"></div>
                   <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl -z-10"></div>
                   
                   <div className="p-8 h-full flex flex-col justify-between text-white relative z-10">
                       <div>
                           <p className="text-emerald-100/80 text-sm font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-sm">{t("weather.realtime")}</p>
                           <div className="flex items-start gap-4 mb-2">
                               <h2 className="text-8xl font-mono tracking-tighter drop-shadow-xl" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>{Math.round(current.temperature_2m)}°</h2>
                               <span className="text-3xl pt-2 text-white/80 font-light hidden sm:block">{t("weather.celsius")}</span>
                           </div>
                           <div className="flex items-center gap-4 bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                               <Wind size={20} className="text-emerald-200" />
                               <p className="text-lg font-medium shadow-black drop-shadow-md">{t("weather.wind")}: {current.wind_speed_10m} km/h</p>
                           </div>
                       </div>
                       
                       <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] flex justify-center items-center opacity-90 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] pointer-events-none filter saturate-150">
                           {/* Using scale inside WeatherIcon parent for 3D emphasis */}
                           <div className="transform scale-[2.5]">
                               <WeatherIcon code={current.weather_code} />
                           </div>
                       </div>
                   </div>
                </div>

                {/* Soil Moisture Gauge (Realistic) */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden transform transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000"></div>
                    <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-4">{t("weather.soilLevel")}</p>
                    <div className="flex items-center justify-between mb-8">
                        <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-[0_8px_16px_rgba(37,99,235,0.4)] text-white group-hover:rotate-12 transition-transform duration-500">
                            <Droplet size={32} />
                        </div>
                        <h3 className="text-6xl font-bold font-mono text-stone-800 drop-shadow-sm flex items-start">
                            {Math.round((currentSoilMoisture || 0) * 100)}
                            <span className="text-3xl text-stone-400 font-normal mt-2 ml-1">%</span>
                        </h3>
                    </div>
                    {/* 3D Gauge Bar */}
                    <div className="relative w-full h-8 bg-stone-100/80 rounded-full p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] border border-stone-200/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((currentSoilMoisture || 0) * 100, 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-[0_2px_8px_rgba(37,99,235,0.5),_inset_0_-2px_4px_rgba(0,0,0,0.2)]"
                        >
                            {/* Glass highlight */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full"></div>
                        </motion.div>
                    </div>
                    <p className="text-xs text-right mt-3 text-stone-400 font-bold uppercase tracking-wider">{t("weather.optimalRange")}</p>
                </motion.div>
            </div>

            {/* Technical Agri-Metrics (3D Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { title: t("weather.humidity"), val: `${currentHumidity || '--'}%`, icon: <Wind size={24}/>, color: "from-blue-400 to-blue-600", light: "bg-blue-50 text-blue-600" },
                    { title: t("weather.evapo"), val: `${currentEvapo || 0}mm`, icon: <Sun size={24}/>, color: "from-orange-400 to-red-500", light: "bg-orange-50 text-orange-600" },
                    { title: t("weather.rain1h"), val: `${hourly.precipitation[currentHourIndex] || 0}mm`, icon: <CloudRain size={24}/>, color: "from-slate-400 to-slate-600", light: "bg-slate-50 text-slate-600" },
                    { title: t("weather.timezone"), val: weatherData.timezone, icon: <Calendar size={24}/>, color: "from-purple-400 to-purple-600", light: "bg-purple-50 text-purple-600" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 relative overflow-hidden group">
                        <div className={`p-4 rounded-xl shadow-inner ${stat.light} transition-all duration-300 group-hover:bg-gradient-to-br ${stat.color} group-hover:text-white group-hover:shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{stat.title}</p>
                            <p className="text-xl font-bold font-mono text-stone-800 truncate">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 7-Day Forecast (Smooth Carousel) */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-6 md:p-8 flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-stone-100 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <h3 className="font-bold text-xl mb-6 text-stone-800 flex items-center gap-3">
                    <Calendar size={20} className="text-emerald-600" />
                    {t("weather.forecast7d")}
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar px-2">
                    {daily.time.map((dateStr: string, idx: number) => (
                        <div key={dateStr} className="min-w-[130px] bg-gradient-to-b from-stone-50 to-white border border-stone-200/60 rounded-2xl p-5 flex flex-col items-center shrink-0 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="font-bold text-stone-800 mb-1 z-10">{getDayName(dateStr, idx)}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-4 z-10">{new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                            
                            <div className="scale-[0.8] origin-center mb-4 h-[70px] flex items-center justify-center filter drop-shadow-md group-hover:scale-100 group-hover:drop-shadow-xl transition-all duration-500 z-10">
                                <WeatherIcon code={daily.weather_code[idx]} />
                            </div>
                            
                            <div className="flex gap-3 justify-center text-sm font-bold font-mono mt-auto pt-3 border-t border-stone-200/50 w-full z-10">
                                <span className="text-stone-800 flex items-center"><TrendingUp size={12} className="text-orange-500 mr-0.5" />{Math.round(daily.temperature_2m_max[idx])}°</span>
                                <span className="text-stone-400 flex items-center"><TrendingDown size={12} className="text-blue-500 mr-0.5" />{Math.round(daily.temperature_2m_min[idx])}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/60 shadow-inner">
                <AlertCircle className="shrink-0 text-[#d97706] mt-0.5" size={16} />
                <p className="text-xs text-[#d97706] font-medium leading-relaxed">
                    {t("weather.disclaimer")}
                </p>
            </div>
        </div>
    );
};
