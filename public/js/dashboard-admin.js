// Painel do administrador: números e tabela reais.
(async () => {
    await requireRole(['ADMIN']);

    const BADGE = {
        AGENDADA: ['badge-confirmado', 'Agendada'],
        CONCLUIDA: ['badge-concluida', 'Concluída'],
        CANCELADA: ['badge-cancelada', 'Cancelada'],
    };

    const setStat = (title, value) => {
        const h3 = [...document.querySelectorAll('.stat-details h3')]
            .find((el) => el.textContent.trim() === title);
        const number = h3?.parentElement.querySelector('.stat-number');
        if (number) number.textContent = String(value);
    };

    try {
        const [users, lessons] = await Promise.all([
            apiRequest('/users'),
            apiRequest('/lessons'),
        ]);

        const month = todayISO().slice(0, 7);
        setStat('Total de Alunos', users.filter((u) => u.role === 'ALUNO').length);
        setStat('Professores Ativos', users.filter((u) => u.role === 'PROFESSOR').length);
        setStat('Aulas Este Mês', lessons.filter((l) => l.date.startsWith(month) && l.status !== 'CANCELADA').length);
        // O sistema não tem pagamentos: não exibimos um valor inventado.
        setStat('Receita Mensal', '—');

        // Tabela "Próximas Aulas Hoje"
        const table = [...document.querySelectorAll('.admin-table')]
            .find((t) => t.querySelector('th')?.textContent.trim() === 'Horário');
        const tbody = table?.querySelector('tbody');
        if (tbody) {
            const today = lessons.filter((l) => l.date === todayISO() && l.status !== 'CANCELADA');
            tbody.innerHTML = today.length
                ? today.map((l) => {
                    const [cls, label] = BADGE[l.status];
                    return `<tr>
                        <td>${escapeHtml(l.time)}</td>
                        <td>${escapeHtml(l.student.name)}</td>
                        <td>Prof. ${escapeHtml(l.teacher.name)}</td>
                        <td>${escapeHtml(l.instrument.name)}</td>
                        <td><span class="badge ${cls}">${label}</span></td>
                        <td><a class="btn-icon" href="gerenciamento.html" title="Gerenciar"><i class="fas fa-eye"></i></a></td>
                    </tr>`;
                }).join('')
                : '<tr><td colspan="6" style="text-align:center;opacity:.7">Nenhuma aula agendada para hoje.</td></tr>';
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
})();