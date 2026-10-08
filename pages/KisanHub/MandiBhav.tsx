import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '../../lib/kisanUtils';
import { Loader2, MapPin, MapPinOff, Search, ChevronRight, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MandiData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  min_price: string;
  max_price: string;
  modal_price: string;
  arrival_date: string;
  lat?: number;
  lon?: number;
  distance?: number;
}

// Temporary Mock API to substitute Agmarknet Data Gov API if blocked by CORS
const mockFetchMandiData = async (): Promise<MandiData[]> => {
  // Try actual API
  try {
     const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000018d84e2cc0f0840705eafe3a506473454&format=json&limit=100`;
     const res = await fetch(url);
     const json = await res.json();
     if (json.records) {
        return json.records.map((r: any) => ({
           state: r.state,
           district: r.district,
           market: r.market,
           commodity: r.commodity,
           min_price: r.min_price,
           max_price: r.max_price,
           modal_price: r.modal_price,
           arrival_date: r.arrival_date,
           lat: 25.26 + (Math.random() - 0.5) * 4, 
           lon: 83.26 + (Math.random() - 0.5) * 4
        }));
     }
  } catch(e) {
     console.log("Mocking Agmarknet fallback");
  }

  // Fallback with a rich variety of vegetables and grains
  return [
    { state: 'UP', district: 'Chandauli', market: 'Chandauli Mandi', commodity: 'Wheat', min_price: '2100', max_price: '2300', modal_price: '2250', arrival_date: '2023-11-01', lat: 25.26, lon: 83.26 },
    { state: 'UP', district: 'Varanasi', market: 'Varanasi Pajawa', commodity: 'Paddy', min_price: '2000', max_price: '2200', modal_price: '2150', arrival_date: '2023-11-01', lat: 25.3176, lon: 82.9739 },
    { state: 'Rajasthan', district: 'Alwar', market: 'Alwar Mandi', commodity: 'Mustard', min_price: '4800', max_price: '5200', modal_price: '5000', arrival_date: '2023-11-01', lat: 27.5530, lon: 76.6346 },
    { state: 'UP', district: 'Mirzapur', market: 'Mirzapur City', commodity: 'Potato', min_price: '1200', max_price: '1500', modal_price: '1400', arrival_date: '2023-11-01', lat: 25.1481, lon: 82.5539 },
    { state: 'UP', district: 'Varanasi', market: 'Varanasi (F&V)', commodity: 'Tomato', min_price: '1800', max_price: '2400', modal_price: '2100', arrival_date: '2023-11-01', lat: 25.33, lon: 82.99 },
    { state: 'UP', district: 'Ghazipur', market: 'Ghazipur Mandi', commodity: 'Onion', min_price: '2500', max_price: '3200', modal_price: '3000', arrival_date: '2023-11-01', lat: 25.58, lon: 83.57 },
    { state: 'UP', district: 'Chandauli', market: 'Sakaldiha', commodity: 'Cabbage', min_price: '800', max_price: '1100', modal_price: '950', arrival_date: '2023-11-01', lat: 25.35, lon: 83.25 },
    { state: 'UP', district: 'Chandauli', market: 'Chakiya', commodity: 'Cauliflower', min_price: '1500', max_price: '2000', modal_price: '1800', arrival_date: '2023-11-01', lat: 25.05, lon: 83.21 },
    { state: 'Rajasthan', district: 'Alwar', market: 'Khairthal', commodity: 'Green Chilli', min_price: '3000', max_price: '4000', modal_price: '3500', arrival_date: '2023-11-01', lat: 27.93, lon: 76.64 },
    { state: 'Rajasthan', district: 'Alwar', market: 'Govindgarh', commodity: 'Brinjal', min_price: '1000', max_price: '1400', modal_price: '1200', arrival_date: '2023-11-01', lat: 27.50, lon: 76.99 },
    { state: 'UP', district: 'Varanasi', market: 'Varanasi(F&V)', commodity: 'Ginger', min_price: '8000', max_price: '10000', modal_price: '9000', arrival_date: '2023-11-01', lat: 25.29, lon: 83.01 },
    { state: 'UP', district: 'Mirzapur', market: 'Ahraura', commodity: 'Garlic', min_price: '12000', max_price: '15000', modal_price: '13500', arrival_date: '2023-11-01', lat: 25.02, lon: 83.02 },
    { state: 'UP', district: 'Ghazipur', market: 'Jangipur', commodity: 'Carrot', min_price: '1500', max_price: '2000', modal_price: '1750', arrival_date: '2023-11-01', lat: 25.68, lon: 83.59 },
    { state: 'Rajasthan', district: 'Jaipur', market: 'Chomu', commodity: 'Spinach', min_price: '600', max_price: '900', modal_price: '750', arrival_date: '2023-11-01', lat: 27.17, lon: 75.72 },
    { state: 'UP', district: 'Varanasi', market: 'Varanasi(F&V)', commodity: 'Bottle Gourd', min_price: '1200', max_price: '1600', modal_price: '1400', arrival_date: '2023-11-01', lat: 25.32, lon: 83.05 },
  ];
}

const UpdateView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const getCropIcon = (commodity: string) => {
  const c = commodity.toLowerCase();
  if (c.includes('wheat') || c.includes('barley') || c.includes('oat')) return '🌾';
  if (c.includes('paddy') || c.includes('rice')) return '🍚';
  if (c.includes('mustard') || c.includes('sunflower')) return '🌼';
  if (c.includes('potato')) return '🥔';
  if (c.includes('onion')) return '🧅';
  if (c.includes('tomato')) return '🍅';
  if (c.includes('apple')) return '🍎';
  if (c.includes('cotton')) return '☁️';
  if (c.includes('maize') || c.includes('corn')) return '🌽';
  if (c.includes('sugarcane')) return '🎋';
  if (c.includes('banana')) return '🍌';
  if (c.includes('mango')) return '🥭';
  if (c.includes('orange')) return '🍊';
  if (c.includes('grape')) return '🍇';
  if (c.includes('chickpea') || c.includes('gram') || c.includes('lentil') || c.includes('dal')) return '🍲';
  if (c.includes('cabbage')) return '🥬';
  if (c.includes('cauliflower')) return '🥦';
  if (c.includes('chilli')) return '🌶️';
  if (c.includes('brinjal')) return '🍆';
  if (c.includes('ginger')) return '🧂';
  if (c.includes('garlic')) return '🧄';
  if (c.includes('carrot')) return '🥕';
  if (c.includes('spinach')) return '🌿';
  if (c.includes('gourd')) return '🥒';
  return '🌱';
}

const mandiMapping: Record<string, Record<string, string[]>> = {
  "Uttar Pradesh": {
    "Agra": ["Agra", "Fatehabad", "Kheragarh", "Achnera", "Jagnair", "Khairagarh"],
    "Aligarh": ["Aligarh", "Khair", "Atrauli", "Chharra"],
    "Allahabad": ["Allahabad", "Sirsa", "Phulpur"],
    "Ambedkar Nagar": ["Akbarpur", "Tanda"],
    "Amethi": ["Jais", "Gauriganj"],
    "Amroha": ["Amroha", "Hasanpur", "Dhanaura"],
    "Auraiya": ["Auraiya", "Dibiyapur"],
    "Azamgarh": ["Azamgarh"],
    "Badaun": ["Badaun", "Ujhani", "Sahaswan", "Bilsi", "Islamnagar"],
    "Baghpat": ["Baghpat", "Baraut", "Khekara"],
    "Bahraich": ["Bahraich", "Nanpara", "Risia", "Mihipurwa"],
    "Ballia": ["Ballia", "Rasra", "Belthara Road"],
    "Balrampur": ["Balrampur", "Tulsipur", "Utraula"],
    "Banda": ["Banda", "Atarra", "Baberu"],
    "Barabanki": ["Barabanki", "Rudauli", "Safdarganj", "Ramnagar"],
    "Bareilly": ["Bareilly", "Aonla", "Baheri", "Faridpur", "Nawabganj"],
    "Basti": ["Basti"],
    "Bijnor": ["Bijnor", "Chandpur", "Dhampur", "Haldaur", "Kiratpur", "Nagina", "Najibabad"],
    "Bulandshahar": ["Bulandshahar", "Khurja", "Sikandrabad", " शिकारपुर", "Syana", "Gulaothi", "Jahangirabad"],
    "Chandauli": ["Chandauli", "Sakaldiha", "Chakiya"],
    "Etwah": ["Etawah", "Bharthana", "Jaswantnagar"],
    "Farrukhabad": ["Farrukhabad", "Kaimganj"],
    "Fatehpur": ["Fatehpur", "Bindki", "Khaga"],
    "Firozabad": ["Firozabad", "Shikohabad", "Tundla", "Sirsaganj"],
    "Gautam Budh Nagar": ["Dankaur", "Noida", "Jewar"],
    "Ghaziabad": ["Ghaziabad", "Muradnagar", "Modinagar", "Hapur", "Garh Mukteshwar"],
    "Ghazipur": ["Ghazipur", "Jangipur", "Zamania"],
    "Gonda": ["Gonda", "Kargel", "Nawabganj"],
    "Gorakhpur": ["Gorakhpur", "Chauri Chaura", "Sahjanwa"],
    "Hardoi": ["Hardoi", "Sandila", "Shahabad", "Madhoganj"],
    "Hathras": ["Hathras", "Sadabad", "Sikandra Rao"],
    "Jalaun": ["Orai", "Jalaun", "Kaunch", "Kalpi"],
    "Jaunpur": ["Jaunpur", "Shahganj", "Mungra Badshahpur"],
    "Jhansi": ["Jhansi", "Moth", "Mauranipur", "Chirgaon", "Gursarai"],
    "Kannauj": ["Kannauj", "Chhibramau", "Tirwa"],
    "Kanpur": ["Kanpur", "Choubeypur"],
    "Kanpur Dehat": ["Rura", "Jhinjhak", "Pukhrayan"],
    "Kasganj": ["Kasganj", "Soron", "Ganjdundwara"],
    "Kaushambi": ["Bharwari", "Ajhuwa", "Manjhanpur"],
    "Kushinagar": ["Padrauna", "Hata"],
    "Lakhimpur Kheri": ["Lakhimpur", "Gola Gokarannath", "Palia", "Tikonia", "Bhira", "Mohammadi"],
    "Lalitpur": ["Lalitpur", "Mahroni"],
    "Lucknow": ["Lucknow", "Malihabad", "Itaunja"],
    "Maharajganj": ["Maharajganj", "Nautanwa", "Anandnagar", "Nichlaul", "Partawal"],
    "Mainpuri": ["Mainpuri", "Bhongaon", "Bewar", "Karhal", "Ghiror"],
    "Mathura": ["Mathura", "Kosi Kalan", "Chhata"],
    "Mau": ["Mau", "Kopaganj"],
    "Meerut": ["Meerut", "Mawana", "Sardhana"],
    "Mirzapur": ["Mirzapur", "Ahraura", "Chunar"],
    "Moradabad": ["Moradabad", "Sambhal", "Chandausi", "Bahjoi"],
    "Muzaffarnagar": ["Muzaffarnagar", "Khatouli", "Shahpur", "Shamli", "Kairana", "Thana Bhawan"],
    "Pilibhit": ["Pilibhit", "Bisalpur", "Puranpur"],
    "Pratapgarh": ["Pratapgarh"],
    "Prayagraj": ["Allahabad"],
    "Raebareli": ["Raebareli"],
    "Rampur": ["Rampur", "Bilaspur", "Milak", "Shahabad"],
    "Saharanpur": ["Saharanpur", "Deoband", "Gangoh", "Nakur", "Nanauta", "Rampur Maniharan", "Chilkana"],
    "Sambhal": ["Sambhal", "Chandausi"],
    "Sant Kabir Nagar": ["Khalilabad"],
    "Shahjahanpur": ["Shahjahanpur", "Tilhar", "Jalalabad", "Powayan", "Puwayan", "Banda"],
    "Shamli": ["Shamli"],
    "Shravasti": ["Payagpur", "Bhinga", "Ikauna"],
    "Siddharthnagar": ["Naugarh", "Barhani", "Shohratgarh"],
    "Sitapur": ["Sitapur", "Mahmudabad", "Biswan", "Rampur Mathura", "Laharpur", "Viswan"],
    "Sonbhadra": ["Robertsganj"],
    "Sultanpur": ["Sultanpur"],
    "Unnao": ["Unnao", "Bangarmau", "Purwa"],
    "Varanasi": ["Varanasi", "Varanasi(F&V)", "Varanasi(Grain)"]
  },
  "Rajasthan": {
    "Ajmer": ["Ajmer", "Beawar", "Kekri", "Vijaynagar", "Madanganj Kishangarh", "Bijaynagar"],
    "Alwar": ["Alwar", "Govindgarh", "Khairthal", "Kherli", "Barodamev", "Behror", "Rajgarh", "Laxmangarh", "Mandawar"],
    "Banswara": ["Banswara", "Kushalgarh", "Partapur"],
    "Baran": ["Baran", "Chhabra", "Anta", "Atru", "Kawai", "Chhipabarod"],
    "Barmer": ["Barmer", "Balotra", "Dhorimanna"],
    "Bharatpur": ["Bharatpur", "Bayana", "Deeg", "Kumher", "Nadbai", "Kaman", "Roopbas", "Nagar", "Weir"],
    "Bhilwara": ["Bhilwara", "Asind", "Mandalgarh", "Gulabpura"],
    "Bikaner": ["Bikaner", "Nokha", "Lunkaransar", "Khajuwala", "Sri Dungargarh"],
    "Bundi": ["Bundi", "Nainwa", "K.Patan", "Dei", "Sumerganjmandi", "Kapren"],
    "Chittorgarh": ["Chittorgarh", "Nimbahera", "Kapasan", "Pratapgarh", "Bassi", "Fatehnagar", "Badi Sadri", "Chhoti Sadri"],
    "Churu": ["Churu", "Sujangarh", "Ratangarh", "Sadulpur", "Sardarshahar", "Bidasar"],
    "Dausa": ["Dausa", "Bandikui", "Lalsot", "Mahuwa", "Mandawari", "Sikrai"],
    "Dholpur": ["Dholpur", "Bari"],
    "Hanumangarh": ["Hanumangarh", "Hanumangarh Town", "Bhadra", "Nohar", "Sangaria", "Pilibanga", "Rawatsar", "Goluwala"],
    "Jaipur": ["Jaipur", "Chomu", "Shahpura", "Chaksu", "Kotputli", "Phulera", "Kishangarh Renwal", "Bassi", "Kukarkheda"],
    "Jalor": ["Jalore", "Bhinmal", "Sanchore"],
    "Jhalawar": ["Jhalawar", "Bhawanimandi", "Khanpur", "Pachpahar", "Aklera", "Pirawa", "Manohar Thana"],
    "Jhunjhunu": ["Jhunjhunu", "Chirawa", "Surajgarh"],
    "Jodhpur": ["Jodhpur", "Bilara", "Phalodi", "Bhopalgarh"],
    "Karauli": ["Karauli", "Hindauncity", "Todabhim"],
    "Kota": ["Kota", "Itawa", "Ramganj Mandi", "Sangod", "Sultanpur", "Suket"],
    "Nagaur": ["Nagaur", "Merta City", "Degana", "Makrana", "Kuchamancity", "Deedwana", "Nawa", "Jayal"],
    "Pali": ["Pali", "Sumerpur", "Sojat Road", "Rani", "Marwar Junction"],
    "Rajsamand": ["Rajsamand", "Railmagra", "Nathdwara"],
    "Sawai Madhopur": ["Sawai Madhopur", "Gangapur City", "Bonli", "Bamanwas", "Khandar"],
    "Sikar": ["Sikar", "Fatehpur", "Sri Madhopur", "Nawalgarh", "Neem ka Thana", "Khandela", "Ringus"],
    "Sirohi": ["Sirohi", "Sheoganj", "Abu Road", "Swaroopganj"],
    "Sri Ganganagar": ["Sri Ganganagar", "Suratgarh", "Padampur", "Karanpur", "Raisinghnagar", "Garsana", "Anupgarh", "Sadulshahar", "Sriganganagar (F&V)", "Bijaynagar", "Jaitsar", "Rawla"],
    "Tonk": ["Tonk", "Niwai", "Malpura", "Deoli", "Uniara", "Todaraisingh"],
    "Udaipur": ["Udaipur", "Fatehnagar", "Kherwara"]
  },
  "Madhya Pradesh": {
    "Alirajpur": ["Alirajpur", "Jobat"],
    "Anuppur": ["Anuppur", "Kotma", "Pushprajgarh"],
    "Ashok Nagar": ["Ashoknagar", "Mungaoli", "Chanderi", "Pipariya"],
    "Balaghat": ["Balaghat", "Waraseoni", "Katangi", "Lanji"],
    "Barwani": ["Barwani", "Sendhwa", "Khetia", "Balsamud"],
    "Betul": ["Betul", "Multai", "Bhainsdehi"],
    "Bhind": ["Bhind", "Gohad", "Lahar"],
    "Bhopal": ["Bhopal", "Berasia"],
    "Burhanpur": ["Burhanpur"],
    "Chhatarpur": ["Chhatarpur", "Nowgong", "Harpalpur", "Rajnagar"],
    "Chhindwara": ["Chhindwara", "Saunsar", "Pandhurna", "Chourai", "Amarwara", "Bichhua"],
    "Damoh": ["Damoh", "Hatta", "Patharia"],
    "Datia": ["Datia", "Seondha", "Bhander"],
    "Dewas": ["Dewas", "Khategaon", "Bagli", "Kannod", "Tonk Khurd", "Sonkatch", "Hatpipliya"],
    "Dhar": ["Dhar", "Badnawar", "Manawar", "Rajgarh", "Dhamnod", "Kukshi", "Gandhwani"],
    "Dindori": ["Dindori", "Shahpura"],
    "Guna": ["Guna", "Kumbhraj", "Binaganj", "Aron"],
    "Gwalior": ["Gwalior", "Dabra", "Bhitarwar", "Lashkar"],
    "Harda": ["Harda", "Timarni", "Khirkiya"],
    "Hoshangabad": ["Hoshangabad", "Itarsi", "Pipariya", "Banapura", "Seoni Malwa", "Babai"],
    "Indore": ["Indore", "Mhow", "Sanwer", "Gautampura"],
    "Jabalpur": ["Jabalpur", "Sihora", "Shahpura (Bhitoni)", "Patan"],
    "Jhabua": ["Jhabua", "Thandla", "Petlawad"],
    "Katni": ["Katni", "Vijayraghavgarh"],
    "Khandwa": ["Khandwa", "Pandhana"],
    "Khargone": ["Khargone", "Bhikangaon", "Sanaawad", "Barwaha", "Kasrawad", "Karahi"],
    "Mandla": ["Mandla", "Nainpur", "Bamhani Banjar"],
    "Mandsaur": ["Mandsaur", "Shamgarh", "Garoth", "Bhanpura", "Sita Mau", "Suwasra", "Narayangarh"],
    "Morena": ["Morena", "Joura", "Porsa", "Ambah", "Sabalgarh", "Kailaras"],
    "Narsinghpur": ["Narsinghpur", "Gadarwara", "Gotegaon", "Kareli", "Tendukheda"],
    "Neemuch": ["Neemuch", "Manasa", "Jawad"],
    "Panna": ["Panna", "Ajaygarh"],
    "Raisen": ["Raisen", "Bareli", "Obaidullaganj", "Udaipura", "Silwani", "Gairatganj", "Sanchi", "Begamganj"],
    "Rajgarh": ["Rajgarh", "Pachore", "Biaora", "Sarangpur", "Narsinghgarh", "Kurawar", "Jeerapur", "Machalpur"],
    "Ratlam": ["Ratlam", "Jaora", "Alot", "Sailana", "Piploda", "Tal"],
    "Rewa": ["Rewa", "Chakghat", "Teonthar"],
    "Sagar": ["Sagar", "Khurai", "Bina", "Deori", "Rehli", "Banda", "Garhakota"],
    "Satna": ["Satna", "Maihar"],
    "Sehore": ["Sehore", "Ashta", "Shujalpur", "Ichhawar", "Nasrullaganj", "Rehti"],
    "Seoni": ["Seoni", "Chhapara", "Keolari"],
    "Shahdol": ["Shahdol", "Beohari"],
    "Shajapur": ["Shajapur", "Shujalpur", "Kalapipal", "Akodia", "Agar", "Susner", "Nalkheda", "Polaykalan"],
    "Sheopur": ["Sheopur Barod", "Vijeypur"],
    "Shivpuri": ["Shivpuri", "Kolaras", "Karera", "Pohari", "Pichhore", "Khaniyadhana"],
    "Sidhi": ["Sidhi", "Waidhan"],
    "Singrauli": ["Singrauli"],
    "Tikamgarh": ["Tikamgarh", "Niwari", "Prithvipur", "Jatara", "Khargapur", "Palera"],
    "Ujjain": ["Ujjain", "Badnagar", "Khachrod", "Mahidpur", "Tarana", "Unhel"],
    "Umaria": ["Umaria", "Chandiia"],
    "Vidisha": ["Vidisha", "Basoda", "Sironj", "Kurwai", "Shamshabad", "Lateri", "Gulabganj"]
  },
  "Maharashtra": {
    "Ahmednagar": ["Ahmednagar", "Kopargaon", "Rahuri", "Sangamner", "Shrirampur", "Rahata", "Nevasa", "Pathardi", "Shevgaon", "Karjat", "Parner", "Jamkhed", "Shrigonda"],
    "Akola": ["Akola", "Akot", "Telhara", "Murtizapur", "Patur", "Barsi Takli"],
    "Amravati": ["Amravati", "Morshi", "Warud", "Achalpur", "Daryapur", "Anjangaon", "Chandur Bazar", "Dharni", "Teosa"],
    "Aurangabad": ["Aurangabad", "Paithan", "Vaijapur", "Gangapur", "Sillod", "Lasur Station", "Kannad"],
    "Beed": ["Beed", "Majalgaon", "Ashti", "Gevrai", "Kaij", "Parli-Vaijnath"],
    "Bhandara": ["Bhandara", "Tumsar"],
    "Buldhana": ["Buldhana", "Khamgaon", "Malkapur", "Nandura", "Jalgaon Jamod", "Mehkar", "Chikhli", "Sadak Arjuni", "Shegaon", "Deulgaon Raja", "Sindkhed Raja"],
    "Chandrapur": ["Chandrapur", "Bramhapuri", "Chimur", "Mul", "Nagbhid", "Rajura", "Bhadravati", "Gondpimpri", "Sindewahi"],
    "Dhule": ["Dhule", "Shirpur", "Dondaicha", "Sakri"],
    "Gadchiroli": ["Gadchiroli", "Aheri", "Chamorshi", "Desaiganj", "Armori"],
    "Gondia": ["Gondia", "Tirora", "Arjuni Morgaon", "Amgaon"],
    "Hingoli": ["Hingoli", "Kalamnuri", "Sengaon", "Basmath", "Vasmat"],
    "Jalgaon": ["Jalgaon", "Amalner", "Bhusawal", "Chopda", "Raver", "Pachora", "Jamner", "Yawal", "Dharangaon", "Parola", "Bodwad", "Chalisgaon"],
    "Jalna": ["Jalna", "Ambad", "Bhokardan", "Partur", "Mantha"],
    "Kolhapur": ["Kolhapur", "Jayasingpur", "Gadhinglaj", "Vadgaon", "Panhala", "Kagal", "Hatkanangale", "Kurundwad"],
    "Latur": ["Latur", "Udgir", "Ahmedpur", "Ausa", "Murud", "Nilanga", "Devni"],
    "Mumbai": ["Mumbai"],
    "Nagpur": ["Nagpur", "Kamthi", "Kalmeshwar", "Savner", "Hingna", "Umred", "Katol", "Ramtek", "Narkhed"],
    "Nanded": ["Nanded", "Loha", "Kinwat", "Bhokar", "Mukhed", "Naigaon", "Deglur", "Dharmabad", "Biloli", "Mudkhed"],
    "Nandurbar": ["Nandurbar", "Shahada", "Navapur"],
    "Nashik": ["Nashik", "Lasalgaon", "Malegaon", "Niphad", "Pimpalgaon Baswant", "Satana", "Sinnar", "Yeola", "Chandvad", "Deola", "Dindori", "Kalvan", "Manmad", "Nampur", "Umarane", "Vani"],
    "Osmanabad": ["Osmanabad", "Kallam", "Omerga", "Tuljapur", "Murum", "Paranda"],
    "Palghar": ["Palghar", "Dahanu", "Vasai"],
    "Parbhani": ["Parbhani", "Gangakhed", "Jintur", "Sailu", "Pathri", "Manwath", "Sonpeth"],
    "Pune": ["Pune", "Baramati", "Indapur", "Junnar", "Khed", "Shirur", "Bhor"],
    "Raigad": ["Alibag", "Panvel", "Roha", "Mangaon", "Murud", "Karjat", "Pen", "Mahad"],
    "Ratnagiri": ["Ratnagiri", "Chiplun"],
    "Sangli": ["Sangli", "Tasgaon", "Islampur", "Palus", "Miraj", "Vita", "Atpadi", "Shirala"],
    "Satara": ["Satara", "Karad", "Phaltan", "Wai", "Koregaon", "Lonavata"],
    "Sindhudurg": ["Sindhudurg", "Kudal"],
    "Solapur": ["Solapur", "Pandharpur", "Barshi", "Akluj", "Kurduwadi", "Sangola", "Mangalwedha", "Karmala", "Mohol", "Akkalkot"],
    "Thane": ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur"],
    "Wardha": ["Wardha", "Hinganghat", "Arvi", "Pulgaon", "Samudrapur"],
    "Washim": ["Washim", "Karanja", "Mangrulpir", "Risod", "Malegaon (Washim)"],
    "Yavatmal": ["Yavatmal", "Pusad", "Wani", "Umarkhed", "Digras", "Darwha", "Pandharkawada", "Ghatanji", "Arni", "Babhulgaon", "Ner", "Ralegaon", "Zari Jamni"]
  },
  "Punjab": {
    "Abohar": ["Abohar"],
    "Amritsar": ["Amritsar", "Tarn Taran", "Rayya", "Majitha", "Ajnala"],
    "Barnala": ["Barnala", "Tapa", "Bhadaur"],
    "Bathinda": ["Bathinda", "Rampura Phul", "Mauri", "Raman", "Bhagat Bhai Ka", "Goniana"],
    "Faridkot": ["Faridkot", "Kotkapura", "Jaitu"],
    "Fatehgarh Sahib": ["Sirhind", "Amloh", "Khamano", "Bassi Pathana"],
    "Fazilka": ["Fazilka", "Jalalalbad", "Abohar"],
    "Ferozepur": ["Ferozepur", "Zira", "Guru Har Sahai", "Makhu", "Talwandi Bhai", "Mallanwala"],
    "Gurdaspur": ["Gurdaspur", "Batala", "Dhariwal", "Dinanagar", "Qadian"],
    "Hoshiarpur": ["Hoshiarpur", "Dasuya", "Mukerian", "Garhshankar", "Tanda Urmur"],
    "Jalandhar": ["Jalandhar", "Nakodar", "Phillaur", "Shahkot", "Nurmahal", "Adampur", "Bhogpur"],
    "Kapurthala": ["Kapurthala", "Phagwara", "Sultanpur Lodhi"],
    "Ludhiana": ["Ludhiana", "Khanna", "Jagraon", "Samrala", "Raikot", "Doraha", "Sahnewal", "Mullanpur", "Machiwara"],
    "Mansa": ["Mansa", "Budhlada", "Sardulgarh"],
    "Moga": ["Moga", "Nihal Singh Wala", "Dharamkot", "Bagha Purana"],
    "Muktsar": ["Muktsar", "Malout", "Gidderbaha"],
    "Nawanshahr": ["Nawanshahr", "Banga", "Balachaur"],
    "Pathankot": ["Pathankot"],
    "Patiala": ["Patiala", "Nabha", "Rajpura", "Samana", "Patran", "Sanaur"],
    "Rupnagar": ["Rupnagar", "Anandpur Sahib", "Chamkaur Sahib", "Morinda"],
    "Sangrur": ["Sangrur", "Malerkotla", "Sunam", "Amargarh", "Dhuri", "Lehragaga", "Moonak"],
    "Mohali": ["Kharar", "Kurali", "Derabassi", "Banur", "Lalru"],
    "Tarn Taran": ["Tarn Taran", "Patti", "Bhikhiwind", "Khadur Sahib"]
  },
  "Haryana": {
    "Ambala": ["Ambala Cantt.", "Ambala City", "Naraingarh", "Shahabad"],
    "Bhiwani": ["Bhiwani", "Siwani", "Charkhi Dadri", "Tosham"],
    "Charkhi Dadri": ["Charkhi Dadri"],
    "Faridabad": ["Faridabad", "Ballabhgarh", "Palwal", "Hodal"],
    "Fatehabad": ["Fatehabad", "Tohana", "Ratia"],
    "Gurgaon": ["Gurgaon", "Pataudi", "Farukhnagar", "Sohna"],
    "Hisar": ["Hisar", "Hansi", "Barwala", "Uklana", "Narnaund", "Adampur"],
    "Jhajjar": ["Jhajjar", "Bahadurgarh"],
    "Jind": ["Jind", "Narwana", "Safidon", "Julana"],
    "Kaithal": ["Kaithal", "Pundri", "Cheeka", "Kalayat"],
    "Karnal": ["Karnal", "Gharaunda", "Assandh", "Indri", "Taraori", "Nissing"],
    "Kurukshetra": ["Kurukshetra(Pipli)", "Pehowa", "Ladwa", "Shahbad"],
    "Mahendragarh": ["Narnaul", "Mahendragarh", "Ateli"],
    "Mewat": ["Nuh", "Ferozepur Jhirka"],
    "Palwal": ["Palwal", "Hodal", "Hassanpur"],
    "Panchkula": ["Panchkula", "Barwala"],
    "Panipat": ["Panipat", "Samalkha"],
    "Rewari": ["Rewari", "Bawal", "Kosli"],
    "Rohtak": ["Rohtak", "Meham", "Sampla"],
    "Sirsa": ["Sirsa", "Kalanwali", "Dabwali", "Ellenabad", "Rania"],
    "Sonipat": ["Sonipat", "Gohana", "Ganaur", "Kharkhoda"],
    "Yamunanagar": ["Yamunanagar", "Jagadhri", "Radaur", "Chhachhrauli", "Sadhaura"]
  },
  "Gujarat": {
    "Ahmedabad": ["Ahmedabad", "Bavla", "Dholka", "Sanand", "Dehgam"],
    "Amreli": ["Amreli", "Savarkundla", "Rajula", "Dhari"],
    "Anand": ["Anand", "Borsad", "Petlad", "Khambhat", "Umreth"],
    "Aravalli": ["Modasa", "Dhansura", "Bhiloda", "Meghraj"],
    "Banaskantha": ["Palanpur", "Deesa", "Tharad", "Dhanera", "Bhabhar", "Deodar"],
    "Bharuch": ["Bharuch", "Jambusar", "Ankleshwar"],
    "Bhavnagar": ["Bhavnagar", "Mahuva", "Talaja", "Palitana"],
    "Botad": ["Botad"],
    "Chhotaudepur": ["Bodeli", "Chhota Udepur"],
    "Dahod": ["Dahod", "Zalod", "Devgadhbaria"],
    "Dang": ["Ahwa"],
    "Devbhumi Dwarka": ["Khambhalia", "Kalyanpur"],
    "Gandhinagar": ["Gandhinagar", "Dehgam", "Kalol", "Mansa"],
    "Gir Somnath": ["Una", "Kodinar", "Talala", "Veraval"],
    "Jamnagar": ["Jamnagar", "Dhrol", "Jamjodhpur", "Kalavad"],
    "Junagadh": ["Junagadh", "Keshod", "Manavadar", "Mangrol", "Visavadar"],
    "Kheda": ["Nadiad", "Kapadvanj", "Kathlal", "Mahudha", "Thasra"],
    "Kachchh": ["Bhuj", "Anjar", "Rapar", "Mandvi"],
    "Mahisagar": ["Lunawada", "Santrampur"],
    "Mehsana": ["Mehsana", "Unjha", "Visnagar", "Kadi", "Vijapur"],
    "Morbi": ["Morbi", "Halvad", "Wankaner"],
    "Narmada": ["Rajpipla"],
    "Navsari": ["Navsari", "Bilimora"],
    "Panchmahal": ["Godhra", "Halol", "Ghoghamba"],
    "Patan": ["Patan", "Sidhpur", "Radhanpur", "Harij"],
    "Porbandar": ["Porbandar"],
    "Rajkot": ["Rajkot", "Gondal", "Jasdan", "Dhoraji", "Upleta", "Jetpur"],
    "Sabarkantha": ["Himmatnagar", "Idar", "Prantij", "Khedbrahma"],
    "Surat": ["Surat", "Vyara", "Bardoli"],
    "Surendranagar": ["Surendranagar", "Dhrangadhra", "Halvad", "Limbdi", "Thangadh", "Wadhwan"],
    "Tapi": ["Vyara", "Valod", "Nizar"],
    "Vadodara": ["Vadodara", "Padra", "Savli", "Karjan", "Dabhoi"]
  },
  "Bihar": {
    "Araria": ["Araria", "Forbesganj"],
    "Arwal": ["Arwal"],
    "Aurangabad": ["Aurangabad", "Dawoodnagar"],
    "Banka": ["Banka"],
    "Begusarai": ["Begusarai", "Bakhri"],
    "Bhagalpur": ["Bhagalpur", "Naugachia"],
    "Bhojpur": ["Arrah", "Piro", "Bihiya"],
    "Buxar": ["Buxar", "Dumraon"],
    "Darbhanga": ["Darbhanga", "Benipur"],
    "East Champaran": ["Motihari", "Raxaul", "Sugauli"],
    "Gaya": ["Gaya", "Sherghati", "Tekari"],
    "Gopalganj": ["Gopalganj", "Mirganj"],
    "Jamui": ["Jamui"],
    "Jehanabad": ["Jehanabad"],
    "Kaimur": ["Bhabhua", "Mohania"],
    "Katihar": ["Katihar", "Barari"],
    "Khagaria": ["Khagaria", "Chautham"],
    "Kishanganj": ["Kishanganj"],
    "Lakhisarai": ["Lakhisarai"],
    "Madhepura": ["Madhepura"],
    "Madhubani": ["Madhubani", "Jhanjharpur"],
    "Munger": ["Munger", "Jamalpur"],
    "Muzaffarpur": ["Muzaffarpur", "Motipur"],
    "Nalanda": ["Bihar Sharif", "Rajgir"],
    "Nawada": ["Nawada"],
    "Patna": ["Patna", "Danapur", "Mokama", "Barh", "Masaurhi"],
    "Purnia": ["Purnia", "Banmankhi"],
    "Rohtas": ["Sasaram", "Dehri", "Kochas", "Bikramganj"],
    "Saharsa": ["Saharsa", "Simri Bakhtiarpur"],
    "Samastipur": ["Samastipur", "Dalsinghsarai", "Rosera"],
    "Saran": ["Chhapra", "Sonepur"],
    "Sheikhpura": ["Sheikhpura", "Barbigha"],
    "Sheohar": ["Sheohar"],
    "Sitamarhi": ["Sitamarhi", "Pupri"],
    "Siwan": ["Siwan", "Maharajganj"],
    "Supaul": ["Supaul", "Triveniganj"],
    "Vaishali": ["Hajipur", "Mahnar"],
    "West Champaran": ["Bettiah", "Narkatiaganj"]
  },
  "Andhra Pradesh": {
    "Anantapur": ["Anantapur", "Hindupur", "Kadiri", "Tadipatri", "Guntakal", "Dharmavaram", "Rayadurg", "Kalyandurg"],
    "Chittoor": ["Chittoor", "Tirupati", "Madanapalle"],
    "East Godavari": ["Rajahmundry", "Kakinada", "Amalapuram"],
    "Guntur": ["Guntur", "Tenali", "Narasaraopet"],
    "Krishna": ["Vijayawada", "Machilipatnam", "Gudivada"],
    "Kurnool": ["Kurnool", "Adoni", "Nandyal", "Yemmiganur"],
    "Prakasam": ["Ongole", "Chirala", "Markapur"],
    "SPSR Nellore": ["Nellore", "Kavali", "Gudur"],
    "Srikakulam": ["Srikakulam", "Amadalavalasa"],
    "Visakhapatnam": ["Visakhapatnam", "Anakapalle", "Gajuwaka"],
    "Vizianagaram": ["Vizianagaram", "Bobbili", "Parvathipuram"],
    "West Godavari": ["Eluru", "Bhimavaram", "Tadepalligudem"],
    "Y.S.R. Kadapa": ["Kadapa", "Proddatur", "Pulivendula", "Rajampet"]
  },
  "Chhattisgarh": {
    "Raipur": ["Raipur", "Abhanpur", "Rajim", "Arang"],
    "Bilaspur": ["Bilaspur", "Takhatpur", "Kota", "Pendra Road"],
    "Durg": ["Durg", "Bhilai", "Balod"],
    "Rajnandgaon": ["Rajnandgaon", "Khairagarh", "Dongargarh"],
    "Bastar": ["Jagdalpur", "Kondagaon", "Kanker"],
    "Sarguja": ["Ambikapur", "Sitapur", "Surajpur"],
    "Raigarh": ["Raigarh", "Sarangarh", "Kharsia", "Dharamjaigarh"],
    "Korba": ["Korba", "Katghora"],
    "Janjgir-Champa": ["Janjgir", "Champa", "Sakti"],
    "Mahasamund": ["Mahasamund", "Bagbahara", "Saraipali", "Basna"],
    "Kawardha": ["Kawardha", "Pandariya"]
  },
  "Jharkhand": {
    "Ranchi": ["Ranchi", "Kanke", "Mandar"],
    "East Singhbhum": ["Jamshedpur", "Ghatshila"],
    "Dhanbad": ["Dhanbad"],
    "Bokaro": ["Bokaro", "Chas"],
    "Deoghar": ["Deoghar", "Madhupur"],
    "Palamu": ["Daltonganj", "Husainabad"],
    "Hazaribagh": ["Hazaribagh"],
    "Giridih": ["Giridih", "Dumri"],
    "Dumka": ["Dumka"],
    "Godda": ["Godda"],
    "Garhwa": ["Garhwa"]
  },
  "Karnataka": {
    "Bengaluru": ["Bengaluru", "Yeshwanthpur", "Ramanagara"],
    "Mysuru": ["Mysuru", "Nanjangud", "T. Narasipura", "Hunsur", "K.R. Nagar"],
    "Hubballi": ["Hubballi", "Dharwad"],
    "Belagavi": ["Belagavi", "Bailhongal", "Athani", "Gokak", "Nippani"],
    "Kalaburagi": ["Kalaburagi", "Aland", "Afzalpur", "Chittapur"],
    "Vijayapura": ["Vijayapura", "Basavana Bagevadi", "Sindagi"],
    "Raichur": ["Raichur", "Manvi", "Sindhanur", "Lingasugur"],
    "Ballari": ["Ballari", "Hosapete", "Siruguppa"],
    "Tumakuru": ["Tumakuru", "Tiptur", "Madhugiri"],
    "Hassan": ["Hassan", "Koppal", "Gangavathi"],
    "Davanagere": ["Davanagere", "Harihara"],
    "Shivmogga": ["Shivamogga", "Sagar", "Bhadravati"]
  },
  "Telangana": {
    "Hyderabad": ["Bowenpally", "Gudimalkapur", "L.B. Nagar", "Secunderabad"],
    "Nizamabad": ["Nizamabad", "Kamareddy", "Bodhan", "Armoor"],
    "Warangal": ["Warangal", "Jangaon", "Mahabubabad", "Narsampet", "Parkal"],
    "Karimnagar": ["Karimnagar", "Jagtial", "Vemulawada", "Koratla"],
    "Khammam": ["Khammam", "Madhira", "Kothagudem"],
    "Mahabubnagar": ["Mahabubnagar", "Jadcherla", "Nagarkurnool", "Narayanpet"],
    "Medak": ["Medak", "Siddipet", "Zahirabad", "Sangareddy"],
    "Nalgonda": ["Nalgonda", "Suryapet", "Bhongir", "Miryalaguda", "Devarakonda"],
    "Adilabad": ["Adilabad", "Nirmal", "Bhainsa", "Mancherial"]
  },
  "Odisha": {
    "Khurda": ["Bhubaneswar", "Jatani"],
    "Cuttack": ["Cuttack", "Salepur"],
    "Ganjam": ["Berhampur", "Bhanjanagar", "Hinjilicut"],
    "Balasore": ["Balasore", "Jaleswar"],
    "Bargarh": ["Bargarh", "Attabira", "Padampur"],
    "Bolangir": ["Bolangir", "Kantabanji", "Titlagarh"],
    "Sambalpur": ["Sambalpur", "Kuchinda"],
    "Mayurbhanj": ["Baripada", "Rairangpur"],
    "Koraput": ["Koraput", "Jeypore"],
    "Rayagada": ["Rayagada", "Gunupur"],
    "Kalahandi": ["Bhawanipatna", "Junagarh"]
  },
  "Tamil Nadu": {
    "Chennai": ["Koyambedu", "Thiruvallur", "Kancheepuram"],
    "Coimbatore": ["Coimbatore", "Pollachi", "Mettupalayam", "Tiruppur"],
    "Madurai": ["Madurai", "Usilampatti", "Melur"],
    "Trichy": ["Tiruchirappalli", "Manapparai", "Lalgudi"],
    "Erode": ["Erode", "Gobi", "Perundurai", "Bhavani"],
    "Salem": ["Salem", "Attur"],
    "Namakkal": ["Namakkal", "Rasipuram", "Thiruchengode"],
    "Dharmapuri": ["Dharmapuri"],
    "Vellore": ["Vellore", "Tirupattur", "Ranipet"],
    "Tirunelveli": ["Tirunelveli", "Tenkasi"],
    "Virudhunagar": ["Virudhunagar", "Rajapalayam", "Sivakasi"]
  },
  "West Bengal": {
    "Kolkata": ["Kolkata", "Howrah", "Sealdah"],
    "Darjeeling": ["Siliguri", "Darjeeling"],
    "Hooghly": ["Singur", "Tarakeswar", "Arambagh", "Chinsurah"],
    "Burdwan": ["Burdwan", "Kalna", "Katwa", "Asansol"],
    "Nadia": ["Krishnanagar", "Ranaghat", "Chakdaha"],
    "North 24 Parganas": ["Barasat", "Bongaon", "Basirhat", "Habra"],
    "South 24 Parganas": ["Baruipur", "Diamond Harbour", "Canning"],
    "Murshidabad": ["Berhampore", "Jiaganj", "Kandi"],
    "Malda": ["Malda", "Chanchal"],
    "Jalpaiguri": ["Jalpaiguri", "Dhupguri"],
    "Cooch Behar": ["Cooch Behar", "Dinhata", "Mathabhanga"],
    "Bankura": ["Bankura", "Bishnupur"],
    "Purulia": ["Purulia", "Jhalda", "Raghunathpur"],
    "Midnapore": ["Midnapore", "Kharagpur", "Contai", "Haldia"]
  },
  "Himachal Pradesh": {
    "Shimla": ["Shimla", "Rohru", "Theog", "Dhalli"],
    "Kangra": ["Kangra", "Palampur", "Nagrota Bagwan"],
    "Mandi": ["Mandi", "Sundernagar", "Karsog"],
    "Solan": ["Solan", "Nalagarh", "Kasauli", "Parwanoo"],
    "Kullu": ["Kullu", "Bhuntar", "Bandrol"]
  },
  "Uttarakhand": {
    "Dehradun": ["Dehradun", "Rishikesh", "Vikasnagar"],
    "Haridwar": ["Haridwar", "Roorkee", "Manglaur", "Jwalapur"],
    "Udham Singh Nagar": ["Haldwani", "Rudrapur", "Kashipur", "Kichha", "Jaspur", "Sitarganj", "Khatima"],
    "Nainital": ["Nainital", "Ramnagar", "Haldwani"]
  },
  "Assam": {
    "Kamrup": ["Guwahati", "Rangia"],
    "Jorhat": ["Jorhat", "Titabar"],
    "Cachar": ["Silchar"],
    "Dibrugarh": ["Dibrugarh"],
    "Nagaon": ["Nagaon", "Hojai"],
    "Sonitpur": ["Tezpur", "Dhekiajuli"],
    "Tinsukia": ["Tinsukia", "Doom Dooma"],
    "Barpeta": ["Barpeta", "Howly"],
    "Darrang": ["Kharupetia", "Mangaldai"]
  },
  "Kerala": {
    "Thiruvananthapuram": ["Thiruvananthapuram", "Nedumangad", "Attingal"],
    "Ernakulam": ["Kochi", "Aluva", "Perumbavoor", "Muvattupuzha"],
    "Kozhikode": ["Kozhikode", "Vadakara", "Quilandy"],
    "Palakkad": ["Palakkad", "Chittur", "Ottappalam", "Mannarkkad"],
    "Thrissur": ["Thrissur", "Irinjalakuda", "Chalakudy"],
    "Malappuram": ["Malappuram", "Manjeri", "Tirur"],
    "Kollam": ["Kollam", "Kottarakkara", "Punalur"]
  },
  "Jammu & Kashmir": {
    "Jammu": ["Jammu", "R S Pura", "Akhnoor", "Samba"],
    "Srinagar": ["Srinagar", "Parimpora"],
    "Anantnag": ["Anantnag", "Bijbehara"],
    "Baramulla": ["Baramulla", "Sopore"],
    "Kathua": ["Kathua", "Hiranagar"],
    "Udhampur": ["Udhampur"],
    "Pulwama": ["Pulwama"]
  }
};


const MandiBhav: React.FC = () => {
  const { t: translate } = useLanguage();
  
  // Create an object proxy to mimic the old dict access
  const t = new Proxy({}, {
    get: (target, prop) => {
       if (typeof prop !== 'string') return undefined;
       return translate(`mandi.${prop}`);
    }
  }) as any;

  const [data, setData] = useState<MandiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<[number, number]>([25.26, 83.26]); // Default to Chandauli
  const [gpsDenied, setGpsDenied] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [activeMarketView, setActiveMarketView] = useState<string | null>(null);
  
  const [apiRates, setApiRates] = useState<any[]>([]);
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  useEffect(() => {
    mockFetchMandiData().then(rawData => {
      setData(rawData);
      setLoading(false);
    });
  }, []);

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setIsLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
      const results = await res.json();
      if (results && results.length > 0) {
         setUserLoc([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
         setGpsDenied(false); // Consider manual search as "location active"
      } else {
         alert("Location not found.");
      }
    } catch (e) {
      alert("Error finding location.");
    }
    setIsLocating(false);
  };

  const fetchLocalRates = async (state: string, district: string, market: string) => {
      if (!state || !district || !market) return;
      
      setActiveMarketView(market); // Switch to detail view
      setIsFetchingRates(true);
      setApiRates([]);
      
      try {
          const API_KEY = '579b464db66ec23bdd0000018d84e2cc0f0840705eafe3a506473454';
          const cleanState = encodeURIComponent(state);
          const cleanDistrict = encodeURIComponent(district);
          const cleanMarket = encodeURIComponent(market);
          
          let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[market]=${cleanMarket}&limit=20`;
          
          if (state) {
            url += `&filters[state.keyword]=${cleanState}`;
          }
          if (district) {
            url += `&filters[district]=${cleanDistrict}`;
          }
          
          const response = await fetch(url);
          const json = await response.json();
          if (json.records) {
              setApiRates(json.records);
          }
      } catch (error) {
          console.error("Local rate fetch failed", error instanceof Error ? error.message : String(error));
      } finally {
          setIsFetchingRates(false);
      }
  };

  // Distance Sort & Filter
  const baseDataWithDistance = data.map(d => ({
     ...d,
     distance: calculateDistance(userLoc[0], userLoc[1], d.lat || 0, d.lon || 0)
  }));

  // Unique Mandis for the List View
  const uniqueMandis = Array.from(new Set(baseDataWithDistance.map(m => m.market)))
    .map(marketName => {
       const mandiItem = baseDataWithDistance.find(m => m.market === marketName);
       const crops = baseDataWithDistance.filter(m => m.market === marketName).map(m => m.commodity);
       return {
          market: marketName,
          district: mandiItem?.district,
          state: mandiItem?.state,
          distance: mandiItem?.distance || 0,
          lat: mandiItem?.lat,
          lon: mandiItem?.lon,
          crops: Array.from(new Set(crops))
       };
    })
    .sort((a,b) => a.distance - b.distance);

  // Detailed view data aggregation
  let activeMarketDetails = null;
  let comparisonData: Record<string, { market: string; distance: number; price: number }[]> = {};
  
  if (activeMarketView) {
      activeMarketDetails = uniqueMandis.find(m => m.market === activeMarketView) || { market: activeMarketView, distance: 0, district: selectedDistrict || 'Unknown' };
      
      const currentCrops = apiRates.length > 0 ? apiRates : baseDataWithDistance.filter(m => m.market === activeMarketView);
      
      // Calculate comparison for each crop
      currentCrops.forEach(c => {
          const cropName = c.commodity;
          const otherMarkets = baseDataWithDistance.filter(m => m.market !== activeMarketView && m.commodity.toLowerCase() === cropName.toLowerCase());
          
          const sortedNearby = otherMarkets.map(m => ({
              market: m.market,
              distance: m.distance || 0,
              price: parseFloat(m.modal_price)
          })).sort((a, b) => a.distance - b.distance).slice(0, 3);
          
          comparisonData[cropName] = sortedNearby;
      });
  }

  return (
    <div className="p-4 md:p-8 flex flex-col h-full gap-6 bg-gradient-to-br from-stone-50 to-emerald-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white gap-4 relative overflow-hidden">
         <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>
         <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-[#2d5a27] font-serif">{t.title}</h1>
            <p className="text-sm font-medium text-stone-500 mt-1">{t.subtitle}</p>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto z-10">
            <div className="flex items-center w-full sm:w-auto bg-white/80 backdrop-blur border border-stone-200 rounded-xl px-2 py-1.5 shadow-sm">
               <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  className="bg-transparent border-none outline-none text-sm px-2 py-1 w-full sm:w-40 placeholder-stone-400"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
               />
               <button onClick={searchLocation} disabled={isLocating} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0 transition-colors">
                  {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
               </button>
            </div>
         </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white p-3 gap-3">
         <select 
            className="w-full xl:flex-1 bg-stone-50/50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 truncate shadow-inner hover:bg-stone-50 transition-colors cursor-pointer"
            value={selectedState}
            onChange={(e) => {
               setSelectedState(e.target.value);
               setSelectedDistrict('');
               setSelectedMarket('');
            }}
         >
            <option value="">{t.selectState}</option>
            {Object.keys(mandiMapping).map(state => (
               <option key={state} value={state} title={state}>{state}</option>
            ))}
         </select>
         
         <select 
            className="w-full xl:flex-1 bg-stone-50/50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 truncate shadow-inner hover:bg-stone-50 transition-colors cursor-pointer"
            value={selectedDistrict}
            onChange={(e) => {
               setSelectedDistrict(e.target.value);
               setSelectedMarket('');
            }}
            disabled={!selectedState}
         >
            <option value="">{t.selectDist}</option>
            {selectedState && Object.keys(mandiMapping[selectedState] || {}).map(district => (
               <option key={district} value={district} title={district}>{district}</option>
            ))}
         </select>

         <select 
            className="w-full xl:flex-1 bg-stone-50/50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 truncate shadow-inner hover:bg-stone-50 transition-colors cursor-pointer"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            disabled={!selectedDistrict}
         >
            <option value="">{t.selectMandi}</option>
            {selectedState && selectedDistrict && (mandiMapping[selectedState][selectedDistrict] || []).map(mandi => (
               <option key={mandi} value={mandi} title={mandi}>{mandi}</option>
            ))}
         </select>

         <button 
            onClick={() => fetchLocalRates(selectedState, selectedDistrict, selectedMarket)} 
            disabled={!selectedMarket || isFetchingRates}
            className="w-full xl:w-auto px-8 py-3 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
         >
            {isFetchingRates ? <Loader2 size={20} className="animate-spin inline" /> : t.checkPrice}
         </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
         {/* Map View */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative z-0 h-[400px] lg:h-full">
            <MapContainer center={userLoc} zoom={7} className="w-full h-full">
               <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
               <UpdateView center={(activeMarketDetails?.lat && activeMarketDetails?.lon) ? [activeMarketDetails.lat, activeMarketDetails.lon] : userLoc} />
               <Marker position={userLoc}>
                  <Popup><b>{t.youAreHere}</b></Popup>
               </Marker>
               {uniqueMandis.map((m, i) => m.lat && m.lon ? (
                  <Marker key={i} position={[m.lat, m.lon]}>
                     <Popup>
                        <b className="text-lg">{m.market}</b><br/>
                        <span className="text-stone-500">{m.district}, {m.state}</span><br/>
                        Dist: {Math.round(m.distance || 0)}km<br/>
                        <button 
                            onClick={() => {
                                setSelectedState(m.state || '');
                                setSelectedDistrict(m.district || '');
                                setSelectedMarket(m.market);
                                fetchLocalRates(m.state || '', m.district || '', m.market);
                            }}
                            className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2 py-1 text-sm font-bold"
                        >
                            {t.viewPrices}
                        </button>
                     </Popup>
                  </Marker>
               ) : null)}
            </MapContainer>
         </div>

         {/* Right Sidebar */}
         <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col h-[600px] lg:h-full overflow-hidden">
             {!activeMarketView ? (
                // LIST VIEW
                <div className="p-4 flex flex-col h-full bg-gradient-to-b from-stone-50/50 to-white/50">
                    <h2 className="font-bold text-lg mb-4 text-[#2d5a27] flex items-center justify-between border-b border-emerald-100 pb-3">
                       {t.nearestMarkets}
                       <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          {uniqueMandis.length} {t.found}
                       </span>
                    </h2>
                    
                    {loading ? (
                       <div className="flex-1 flex items-center justify-center text-[#2d5a27]"><Loader2 className="animate-spin" /></div>
                    ) : (
                       <div className="overflow-y-auto flex-1 space-y-4 pr-3 custom-scrollbar h-0 pb-10">
                           {uniqueMandis.map((m, i) => (
                               <div 
                                   key={i} 
                                   onClick={() => {
                                       setSelectedState(m.state || '');
                                       setSelectedDistrict(m.district || '');
                                       setSelectedMarket(m.market);
                                       fetchLocalRates(m.state || '', m.district || '', m.market);
                                   }}
                                   className="p-4 bg-white rounded-2xl border border-stone-200/60 hover:border-emerald-300 transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                               >
                                   <div className="flex justify-between items-start mb-3">
                                      <div>
                                          <h3 className="font-bold text-stone-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">{m.market}</h3>
                                          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{m.district}</span>
                                      </div>
                                      <span className="text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-lg shadow-sm border border-orange-400/50">{Math.round(m.distance || 0)} km</span>
                                   </div>
                                   <div className="flex items-center gap-2 flex-wrap">
                                       {m.crops.slice(0, 4).map((crop, idx) => (
                                           <span key={idx} className="text-xs bg-stone-50 border border-stone-100 px-2 py-1 rounded-md text-stone-600 font-medium">
                                               {getCropIcon(crop)} <span className="ml-0.5">{crop}</span>
                                           </span>
                                       ))}
                                       {m.crops.length > 4 && (
                                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{m.crops.length - 4} more</span>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                    )}
                </div>
             ) : (
                // DETAIL VIEW
                <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50/50 to-stone-50/50">
                    <div className="p-5 bg-white/60 backdrop-blur-md border-b border-white shadow-sm flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -z-10"></div>
                        <button 
                            onClick={() => {
                                setActiveMarketView(null);
                                setApiRates([]);
                            }} 
                            className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-800 w-fit bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                        >
                            <ArrowLeft size={16} /> {t.backToList}
                        </button>
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="font-bold text-2xl text-emerald-900 leading-tight">{activeMarketDetails?.market}</h2>
                                <p className="text-sm font-medium text-emerald-700/80 mt-1">{activeMarketDetails?.district} • {Math.round(activeMarketDetails?.distance || 0)} km {t.away}</p>
                            </div>
                            {apiRates.length > 0 && <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md shadow-sm">Govt API</span>}
                        </div>
                    </div>
                    
                    <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                        {isFetchingRates ? (
                            <div className="flex items-center justify-center h-32 text-emerald-600"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-4">
                                {((apiRates.length > 0) ? apiRates : baseDataWithDistance.filter(m => m.market === activeMarketView)).map((m, i) => {
                                    const currentPrice = parseFloat(m.modal_price);
                                    const comparison = comparisonData[m.commodity] || [];
                                    const bestNearby = comparison.length > 0 ? comparison[0] : null;
                                    const priceDiff = bestNearby ? currentPrice - bestNearby.price : 0;
                                    
                                    return (
                                        <div key={i} className="bg-white rounded-2xl border border-white p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-50 to-stone-100 rounded-2xl border border-white shadow-inner flex items-center justify-center text-3xl filter drop-shadow-sm">
                                                    {getCropIcon(m.commodity)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-stone-800 text-lg mb-1">{m.commodity}</p>
                                                    <div className="flex items-end gap-2">
                                                        <span className="font-black text-emerald-600 text-2xl leading-none">₹{m.modal_price}</span>
                                                        <span className="text-xs font-bold text-stone-400 mb-0.5 uppercase">/ {t.qtl}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Price Comparison Block */}
                                            {comparison.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-stone-100/80 space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                        <span>{t.nearbyComparison}</span>
                                                        {priceDiff > 0 ? (
                                                            <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex items-center"><TrendingDown size={12} className="mr-1"/> {t.expensive}</span>
                                                        ) : priceDiff < 0 ? (
                                                            <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center"><TrendingUp size={12} className="mr-1"/> {t.cheaper}</span>
                                                        ) : (
                                                            <span className="text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">{t.avgPrice}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        {comparison.map((comp, idx) => (
                                                            <div key={idx} className="flex justify-between items-center bg-stone-50/80 border border-stone-100 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-stone-100">
                                                                <span className="font-medium text-stone-700 truncate max-w-[150px]">{comp.market} <span className="text-stone-400 text-xs ml-1 font-normal">({Math.round(comp.distance)}km)</span></span>
                                                                <span className="font-bold text-stone-800 bg-white px-2 py-1 rounded-md shadow-sm border border-stone-100">₹{comp.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {apiRates.length === 0 && baseDataWithDistance.filter(m => m.market === activeMarketView).length === 0 && (
                                    <div className="text-center text-stone-400 italic py-10 bg-white/50 rounded-2xl border border-stone-200 border-dashed">{t.noData}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default MandiBhav;

