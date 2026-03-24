<?php
/**
 * ============================================
 * Rádio FilispiM - API Backend
 * ============================================
 * 
 * Este arquivo é o punto de entrada para todas as peticións de datos.
 * Comunica con Google Calendar API e o RSS do blog.
 * 
 * Endpoints dispoñibles:
 * - ?action=schedule      → Programación do día
 * - ?action=now-playing   → Evento actual
 * - ?action=blog          → Últimas entradas do blog
 * 
 * @author Rádio FilispiM
 * @version 1.0
 */

// ============================================
// CABECERAS E CONFIGURACIÓN INICIAL
// ============================================

// Tipo de contido: JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// Permitir peticións desde calquera orixe (CORS)
// IMPORTANTE: En produción, considera restrinxir isto ao teu dominio
header('Access-Control-Allow-Origin: *');

// Cargar configuración (API Key, calendarios, etc.)
require_once 'config.php';

// ============================================
// ENRUTAMENTO DE ACCIÓNS
// ============================================

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'schedule':
        // Devolve a lista de eventos da programación
        getSchedule();
        break;
    
    case 'blog':
        // Devolve as últimas entradas do blog
        getBlog();
        break;
    
    case 'now-playing':
        // Devolve o evento que está a sonar agora
        getNowPlaying();
        break;
    
    default:
        // Acción non recoñecida
        echo json_encode(['error' => 'Invalid action']);
}

// ============================================
// FUNCIÓN: getSchedule()
// ============================================
/**
 * Obten os eventos de programación para un rango de tempo.
 * 
 * Parámetros GET aceptados:
 * - timeMin: Data/hora de inicio (ISO 8601). Por defecto: medianoite de hoxe
 * - timeMax: Data/hora de fin (ISO 8601). Por defecto: 7 días despois
 * 
 * Resposta JSON:
 * {
 *   "events": [
 *     {
 *       "title": "Nome do programa",
 *       "start": "2024-01-15T10:00:00",
 *       "end": "2024-01-15T12:00:00",
 *       "host": "Nome do presentador",
 *       "type": "directo|repeticion|alheio|musical",
 *       "calendar_name": "Nome do calendario"
 *     }
 *   ]
 * }
 */
function getSchedule() {
    $apiKey = GOOGLE_API_KEY;
    $calendars = unserialize(GOOGLE_CALENDARS);
    
    // Rango de tempo: usar parámetros ou valores por defecto
    $timeMin = isset($_GET['timeMin']) ? $_GET['timeMin'] : date('c', strtotime('today midnight'));
    $timeMax = isset($_GET['timeMax']) ? $_GET['timeMax'] : date('c', strtotime('+7 days'));
    
    // Array para almacenar todos os eventos
    $allEvents = [];
    
    // Percorrer cada calendario configurado
    foreach ($calendars as $calendarId => $info) {
        // Obter eventos deste calendario
        $events = fetchCalendarEvents($calendarId, $apiKey, $timeMin, $timeMax, $info['type']);
        
        // Engadir o nome do calendario a cada evento
        foreach ($events as &$event) {
            $event['calendar_name'] = $info['name'];
        }
        
        // Combinar con eventos anteriores
        $allEvents = array_merge($allEvents, $events);
    }
    
    // Ordenar eventos por data de inicio
    usort($allEvents, function($a, $b) { 
        return strtotime($a['start']) - strtotime($b['start']); 
    });
    
    // Devolver resposta JSON
    echo json_encode(['events' => array_values($allEvents)]);
}

// ============================================
// FUNCIÓN: fetchCalendarEvents()
// ============================================
/**
 * Obten eventos dun calendario específico mediante Google Calendar API.
 * 
 * @param string $calendarId   ID do calendario de Google
 * @param string $apiKey       API Key de Google
 * @param string $timeMin      Data/hora mínima (ISO 8601)
 * @param string $timeMax      Data/hora máxima (ISO 8601)
 * @param string $calendarType Tipo de programa (directo, repeticion, etc.)
 * @return array               Lista de eventos
 */
