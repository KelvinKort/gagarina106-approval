const feedback = document.getElementById('approval-feedback');
const questionPanel = document.getElementById('question-panel');
const questionText = document.getElementById('question-text');
const actionButtons = document.querySelectorAll('[data-action]');

const showFeedback = (text, className) => {
  if (!feedback) return;
  feedback.textContent = text;
  feedback.className = `feedback ${className}`;
};

if (actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;

      if (action === 'approve') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback(
          'Спасибо. Согласование получено. В рабочей версии статус уйдёт сотруднику сервиса и в заказ-наряде зафиксируется решение.',
          'success'
        );
      }

      if (action === 'decline') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback(
          'Отказ зафиксирован. В рабочей версии система сохранит решение, отметит отказ по позициям и уведомит сотрудника.',
          'danger'
        );
      }

      if (action === 'question-toggle') {
        if (!questionPanel) return;
        questionPanel.hidden = false;
        showFeedback(
          'Опишите вопрос — он будет передан сотруднику сервиса вместе с номером заказ-наряда.',
          'question'
        );
      }

      if (action === 'cancel-question') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback('Форма вопроса закрыта. Вы можете согласовать работы или отказаться.', 'question');
      }

      if (action === 'submit-question') {
        const value = questionText ? questionText.value.trim() : '';
        if (!value) {
          showFeedback('Введите вопрос или комментарий перед отправкой.', 'danger');
          return;
        }

        if (questionPanel) questionPanel.hidden = true;
        showFeedback(
          'Вопрос отправлен. В рабочей версии сотрудник увидит его в админке и сможет ответить вам в Telegram или обновить смету.',
          'question'
        );
      }
    });
  });
}
