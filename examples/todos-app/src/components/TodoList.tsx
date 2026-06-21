import { useState, type FormEvent } from 'react';
import { useQuery, useResource, useSyncStatus } from '@flexstore/react';

export function TodoList() {
  const todos = useQuery('todos', { done: false });
  const { create, update } = useResource('todos');
  const status = useSyncStatus();
  const [title, setTitle] = useState('');

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    create({ title: trimmed, done: false });
    setTitle('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todos</h1>
        <p>Local-first · syncs with FlexStore</p>
      </header>

      <div className="statusbar" role="status">
        <span
          className={`statusbar-dot ${status.online ? 'online' : 'offline'}`}
          aria-hidden
        />
        <span className="statusbar-label">{status.online ? 'Online' : 'Offline'}</span>
        <span className="statusbar-meta">
          {status.pending} pending
          {status.stage === 'syncing' ? ' · syncing…' : ''}
        </span>
        {status.lastError && <p className="statusbar-error">{status.lastError}</p>}
      </div>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="Todo title"
        />
        <button type="submit" disabled={!title.trim()}>
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="empty-state">
          <strong>No open todos</strong>
          Add one above — it saves locally and syncs when online.
        </p>
      ) : (
        <ul className="todo-list">
          {todos.map((t) => (
            <li className="todo-item" key={String(t.id)}>
              <span className="todo-title">{String(t.title)}</span>
              <button
                type="button"
                className="todo-done"
                onClick={() => update(String(t.id), { done: true })}
              >
                Done
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
