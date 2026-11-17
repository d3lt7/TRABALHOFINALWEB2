// ===== CONFIGURAÇÕES GLOBAIS =====
// Quando o front é servido pelo próprio Express (porta 3000 ou deploy), usa o mesmo domínio.
// Se for aberto via Live Server / file://, aponta para o back-end local.
const isStandaloneFront = location.protocol === 'file:' ||
    (['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '3000' && location.port !== '');
const API_URL = window.TOM_API_URL || (isStandaloneFront ? 'http://localhost:3000/api' : '/api');

const ROLE_HOME = { ALUNO: 'mainUser.html', PROFESSOR: 'mainProf.html', ADMIN: 'mainAdm.html' };
const PAGE_ROLES = {
    'mainUser.html': ['ALUNO'],
    'mainProf.html': ['PROFESSOR'],
    'mainAdm.html': ['ADMIN'],
    'gerenciamento.html': ['PROFESSOR', 'ADMIN']
};

// Chamada à API com JWT. Lança Error com a mensagem devolvida pelo servidor.
async function apiRequest(path, { method = 'GET', body } = {}) {
    const headers = {};
    const token = localStorage.getItem('authToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error('Não foi possível conectar ao servidor');
    }
    const data = res.status === 204 ? null : await res.json().catch(() => ({}));
    if (!res.ok) {
        const detail = data?.details?.[0]?.message;
        const err = new Error(detail || data?.error || 'Erro na requisição');
        err.status = res.status;
        throw err;
    }
    return data;
}

function clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}


// Encerra a sessão de verdade (apaga token e usuário) e volta ao login.
function logout() {
    clearSession();
    location.href = 'login.html';
}

// Guarda de rota para páginas que não usam script.js (painéis).
// Retorna o usuário logado ou redireciona.
async function requireRole(roles) {
    if (!localStorage.getItem('authToken')) {
        location.replace('login.html');
        return new Promise(() => {});
    }
    try {
        const { user } = await apiRequest('/auth/me');
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (!roles.includes(user.role)) {
            location.replace(ROLE_HOME[user.role] || 'login.html');
            return new Promise(() => {});
        }
        return user;
    } catch (error) {
        if (error.status === 401) {
            clearSession();
            location.replace('login.html');
            return new Promise(() => {});
        }
        throw error;
    }
}
