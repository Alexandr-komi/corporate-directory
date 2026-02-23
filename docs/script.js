function updateStats(data) {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    // Если data массив (несколько районов)
    if (Array.isArray(data)) {
        const totalSettlements = data.reduce((sum, district) => 
            sum + (district.settlements?.length || 0), 0);
        
        stats.innerHTML = `
            <div class="stats-panel">
                <span>🏘️ Поселений: <strong>${totalSettlements}</strong></span>
                <span>🗺️ Районов: <strong>${data.length}</strong></span>
            </div>
        `;
    } 
    // Если data объект (один район)
    else if (data && data.settlements) {
        stats.innerHTML = `
            <div class="stats-panel">
                <span>🏘️ Поселений: <strong>${data.settlements.length}</strong></span>
                <span>📍 Район: <strong>${data.district}</strong></span>
            </div>
        `;
    }
}