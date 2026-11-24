import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../api/context/AuthContext';
import '../App.css';

function toViewOrder(order) {
  const boarding = String(order.serviceType).toLowerCase() === 'boarding';
  const pet = order.pet;
  const start = new Date(order.startAt);
  const end = order.endAt ? new Date(order.endAt) : null;
  const dateOptions = { day: 'numeric', month: 'short' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const date = boarding && end
    ? `${start.toLocaleDateString('ru-RU', dateOptions)} — ${end.toLocaleDateString('ru-RU', dateOptions)}`
    : `${start.toLocaleDateString('ru-RU', dateOptions)}, ${start.toLocaleTimeString('ru-RU', timeOptions)}`;
  const statuses = {
    pending: order.applicationCount ? `Откликнулись ${order.applicationCount} исполнителей` : 'Ищет исполнителя',
    accepted: 'Исполнитель назначен',
    in_progress: 'Выполняется',
    completed: 'Завершён',
    cancelled: 'Отменён',
    disputed: 'Требует внимания',
  };
  const rawStatuses = {
    pending: 'Pending',
    accepted: 'Assigned',
    in_progress: 'InProgress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  };

  return {
    id: order.id,
    dogId: pet?.id,
    dog: pet?.name || 'Собака',
    detail: [pet?.breed, pet?.age != null ? `${pet.age} лет` : null].filter(Boolean).join(' · '),
    service: boarding ? 'Передержка' : 'Выгул',
    area: order.area,
    address: order.locationAddress,
    date,
    duration: boarding ? 'Передержка' : `${order.durationMinutes} минут`,
    price: order.totalPrice == null ? 'По договорённости' : `${Number(order.totalPrice).toLocaleString('ru-RU')} ₽`,
    note: order.description || '',
    position: null,
    state: statuses[String(order.status).toLowerCase()] || order.status,
    rawStatus: rawStatuses[String(order.status).toLowerCase()] || order.status,
    applicationCount: order.applicationCount || 0,
    applicationStatus: order.applicationStatus,
  };
}

const ownerNav = [
  ['map', 'Карта', 'map'], ['orders', 'Мои заказы', 'calendar'], ['dogs', 'Мои собаки', 'paw'], ['messages', 'Сообщения', 'chat'], ['profile', 'Профиль', 'user'],
];
const walkerNav = [
  ['map', 'Карта заказов', 'map'], ['orders', 'Мои заказы', 'calendar'], ['availability', 'Доступность', 'clock'], ['services', 'Услуги и районы', 'sliders'], ['messages', 'Сообщения', 'chat'], ['profile', 'Профиль', 'user'],
];

function Icon({ name, size = 19 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15m6-12v15"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    paw: <><ellipse cx="12" cy="15.5" rx="5.2" ry="4.1"/><ellipse cx="5.7" cy="9" rx="1.8" ry="2.4"/><ellipse cx="10" cy="6.3" rx="1.8" ry="2.4"/><ellipse cx="14.8" cy="6.5" rx="1.8" ry="2.4"/><ellipse cx="18.7" cy="9.3" rx="1.8" ry="2.4"/></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-4-.9L4 20l1.3-3.5A7 7 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    sliders: <><path d="M4 7h10m4 0h2M4 17h2m4 0h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    heart: <><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  };
  return <svg {...common}>{paths[name] || paths.paw}</svg>;
}

function MapArtwork({ orders, selectedId, onSelect, role }) {
  return (
    <div className="map-canvas" aria-label="Карта заказов">
      <svg className="map-drawing" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="620" fill="#edf1e8" />
        <path d="M-20 460C120 390 170 460 300 410S500 330 820 390v250H-20Z" fill="#dce8df" />
        <path d="M-30 155 820 540M-50 365 740-30M145 660 525-25M480 680 830 50M-20 35 690 640" stroke="#fffdf8" strokeWidth="27" fill="none" />
        <path d="M-30 155 820 540M-50 365 740-30M145 660 525-25M480 680 830 50M-20 35 690 640" stroke="#d9ddd5" strokeWidth="2" fill="none" />
        <path d="M40 288 780 285M95 510 770 130M285 620 285 0M580 625 580 0M0 82 800 490" stroke="#fffdf8" strokeWidth="15" fill="none" />
        <path d="M40 288 780 285M95 510 770 130M285 620 285 0M580 625 580 0M0 82 800 490" stroke="#e2e2db" strokeWidth="1.5" fill="none" />
        <path d="M78 74h110v75H78zm430 94h116v80H508zM318 420h143v88H318zM620 390h105v91H620z" fill="#e4ebdd" />
        <path d="M210 190c22-40 72-45 98-14 22 27 12 68-17 84-35 20-99-18-81-70Zm340 270c18-37 61-45 90-22 34 27 22 70-13 83-37 14-92-21-77-61Z" fill="#d7e5d1" />
        <g fill="#a1aa9e" fontFamily="Arial, sans-serif" fontSize="12" letterSpacing="1.3">
          <text x="83" y="270">ХАМОВНИКИ</text><text x="510" y="330">ПРЕСНЕНСКИЙ</text><text x="322" y="105">АРБАТ</text>
          <text x="100" y="424">ПАРК КУЛЬТУРЫ</text><text x="603" y="512">ПАТРИАРШИЕ</text>
        </g>
        <g fill="#b5bcb2" fontFamily="Arial, sans-serif" fontSize="10">
          <text x="153" y="231">Зубовский бульвар</text><text x="484" y="121">Садовое кольцо</text><text x="323" y="550">Комсомольский проспект</text>
        </g>
      </svg>
      <div className="map-watermark"><Icon name="pin" size={14} /> Москва</div>
      <div className="map-controls"><button aria-label="Увеличить карту">+</button><button aria-label="Уменьшить карту">−</button></div>
      {orders.filter((order) => order.position).map((order) => (
        <button
          key={order.id}
          className={`map-pin ${order.service === 'Передержка' ? 'is-boarding' : ''} ${selectedId === order.id ? 'is-selected' : ''} ${role === 'owner' ? 'owner-pin' : ''}`}
          style={{ left: `${order.position[0]}%`, top: `${order.position[1]}%` }}
          onClick={() => onSelect(order.id)}
          aria-label={`${order.service}, ${order.area}`}
        >
          {role === 'owner' ? <span className="pin-dot" /> : order.price}
        </button>
      ))}
      {orders.length > 0 && !orders.some((order) => order.position) && <div className="map-geocode-note"><Icon name="pin" size={18} /><strong>Заказы по району</strong><span>Точные точки появятся после подключения геокодирования.</span></div>}
    </div>
  );
}

function OrderCard({ order, role, selected, onClick, onRespond, onReview, responded }) {
  return (
    <article className={`order-card ${selected ? 'is-active' : ''}`} onClick={onClick}>
      <div className="order-card-top">
        <span className={`service-label ${order.service === 'Передержка' ? 'boarding' : ''}`}>{order.service === 'Выгул' ? <Icon name="paw" size={13} /> : <Icon name="heart" size={13} />}{order.service}</span>
        <span className="order-price">{order.price}</span>
      </div>
      <div className="dog-row">
        <div className={`dog-avatar ${order.id % 2 ? 'avatar-peach' : 'avatar-green'}`}>{order.dog[0]}</div>
        <div><h3>{order.dog}</h3><p>{order.detail}</p></div>
      </div>
      <div className="order-meta"><span><Icon name="pin" size={14} />{order.area}</span><span><Icon name="calendar" size={14} />{order.date}</span></div>
      <p className="order-note">{order.note}</p>
      {role === 'walker' ? (
        <button className={`button ${responded ? 'button-soft' : 'button-primary'} button-full`} disabled={responded || order.rawStatus !== 'Pending'} onClick={(event) => { event.stopPropagation(); onRespond(order); }}>
          {responded ? <><Icon name="check" size={16} /> Отклик отправлен</> : <>Откликнуться <Icon name="arrow" size={16} /></>}
        </button>
      ) : <><div className={`status-line ${order.state.includes('Откликнулись') ? 'status-waiting' : ''}`}><span />{order.state}</div>{order.applicationCount > 0 && <button className="text-button review-applications" onClick={(event) => { event.stopPropagation(); onReview(order); }}>Посмотреть отклики <Icon name="arrow" size={14} /></button>}</>}
    </article>
  );
}

function MapPage({ role, orders, selectedId, onSelect, onCreate, onRespond, onReview }) {
  const [serviceFilter, setServiceFilter] = useState('Все услуги');
  const [query, setQuery] = useState('');
  const visibleOrders = useMemo(() => orders.filter((order) => {
    const matchesService = serviceFilter === 'Все услуги' || order.service === serviceFilter;
    const text = `${order.dog} ${order.area} ${order.service}`.toLowerCase();
    return matchesService && text.includes(query.toLowerCase());
  }), [orders, query, serviceFilter]);
  const selectedOrder = visibleOrders.find((order) => order.id === selectedId) || visibleOrders[0];
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">{role === 'owner' ? 'ВАШИ ЗАКАЗЫ' : 'РЯДОМ С ВАМИ'}</p><h1>{role === 'owner' ? 'Карта заказов' : 'Найдите заказ рядом'}</h1><p className="page-subtitle">{role === 'owner' ? 'Следите за заявками и находите помощь для питомца.' : 'Выберите подходящую услугу и откликнитесь.'}</p></div>
        {role === 'owner' && <button className="button button-primary" onClick={onCreate}><Icon name="plus" size={17} /> Разместить заказ</button>}
      </div>
      <div className="map-toolbar">
        <label className="search-field"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Район или кличка собаки" /></label>
        <div className="filter-group" role="group" aria-label="Фильтр по услуге">
          {['Все услуги', 'Выгул', 'Передержка'].map((filter) => <button key={filter} className={serviceFilter === filter ? 'filter-chip selected' : 'filter-chip'} onClick={() => setServiceFilter(filter)}>{filter}</button>)}
        </div>
        <button className="filter-button"><Icon name="sliders" size={17} /> Фильтры</button>
      </div>
      <div className="map-layout">
        <section className="map-results">
          <div className="results-heading"><div><strong>{role === 'owner' ? `${visibleOrders.length} заказа` : `${visibleOrders.length} заказа рядом`}</strong><span>Москва · до 5 км</span></div><button className="sort-button">Сначала новые⌄</button></div>
          <div className="order-list">
            {visibleOrders.length ? visibleOrders.map((order) => <OrderCard key={order.id} order={order} role={role} selected={selectedOrder?.id === order.id} onClick={() => onSelect(order.id)} onRespond={onRespond} onReview={onReview} responded={order.applicationStatus === 'pending'} />) : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={23} /></span><h3>Ничего не нашлось</h3><p>Попробуйте изменить район или фильтр услуги.</p></div>}
          </div>
        </section>
        <section className="map-panel"><MapArtwork orders={visibleOrders} selectedId={selectedOrder?.id} onSelect={onSelect} role={role} /><div className="map-legend"><span><i className="legend-walk" /> Выгул</span><span><i className="legend-boarding" /> Передержка</span><small>Точный адрес виден после назначения</small></div></section>
      </div>
    </>
  );
}

function ConnectedOrdersPage({ role, orders, onCreate, onReview, onStart, onComplete }) {
  const openCount = orders.filter((order) => order.rawStatus === 'Pending').length;
  const activeCount = orders.filter((order) => ['Assigned', 'InProgress'].includes(order.rawStatus)).length;
  const completedCount = orders.filter((order) => order.rawStatus === 'Completed').length;
  return (
    <div className="content-page">
      <div className="page-heading">
        <div><p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p><h1>Мои заказы</h1><p className="page-subtitle">Все заявки и услуги в одном месте.</p></div>
        {role === 'owner' && <button className="button button-primary" onClick={onCreate}><Icon name="plus" size={17} /> Новый заказ</button>}
      </div>
      <div className="stat-row">
        <div className="stat-card"><span>Открытые</span><strong>{openCount}</strong><small>Ждут исполнителя</small></div>
        <div className="stat-card"><span>В работе</span><strong>{activeCount}</strong><small>Назначенные и текущие</small></div>
        <div className="stat-card"><span>Завершённые</span><strong>{completedCount}</strong><small>Услуги выполнены</small></div>
      </div>
      <div className="table-card">
        <div className="table-title"><div><h2>Заказы</h2><p>Статус и следующее действие по каждой заявке.</p></div></div>
        {orders.length ? orders.map((order) => (
          <div className="table-order" key={order.id}>
            <div className="dog-avatar avatar-peach">{order.dog[0]}</div>
            <div className="table-main"><strong>{order.service} · {order.dog}</strong><span>{order.date} · {order.area}</span></div>
            <span className={`table-status ${order.applicationCount ? 'has-replies' : ''}`}>{order.state}</span>
            {role === 'owner' && order.applicationCount > 0 && <button className="text-button" onClick={() => onReview(order)}>Отклики ({order.applicationCount})</button>}
            {role === 'walker' && order.rawStatus === 'Assigned' && <button className="text-button" onClick={() => onStart(order)}>Начать</button>}
            {role === 'walker' && order.rawStatus === 'InProgress' && <button className="text-button" onClick={() => onComplete(order)}>Завершить</button>}
            <strong className="table-price">{order.price}</strong>
          </div>
        )) : <div className="empty-state"><span className="empty-icon"><Icon name="calendar" size={22} /></span><h3>Пока нет заказов</h3><p>Новые заявки и услуги появятся здесь.</p></div>}
      </div>
    </div>
  );
}
function ConnectedDogsPage({ dogs, onAdd }) {
  return <div className="content-page"><div className="page-heading"><div><p className="eyebrow">ЗАБОТА С ХАРАКТЕРОМ</p><h1>Мои собаки</h1><p className="page-subtitle">Важные детали помогают исполнителю лучше подготовиться.</p></div><button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Добавить собаку</button></div>{dogs.length ? <div className="dog-grid">{dogs.map((dog, index) => <article className="pet-card" key={dog.id}><div className={`pet-photo ${index % 2 ? 'avatar-green' : 'avatar-peach'}`}><span>🐕</span></div><div className="pet-info"><div><h2>{dog.name}</h2><span>{dog.breed || 'Порода не указана'}{dog.age ? ` · ${dog.age} лет` : ''}</span></div><p>{dog.behaviorNotes || dog.note || dog.specialNeeds || 'Добавьте описание поведения и особенности ухода, чтобы исполнитель лучше подготовился.'}</p><div className="pet-tags"><span>Карточка собаки</span></div></div></article>)}</div> : <div className="placeholder-card"><div className="placeholder-icon"><Icon name="paw" size={24} /></div><h2>Добавьте первую собаку</h2><p>Карточка собаки понадобится при создании заказа.</p><button className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Добавить собаку</button></div>}</div>;
}

function CreateDogModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const submit = (event) => { event.preventDefault(); onCreate({ name, breed, age: Number(age) }); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="order-modal dog-modal" onSubmit={submit}><div className="modal-heading"><div><p className="eyebrow">КАРТОЧКА ПИТОМЦА</p><h2>Добавить собаку</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button></div><div className="form-grid"><label>Кличка<input required maxLength="80" value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Ричи" /></label><label>Порода<input maxLength="100" value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="Можно оставить пустым" /></label><label>Возраст, лет<input type="number" required min="0" max="40" value={age} onChange={(event) => setAge(event.target.value)} /></label></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Отмена</button><button type="submit" className="button button-primary">Сохранить собаку <Icon name="check" size={16} /></button></div></form></div>;
}

function CandidatesModal({ order, candidates, onClose, onAssign, loading }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="order-modal candidates-modal"><div className="modal-heading"><div><p className="eyebrow">ОТКЛИКИ НА ЗАКАЗ</p><h2>{order.service} · {order.dog}</h2><p className="page-subtitle">Выберите исполнителя. Точный адрес станет доступен после назначения.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button></div>{candidates.length ? <div className="candidate-list">{candidates.map((candidate) => <article className="candidate-card" key={candidate.walkerId}><div className="dog-avatar avatar-green">{candidate.walkerName?.[0] || 'И'}</div><div className="candidate-info"><strong>{candidate.walkerName || 'Исполнитель'}</strong><span>Откликнулся {new Date(candidate.createdAt).toLocaleDateString('ru-RU')}</span></div><button className="button button-primary" disabled={loading || candidate.status !== 'Pending'} onClick={() => onAssign(candidate)}>{candidate.status === 'Accepted' ? 'Назначен' : candidate.status === 'Rejected' ? 'Не выбран' : 'Выбрать'}</button></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="user" size={22} /></span><h3>Откликов пока нет</h3><p>Когда исполнитель откликнется, его карточка появится здесь.</p></div>}</section></div>;
}

function SimplePage({ tab, role }) {
  const content = {
    messages: ['Сообщения', 'Переписка будет привязана к заказу — важные детали останутся в истории.'],
    availability: ['Доступность', 'Отметьте дни и время, когда готовы брать заказы.'],
    services: ['Услуги и районы', 'Выберите выгул и/или передержку, задайте районы и рабочее время.'],
    profile: ['Профиль', 'Контакты, подтверждение аккаунта, описание и настройки безопасности.'],
  }[tab] || ['Раздел', 'Этот экран подготовлен для следующего этапа.'];
  return <div className="content-page"><div className="page-heading"><div><p className="eyebrow">{role === 'owner' ? 'ВАШ АККАУНТ' : 'РАБОЧИЙ ПРОФИЛЬ'}</p><h1>{content[0]}</h1><p className="page-subtitle">{content[1]}</p></div></div><div className="placeholder-card"><div className="placeholder-icon"><Icon name={tab === 'messages' ? 'chat' : tab === 'availability' ? 'clock' : tab === 'services' ? 'sliders' : 'user'} size={25} /></div><h2>{tab === 'messages' ? 'Пока нет переписок' : 'Настроим этот раздел вместе'}</h2><p>{tab === 'messages' ? 'Когда появится отклик или активный заказ, диалог будет доступен здесь.' : 'Базовая структура готова. Подключим данные и действия на следующем этапе.'}</p></div></div>;
}

function CreateOrderModal({ onClose, onCreate, onAddDog, dogs }) {
  const [service, setService] = useState('Выгул');
  const [dogId, setDogId] = useState(String(dogs[0]?.id ?? ''));
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('45 минут');
  const [step, setStep] = useState(1);
  const submit = (event) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    const dog = dogs.find((item) => String(item.id) === String(dogId));
    onCreate({ service, dogId: Number(dogId), dog, description, area, locationAddress, date, endDate, time, endTime, duration });
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="order-modal" onSubmit={submit}>
        <div className="modal-heading"><div><p className="eyebrow">НОВАЯ ЗАЯВКА · ШАГ {step} ИЗ 2</p><h2>{step === 1 ? 'Расскажите, какая помощь нужна' : 'Проверьте детали заказа'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button></div>
        {dogs.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="paw" size={22} /></span><h3>Сначала добавьте собаку</h3><p>Каждый заказ должен быть привязан к карточке питомца.</p><button type="button" className="button button-primary" onClick={() => { onClose(); onAddDog(); }}><Icon name="plus" size={16} /> Добавить собаку</button></div> : step === 1 ? <>
          <div className="service-choice">{['Выгул', 'Передержка'].map((item) => <button type="button" key={item} className={service === item ? 'service-choice-button active' : 'service-choice-button'} onClick={() => setService(item)}><Icon name={item === 'Выгул' ? 'paw' : 'heart'} size={18} /><span>{item}</span><small>{item === 'Выгул' ? 'Прогулка рядом с домом' : 'Уход на несколько дней'}</small></button>)}</div>
          <div className="form-grid">
            <label>Собака<select value={dogId} onChange={(event) => setDogId(event.target.value)} required>{dogs.map((dog) => <option key={dog.id} value={dog.id}>{dog.name}</option>)}</select></label>
            {service === 'Выгул' && <label>Длительность<select value={duration} onChange={(event) => setDuration(event.target.value)}><option>30 минут</option><option>45 минут</option><option>60 минут</option></select></label>}
            <label>{service === 'Выгул' ? 'Дата прогулки' : 'Дата заезда'}<input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label>{service === 'Выгул' ? 'Время прогулки' : 'Время заезда'}<input type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label>
            {service === 'Передержка' && <><label>Дата выезда<input type="date" required min={date || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label>Время выезда<input type="time" required min={endDate === date ? time : undefined} value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></>}
            <label>Район<input required maxLength="120" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Например, Хамовники" /></label>
            <label>Точный адрес<input required maxLength="300" value={locationAddress} onChange={(event) => setLocationAddress(event.target.value)} placeholder="Улица и дом" /></label>
            <label className="full-field">Что важно знать исполнителю?<textarea required maxLength="2000" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Расскажите о характере собаки и пожеланиях к услуге" rows="3" /><small>Не указывайте телефон и другие личные контакты.</small></label>
          </div>
        </> : <div className="order-review">
          <div className="review-service"><span className="service-icon"><Icon name={service === 'Выгул' ? 'paw' : 'heart'} /></span><div><strong>{service} для {dogs.find((item) => String(item.id) === String(dogId))?.name}</strong><span>{service === 'Выгул' ? duration : `${date} — ${endDate}`}</span></div><button type="button" className="text-button" onClick={() => setStep(1)}>Изменить</button></div>
          <div className="review-row"><span>{service === 'Выгул' ? 'Когда' : 'Период'}</span><strong>{service === 'Выгул' ? `${date} · ${time}` : `${date} ${time} — ${endDate} ${endTime}`}</strong></div>
          <div className="review-row"><span>Район</span><strong>{area}</strong></div>
          <div className="review-row"><span>Точный адрес</span><strong>{locationAddress}</strong></div>
          <div className="review-description"><span>Описание</span><p>{description}</p></div>
          <div className="review-price"><span>Бюджет</span><strong>Уточнить с исполнителем</strong><small>Условия оплаты будут показаны до подтверждения заказа.</small></div>
        </div>}
        <div className="privacy-note"><Icon name="shield" size={17} /><span>Точный адрес будет доступен только после назначения исполнителя.</span></div>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={step === 2 ? () => setStep(1) : onClose}>{step === 2 ? 'Назад' : 'Отмена'}</button><button type="submit" className="button button-primary">{step === 1 ? 'Проверить заказ' : 'Опубликовать заказ'} <Icon name={step === 1 ? 'arrow' : 'check'} size={16} /></button></div>
      </form>
    </div>
  );
}

function Dashboard({ dashboardRole }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = dashboardRole;
  const [tab, setTab] = useState('map');
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDogModal, setShowDogModal] = useState(false);
  const [candidateOrder, setCandidateOrder] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [toast, setToast] = useState('');

  const nav = role === 'owner' ? ownerNav : walkerNav;
  const userId = user?.id ?? user?.userId;
  const {
    data: dashboardData = {},
    isLoading,
    error: dashboardError,
    refetch: refreshDashboard,
  } = useQuery({
    queryKey: ['dashboard', role, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (role === 'owner') {
        const [dogResponse, orderResponse] = await Promise.all([
          apiClient.get('/Pets/mine'),
          apiClient.get('/Orders/mine'),
        ]);
        const ownerOrdersFromApi = orderResponse.data.map(toViewOrder);
        return { dogs: dogResponse.data, ownerRequests: ownerOrdersFromApi, myOrders: ownerOrdersFromApi, orders: [] };
      }
      const [availableResponse, orderResponse] = await Promise.all([
        apiClient.get('/Orders/available'),
        apiClient.get('/Orders/mine'),
      ]);
      return { orders: availableResponse.data.map(toViewOrder), myOrders: orderResponse.data.map(toViewOrder), dogs: [], ownerRequests: [] };
    },
  });
  const orders = dashboardData.orders || [];
  const ownerRequests = dashboardData.ownerRequests || [];
  const myOrders = dashboardData.myOrders || [];
  const dogs = dashboardData.dogs || [];
  const liveOrders = role === 'owner' ? ownerRequests : orders;
  const loadError = dashboardError
    ? (typeof dashboardError.response?.data === 'string' ? dashboardError.response.data : 'Не удалось загрузить данные. Попробуйте обновить страницу.')
    : '';

  const flash = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };

  const handleCreateOrder = async (values) => {
    try {
      const startAt = new Date(`${values.date}T${values.time}`).toISOString();
      const endAt = values.service === 'Передержка' ? new Date(`${values.endDate}T${values.endTime}`).toISOString() : null;
      await apiClient.post('/Orders', {
        petId: values.dogId,
        serviceType: values.service === 'Передержка' ? 'boarding' : 'walking',
        startAt,
        endAt,
        durationMinutes: values.service === 'Выгул' ? Number.parseInt(values.duration, 10) : null,
        area: values.area,
        locationAddress: values.locationAddress,
        description: values.description,
      });
      await refreshDashboard();
      setShowModal(false);
      setTab('map');
      flash('Заказ опубликован. Исполнители увидят его в списке.');
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось опубликовать заказ. Проверьте данные и попробуйте ещё раз.');
    }
  };

  const handleCreateDog = async (values) => {
    try {
      await apiClient.post('/Pets', values);
      await refreshDashboard();
      setShowDogModal(false);
      flash('Карточка собаки сохранена.');
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось сохранить карточку собаки.');
    }
  };

  const handleRespond = async (order) => {
    try {
      await apiClient.post(`/Orders/${order.id}/applications`);
      await refreshDashboard();
      flash(`Отклик по заказу «${order.service.toLowerCase()}» отправлен.`);
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось отправить отклик.');
    }
  };

  const handleReviewApplications = async (order) => {
    setCandidateOrder(order);
    setCandidates([]);
    setIsLoadingCandidates(true);
    try {
      const response = await apiClient.get(`/Orders/${order.id}/applications`);
      setCandidates(response.data.map((candidate) => ({
        ...candidate,
        walkerId: candidate.sitterId,
        walkerName: candidate.sitterName,
        status: ({ pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' })[String(candidate.status).toLowerCase()] || candidate.status,
      })));
    } catch (error) {
      setCandidateOrder(null);
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось загрузить отклики.');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleAssignCandidate = async (candidate) => {
    if (!candidateOrder) return;
    try {
      await apiClient.put(`/Orders/${candidateOrder.id}/assign/${candidate.sitterId}`);
      await refreshDashboard();
      setCandidateOrder(null);
      flash(`${candidate.walkerName} назначен исполнителем.`);
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось назначить исполнителя. Обновите список откликов.');
    }
  };
  const handleStartOrder = async (order) => {
    try {
      await apiClient.put(`/Orders/${order.id}/start`);
      await refreshDashboard();
      flash('Заказ переведён в работу.');
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось начать заказ. Обновите список.');
    }
  };

  const handleCompleteOrder = async (order) => {
    const reportText = window.prompt('Кратко опишите, как прошёл заказ:', 'Услуга выполнена.');
    if (reportText === null) return;
    try {
      await apiClient.put(`/Orders/${order.id}/complete`, { reportText });
      await refreshDashboard();
      flash('Заказ завершён.');
    } catch (error) {
      const message = error.response?.data;
      flash(typeof message === 'string' ? message : 'Не удалось завершить заказ. Обновите список.');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setTab('map'); }}><span className="brand-mark"><Icon name="paw" size={22} /></span><span>dogwalking<small>ЗАБОТА РЯДОМ</small></span></a>
        <div className="sidebar-label">МЕНЮ</div>
        <nav className="side-nav" aria-label="Главная навигация">{nav.map(([id, label, icon]) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(id)}><Icon name={icon} /><span>{label}</span>{id === 'messages' && <i className="nav-badge">2</i>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><Icon name="heart" size={17} /></div><strong>Мы рядом</strong><p>Нужна помощь с заказом?</p><button onClick={() => flash('Раздел поддержки будет подключён следующим этапом.')}>Написать в поддержку <Icon name="arrow" size={14} /></button></div><button className="nav-item logout-item" onClick={() => { logout(); navigate('/login', { replace: true }); }}><Icon name="logout" /><span>Выйти</span></button></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><span>/</span><strong>{nav.find(([id]) => id === tab)?.[1] || 'Карта'}</strong></div><div className="topbar-right"><button className="city-button"><Icon name="pin" size={16} /> Москва <span>⌄</span></button><button className="notification-button" aria-label="Уведомления" onClick={() => flash('Новых уведомлений пока нет.')}><Icon name="bell" size={19} /><i /></button><div className="user-chip"><div className="mini-avatar">{user.name?.[0] || 'A'}</div><div><strong>{user.name || 'Пользователь'}</strong><span>{role === 'owner' ? 'Владелец' : 'Исполнитель'}</span></div><span className="chevron">⌄</span></div></div></header>
        <div className="workspace">
          {loadError && <div className="load-error" role="alert">{loadError}<button onClick={() => void refreshDashboard()}>Повторить</button></div>}
          {isLoading && <div className="loading-note"><span /> Загружаем ваши данные…</div>}
          {tab === 'map' && <MapPage role={role} orders={liveOrders} selectedId={selectedId} onSelect={setSelectedId} onCreate={() => setShowModal(true)} onRespond={handleRespond} onReview={handleReviewApplications} />}
          {tab === 'orders' && <ConnectedOrdersPage role={role} orders={myOrders} onCreate={() => setShowModal(true)} onReview={handleReviewApplications} onStart={handleStartOrder} onComplete={handleCompleteOrder} />}
          {tab === 'dogs' && role === 'owner' && <ConnectedDogsPage dogs={dogs} onAdd={() => setShowDogModal(true)} />}
          {tab !== 'map' && tab !== 'orders' && tab !== 'dogs' && <SimplePage tab={tab} role={role} />}
        </div>
      </main>
      {showModal && <CreateOrderModal onClose={() => setShowModal(false)} onCreate={handleCreateOrder} onAddDog={() => { setTab('dogs'); setShowDogModal(true); }} dogs={dogs} />}
      {showDogModal && <CreateDogModal onClose={() => setShowDogModal(false)} onCreate={handleCreateDog} />}
      {candidateOrder && <CandidatesModal order={candidateOrder} candidates={candidates} loading={isLoadingCandidates} onClose={() => setCandidateOrder(null)} onAssign={handleAssignCandidate} />}
      {toast && <div className="toast" role="status"><span><Icon name="check" size={17} /></span>{toast}</div>}
    </div>
  );
}

export default Dashboard;



