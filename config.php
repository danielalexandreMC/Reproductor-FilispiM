<?php
/**
 * Rádio FilispiM - Configuración
 * 
 * IMPORTANTE: Non subas este arquivo a repositorios públicos
 * con datos reais. Usa valores de exemplo e configura no servidor.
 */

// API Key de Google Calendar
define('GOOGLE_API_KEY', 'AQUI A TUA API KEY DE GOOGLE');

// Calendarios: ID => ['name' => 'Nome', 'type' => 'tipo']
define('GOOGLE_CALENDARS', serialize([
    'calendar-id@group.calendar.google.com' => ['name' => 'Prog. Producçom Propria', 'type' => 'directo'],
    'calendar-id@group.calendar.google.com' => ['name' => 'Prog. Producçom Propria', 'type' => 'repeticion'],
    'calendar-id@group.calendar.google.com' => ['name' => 'Prog. Producçom Alheia', 'type' => 'alheio'],
    'calendar-id@group.calendar.google.com' => ['name' => 'Espazos Musicais', 'type' => 'musical'],
    'calendar-id@group.calendar.google.com' => ['name' => 'Informativos', 'type' => ''],
    'calendar-id@group.calendar.google.com' => ['name' => 'Continuidade', 'type' => 'musical'],
]));

// URL do stream de audio
define('STREAM_URL', 'https://streaming.cuacfm.org/filispim.mp3');

// URL do blog RSS
define('BLOG_RSS_URL', 'https://opaii.blogspot.com/feeds/posts/default?alt=rss');

// Timezone
define('TIMEZONE', 'Europe/Madrid');


/**
 * INSTRUCCIÓNS DE CONFIGURACIÓN:
 * 
 * 1. Substitúe 'AQUI A TUA API KEY DE GOOGLE' pola túa API Key de Google
 * 
 * 2. Substitúe os calendar_ids polos IDs reais dos teus calendarios
 *    - Ve a Google Calendar
 *    - Configuración do calendario → Integrar calendario → ID do calendario
 * 
 * 3. Os calendarios deben ser PÚBLICOS para que a API funcione
 * 
 * 4. A API Key pode estar restrinxida:
 *    - Por dominio (recomendado)
 *    - Por APIs (só Google Calendar API)
 */