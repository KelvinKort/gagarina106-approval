const feedback = document.getElementById('approval-feedback');
const createFeedback = document.getElementById('create-feedback');
const questionPanel = document.getElementById('question-panel');
const questionText = document.getElementById('question-text');
const actionButtons = document.querySelectorAll('[data-action]');
const itemSelectors = document.querySelectorAll('.item-selector');
const summaryLabor = document.getElementById('summary-labor');
const summaryParts = document.getElementById('summary-parts');
const summaryTotal = document.getElementById('summary-total');
const decisionBadge = document.getElementById('decision-badge');
const partialNote = document.getElementById('partial-note');

const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

const showFeedback = (node, text, className) => {
  if (!node) return;
  node.textContent = text;
  node.className = `feedback ${className}`;
};

const updateSelectableState = () => {
  if (!itemSelectors.length) return;

  let labor = 0;
  let parts = 0;
  let selected = 0;

  itemSelectors.forEach((input) => {
    const row = input.closest('.selectable-item');
    const price = Number(row?.dataset.price || 0);
    const group = row?.dataset.group;

    row?.classList.toggle('is-unchecked', !input.checked);

    if (input.checked) {
      selected += 1;
      if (group === 'labor') labor += price;
      if (group === 'part') parts += price;
    }
  });

  const total = labor + parts;

  if (summaryLabor) summaryLabor.textContent = formatPrice(labor);
  if (summaryParts) summaryParts.textContent = formatPrice(parts);
  if (summaryTotal) summaryTotal.textContent = formatPrice(total);

  if (!decisionBadge || !partialNote) return;

  if (selected === itemSelectors.length) {
    decisionBadge.textContent = 'Ожидает согласования';
    decisionBadge.className = 'badge badge-alert';
    partialNote.textContent = 'Сейчас выбраны все позиции. Если снять часть пунктов, система покажет частичное согласование.';
  } else if (selected === 0) {
    decisionBadge.textContent = 'Ничего не выбрано';
    decisionBadge.className = 'badge badge-question';
    partialNote.textContent = 'Сейчас все позиции сняты. Можно отказаться полностью или выбрать только нужные пункты.';
  } else {
    decisionBadge.textContent = 'Частичное согласование';
    decisionBadge.className = 'badge badge-question';
    partialNote.textContent = `Выбрана часть позиций. Новый итог: ${formatPrice(total)}.`;
  }
};

if (itemSelectors.length) {
  itemSelectors.forEach((input) => {
    input.addEventListener('change', updateSelectableState);
  });

  updateSelectableState();
}

if (actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const selectedCount = [...itemSelectors].filter((input) => input.checked).length;

      if (action === 'approve') {
        if (questionPanel) questionPanel.hidden = true;

        if (itemSelectors.length && selectedCount > 0 && selectedCount < itemSelectors.length) {
          showFeedback(
            feedback,
            'Частичное согласование зафиксировано. В рабочей версии сотрудник увидит выбранные позиции, новую сумму и комментарий по отложенным работам.',
            'question'
          );
          return;
        }

        if (itemSelectors.length && selectedCount === 0) {
          showFeedback(feedback, 'Сейчас не выбрана ни одна позиция. Выберите нужные пункты или используйте отказ.', 'danger');
          return;
        }

        showFeedback(
          feedback,
          'Спасибо. Согласование получено. В рабочей версии статус уйдёт сотруднику сервиса и в заказ-наряде зафиксируется решение.',
          'success'
        );
      }

      if (action === 'decline') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback(
          feedback,
          'Отказ зафиксирован. В рабочей версии система сохранит решение, отметит отказ по позициям и уведомит сотрудника.',
          'danger'
        );
      }

      if (action === 'question-toggle') {
        if (!questionPanel) return;
        questionPanel.hidden = false;
        showFeedback(
          feedback,
          'Опишите вопрос — он будет передан сотруднику сервиса вместе с номером заказ-наряда.',
          'question'
        );
      }

      if (action === 'cancel-question') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback(feedback, 'Форма вопроса закрыта. Вы можете согласовать работы, выбрать часть позиций или отказаться.', 'question');
      }

      if (action === 'submit-question') {
        const value = questionText ? questionText.value.trim() : '';
        if (!value) {
          showFeedback(feedback, 'Введите вопрос или комментарий перед отправкой.', 'danger');
          return;
        }

        if (questionPanel) questionPanel.hidden = true;
        showFeedback(
          feedback,
          'Вопрос отправлен. В рабочей версии сотрудник увидит его в админке и сможет ответить вам в Telegram или обновить смету.',
          'question'
        );
      }

      if (action === 'save-draft') {
        showFeedback(
          createFeedback,
          'Черновик сохранён. В рабочей версии он попадёт в список согласований со статусом «черновик».',
          'success'
        );
      }

      if (action === 'send-preview') {
        showFeedback(
          createFeedback,
          'Согласование создано. В рабочей версии система сформирует ссылку, сохранит карточку и отправит сообщение клиенту в Telegram.',
          'question'
        );
      }
    });
  });
}
