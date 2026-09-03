// i18n.js - Système multilingue avec StorageManager
class I18n {
    constructor() {
        // Langue par défaut : anglais
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.data = null;
        this.supportedLangs = ['fr', 'en', 'ar', 'ru'];
        this.isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        this.init();
    }

    async init() {
        try {
            // ===== UTILISER StorageManager =====
            console.log('📦 Chargement des données via StorageManager...');
            
            // Essayer de récupérer les données depuis StorageManager
            this.data = StorageManager.getData();
            
            // Si pas de données, charger depuis le fichier
            if (!this.data) {
                console.log('📡 Chargement depuis content.json...');
                this.data = await StorageManager.loadFromFile();
            } else {
                console.log('📦 Données chargées depuis localStorage via StorageManager');
            }
            
            // 🔥 APPLIQUER LA LANGUE IMMÉDIATEMENT
            this.applyLanguage(this.currentLang);
            this.setupLanguageSwitcher();
            this.setupAdminButton();
            this.updateTitle();
            
            // Forcer la mise à jour des projets
            this.updateProjects(this.currentLang);
            
            console.log('✅ Langue appliquée:', this.currentLang);
            
        } catch (error) {
            console.error('❌ I18n initialization error:', error);
            
            // Dernier recours : utiliser les données de fallback
            try {
                this.data = StorageManager.getFallbackData();
                localStorage.setItem('contentData', JSON.stringify(this.data));
                console.log('📦 Utilisation des données de fallback');
                this.applyLanguage(this.currentLang);
                this.setupLanguageSwitcher();
                this.setupAdminButton();
                this.updateTitle();
                this.updateProjects(this.currentLang);
            } catch (e) {
                console.error('❌ Erreur de chargement des données de fallback:', e);
            }
        }
    }

