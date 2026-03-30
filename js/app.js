const DEMO_STORAGE_KEY = 'gagarina106_approval_demo';

const feedback = document.getElementById('approval-feedback');
const createFeedback = document.getElementById('create-feedback');
const questionPanel = document.getElementById('question-panel');
const questionText = document.getElementById('question-text');
const actionButtons = document.querySelectorAll('[data-action]');
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
const photoUploadInput = document.getElementById('photo-upload-input');
const createPhotoPreview = document.getElementById('create-photo-preview');

let demoUploadedPhotos = [];

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

const defaultApprovalState = {
  status: 'pending',
  statusLabel: 'Ожидает ответа',
  customerComment: '',
  selectedTitles: []
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

const renderCreatePhotoPreview = (photos = []) => {
  if (!createPhotoPreview) return;
  if (!photos.length) {
    createPhotoPreview.innerHTML = '<div class="photo-placeholder small-placeholder">Фото пока не добавлены</div>';
    return;
  }
  createPhotoPreview.innerHTML = photos
    .map(
      (photo, index) => `
        <div class="upload-preview-card">
          <img src="${photo.dataUrl}" alt="Фото ${index + 1}" />
          <div class="upload-preview-meta">Фото ${index + 1}</div>
        </div>
      `
    )
    .join('');
};

const renderApprovalPhotos = (photos = []) => {
  const grid = document.getElementById('approval-photo-grid');
  if (!grid || !photos.length) return;
  grid.innerHTML = photos
    .map(
      (photo, index) => `
        <div class="upload-preview-card">
          <img src="${photo.dataUrl}" alt="Диагностика ${index + 1}" />
          <div class="upload-preview-meta">Фото ${index + 1}</div>
        </div>
      `
    )
    .join('');
};

const setDemoStatePatch = (patch) => {
  const current = loadDemoData();
  if (!current) return null;
  const next = {
    ...current,
    approvalState: {
      ...(current.approvalState || defaultApprovalState),
      ...patch
    }
  };
  saveDemoData(next);
  return next;
};

const collectBuilderItems = () => {
  return [...builderRows]
    .map((row) => {
      const title = row.querySelector('.js-item-title')?.value || '';
      const type = row.querySelector('.js-item-type')?.value || 'Работа';
      const priority = row.querySelector('.js-item-priority')?.value || 'Обязательно';
      const qty = parseNumber(row.querySelector('.js-item-qty')?.value || 1);
      const total = parseNumber(row.querySelector('.js-item-total')?.value || 0);
      return { title, type, priority, qty, total };
    })
    .filter((item) => item.title.trim());
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
    grandTotal: laborTotal + partsTotal,
    photos: demoUploadedPhotos,
    approvalState: defaultApprovalState
  };
};

const buildSelectableItem = (item, group) => {
  const detail = `${item.priority} · ${item.qty} ${item.qty > 1 ? 'шт.' : 'шт.'}`;
  return `
    <article class="line-item selectable-item" data-price="${item.total}" data-group="${group}" data-title="${item.title.replace(/"/g, '&quot;')}">
      <label class="item-check">
        <input type="checkbox" class="item-selector" checked />
        <span class="checkmark"></span>
      </label>
      <div>
        <div class="line-title">${item.title}</div>
        <p class="muted">${detail}</p>
      </div>
      <strong>${formatPrice(item.total)}</strong>
    </article>
  `;
};

const applyApprovalBadge = (approvalState) => {
  if (!decisionBadge) return;
  const state = approvalState?.status || 'pending';
  if (state === 'approved') {
    decisionBadge.textContent = 'Согласовано';
    decisionBadge.className = 'badge badge-success';
    return;
  }
  if (state === 'partial') {
    decisionBadge.textContent = 'Частично согласовано';
    decisionBadge.className = 'badge badge-question';
    return;
  }
  if (state === 'question') {
    decisionBadge.textContent = 'Есть вопрос';
    decisionBadge.className = 'badge badge-question';
    return;
  }
  if (state === 'declined') {
    decisionBadge.textContent = 'Отказ';
    decisionBadge.className = 'badge badge-alert';
    return;
  }
  decisionBadge.textContent = 'Ожидает согласования';
  decisionBadge.className = 'badge badge-alert';
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
  if (laborList && data.laborItems?.length) laborList.innerHTML = data.laborItems.map((item) => buildSelectableItem(item, 'labor')).join('');
  if (partsList && data.partItems?.length) partsList.innerHTML = data.partItems.map((item) => buildSelectableItem(item, 'part')).join('');
  if (laborCount) laborCount.textContent = `${data.laborItems?.length || 0} позиции`;
  if (partsCount) partsCount.textContent = `${data.partItems?.length || 0} позиции`;
  renderApprovalPhotos(data.photos || []);
  applyApprovalBadge(data.approvalState || defaultApprovalState);
};

