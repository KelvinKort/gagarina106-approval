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
const channelInputs = document.querySelectorAll('input[name="delivery-channel"]');
const messageTemplate = document.getElementById('message-template');
const channelNote = document.getElementById('channel-note');
const createLaborTotal = document.getElementById('create-labor-total');
const createPartsTotal = document.getElementById('create-parts-total');
const createGrandTotal = document.getElementById('create-grand-total');
const builderRows = document.querySelectorAll('.builder-row');

const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const parseNumber = (value) => Number(String(value).replace(/\s+/g, '').replace(',', '.')) || 0;

const showFeedback = (node, text, className) => {
  if (!node) return;
  node.textContent = text;
  node.className = `feedback ${className}`;
};

const getActiveChannel = () => [...channelInputs].find((input) => input.checked)?.value || 'telegram';

const buildMessageText = ({ channel, clientName, orderNumber, carModel, laborTotal, partsTotal, grandTotal }) => {
  if (channel === 'phone') {
    return `Клиент ${clientName} будет согласован по телефону по заказ-наряду ${orderNumber}. Сотруднику нужно озвучить автомобиль ${carModel}, работы на ${formatPrice(laborTotal)}, запчасти на ${formatPrice(partsTotal)} и общий итог ${formatPrice(grandTotal)}, затем вручную зафиксировать решение.`;
  }

  if (channel === 'sms') {
    return `ГАГАРИНА 106: по ${carModel} подготовили доп. смету по заказ-наряду ${orderNumber}. Работы ${formatPrice(laborTotal)}, запчасти ${formatPrice(partsTotal)}, итого ${formatPrice(grandTotal)}. Откройте ссылку для просмотра и согласования.`;
  }

  if (channel === 'whatsapp') {
    return `${clientName}, добрый день. По ${carModel} подготовили дополнительную смету по заказ-наряду ${orderNumber}. Работы на ${formatPrice(laborTotal)}, запчасти на ${formatPrice(partsTotal)}, общий итог ${formatPrice(grandTotal)}. Отправляем ссылку для просмотра и согласования.`;
  }

  return `${clientName}, добрый день. По вашему автомобилю ${carModel} подготовили дополнительную смету по заказ-наряду ${orderNumber}. Работы на ${formatPrice(laborTotal)}, запчасти на ${formatPrice(partsTotal)}, итоговая стоимость ${formatPrice(grandTotal)}. Посмотрите, пожалуйста, всё по ссылке — там можно сразу согласовать, задать вопрос или отказаться.`;
};

const channelNotes = {
  telegram: 'Telegram выбран как основной канал. Клиент получит сообщение со ссылкой на страницу согласования.',
  whatsapp: 'WhatsApp выбран как канал отправки. Клиенту уйдёт короткое сообщение со ссылкой на страницу согласования.',
  sms: 'SMS выбран как резервный канал. Клиент получит короткий текст и ссылку на страницу согласования.',
  phone: 'Выбран сценарий без мессенджеров. Сотрудник согласует работы по телефону и вручную зафиксирует результат в системе.'
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
    'Из Альфа-Авто подтянут заказ-наряд и автомобиль. В ходе осмотра дополнительно выявили износ передних тормозных дисков и колодок, а также запотевание правой передней стойки. По тормозам рекомендуем не откладывать, по стойке можно согласовать перенос на следующий визит.'
};

const updateCreateTotalsAndMessage = () => {
  if (!builderRows.length) return;

  let labor = 0;
  let parts = 0;

  builderRows.forEach((row) => {
    const type = row.querySelector('.js-item-type')?.value;
    const total = parseNumber(row.querySelector('.js-item-total')?.value || 0);

    if (type === 'Работа') labor += total;
    if (type === 'Запчасть') parts += total;
  });

  const grandTotal = labor + parts;

  if (createLaborTotal) createLaborTotal.textContent = formatPrice(labor);
  if (createPartsTotal) createPartsTotal.textContent = formatPrice(parts);
  if (createGrandTotal) createGrandTotal.textContent = formatPrice(grandTotal);

  if (messageTemplate) {
    const clientName = document.getElementById('client-name')?.value || 'Клиент';
    const orderNumber = document.getElementById('order-number')?.value || '—';
    const carModel = document.getElementById('car-model')?.value || 'автомобиль';
    messageTemplate.value = buildMessageText({
      channel: getActiveChannel(),
      clientName,
      orderNumber,
      carModel,
      laborTotal: labor,
      partsTotal: parts,
      grandTotal
    });
  }
};

const updateChannelPreview = () => {
  if (!channelInputs.length) return;

  const active = getActiveChannel();

  channelInputs.forEach((input) => {
    input.closest('.channel-option')?.classList.toggle('channel-option-active', input.checked);
  });

  if (channelNote) {
    channelNote.textContent = channelNotes[active];
  }

  updateCreateTotalsAndMessage();
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
    'alpha-order-number': alphaDemoData.orderNumber,
    'alpha-client-phone': '+7 911 477-51-06'
  };

  Object.entries(map).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.value = value;
  });

  updateChannelPreview();
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

if (builderRows.length) {
  builderRows.forEach((row) => {
    row.querySelectorAll('.input, .input-select').forEach((field) => {
      field.addEventListener('input', updateCreateTotalsAndMessage);
      field.addEventListener('change', updateCreateTotalsAndMessage);
    });
  });

  ['client-name', 'order-number', 'car-model'].forEach((id) => {
    const node = document.getElementById(id);
    node?.addEventListener('input', updateCreateTotalsAndMessage);
  });

  updateCreateTotalsAndMessage();
}

if (channelInputs.length) {
  channelInputs.forEach((input) => {
    input.addEventListener('change', updateChannelPreview);
  });

  updateChannelPreview();
}

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
        const active = getActiveChannel();
        const text =
          active === 'phone'
            ? 'Карточка создана для согласования по телефону. В рабочей версии сотрудник позвонит клиенту и вручную зафиксирует результат разговора.'
            : 'Согласование создано. В рабочей версии система сформирует ссылку, сохранит карточку и отправит сообщение клиенту по выбранному каналу.';
        showFeedback(createFeedback, text, 'question');
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
