/**
 * ============================================
 * Rádio FilispiM - Aplicación JavaScript
 * ============================================
 * 
 * Este arquivo manexa toda a lóxica do frontend:
 * - Reproductor de audio
 * - Carga e visualización da programación
 * - Actualización do evento actual
 * - Integración co blog
 * - Compartir en redes sociais
 * 
 * @author Rádio FilispiM
 * @version 1.0
 */

// ============================================
// REFERENCIAS A ELEMENTOS DO DOM
// ============================================
// Obtemos todas as referencias ao cargar o script.
// Se un elemento non existe, a referencia será null.

// --- Reproductor de audio ---
const audioPlayer = document.getElementById('audioPlayer');     // Elemento <audio>
const playButton = document.getElementById('playButton');       // Botón play/pause
const playIcon = document.getElementById('playIcon');           // Icono do botón
const volumeSlider = document.getElementById('volumeSlider');   // Control de volume
const volumeButton = document.getElementById('volumeButton');   // Botón mute/unmute
const volumeIcon = document.getElementById('volumeIcon');       // Icono de volume
const playerCard = document.getElementById('playerCard');       // Tarxeta do reproductor

// --- Información de tempo ---
const currentTimeEl = document.getElementById('currentTime');   // Reloxo na cabeceira

// --- Programación ---
const scheduleList = document.getElementById('scheduleList');   // Lista de eventos

// --- Blog ---
const blogList = document.getElementById('blogList');           // Lista de entradas

// --- Utilidades ---
const toast = document.getElementById('toast');                 // Mensaxe emerxente
const copyBtn = document.getElementById('copyBtn');             // Botón copiar URL
const yearEl = document.getElementById('year');                 // Ano no footer

// --- Información do programa actual ---
const programName = document.getElementById('programName');     // Nome do programa
const programType = document.getElementById('programType');     // Tipo (AO VIVO, REPET., etc.)
const hostName = document.getElementById('hostName');           // Nome do presentador
const calendarName = document.getElementById('calendarName');   // Nome do calendario
const programTime = document.getElementById('programTime');     // Hora inicio-fin

// ============================================
// VARIABLES DE ESTADO
// ============================================

let isPlaying = false;          // Indica se o audio está reproducíndose
let previousVolume = 80;        // Volume anterior (para restaurar tras mute)

// --- Control de actualización automática ---
let currentEventEndTime = null; // Hora de fin do evento actual (Date object)
let nextUpdateTimeout = null;   // Timeout para actualizar cando remate o evento

// ============================================
// INICIALIZACIÓN
// ============================================
// Execútase cando o DOM está completamente cargado

