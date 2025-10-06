// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js)
// ====================================================================

/**
 * Estrutura Unificada de Dados Padrão (Default Data)
 * Esta estrutura será usada se não houver nada no localStorage.
 */
const defaultData = {
    // --- 1. CONFIGURAÇÃO DE PUBLICAÇÃO (CMS) ---
    configuracoes: {
        binId: '', // O ID do Bin da loja (será lido do input)
        masterKey: '', // A chave para Escrita (Master Key do JSONBin)
        storeStatus: 'open', // open | closed
        whatsapp: '5511999998888',
        lowStockThreshold: 5,
        // ... outras configurações gerais
    },

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) ---
    customizacao: {
        colorPrimary: '#10B981', // Ex: Cor Verde Esmeralda (Principal)
        colorSecondary: '#059669', // Ex: Cor Verde Escuro
        backgroundColor: '#f9f9f9',
        logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=Logo',
    },

    // --- 3. ITENS E CARDÁPIO (TOTEM) ---
    // A estrutura unificada de produtos e preços do McClone
    categorias: [
        { id: 'cat-1', name: 'Combos Especiais' },
        { id: 'cat-2', name: 'Hambúrgueres' }
    ],
    produtos: [
        { id: 'prod-1', name: 'X-Salada Clássico', price: 18.50, stock: 50, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200?text=X-Salada' },
        { id: 'prod-2', name: 'Batata Média', price: 8.00, stock: 100, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200?text=Batata' }
    ],

    // --- 4. DADOS DE PAGAMENTO ---
    pagamento: {
        pixKey: 'sua-chave-pix-aqui',
        bankDetails: 'Banco X, Ag 0001, C/C 12345-6',
        bitcoinLightning: '' // Suporte a Bitcoin Lightning
    },

    // ... Outras seções como cupons, publicidade, etc.
};


class StoreManager {
    constructor() {
        this.dataKey = 'labsystem_store_data'; // Chave mestra no localStorage
        this.data = {};
        this.init();
    }

    // Inicializa: Tenta carregar dados locais ou usa defaults.
    init() {
        this.loadLocalData();
        this.setupEventListeners();
        this.renderFormFields(); // Atualiza a UI com os dados carregados
        this.switchTab('publicar'); // Começa na aba mais importante para o fluxo inicial
    }

    // ====================================================================
    // MÉTODOS DE PERSISTÊNCIA LOCAL (LOCAL STORAGE)
    // ====================================================================

    // Carrega dados do localStorage ou usa o default
    loadLocalData() {
        try {
            const savedData = localStorage.getItem(this.dataKey);
            if (savedData) {
                this.data = JSON.parse(savedData);
                console.log('Dados carregados do LocalStorage.');
            } else {
                this.data = JSON.parse(JSON.stringify(defaultData)); // Deep copy do default
                console.log('Dados padrão carregados.');
            }
        } catch (e) {
            console.error('Erro ao carregar dados locais:', e);
            this.data = JSON.parse(JSON.stringify(defaultData));
        }
    }

    // Salva o estado atual para o localStorage
    saveLocalData() {
        try {
            // Antes de salvar, garantir que os campos de Publicação (BIN ID/KEY) estão na memória
            this.collectPublicationFields(); 
            
            localStorage.setItem(this.dataKey, JSON.stringify(this.data));
            this.toast('✅ Dados salvos localmente!', 'bg-indigo-500');
        } catch (e) {
            this.toast('❌ Erro ao salvar dados localmente.', 'bg-red-500');
            console.error('Erro ao salvar no LocalStorage:', e);
        }
    }

    // Coleta os valores do formulário e atualiza o objeto this.data
    // Esta é uma função placeholder que você irá expandir
    collectDataFromForms() {
        // [PASSO 3.3] IMPLEMENTAR A COLETA DE TODOS OS CAMPOS DO CMS PARA 'this.data'
        this.collectPublicationFields(); // Por agora, apenas os campos de publicação
        this.collectCustomizationFields();
        // ... outros campos (itens, pagamento, etc)
    }

    // Coleta BIN ID e Master Key (CRÍTICO)
    collectPublicationFields() {
        const binId = document.getElementById('binId')?.value || '';
        const masterKey = document.getElementById('masterKey')?.value || '';
        
        this.data.configuracoes.binId = binId;
        this.data.configuracoes.masterKey = masterKey;
    }

    // ====================================================================
    // MÉTODOS DE SINCRONIZAÇÃO REMOTA (JSONBIN) - Próximo Passo
    // ====================================================================

    async publishData() {
        this.collectDataFromForms(); // Coleta todos os dados mais recentes

        const { binId, masterKey } = this.data.configuracoes;

        if (!binId || !masterKey) {
            this.toast('❌ BIN ID e Master Key são obrigatórios para Publicar.', 'bg-red-500');
            return;
        }

        // 1. Salva localmente (Garantia de que o trabalho está salvo)
        this.saveLocalData(); 

        // 2. Publica no JSONBin
        const url = `https://api.jsonbin.io/v3/b/${binId}`;
        this.toast('⏳ Publicando no JSONBin...');

        try {
            const response = await fetch(url, {
                method: 'PUT', // Atualiza o conteúdo do Bin
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey, // Chave Secreta para Escrita
                },
                body: JSON.stringify(this.data)
            });

            if (response.ok) {
                this.toast('🎉 Publicado com sucesso no JSONBin!', 'bg-green-500');
            } else {
                const error = await response.json();
                this.toast(`❌ Erro ${response.status}: ${error.message || 'Falha na publicação.'}`, 'bg-red-500');
            }
        } catch (error) {
            this.toast('❌ Erro de conexão de rede ou JSONBin.', 'bg-red-500');
            console.error('JSONBin Error:', error);
        }
    }
    
    // ====================================================================
    // MÉTODOS DE UI E UTILIDADES
    // ====================================================================

    // Renderiza os valores de this.data nos campos de formulário (CMS)
    renderFormFields() {
        // 1. Campos de Publicação
        if (document.getElementById('binId')) {
            document.getElementById('binId').value = this.data.configuracoes.binId;
            document.getElementById('masterKey').value = this.data.configuracoes.masterKey; // A Master Key pode ser sensível, mas salva localmente para conveniência.
        }
        
        // 2. Outros campos de Customização, etc. (A SER IMPLEMENTADO)
    }
    
    // Funções de Utilitário para UI
    toast(message, className = 'bg-gray-800') {
        const toastEl = document.createElement('div');
        toastEl.className = `fixed bottom-4 right-4 text-white p-3 rounded-lg shadow-xl ${className} z-50 transition-opacity duration-300`;
        toastEl.textContent = message;
        document.body.appendChild(toastEl);
        
        setTimeout(() => {
            toastEl.style.opacity = 0;
            setTimeout(() => toastEl.remove(), 300);
        }, 3000);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active-tab', 'text-indigo-600', 'font-bold');
        });

        const targetSection = document.getElementById(`tab-${tabName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active-tab', 'text-indigo-600', 'font-bold');
        }
    }

    setupEventListeners() {
        // Event Listeners para botões principais
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveLocalData());
        document.getElementById('publishBtn')?.addEventListener('click', () => this.publishData());
        // document.getElementById('visitBtn')?.addEventListener('click', () => window.open('/totem/index.html', '_blank'));
        
        // Event Listeners para abas de navegação
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });
    }
}

// Inicialização da aplicação
const storeManager = new StoreManager();
