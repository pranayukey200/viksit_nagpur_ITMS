"use client";

import { create } from "zustand";

export type Language = "en" | "hi" | "mr";

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  navAbout: string;
  navHelplines: string;
  navReport: string;
  navConsole: string;
  viewCityTraffic: string;
  viewRadar500: string;
  locateMe: string;

  // City Status HUD
  cityStatus: string;
  live: string;
  junctions: string;
  highRisk: string;
  officers: string;
  monsoonWarning: string;
  waterloggedRoadsCount: string;

  // Proximity Card
  aroundLocation: string;
  liveGps: string;
  centralHub: string;
  nearestCorridor: string;
  away: string;
  clearLanes: string;
  congested: string;
  floodAlert: string;
  adjacentRoads: string;

  // Weather Card
  liveWeather: string;
  humidity: string;
  wind: string;
  status: string;
  synced: string;
  syncBtn: string;
  rainWarning: string;

  // Legend
  trafficLegend: string;
  greenFreeFlow: string;
  amberModerate: string;
  redHeavy: string;
  blueWaterlogged: string;
  junctionRisk: string;
  low: string;
  med: string;
  high: string;
  activeHotspots: string;
  citizenReportBadge: string;

  // 500km Radar HUD
  regionalRadarTitle: string;
  thunderstormPaths: string;
  lightRain: string;
  heavyRain: string;
  now: string;
  forecast: string;

  // Citizen Report Modal
  reportTitle: string;
  reportSubtitle: string;
  hazardType: string;
  hazardTraffic: string;
  hazardTrafficDesc: string;
  hazardWaterlog: string;
  hazardWaterlogDesc: string;
  hazardAccident: string;
  hazardAccidentDesc: string;
  hazardBreakdown: string;
  hazardBreakdownDesc: string;
  nearestJunction: string;
  specificLandmark: string;
  severityLevel: string;
  severityHigh: string;
  severityMed: string;
  severityLow: string;
  citizenRemarks: string;
  remarksPlaceholder: string;
  submitReport: string;
  cancel: string;
  reportTransmitted: string;
  reportTransmittedDesc: string;
  done: string;

  // Contact Modal
  contactTitle: string;
  contactSubtitle: string;
  emergencyResponse: string;
  trafficControlRoom: string;
  whatsappMitra: string;
  whatsappMitraDesc: string;
  policeHq: string;
  policeHqAddress: string;
  missionTagline: string;
  close: string;

  // Language Selection Modal
  selectLanguageTitle: string;
  selectLanguageSubtitle: string;
  continueBtn: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandTitle: "SURAKSHA",
    brandSubtitle: "Nagpur Traffic Intelligence DSS",
    navAbout: "About Us",
    navHelplines: "Helplines",
    navReport: "Report Hazard",
    navConsole: "Enter Console",
    viewCityTraffic: "Nagpur City Traffic",
    viewRadar500: "500km Rain Radar",
    locateMe: "Locate Me",

    cityStatus: "City Status",
    live: "LIVE",
    junctions: "Junctions",
    highRisk: "High Risk",
    officers: "Officers",
    monsoonWarning: "Monsoon Warning",
    waterloggedRoadsCount: "roads waterlogged",

    aroundLocation: "Around Your Location",
    liveGps: "Live GPS",
    centralHub: "Central Hub",
    nearestCorridor: "Nearest Corridor",
    away: "away",
    clearLanes: "Clear Lanes",
    congested: "Congested",
    floodAlert: "Flood Alert",
    adjacentRoads: "Adjacent Nagpur Roads",

    liveWeather: "Live Nagpur Weather",
    humidity: "HUMID",
    wind: "WIND",
    status: "Status",
    synced: "Synced",
    syncBtn: "Sync",
    rainWarning: "Rain >5mm: Flood-prone road markers highlighted in blue",

    trafficLegend: "Traffic Signal Legend",
    greenFreeFlow: "Green · Free Flow",
    amberModerate: "Amber · Moderate",
    redHeavy: "Red · Heavy Congestion",
    blueWaterlogged: "Blue · Waterlogged",
    junctionRisk: "Junction Risk (22 Monitored)",
    low: "Low",
    med: "Med",
    high: "High",
    activeHotspots: "Active Hotspots",
    citizenReportBadge: "Citizen",

    regionalRadarTitle: "Central India Doppler Radar · 500km",
    thunderstormPaths: "Thunderstorm paths",
    lightRain: "Light (0-30 min)",
    heavyRain: "Heavy (60-90 min)",
    now: "Now",
    forecast: "FORECAST",

    reportTitle: "Report Traffic Hazard / Incident",
    reportSubtitle: "Direct feed to Nagpur Traffic Police Command Dashboard",
    hazardType: "Hazard Type",
    hazardTraffic: "Heavy Traffic Jam",
    hazardTrafficDesc: "Severe congestion or deadlock",
    hazardWaterlog: "Waterlogging",
    hazardWaterlogDesc: "Flooded road or deep puddle",
    hazardAccident: "Accident / Crash",
    hazardAccidentDesc: "Collision requiring police/medical aid",
    hazardBreakdown: "Vehicle Breakdown",
    hazardBreakdownDesc: "Stalled vehicle blocking lane",
    nearestJunction: "Nearest Junction",
    specificLandmark: "Specific Landmark / Road",
    severityLevel: "Severity Level",
    severityHigh: "Critical / Blocked",
    severityMed: "Moderate Delay",
    severityLow: "Minor Friction",
    citizenRemarks: "Citizen Remarks / Details",
    remarksPlaceholder: "Briefly describe lane status, water level, or vehicles involved…",
    submitReport: "Submit Report",
    cancel: "Cancel",
    reportTransmitted: "Report Transmitted to Police DSS",
    reportTransmittedDesc: "Your report is now active on the police command dashboard.",
    done: "Done",

    contactTitle: "Nagpur Traffic Police Helpline & Contacts",
    contactSubtitle: "24/7 Citizen Assistance & Emergency Response Lines",
    emergencyResponse: "Emergency Response",
    trafficControlRoom: "Traffic Control Room",
    whatsappMitra: "WhatsApp Traffic Mitra Bot",
    whatsappMitraDesc: "Report near-misses, wrong-way driving, or blocked lanes via WhatsApp (+91 98230 XXXXX)",
    policeHq: "Traffic Police Headquarters",
    policeHqAddress: "Near Reserve Bank Square, Civil Lines, Nagpur, Maharashtra 440001",
    missionTagline: "Viksit Nagpur Safety Mission",
    close: "Close",

    selectLanguageTitle: "Select Preferred Language",
    selectLanguageSubtitle: "Choose your language for Nagpur Suraksha Netra Portal",
    continueBtn: "Continue to Portal",
  },

  hi: {
    brandTitle: "SURAKSHA",
    brandSubtitle: "नागपूर वाहतूक नियंत्रण व निर्णय प्रणाली",
    navAbout: "हमारे बारे में",
    navHelplines: "हेल्पलाइन",
    navReport: "ट्रैफिक रिपोर्ट करें",
    navConsole: "कंट्रोल रूम लॉगिन",
    viewCityTraffic: "नागपुर शहर ट्रैफिक",
    viewRadar500: "500 किमी बारिश रडार",
    locateMe: "मेरा स्थान",

    cityStatus: "शहर स्थिति",
    live: "लाइव",
    junctions: "प्रमुख चौराहे",
    highRisk: "उच्च जोखिम",
    officers: "तैनात पुलिसकर्मी",
    monsoonWarning: "मानसून चेतावनी",
    waterloggedRoadsCount: "सड़कें जलमग्न",

    aroundLocation: "आपके स्थान के पास ट्रैफिक",
    liveGps: "लाइव जीपीएस",
    centralHub: "मुख्य केंद्र",
    nearestCorridor: "निकटतम मुख्य मार्ग",
    away: "दूरी",
    clearLanes: "सुगम मार्ग",
    congested: "जाम / भारी",
    floodAlert: "जलभराव चेतावनी",
    adjacentRoads: "आस-पास की सड़कें",

    liveWeather: "नागपुर लाइव मौसम",
    humidity: "आर्द्रता",
    wind: "हवा",
    status: "स्थिति",
    synced: "अपडेट",
    syncBtn: "रिफ्रेश",
    rainWarning: "बारिश >5 मिमी: जलभराव वाली सड़कें नीले रंग में चिह्नित",

    trafficLegend: "ट्रैफिक सिग्नल संकेतक",
    greenFreeFlow: "हरा · सामान्य प्रवाह",
    amberModerate: "पीला · मध्यम ट्रैफिक",
    redHeavy: "लाल · भारी ट्रैफिक जाम",
    blueWaterlogged: "नीला · जलमग्न मार्ग",
    junctionRisk: "चौराहा जोखिम स्तर (22 निगरानी में)",
    low: "कम",
    med: "मध्यम",
    high: "अधिक",
    activeHotspots: "सक्रिय संवेदनशील क्षेत्र",
    citizenReportBadge: "नागरिक",

    regionalRadarTitle: "मध्य भारत डॉप्लर वर्षा रडार · 500 किमी",
    thunderstormPaths: "तूफान व बिजली मार्ग",
    lightRain: "हल्की (0-30 मि.)",
    heavyRain: "भारी (60-90 मि.)",
    now: "अभी",
    forecast: "पूर्वानुमान",

    reportTitle: "ट्रैफिक समस्या / दुर्घटना रिपोर्ट करें",
    reportSubtitle: "नागपुर ट्रैफिक पुलिस कंट्रोल रूम को सीधा अलर्ट",
    hazardType: "समस्या का प्रकार",
    hazardTraffic: "भारी ट्रैफिक जाम",
    hazardTrafficDesc: "भीषण जाम या रास्ता बंद",
    hazardWaterlog: "सड़क पर जलभराव",
    hazardWaterlogDesc: "पानी भरने से फिसलन या रास्ता बाधित",
    hazardAccident: "दुर्घटना / एक्सीडेंट",
    hazardAccidentDesc: "पुलिस या एम्बुलेंस सहायता की आवश्यकता",
    hazardBreakdown: "गाड़ी खराब होना",
    hazardBreakdownDesc: "खराब वाहन से लेन अवरुद्ध",
    nearestJunction: "निकटतम चौराहा",
    specificLandmark: "विशिष्ट स्थान / सड़क का नाम",
    severityLevel: "गंभीरता का स्तर",
    severityHigh: "अत्यधिक / रास्ता बंद",
    severityMed: "मध्यम देरी",
    severityLow: "हल्की रुकावट",
    citizenRemarks: "विवरण / नागरिक टिप्पणी",
    remarksPlaceholder: "लेन की स्थिति, पानी का स्तर या वाहनों का विवरण लिखें…",
    submitReport: "रिपोर्ट भेजें",
    cancel: "रद्द करें",
    reportTransmitted: "रिपोर्ट पुलिस कंट्रोल रूम को भेजी गई",
    reportTransmittedDesc: "आपकी रिपोर्ट सक्रिय घटनाओं की सूची में दर्ज हो गई है।",
    done: "पूर्ण",

    contactTitle: "नागपुर ट्रैफिक पुलिस हेल्पलाइन व संपर्क",
    contactSubtitle: "24/7 नागरिक सहायता व आपातकालीन सेवा",
    emergencyResponse: "आपातकालीन सेवा",
    trafficControlRoom: "ट्रैफिक कंट्रोल रूम",
    whatsappMitra: "व्हाट्सएप ट्रैफिक मित्र बॉट",
    whatsappMitraDesc: "गलत दिशा, जाम या दुर्घटना की फोटो व्हाट्सएप पर भेजें (+91 98230 XXXXX)",
    policeHq: "ट्रैफिक पुलिस मुख्यालय",
    policeHqAddress: "रिजर्व बैंक चौक के पास, सिविल लाइंस, नागपुर 440001",
    missionTagline: "विकसित नागपुर सुरक्षा मिशन",
    close: "बंद करें",

    selectLanguageTitle: "भाषा का चयन करें",
    selectLanguageSubtitle: "नागपुर सुरक्षा नेत्र पोर्टल के लिए अपनी पसंदीदा भाषा चुनें",
    continueBtn: "पोर्टल पर आगे बढ़ें",
  },

  mr: {
    brandTitle: "SURAKSHA",
    brandSubtitle: "नागपूर वाहतूक नियंत्रण व निर्णय प्रणाली",
    navAbout: "आमच्याबद्दल",
    navHelplines: "हेल्पलाइन",
    navReport: "वाहतूक नोंदवा",
    navConsole: "कंट्रोल रूम लॉगिन",
    viewCityTraffic: "नागपूर शहर वाहतूक",
    viewRadar500: "500 किमी पर्जन्य रडार",
    locateMe: "माझे स्थान",

    cityStatus: "शहर स्थिती",
    live: "थेट",
    junctions: "प्रमुख चौक",
    highRisk: "अति-धोकादायक",
    officers: "कार्यरत पोलीस",
    monsoonWarning: "पावसाळी इशारा",
    waterloggedRoadsCount: "रस्ते जलमय",

    aroundLocation: "तुमच्या जवळील वाहतूक स्थिती",
    liveGps: "थेट जीपीएस",
    centralHub: "मध्यवर्ती केंद्र",
    nearestCorridor: "जवळचा मुख्य रस्ता",
    away: "अंतरावर",
    clearLanes: "मोकळे रस्ते",
    congested: "वाहतूक कोंडी",
    floodAlert: "पाणी साचण्याचा इशारा",
    adjacentRoads: "लगतचे नागपूर रस्ते",

    liveWeather: "नागपूर थेट हवामान",
    humidity: "आर्द्रता",
    wind: "वारा",
    status: "स्थिती",
    synced: "अद्ययावत",
    syncBtn: "रिफ्रेश",
    rainWarning: "पाऊस >5 मिमी: पाणी साचलेले रस्ते निळ्या रंगात दर्शवले आहेत",

    trafficLegend: "वाहतूक सिग्नल सूची",
    greenFreeFlow: "हिरवा · सुरळीत वाहतूक",
    amberModerate: "पिवळा · मध्यम वाहतूक",
    redHeavy: "लाल · तीव्र वाहतूक कोंडी",
    blueWaterlogged: "निळा · जलमय रस्ता",
    junctionRisk: "चौक जोखीम स्तर (22 चौक देखरेखीखाली)",
    low: "कमी",
    med: "मध्यम",
    high: "जास्त",
    activeHotspots: "सक्रिय संवेदनशील भाग",
    citizenReportBadge: "नागरिक",

    regionalRadarTitle: "मध्य भारत डॉप्लर पर्जन्य रडार · 500 किमी",
    thunderstormPaths: "वादळ व वीज मार्ग",
    lightRain: "हलका (0-30 मि.)",
    heavyRain: "मुसळधार (60-90 मि.)",
    now: "आता",
    forecast: "अंदाज",

    reportTitle: "वाहतूक समस्या / अपघात नोंदवा",
    reportSubtitle: "नागपूर वाहतूक पोलीस नियंत्रण कक्षास थेट माहिती",
    hazardType: "समस्येचा प्रकार",
    hazardTraffic: "तीव्र वाहतूक कोंडी",
    hazardTrafficDesc: "मोठी कोंडी किंवा रस्ता ठप्प",
    hazardWaterlog: "रस्त्यावर पाणी साचणे",
    hazardWaterlogDesc: "पाणी भरल्यामुळे रस्ता बंद किंवा निसरडा",
    hazardAccident: "अपघात",
    hazardAccidentDesc: "पोलीस किंवा रुग्णवाहिका मदतीची गरज",
    hazardBreakdown: "गाडी बंद पडणे",
    hazardBreakdownDesc: "बंद पडलेल्या वाहनामुळे अडथळा",
    nearestJunction: "जवळचा चौक",
    specificLandmark: "विशिष्ट जागा / रस्त्याचे नाव",
    severityLevel: "तीव्रता पातळी",
    severityHigh: "गंभीर / रस्ता ठप्प",
    severityMed: "मध्यम विलंब",
    severityLow: "किरकोळ अडथळा",
    citizenRemarks: "तपशील / नागरिक टीप",
    remarksPlaceholder: "लेनची स्थिती, पाण्याचा स्तर किंवा वाहनांची माहिती लिहा…",
    submitReport: "माहिती पाठवा",
    cancel: "रद्द करा",
    reportTransmitted: "माहिती पोलीस नियंत्रण कक्षाकडे पोहोचली",
    reportTransmittedDesc: "आपली नोंद तत्काळ पोलीस कमांड डॅशबोर्डवर सक्रिय झाली आहे.",
    done: "पूर्ण",

    contactTitle: "नागपूर वाहतूक पोलीस हेल्पलाइन व संपर्क",
    contactSubtitle: "24/7 नागरिक सहाय्यता व आपत्कालीन सेवा",
    emergencyResponse: "आपत्कालीन सेवा",
    trafficControlRoom: "वाहतूक नियंत्रण कक्ष",
    whatsappMitra: "व्हॉट्सॲप ट्रॅफिक मित्र बॉट",
    whatsappMitraDesc: "चुकीच्या दिशेने वाहन चालवणे, कोंडी किंवा अपघाताची माहिती व्हॉट्सॲपवर पाठवा (+91 98230 XXXXX)",
    policeHq: "वाहतूक पोलीस मुख्यालय",
    policeHqAddress: "रिझर्व्ह बँक चौकाजवळ, सिव्हिल लाइन्स, नागपूर 440001",
    missionTagline: "विकसित नागपूर सुरक्षा अभियान",
    close: "बंद करा",

    selectLanguageTitle: "भाषा निवडा",
    selectLanguageSubtitle: "नागपूर सुरक्षा नेत्र पोर्टलसाठी आपली पसंतीची भाषा निवडा",
    continueBtn: "पोर्टलवर पुढे जा",
  },
};

interface LanguageStore {
  language: Language;
  hasSelectedInitialLang: boolean;
  setLanguage: (lang: Language) => void;
  setHasSelectedInitialLang: (val: boolean) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: "en",
  hasSelectedInitialLang: false,
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("suraksha_netra_lang", lang);
      localStorage.setItem("suraksha_netra_lang_prompted", "true");
    }
    set({ language: lang, hasSelectedInitialLang: true });
  },
  setHasSelectedInitialLang: (val: boolean) => set({ hasSelectedInitialLang: val }),
}));

export function useTranslation() {
  const lang = useLanguageStore((s) => s.language);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return { t, lang, setLanguage: useLanguageStore.getState().setLanguage };
}