document.addEventListener('DOMContentLoaded', () => {
    // Aplicar textos e enlaces desde a configuración
    applyTextsFromConfig();
    applyLinksFromConfig();
    
    // Inicializar reproductor de audio
    initPlayer();
    
    // Iniciar reloxo e actualizalo cada segundo
    updateTime();
    setInterval(updateTime, 1000);
    
    // Cargar información do programa actual
    // Actualizar cada 60 segundos (60000 ms)
    loadNowPlaying();
    setInterval(loadNowPlaying, 60000);
    
    // Cargar programación do día
    // Actualizar cada 60 segundos para manter o "evento actual" sincronizado
    loadSchedule();
    setInterval(loadSchedule, 60000);
    
    // Cargar últimas entradas do blog
    loadBlog();
    
    // Actualizar ano no footer
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ============================================
// REPRODUCTOR DE AUDIO
// ============================================

/**
 * Inicializa os event listeners do reproductor de audio.
 */
function initPlayer() {
    // Establecer volume inicial
    audioPlayer.volume = volumeSlider.value / 100;
    
    // Evento: Click no botón play/pause
    playButton.addEventListener('click', togglePlay);
    
    // Evento: Cambio no slider de volume
    volumeSlider.addEventListener('input', (e) => { 
        audioPlayer.volume = e.target.value / 100; 
        updateVolumeIcon(e.target.value); 
    });
    
    // Evento: Click no botón de mute
    volumeButton.addEventListener('click', toggleMute);
    
    // Evento: Audio comezou a reproducirse
    audioPlayer.addEventListener('playing', () => { 
        isPlaying = true; 
        updatePlayButton(); 
        playerCard.classList.add('playing'); // Engadir animación de brillo
    });
    
    // Evento: Audio pausado
    audioPlayer.addEventListener('pause', () => { 
        isPlaying = false; 
        updatePlayButton(); 
        playerCard.classList.remove('playing'); // Quitar animación
    });
    
    // Evento: Erro ao cargar o stream
    audioPlayer.addEventListener('error', () => showToast(typeof t === 'function' ? t('error.connection', 'Erro ao conectar') : 'Erro ao conectar'));
}

/**
 * Alterna entre reproducir e pausar o audio.
 */
function togglePlay() { 
    if (isPlaying) {
        audioPlayer.pause(); 
    } else {
        audioPlayer.play().catch(() => showToast(typeof t === 'function' ? t('error.playback', 'Non se puido reproducir') : 'Non se puido reproducir')); 
    }
}

/**
 * Actualiza o icono do botón play/pause.
 * Muestra pause se está reproducindo, play se está pausado.
 */
function updatePlayButton() {
    playIcon.innerHTML = isPlaying 
        ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
        : '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>';
}

/**
 * Alterna entre mutear e desmutear o audio.
 */
function toggleMute() {
    if (audioPlayer.volume > 0) { 
        // Gardar volume actual e mutear
        previousVolume = volumeSlider.value; 
        volumeSlider.value = 0; 
        audioPlayer.volume = 0; 
    } else { 
        // Restaurar volume anterior
        volumeSlider.value = previousVolume; 
        audioPlayer.volume = previousVolume / 100; 
    }
    updateVolumeIcon(volumeSlider.value);
}

/**
 * Actualiza o icono de volume segundo o nivel.
 * 
 * @param {number} v - Nivel de volume (0-100)
 */
function updateVolumeIcon(v) {
    if (v == 0) {
        // Silenciado: icono con X
        volumeIcon.innerHTML = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="23" x2="17" y1="9" y2="15"></line><line x1="17" x2="23" y1="9" y2="15"></line>';
    } else if (v < 50) {
        // Volume baixo: unha onda
        volumeIcon.innerHTML = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M15 9a5 5 0 0 1 0 6"></path>';
    } else {
        // Volume alto: dúas ondas
        volumeIcon.innerHTML = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>';
    }
}

// ============================================
// RELOXO
// ============================================

/**
 * Actualiza o reloxo na cabeceira.
 * Muestra hora e data en formato galego.
 */
function updateTime() {
    const now = new Date();
    const t = currentTimeEl.querySelector('.time');
    const d = currentTimeEl.querySelector('.date');
    
    // Hora en formato HH:MM
    if (t) t.textContent = now.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Data en formato "lun, 15 xan"
    if (d) d.textContent = now.toLocaleDateString('gl-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ============================================
// PROGRAMACIÓN (CALENDARIO)
// ============================================

/**
 * Carga a programación desde a API.
 * Solicita eventos desde 1 hora antes ata 10 horas despois.
 */
async function loadSchedule() {
    try {
        // Calcular rango de tempo
        const now = new Date();
        const timeMin = new Date(now.getTime() - 60 * 60 * 1000);  // 1 hora antes
        const timeMax = new Date(now.getTime() + 10 * 60 * 60 * 1000);  // 10 horas despois
        
        // Construir URL con parámetros
        const params = new URLSearchParams({
            action: 'schedule',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString()
        });
        
        // Facer petición á API
        const r = await fetch('api.php?' + params.toString());
        const d = await r.json();
        
        // Renderizar eventos ou mostrar mensaxe
        if (d.events && d.events.length > 0) {
            renderSchedule(d.events);
        } else {
            scheduleList.innerHTML = '<div class="loading">' + (typeof t === 'function' ? t('schedule.empty', 'Non hai programación') : 'Non hai programación') + '</div>';
        }
    } catch (e) { 
        scheduleList.innerHTML = '<div class="loading">' + (typeof t === 'function' ? t('schedule.error', 'Erro ao cargar') : 'Erro ao cargar') + '</div>'; 
    }
}

/**
 * Renderiza a lista de eventos na programación.
 * 
 * @param {Array} events - Lista de eventos desde a API
 */
function renderSchedule(events) {
    const now = new Date();
    
    // Encher ocos baleiros con "Continuidade Filispiniana"
    const filledEvents = fillGaps(events);
    
    // Xerar HTML para cada evento
    scheduleList.innerHTML = filledEvents.map(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const isCurrent = now >= start && now <= end;  // Está a sonar agora?
        const calName = e.calendar_name || 'Rádio FilispiM';
        
        return `<div class="schedule-item ${isCurrent ? 'current' : ''}">
            <div class="schedule-item-row">
                <div class="schedule-item-info">
                    <div class="schedule-item-title">
                        ${isCurrent ? '<span class="current-dot"></span>' : ''}
                        <span class="schedule-item-name">${escapeHtml(e.title)}</span>
                        ${e.type ? `<span class="program-type ${e.type}">${getTypeLabel(e.type)}</span>` : ''}
                    </div>
                    <div class="schedule-item-host">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-small"><path d="M12 19v3"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><rect x="9" y="2" width="6" height="13" rx="3"></rect></svg>
                        <span class="host-name">${escapeHtml(e.host || '')}</span>
                        <span class="calendar-name">${escapeHtml(calName)}</span>
                    </div>
                </div>
                <div class="schedule-item-time">${start.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        </div>`;
    }).join('');
}

/**
 * Enche os ocos entre eventos con "Continuidade Filispiniana".
 * 
 * @param {Array} events - Lista de eventos
 * @returns {Array} Eventos cos ocos enchidos
 */
function fillGaps(events) {
    if (!events.length) return events;
    
    const result = [];
    
    // Calcular inicio e fin do día
    const today = new Date(events[0].start);
    const dayStart = new Date(today);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(today);
    dayEnd.setHours(23, 59, 59, 999);
    
    let lastEnd = dayStart;
    
    events.forEach(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        
        // Se hai un oco entre o último evento e este
        if (start > lastEnd) {
            result.push({
                title: 'Continuidade',
                start: lastEnd.toISOString(),
                end: start.toISOString(),
                host: '',
                type: '',
                calendar_name: 'Continuidade'
            });
        }
        
        result.push(e);
        if (end > lastEnd) lastEnd = end;
    });
    
    // Se queda tempo ata o final do día
    if (lastEnd < dayEnd) {
        result.push({
            title: 'Continuidade',
            start: lastEnd.toISOString(),
            end: dayEnd.toISOString(),
            host: '',
            type: '',
            calendar_name: 'Continuidade'
        });
    }
    
    return result;
}

// ============================================
// ETIQUETAS DE TIPO
// ============================================

/**
 * Converte o código de tipo nunha etiqueta lexible.
 * 
 * @param {string} t - Código de tipo
 * @returns {string} Etiqueta en maiúsculas
 */
function getTypeLabel(t) { 
    const labels = {
        directo: 'AO VIVO',
        repeticion: 'REPET.',
        alheio: 'ALHEIO',
        musical: 'MUSICAL'
    };
    return labels[t] || t.toUpperCase();
}

// ============================================
// EVENTO ACTUAL (NOW PLAYING)
// ============================================

/**
 * Carga o evento que está a sonar neste momento.
 */
async function loadNowPlaying() {
    try {
        const r = await fetch('api.php?action=now-playing');
        const d = await r.json();
        if (d.event) updateNowPlaying(d.event);
    } catch (e) { 
        console.error('Erro ao cargar now-playing'); 
    }
}

/**
 * Actualiza a información do evento actual no reproductor.
 * Tamén programa a seguinte actualización para 2 segundos despois
 * de que remate o evento.
 * 
 * @param {Object} e - Datos do evento
 */
function updateNowPlaying(e) {
    // Nome do programa
    if (programName) programName.textContent = e.title || 'Rádio FilispiM';
    
    // Nome do presentador
    if (hostName) hostName.textContent = e.host || '';
    
    // Nome do calendario
    if (calendarName) calendarName.textContent = e.calendar_name || '';
    
    // Etiqueta de tipo (AO VIVO, REPET., etc.)
    if (programType) {
        if (e.type) {
            programType.textContent = getTypeLabel(e.type);
            programType.className = 'program-type ' + e.type;
            programType.style.display = '';
        } else {
            programType.style.display = 'none';
        }
    }
    
    // Hora de inicio e fin
    if (programTime && e.start && e.end) {
        const start = new Date(e.start);
        const end = new Date(e.end);
        programTime.textContent = start.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' }) + ' - ' + end.toLocaleTimeString('gl-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Programar actualización automática cando remate o evento
    scheduleNextUpdate(e.end);
}

// ============================================
// CONTROL DE ACTUALIZACIÓN AUTOMÁTICA
// ============================================

/**
 * Programa a seguinte actualización para 2 segundos despois de que remate o evento.
 * Isto garante que o reproductor e o calendario se actualicen inmediatamente
 * cando cambia o programa, sen ter que esperar ata o seguinte intervalo de 60s.
 * 
 * @param {string} endTime - Hora de fin do evento en formato ISO
 */
function scheduleNextUpdate(endTime) {
    // Cancelar o timeout anterior se existe
    if (nextUpdateTimeout) {
        clearTimeout(nextUpdateTimeout);
        nextUpdateTimeout = null;
    }
    
    // Se non hai hora de fin, saír
    if (!endTime) return;
    
    const endTimeDate = new Date(endTime);
    const now = new Date();
    
    // Calcular milisegundos ata 2 segundos despois do final do evento
    // 2000ms = 2 segundos de margen para asegurar que o evento xa rematou
    const msUntilEnd = endTimeDate.getTime() - now.getTime() + 2000;
    
    // Se o tempo é positivo (o evento aínda non rematou), programar actualización
    if (msUntilEnd > 0) {
        currentEventEndTime = endTimeDate;
        
        // Programar a actualización: recargar now-playing e schedule
        nextUpdateTimeout = setTimeout(() => {
            loadNowPlaying();
            loadSchedule();
            nextUpdateTimeout = null;
        }, msUntilEnd);
    }
}

// ============================================
// BLOG
// ============================================

/**
 * Carga as últimas entradas do blog.
 */
async function loadBlog() {
    try {
        const r = await fetch('api.php?action=blog');
        const d = await r.json();
        
        if (d.posts && d.posts.length > 0) {
            // Mostrar as 5 últimas entradas
            blogList.innerHTML = d.posts.slice(0, 5).map(p => 
                `<div class="blog-item" onclick="window.open('${escapeHtml(p.url)}', '_blank')">
                    <div class="blog-item-title">${escapeHtml(p.title)}</div>
                    <div class="blog-item-date">${new Date(p.date).toLocaleDateString('gl-ES')}</div>
                </div>`
            ).join('');
        } else {
            blogList.innerHTML = '<div class="loading">' + (typeof t === 'function' ? t('blog.empty', 'Non hai novas') : 'Non hai novas') + '</div>';
        }
    } catch (e) { 
        blogList.innerHTML = '<div class="loading">' + (typeof t === 'function' ? t('blog.error', 'Erro ao cargar') : 'Erro ao cargar') + '</div>'; 
    }
}

// ============================================
// COMPARTIR EN REDES SOCIAIS
// ============================================

// WhatsApp
document.querySelector('.share-btn.whatsapp')?.addEventListener('click', () => {
    const msg = typeof t === 'function' ? t('share.message', 'Escoita Rádio FilispiM! ') : 'Escoita Rádio FilispiM! ';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg) + encodeURIComponent(location.href), '_blank');
});

// Facebook
document.querySelector('.share-btn.facebook')?.addEventListener('click', () => 
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href), '_blank'));