const buildAdminStatus = (data) => {
  const state = data.approvalState || defaultApprovalState;
  if (state.status === 'approved') return { badge: 'badge-success', label: 'Согласовано', step: 'Запустить работы' };
  if (state.status === 'partial') return { badge: 'badge-question', label: 'Частично согласовано', step: 'Уточнить отложенные позиции' };
  if (state.status === 'question') return { badge: 'badge-question', label: 'Нужны уточнения', step: 'Ответить клиенту' };
  if (state.status === 'declined') return { badge: 'badge-alert', label: 'Отказ', step: 'Зафиксировать отказ' };
  return { badge: 'badge-alert', label: data.channel === 'phone' ? 'Ожидает звонка / фиксации' : 'Ожидает ответа', step: data.channel === 'phone' ? 'Позвонить клиенту' : 'Отправить клиенту ссылку' };
};

const applyAdminDemoData = () => {
  const data = loadDemoData();
  if (!data) return;
  const approvalState = data.approvalState || defaultApprovalState;
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
  const statsPartial = document.getElementById('admin-stats-partial');
  const statsPhone = document.getElementById('admin-stats-phone');
  const adminPhoneResult = document.getElementById('phone-result');
  const adminStaffNote = document.getElementById('staff-note');

  const channelLabel = data.channel === 'phone' ? 'Телефон' : data.channel === 'sms' ? 'SMS' : data.channel === 'whatsapp' ? 'WhatsApp' : 'Telegram';
  const statusMeta = buildAdminStatus(data);

  if (tableBody) {
    tableBody.innerHTML = `
      <tr class="is-active">
        <td>#${data.orderNumber}</td>
        <td>${data.clientName}</td>
        <td>${channelLabel}</td>
        <td>${formatPrice(data.grandTotal)}</td>
        <td><span class="badge ${statusMeta.badge}">${statusMeta.label}</span></td>
        <td>${statusMeta.step}</td>
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
    badge.textContent = statusMeta.label;
    badge.className = `badge ${statusMeta.badge}`;
  }
  if (client) client.textContent = data.clientName;
  if (channel) channel.textContent = channelLabel;
  if (manager) manager.textContent = data.manager;
  if (activity) activity.textContent = approvalState.status === 'pending' ? 'только что' : 'обновлено после ответа клиента';
  if (statsPending) statsPending.textContent = approvalState.status === 'pending' ? '3' : '2';
  if (statsPartial) statsPartial.textContent = approvalState.status === 'partial' ? '2' : '1';
  if (statsPhone && data.channel === 'phone') statsPhone.textContent = '2';

  if (statusList) {
    if (approvalState.status === 'approved') {
      statusList.innerHTML = `<li>клиент полностью согласовал все позиции;</li><li>итоговая сумма подтверждена: ${formatPrice(data.grandTotal)};</li><li>можно запускать работы и фиксировать согласование в заказе.</li>`;
    } else if (approvalState.status === 'partial') {
      const selected = approvalState.selectedTitles?.length ? approvalState.selectedTitles.join('; ') : 'часть позиций';
      statusList.innerHTML = `<li>клиент согласовал не все позиции;</li><li>подтверждены: ${selected};</li><li>нужно решить, как зафиксировать перенос остальных работ.</li>`;
    } else if (approvalState.status === 'question') {
      statusList.innerHTML = `<li>клиент не подтвердил работы сразу;</li><li>получен вопрос по составу или срокам;</li><li>нужно ответить клиенту и при необходимости обновить смету.</li>`;
    } else if (approvalState.status === 'declined') {
      statusList.innerHTML = `<li>клиент отказался от доп. работ;</li><li>результат нужно зафиксировать в заказ-наряде;</li><li>при необходимости можно вернуть кейс в черновик после звонка.</li>`;
    } else if (data.channel === 'phone') {
      statusList.innerHTML = `<li>ссылка клиенту не отправляется, выбран сценарий согласования по телефону;</li><li>сотруднику нужно позвонить и озвучить работы на ${formatPrice(data.laborTotal)} и запчасти на ${formatPrice(data.partsTotal)};</li><li>после звонка результат фиксируется вручную.</li>`;
    } else {
      statusList.innerHTML = `<li>подготовлено новое согласование по каналу ${data.channel};</li><li>клиент: ${data.clientName}, автомобиль: ${data.carModel};</li><li>общий итог сметы: ${formatPrice(data.grandTotal)};</li><li>фото приложены: ${data.photos?.length || 0}.</li>`;
    }
  }

  if (commentary) {
    commentary.textContent = approvalState.customerComment || (data.channel === 'phone'
      ? 'После звонка сюда можно зафиксировать, что именно согласовал клиент и какой комментарий дал по разговору.'
      : data.message);
  }

  if (timeline) {
    if (approvalState.status === 'approved') {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Черновик создан</strong><p class="muted">Данные пришли из формы создания.</p></div></div><div class="timeline-item"><span></span><div><strong>Клиент согласовал работы</strong><p class="muted">Все позиции подтверждены на сумму ${formatPrice(data.grandTotal)}.</p></div></div>`;
    } else if (approvalState.status === 'partial') {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Черновик создан</strong><p class="muted">Данные пришли из формы создания.</p></div></div><div class="timeline-item"><span></span><div><strong>Клиент частично согласовал работы</strong><p class="muted">Нужно обработать отложенные позиции и подтвердить новую сумму.</p></div></div>`;
    } else if (approvalState.status === 'question') {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Черновик создан</strong><p class="muted">Данные пришли из формы создания.</p></div></div><div class="timeline-item"><span></span><div><strong>Клиент задал вопрос</strong><p class="muted">Нужно ответить и при необходимости пересчитать смету.</p></div></div>`;
    } else if (approvalState.status === 'declined') {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Черновик создан</strong><p class="muted">Данные пришли из формы создания.</p></div></div><div class="timeline-item"><span></span><div><strong>Клиент отказался</strong><p class="muted">Статус согласования обновлён как отказ.</p></div></div>`;
    } else if (data.channel === 'phone') {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Сейчас — карточка создана</strong><p class="muted">Выбран канал «по телефону», ждёт звонка сотрудника.</p></div></div><div class="timeline-item"><span></span><div><strong>Следующий шаг — звонок клиенту</strong><p class="muted">Нужно озвучить состав работ и зафиксировать итог разговора.</p></div></div>`;
    } else {
      timeline.innerHTML = `<div class="timeline-item"><span></span><div><strong>Сейчас — черновик создан</strong><p class="muted">Данные пришли из формы создания и готовы к отправке клиенту.</p></div></div><div class="timeline-item"><span></span><div><strong>Следующий шаг — отправка по каналу ${data.channel}</strong><p class="muted">После отправки клиент получит ссылку на страницу согласования.</p></div></div>`;
    }
  }

  if (adminPhoneResult) {
    adminPhoneResult.value = approvalState.status === 'partial' ? 'Частично согласовано по звонку' : approvalState.status === 'declined' ? 'Отказ по звонку' : 'Согласовано по звонку';
  }
  if (adminStaffNote && approvalState.customerComment) {
    adminStaffNote.value = approvalState.customerComment;
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
  if (channelNote) channelNote.textContent = channelNotes[active];
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
  const stored = loadDemoData();
  const storedStatus = stored?.approvalState?.status;
  if (storedStatus && storedStatus !== 'pending') {
    applyApprovalBadge(stored.approvalState);
  } else if (selected === currentSelectors.length) {
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

if (photoUploadInput) {
  photoUploadInput.addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])].slice(0, 3);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
          reader.readAsDataURL(file);
        })
    );
    demoUploadedPhotos = await Promise.all(readers);
    renderCreatePhotoPreview(demoUploadedPhotos);
  });
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
renderCreatePhotoPreview(demoUploadedPhotos);