function fetchCalendarEvents($calendarId, $apiKey, $timeMin, $timeMax, $calendarType = 'directo') {
    // Construir URL da API de Google Calendar
    $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events?" . http_build_query([
        'key' => $apiKey,           // API Key para autenticación
        'timeMin' => $timeMin,      // Inicio do rango
        'timeMax' => $timeMax,      // Fin do rango
        'singleEvents' => 'true',   // Expandir eventos recurrentes
        'orderBy' => 'startTime',   // Ordenar por hora de inicio
        'maxResults' => 50          // Máximo de eventos a devolver
    ]);
    
    // Configurar petición cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_REFERER, 'https://ideia.gal/');
    
    // Executar petición
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Verificar resposta
    if ($httpCode !== 200 || !$response) {
        return []; // Erro: devolver array baleiro
    }
    
    // Decodificar JSON
    $data = json_decode($response, true);
    $events = [];
    
    // Procesar cada evento
    if (isset($data['items'])) {
        foreach ($data['items'] as $item) {
            $events[] = [
                'title' => $item['summary'] ?? 'Sen título',
                'start' => $item['start']['dateTime'] ?? $item['start']['date'],
                'end' => $item['end']['dateTime'] ?? $item['end']['date'],
                'host' => '',      // Pode enriquecerse con datos adicionais
                'type' => $calendarType, // Tipo herdado do calendario
            ];
        }
    }
    
    return $events;
}

// ============================================
// FUNCIÓN: getBlog()
// ============================================
/**
 * Obten as últimas entradas do blog mediante RSS.
 * 
 * Resposta JSON:
 * {
 *   "posts": [
 *     {
 *       "title": "Título da entrada",
 *       "url": "https://blog.com/entrada",
 *       "date": "Mon, 15 Jan 2024 10:00:00 +0000"
 *     }
 *   ]
 * }
 */
function getBlog() {
    // Configurar petición cURL ao feed RSS
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, BLOG_RSS_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    // Executar petición
    $response = curl_exec($ch);
    curl_close($ch);
    
    // Verificar resposta
    if (!$response) { 
        echo json_encode(['posts' => []]); 
        return; 
    }
    
    // Suprimir erros de XML mal formado
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($response);
    libxml_clear_errors();
    
    // Verificar que se puido analizar o XML
    if (!$xml) { 
        echo json_encode(['posts' => []]); 
        return; 
    }
    
    // Extraer información de cada entrada
    $posts = [];
    if (isset($xml->channel->item)) {
        foreach ($xml->channel->item as $item) {
            $posts[] = [
                'title' => (string)$item->title,
                'url' => (string)$item->link,
                'date' => (string)$item->pubDate
            ];
        }
    }
    
    // Devolver resposta JSON
    echo json_encode(['posts' => $posts]);
}

// ============================================
// FUNCIÓN: getNowPlaying()
// ============================================
/**
 * Obten o evento que está a sonar neste momento.
 * 
 * Busca en todos os calendarios por orde de prioridade.
 * Se non atopa ningún evento activo, devolve "Continuidade Filispiniana".
 * 
 * Resposta JSON:
 * {
 *   "event": {
 *     "title": "Nome do programa actual",
 *     "start": "2024-01-15T10:00:00",
 *     "end": "2024-01-15T12:00:00",
 *     "host": "",
 *     "type": "directo",
 *     "calendar_name": "Prog. Producçom Propria"
 *   }
 * }
 */
function getNowPlaying() {
    $apiKey = GOOGLE_API_KEY;
    $calendars = unserialize(GOOGLE_CALENDARS);
    
    // Tempo actual e rango de busca (só o día de hoxe)
    $now = date('c');
    $timeMin = date('c', strtotime('today midnight'));
    $timeMax = date('c', strtotime('tomorrow midnight'));
    
    // Buscar en cada calendario por orde de prioridade
    foreach ($calendars as $calendarId => $info) {
        $events = fetchCalendarEvents($calendarId, $apiKey, $timeMin, $timeMax, $info['type']);
        
        // Verificar se algún evento está activo agora
        foreach ($events as $event) {
            $start = strtotime($event['start']);
            $end = strtotime($event['end']);
            $nowTs = strtotime($now);
            
            // O evento está en curso: now >= start AND now < end
            if ($nowTs >= $start && $nowTs < $end) {
                $event['calendar_name'] = $info['name'];
                echo json_encode(['event' => $event]);
                return; // Saír ao encontrar o primeiro evento activo
            }
        }
    }
    
    // Se non hai ningún evento activo, devolver "Continuidade"
    echo json_encode(['event' => [
        'title' => 'Continuidade',
        'start' => date('c', strtotime('today midnight')),
        'end' => date('c', strtotime('tomorrow midnight')),
        'host' => '',
        'type' => '',
        'calendar_name' => 'Continuidade'
    ]]);
}