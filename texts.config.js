/**
 * ============================================
 * Rádio FilispiM - Configuración de Textos e Enlaces
 * ============================================
 * 
 * Este arquivo contén todos os textos e enlaces configurables da webapp.
 * Modifica os valores aquí e veranse reflectidos automaticamente.
 * 
 * @author Rádio FilispiM
 * @version 1.0
 */

const CONFIG = {
    
    // ============================================
    // TEXTOS DA WEBAPP
    // ============================================
    // Cada texto ten unha clave que se usa no HTML con data-text-key="clave"
    
    TEXTS: {
        // --- Meta tags ---
        "meta.description": "Rádio FilispiM - A rádio livre e comunitária da Terra de Trasancos. 102.3 FM",
        "meta.og.title": "Rádio FilispiM, 102.3FM",
        "meta.og.description": "A rádio livre e comunitária da Terra de Trasancos",
        "page.title": "Rádio FilispiM, 102.3FM",
        
        // --- Header ---
        "header.title": "Rádio FilispiM, 102.3FM",
        "header.slogan": "A rádio livre e comunitária da Terra de Trasancos",
        "header.live": "NO AR",
        
        // --- Player ---
        "player.default_name": "Rádio FilispiM",
        "player.fm_info": "Também no",
        "player.fm_frequency": "102.3 FM",
        "player.fm_region": "da Terra de Trasancos",
        
        // --- Programación ---
        "schedule.title": "📻 O que vai soar hoxe",
        "schedule.loading": "Cargando programaçom...",
        "schedule.empty": "Nom hai programaçom",
        "schedule.error": "Erro ao carregar",
        
        // --- Tipos de programa ---
        "type.directo": "AO VIVO",
        "type.repeticion": "REPET.",
        "type.alheio": "ALHEIO",
        "type.musical": "MUSICAL",
        
        // --- Continuidade ---
        "continuidade.title": "Continuidade",
        "continuidade.name": "Continuidade",
        
        // --- Blog ---
        "blog.title": "🔗 Últimas novas",
        "blog.loading": "Cargando...",
        "blog.empty": "Nom hai novas",
        "blog.error": "Erro ao carregar",
        "blog.view_all": "Ver todo o blog →",
        
        // --- Enlaces rápidos ---
        "links.blog": "Blog",
        "links.instagram": "Instagram",
        "links.facebook": "Facebook",
        
        // --- Compartir ---
        "share.whatsapp": "WhatsApp",
        "share.facebook": "Facebook",
        "share.telegram": "Telegram",
        "share.twitter": "X",
        "share.instagram": "Instagram",
        "share.copy": "Copiar",
        "share.message": "Escoita Rádio FilispiM! ",
        "share.copied": "URL copiada!",
        
        // --- Erros ---
        "error.connection": "Erro ao conetar",
        "error.playback": "Nom se puido reproducir",
        
        // --- Footer ---
        "footer.name": "Rádio FilispiM, 102.3FM",
        "footer.fm": "102.3 FM - Terra de Trasancos",
        "footer.copy": "©"
    },
    
    // ============================================
    // ENLACES DA WEBAPP
    // ============================================
    // Cada enlace ten unha clave que se usa no HTML con data-link-key="clave"
    
    LINKS: {
        // --- Streaming ---
        "stream.url": "https://streaming.cuacfm.org/filispim.mp3",
        
        // --- Blog ---
        "blog.url": "https://opaii.blogspot.com/",
        "rss.url": "https://opaii.blogspot.com/feeds/posts/default?alt=rss",
        
        // --- Redes sociais ---
        "social.instagram": "https://www.instagram.com/radiofilispim",
        "social.facebook": "https://www.facebook.com/radiofilispim",
        
        // --- Compartir ---
        "share.whatsapp": "https://wa.me/?text=",
        "share.facebook": "https://www.facebook.com/sharer/sharer.php?u=",
        "share.telegram": "https://t.me/share/url?url=",
        "share.twitter": "https://twitter.com/intent/tweet?text="
    }
};

// ============================================
// FUNCIÓNS DE ACCESO
// ============================================

/**
 * Obten un texto desde a configuración.
 * 
 * @param {string} key - Clave do texto (ex: "header.title")
 * @param {string} fallback - Valor por defecto se non existe
 * @returns {string} Texto configurado ou fallback
 */
function t(key, fallback = '') {
    return CONFIG.TEXTS[key] || fallback;
}

/**
 * Obten un enlace desde a configuración.
 * 
 * @param {string} key - Clave do enlace (ex: "stream.url")
 * @param {string} fallback - Valor por defecto se non existe
 * @returns {string} Enlace configurado ou fallback
 */
function l(key, fallback = '') {
    return CONFIG.LINKS[key] || fallback;
}

/**
 * Obten a configuración completa.
 * @returns {Object} Configuración completa
 */
function getConfig() {
    return CONFIG;
}