if (actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const currentSelectors = document.querySelectorAll('.item-selector');
      const selectedRows = [...currentSelectors].filter((input) => input.checked).map((input) => input.closest('.selectable-item')?.dataset.title).filter(Boolean);
      const selectedCount = selectedRows.length;
      const allCount = currentSelectors.length;

      if (action === 'approve') {
        if (questionPanel) questionPanel.hidden = true;
        if (allCount && selectedCount === 0) {
          showFeedback(feedback, 'Сейчас не выбрана ни одна позиция. Выберите нужные пункты или используйте отказ.', 'danger');
          return;
        }
        const nextState = selectedCount === allCount
          ? { status: 'approved', statusLabel: 'Согласовано', customerComment: 'Клиент подтвердил все позиции.', selectedTitles: selectedRows }
          : { status: 'partial', statusLabel: 'Частично согласовано', customerComment: `Клиент выбрал: ${selectedRows.join('; ')}.`, selectedTitles: selectedRows };
        setDemoStatePatch(nextState);
        applyAdminDemoData();
        applyApprovalBadge(nextState);
        showFeedback(feedback, selectedCount === allCount ? 'Полное согласование зафиксировано. Открой админку — там уже обновился статус кейса.' : 'Частичное согласование зафиксировано. Открой админку — там уже обновился статус кейса и список выбранных позиций.', selectedCount === allCount ? 'success' : 'question');
        return;
      }

      if (action === 'decline') {
        if (questionPanel) questionPanel.hidden = true;
        const nextState = { status: 'declined', statusLabel: 'Отказ', customerComment: 'Клиент отказался от дополнительных работ.', selectedTitles: [] };
        setDemoStatePatch(nextState);
        applyAdminDemoData();
        applyApprovalBadge(nextState);
        showFeedback(feedback, 'Отказ зафиксирован. Открой админку — статус кейса уже обновился.', 'danger');
        return;
      }

      if (action === 'question-toggle') {
        if (!questionPanel) return;
        questionPanel.hidden = false;
        showFeedback(feedback, 'Опишите вопрос — он будет передан сотруднику сервиса вместе с номером заказ-наряда.', 'question');
        return;
      }

      if (action === 'cancel-question') {
        if (questionPanel) questionPanel.hidden = true;
        showFeedback(feedback, 'Форма вопроса закрыта. Вы можете согласовать работы, выбрать часть позиций или отказаться.', 'question');
        return;
      }

      if (action === 'submit-question') {
        const value = questionText ? questionText.value.trim() : '';
        if (!value) {
          showFeedback(feedback, 'Введите вопрос или комментарий перед отправкой.', 'danger');
          return;
        }
        if (questionPanel) questionPanel.hidden = true;
        const nextState = { status: 'question', statusLabel: 'Есть вопрос', customerComment: value, selectedTitles: selectedRows };
        setDemoStatePatch(nextState);
        applyAdminDemoData();
        applyApprovalBadge(nextState);
        showFeedback(feedback, 'Вопрос отправлен. Открой админку — там уже появился комментарий клиента и изменился следующий шаг.', 'question');
        return;
      }

      if (action === 'save-draft') {
        const state = getCurrentCreateState();
        saveDemoData(state);
        showFeedback(createFeedback, 'Черновик сохранён. Демо-данные, включая фото, записаны и будут показаны на клиентской странице и в админке.', 'success');
        return;
      }

      if (action === 'send-preview') {
        const state = getCurrentCreateState();
        saveDemoData(state);
        const active = state.channel;
        const text = active === 'phone'
          ? 'Карточка создана для согласования по телефону. Демо-данные сохранены: открой админку и клиентскую страницу — увидишь тот же кейс.'
          : 'Согласование создано. Демо-данные, включая фото, сохранены: открой клиентскую страницу и админку — там будет этот же кейс.';
        showFeedback(createFeedback, text, 'question');
        return;
      }

      if (action === 'import-alpha' || action === 'load-demo-alpha') {
        populateAlphaDemo();
        showFeedback(createFeedback, 'Демо-импорт из 1С:Альфа-Авто выполнен. Поля заказа и текст клиенту автозаполнены на основе заказ-наряда.', 'success');
      }
    });
  });
}
