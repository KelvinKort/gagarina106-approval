const DEMO_STORAGE_KEY = 'gagarina106_approval_demo';

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
const normalizeSlug = (value) => String(value || '').toLowerCase();

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

const saveDemoData = (data) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const loadDemoData = () => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const collectBuilderItems = () => {
  return [...builderRows].map((row) => {
    const title = row.querySelector('.js-item-title')?.value || '';
    const type = row.querySelector('.js-item-type')?.value || 'Работа';
    const priority = row.querySelector('.js-item-priority')?.value || 'Обязательно';
    const qty = parseNumber(row.querySelector('.js-item-qty')?.value || 1);
    const total = parseNumber(row.querySelector('.js-item-total')?.value || 0);

    return { title, type, priority, qty, total };
  });
};

const getCurrentCreateState = () => {
  const items = collectBuilderItems();
  const laborItems = items.filter((item) => normalizeSlug(item.type) === 'работа');
  const partItems = items.filter((item) => normalizeSlug(item.type) === 'запчасть');
  const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);
  const partsTotal = partItems.reduce((sum, item) => sum + item.total, 0);

  return {
    orderNumber: document.getElementById('order-number')?.value || '1548',
    manager: document.getElementById('manager-name')?.value || 'Андрей',
    clientName: document.getElementById('client-name')?.value || 'Павел Покровский',
    clientPhone: document.getElementById('client-phone')?.value || '',
    carModel: document.getElementById('car-model')?.value || 'BMW X5',
    carPlate: document.getElementById('car-plate')?.value || 'А123АА39',
    mileage: document.getElementById('mileage')?.value || '148 000 км',
    deadline: document.getElementById('deadline')?.value || '',
    description: document.getElementById('problem-description')?.value || '',
    channel: getActiveChannel(),
    message: messageTemplate?.value || '',
    items,
    laborItems,
    partItems,
    laborTotal,
    partsTotal,
    grandTotal: laborTotal + partsTotal
  };
};

const buildSelectableItem = (item, group) => {
  const priorityText = item.priority ? `${item.priority} · ${item.qty} ${item.qty > 1 ? 'шт.' : 'шт.'}` : `${item.qty} шт.`;
  return `
    <article class="line-item selectable-item" data-price="${item.total}" data-group="${group}">
      <label class="item-check">
        <input type="checkbox" class="item-selector" checked />
        <span class="checkmark"></span>
      </label>
      <div>
        <div class="line-title">${item.title}</div>
        <p class="muted">${priorityText}</p>
      </div>
      <strong>${formatPrice(item.total)}</strong>
    </article>
  `;
};

const applyApprovalDemoData = () => {
  const data = loadDemoData();
  if (!data) return;

  const orderLabel = document.getElementById('approval-order-label');
  const carTitle = document.getElementById('approval-car-title');
  const clientMeta = document.getElementById('approval-client-meta');
  const desc = document.getElementById('approval-description');
  const laborList = document.getElementById('approval-labor-list');
  const partsList = document.getElementById('approval-parts-list');
  const laborCount = document.getElementById('approval-labor-count');
  const partsCount = document.getElementById('approval-parts-count');

  if (orderLabel) orderLabel.textContent = `Заказ-наряд №${data.orderNumber}`;
  if (carTitle) carTitle.textContent = `${data.carModel} · ${data.carPlate}`;
  if (clientMeta) clientMeta.textContent = `Клиент: ${data.clientName} · Пробег: ${data.mileage}`;
  if (desc) desc.textContent = data.description;
  if (summaryLabor) summaryLabor.textContent = formatPrice(data.laborTotal);
  if (summaryParts) summaryParts.textContent = formatPrice(data.partsTotal);
  if (summaryTotal) summaryTotal.textContent = formatPrice(data.grandTotal);

  if (laborList && data.laborItems?.length) {
    laborList.innerHTML = data.laborItems.map((item) => buildSelectableItem(item, 'labor')).join('');
  }
  if (partsList && data.partItems?.length) {
    partsList.innerHTML = data.partItems.map((item) => buildSelectableItem(item, 'part')).join('');
  }
  if (laborCount) laborCount.textContent = `${data.laborItems?.length || 0} позиции`;
  if (partsCount) partsCount.textContent = `${data.partItems?.length || 0} позиции`;
};

