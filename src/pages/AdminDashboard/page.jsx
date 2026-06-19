
// Best But Basic Desgin
// import React, { useState } from 'react';
// import { Building2, MapPin, Users, Cpu, ChevronRight, X, Pencil } from 'lucide-react';

// /* ============================================================
//    MOCK DATA
//    Replace each block below with real API data once endpoints
//    exist. Suggested mapping (adjust to your actual routes):

//    MANAGERS    -> GET /admin/managers
//    SUB_USERS   -> GET /admin/managers/:id/sub-users
//    ORGS        -> GET /admin/organizations
//    VENUES      -> GET /admin/venues
//    DEVICES     -> GET /admin/devices

//    Shapes are kept flat on purpose (ownerId / orgId / venueId
//    foreign keys) so swapping to RTK Query selectors later is a
//    drop-in, not a rewrite.
//    ============================================================ */

// const MANAGERS = [
//   { id: 'm1', name: 'Ahmed Khan', email: 'ahmed.khan@example.com', plan: 'Pro', orgs: 5, venues: 18, devices: 92, users: 3, status: 'Active' },
//   { id: 'm2', name: 'Sara Ali', email: 'sara.ali@example.com', plan: 'Starter', orgs: 2, venues: 6, devices: 24, users: 1, status: 'Active' },
//   { id: 'm3', name: 'Bilal Hussain', email: 'bilal.hussain@example.com', plan: 'Enterprise', orgs: 9, venues: 34, devices: 210, users: 6, status: 'Suspended' },
// ];

// const SUB_USERS = {
//   m1: [
//     { id: 'u1', name: 'Hina Tariq', email: 'hina.tariq@example.com', role: 'Operator', orgs: 2, venues: 5, devices: 20, status: 'Active' },
//     { id: 'u2', name: 'Omar Farooq', email: 'omar.farooq@example.com', role: 'Viewer', orgs: 1, venues: 3, devices: 12, status: 'Active' },
//     { id: 'u3', name: 'Zara Sheikh', email: 'zara.sheikh@example.com', role: 'Operator', orgs: 2, venues: 10, devices: 60, status: 'Active' },
//   ],
//   m2: [
//     { id: 'u4', name: 'Fatima Noor', email: 'fatima.noor@example.com', role: 'Viewer', orgs: 2, venues: 6, devices: 24, status: 'Active' },
//   ],
//   m3: [
//     { id: 'u5', name: 'Imran Qureshi', email: 'imran.qureshi@example.com', role: 'Operator', orgs: 4, venues: 14, devices: 88, status: 'Active' },
//     { id: 'u6', name: 'Nadia Saeed', email: 'nadia.saeed@example.com', role: 'Viewer', orgs: 2, venues: 8, devices: 40, status: 'Suspended' },
//   ],
// };

// const ORGS = [
//   { id: 'o1', name: 'Khan Textiles', owner: 'Ahmed Khan', ownerId: 'm1', venues: 5, devices: 30 },
//   { id: 'o2', name: 'Khan Logistics Hub', owner: 'Ahmed Khan', ownerId: 'm1', venues: 3, devices: 18 },
//   { id: 'o3', name: 'Ali Foods Pvt', owner: 'Sara Ali', ownerId: 'm2', venues: 6, devices: 24 },
//   { id: 'o4', name: 'Hussain Group HQ', owner: 'Bilal Hussain', ownerId: 'm3', venues: 10, devices: 80 },
//   { id: 'o5', name: 'Hussain Retail', owner: 'Bilal Hussain', ownerId: 'm3', venues: 8, devices: 55 },
// ];

// const VENUES = [
//   { id: 'v1', name: 'Karachi Warehouse A', org: 'Khan Textiles', ownerId: 'm1', devices: 14 },
//   { id: 'v2', name: 'Lahore Plant 2', org: 'Khan Logistics Hub', ownerId: 'm1', devices: 9 },
//   { id: 'v3', name: 'Clifton Cold Storage', org: 'Ali Foods Pvt', ownerId: 'm2', devices: 11 },
//   { id: 'v4', name: 'DHA Mall Tower', org: 'Hussain Group HQ', ownerId: 'm3', devices: 22 },
//   { id: 'v5', name: 'Gulshan Retail Outlet', org: 'Hussain Retail', ownerId: 'm3', devices: 13 },
// ];

// const DEVICES = [
//   { id: 'd1', name: 'AQI-204', type: 'AQI', category: 'Monitoring', venue: 'Karachi Warehouse A', ownerId: 'm1', status: 'Online' },
//   { id: 'd2', name: 'GAS-LK-11', type: 'Gas leakage', category: 'Trigger', venue: 'Lahore Plant 2', ownerId: 'm1', status: 'Online' },
//   { id: 'd3', name: 'TEMP-HUM-77', type: 'Temp & humidity', category: 'Monitoring', venue: 'Clifton Cold Storage', ownerId: 'm2', status: 'Offline' },
//   { id: 'd4', name: 'ENR-09', type: 'Energy', category: 'Scheduling', venue: 'DHA Mall Tower', ownerId: 'm3', status: 'Online' },
//   { id: 'd5', name: 'ODR-03', type: 'Odour', category: 'Trigger', venue: 'Gulshan Retail Outlet', ownerId: 'm3', status: 'Online' },
// ];

// /* ============================================================
//    SMALL UI PRIMITIVES
//    ============================================================ */

// const TONE_CLASSES = {
//   green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
//   red:    'bg-rose-50    text-rose-700    ring-1 ring-rose-200',
//   amber:  'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
//   blue:   'bg-indigo-50  text-indigo-700  ring-1 ring-indigo-200',
//   slate:  'bg-slate-100  text-slate-600',
// };

// function Badge({ children, tone = 'slate' }) {
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}>
//       {children}
//     </span>
//   );
// }

// function statusTone(status) {
//   if (status === 'Active' || status === 'Online')    return 'green';
//   if (status === 'Suspended' || status === 'Offline') return 'red';
//   return 'slate';
// }

// function planTone(plan) {
//   if (plan === 'Enterprise') return 'blue';
//   if (plan === 'Pro')        return 'amber';
//   return 'slate';
// }

