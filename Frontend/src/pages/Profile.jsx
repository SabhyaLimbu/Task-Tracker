import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useTaskMeta } from '../hooks/useTaskMeta';
import { FetchTasks } from '../api/tasks';
import AppLayout from '../components/AppLayout';
import StatsCards from '../components/StatsCards';
import { computeCounts } from '../utils/taskUtils';

const Profile = () => {
  const { user, logout } = useAuth();
  const { displayName, bio, initials, saveProfile } = useProfile(user);
  const { meta } = useTaskMeta(user);

  const [name, setName] = useState(displayName);
  const [about, setAbout] = useState(bio);
  const [saved, setSaved] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(displayName);
    setAbout(bio);
  }, [displayName, bio]);

  useEffect(() => {
    let cancelled = false;
    FetchTasks()
      .then((data) => !cancelled && setTasks(data))
      .catch((error) => console.error('Failed to fetch tasks:', error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = (event) => {
    event.preventDefault();
    saveProfile({ displayName: name.trim(), bio: about.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const counts = computeCounts(tasks, meta);
  const liveTasks = tasks.filter((task) => !meta[task._id]?.archived);

  return (
    <AppLayout user={user} onLogout={logout} counts={loading ? null : counts}>
      <div className="page-hero">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1>Profile<span>.</span></h1>
      </div>

      <div className="dashboard-grid">
        <section className="panel profile-card">
          <div className="profile-top">
            <span className="avatar avatar-lg">{initials}</span>
            <div>
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-email">{user?.email}</p>
              {memberSince && (
                <p className="profile-meta">Member since {memberSince}</p>
              )}
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <label>
              Display name
              <input
                type="text"
                value={name}
                maxLength={50}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              Email
              <input type="email" value={user?.email || ''} disabled />
            </label>

            <label>
              About you
              <textarea
                rows={3}
                maxLength={200}
                placeholder="A short bio or what you're working towards"
                value={about}
                onChange={(event) => setAbout(event.target.value)}
              />
            </label>

            <div className="profile-actions">
              <button type="submit" className="primary-btn">Save changes</button>
              {saved && <span className="saved-note">Saved</span>}
            </div>
          </form>
        </section>

        <div className="side-column">
          {loading ? (
            <section className="panel">
              <p className="profile-meta">Loading statistics...</p>
            </section>
          ) : (
            <StatsCards tasks={liveTasks} meta={meta} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;