import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Compass, LayoutDashboard, Plus, Search, MapPin, Clock,
  Users, Heart, LogOut, Menu, X, Ticket, UserRound, Settings, Trash2,
  Pencil, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Filter
} from "lucide-react";

const starterEvents = [
  { id: 1, title: "Campus Music Festival", category: "Music", date: "2026-12-12", time: "5:00 PM", location: "University Open Grounds", city: "Vijayawada", description: "An evening of live performances, student bands and great campus energy.", organizer: "Cultural Club", capacity: 250, image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1000", attendees: [] },
  { id: 2, title: "Tech & Innovation Summit", category: "Technology", date: "2026-12-18", time: "10:00 AM", location: "Innovation Auditorium", city: "Guntur", description: "Explore emerging technology, student projects and ideas from young innovators.", organizer: "Tech Society", capacity: 180, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000", attendees: [] },
  { id: 3, title: "Creative Arts Workshop", category: "Art", date: "2026-12-22", time: "2:00 PM", location: "Arts Studio", city: "Vijayawada", description: "A hands-on workshop for illustration, design and creative expression.", organizer: "Arts Circle", capacity: 60, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000", attendees: [] },
  { id: 4, title: "Startup Pitch Day", category: "Business", date: "2027-01-08", time: "11:00 AM", location: "Main Seminar Hall", city: "Amaravati", description: "Present ideas, learn from peers and connect with aspiring founders.", organizer: "Entrepreneurship Cell", capacity: 120, image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1000", attendees: [] },
  { id: 5, title: "Community Clean-up Drive", category: "Community", date: "2027-01-14", time: "7:30 AM", location: "Riverfront Park", city: "Vijayawada", description: "Join fellow volunteers for a positive community initiative.", organizer: "Green Campus", capacity: 100, image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000", attendees: [] },
  { id: 6, title: "Photography Walk", category: "Art", date: "2027-01-20", time: "6:30 AM", location: "City Heritage Walk", city: "Guntur", description: "Practice composition and storytelling while exploring the city.", organizer: "Photo Club", capacity: 45, image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1000", attendees: [] }
];

const read = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const categories = ["All", "Technology", "Music", "Art", "Business", "Community", "Sports", "Education"];
const moneyDate = (value) => new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function App() {
  const [events, setEvents] = useState(() => read("es_events", starterEvents));
  const [users, setUsers] = useState(() => read("es_users", [
    { id: 1, name: "EventSphere Admin", email: "admin@eventsphere.com", password: "admin123", role: "admin" }
  ]));
  const [user, setUser] = useState(() => read("es_session", null));
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [eventForm, setEventForm] = useState({ title: "", category: "Technology", date: "", time: "", location: "", city: "", description: "", capacity: "100", image: "" });
  const [profileName, setProfileName] = useState("");

  useEffect(() => localStorage.setItem("es_events", JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem("es_users", JSON.stringify(users)), [users]);
  useEffect(() => {
    if (user) localStorage.setItem("es_session", JSON.stringify(user));
    else localStorage.removeItem("es_session");
  }, [user]);

  const flash = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); };
  const filteredEvents = useMemo(() => events.filter(e => {
    const matchesText = `${e.title} ${e.location} ${e.city} ${e.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (category === "All" || e.category === category);
  }), [events, search, category]);

  const go = (next) => { setPage(next); setMobileOpen(false); setSelectedEvent(null); setEditingEvent(null); };
  const openAuth = (mode = "login") => { setAuthMode(mode); setAuthOpen(true); setForm({ name: "", email: "", password: "", role: "user" }); };

  const submitAuth = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (authMode === "signup") {
      if (users.some(u => u.email === email)) return flash("An account with this email already exists.");
      const newUser = { id: Date.now(), name: form.name.trim(), email, password: form.password, role: "user" };
      setUsers(prev => [...prev, newUser]); setUser(newUser); setAuthOpen(false); go("dashboard"); flash("Account created successfully!");
    } else {
      const found = users.find(u => u.email === email && u.password === form.password);
      if (!found) return flash("Email or password is incorrect.");
      setUser(found); setAuthOpen(false); go(found.role === "admin" ? "admin" : "dashboard"); flash("Welcome back!");
    }
  };

  const logout = () => { setUser(null); go("home"); flash("You have logged out."); };
  const isJoined = (event) => !!user && (event.attendees || []).includes(user.id);
  const joinEvent = (event) => {
    if (!user) return openAuth("login");
    if (isJoined(event)) return flash("You are already registered for this event.");
    if ((event.attendees || []).length >= Number(event.capacity)) return flash("Sorry, this event is full.");
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, attendees: [...(e.attendees || []), user.id] } : e));
    setSelectedEvent({ ...event, attendees: [...(event.attendees || []), user.id] });
    flash("Your event registration is confirmed!");
  };
  const cancelRegistration = (event) => {
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, attendees: (e.attendees || []).filter(id => id !== user.id) } : e));
    flash("Registration cancelled.");
  };
  const saveEvent = (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const item = { ...eventForm, id: editingEvent?.id || Date.now(), capacity: Number(eventForm.capacity), attendees: editingEvent?.attendees || [], organizer: user.name, image: eventForm.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000" };
    if (editingEvent) setEvents(prev => prev.map(x => x.id === editingEvent.id ? item : x));
    else setEvents(prev => [item, ...prev]);
    setEventForm({ title: "", category: "Technology", date: "", time: "", location: "", city: "", description: "", capacity: "100", image: "" });
    setEditingEvent(null); go("my-events"); flash(editingEvent ? "Event updated." : "Event published successfully!");
  };
  const startEdit = (event) => {
    setEditingEvent(event);
    setEventForm({ title: event.title, category: event.category, date: event.date, time: event.time, location: event.location, city: event.city, description: event.description, capacity: String(event.capacity), image: event.image || "" });
    go("create");
  };
  const deleteEvent = (id) => {
    if (!window.confirm("Delete this event?")) return;
    setEvents(prev => prev.filter(e => e.id !== id)); flash("Event deleted.");
  };

  const myRegistrations = events.filter(e => user && (e.attendees || []).includes(user.id));
  const myCreated = events.filter(e => user && e.organizer === user.name);
  const stats = { total: events.length, registrations: events.reduce((n, e) => n + (e.attendees || []).length, 0), users: users.filter(u => u.role !== "admin").length };

  const navItems = [
    ["home", "Home", Compass], ["explore", "Explore Events", Search],
    ...(user ? [["dashboard", "Dashboard", LayoutDashboard], ["my-events", "My Events", Ticket]] : [])
  ];
  const navigate = (target) => go(target);

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}><span className="brand-mark"><CalendarDays size={21}/></span><span>Event<span className="brand-accent">Sphere</span></span></button>
      <nav className={`nav-links ${mobileOpen ? "nav-open" : ""}`}>
        {navItems.map(([id, label, Icon]) => <button key={id} className={page === id ? "nav-link active" : "nav-link"} onClick={() => navigate(id)}><Icon size={17}/>{label}</button>)}
        {user?.role === "admin" && <button className={page === "admin" ? "nav-link active" : "nav-link"} onClick={() => go("admin")}><ShieldCheck size={17}/>Admin</button>}
      </nav>
      <div className="top-actions">
        {user ? <><button className="avatar-button" onClick={() => go("profile")} title="Profile">{user.name?.charAt(0).toUpperCase()}</button><button className="btn btn-outline btn-small desktop-only" onClick={logout}><LogOut size={15}/> Logout</button></> :
          <><button className="btn btn-ghost btn-small desktop-only" onClick={() => openAuth("login")}>Log in</button><button className="btn btn-primary btn-small desktop-only" onClick={() => openAuth("signup")}>Get started <ArrowRight size={15}/></button></>}
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>

    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}

    <main>
      {page === "home" && <>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><Sparkles size={15}/> YOUR NEXT EXPERIENCE STARTS HERE</div>
            <h1>Find your people.<br/><span>Find your moment.</span></h1>
            <p>Discover exciting events, meet like-minded people and make memories that last. Your city is full of possibilities.</p>
            <div className="hero-buttons"><button className="btn btn-white" onClick={() => go("explore")}>Explore events <ArrowRight size={17}/></button><button className="btn btn-glass" onClick={() => user ? go("create") : openAuth("signup")}>Create an event <Plus size={17}/></button></div>
            <div className="hero-proof"><div className="avatar-stack"><i>J</i><i>A</i><i>M</i><i>+</i></div><span>Join a community that loves experiences</span></div>
          </div>
          <div className="hero-art"><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="floating-card card-top"><span className="float-icon">🎤</span><div><b>Live experiences</b><small>Discover something new</small></div></div><div className="hero-ticket"><div className="ticket-top"><span>EVENT PASS</span><span className="ticket-dot">✦</span></div><div className="ticket-emoji">🎟️</div><h3>Make it<br/>memorable.</h3><div className="ticket-line"></div><div className="ticket-bottom"><span>YOUR NEXT STORY</span><span>ES — 2026</span></div></div><div className="floating-card card-bottom"><span className="float-icon">📍</span><div><b>Happening near you</b><small>Events worth showing up for</small></div></div></div>
        </section>
        <section className="stats-strip"><div><strong>{stats.total}+</strong><span>Discoverable events</span></div><div><strong>{stats.registrations}+</strong><span>Registrations</span></div><div><strong>{stats.users}+</strong><span>Community members</span></div><div><strong>7</strong><span>Event categories</span></div></section>
        <section className="section">
          <div className="section-heading"><div><div className="eyebrow dark">CURATED FOR YOU</div><h2>Events worth <span className="gradient-text">showing up for.</span></h2><p>Explore experiences picked to spark your curiosity.</p></div><button className="text-link" onClick={() => go("explore")}>View all events <ArrowRight size={16}/></button></div>
          <div className="event-grid">{events.slice(0, 3).map(e => <EventCard key={e.id} event={e} onOpen={() => setSelectedEvent(e)} joined={isJoined(e)}/>)}</div>
        </section>
        <section className="cta-band"><div><div className="eyebrow">HAVE SOMETHING TO SHARE?</div><h2>Bring people together.<br/>Create your own event.</h2><p>From workshops to festivals, make space for something great.</p></div><button className="btn btn-white" onClick={() => user ? go("create") : openAuth("signup")}>Start creating <ArrowRight size={17}/></button></section>
      </>}

      {page === "explore" && <section className="page-section"><div className="page-title"><div className="eyebrow dark">DISCOVER YOUR NEXT EXPERIENCE</div><h1>Explore <span className="gradient-text">events.</span></h1><p>Find events, people and experiences that match your interests.</p></div>
        <div className="search-panel"><div className="search-box"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, places or keywords..."/></div><div className="filter-label"><Filter size={16}/> Filter by category</div><div className="chips">{categories.map(c => <button key={c} className={category === c ? "chip selected" : "chip"} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
        <div className="results-row"><b>{filteredEvents.length} events found</b><span>Sorted by upcoming</span></div>
        {filteredEvents.length ? <div className="event-grid">{filteredEvents.map(e => <EventCard key={e.id} event={e} onOpen={() => setSelectedEvent(e)} joined={isJoined(e)}/>)}</div> : <Empty title="No events found" text="Try another keyword or category."/>}
      </section>}

      {page === "dashboard" && user && <section className="page-section"><div className="welcome-panel"><div><div className="eyebrow dark">YOUR EVENT SPACE</div><h1>Welcome back, <span className="gradient-text">{user.name.split(" ")[0]}.</span></h1><p>Here’s what’s happening in your EventSphere community.</p></div><button className="btn btn-primary" onClick={() => go("explore")}>Discover events <ArrowRight size={16}/></button></div>
        <div className="metric-grid"><Metric icon={<Ticket/>} label="My registrations" value={myRegistrations.length}/><Metric icon={<CalendarDays/>} label="Events created" value={myCreated.length}/><Metric icon={<Users/>} label="Community events" value={events.length}/></div>
        <div className="section-heading compact"><div><h2>Your upcoming events</h2><p>Events you have registered for.</p></div><button className="text-link" onClick={() => go("my-events")}>View all <ArrowRight size={16}/></button></div>
        {myRegistrations.length ? <div className="event-grid">{myRegistrations.slice(0, 3).map(e => <EventCard key={e.id} event={e} onOpen={() => setSelectedEvent(e)} joined/>)}</div> : <Empty title="Your calendar is waiting" text="Explore events and register for something exciting." action={() => go("explore")} actionText="Explore events"/>}
      </section>}

      {page === "my-events" && user && <section className="page-section"><div className="page-title"><div className="eyebrow dark">YOUR ACTIVITY</div><h1>My <span className="gradient-text">events.</span></h1><p>Keep track of the events you joined and created.</p></div>
        <div className="section-heading compact"><div><h2>Registered events ({myRegistrations.length})</h2></div><button className="btn btn-primary btn-small" onClick={() => go("explore")}>Find events <Search size={15}/></button></div>
        {myRegistrations.length ? <div className="event-grid">{myRegistrations.map(e => <EventCard key={e.id} event={e} onOpen={() => setSelectedEvent(e)} joined/>)}</div> : <Empty title="No registrations yet" text="When you join an event, it will appear here." action={() => go("explore")} actionText="Explore events"/>}
        <div className="section-heading compact top-gap"><div><h2>Events I created ({myCreated.length})</h2></div><button className="btn btn-outline btn-small" onClick={() => go("create")}><Plus size={15}/> Create event</button></div>
        {myCreated.length ? <div className="manage-list">{myCreated.map(e => <ManageRow key={e.id} event={e} onEdit={() => startEdit(e)} onDelete={() => deleteEvent(e.id)}/>)}</div> : <p className="muted">You haven't created any events yet.</p>}
      </section>}

      {page === "create" && user && <section className="page-section narrow"><div className="page-title"><div className="eyebrow dark">{editingEvent ? "UPDATE YOUR LISTING" : "MAKE IT HAPPEN"}</div><h1>{editingEvent ? "Edit your" : "Create an"} <span className="gradient-text">event.</span></h1><p>Share your idea and invite people to be part of it.</p></div>
        <form className="form-card" onSubmit={saveEvent}><div className="form-grid">
          <Field label="Event title" wide><input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title:e.target.value})} placeholder="e.g. Design Thinking Workshop"/></Field>
          <Field label="Category"><select value={eventForm.category} onChange={e => setEventForm({...eventForm, category:e.target.value})}>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Maximum attendees"><input required type="number" min="1" value={eventForm.capacity} onChange={e => setEventForm({...eventForm, capacity:e.target.value})}/></Field>
          <Field label="Date"><input required type="date" min={new Date().toISOString().slice(0,10)} value={eventForm.date} onChange={e => setEventForm({...eventForm, date:e.target.value})}/></Field>
          <Field label="Time"><input required type="time" value={eventForm.time} onChange={e => setEventForm({...eventForm, time:e.target.value})}/></Field>
          <Field label="Venue"><input required value={eventForm.location} onChange={e => setEventForm({...eventForm, location:e.target.value})} placeholder="Event venue"/></Field>
          <Field label="City"><input required value={eventForm.city} onChange={e => setEventForm({...eventForm, city:e.target.value})} placeholder="City"/></Field>
          <Field label="Image URL (optional)" wide><input value={eventForm.image} onChange={e => setEventForm({...eventForm, image:e.target.value})} placeholder="https://..."/></Field>
          <Field label="Description" wide><textarea required rows="4" value={eventForm.description} onChange={e => setEventForm({...eventForm, description:e.target.value})} placeholder="Tell people what makes your event special..."/></Field>
        </div><div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => go("my-events")}>Cancel</button><button className="btn btn-primary">{editingEvent ? "Save changes" : "Publish event"} <ArrowRight size={16}/></button></div></form>
      </section>}

      {page === "profile" && user && <section className="page-section narrow"><div className="page-title"><div className="eyebrow dark">YOUR ACCOUNT</div><h1>My <span className="gradient-text">profile.</span></h1><p>Manage your EventSphere account details.</p></div><div className="profile-card"><div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div><h2>{user.name}</h2><p>{user.email}</p><span className="role-pill">{user.role}</span><div className="profile-stats"><div><b>{myRegistrations.length}</b><span>Joined</span></div><div><b>{myCreated.length}</b><span>Created</span></div></div><button className="btn btn-outline" onClick={logout}><LogOut size={16}/> Log out</button></div></section>}

      {page === "admin" && user?.role === "admin" && <section className="page-section"><div className="page-title"><div className="eyebrow dark">CONTROL CENTER</div><h1>Admin <span className="gradient-text">dashboard.</span></h1><p>Overview and management for your EventSphere platform.</p></div><div className="metric-grid"><Metric icon={<CalendarDays/>} label="Total events" value={stats.total}/><Metric icon={<Users/>} label="Registered users" value={stats.users}/><Metric icon={<Ticket/>} label="Total registrations" value={stats.registrations}/></div><div className="section-heading compact"><div><h2>Manage all events</h2><p>Review and maintain published events.</p></div><button className="btn btn-primary btn-small" onClick={() => go("create")}><Plus size={15}/> Add event</button></div><div className="manage-list">{events.map(e => <ManageRow key={e.id} event={e} onEdit={() => startEdit(e)} onDelete={() => deleteEvent(e.id)}/>)}</div><div className="section-heading compact top-gap"><div><h2>Registered accounts</h2><p>Demo account information.</p></div></div><div className="users-table">{users.map(u => <div className="user-row" key={u.id}><div className="mini-avatar">{u.name.charAt(0)}</div><div><b>{u.name}</b><small>{u.email}</small></div><span className="role-pill">{u.role}</span></div>)}</div></section>}

      {selectedEvent && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelectedEvent(null); }}><div className="event-modal"><button className="modal-close" onClick={() => setSelectedEvent(null)}><X/></button><img src={selectedEvent.image} alt={selectedEvent.title} onError={e => e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000"}/><div className="event-modal-body"><span className="category-tag">{selectedEvent.category}</span><h2>{selectedEvent.title}</h2><p>{selectedEvent.description}</p><div className="detail-lines"><span><CalendarDays/>{moneyDate(selectedEvent.date)} · {selectedEvent.time}</span><span><MapPin/>{selectedEvent.location}, {selectedEvent.city}</span><span><Users/>{(selectedEvent.attendees || []).length} / {selectedEvent.capacity} attendees</span></div><div className="modal-footer"><span className="muted">Hosted by {selectedEvent.organizer}</span>{isJoined(selectedEvent) ? <button className="btn btn-outline" onClick={() => { cancelRegistration(selectedEvent); setSelectedEvent(null); }}>Cancel registration</button> : <button className="btn btn-primary" onClick={() => joinEvent(selectedEvent)}>Register now <ArrowRight size={16}/></button>}</div></div></div></div>}

      {authOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}><div className="auth-modal"><button className="modal-close" onClick={() => setAuthOpen(false)}><X/></button><div className="auth-logo"><CalendarDays/></div><div className="eyebrow dark">{authMode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}</div><h2>{authMode === "login" ? "Good to see you." : "Create your account."}</h2><p>{authMode === "login" ? "Log in to continue your EventSphere journey." : "Discover events and connect with your community."}</p><form onSubmit={submitAuth}>{authMode === "signup" && <Field label="Full name"><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Your name"/></Field>}<Field label="Email address"><input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com"/></Field><Field label="Password"><input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></Field><button className="btn btn-primary full-btn">{authMode === "login" ? "Log in" : "Create account"} <ArrowRight size={16}/></button></form><div className="auth-switch">{authMode === "login" ? "New to EventSphere?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Sign up" : "Log in"}</button></div><div className="demo-hint"><b>Admin demo:</b> admin@eventsphere.com / admin123</div></div></div>}
    </main>
    <footer className="footer"><button className="brand footer-brand" onClick={() => go("home")}><span className="brand-mark"><CalendarDays size={18}/></span><span>Event<span className="brand-accent">Sphere</span></span></button><span>Discover more. Experience more. © 2026 EventSphere.</span><button className="footer-link" onClick={() => go("explore")}>Explore events</button></footer>
  </div>;
}

function Field({label, children, wide}) { return <label className={`field ${wide ? "field-wide" : ""}`}><span>{label}</span>{children}</label>; }
function Metric({icon,label,value}) { return <div className="metric-card"><span className="metric-icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>; }
function Empty({title,text,action,actionText}) { return <div className="empty-state"><div className="empty-icon"><CalendarDays/></div><h3>{title}</h3><p>{text}</p>{action && <button className="btn btn-primary btn-small" onClick={action}>{actionText} <ArrowRight size={15}/></button>}</div>; }
function EventCard({event,onOpen,joined}) {
  return <article className="event-card"><button className="event-image-button" onClick={onOpen}><img src={event.image} alt={event.title} onError={e => e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000"}/><span className="category-tag image-tag">{event.category}</span></button><div className="event-card-body"><div className="event-date"><CalendarDays size={14}/>{moneyDate(event.date)} <span>·</span> {event.time}</div><button className="event-title-button" onClick={onOpen}><h3>{event.title}</h3></button><p className="event-location"><MapPin size={15}/>{event.location}, {event.city}</p><div className="event-card-bottom"><span><Users size={14}/>{(event.attendees || []).length} attending</span><button className={joined ? "joined-button" : "card-arrow"} onClick={onOpen}>{joined ? "Registered ✓" : "View details"} {!joined && <ArrowRight size={15}/>}</button></div></div></article>;
}
function ManageRow({event,onEdit,onDelete}) {
  return <div className="manage-row"><img src={event.image} alt=""/><div className="manage-info"><b>{event.title}</b><span>{moneyDate(event.date)} · {event.location}, {event.city}</span></div><span className="manage-count"><Users size={14}/>{(event.attendees || []).length}/{event.capacity}</span><div className="manage-actions"><button title="Edit" onClick={onEdit}><Pencil size={16}/></button><button title="Delete" onClick={onDelete}><Trash2 size={16}/></button></div></div>;
}