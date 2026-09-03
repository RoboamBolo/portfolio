// js/storage.js - Gestionnaire de stockage unifié
const StorageManager = {
    // Clé utilisée dans localStorage
    STORAGE_KEY: 'portfolio_data',
    
    // Données en mémoire
    _data: null,
    
    // Charger les données
    load() {
        // 1. Essayer depuis localStorage
        const cached = localStorage.getItem(this.STORAGE_KEY);
        if (cached) {
            try {
                this._data = JSON.parse(cached);
                console.log('📦 Données chargées depuis localStorage');
                return this._data;
            } catch (e) {
                console.warn('⚠️ Erreur de parsing localStorage', e);
            }
        }
        
        // 2. Essayer depuis le fichier JSON
        return this.loadFromFile();
    },
    
    // Charger depuis le fichier
    async loadFromFile() {
        try {
            const response = await fetch('data/content.json?t=' + Date.now());
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            this._data = data;
            // Sauvegarder dans localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            console.log('📦 Données chargées depuis content.json');
            return data;
        } catch (error) {
            console.error('❌ Erreur de chargement:', error);
            // Données minimales de secours
            this._data = this.getFallbackData();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._data));
            return this._data;
        }
    },
    
    // Sauvegarder
    save(data) {
        this._data = data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        console.log('💾 Données sauvegardées dans localStorage');
        return true;
    },
    
    // Récupérer les données
    getData() {
        if (!this._data) {
            this.load();
        }
        return this._data;
    },
    
    // Mettre à jour une valeur spécifique
    updateValue(lang, path, value) {
        if (!this._data) this.load();
        if (!this._data[lang]) this._data[lang] = {};
        
        // Parcourir le chemin
        const parts = path.split('.');
        let current = this._data[lang];
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        
        // Sauvegarder
        this.save(this._data);
        return true;
    },
    
    // Récupérer une valeur spécifique
    getValue(lang, path) {
        if (!this._data) this.load();
        if (!this._data[lang]) return undefined;
        
        const parts = path.split('.');
        let current = this._data[lang];
        for (let i = 0; i < parts.length; i++) {
            if (current && typeof current === 'object' && parts[i] in current) {
                current = current[parts[i]];
            } else {
                return undefined;
            }
        }
        return current;
    },
    
    // Données de secours
    getFallbackData() {
        return {
            "en": {
                "site": { "title": "Roboam Bolossilia" },
                "nav": {
                    "home": "Home",
                    "about": "Profile",
                    "skills": "Skills",
                    "architecture": "Architecture",
                    "projects": "Projects",
                    "methodology": "Method",
                    "gallery": "Gallery",
                    "contact": "Contact",
                    "admin": "Admin",
                    "cta": "Discuss a project"
                },
                "hero": {
                    "location": "Bangui, Central African Republic",
                    "name": "Roboam<br>Bolossilia",
                    "title": "Full-Stack Developer & Digital Solutions Architect",
                    "pitch": "I design and develop digital solutions that transform complex needs into reliable, secure and scalable systems.",
                    "cta1": "Explore my projects",
                    "cta2": "Discuss a project",
                    "cv": "Download my CV"
                },
                "about": {
                    "eyebrow": "Profile",
                    "heading": "I don't just develop applications.<br>I build solutions.",
                    "lead": "My approach always starts with the business problem before choosing the technology. A convincing interface is not enough if the system that powers it is not designed to last.",
                    "body": "Before writing the first line of code, I seek to understand who will use the system, under what conditions, with what constraints — connectivity, data volume, required security level — then I design an architecture capable of responding to them over time.",
                    "step1": "Analysis",
                    "step2": "Design",
                    "step3": "Architecture",
                    "step4": "Development",
                    "step5": "Testing & security",
                    "step6": "Deployment",
                    "step7": "Evolution"
                },
                "footer": {
                    "title": "Full-Stack Developer & Digital Solutions Architect",
                    "tagline": "Build. Secure. Evolve."
                }
            }
        };
    }
};

// Exposer globalement
window.StorageManager = StorageManager;
console.log('💾 StorageManager chargé');