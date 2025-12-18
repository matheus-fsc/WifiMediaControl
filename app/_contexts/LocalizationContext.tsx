import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '../locales';

const STORAGE_KEY = '@audioremote:language';

export type SupportedLanguage = 'auto' | 'en' | 'pt-BR';

interface LocalizationContextData {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
}

const LocalizationContext = createContext<LocalizationContextData>({} as LocalizationContextData);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('auto');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLang = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedLang) {
        setLanguageState(storedLang as SupportedLanguage);
        applyLanguage(storedLang as SupportedLanguage);
      } else {
        // Detecção automática do idioma do sistema
        applyLanguage('auto');
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
      applyLanguage('auto');
    }
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
      setLanguageState(lang);
      applyLanguage(lang);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  };

  const applyLanguage = (lang: SupportedLanguage) => {
    if (lang === 'auto') {
      // Pega o idioma do sistema
      const deviceLocale = Localization.getLocales()[0];
      const systemLang = deviceLocale?.languageTag || 'en';
      
      // Mapeia para os idiomas suportados
      if (systemLang.startsWith('pt')) {
        i18n.locale = 'pt-BR';
      } else {
        i18n.locale = 'en';
      }
    } else {
      i18n.locale = lang;
    }
  };

  const t = (key: string, params?: Record<string, any>) => {
    return i18n.t(key, params);
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};