    /**
     * Applique une langue à toute la page
     * @param {string} lang - Code de langue ('fr', 'en', 'ar', 'ru')
     */
    applyLanguage(lang) {
        if (!this.data || !this.data[lang]) {
            console.warn(`⚠️ Language ${lang} not found, falling back to English`);
            lang = 'en';
        }
        
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // RTL support pour l'arabe
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        
        // 🔥 Mettre à jour TOUS les éléments avec data-i18n (innerHTML pour <br> et <span>)
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.innerHTML = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });

        // 🔥 Mettre à jour les placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.placeholder = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });

        // 🔥 Mettre à jour les attributs alt des images
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.alt = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });

        // 🔥 Mettre à jour les attributs title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.title = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });

        // 🔥 Mettre à jour les labels des formulaires
        document.querySelectorAll('[data-i18n-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-label');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.textContent = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });

        // Mettre à jour le titre de la page
        this.updateTitle();

        // Mettre à jour les projets
        this.updateProjects(lang);

        // Mettre à jour le select
        const select = document.getElementById('languageSelect');
        if (select) {
            select.value = lang;
        }

        // Mettre à jour le bouton admin
        this.setupAdminButton();

        // 🔥 Forcer une nouvelle tentative après un court délai (pour les éléments chargés dynamiquement)
        setTimeout(() => {
            this.applyLanguageToNewElements(lang);
        }, 100);
    }

    /**
     * Applique la langue aux éléments qui auraient été ajoutés dynamiquement
     */
    applyLanguageToNewElements(lang) {
        document.querySelectorAll('[data-i18n]:not([data-i18n-applied])').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = StorageManager.getValue(lang, key);
            if (value !== undefined && value !== null) {
                element.innerHTML = value;
                element.setAttribute('data-i18n-applied', 'true');
            }
        });
    }

    /**
     * Récupère une valeur imbriquée dans un objet
     * @param {Object} obj - L'objet contenant les données
     * @param {string} path - Le chemin vers la valeur (ex: 'nav.home')
     * @returns {string|undefined} La valeur trouvée ou undefined
     */
    getNestedValue(obj, path) {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object' && key in current) {
                return current[key];
            }
            return undefined;
        }, obj);
    }

    /**
     * Met à jour la grille des projets avec images depuis localStorage
     */
    updateProjects(lang) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        const projects = this.data[lang]?.projects;
        if (!projects) return;
        
        // Exclure les clés qui ne sont pas des projets
        const excludeKeys = ['title', 'eyebrow', 'heading', 'status', 'status_label'];
        const projectKeys = Object.keys(projects).filter(key => !excludeKeys.includes(key));
        
        if (projectKeys.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:#999;">No projects found</p>';
            return;
        }
        
        grid.innerHTML = projectKeys.map((key, index) => {
            const project = projects[key];
            const imageNumber = index + 1;
            const desc = project.solution || project.description || project.problem || 'No description';
            const eyebrow = project.eyebrow || '';
            const title = project.title || 'Untitled';
            
            // 🔥 VÉRIFIER SI L'IMAGE EST DANS localStorage
            const imageId = project.imageId || project.id || 'project_' + imageNumber;
            const cachedImage = localStorage.getItem('gallery_image_' + imageId);
            let imageSrc = '../assets/gallery/' + (project.image || 'projet' + imageNumber + '.jpg');
            
            // Si l'image est dans localStorage, l'utiliser
            if (cachedImage) {
                imageSrc = cachedImage;
            }
            
            return `
                <article class="case-study reveal">
                    <div class="case-study__head">
                        <div>
                            ${eyebrow ? `<p class="case-study__eyebrow">${eyebrow}</p>` : ''}
                            <h3>${title}</h3>
                        </div>
                        <span class="status-pill" data-status="tbd">${projects.status?.tbd || 'Status to be confirmed'}</span>
                    </div>
                    <div class="case-study__grid">
                        <div>
                            <h4>${this.data[lang]?.projects?.sifgc?.context_label || 'Context'}</h4>
                            <p>${project.context || 'No context available'}</p>
                            <h4>${this.data[lang]?.projects?.sifgc?.problem_label || 'Problem'}</h4>
                            <p>${project.problem || 'No problem described'}</p>
                            <h4>${this.data[lang]?.projects?.sifgc?.solution_label || 'Solution'}</h4>
                            <p>${project.solution || 'No solution described'}</p>
                        </div>
                        <div>
                            <h4>${this.data[lang]?.projects?.sifgc?.features_label || 'Key features'}</h4>
                            <ul class="check-list">
                                ${project.features ? project.features.map(f => `<li>${f}</li>`).join('') : '<li>No features listed</li>'}
                            </ul>
                            <h4>${this.data[lang]?.projects?.sifgc?.tech_label || 'Technologies'}</h4>
                            <div class="tag-row">
                                ${project.tech ? project.tech.map(t => `<span>${t}</span>`).join('') : '<span>No technologies specified</span>'}
                            </div>
                            ${project.arch ? `
                                <h4>${this.data[lang]?.projects?.sina?.arch_label || 'Architecture'}</h4>
                                <p class="mini-arch">${project.arch}</p>
                            ` : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    /**
     * Configure le sélecteur de langue
     */
    setupLanguageSwitcher() {
        const select = document.getElementById('languageSelect');
        if (!select) return;
        
        // Éviter les doublons d'écouteurs
        select.removeEventListener('change', this._languageChangeHandler);
        this._languageChangeHandler = () => {
            this.applyLanguage(select.value);
        };
        select.addEventListener('change', this._languageChangeHandler);
    }

    /**
     * Configure l'affichage du bouton admin
     */
    setupAdminButton() {
        const adminLink = document.getElementById('admin-link');
        if (!adminLink) return;
        
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (isAdmin) {
            adminLink.style.display = 'inline-block';
            adminLink.href = 'admin/dashboard.html';
        } else {
            adminLink.style.display = 'none';
        }
    }

    /**
     * Met à jour le titre de la page
     */
    updateTitle() {
        const title = this.data?.[this.currentLang]?.site?.title;
        if (title) {
            document.title = title;
        }
    }

    /**
     * Retourne la langue actuelle
     * @returns {string} Code de la langue
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Retourne les données de traduction pour une langue donnée
     * @param {string} lang - Code de la langue
     * @returns {Object} Données de traduction
     */
    getTranslations(lang) {
        return this.data?.[lang] || null;
    }

    /**
     * Récupère une traduction spécifique
     * @param {string} key - Clé de la traduction (ex: 'nav.home')
     * @param {string} lang - Code de la langue (optionnel, utilise la langue courante par défaut)
     * @returns {string} La traduction ou la clé si non trouvée
     */
    translate(key, lang) {
        const targetLang = lang || this.currentLang;
        return StorageManager.getValue(targetLang, key) || key;
    }

    /**
     * Rafraîchit les traductions à partir du cache localStorage
     * Utile après une mise à jour des données
     */
    refreshFromCache() {
        const cached = StorageManager.getData();
        if (cached) {
            try {
                this.data = cached;
                console.log('🔄 Données rafraîchies depuis localStorage via StorageManager');
                this.applyLanguage(this.currentLang);
                return true;
            } catch (e) {
                console.error('❌ Erreur lors du rafraîchissement du cache:', e);
                return false;
            }
        }
        return false;
    }

    /**
     * Force le rechargement des données depuis le serveur
     */
    async reloadFromServer() {
        try {
            console.log('📡 Rechargement des traductions depuis le serveur...');
            this.data = await StorageManager.loadFromFile();
            console.log('💾 Données rechargées via StorageManager');
            this.applyLanguage(this.currentLang);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du rechargement:', error);
            return false;
        }
    }

    /**
     * Vérifie si StorageManager est disponible
     */
    isStorageManagerAvailable() {
        return typeof StorageManager !== 'undefined';
    }
}

// ==================== GESTION DES IMAGES UPLOADÉES ====================

/**
 * Récupère une image uploadée depuis localStorage
 * @param {string} imageId - L'ID de l'image (ex: 'gallery_1693752000000')
 * @returns {string|null} - L'URL de l'image (base64) ou null
 */
function getUploadedImage(imageId) {
    try {
        const imageData = localStorage.getItem('gallery_image_' + imageId);
        if (imageData) {
            return imageData;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Vérifie si une image est disponible dans localStorage
 * @param {string} imageId - L'ID de l'image
 * @returns {boolean}
 */
function hasUploadedImage(imageId) {
    return localStorage.getItem('gallery_image_' + imageId) !== null;
}

/**
 * Récupère l'URL d'une image (priorité: localStorage > assets)
 * @param {string} imageId - L'ID de l'image
 * @param {string} fallbackPath - Chemin de l'image dans assets
 * @returns {string} - L'URL de l'image
 */
function getImageUrl(imageId, fallbackPath) {
    const cached = getUploadedImage(imageId);
    if (cached) {
        return cached;
    }
    return fallbackPath || '../assets/gallery/default.jpg';
}

/**
 * Récupère toutes les images uploadées
 * @returns {Object} - Objet contenant toutes les images
 */
function getAllUploadedImages() {
    const images = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gallery_image_')) {
            const imageId = key.replace('gallery_image_', '');
            images[imageId] = localStorage.getItem(key);
        }
    }
    return images;
}

/**
 * Supprime une image uploadée
 * @param {string} imageId - L'ID de l'image
 * @returns {boolean}
 */
function deleteUploadedImage(imageId) {
    try {
        localStorage.removeItem('gallery_image_' + imageId);
        return true;
    } catch (e) {
        console.error('❌ Erreur lors de la suppression de l\'image:', e);
        return false;
    }
}

/**
 * Sauvegarde une image dans localStorage
 * @param {string} imageId - L'ID de l'image
 * @param {string} base64Data - Les données de l'image en base64
 * @returns {boolean}
 */
function saveUploadedImage(imageId, base64Data) {
    try {
        localStorage.setItem('gallery_image_' + imageId, base64Data);
        return true;
    } catch (e) {
        console.error('❌ Erreur lors de la sauvegarde de l\'image:', e);
        return false;
    }
}

// Exposer les fonctions globalement
window.getUploadedImage = getUploadedImage;
window.hasUploadedImage = hasUploadedImage;
window.getImageUrl = getImageUrl;
window.getAllUploadedImages = getAllUploadedImages;
window.deleteUploadedImage = deleteUploadedImage;
window.saveUploadedImage = saveUploadedImage;

// ============================================================
// 🔥 INITIALISATION IMMÉDIATE AVANT DOMContentLoaded
// ============================================================

// Stocker l'instance pour l'utiliser plus tard
let i18nInstance = null;

// Fonction d'initialisation
function initI18n() {
    if (i18nInstance) return i18nInstance;
    
    // Vérifier que StorageManager existe
    if (typeof StorageManager === 'undefined') {
        console.error('❌ StorageManager non trouvé! Vérifiez que storage-manager.js est chargé avant i18n.js');
        return null;
    }
    
    i18nInstance = new I18n();
    return i18nInstance;
}

// 🔥 Option 1: Initialiser immédiatement si le DOM est déjà chargé
if (document.readyState === 'loading') {
    // Le DOM est en cours de chargement, attendre DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    // Le DOM est déjà chargé, initialiser immédiatement
    initI18n();
}

// 🔥 Option 2: Initialiser également dès que possible (pour les navigateurs rapides)
if (document.readyState !== 'complete') {
    // Si la page n'est pas encore complètement chargée, on s'assure que l'initialisation se fera
    // même si DOMContentLoaded est déjà passé
    setTimeout(() => {
        if (!i18nInstance) {
            console.warn('⚠️ i18n non initialisé, tentative forcée...');
            initI18n();
        }
    }, 500);
}

// Exposer i18n dans la console pour le debug
console.log('🌐 i18n chargé - Langue par défaut: English');
console.log('💡 Tapez window.i18n pour accéder à l\'instance');
console.log('💡 Tapez window.i18n.translate("nav.home") pour traduire');

// ============================================================
// UTILITAIRES POUR LE DEBUG
// ============================================================

// Fonction pour changer rapidement de langue depuis la console
window.setLanguage = function(lang) {
    if (i18nInstance) {
        i18nInstance.applyLanguage(lang);
        console.log(`✅ Langue changée pour: ${lang}`);
    } else {
        console.error('❌ i18n n\'est pas encore initialisé');
    }
};

// Fonction pour afficher la langue actuelle
window.getCurrentLanguage = function() {
    if (i18nInstance) {
        console.log(`🌐 Langue actuelle: ${i18nInstance.getLanguage()}`);
        return i18nInstance.getLanguage();
    }
    console.error('❌ i18n n\'est pas encore initialisé');
    return null;
};

// Fonction pour rafraîchir depuis le cache
window.refreshTranslations = function() {
    if (i18nInstance) {
        const result = i18nInstance.refreshFromCache();
        console.log(result ? '✅ Traductions rafraîchies' : '❌ Erreur lors du rafraîchissement');
        return result;
    }
    console.error('❌ i18n n\'est pas encore initialisé');
    return false;
};

// Fonction pour recharger depuis le serveur
window.reloadTranslations = async function() {
    if (i18nInstance) {
        const result = await i18nInstance.reloadFromServer();
        console.log(result ? '✅ Traductions rechargées depuis le serveur' : '❌ Erreur lors du rechargement');
        return result;
    }
    console.error('❌ i18n n\'est pas encore initialisé');
    return false;
};

console.log('💡 Commandes disponibles:');
console.log('  - setLanguage("en")   pour changer en anglais');
console.log('  - setLanguage("fr")   pour changer en français');
console.log('  - setLanguage("ar")   pour changer en arabe');
console.log('  - setLanguage("ru")   pour changer en russe');
console.log('  - getCurrentLanguage() pour afficher la langue actuelle');
console.log('  - refreshTranslations() pour rafraîchir depuis localStorage');
console.log('  - reloadTranslations()  pour recharger depuis le serveur');
console.log('🖼️ Commandes images uploadées:');
console.log('  - getUploadedImage("id")  pour récupérer une image');
console.log('  - hasUploadedImage("id")  pour vérifier si une image existe');
console.log('  - getAllUploadedImages()  pour lister toutes les images');
console.log('  - deleteUploadedImage("id") pour supprimer une image');