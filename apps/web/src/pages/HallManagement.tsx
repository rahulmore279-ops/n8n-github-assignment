import { FormEvent, useEffect, useState } from 'react';
import { createHall, listHalls, setHallStatus, updateHall, type Hall, type HallInput } from '../api/client';

type HallManagementProps = { token: string };

const emptyForm: HallInput = { name: '', code: '', capacity: 1, description: '', active: true };

export function HallManagement({ token }: HallManagementProps) {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [form, setForm] = useState<HallInput>(emptyForm);
  const [editingHallId, setEditingHallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadHalls() {
    setIsLoading(true);
    setError('');
    try {
      const response = await listHalls(token);
      setHalls(response.halls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load halls');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHalls();
  }, [token]);

  function editHall(hall: Hall) {
    setEditingHallId(hall.id);
    setForm({ name: hall.name, code: hall.code, capacity: hall.capacity, description: hall.description ?? '', active: hall.active });
  }

  function resetForm() {
    setEditingHallId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.code.trim() || Number(form.capacity) <= 0) {
      setError('Hall name, unique code, and valid capacity are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingHallId) {
        await updateHall(token, editingHallId, form);
      } else {
        await createHall(token, form);
      }
      resetForm();
      await loadHalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save hall');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStatus(hall: Hall) {
    setError('');
    try {
      await setHallStatus(token, hall.id, !hall.active);
      await loadHalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update hall status');
    }
  }

  return (
    <section className="panel hall-management">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Hall Management</p>
          <h2>Manage banquet and conference spaces</h2>
        </div>
        <button className="secondary" onClick={resetForm}>New Hall</button>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <form className="hall-form" onSubmit={handleSubmit}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>
        <label>Code<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required minLength={2} /></label>
        <label>Capacity<input value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} required min={1} type="number" /></label>
        <label>Description<input value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <button disabled={isSaving} type="submit">{isSaving ? 'Saving...' : editingHallId ? 'Update Hall' : 'Add Hall'}</button>
      </form>

      {isLoading ? <p>Loading halls...</p> : (
        <div className="hall-grid">
          {halls.map((hall) => (
            <article className="hall-card" key={hall.id}>
              <div>
                <h3>{hall.name}</h3>
                <p>{hall.code} · {hall.capacity} guests</p>
                {hall.description && <p>{hall.description}</p>}
              </div>
              <span className={hall.active ? 'status active' : 'status inactive'}>{hall.active ? 'Active' : 'Inactive'}</span>
              <div className="card-actions">
                <button className="secondary" onClick={() => editHall(hall)}>Edit</button>
                <button onClick={() => toggleStatus(hall)}>{hall.active ? 'Deactivate' : 'Activate'}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
