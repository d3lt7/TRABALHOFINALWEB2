// Painel do professor: contadores, agenda de hoje e lista de alunos reais.
(async () => {
    await requireRole(['PROFESSOR']);

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value);
    };

    try {
        const [lessons, students] = await Promise.all([
            apiRequest('/lessons'),
            apiRequest('/users?role=ALUNO'),
        ]);

        const today = todayISO();
        const month = today.slice(0, 7);
        const monthLessons = lessons.filter((l) => l.date.startsWith(month) && l.status !== 'CANCELADA');
        const todayLessons = lessons.filter((l) => l.date === today && l.status === 'AGENDADA');
        const mine = [...new Map(lessons.map((l) => [l.student.id, l.student])).values()];
        const since = Date.now() - 30 * 24 * 3600 * 1000;

        setText('totalAlunos', mine.length);
        setText('aulasHoje', todayLessons.length);
        setText('aulasMes', monthLessons.length);
        setText('novasMatriculas', students.filter((s) => new Date(s.createdAt).getTime() >= since).length);

        // Agenda de hoje
        const agenda = document.querySelector('#agenda .agenda-list');
        if (agenda) {
            agenda.innerHTML = todayLessons.length
                ? todayLessons.map((l) => `
                    <div class="agenda-item">
                        <div class="agenda-time">${escapeHtml(l.time)}</div>
                        <div class="agenda-info">
                            <strong>${escapeHtml(l.student.name)}</strong> - ${escapeHtml(l.instrument.name)}
                            ${l.notes ? `<br>${escapeHtml(l.notes)}` : ''}
                        </div>
                    </div>`).join('')
                : '<p style="opacity:.7">Nenhuma aula agendada para hoje.</p>';
        }

        // Meus alunos (quem já tem aula com este professor)
        const list = document.querySelector('#alunos .alunos-list');
        if (list) {
            list.innerHTML = mine.length
                ? mine.map((s) => {
                    const instruments = [...new Set(lessons.filter((l) => l.student.id === s.id).map((l) => l.instrument.name))];
                    const total = lessons.filter((l) => l.student.id === s.id).length;
                    return `
                    <div class="aluno-item">
                        <div class="aluno-info">
                            <div class="aluno-nome">${escapeHtml(s.name)}</div>
                            <div class="aluno-instrumento">${escapeHtml(instruments.join(', '))} · ${total} aula(s)</div>
                        </div>
                    </div>`;
                }).join('')
                : '<p style="opacity:.7">Você ainda não tem alunos com aulas agendadas.</p>';
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
})();