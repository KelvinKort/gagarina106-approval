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

const alphaDemoData = {
  orderNumber: 'AA-1548',
  manager: 'Андрей',
  clientName: 'Павел Покровский',
  clientPhone: '+7 911 477-51-06 / @pavelpokrovskiy',
  carModel: 'BMW X5',
  carPlate: 'А123АА39',
  mileage: '148 000 км',
  deadline: 'сегодня до 18:00',
  description:
    'Из Альфа-Авто подтянут заказ-наряд и автомобиль. В ходе осмотра дополнительно выявили износ передних тормозных дисков и колодок, а также запотевание правой передней стойки. По тормозам рекомендуем не откладывать, по стойке можно согласовать перенос на следующий визит.',
  message:
    'Павел, добрый день. По заказ-наряду AA-1548 из Альфа-Авто подготовили дополнительную смету. Посмотрите работы, запчасти и итоговую стоимость по ссылке. Там можно сразу согласовать, задать вопрос или отказаться.'
};

const populateAlphaDemo = () => {
  const map = {
    'order-number': alphaDemoData.orderNumber,
    'manager-name': alphaDemoData.manager,
    'client-name': alphaDemoData.clientName,
    'client-phone': alphaDemoData.clientPhone,
    'car-model': alphaDemoData.carModel,
    'car-plate': alphaDemoData.carPlate,
    mileage: alphaDemoData.mileage,
    deadline: alphaDemoData.deadline,
    'problem-description': alphaDemoData.description,
    'message-template': alphaDemoData.message,
    'alpha-order-number': alphaDemoData.orderNumber,
    'alpha-client-phone': '+7 911 477-51-06'
  };

  Object.entries(map).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.value = value;
  });
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

      if (action === 'import-alpha' || action === 'load-demo-alpha') {
        populateAlphaDemo();
        showFeedback(
          createFeedback,
          'Демо-импорт из 1С:Альфа-Авто выполнен. Поля заказа и текст клиенту автозаполнены на основе заказ-наряда.',
          'success'
        );
      }
    });
  });
}