// Telegram
document.querySelector('.share-btn.telegram')?.addEventListener('click', () => {
    const msg = typeof t === 'function' ? t('share.message', 'Escoita Rádio FilispiM! ') : 'Escoita Rádio FilispiM! ';
    window.open('https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(msg), '_blank');
});

// X (Twitter)
document.querySelector('.share-btn.twitter')?.addEventListener('click', () => {
    const msg = typeof t === 'function' ? t('share.message', 'Escoita Rádio FilispiM! ') : 'Escoita Rádio FilispiM! ';
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg) + '&url=' + encodeURIComponent(location.href), '_blank');
});

// Copiar URL ao portapapeis
copyBtn?.addEventListener('click', () => 
    navigator.clipboard.writeText(location.href).then(() => showToast(typeof t === 'function' ? t('share.copied', 'URL copiada!') : 'URL copiada!')));

// ============================================
// UTILIDADES
// ============================================

/**
 * Muestra unha mensaxe emerxente (toast).
 * 
 * @param {string} m - Mensaxe a mostrar
 */
function showToast(m) { 
    toast.textContent = m; 
    toast.classList.add('show'); 
    setTimeout(() => toast.classList.remove('show'), 3000); 
}

/**
 * Escapa caracteres HTML para previr XSS.
 * 
 * @param {string} t - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(t) { 
    const d = document.createElement('div'); 
    d.textContent = t; 
    return d.innerHTML; 
}

// ============================================
// CONFIGURACIÓN DE TEXTOS E ENLACES
// ============================================

/**
 * Aplica os textos desde a configuración a todos os elementos con data-text-key.
 * Percorre todos os elementos que teñen o atributo data-text-key e substitúe
 * o seu contido polo texto correspondente desde CONFIG.TEXTS.
 */
