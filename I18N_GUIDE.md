# 🌍 Sistema de Internacionalização (i18n)

## Idiomas Suportados

- **🇺🇸 Inglês (EN)** - English
- **🇧🇷 Português do Brasil (PT-BR)** - Portuguese (Brazil)
- **🌐 Automático** - Detecta o idioma do sistema operacional

## Como Funciona

### Detecção Automática
Por padrão, o app detecta o idioma do sistema operacional usando `expo-localization`:
- Se o sistema estiver em português (pt, pt-BR, pt-PT), usa **PT-BR**
- Caso contrário, usa **EN** como fallback

### Configuração Manual
O usuário pode escolher manualmente o idioma em:
**Configurações → Idioma** (Settings → Language)

Opções disponíveis:
- 🌐 Automático (Sistema)
- 🇺🇸 Inglês
- 🇧🇷 Português (Brasil)

A preferência é salva no AsyncStorage e persiste entre sessões.

## Estrutura de Arquivos

```
app/
  locales/
    index.ts         # Configuração principal do i18n
    en.ts            # Traduções em inglês
    pt-BR.ts         # Traduções em português
  contexts/
    LocalizationContext.tsx  # Provider e hook useLocalization
```

## Como Usar no Código

### 1. Importar o hook
```jsx
import { useLocalization } from './contexts/LocalizationContext';
```

### 2. Usar no componente
```jsx
export default function MyComponent() {
  const { t, language, setLanguage } = useLocalization();
  
  return (
    <View>
      <Text>{t('home.title')}</Text>
      <Text>{t('config.serverIP')}</Text>
    </View>
  );
}
```

### 3. Funções Disponíveis

- `t(key)` - Retorna a tradução para a chave especificada
- `language` - Idioma atual ('auto', 'en' ou 'pt-BR')
- `setLanguage(lang)` - Altera o idioma e salva a preferência

## Adicionar Novas Traduções

### 1. Editar os arquivos de tradução

**app/locales/en.ts**
```typescript
export default {
  myNewSection: {
    title: 'My Title',
    subtitle: 'My Subtitle',
  }
};
```

**app/locales/pt-BR.ts**
```typescript
export default {
  myNewSection: {
    title: 'Meu Título',
    subtitle: 'Meu Subtítulo',
  }
};
```

### 2. Usar no componente
```jsx
<Text>{t('myNewSection.title')}</Text>
<Text>{t('myNewSection.subtitle')}</Text>
```

## Estrutura das Traduções Atuais

```
home.*              # Tela principal
  - title
  - playPause
  - next
  - previous
  - volume
  - settings
  - server
  - status.*
  - warnings.*

config.*            # Tela de configurações
  - title
  - back
  - serverIP
  - authToken
  - testConnection
  - saveAndContinue
  - loading
  - language
  - languageAuto/EN/PT
  - tips.*
  - alerts.*

alerts.*            # Alertas gerais
  - configNeeded
  - serverOffline
  - authNeeded
  - error
  - etc.
```

## Adicionar Novo Idioma

Para adicionar suporte a um novo idioma (ex: Espanhol):

### 1. Criar arquivo de tradução
```typescript
// app/locales/es.ts
export default {
  home: { title: 'AudioRemote', ... },
  config: { ... },
  alerts: { ... }
};
```

### 2. Importar no index.ts
```typescript
// app/locales/index.ts
import es from './es';

const i18n = new I18n({
  en,
  'pt-BR': ptBR,
  'es': es,  // Adicionar aqui
});
```

### 3. Atualizar tipo no contexto
```typescript
// app/contexts/LocalizationContext.tsx
export type SupportedLanguage = 'auto' | 'en' | 'pt-BR' | 'es';
```

### 4. Adicionar lógica de detecção
```typescript
const applyLanguage = (lang: SupportedLanguage) => {
  if (lang === 'auto') {
    const systemLang = Localization.getLocales()[0]?.languageTag || 'en';
    
    if (systemLang.startsWith('pt')) {
      i18n.locale = 'pt-BR';
    } else if (systemLang.startsWith('es')) {
      i18n.locale = 'es';  // Adicionar aqui
    } else {
      i18n.locale = 'en';
    }
  } else {
    i18n.locale = lang;
  }
};
```

### 5. Adicionar botão na UI
```jsx
<TouchableOpacity
  style={[styles.languageButton, language === 'es' && styles.languageButtonActive]}
  onPress={() => setLanguage('es')}
>
  <Text>🇪🇸 Español</Text>
</TouchableOpacity>
```

## Testes

- ✅ Mudança de idioma persiste após reiniciar o app
- ✅ Detecção automática funciona no primeiro acesso
- ✅ Todos os textos são traduzidos dinamicamente
- ✅ Alertas e mensagens de erro são traduzidos

## Dependências

- `i18n-js` - Motor de tradução
- `expo-localization` - Detecção de idioma do SO
- `@react-native-async-storage/async-storage` - Persistência da preferência