const applyAdminDemoData = () => {
  const data = loadDemoData();
  if (!data) return;

  const tableBody = document.getElementById('admin-case-table-body');
  const title = document.getElementById('admin-case-title');
  const badge = document.getElementById('admin-case-badge');
  const client = document.getElementById('admin-client-name');
  const channel = document.getElementById('admin-channel');
  const manager = document.getElementById('admin-manager');
  const activity = document.getElementById('admin-last-activity');
  const statusList = document.getElementById('admin-status-list');
  const commentary = document.getElementById('admin-commentary');
  const timeline = document.getElementById('admin-timeline');
  const statsPending = document.getElementById('admin-stats-pending');
  const statsPhone = document.getElementById('admin-stats-phone');

  if (tableBody) {
    const channelLabel = data.channel === 'phone' ? 'Телефон' : data.channel === 'sms' ? 'SMS' : data.channel === 'whatsapp' ? 'WhatsApp' : 'Telegram';
    tableBody.innerHTML = `
      <tr class="is-active">
        <td>#${data.orderNumber}</td>
        <td>${data.clientName}</td>
        <td>${channelLabel}</td>
        <td>${formatPrice(data.grandTotal)}</td>
        <td><span class="badge ${data.channel === 'phone' ? 'badge-alert' : 'badge-alert'}">${data.channel === 'phone' ? 'Ожидает звонка / фиксации' : 'Ожидает ответа'}</span></td>
        <td>${data.channel === 'phone' ? 'Позвонить клиенту' : 'Отправить клиенту ссылку'}</td>
      </tr>
      <tr>
        <td>#1543</td>
        <td>Ирина Смирнова</td>
        <td>WhatsApp</td>
        <td>6 800 ₽</td>
        <td><span class="badge badge-success">Согласовано</span></td>
        <td>Запустить работы</td>
      </tr>
      <tr>
        <td>#1539</td>
        <td>Алексей Фролов</td>
        <td>Телефон</td>
        <td>22 400 ₽</td>
        <td><span class="badge badge-question">Согласовано по звонку</span></td>
        <td>Зафиксировать в заказе</td>
      </tr>
    `;
  }

  if (title) title.textContent = `Карточка согласования #${data.orderNumber}`;
  if (badge) {
    badge.textContent = data.channel === 'phone' ? 'Сценарий по телефону' : 'Новый черновик согласования';
    badge.className = data.channel === 'phone' ? 'badge badge-alert' : 'badge badge-question';
  }
  if (client) client.textContent = data.clientName;
  if (channel) channel.textContent = data.channel === 'phone' ? 'Телефон' : data.channel === 'sms' ? 'SMS' : data.channel === 'whatsapp' ? 'WhatsApp' : 'Telegram';
  if (manager) manager.textContent = data.manager;
  if (activity) activity.textContent = 'только что';
  if (statsPending && data.channel !== 'phone') statsPending.textContent = '3';
  if (statsPhone && data.channel === 'phone') statsPhone.textContent = '2';

  if (statusList) {
    statusList.innerHTML = data.channel === 'phone'
      ? `<li>ссылка клиенту не отправляется, выбран сценарий согласования по телефону;</li><li>сотруднику нужно позвонить и озвучить работы на ${formatPrice(data.laborTotal)} и запчасти на ${formatPrice(data.partsTotal)};</li><li>после звонка результат фиксируется вручную.</li>`
      : `<li>подготовлено новое согласование по каналу ${data.channel};</li><li>клиент: ${data.clientName}, автомобиль: ${data.carModel};</li><li>общий итог сметы: ${formatPrice(data.grandTotal)}.</li>`;
  }

  if (commentary) {
    commentary.textContent = data.channel === 'phone'
      ? 'После звонка сюда можно зафиксировать, что именно согласовал клиент и какой комментарий дал по разговору.'
      : data.message;
  }

  if (timeline) {
    timeline.innerHTML = data.channel === 'phone'
      ? `<div class="timeline-item"><span></span><div><strong>Сейчас — карточка создана</strong><p class="muted">Выбран канал «по телефону», ждёт звонка сотрудника.</p></div></div><div class="timeline-item"><span></span><div><strong>Следующий шаг — звонок клиенту</strong><p class="muted">Нужно озвучить состав работ и зафиксировать итог разговора.</p></div></div>`
      : `<div class="timeline-item"><span></span><div><strong>Сейчас — черновик создан</strong><p class="muted">Данные пришли из формы создания и готовы к отправке клиенту.</p></div></div><div class="timeline-item"><span></span><div><strong>Следующий шаг — отправка по каналу ${data.channel}</strong><p class="muted">После отправки клиент получит ссылку на страницу согласования.</p></div></div>`;
  }
};

