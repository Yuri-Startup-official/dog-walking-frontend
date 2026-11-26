import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import './SupportCenter.css';

const topicNames = { order: 'Вопрос по заказу', account: 'Аккаунт', other: 'Другое' };
const statusNames = { open: 'Открыт', waiting: 'Ждём ответа клиента', resolved: 'Решён' };
const errorMessage = (error, fallback) => typeof error?.response?.data === 'string' ? error.response.data : fallback;
const formatDate = (value) => new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function SupportCenter({ manager = false, orders = [] }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [topic, setTopic] = useState('other');
  const [orderId, setOrderId] = useState('');
  const [draft, setDraft] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const listQuery = useQuery({
    queryKey: ['support-conversations', manager],
    queryFn: async () => (await apiClient.get('/support/conversations')).data,
    refetchInterval: 5000,
  });
  const conversations = listQuery.data || [];
  const selected = conversations.find((item) => item.id === selectedId) || conversations[0] || null;
  const activeId = selected?.id ?? null;
  const messagesQuery = useQuery({
    queryKey: ['support-messages', activeId],
    queryFn: async () => (await apiClient.get('/support/conversations/' + activeId + '/messages')).data,
    enabled: activeId != null,
    refetchInterval: activeId == null ? false : 4000,
  });
  const messages = messagesQuery.data || [];

  const refresh = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['support-conversations'] }),
    queryClient.invalidateQueries({ queryKey: ['support-messages'] }),
  ]);
  const createConversation = useMutation({
    mutationFn: async () => (await apiClient.post('/support/conversations', {
      topic,
      orderId: orderId ? Number(orderId) : null,
      message: initialMessage.trim(),
    })).data,
    onSuccess: async (conversation) => {
      setShowCreate(false);
      setInitialMessage('');
      setOrderId('');
      setSelectedId(Number(conversation.id));
      setActionError('');
      await refresh();
    },
    onError: (error) => setActionError(errorMessage(error, 'Не удалось создать обращение. Попробуйте ещё раз.')),
  });
  const sendMessage = useMutation({
    mutationFn: async () => apiClient.post('/support/conversations/' + activeId + '/messages', { body: draft.trim() }),
    onSuccess: async () => {
      setDraft('');
      setActionError('');
      await refresh();
    },
    onError: (error) => setActionError(errorMessage(error, 'Не удалось отправить сообщение.')),
  });
  const assignConversation = useMutation({
    mutationFn: async () => apiClient.put('/support/conversations/' + activeId + '/assignment'),
    onSuccess: async () => { setActionError(''); await refresh(); },
    onError: (error) => setActionError(errorMessage(error, 'Не удалось назначить обращение.')),
  });
  const updateStatus = useMutation({
    mutationFn: async (status) => apiClient.put('/support/conversations/' + activeId + '/status', { status }),
    onSuccess: async () => { setActionError(''); await refresh(); },
    onError: (error) => setActionError(errorMessage(error, 'Не удалось изменить статус.')),
  });
  const selectedOrder = useMemo(
    () => orders.find((order) => String(order.id) === String(selected?.orderId)),
    [orders, selected?.orderId],
  );

  function submitCreate(event) {
    event.preventDefault();
    if (initialMessage.trim()) createConversation.mutate();
  }
  function submitMessage(event) {
    event.preventDefault();
    if (draft.trim() && activeId != null) sendMessage.mutate();
  }

  return (
    <section className="support-center">
      <header className="support-heading">
        <div>
          <p className="eyebrow">{manager ? 'РАБОЧЕЕ МЕСТО' : 'ПОМОЩЬ И ПОДДЕРЖКА'}</p>
          <h1>{manager ? 'Обращения клиентов' : 'Поддержка'}</h1>
          <p>{manager ? 'Очередь обращений владельцев и исполнителей.' : 'Напишите менеджеру. История обращений сохранится в вашем аккаунте.'}</p>
        </div>
        {!manager && <button className="support-primary" onClick={() => { setShowCreate(true); setActionError(''); }}>Новое обращение</button>}
      </header>

      {showCreate && (
        <form className="support-create" onSubmit={submitCreate}>
          <div className="support-create-heading">
            <div><strong>Новое обращение</strong><span>Опишите вопрос, менеджер ответит в этом чате.</span></div>
            <button type="button" className="support-close" onClick={() => setShowCreate(false)} aria-label="Закрыть">×</button>
          </div>
          <div className="support-create-fields">
            <label>Тема<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="order">Вопрос по заказу</option><option value="account">Аккаунт</option><option value="other">Другое</option></select></label>
            {orders.length > 0 && <label>Заказ (необязательно)<select value={orderId} onChange={(event) => setOrderId(event.target.value)}><option value="">Не прикреплять заказ</option>{orders.map((order) => <option key={order.id} value={order.id}>№{order.id} · {order.service} · {order.dog}</option>)}</select></label>}
          </div>
          <label className="support-full-label">Сообщение<textarea value={initialMessage} onChange={(event) => setInitialMessage(event.target.value)} required maxLength={4000} rows={3} placeholder="Расскажите, чем мы можем помочь" /></label>
          {actionError && <p className="support-error" role="alert">{actionError}</p>}
          <div className="support-form-actions"><button type="button" className="support-secondary" onClick={() => setShowCreate(false)}>Отмена</button><button className="support-primary" disabled={!initialMessage.trim() || createConversation.isPending}>{createConversation.isPending ? 'Отправляем…' : 'Отправить обращение'}</button></div>
        </form>
      )}

      <div className="support-layout">
        <aside className="support-list" aria-label="Список обращений">
          <div className="support-list-title">{manager ? 'Очередь' : 'Мои обращения'} <span>{conversations.length}</span></div>
          {listQuery.isLoading && <div className="support-empty">Загружаем обращения…</div>}
          {listQuery.isError && <div className="support-error-block">{errorMessage(listQuery.error, 'Не удалось загрузить обращения.')}</div>}
          {!listQuery.isLoading && !listQuery.isError && conversations.length === 0 && <div className="support-empty">{manager ? 'Новых обращений пока нет.' : 'Здесь появятся ваши обращения.'}</div>}
          {conversations.map((conversation) => (
            <button key={conversation.id} className={'support-conversation ' + (selectedId === conversation.id ? 'selected' : '')} onClick={() => { setSelectedId(conversation.id); setActionError(''); }}>
              <span className="support-conversation-top">
                <strong>{manager ? conversation.requesterName + ' · ' + conversation.requesterRole : topicNames[conversation.topic] || 'Обращение'}</strong>
                <small>{formatDate(conversation.updatedAt)}</small>
              </span>
              <span className="support-conversation-preview">{conversation.lastMessage || 'Нет сообщений'}</span>
              <span className={'support-status status-' + conversation.status}>{statusNames[conversation.status] || conversation.status}</span>
            </button>
          ))}
        </aside>

        <section className="support-thread" aria-label="Переписка с поддержкой">
          {!selected && <div className="support-thread-empty"><span>✉</span><strong>{manager ? 'Выберите обращение' : 'Выберите обращение или создайте новое'}</strong><p>Сообщения появятся здесь.</p></div>}
          {selected && <>
            <header className="support-thread-heading">
              <div>
                <strong>{manager ? selected.requesterName : topicNames[selected.topic] || 'Обращение'}</strong>
                <span>{manager ? selected.requesterRole + ' · ' : ''}{selected.orderId ? 'Заказ №' + selected.orderId : 'Обращение в поддержку'} · {statusNames[selected.status] || selected.status}</span>
              </div>
              {manager && <div className="support-manager-actions">
                {!selected.assignedManagerId && <button className="support-secondary" disabled={assignConversation.isPending} onClick={() => assignConversation.mutate()}>Взять в работу</button>}
                {selected.assignedManagerId && selected.status !== 'resolved' && <button className="support-secondary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate('resolved')}>Закрыть обращение</button>}
                {selected.status === 'resolved' && <button className="support-secondary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate('open')}>Открыть снова</button>}
              </div>}
            </header>
            {manager && selectedOrder && <div className="support-order-context">Связанный заказ: {selectedOrder.service}, {selectedOrder.dog} · {selectedOrder.date}</div>}
            {actionError && <p className="support-error support-inline-error" role="alert">{actionError}</p>}
            <div className="support-messages" aria-live="polite">
              {messagesQuery.isLoading && <div className="support-empty">Загружаем сообщения…</div>}
              {!messagesQuery.isLoading && messages.map((message) => {
                const own = manager ? message.senderRole === 'support' : message.senderRole !== 'support';
                return <article key={message.id} className={'support-message ' + (own ? 'own' : '')}>
                  <div className="support-message-meta"><strong>{message.senderRole === 'support' ? 'Менеджер поддержки' : message.senderName}</strong><time>{formatDate(message.createdAt)}</time></div>
                  <p>{message.body}</p>
                </article>;
              })}
            </div>
            {(!manager || selected.status !== 'resolved') && (!manager || selected.assignedManagerId) && <form className="support-reply" onSubmit={submitMessage}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={4000} placeholder="Напишите сообщение…" aria-label="Текст сообщения" /><button className="support-primary" disabled={!draft.trim() || sendMessage.isPending}>{sendMessage.isPending ? 'Отправляем…' : 'Отправить'}</button></form>}
            {manager && !selected.assignedManagerId && <div className="support-assign-hint">Чтобы ответить клиенту, сначала возьмите обращение в работу.</div>}
            {!manager && selected.status === 'resolved' && <div className="support-assign-hint">Если вопрос остался, отправьте сообщение — обращение снова откроется.</div>}
          </>}
        </section>
      </div>
    </section>
  );
}