function applyTextsFromConfig() {
    // Verificar que existe a configuración
    if (typeof CONFIG === 'undefined' || !CONFIG.TEXTS) return;
    
    // Buscar todos os elementos con data-text-key
    document.querySelectorAll('[data-text-key]').forEach(el => {
        const key = el.getAttribute('data-text-key');
        const text = CONFIG.TEXTS[key];
        
        // Se existe o texto na configuración, aplicalo
        if (text !== undefined) {
            el.textContent = text;
        }
    });
}

/**
 * Aplica os enlaces desde a configuración a todos os elementos con data-link-key.
 * Percorre todos os elementos que teñen o atributo data-link-key e substitúe
 * o seu href polo enlace correspondente desde CONFIG.LINKS.
 */
function applyLinksFromConfig() {
    // Verificar que existe a configuración
    if (typeof CONFIG === 'undefined' || !CONFIG.LINKS) return;
    
    // Buscar todos os elementos con data-link-key
    document.querySelectorAll('[data-link-key]').forEach(el => {
        const key = el.getAttribute('data-link-key');
        const url = CONFIG.LINKS[key];
        
        // Se existe o enlace na configuración, aplicalo
        if (url !== undefined && el.tagName === 'A') {
            el.href = url;
        }
        
        // Para o elemento de audio, actualizar o src
        if (url !== undefined && el.tagName === 'AUDIO') {
            el.src = url;
        }
    });
}