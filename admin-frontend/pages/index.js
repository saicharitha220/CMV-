import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../store/authSlice';
import { fetchContent, saveContent, createContent } from '../store/contentSlice';

const AdminPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const contentState = useSelector((state) => state.content);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [newItem, setNewItem] = useState({ key: '', name: '', description: '', value: '{}' });

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchContent());
    }
  }, [auth.token, dispatch]);

  useEffect(() => {
    if (editingKey) {
      const item = contentState.items.find((item) => item.key === editingKey);
      setEditorValue(item?.value ? JSON.stringify(item.value, null, 2) : '');
    }
  }, [editingKey, contentState.items]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleSave = () => {
    try {
      const value = JSON.parse(editorValue);
      dispatch(saveContent({ key: editingKey, updates: { value } }));
      setEditingKey(null);
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
    }
  };

  const handleCreate = () => {
    try {
      const value = JSON.parse(newItem.value);
      dispatch(createContent({ ...newItem, value }));
      setNewItem({ key: '', name: '', description: '', value: '{}' });
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
    }
  };

  if (!auth.token) {
    return (
      <main className="admin-shell">
        <section className="admin-card" style={{ maxWidth: 420, margin: '40px auto 0' }}>
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin} className="admin-form-grid">
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button type="submit">Login</button>
            {auth.error && <p style={{ color: 'red' }}>{auth.error}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-toolbar">
        <h1 style={{ margin: 0 }}>Content Management</h1>
        <button className="secondary" onClick={() => dispatch(logout())}>Logout</button>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Content Items</h2>
          {contentState.status === 'loading' && <p>Loading...</p>}
          {contentState.error && <p style={{ color: 'red' }}>{contentState.error}</p>}
          <ul className="admin-list">
            {contentState.items.map((item) => (
              <li key={item.key} className="admin-item">
                <div className="admin-item-header">
                  <strong>{item.name}</strong>
                  <button onClick={() => setEditingKey(item.key)}>Edit JSON</button>
                </div>
                <p>{item.description}</p>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(item.value, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-form-card">
          <h2>Add New Content Item</h2>
          <div className="admin-form-grid">
            <label>
              Key
              <input value={newItem.key} onChange={(e) => setNewItem({ ...newItem, key: e.target.value })} />
            </label>
            <label>
              Name
              <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            </label>
            <label>
              Description
              <input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            </label>
            <label>
              Value (JSON)
              <textarea
                rows="8"
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                style={{ fontFamily: 'monospace' }}
              />
            </label>
            <button onClick={handleCreate}>Create Content Item</button>
          </div>
        </section>
      </div>

      {editingKey && (
        <section className="admin-editor-card" style={{ marginTop: 20 }}>
          <h2>Edit Content: {editingKey}</h2>
          <textarea
            className="admin-editor"
            value={editorValue}
            onChange={(e) => setEditorValue(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
          <div className="admin-inline-actions" style={{ marginTop: 12 }}>
            <button onClick={handleSave}>Save</button>
            <button className="secondary" onClick={() => setEditingKey(null)}>Cancel</button>
          </div>
        </section>
      )}
    </main>
  );
};

export default AdminPage;
