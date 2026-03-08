import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type Theme = 'light' | 'dark';
type Language = 'English' | 'Amharic' | 'Oromic';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Basic translation dictionary
const translations: Record<Language, Record<string, string>> = {
  English: {
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'Catalog',
    'nav.deliveries': 'Deliveries',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'settings.title': 'System Preferences',
    'settings.theme': 'Display Theme',
    'settings.language': 'Application Language',
    'settings.save': 'Save Preferences',
    'common.light': 'Light',
    'common.dark': 'Dark',
    'merchant.center': 'Merchant Center',
    'courier.dashboard': 'Courier Dashboard',
    'customer.hub': 'Customer Hub',
  },
  Amharic: {
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.catalog': 'ካታሎግ',
    'nav.deliveries': 'ርክክብ',
    'nav.profile': 'መገለጫ',
    'nav.settings': 'ቅንብሮች',
    'settings.title': 'የስርዓት ምርጫዎች',
    'settings.theme': 'ገጽታ',
    'settings.language': 'ቋንቋ',
    'settings.save': 'ምርጫዎችን አስቀምጥ',
    'common.light': 'ብርሃን',
    'common.dark': 'ጨለማ',
    'merchant.center': 'የነጋዴ ማእከል',
    'courier.dashboard': 'የመልእክተኛ ዳሽቦርድ',
    'customer.hub': 'የደንበኛ ማእከል',
  },
  Oromic: {
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'Kaataloogii',
    'nav.deliveries': 'Ergaa',
    'nav.profile': 'Piroofayilii',
    'nav.settings': 'Sajoo',
    'settings.title': 'System Preferences',
    'settings.theme': 'Bifa',
    'settings.language': 'Afaan',
    'settings.save': 'Save Preferences',
    'common.light': 'Ifa',
    'common.dark': 'Dukkana',
    'merchant.center': 'Giddu-gala Daldalaa',
    'courier.dashboard': 'Courier Dashboard',
    'customer.hub': 'Customer Hub',
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem('ardi-theme') as Theme) || 'light'
  );
  const [language, setLanguageState] = useState<Language>('English');

  // Load initial settings from profile
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.user?.settings) {
          const s = data.user.settings;
          if (s.theme) setThemeState(s.theme);
          if (s.language) setLanguageState(s.language);
        }
      } catch (err) {
        console.error('Failed to load global settings', err);
      }
    };
    fetchSettings();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Toggle dark class based on theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set explicit color-scheme
    root.style.colorScheme = theme;
    
    // Also store in localStorage for immediate load on next visit
    localStorage.setItem('ardi-theme', theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await api.put('/auth/profile', { 
        settings: { theme: newTheme, language } 
      });
    } catch (err) {
      console.error('Failed to persist theme', err);
    }
  };

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await api.put('/auth/profile', { 
        settings: { theme, language: newLang } 
      });
    } catch (err) {
      console.error('Failed to persist language', err);
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