// function initials(name) {
//   return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
// }

// /* ── Metric summary card ── */
// function MetricCard({ icon: Icon, label, value, active, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`text-left rounded-xl border p-4 transition-all ${
//         active
//           ? 'border-indigo-300 bg-indigo-50 shadow-sm'
//           : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
//       }`}
//     >
//       <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${active ? 'text-indigo-500' : 'text-slate-400'}`}>
//         <Icon size={14} />
//         <span className="truncate">{label}</span>
//       </div>
//       <div className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">{value}</div>
//     </button>
//   );
// }

// /* ── Breadcrumb trail ── */
// function Breadcrumbs({ items }) {
//   return (
//     <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-1">
//       {items.map((item, i) => (
//         <span key={i} className="flex items-center gap-1.5">
//           {i > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
//           {item.onClick ? (
//             <button onClick={item.onClick} className="hover:text-indigo-600 transition-colors">
//               {item.label}
//             </button>
//           ) : (
//             <span className="text-slate-900 font-medium">{item.label}</span>
//           )}
//         </span>
//       ))}
//     </div>
//   );
// }

// /* ── Generic data table ──
//    Pass `columns` (array of {key, header, render?}) + `rows`.
//    Optional `onRowClick` turns rows into drill-down links.
//    Swap `rows` for API data at the call site; this component
//    never needs to change. */
// function DataTable({ columns, rows, onRowClick }) {
//   return (
//     <div className="overflow-x-auto rounded-lg border border-slate-200">
//       <table className="w-full text-sm min-w-[580px]">
//         <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
//           <tr>
//             {columns.map((c) => (
//               <th key={c.key} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
//                 {c.header}
//               </th>
//             ))}
//             {onRowClick && <th className="px-4 py-2.5 w-8" />}
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-100">
//           {rows.map((row) => (
//             <tr
//               key={row.id}
//               onClick={() => onRowClick && onRowClick(row)}
//               className={onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}
//             >
//               {columns.map((c) => (
//                 <td key={c.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
//                   {c.render ? c.render(row) : row[c.key]}
//                 </td>
//               ))}
//               {onRowClick && (
//                 <td className="px-4 py-3 text-slate-300">
//                   <ChevronRight size={16} />
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {rows.length === 0 && (
//         <div className="px-4 py-10 text-center text-sm text-slate-400">No records found</div>
//       )}
//     </div>
//   );
// }

// /* ── Slide-over edit drawer ──
//    Generic: pass title + fields array, wire Save to your mutation.
//    Currently closes on Save — replace onClose with a real submit handler. */
// function EditDrawer({ title, fields, onClose }) {
//   return (
//     <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
//       <div
//         className="h-full w-full max-w-md bg-white shadow-2xl p-5 sm:p-6 overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
//             aria-label="Close"
//           >
//             <X size={18} />
//           </button>
//         </div>
//         <div className="space-y-4">
//           {fields.map((f, i) => (
//             <div key={i}>
//               <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
//               {f.type === 'select' ? (
//                 <select
//                   defaultValue={f.value}
//                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
//                 >
//                   {f.options.map((o) => (
//                     <option key={o}>{o}</option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   defaultValue={f.value}
//                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//         <div className="mt-8 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onClose}
//             className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
//           >
//             Save changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Profile header ── reused in manager + user detail views */
// function ProfileHeader({ name, email, badges, onEdit }) {
//   return (
//     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
//       <div className="flex items-center gap-3 flex-wrap">
//         <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold shrink-0">
//           {initials(name)}
//         </div>
//         <div>
//           <div className="font-medium text-slate-900">{name}</div>
//           <div className="text-xs text-slate-400 mt-0.5">{email}</div>
//         </div>
//         <div className="flex items-center gap-1.5 flex-wrap">
//           {badges.map((b, i) => (
//             <Badge key={i} tone={b.tone}>{b.label}</Badge>
//           ))}
//         </div>
//       </div>
//       {onEdit && (
//         <button
//           onClick={onEdit}
//           className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
//         >
//           <Pencil size={13} /> Edit
//         </button>
//       )}
//     </div>
//   );
// }

// /* ── Tab bar ── */
// function TabBar({ tabs, active, onChange }) {
//   return (
//     <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
//       {tabs.map(([key, label]) => (
//         <button
//           key={key}
//           onClick={() => onChange(key)}
//           className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
//             active === key
//               ? 'bg-indigo-600 text-white shadow-sm'
//               : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//           }`}
//         >
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// }

// /* ── Stat mini-cards ── shown on user detail */
// function StatRow({ stats }) {
//   return (
//     <div className="grid grid-cols-3 gap-3 mb-5">
//       {stats.map((s) => (
//         <div key={s.label} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
//           <div className="text-xs text-slate-400 font-medium">{s.label}</div>
//           <div className="text-xl font-semibold text-slate-900 mt-1">{s.value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ============================================================
//    COLUMN DEFINITIONS — centralised so changing a column header
//    or adding a field later is a one-line edit.
//    ============================================================ */

// const COL = {
//   managerName: {
//     key: 'name', header: 'Manager',
//     render: (r) => (
//       <div>
//         <div className="font-medium text-slate-900">{r.name}</div>
//         <div className="text-xs text-slate-400 mt-0.5">{r.email}</div>
//       </div>
//     ),
//   },
//   plan:    { key: 'plan',    header: 'Plan',    render: (r) => <Badge tone={planTone(r.plan)}>{r.plan}</Badge> },
//   orgs:    { key: 'orgs',    header: 'Orgs' },
//   venues:  { key: 'venues',  header: 'Venues' },
//   devices: { key: 'devices', header: 'Devices' },
//   users:   { key: 'users',   header: 'Users' },
//   status:  { key: 'status',  header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },

//   userName: {
//     key: 'name', header: 'User',
//     render: (r) => (
//       <div>
//         <div className="font-medium text-slate-900">{r.name}</div>
//         <div className="text-xs text-slate-400 mt-0.5">{r.email}</div>
//       </div>
//     ),
//   },
//   role:    { key: 'role',   header: 'Role' },

//   orgName: { key: 'name',  header: 'Organization' },
//   owner:   { key: 'owner', header: 'Owner' },

//   venueName: { key: 'name', header: 'Venue' },
//   org:       { key: 'org',  header: 'Organization' },

//   deviceName:     { key: 'name',     header: 'Device' },
//   deviceType:     { key: 'type',     header: 'Type' },
//   deviceCategory: { key: 'category', header: 'Category' },
//   venue:          { key: 'venue',    header: 'Venue' },
// };

// const DEVICE_COLS = [COL.deviceName, COL.deviceType, COL.deviceCategory, COL.venue, COL.status];

// const MANAGER_TABS = [
//   ['subusers', 'Sub-users'],
//   ['orgs',     'Organizations'],
//   ['venues',   'Venues'],
//   ['devices',  'Devices'],
// ];

// /* ============================================================
//    MAIN DASHBOARD
//    view values: 'managers' | 'orgs' | 'venues' | 'devices'
//                 | 'managerDetail' | 'userDetail'
//    ============================================================ */

// export default function AdminDashboard() {
//   const [view,       setView]       = useState('managers');
//   const [managerId,  setManagerId]  = useState(null);
//   const [userId,     setUserId]     = useState(null);
//   const [tab,        setTab]        = useState('subusers');
//   const [editTarget, setEditTarget] = useState(null);

//   /* ── Derived data ── */
//   const currentManager = MANAGERS.find((m) => m.id === managerId) ?? null;
//   const currentUser    = managerId && userId
//     ? (SUB_USERS[managerId] ?? []).find((u) => u.id === userId) ?? null
//     : null;

//   const totalSubUsers = Object.values(SUB_USERS).reduce((a, arr) => a + arr.length, 0);

//   /* ── Navigation helpers ── */
//   function selectCard(v) {
//     setView(v);
//     setManagerId(null);
//     setUserId(null);
//     setTab('subusers');
//   }

//   function openManager(id) {
//     setView('managerDetail');
//     setManagerId(id);
//     setTab('subusers');
//     setUserId(null);
//   }

//   function openUser(id) {
//     setView('userDetail');
//     setUserId(id);
//   }

//   function backToManagerDetail() {
//     setView('managerDetail');
//     setUserId(null);
//   }

//   /* ── Per-manager data slices ── */
//   const managerOrgs    = (id) => ORGS.filter((o) => o.ownerId === id);
//   const managerVenues  = (id) => VENUES.filter((v) => v.ownerId === id);
//   const managerDevices = (id) => DEVICES.filter((d) => d.ownerId === id);

//   /* ── Edit drawer configs ── */
//   function openManagerEdit(m) {
//     setEditTarget({
//       title: 'Edit manager',
//       fields: [
//         { label: 'Name',   value: m.name },
//         { label: 'Email',  value: m.email },
//         { label: 'Plan',   value: m.plan,   type: 'select', options: ['Starter', 'Pro', 'Enterprise'] },
//         { label: 'Status', value: m.status, type: 'select', options: ['Active', 'Suspended'] },
//       ],
//     });
//   }

//   function openUserEdit(u) {
//     setEditTarget({
//       title: 'Edit user',
//       fields: [
//         { label: 'Name',   value: u.name },
//         { label: 'Email',  value: u.email },
//         { label: 'Role',   value: u.role,   type: 'select', options: ['Viewer', 'Operator'] },
//         { label: 'Status', value: u.status, type: 'select', options: ['Active', 'Suspended'] },
//       ],
//     });
//   }

//   /* ── Breadcrumb builder ── */
//   function getBreadcrumbs() {
//     const root = { label: 'Dashboard', onClick: () => selectCard('managers') };

//     if (view === 'managers')
//       return [root, { label: 'Managers' }];
//     if (view === 'orgs')
//       return [root, { label: 'Organizations' }];
//     if (view === 'venues')
//       return [root, { label: 'Venues' }];
//     if (view === 'devices')
//       return [root, { label: 'Devices' }];
//     if (view === 'managerDetail')
//       return [root, { label: 'Managers', onClick: () => selectCard('managers') }, { label: currentManager?.name }];
//     if (view === 'userDetail')
//       return [
//         root,
//         { label: 'Managers',          onClick: () => selectCard('managers') },
//         { label: currentManager?.name, onClick: backToManagerDetail },
//         { label: currentUser?.name },
//       ];
//     return [root];
//   }

//   /* ── Active card logic ── */
//   const inManagerFlow = ['managers', 'managerDetail', 'userDetail'].includes(view);

//   /* ============================================================
//      RENDER
//      ============================================================ */
//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto">

//         {/* ── Header ── */}
//         <header className="mb-6">
//           <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">IOTIFY admin</h1>
//           <p className="text-sm text-slate-500 mt-1">
//             Manage organizations, venues, devices, managers and users across the platform.
//           </p>
//         </header>

//         {/* ── Summary metric cards ── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
//           <MetricCard
//             icon={Building2} label="Organizations"
//             value={ORGS.length}
//             active={view === 'orgs'}
//             onClick={() => selectCard('orgs')}
//           />
//           <MetricCard
//             icon={MapPin} label="Venues"
//             value={VENUES.length}
//             active={view === 'venues'}
//             onClick={() => selectCard('venues')}
//           />
//           <MetricCard
//             icon={Users} label="Managers & users"
//             value={`${MANAGERS.length} · ${totalSubUsers}`}
//             active={inManagerFlow}
//             onClick={() => selectCard('managers')}
//           />
//           <MetricCard
//             icon={Cpu} label="Devices"
//             value={DEVICES.length}
//             active={view === 'devices'}
//             onClick={() => selectCard('devices')}
//           />
//         </div>

//         {/* ── Breadcrumbs ── */}
//         <Breadcrumbs items={getBreadcrumbs()} />

//         {/* ── Main content panel ── */}
//         <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">

//           {/* ─── Top-level: Managers list ─── */}
//           {view === 'managers' && (
//             <DataTable
//               onRowClick={(m) => openManager(m.id)}
//               columns={[
//                 COL.managerName,
//                 COL.plan,
//                 COL.orgs,
//                 COL.venues,
//                 COL.devices,
//                 COL.users,
//                 COL.status,
//               ]}
//               rows={MANAGERS}
//             />
//           )}

//           {/* ─── Top-level: Orgs ─── */}
//           {view === 'orgs' && (
//             <DataTable
//               columns={[COL.orgName, COL.owner, COL.venues, COL.devices]}
//               rows={ORGS}
//             />
//           )}

//           {/* ─── Top-level: Venues ─── */}
//           {view === 'venues' && (
//             <DataTable
//               columns={[COL.venueName, COL.org, COL.devices]}
//               rows={VENUES}
//             />
//           )}

//           {/* ─── Top-level: Devices ─── */}
//           {view === 'devices' && (
//             <DataTable
//               columns={DEVICE_COLS}
//               rows={DEVICES}
//             />
//           )}

//           {/* ─── Manager detail ─── */}
//           {view === 'managerDetail' && currentManager && (
//             <div>
//               <ProfileHeader
//                 name={currentManager.name}
//                 email={currentManager.email}
//                 badges={[
//                   { label: currentManager.plan,   tone: planTone(currentManager.plan) },
//                   { label: currentManager.status, tone: statusTone(currentManager.status) },
//                 ]}
//                 onEdit={() => openManagerEdit(currentManager)}
//               />

//               <TabBar tabs={MANAGER_TABS} active={tab} onChange={setTab} />

//               {tab === 'subusers' && (
//                 <DataTable
//                   onRowClick={(u) => openUser(u.id)}
//                   columns={[COL.userName, COL.role, COL.orgs, COL.venues, COL.devices, COL.status]}
//                   rows={SUB_USERS[currentManager.id] ?? []}
//                 />
//               )}

//               {tab === 'orgs' && (
//                 <DataTable
//                   columns={[COL.orgName, COL.venues, COL.devices]}
//                   rows={managerOrgs(currentManager.id)}
//                 />
//               )}

//               {tab === 'venues' && (
//                 <DataTable
//                   columns={[COL.venueName, COL.org, COL.devices]}
//                   rows={managerVenues(currentManager.id)}
//                 />
//               )}

//               {tab === 'devices' && (
//                 <DataTable
//                   columns={DEVICE_COLS}
//                   rows={managerDevices(currentManager.id)}
//                 />
//               )}
//             </div>
//           )}

//           {/* ─── Sub-user detail ─── */}
//           {view === 'userDetail' && currentUser && (
//             <div>
//               <ProfileHeader
//                 name={currentUser.name}
//                 email={currentUser.email}
//                 badges={[
//                   { label: currentUser.role,   tone: 'slate' },
//                   { label: currentUser.status, tone: statusTone(currentUser.status) },
//                 ]}
//                 onEdit={() => openUserEdit(currentUser)}
//               />

//               <StatRow stats={[
//                 { label: 'Organizations', value: currentUser.orgs },
//                 { label: 'Venues',        value: currentUser.venues },
//                 { label: 'Devices',       value: currentUser.devices },
//               ]} />

//               {/* Mock: real API would scope devices to this sub-user's
//                   assignments, not just their parent manager's pool.
//                   Replace with GET /admin/managers/:id/users/:uid/devices */}
//               <DataTable
//                 columns={DEVICE_COLS}
//                 rows={managerDevices(managerId).slice(0, 2)}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Edit slide-over ── */}
//       {editTarget && (
//         <EditDrawer
//           title={editTarget.title}
//           fields={editTarget.fields}
//           onClose={() => setEditTarget(null)}
//         />
//       )}
//     </div>
//   );
// }

// BEST BUT NAVBAR ADDED :(


import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building2, MapPin, Users, Cpu, ChevronRight, X, Pencil,
  LayoutDashboard, ShieldCheck, LogOut, Bell, Search,
  TrendingUp, Wifi, WifiOff, Activity, MoreHorizontal,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { useIsMobile } from '../../hooks/responsiveQuery';
import './adminstyle.css';


/* ============================================================
   MOCK DATA — swap each block for real RTK Query results
   ============================================================ */

const MANAGERS = [
  { id: 'm1', name: 'Ahmed Khan', email: 'ahmed.khan@example.com', plan: 'Pro', planLimits: { orgs: 10, venues: 25, devices: 150, users: 5 }, orgs: 5, venues: 18, devices: 92, users: 3, status: 'Active' },
  { id: 'm2', name: 'Sara Ali', email: 'sara.ali@example.com', plan: 'Starter', planLimits: { orgs: 3, venues: 10, devices: 30, users: 2 }, orgs: 2, venues: 6, devices: 24, users: 1, status: 'Active' },
  { id: 'm3', name: 'Bilal Hussain', email: 'bilal.hussain@example.com', plan: 'Enterprise', planLimits: { orgs: 20, venues: 50, devices: 300, users: 10 }, orgs: 9, venues: 34, devices: 210, users: 6, status: 'Inactive' },
];

const SUB_USERS = {
  m1: [
    { id: 'u1', name: 'Hina Tariq', email: 'hina.tariq@example.com', role: 'Operator', orgs: 2, venues: 5, devices: 20, status: 'Active' },
    { id: 'u2', name: 'Omar Farooq', email: 'omar.farooq@example.com', role: 'Viewer', orgs: 1, venues: 3, devices: 12, status: 'Active' },
    { id: 'u3', name: 'Zara Sheikh', email: 'zara.sheikh@example.com', role: 'Operator', orgs: 2, venues: 10, devices: 60, status: 'Active' },
  ],
  m2: [
    { id: 'u4', name: 'Fatima Noor', email: 'fatima.noor@example.com', role: 'Viewer', orgs: 2, venues: 6, devices: 24, status: 'Active' },
  ],
  m3: [
    { id: 'u5', name: 'Imran Qureshi', email: 'imran.qureshi@example.com', role: 'Operator', orgs: 4, venues: 14, devices: 88, status: 'Active' },
    { id: 'u6', name: 'Nadia Saeed', email: 'nadia.saeed@example.com', role: 'Viewer', orgs: 2, venues: 8, devices: 40, status: 'Inactive' },
  ],
};

const ORGS = [
  { id: 'o1', name: 'Khan Textiles', owner: 'Ahmed Khan', ownerId: 'm1', venues: 5, devices: 30 },
  { id: 'o2', name: 'Khan Logistics', owner: 'Ahmed Khan', ownerId: 'm1', venues: 3, devices: 18 },
  { id: 'o3', name: 'Ali Foods Pvt', owner: 'Sara Ali', ownerId: 'm2', venues: 6, devices: 24 },
  { id: 'o4', name: 'Hussain Group HQ', owner: 'Bilal Hussain', ownerId: 'm3', venues: 10, devices: 80 },
  { id: 'o5', name: 'Hussain Retail', owner: 'Bilal Hussain', ownerId: 'm3', venues: 8, devices: 55 },
];

const VENUES = [
  { id: 'v1', name: 'Karachi Warehouse A', org: 'Khan Textiles', ownerId: 'm1', devices: 14 },
  { id: 'v2', name: 'Lahore Plant 2', org: 'Khan Logistics', ownerId: 'm1', devices: 9 },
  { id: 'v3', name: 'Clifton Cold Storage', org: 'Ali Foods Pvt', ownerId: 'm2', devices: 11 },
  { id: 'v4', name: 'DHA Mall Tower', org: 'Hussain Group HQ', ownerId: 'm3', devices: 22 },
  { id: 'v5', name: 'Gulshan Retail', org: 'Hussain Retail', ownerId: 'm3', devices: 13 },
];

const DEVICES = [
  { id: 'd1', name: 'AQI-204', type: 'AQI', category: 'Monitoring', venue: 'Karachi Warehouse A', ownerId: 'm1', status: 'Online' },
  { id: 'd2', name: 'GAS-LK-11', type: 'Gas leakage', category: 'Trigger', venue: 'Lahore Plant 2', ownerId: 'm1', status: 'Online' },
  { id: 'd3', name: 'TEMP-HUM-77', type: 'Temp & humidity', category: 'Monitoring', venue: 'Clifton Cold Storage', ownerId: 'm2', status: 'Offline' },
  { id: 'd4', name: 'ENR-09', type: 'Energy', category: 'Scheduling', venue: 'DHA Mall Tower', ownerId: 'm3', status: 'Online' },
  { id: 'd5', name: 'ODR-03', type: 'Odour', category: 'Trigger', venue: 'Gulshan Retail', ownerId: 'm3', status: 'Online' },
];

/* ============================================================
   DESIGN TOKENS (inline style helpers)
   All colours resolve to indigo-600 accent + neutral greys.
   ============================================================ */

const C = {
  accent: '#4f46e5',
  accentMid: '#6366f1',
  accentSoft: '#eef2ff',
  accentBorder: '#c7d2fe',

  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHov: '#f8fafc',

  border: '#e2e8f0',
  borderMid: '#cbd5e1',

  text: '#0f172a',
  textMid: '#475569',
  textSoft: '#94a3b8',

  green: '#10b981',
  greenSoft: '#ecfdf5',
  greenBorder: '#a7f3d0',

  red: '#ef4444',
  redSoft: '#fef2f2',
  redBorder: '#fecaca',

  amber: '#f59e0b',
  amberSoft: '#fffbeb',
  amberBorder: '#fde68a',

  blue: '#3b82f6',
  blueSoft: '#eff6ff',
  blueBorder: '#bfdbfe',

  purple: '#8b5cf6',
  purpleSoft: '#f5f3ff',
};

/* ============================================================
   UTILITIES
   ============================================================ */

function initials(name = '') {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function pct(used, limit) {
  return Math.min(100, Math.round((used / limit) * 100));
}

function planColors(plan) {
  if (plan === 'Enterprise') return { bg: C.purpleSoft, color: '#6d28d9', border: '#ddd6fe' };
  if (plan === 'Pro') return { bg: C.amberSoft, color: '#b45309', border: C.amberBorder };
  return { bg: C.bg, color: C.textMid, border: C.border };
}

function statusColors(status) {
  if (status === 'Active' || status === 'Online') return { bg: C.greenSoft, color: '#047857', border: C.greenBorder, dot: C.green };
  if (status === 'Inactive' || status === 'Offline') return { bg: C.redSoft, color: '#b91c1c', border: C.redBorder, dot: C.red };
  return { bg: C.bg, color: C.textMid, border: C.border, dot: C.textSoft };
}

function categoryColors(cat) {
  if (cat === 'Monitoring') return { bg: C.blueSoft, color: '#1d4ed8', border: C.blueBorder };
  if (cat === 'Trigger') return { bg: C.redSoft, color: '#b91c1c', border: C.redBorder };
  if (cat === 'Scheduling') return { bg: C.greenSoft, color: '#047857', border: C.greenBorder };
  return { bg: C.bg, color: C.textMid, border: C.border };
}

/* ============================================================
   SHARED UI ATOMS
   ============================================================ */

function Badge({ label, colors }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      background: colors.bg, color: colors.color,
      border: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap',
    }}>
      {colors.dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: colors.dot, flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}

function Avatar({ name, size = 36, color = C.accent }) {
  const bg = color + '18';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, border: `1.5px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, flexShrink: 0, letterSpacing: '-0.02em',
    }}>
      {initials(name)}
    </div>
  );
}

/* Mini usage bar — shows used vs plan limit */
function UsageBar({ used, limit, color = C.accent }) {
  const p = pct(used, limit);
  const barColor = p >= 90 ? C.red : p >= 70 ? C.amber : color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 4,
        background: C.border, overflow: 'hidden',
      }}>
        <div style={{
          width: `${p}%`, height: '100%',
          background: barColor, borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: 10, color: C.textSoft, minWidth: 24, textAlign: 'right' }}>
        {p}%
      </span>
    </div>
  );
}

/* ============================================================
   SIDEBAR NAV - REMOVED (Now using external AdminSidebar)
   ============================================================ */

/* ============================================================
   TOP BAR
   ============================================================ */

function TopBar({ breadcrumbs, onBell }) {
  
const isMobile = useIsMobile();

  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px',
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      gap: 16,
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Breadcrumbs */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={13} color={C.textSoft} />}
            {b.onClick ? (
              <button
                onClick={b.onClick}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, color: C.textMid, padding: 0,
                  fontWeight: 400,
                }}
                onMouseEnter={e => e.currentTarget.style.color = C.accent}
                onMouseLeave={e => e.currentTarget.style.color = C.textMid}
              >{b.label}</button>
            ) : (
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{b.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>


      {/* Bell */}

      {
        !isMobile && <button style={{
          position: 'relative', border: 'none', background: 'none',
          cursor: 'pointer', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8,
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.bg}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Bell size={17} color={C.textMid} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: C.red, border: `2px solid ${C.surface}`,
          }} />
        </button>
      }



    </div>
  );
}

/* ============================================================
   STAT SUMMARY CARDS (top of main)
   ============================================================ */

function SummaryStrip({ items }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12, marginBottom: 24,
    }}>
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500 }}>{label}</div>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={14} color={color} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.03em' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   SECTION TITLE
   ============================================================ */

function SectionTitle({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>{title}</h2>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textSoft }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   DATA TABLE — generic, responsive
   ============================================================ */

function DataTable({ columns, rows, onRowClick }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              {columns.map(c => (
                <th key={c.key} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, color: C.textSoft,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {c.header}
                </th>
              ))}
              {onRowClick && <th style={{ width: 40 }} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: ri < rows.length - 1 ? `1px solid ${C.border}` : 'none',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {columns.map(c => (
                  <td key={c.key} style={{
                    padding: '12px 16px', fontSize: 13,
                    color: C.textMid, whiteSpace: 'nowrap',
                  }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <ChevronRight size={14} color={C.textSoft} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: C.textSoft, fontSize: 13 }}>
          No records found
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MANAGER ROW — richer card-style row with usage bars
   ============================================================ */

function ManagersTable({ managers, onRowClick }) {
  const planC = (plan) => planColors(plan);
  const statC = (s) => statusColors(s);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
         minWidth: 900,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 90px 1fr 1fr 1fr 1fr 90px',
          padding: '9px 20px',
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          gap: 12,
        }}>
          {['Manager', 'Plan', 'Orgs', 'Venues', 'Devices', 'Users', 'Status'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, color: C.textSoft, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {h}
            </div>
          ))}
        </div>

        {managers.map((m, ri) => {
          const sc = statC(m.status);
          const pc = planC(m.plan);
          return (
            <div
              key={m.id}
              onClick={() => onRowClick(m)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 90px 1fr 1fr 1fr 1fr 90px',
                padding: '14px 20px',
                borderBottom: ri < managers.length - 1 ? `1px solid ${C.border}` : 'none',
                cursor: 'pointer', gap: 12,
                alignItems: 'center', transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={m.name} size={34} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>{m.email}</div>
                </div>
              </div>
              {/* plan */}
              <div><Badge label={m.plan} colors={pc} /></div>
              {/* orgs */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{m.orgs}<span style={{ fontSize: 10, color: C.textSoft }}>/{m.planLimits.orgs}</span></div>
                <UsageBar used={m.orgs} limit={m.planLimits.orgs} />
              </div>
              {/* venues */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{m.venues}<span style={{ fontSize: 10, color: C.textSoft }}>/{m.planLimits.venues}</span></div>
                <UsageBar used={m.venues} limit={m.planLimits.venues} />
              </div>
              {/* devices */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{m.devices}<span style={{ fontSize: 10, color: C.textSoft }}>/{m.planLimits.devices}</span></div>
                <UsageBar used={m.devices} limit={m.planLimits.devices} />
              </div>
              {/* users */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{m.users}<span style={{ fontSize: 10, color: C.textSoft }}>/{m.planLimits.users}</span></div>
                <UsageBar used={m.users} limit={m.planLimits.users} />
              </div>
              {/* status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Badge label={m.status} colors={sc} />
                <ChevronRight size={14} color={C.textSoft} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   EDIT DRAWER
   ============================================================ */

function EditDrawer({ title, fields, onClose }) {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        paddingTop: isMobile ? 50 : 0,
        background: 'rgba(15,23,42,0.4)',
        display: 'flex', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 420,
          background: C.surface,
          height: '100%', overflowY: 'auto',
          padding: 24, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>{title}</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textSoft }}>Changes apply immediately</p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${C.border}`, background: C.bg,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} color={C.textMid} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map((f, i) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.textMid, marginBottom: 6 }}>
                {f.label}
              </label>
              {f.type === 'select' ? (
                <select
                  defaultValue={f.value}
                  style={{
                    width: '100%', padding: '8px 12px',
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    fontSize: 13, color: C.text, background: C.surface,
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  defaultValue={f.value}
                  style={{
                    width: '100%', padding: '8px 12px',
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    fontSize: 13, color: C.text, background: C.surface,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.bg,
              fontSize: 13, fontWeight: 500, color: C.textMid, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: 'none', background: C.accent,
              fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE HERO (manager & user detail header)
   ============================================================ */

function ProfileHero({ name, email, meta, onEdit }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={name} size={46} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>{name}</div>
          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>{email}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {meta.map((m, i) => <Badge key={i} label={m.label} colors={m.colors} />)}
          </div>
        </div>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.bg,
            fontSize: 13, fontWeight: 500, color: C.textMid, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.surfaceHov; e.currentTarget.style.borderColor = C.borderMid; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.border; }}
        >
          <Pencil size={13} /> Edit profile
        </button>
      )}
    </div>
  );
}

/* ============================================================
   PLAN USAGE CARD (shown in manager detail)
   ============================================================ */

function PlanUsageCard({ manager }) {
  const limits = manager.planLimits;
  const items = [
    { label: 'Organizations', used: manager.orgs, limit: limits.orgs, icon: Building2 },
    { label: 'Venues', used: manager.venues, limit: limits.venues, icon: MapPin },
    { label: 'Devices', used: manager.devices, limit: limits.devices, icon: Cpu },
    { label: 'Users', used: manager.users, limit: limits.users, icon: Users },
  ];
  const pc = planColors(manager.plan);

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Plan usage</div>
        <Badge label={manager.plan} colors={pc} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14 }}>
        {items.map(({ label, used, limit, icon: Icon }) => {
          const p = pct(used, limit);
          const col = p >= 90 ? C.red : p >= 70 ? C.amber : C.accent;
          return (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Icon size={12} color={C.textSoft} />
                <div style={{ fontSize: 11, color: C.textSoft, fontWeight: 500 }}>{label}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
                {used}<span style={{ fontSize: 11, fontWeight: 400, color: C.textSoft }}>/{limit}</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${p}%`, height: '100%', background: col, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10, color: col, fontWeight: 600, marginTop: 3 }}>{p}% used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   TAB BAR
   ============================================================ */

const MANAGER_TABS = [
  ['subusers', 'Sub-users', Users],
  ['orgs', 'Organizations', Building2],
  ['venues', 'Venues', MapPin],
  ['devices', 'Devices', Cpu],
];

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, marginBottom: 16,
      borderBottom: `1px solid ${C.border}`, paddingBottom: 0,
      width: '100%', overflowX: 'auto', overflowY: 'hidden',
    }}
    className="tabScroll"
    >
      {tabs.map(([key, label, Icon]) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? C.accent : C.textMid,
              borderBottom: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.1s',
            }}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   COLUMN DEFINITIONS
   ============================================================ */

function deviceStatusRender(r) {
  const colors = statusColors(r.status);
  const Icon = r.status === 'Online' ? Wifi : WifiOff;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={13} color={colors.dot} />
      <span style={{ fontSize: 12, fontWeight: 500, color: colors.color }}>{r.status}</span>
    </div>
  );
}

const DEVICE_COLS = [
  { key: 'name', header: 'Device', render: r => <span style={{ fontWeight: 600, color: C.text, fontFamily: 'monospace', fontSize: 12 }}>{r.name}</span> },
  { key: 'type', header: 'Type', render: r => <span style={{ fontSize: 13, color: C.text }}>{r.type}</span> },
  { key: 'category', header: 'Category', render: r => <Badge label={r.category} colors={categoryColors(r.category)} /> },
  { key: 'venue', header: 'Venue', render: r => <span style={{ fontSize: 12, color: C.textMid }}>{r.venue}</span> },
  { key: 'status', header: 'Status', render: deviceStatusRender },
];

/* ============================================================
   MAIN APP
   ============================================================ */

const totalSubUsers = Object.values(SUB_USERS).reduce((a, arr) => a + arr.length, 0);

export default function AdminDashboard() {
  // Get active tab from parent layout via outlet context
  const { adminActiveTab, setAdminActiveTab } = useOutletContext();
  const [view, setView] = useState('managers');
  const [managerId, setManagerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState('subusers');
  const [editTarget, setEditTarget] = useState(null);

  // Sync view with adminActiveTab from sidebar
  useEffect(() => {
    if (adminActiveTab && ['managers', 'orgs', 'venues', 'devices'].includes(adminActiveTab)) {
      setView(adminActiveTab);
      setManagerId(null);
      setUserId(null);
      setTab('subusers');
    }
  }, [adminActiveTab]);

  const currentManager = MANAGERS.find(m => m.id === managerId) ?? null;
  const currentUser = managerId && userId
    ? (SUB_USERS[managerId] ?? []).find(u => u.id === userId) ?? null
    : null;

  const inManagerFlow = ['managers', 'managerDetail', 'userDetail'].includes(view);

  function selectView(v) {
    setView(v);
    setManagerId(null);
    setUserId(null);
    setTab('subusers');
    // Update parent's active tab when switching views
    if (setAdminActiveTab && ['managers', 'orgs', 'venues', 'devices'].includes(v)) {
      setAdminActiveTab(v);
    }
  }

  function openManager(m) {
    setView('managerDetail');
    setManagerId(m.id);
    setTab('subusers');
    setUserId(null);
  }

  function openUser(u) {
    setView('userDetail');
    setUserId(u.id);
  }

  function backToManagers() { setView('managers'); setManagerId(null); setUserId(null); }
  function backToManagerDetail() { setView('managerDetail'); setUserId(null); }

  const mOrgs = id => ORGS.filter(o => o.ownerId === id);
  const mVenues = id => VENUES.filter(v => v.ownerId === id);
  const mDevices = id => DEVICES.filter(d => d.ownerId === id);

  /* Breadcrumbs */
  function crumbs() {
    if (view === 'managers') return [{ label: 'Managers' }];
    if (view === 'orgs') return [{ label: 'Organizations' }];
    if (view === 'venues') return [{ label: 'Venues' }];
    if (view === 'devices') return [{ label: 'Devices' }];
    if (view === 'managerDetail') return [
      { label: 'Managers', onClick: backToManagers },
      { label: currentManager?.name },
    ];
    if (view === 'userDetail') return [
      { label: 'Managers', onClick: backToManagers },
      { label: currentManager?.name, onClick: backToManagerDetail },
      { label: currentUser?.name },
    ];
    return [];
  }

  /* Sidebar counts */
  const counts = {
    managers: MANAGERS.length,
    orgs: ORGS.length,
    venues: VENUES.length,
    devices: DEVICES.length,
  };

  return (
    <>
      <TopBar breadcrumbs={crumbs()} />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>

        {/* ── Managers list ── */}
        {view === 'managers' && (
          <>
            <SummaryStrip items={[
              { label: 'Total managers', value: MANAGERS.length, icon: Users, color: C.accent },
              { label: 'Sub-users', value: totalSubUsers, icon: Users, color: C.purple },
              { label: 'Active', value: MANAGERS.filter(m => m.status === 'Active').length, icon: CheckCircle2, color: C.green },
              { label: 'Inactive', value: MANAGERS.filter(m => m.status === 'Inactive').length, icon: AlertCircle, color: C.red },
            ]} />
            <SectionTitle title="All managers" subtitle="Click a manager to view their account details and usage" />
            <ManagersTable managers={MANAGERS} onRowClick={openManager} />
          </>
        )}

        {/* ── Orgs ── */}
        {view === 'orgs' && (
          <>
            <SectionTitle title="All organizations" />
            <DataTable
              columns={[
                { key: 'name', header: 'Organization', render: r => <span style={{ fontWeight: 600, color: C.text }}>{r.name}</span> },
                { key: 'owner', header: 'Owner', render: r => <span style={{ color: C.textMid }}>{r.owner}</span> },
                { key: 'venues', header: 'Venues', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.venues}</span> },
                { key: 'devices', header: 'Devices', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.devices}</span> },
              ]}
              rows={ORGS}
            />
          </>
        )}

        {/* ── Venues ── */}
        {view === 'venues' && (
          <>
            <SectionTitle title="All venues" />
            <DataTable
              columns={[
                { key: 'name', header: 'Venue', render: r => <span style={{ fontWeight: 600, color: C.text }}>{r.name}</span> },
                { key: 'org', header: 'Organization', render: r => <span style={{ color: C.textMid }}>{r.org}</span> },
                { key: 'devices', header: 'Devices', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.devices}</span> },
              ]}
              rows={VENUES}
            />
          </>
        )}

        {/* ── Devices ── */}
        {view === 'devices' && (
          <>
            <SummaryStrip items={[
              { label: 'Total devices', value: DEVICES.length, icon: Cpu, color: C.accent },
              { label: 'Online', value: DEVICES.filter(d => d.status === 'Online').length, icon: Wifi, color: C.green },
              { label: 'Offline', value: DEVICES.filter(d => d.status === 'Offline').length, icon: WifiOff, color: C.red },
            ]} />
            <SectionTitle title="All devices" />
            <DataTable columns={DEVICE_COLS} rows={DEVICES} />
          </>
        )}

        {/* ── Manager detail ── */}
        {view === 'managerDetail' && currentManager && (
          <>
            <ProfileHero
              name={currentManager.name}
              email={currentManager.email}
              meta={[
                { label: currentManager.plan, colors: planColors(currentManager.plan) },
                { label: currentManager.status, colors: statusColors(currentManager.status) },
              ]}
              onEdit={() => setEditTarget({
                title: 'Edit manager',
                fields: [
                  { label: 'Name', value: currentManager.name },
                  { label: 'Email', value: currentManager.email },
                  { label: 'Plan', value: currentManager.plan, type: 'select', options: ['Starter', 'Pro', 'Enterprise'] },
                  { label: 'Status', value: currentManager.status, type: 'select', options: ['Active', 'Inactive'] },
                ],
              })}
            />

            <PlanUsageCard manager={currentManager} />

            <TabBar tabs={MANAGER_TABS} active={tab} onChange={setTab} />

            {tab === 'subusers' && (
              <DataTable
                onRowClick={openUser}
                columns={[
                  {
                    key: 'name', header: 'User', render: r => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.name} size={30} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.textSoft }}>{r.email}</div>
                        </div>
                      </div>
                    )
                  },
                  { key: 'role', header: 'Role', render: r => <Badge label={r.role} colors={{ bg: C.bg, color: C.textMid, border: C.border }} /> },
                  { key: 'orgs', header: 'Orgs', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.orgs}</span> },
                  { key: 'venues', header: 'Venues', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.venues}</span> },
                  { key: 'devices', header: 'Devices', render: r => <span style={{ fontWeight: 500, color: C.text }}>{r.devices}</span> },
                  { key: 'status', header: 'Status', render: r => <Badge label={r.status} colors={statusColors(r.status)} /> },
                ]}
                rows={SUB_USERS[currentManager.id] ?? []}
              />
            )}

            {tab === 'orgs' && (
              <DataTable
                columns={[
                  { key: 'name', header: 'Organization', render: r => <span style={{ fontWeight: 600, color: C.text }}>{r.name}</span> },
                  { key: 'venues', header: 'Venues', render: r => <span style={{ fontWeight: 500 }}>{r.venues}</span> },
                  { key: 'devices', header: 'Devices', render: r => <span style={{ fontWeight: 500 }}>{r.devices}</span> },
                ]}
                rows={mOrgs(currentManager.id)}
              />
            )}

            {tab === 'venues' && (
              <DataTable
                columns={[
                  { key: 'name', header: 'Venue', render: r => <span style={{ fontWeight: 600, color: C.text }}>{r.name}</span> },
                  { key: 'org', header: 'Organization', render: r => <span style={{ color: C.textMid }}>{r.org}</span> },
                  { key: 'devices', header: 'Devices', render: r => <span style={{ fontWeight: 500 }}>{r.devices}</span> },
                ]}
                rows={mVenues(currentManager.id)}
              />
            )}

            {tab === 'devices' && (
              <DataTable columns={DEVICE_COLS} rows={mDevices(currentManager.id)} />
            )}
          </>
        )}

        {/* ── Sub-user detail ── */}
        {view === 'userDetail' && currentUser && (
          <>
            <ProfileHero
              name={currentUser.name}
              email={currentUser.email}
              meta={[
                { label: currentUser.role, colors: { bg: C.bg, color: C.textMid, border: C.border } },
                { label: currentUser.status, colors: statusColors(currentUser.status) },
              ]}
              onEdit={() => setEditTarget({
                title: 'Edit sub-user',
                fields: [
                  { label: 'Name', value: currentUser.name },
                  { label: 'Email', value: currentUser.email },
                  { label: 'Role', value: currentUser.role, type: 'select', options: ['Viewer', 'Operator'] },
                  { label: 'Status', value: currentUser.status, type: 'select', options: ['Active', 'Inactive'] },
                ],
              })}
            />

            <div style={{ display: 'grid',  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Organizations', value: currentUser.orgs, icon: Building2 },
                { label: 'Venues', value: currentUser.venues, icon: MapPin },
                { label: 'Devices', value: currentUser.devices, icon: Cpu },
              ].map(s => (
                <div key={s.label} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: C.accentSoft,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <s.icon size={15} color={C.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: '-0.03em' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle title="Assigned devices" subtitle="Devices accessible to this user (scoped from manager pool)" />
            <DataTable
              columns={DEVICE_COLS}
              rows={mDevices(managerId).slice(0, 2)}
            />
          </>
        )}
      </main>

      {editTarget && (
        <EditDrawer
          title={editTarget.title}
          fields={editTarget.fields}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}