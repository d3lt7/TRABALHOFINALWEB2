// Painel do aluno: lista real das próximas aulas, com opção de cancelar.
(async () => {
    const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const BADGE = {
        AGENDADA: ['badge-agendado', 'Agendada'],
        CONCLUIDA: ['badge-concluida', 'Concluída'],
        CANCELADA: ['badge-cancelada', 'Cancelada'],
    };
    const box = document.querySelector('#minhas-aulas .classes-list');
    if (!box) return;

    async function render() {
        try {
            const lessons = await apiRequest('/lessons');
            const upcoming = lessons
                .filter((l) => l.date >= todayISO() && l.status !== 'CANCELADA')
                .slice(0, 5);
            box.innerHTML = upcoming.length
                ? upcoming.map((l) => {
                    const [, month, day] = l.date.split('-');
                    const [cls, label] = BADGE[l.status];
                    return `
                    <div class="class-item">
                        <div class="class-date"><span class="day">${day}</span><span class="month">${MONTHS[Number(month) - 1]}</span></div>
                        <div class="class-details">
                            <h4>${escapeHtml(l.instrument.name)}</h4>
                            <p>${formatDateBR(l.date)}, ${escapeHtml(l.time)} - Prof. ${escapeHtml(l.teacher.name)}</p>
                        </div>
                        <div class="class-status">
                            <span class="badge ${cls}">${label}</span>
                            ${l.status === 'AGENDADA' ? `<button type="button" class="btn-small" data-cancel="${l.id}">Cancelar</button>` : ''}
                        </div>
                    </div>`;
                }).join('')
                : '<p style="opacity:.7">Você não tem aulas agendadas. Use o botão "Agendar".</p>';
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    box.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-cancel]');
        if (!btn || !confirm('Cancelar esta aula?')) return;
        btn.disabled = true;
        try {
            await apiRequest(`/lessons/${btn.dataset.cancel}`, { method: 'PATCH', body: { status: 'CANCELADA' } });
            showToast('Aula cancelada.', 'success');
            await render();
        } catch (error) {
            showToast(error.message, 'error');
            btn.disabled = false;
        }
    });

    // Recarrega depois que o aluno agenda uma nova aula (script.js dispara este evento abaixo).
    window.addEventListener('lesson:created', render);
    render();
})();