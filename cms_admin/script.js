// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js) - V2.1 (FIX DE ABAS)
// ====================================================================

/**
 * Estrutura Unificada de Dados Padrão (Default Data)
 */
const defaultData = {
    // [CORTADO: Restante de defaultData é o mesmo]
    configuracoes: { binId: '', masterKey: '', storeStatus: 'open', whatsapp: '5511999998888', lowStockThreshold: 5, storeName: 'LabSystem Store', address: 'Rua Exemplo, 123 - Cidade, UF' },
    customizacao: { headerFooterColor: '#10B981', titleTextColor: '#FFFFFF', backgroundColor: '#f9f9f9', backgroundImageUrl: '', logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=LabSystem', musicUrl: '', musicVolume: 50 },
    categorias: [{ id: 'cat-1', name: 'Combos Especiais' }],
    produtos: [{ id: 'prod-1', name: 'X-Salada Clássico', price: 18.50, stock: 50, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200/FFCC00/000000?text=X-Salada' }],
    pagamento: { pixKey: 'sua-chave-pix-aqui', bankDetails: '', bitcoinLightning: '' },
    cobertura: [{ id: 'area-1', name: 'Centro', taxa: 5.00, tempo: 30 }],
};


class StoreManager {
    constructor() {
        this.dataKey = 'labsystem_store_data'; 
        this.data = {};
        this.currentProductId = null; 
    }

    // ====================================================================
    // INICIALIZAÇÃO E EVENT LISTENERS (ÁREA CRÍTICA)
    // ====================================================================

    init() {
        this.loadLocalData();
        this.renderFormFields(); 
        this.renderItemManagement(); 
        this.renderCoverage(); 
        this.checkLowStockAlerts(); 
        this.setupEventListeners(); // ESSENCIAL: Configura os eventos de clique
        this.switchTab('publicar'); // Define a aba inicial
    }

    setupEventListeners() {
        // Event Listeners para botões principais
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveLocalData());
        document.getElementById('publishBtn')?.addEventListener('click', () => this.publishData());
        
        // **!!! FIX PARA AS ABAS !!!**
        document.querySelectorAll('.tab-btn').forEach(btn => {
            // Verifica se o botão e o atributo data-tab existem
            const tabName = btn.getAttribute('data-tab');
            if (tabName) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(tabName);
                });
            } else {
                 console.error("Botão de aba sem atributo data-tab:", btn);
            }
        });
        
        // Event Listener para formulário do modal de cobertura
        document.getElementById('coverageForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCoverage();
        });
        
        // Event Listener para formulário do modal de produto
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
        
        // Listener para sincronizar o texto do range de volume
        document.getElementById('musicVolume')?.addEventListener('input', (e) => {
            document.getElementById('musicVolumeValue').textContent = e.target.value;
            this.collectCustomizationFields();
            this.saveLocalData();
        });

        // Adiciona listeners para sincronizar campos de cor (para a customização)
        document.getElementById('headerFooterColor')?.addEventListener('input', (e) => {
            document.getElementById('headerFooterColorText').value = e.target.value;
            this.saveLocalData();
        });
        document.getElementById('headerFooterColorText')?.addEventListener('input', (e) => {
            document.getElementById('headerFooterColor').value = e.target.value;
            this.saveLocalData();
        });
        // [CORTADO: Listeners de cor para titleTextColor e backgroundColor]
        document.getElementById('titleTextColor')?.addEventListener('input', (e) => {
            document.getElementById('titleTextColorText').value = e.target.value;
            this.saveLocalData();
        });
        document.getElementById('titleTextColorText')?.addEventListener('input', (e) => {
            document.getElementById('titleTextColor').value = e.target.value;
            this.saveLocalData();
        });
        document.getElementById('backgroundColor')?.addEventListener('input', (e) => {
            document.getElementById('backgroundColorText').value = e.target.value;
            this.saveLocalData();
        });
        document.getElementById('backgroundColorText')?.addEventListener('input', (e) => {
            document.getElementById('backgroundColor').value = e.target.value;
            this.saveLocalData();
        });
    }

    // ====================================================================
    // MÉTODOS DE TROCA DE ABA (CRÍTICO)
    // ====================================================================

    switchTab(tabName) {
        // 1. Oculta todas as seções de conteúdo
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.add('hidden');
        });
        // 2. Remove o estilo "ativo" de todos os botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active-tab', 'font-bold', 'text-indigo-600'); 
            btn.classList.add('text-gray-500');
        });

        // 3. Mostra a seção alvo
        const targetSection = document.getElementById(`tab-${tabName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        // 4. Adiciona o estilo "ativo" ao botão alvo
        const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active-tab', 'font-bold', 'text-indigo-600');
            targetButton.classList.remove('text-gray-500');
        }
    }
    
    // [CORTADO: O restante da classe (loadLocalData, saveLocalData, collect/render, CRUD de Produtos e Cobertura) permanece igual ao código anterior.]

    loadLocalData() { /* ... */ }
    saveLocalData() { /* ... */ }
    collectDataFromForms() { /* ... */ }
    collectPublicationFields() { /* ... */ }
    collectDadosLojaFields() { /* ... */ }
    collectCustomizationFields() { /* ... */ }
    renderFormFields() { /* ... */ }
    renderCoverage() { /* ... */ }
    openCoverageModal(coverageId = null) { /* ... */ }
    closeCoverageModal() { /* ... */ }
    saveCoverage() { /* ... */ }
    editCoverage(coverageId) { /* ... */ }
    deleteCoverage(coverageId) { /* ... */ }
    publishData() { /* ... */ }
    renderItemManagement() { /* ... */ }
    renderCategoriesList() { /* ... */ }
    renderProductsTable() { /* ... */ }
    addCategory() { /* ... */ }
    deleteCategory(categoryId) { /* ... */ }
    openProductModal(productId = null) { /* ... */ }
    closeProductModal() { /* ... */ }
    saveProduct() { /* ... */ }
    editProduct(productId) { /* ... */ }
    deleteProduct(productId) { /* ... */ }
    exportData() { /* ... */ }
    triggerImport() { /* ... */ }
    importData(event) { /* ... */ }
    checkLowStockAlerts() { /* ... */ }
    toast(message, className = 'bg-gray-800') { /* ... */ }
}

// ====================================================================
// INICIALIZAÇÃO ROBUSTA
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.storeManager = new StoreManager();
    window.storeManager.init(); 
});