const updateCreateTotalsAndMessage = () => {
  if (!builderRows.length) return;

  const state = getCurrentCreateState();

  if (createLaborTotal) createLaborTotal.textContent = formatPrice(state.laborTotal);
  if (createPartsTotal) createPartsTotal.textContent = formatPrice(state.partsTotal);
  if (createGrandTotal) createGrandTotal.textContent = formatPrice(state.grandTotal);

  if (messageTemplate) {
    messageTemplate.value = buildMessageText({
      channel: state.channel,
      clientName: state.clientName,
      orderNumber: state.orderNumber,
      carModel: state.carModel,
      laborTotal: state.laborTotal,
      partsTotal: state.partsTotal,
      grandTotal: state.grandTotal
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

const bindSelectableItems = () => {
  const currentSelectors = document.querySelectorAll('.item-selector');
  if (!currentSelectors.length) return;

  currentSelectors.forEach((input) => {
    input.addEventListener('change', updateSelectableState);
  });
};

const updateSelectableState = () => {
  const currentSelectors = document.querySelectorAll('.item-selector');
  if (!currentSelectors.length) return;

  let labor = 0;
  let parts = 0;
  let selected = 0;

  currentSelectors.forEach((input) => {
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

  if (selected === currentSelectors.length) {
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

applyApprovalDemoData();
applyAdminDemoData();
bindSelectableItems();
updateSelectableState();

if (actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const currentSelectors = document.querySelectorAll('.item-selector');
      const selectedCount = [...currentSelectors].filter((input) => input.checked).length;

      if (action === 'approve') {
        if (questionPanel) questionPanel.hidden = true;

        if (currentSelectors.length && selectedCount > 0 && selectedCount < currentSelectors.length) {
          showFeedback(
            feedback,
            'Частичное согласование зафиксировано. В рабочей версии сотрудник увидит выбранные позиции, новую сумму и комментарий по отложенным работам.',
            'question'
          );
          return;
        }

        if (currentSelectors.length && selectedCount === 0) {
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
        const state = getCurrentCreateState();
        saveDemoData(state);
        showFeedback(
          createFeedback,
          'Черновик сохранён. Демо-данные записаны и будут показаны на клиентской странице и в админке.',
          'success'
        );
      }

      if (action === 'send-preview') {
        const state = getCurrentCreateState();
        saveDemoData(state);
        const active = state.channel;
        const text =
          active === 'phone'
            ? 'Карточка создана для согласования по телефону. Демо-данные сохранены: открой админку и клиентскую страницу — увидишь тот же кейс.'
            : 'Согласование создано. Демо-данные сохранены: открой клиентскую страницу и админку — там будет этот же кейс.';
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
