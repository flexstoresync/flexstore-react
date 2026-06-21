import { FlexStoreProvider } from '@flexstore/react';
import { buildSyncConfig } from './sync/config';
import { TodoList } from './components/TodoList';
import './App.css';

export function App() {
  return (
    <FlexStoreProvider config={buildSyncConfig()}>
      <TodoList />
    </FlexStoreProvider>
  );
}

export default App;
