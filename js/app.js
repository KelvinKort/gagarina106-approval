const messages = {
  approve: {
    text: 'Спасибо. Согласование получено. В рабочей версии статус уйдёт сотруднику сервиса.',
    className: 'feedback success'
  },
  question: {
    text: 'Запрос на уточнение принят. В рабочей версии откроется сценарий вопроса клиенту/мастеру.',
    className: 'feedback question'
  },
  decline: {
    text: 'Отказ зафиксирован. В рабочей версии система сохранит решение и уведомит сотрудника.',
    className: 'feedback danger'
  }
};

const feedback = document.getElementById('approval-feedback');
const actionButtons = document.querySelectorAll('[data-action]');

if (feedback && actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const state = messages[button.dataset.action];
      feedback.textContent = state.text;
      feedback.className = state.className;
    });
  });
}
