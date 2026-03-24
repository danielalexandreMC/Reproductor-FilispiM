# Reproductor-FilispiM
Reproductor web de Rádio FilispiM, WEB-APP (PWA)

# Rádio FilispiM - WebApp

## 📻 Descrición

WebApp de **Rádio FilispiM**, a rádio libre e comunitaria da Terra de Trasancos (102.3 FM). Esta aplicación permite escoitar a emisión en directo, ver a programación do día, ler as últimas novas do blog e compartir contido en redes sociais.

---

## ✨ Características

### Reprodutor de Audio
- **Streaming en directo** desde a URL configurada
- **Control de volume** con slider e botón de mute
- **Información do programa actual** (nome, tipo, presentador, horario)
- **Animación visual** cando está reproducindo

### Programación (Google Calendar)
- **Lista de eventos** do día actual
- **Rango de visualización**: 1 hora antes e 10 horas despois do evento actual
- **Evento actual resaltado** con punto vermello e fondo diferente
- **Enchedor de ocos**: Os espazos baleiros entre eventos énchense con "Continuidade"
- **Tipos de programa**: AO VIVO (vermello), REPET. (azul), ALHEIO (laranxa), MUSICAL (verde)

### Blog (RSS)
- **Últimas 5 entradas** do blog
- **Data de publicación** de cada entrada
- **Enlace ao blog completo**

### Redes Sociais
- **Botóns de compartir**: WhatsApp, Facebook, Telegram, X (Twitter), Instagram
- **Copiar URL** ao portapapeis
- **Enlaces rápidos** a Instagram e Facebook

### PWA (Progressive Web App)
- **Instalable** en dispositivos móbiles
- **Pantalla completa** cando se instala
- **Funciona offline** con caché básica
- **Icona personalizada** no escritorio

### Configuración
- **Textos configurables** en `texts.config.js`
- **Enlaces configurables** en `texts.config.js`
- **Calendarios múltiples** con tipos diferenciados

---

## 📁 Estrutura de Arquivos

```
REP_HTML5/
├── index.html           # Páxina principal HTML
├── app.js               # Lóxica JavaScript do frontend
├── styles.css           # Estilos CSS
├── api.php              # Backend PHP (API)
├── config.php           # Configuración (API Key, calendarios)
├── texts.config.js      # Textos e enlaces configurables
├── manifest.json        # Configuración PWA
├── service-worker.js    # Service Worker para PWA
├── icon-192.png         # Icona 192x192 (Android)
├── icon-512.png         # Icona 512x512 (Android/Splash)
└── icon-1024.png        # Icona orixinal
```

---

## 🔧 Requisitos do Sistema

### Servidor
- **PHP 7.4** ou superior
- **Extensión cURL** para PHP (peticións HTTP)
- **Extensión libxml** para PHP (procesamento XML/RSS)
- **Servidor web** (Apache, Nginx, etc.)

### APIs Externas
- **Google Calendar API Key** con acceso á API de Calendar
- Os calendarios deben ser **públicos**

### Navegador
- Navegador moderno con soporte para:
  - HTML5 Audio
  - ES6 JavaScript
  - CSS Variables
  - Service Workers (para PWA)

---

## ⚙️ Instalación

### Paso 1: Subir os arquivos

Sube todos os arquivos do directorio ao teu servidor web. Por exemplo:

```
/public_html/radio/
├── index.html
├── app.js
├── styles.css
├── api.php
├── config.php
├── texts.config.js
├── manifest.json
├── service-worker.js
└── icon-*.png
```

### Paso 2: Configurar a API Key de Google

