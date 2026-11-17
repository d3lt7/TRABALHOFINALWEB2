// Utilitários de interface compartilhados por todas as páginas.

// Escapa texto antes de colocar em innerHTML (evita XSS).
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

// '2026-11-16' -> '16/11/2026'
function formatDateBR(iso) {
    const [y, m, d] = String(iso).split('-');
    return `${d}/${m}/${y}`;
}

// Data local de hoje no formato AAAA-MM-DD.
function todayISO() {
    return new Date().toLocaleDateString('sv-SE');
}

// Aviso rápido (substitui alert()). Não depende do CSS de nenhuma página.
function showToast(message, type = 'info') {
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db' };
    const el = document.createElement('div');
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    Object.assign(el.style, {
        position: 'fixed', right: '1rem', bottom: '1rem', zIndex: 10000,
        maxWidth: 'min(90vw, 380px)', padding: '.85rem 1.1rem', borderRadius: '10px',
        background: '#111', color: '#fff', borderLeft: `4px solid ${colors[type] || colors.info}`,
        boxShadow: '0 8px 24px rgba(0,0,0,.45)', font: '500 .95rem/1.4 Inter, system-ui, sans-serif',
        opacity: 0, transform: 'translateY(8px)', transition: 'opacity .2s, transform .2s',
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'none'; });
    setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 250); }, 3500);
}

// Qualquer elemento com data-logout encerra a sessão.
document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-logout]');
    if (!el) return;
    event.preventDefault();
    logout();
});

// Menu mobile acessível por teclado (era uma <div> sem papel nem foco).
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-mobile').forEach((el) => {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', 'Abrir menu');
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });
    });
});
