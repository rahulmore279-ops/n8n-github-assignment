import { useEffect, useState } from 'react';
import { getHallAvailability, listHalls, type Hall, type HallAvailability, type LoginResponse } from '../api/client';
import { HallManagement } from './HallManagement';

const modules = [
  'Dashboard',
  'Hall Management',
  'Enquiry Management',
  'Booking Management',
  'Hall Availability',
  'Booking Calendar',
  'Customer & Company Details',
  'Payment Tracking',
  'Reports',
  'User Management'
];

type DashboardProps = {
  session: LoginResponse;
  onLogout: () => void;
};

export function Dashboard({ session, onLogout }: DashboardProps) {
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [halls, setHalls] = useState<Hall[]>([]);
  const [availability, setAvailability] = useState<Record<string, HallAvailability>>({});
  const [availabilityError, setAvailabilityError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    listHalls(session.token)
      .then(async ({ halls: loadedHalls }) => {
        setHalls(loadedHalls);
        const entries = await Promise.all(
          loadedHalls.map(async (hall) => [hall.id, await getHallAvailability(session.token, hall.id, today)] as const)
        );
        setAvailability(Object.fromEntries(entries));
      })
      .catch((error) => setAvailabilityError(error instanceof Error ? error.message : 'Unable to load hall availability'));
  }, [session.token, today]);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">BMS</div>
        <nav aria-label="Primary navigation">
          {modules.map((module) => (
            <button className={activeModule === module ? 'nav-link active' : 'nav-link'} key={module} onClick={() => setActiveModule(module)}>
              {module}
            </button>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeModule}</p>
            <h1>Welcome, {session.user.fullName}</h1>
          </div>
          <button className="secondary" onClick={onLogout}>Logout</button>
        </header>

        {activeModule === 'Hall Management' ? <HallManagement token={session.token} /> : (
          <>
            <section className="stats-grid" aria-label="Operational overview">
              <article><span>Enquiries</span><strong>Ready</strong><p>Capture and qualify banquet enquiries.</p></article>
              <article><span>Bookings</span><strong>Planned</strong><p>Convert approved enquiries into hall bookings.</p></article>
              <article><span>Payments</span><strong>Tracked</strong><p>Record advances, balances, and payment methods.</p></article>
            </section>
            <section className="panel">
              <h2>Today's hall availability</h2>
              <p>{today}</p>
              {availabilityError && <div className="form-error" role="alert">{availabilityError}</div>}
              <div className="module-grid">
                {halls.map((hall) => {
                  const hallAvailability = availability[hall.id];
                  return (
                    <div className="module-card" key={hall.id}>
                      <strong>{hall.name}</strong>
                      <span>{hall.capacity} guests</span>
                      <span className={hallAvailability?.available ? 'status active' : 'status inactive'}>
                        {hallAvailability ? hallAvailability.available ? 'Available' : hallAvailability.reason ?? 'Unavailable' : 'Checking...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="panel">
              <h2>Implementation roadmap</h2>
              <div className="module-grid">
                {modules.filter((module) => module !== 'Dashboard').map((module) => <div className="module-card" key={module}>{module}</div>)}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