1. Ve á [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un novo proxecto ou selecciona un existente
3. Activa a **Google Calendar API**
4. Crea unha **API Key** nas credenciais
5. (Opcional) Restrinxe a API Key ao teu dominio

### Paso 3: Configurar os calendarios

Edita o arquivo `config.php`:

```php
define('GOOGLE_API_KEY', 'A_TÚA_API_KEY_AQUÍ');

define('GOOGLE_CALENDARS', serialize([
    'calendar-id@group.calendar.google.com' => [
        'name' => 'Nome do Calendario',
        'type' => 'directo'  // ou: repeticion, alheio, musical
    ],
    // Engade máis calendarios...
]));
```

**Tipos de calendario:**
- `directo` → Emisión en directo (etiqueta vermella "AO VIVO")
- `repeticion` → Repetición (etiqueta azul "REPET.")
- `alheio` → Producción allea (etiqueta laranxa "ALHEIO")
- `musical` → Espazo musical (etiqueta verde "MUSICAL")

### Paso 4: Configurar a URL do streaming

No arquivo `config.php`:

```php
define('STREAM_URL', 'https://teu-servidor-streaming.com/stream.mp3');
```

### Paso 5: Configurar o blog RSS

No arquivo `config.php`:

```php
define('BLOG_RSS_URL', 'https://teu-blog.com/feed.rss');
```

### Paso 6: Personalizar textos e enlaces

Edita o arquivo `texts.config.js` para cambiar:

- Nome e slogan da radio
- Mensaxes de carga e erro
- Textos dos botóns
- URLs de redes sociais e blog

```javascript
TEXTS: {
    "header.title": "Nome da Túa Radio",
    "header.slogan": "O teu slogan aquí",
    // ...
},

LINKS: {
    "stream.url": "https://teu-streaming.mp3",
    "social.instagram": "https://instagram.com/tuaperfil",
    // ...
}
```

### Paso 7: Verificar a instalación

1. Abre a web no navegador
2. Comproba que carga a programación
3. Preme o botón de play e verifica que o audio funciona
4. Comproba que as entradas do blog aparecen

---

## 📱 Instalación como App (PWA)

### Android
1. Abre a web en Chrome
2. Preme no menú (tres puntos) → "Engadir a pantalla de inicio"
3. Selecciona "Instalar" para pantalla completa

### iOS (iPhone/iPad)
1. Abre a web en Safari
2. Preme no botón "Compartir"
3. Selecciona "Engadir a pantalla de inicio"

---

## 🎨 Personalización de Cores

Edita as variables CSS no arquivo `styles.css`:

```css
:root {
    --color-primary: #dc2626;        /* Cor principal (vermello) */
    --color-primary-light: #ef4444;  /* Cor principal clara */
    --color-background: #0a0a0a;     /* Fondo */
    --color-card: #18181b;           /* Fondo das tarxetas */
    --color-text: #fafafa;           /* Texto principal */
    --color-text-muted: #a1a1aa;     /* Texto secundario */
    --color-border: #3f3f46;         /* Bordos */
}
```

---

## 📋 API Endpoints

O arquivo `api.php` proporciona tres endpoints:

### 1. Programación do día
```
GET api.php?action=schedule&timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-01T23:59:59Z
```
Resposta:
```json
{
    "events": [
        {
            "title": "Nome do programa",
            "start": "2024-01-01T10:00:00",
            "end": "2024-01-01T12:00:00",
            "host": "",
            "type": "directo",
            "calendar_name": "Produción Propia"
        }
    ]
}
```

### 2. Programa actual
```
GET api.php?action=now-playing
```
Resposta:
```json
{
    "event": {
        "title": "Programa Actual",
        "start": "2024-01-01T10:00:00",
        "end": "2024-01-01T12:00:00",
        "type": "directo",
        "calendar_name": "Produción Propia"
    }
}
```

### 3. Últimas entradas do blog
```
GET api.php?action=blog
```
Resposta:
```json
{
    "posts": [
        {
            "title": "Título da entrada",
            "url": "https://blog.com/entrada",
            "date": "Mon, 01 Jan 2024 10:00:00 +0000"
        }
    ]
}
```

---

## 🔒 Seguridade

### Recomendacións

1. **Non subas o `config.php` a repositorios públicos** con datos reais
2. **Restrinxe a API Key de Google** ao teu dominio na Google Cloud Console
3. **Usa HTTPS** para que a PWA funcione correctamente
4. **Mantén PHP actualizado** á última versión estable

### Arquivos sensibles

- `config.php` - Contén a API Key de Google (non compartir)

---

## 📞 Soporte

Para dúvidas ou suxestións:
- **Email**: [contacto@ideia.gal]
- **Web**: https://ideia.gal

---

## 📄 Licenza

Este proxecto foi desenvolvido para **Rádio FilispiM** por **Ideia.gal**.

---

## 🙏 Agradecementos

- [Lucide Icons](https://lucide.dev/) - Iconos SVG
- [Google Calendar API](https://developers.google.com/calendar) - Integración de calendarios
- Comunidade de software libre

---

*Desenvolvido con ❤️ para a comunidade da Terra de Trasancos*
