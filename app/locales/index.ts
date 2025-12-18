import { I18n } from 'i18n-js';
import en from './en';
import ptBR from './pt-BR';

const i18n = new I18n({
  en,
  'pt-BR': ptBR,
});

// Fallback para inglês se o idioma não for encontrado
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;
