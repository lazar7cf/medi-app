import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  Activity,
  Users,
  FileText,
  Search,
  LogOut,
  ChevronRight,
  Calendar,
  Save,
  Printer,
  ClipboardList,
  Brain,
  Stethoscope,
  Filter,
  ArrowUpDown,
  User,
  Shield,
  UserPlus,
  X,
  Plus,
  Menu,
  Pencil,
  Archive,
  AlertTriangle,
  Loader2,
  Trash2,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types & Interfaces ---

type StatusColor = 'red' | 'orange' | 'yellow' | 'purple' | 'green' | 'gray';

interface Team {
  id: string;
  name: string;
}

interface Measurement {
  date: string;
  [key: string]: string | number;
}

interface Report {
  id: string;
  date: string;
  medical: string;
  psychological: string;
}

interface Player {
  id: string;
  name: string;
  birthYear: number;
  teamId: string;
  position: string;
  status: StatusColor;
  morphology: Measurement[];
  motor: Measurement[];
  specific: Measurement[];
  functional: Measurement[];
  diagnostics: Measurement[];
  reports: Report[];
}

// --- Constants ---
const POSITIONS = ['Golman', 'Desni Bek', 'Levi Bek', 'Štoper', 'Def. Vezni', 'Cent. Vezni', 'Ofan. Vezni', 'Desno Krilo', 'Levo Krilo', 'Napadač'];

// --- DATA SERVICE LAYER ---
class DataService {
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) throw error;
    return data || [];
  }

  async getPlayers(): Promise<Player[]> {
    const { data, error } = await supabase.from('players').select('*');
    if (error) throw error;
    return data || [];
  }

  async addTeam(name: string): Promise<Team> {
    const { data, error } = await supabase.from('teams').insert([{ name }]).select().single();
    if (error) throw error;
    return data;
  }

  async addPlayer(player: Partial<Player>): Promise<Player> {
    const playerToInsert = {
      name: player.name || 'Nepoznat',
      birthYear: player.birthYear || 2000,
      teamId: player.teamId || null,
      position: player.position || POSITIONS[0],
      status: 'green',
      morphology: [],
      motor: [],
      specific: [],
      functional: [],
      diagnostics: [],
      reports: []
    };

    const { data, error } = await supabase.from('players').insert([playerToInsert]).select().single();
    if (error) throw error;
    return data;
  }

  async updatePlayer(player: Player): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update(player)
      .eq('id', player.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePlayerStatus(id: string, status: StatusColor): Promise<void> {
    const { error } = await supabase.from('players').update({ status }).eq('id', id);
    if (error) throw error;
  }
}

const api = new DataService();

// --- Helper Functions ---

const getStatusColorClasses = (status: StatusColor) => {
  switch (status) {
    case 'red': return 'bg-red-500 text-white';
    case 'orange': return 'bg-orange-500 text-white';
    case 'yellow': return 'bg-yellow-400 text-black';
    case 'purple': return 'bg-purple-500 text-white';
    case 'green': return 'bg-green-500 text-white';
    case 'gray': return 'bg-slate-400 text-white';
    default: return 'bg-gray-300';
  }
};

const getStatusLabel = (status: StatusColor) => {
  switch (status) {
    case 'red': return 'Povređen';
    case 'orange': return 'Oporavak';
    case 'yellow': return 'Rizičan';
    case 'purple': return 'Poseban režim';
    case 'green': return 'Spreman';
    case 'gray': return 'Bivši igrač';
  }
};

// --- Components ---

const LoginForm = ({ onLogin }: { onLogin: (email: string, pass: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Greška pri prijavi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">Medi-Sport</h1>
          <p className="text-slate-500 text-sm">Pristup za ovlašćena lica</p>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email adresa</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lozinka</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Sub-components for Profile ---

const TableSection = ({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete
}: {
  title: string;
  data: Measurement[];
  columns: { key: string, label: string }[];
  onAdd: (data: Measurement) => void;
  onEdit: (index: number, data: Measurement) => void;
  onDelete: (index: number) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newData, setNewData] = useState<any>({ date: new Date().toISOString().split('T')[0] });

  const handleSave = () => {
    if (editingIndex !== null) {
      onEdit(editingIndex, newData);
      setEditingIndex(null);
    } else {
      onAdd(newData);
    }
    setIsAdding(false);
    setNewData({ date: new Date().toISOString().split('T')[0] });
  };

  const handleEditClick = (index: number, row: Measurement) => {
    setEditingIndex(index);
    setNewData(row);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewData({ date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="bg-white border rounded mb-6 break-inside-avoid">
      <div className="px-4 py-3 bg-slate-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
          <Activity className="w-4 h-4 text-slate-500" />
          {title}
        </h3>
        <button
          onClick={() => {
            if (isAdding) handleCancel();
            else setIsAdding(true);
          }}
          className={`text-xs px-2 py-1 rounded transition whitespace-nowrap no-print ${isAdding ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isAdding ? 'Otkaži' : '+ Merenje'}
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-blue-50 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 no-print animate-fade-in">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-500">Datum</label>
            <input
              type="date"
              className="w-full border rounded p-1 text-sm"
              value={newData.date}
              onChange={e => setNewData({ ...newData, date: e.target.value })}
            />
          </div>
          {columns.map(col => (
            <div key={col.key}>
              <label className="block text-xs font-medium text-slate-500">{col.label}</label>
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
                placeholder="-"
                value={newData[col.key] || ''}
                onChange={e => setNewData({ ...newData, [col.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end mt-2 gap-2">
            <button onClick={handleCancel} className="px-3 py-1 text-slate-500 hover:text-slate-800 text-sm">Otkaži</button>
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm w-full sm:w-auto justify-center hover:bg-green-700 shadow-sm">
              <Save className="w-3 h-3" /> {editingIndex !== null ? 'Sačuvaj izmenu' : 'Sačuvaj'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Datum</th>
              {columns.map(col => <th key={col.key} className="px-4 py-2">{col.label}</th>)}
              <th className="px-4 py-2 text-right no-print w-20">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="px-4 py-2 text-center text-slate-400">Nema podataka</td></tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 group">
                  <td className="px-4 py-2 font-medium text-slate-700">{row.date}</td>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-2">{row[col.key] || '-'}</td>
                  ))}
                  <td className="px-4 py-2 text-right no-print">
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(idx, row)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Izmeni"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Da li ste sigurni da želite da obrišete ovo merenje?')) {
                            onDelete(idx);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Obriši"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportSection = ({
  reports,
  onAddReport
}: {
  reports: Report[],
  onAddReport: (med: string, psy: string) => void
}) => {
  const [medical, setMedical] = useState('');
  const [psych, setPsych] = useState('');

  return (
    <div className="space-y-6">
      <div className="no-print bg-white p-4 rounded border shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3">Novi Izveštaj</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> MEDICINSKI IZVEŠTAJ
            </label>
            <textarea
              className="w-full border rounded p-2 text-sm h-32 focus:ring-2 focus:ring-blue-500"
              placeholder="Unesite medicinska zapažanja, povrede, terapije..."
              value={medical}
              onChange={e => setMedical(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
              <Brain className="w-3 h-3" /> PSIHOLOŠKI IZVEŠTAJ
            </label>
            <textarea
              className="w-full border rounded p-2 text-sm h-32 focus:ring-2 focus:ring-purple-500"
              placeholder="Unesite psihološka zapažanja, motivaciju, stanje..."
              value={psych}
              onChange={e => setPsych(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={!medical && !psych}
            onClick={() => { onAddReport(medical, psych); setMedical(''); setPsych(''); }}
            className="w-full sm:w-auto bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900 disabled:opacity-50"
          >
            Sačuvaj Izveštaje
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 px-1">Istorija Izveštaja</h3>
        {reports.length === 0 ? <p className="text-sm text-slate-400 italic px-1">Nema izveštaja.</p> : null}
        {reports.map((report) => (
          <div key={report.id} className="bg-white border rounded-lg overflow-hidden break-inside-avoid shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">{report.date}</span>
              <span className="text-xs font-bold text-slate-400">ID: {report.id}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              <div className="p-4">
                <h4 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Medicinski Nalaz</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{report.medical || "Nema unosa."}</p>
              </div>
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Psihološki Nalaz</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{report.psychological || "Nema unosa."}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Views ---

const AddTeamModal = ({
  onClose,
  onSave
}: {
  onClose: () => void,
  onSave: (name: string) => void
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    await onSave(name);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Novi Tim
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Naziv Tima</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Unesite naziv tima..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded w-full sm:w-auto">Otkaži</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto flex items-center justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddPlayerModal = ({
  teams,
  onClose,
  onSave
}: {
  teams: Team[],
  onClose: () => void,
  onSave: (p: Partial<Player>) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthYear: 2010,
    teamId: teams[0]?.id || '',
    position: POSITIONS[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" /> Novi Igrač
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ime i Prezime</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Godište</label>
              <input
                type="number"
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.birthYear}
                onChange={e => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tim</label>
              <select
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.teamId}
                onChange={e => setFormData({ ...formData, teamId: e.target.value })}
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pozicija</label>
            <select
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded w-full sm:w-auto">Otkaži</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto flex items-center justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditPlayerModal = ({
  player,
  teams,
  onClose,
  onSave
}: {
  player: Player,
  teams: Team[],
  onClose: () => void,
  onSave: (p: Player) => Promise<void>
}) => {
  const [formData, setFormData] = useState({
    name: player.name,
    birthYear: player.birthYear,
    teamId: player.teamId,
    position: player.position,
    status: player.status
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...player, ...formData });
    setLoading(false);
    onClose();
  };

  const handleArchive = async () => {
    if (confirm('Da li ste sigurni da želite da označite da je igrač napustio klub? Podaci će ostati sačuvani, ali će igrač biti označen kao "Bivši igrač".')) {
      setLoading(true);
      await onSave({ ...player, ...formData, status: 'gray' });
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" /> Uredi Podatke Igrača
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ime i Prezime</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Godište</label>
              <input
                type="number"
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.birthYear}
                onChange={e => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 font-bold text-blue-600">Tim (Transfer)</label>
              <select
                className="w-full border-2 border-blue-100 bg-blue-50 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.teamId}
                onChange={e => setFormData({ ...formData, teamId: e.target.value })}
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pozicija</label>
            <select
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="pt-6 mt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleArchive}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-2 rounded hover:bg-red-100 transition-colors w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" /> Igrač Napustio Klub
            </button>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Otkaži</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sačuvaj Izmene
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Column Definitions ---

type ColumnDef = {
  id: string;
  label: string;
  category: string;
  getter: (p: Player, teams: Team[]) => any;
};

const ALL_COLUMNS: ColumnDef[] = [
  // Opšte
  { id: 'year', label: 'Godište', category: 'Opšte', getter: p => p.birthYear },
  { id: 'team', label: 'Tim', category: 'Opšte', getter: (p, teams) => teams.find(t => t.id === p.teamId)?.name || '-' },
  { id: 'pos', label: 'Pozicija', category: 'Opšte', getter: p => p.position },

  // Morfologija
  { id: 'height', label: 'Visina (cm)', category: 'Morfologija', getter: p => p.morphology[0]?.height || '-' },
  { id: 'weight', label: 'Težina (kg)', category: 'Morfologija', getter: p => p.morphology[0]?.weight || '-' },
  { id: 'fat', label: 'Masti (%)', category: 'Morfologija', getter: p => p.morphology[0]?.fat || '-' },
  { id: 'muscle', label: 'Mišići (%)', category: 'Morfologija', getter: p => p.morphology[0]?.muscle || '-' },

  // Motorika
  { id: 's5', label: 'Sprint 5m', category: 'Motorika', getter: p => p.motor[0]?.sprint5 || '-' },
  { id: 's20', label: 'Sprint 20m', category: 'Motorika', getter: p => p.motor[0]?.sprint20 || '-' },
  { id: 'cmj', label: 'Skok CMJ', category: 'Motorika', getter: p => p.motor[0]?.cmj || '-' },
  { id: 'sj', label: 'Skok SJ', category: 'Motorika', getter: p => p.motor[0]?.sj || '-' },

  // Specifično
  { id: 'dribble', label: 'Vođenje', category: 'Specifično', getter: p => p.specific[0]?.vodjenje || '-' },
  { id: 'shoot', label: 'Šut (1-10)', category: 'Specifično', getter: p => p.specific[0]?.sut || '-' },

  // Funkcionalno
  { id: 'vo2', label: 'VO2 Max', category: 'Funkcionalno', getter: p => p.functional[0]?.vo2max || '-' },
  { id: 'hrmax', label: 'HR Max', category: 'Funkcionalno', getter: p => p.functional[0]?.hr_max || '-' },

  // Izveštaji
  { id: 'rep_med', label: 'Poslednji Med. Nalaz', category: 'Izveštaji', getter: p => p.reports[0]?.medical || '-' },
  { id: 'rep_psy', label: 'Poslednji Psy. Nalaz', category: 'Izveštaji', getter: p => p.reports[0]?.psychological || '-' },
];

const ClubSummary = ({
  players,
  teams,
  onClose
}: {
  players: Player[],
  teams: Team[],
  onClose: () => void
}) => {
  const [filterTeam, setFilterTeam] = useState('all');
  const [sortKey, setSortKey] = useState<'name' | 'birthYear'>('name');
  const [showConfig, setShowConfig] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['year', 'team', 'height', 'weight', 's20', 'vo2'])
  );

  const processed = players
    .filter(p => filterTeam === 'all' || p.teamId === filterTeam)
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'birthYear') return b.birthYear - a.birthYear;
      return 0;
    });

  const toggleColumn = (id: string) => {
    const next = new Set(visibleColumns);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleColumns(next);
  };

  const categories = Array.from(new Set(ALL_COLUMNS.map(c => c.category)));

  return (
    <div className="bg-slate-100 min-h-screen w-full animate-fade-in flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-20 gap-4 no-print shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-500 hover:text-black flex items-center gap-1 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" /> Nazad
          </button>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> <span className="hidden sm:inline">Sažetak Kluba</span><span className="sm:hidden">Sažetak</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <select
            className="border rounded px-2 py-1.5 text-sm flex-1 sm:flex-none bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <option value="all">Svi Timovi</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors border ${showConfig ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-4 h-4" /> Podešavanje
          </button>

          <button onClick={() => window.print()} className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm whitespace-nowrap flex items-center gap-2 hover:bg-slate-900 transition-colors">
            <Printer className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white border-b p-4 sm:p-6 animate-fade-in no-print">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" /> Izaberite kolone za prikaz
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(cat => (
              <div key={cat}>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b pb-1">{cat}</h4>
                <div className="space-y-1.5">
                  {ALL_COLUMNS.filter(c => c.category === cat).map(col => (
                    <label key={col.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={visibleColumns.has(col.id)}
                          onChange={() => toggleColumn(col.id)}
                        />
                        <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <CheckSquare className="w-4 h-4 text-white absolute top-0 left-0 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 select-none">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setShowConfig(false)} className="text-sm text-blue-600 font-medium hover:underline">Zatvori podešavanja</button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="p-4 overflow-x-auto print:overflow-visible flex-1">
        <div className="bg-white border shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-sm whitespace-nowrap print:border-collapse print:text-xs">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b">
              <tr>
                <th className="p-3 text-center w-10">#</th>
                {/* Name is fixed */}
                <th className="p-3 text-left cursor-pointer hover:text-blue-600 hover:bg-slate-100 transition-colors sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" onClick={() => setSortKey('name')}>
                  Ime <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                {ALL_COLUMNS.filter(c => visibleColumns.has(c.id)).map(col => (
                  <th key={col.id} className="p-3 text-center border-l border-slate-100">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processed.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 text-center text-slate-400">{i + 1}</td>
                  {/* Name Cell - Sticky */}
                  <td className="p-3 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r">
                    {p.name}
                  </td>
                  {/* Dynamic Cells */}
                  {ALL_COLUMNS.filter(c => visibleColumns.has(c.id)).map(col => (
                    <td key={col.id} className="p-3 text-center text-slate-600 border-l border-slate-50 max-w-[200px] truncate" title={String(col.getter(p, teams))}>
                      {col.getter(p, teams)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {processed.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Nema podataka za prikazane kriterijume.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({
  players,
  teams,
  onSelectPlayer,
  onUpdateStatus,
  onAddPlayer,
  onAddTeam,
  onViewSummary,
  onLogout,
  loading
}: {
  players: Player[],
  teams: Team[],
  onSelectPlayer: (p: Player) => void,
  onUpdateStatus: (id: string, s: StatusColor) => void,
  onAddPlayer: (p: Partial<Player>) => void,
  onAddTeam: (name: string) => void,
  onViewSummary: () => void,
  onLogout: () => void,
  loading: boolean
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'teams'>('list');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredPlayers = players
    .filter(p => selectedTeamId === 'all' || p.teamId === selectedTeamId)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.birthYear - a.birthYear);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 relative">

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="text-blue-500" /> MEDI-SPORT
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sistem za praćenje igrača</p>
          </div>
          <button onClick={closeMobileMenu} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
          <button
            onClick={() => { setViewMode('list'); setSelectedTeamId('all'); closeMobileMenu(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${viewMode === 'list' && selectedTeamId === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Svi Igrači</span>
          </button>

          <button
            onClick={() => { setViewMode('teams'); closeMobileMenu(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${viewMode === 'teams' || (viewMode === 'list' && selectedTeamId !== 'all') ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Timovi</span>
          </button>

          <button
            onClick={() => { onViewSummary(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded transition-colors hover:bg-slate-800 text-slate-300"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">Sažetak Kluba</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { setShowAddModal(true); closeMobileMenu(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-green-400 hover:bg-slate-800 hover:text-green-300 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Dodaj Novog Igrača</span>
            </button>
            <button
              onClick={() => { setShowAddTeamModal(true); closeMobileMenu(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Dodaj Novi Tim</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 mb-2">Prijavljen kao:</div>
          <div className="text-sm font-medium text-white mb-4">Administrator</div>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" /> Odjavi se
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 relative w-full">

        {/* Mobile Header Toggle */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded shadow text-slate-700">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-800 text-lg">MEDI-SPORT</span>
          </div>
        </div>

        {/* Add Player Modal */}
        {showAddModal && (
          <AddPlayerModal
            teams={teams}
            onClose={() => setShowAddModal(false)}
            onSave={onAddPlayer}
          />
        )}

        {/* Add Team Modal */}
        {showAddTeamModal && (
          <AddTeamModal
            onClose={() => setShowAddTeamModal(false)}
            onSave={onAddTeam}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
            <p>Učitavanje podataka...</p>
          </div>
        ) : (
          <>
            {/* View: Teams Grid */}
            {viewMode === 'teams' && (
              <div className="animate-fade-in">
                <header className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Pregled Timova</h2>
                  <p className="text-sm text-slate-500">Odaberite tim za pregled igrača</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {teams.map(team => {
                    const count = players.filter(p => p.teamId === team.id && p.status !== 'gray').length;
                    return (
                      <div
                        key={team.id}
                        onClick={() => { setSelectedTeamId(team.id); setViewMode('list'); }}
                        className="bg-white p-6 rounded-xl border hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition">
                            <Shield className="w-6 h-6 text-blue-600" />
                          </div>
                          <span className="text-2xl font-bold text-slate-800">{count}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{team.name}</h3>
                        <p className="text-xs text-slate-500">Klikni za pregled igrača</p>
                      </div>
                    );
                  })}
                  {/* Add New Team Card */}
                  <button
                    onClick={() => setShowAddTeamModal(true)}
                    className="bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 gap-2 h-full min-h-[160px]"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="font-medium">Dodaj Novi Tim</span>
                  </button>
                </div>
              </div>
            )}

            {/* View: Player List */}
            {viewMode === 'list' && (
              <div className="animate-fade-in">
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                      {selectedTeamId !== 'all' && (
                        <button onClick={() => setViewMode('teams')} className="text-slate-400 hover:text-slate-600 mr-2">
                          ←
                        </button>
                      )}
                      {selectedTeamId === 'all' ? 'Lista svih igrača' : teams.find(t => t.id === selectedTeamId)?.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ukupno: {filteredPlayers.length} igrača {selectedTeamId !== 'all' ? `u timu` : ''}
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Pretraži igrače..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </header>

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 border-b">#</th>
                          <th className="px-6 py-3 border-b">Ime i Prezime</th>
                          <th className="px-6 py-3 border-b">Godište</th>
                          <th className="px-6 py-3 border-b">Tim</th>
                          <th className="px-6 py-3 border-b">Pozicija</th>
                          <th className="px-6 py-3 border-b text-center">Status</th>
                          <th className="px-6 py-3 border-b"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                              {searchQuery ? `Nema igrača koji se zovu "${searchQuery}".` : 'Nema igrača u ovom timu.'}
                            </td>
                          </tr>
                        ) : filteredPlayers.map((player, idx) => (
                          <tr key={player.id} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => onSelectPlayer(player)}>
                            <td className="px-6 py-2 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="px-6 py-2 font-medium text-slate-900">{player.name}</td>
                            <td className="px-6 py-2 text-slate-600">{player.birthYear}</td>
                            <td className="px-6 py-2 text-slate-600">{teams.find(t => t.id === player.teamId)?.name}</td>
                            <td className="px-6 py-2 text-slate-600">{player.position}</td>
                            <td className="px-6 py-2 text-center">
                              <select
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => onUpdateStatus(player.id, e.target.value as StatusColor)}
                                value={player.status}
                                className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer appearance-none text-center min-w-[80px] ${getStatusColorClasses(player.status)}`}
                              >
                                <option value="green">Spreman</option>
                                <option value="yellow">Rizičan</option>
                                <option value="orange">Oporavak</option>
                                <option value="red">Povređen</option>
                                <option value="purple">Spec. rad</option>
                                <option value="gray">Bivši igrač</option>
                              </select>
                            </td>
                            <td className="px-6 py-2 text-right">
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 inline-block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Summary (only on mobile or when sidebar is hidden/not enough) 
          Actually let's keep it visible for quick access 
      */}
      <button
        onClick={onViewSummary}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition flex items-center gap-2 z-20 md:hidden"
        title="Sažetak kluba"
      >
        <ClipboardList className="w-6 h-6" />
      </button>
    </div>
  );
};

const PlayerProfile = ({
  player,
  teams,
  onBack,
  onUpdatePlayer,
  onUpdateStatus
}: {
  player: Player,
  teams: Team[],
  onBack: () => void,
  onUpdatePlayer: (p: Player) => Promise<void>,
  onUpdateStatus: (id: string, s: StatusColor) => void
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper to update specific measurement arrays
  const updateMeasurements = async (key: keyof Player, newData: any[]) => {
    const updatedPlayer = { ...player, [key]: newData };
    await onUpdatePlayer(updatedPlayer);
  };

  const handleAddMeasurement = (key: keyof Player, item: Measurement) => {
    // @ts-ignore
    const currentList = player[key] as Measurement[];
    const newList = [item, ...currentList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    updateMeasurements(key, newList);
  };

  const handleEditMeasurement = (key: keyof Player, index: number, item: Measurement) => {
    // @ts-ignore
    const currentList = [...(player[key] as Measurement[])];
    currentList[index] = item;
    updateMeasurements(key, currentList);
  };

  const handleDeleteMeasurement = (key: keyof Player, index: number) => {
    // @ts-ignore
    const currentList = [...(player[key] as Measurement[])];
    currentList.splice(index, 1);
    updateMeasurements(key, currentList);
  };

  const handleAddReport = async (medical: string, psychological: string) => {
    const newReport: Report = {
      id: `r_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      medical,
      psychological
    };
    const newReports = [newReport, ...player.reports];
    await onUpdatePlayer({ ...player, reports: newReports });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 animate-fade-in">
      {showEditModal && (
        <EditPlayerModal
          player={player}
          teams={teams}
          onClose={() => setShowEditModal(false)}
          onSave={onUpdatePlayer}
        />
      )}

      {/* Header - REVISED for Responsiveness */}
      <div className="bg-white border-b px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-20 shadow-sm no-print gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <button onClick={onBack} className="text-slate-500 hover:text-black flex items-center gap-1 transition-colors shrink-0">
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium sm:hidden">Nazad</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
              {player.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-slate-800 text-lg leading-tight truncate">{player.name}</h1>
              <div className="text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                <span>{player.birthYear}.</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">{teams.find(t => t.id === player.teamId)?.name || 'Nema tima'}</span>
                <span className="hidden sm:inline">•</span>
                <span>{player.position}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
          {/* Status Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 sm:hidden">Status:</span>
            <select
              value={player.status}
              onChange={(e) => onUpdateStatus(player.id, e.target.value as StatusColor)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border-none focus:ring-0 cursor-pointer appearance-none text-center ${getStatusColorClasses(player.status)}`}
            >
              <option value="green">Spreman</option>
              <option value="yellow">Rizičan</option>
              <option value="orange">Oporavak</option>
              <option value="red">Povređen</option>
              <option value="purple">Spec. rad</option>
              <option value="gray">Bivši igrač</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Štampaj">
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Uredi"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-8">

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Morfološka Merenja
            </h2>
            <TableSection
              title="Antropometrija"
              data={player.morphology}
              columns={[
                { key: 'height', label: 'Visina (cm)' },
                { key: 'weight', label: 'Težina (kg)' },
                { key: 'fat', label: 'Masti (%)' },
                { key: 'muscle', label: 'Mišići (%)' },
                { key: 'raspon', label: 'Raspon (cm)' },
              ]}
              onAdd={(d) => handleAddMeasurement('morphology', d)}
              onEdit={(i, d) => handleEditMeasurement('morphology', i, d)}
              onDelete={(i) => handleDeleteMeasurement('morphology', i)}
            />
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" /> Motorička Testiranja
            </h2>
            <TableSection
              title="Testiranja Brzine i Skočnosti"
              data={player.motor}
              columns={[
                { key: 'sprint5', label: 'Sprint 5m (s)' },
                { key: 'sprint20', label: 'Sprint 20m (s)' },
                { key: 'cmj', label: 'Skok CMJ (cm)' },
                { key: 'sj', label: 'Skok SJ (cm)' },
              ]}
              onAdd={(d) => handleAddMeasurement('motor', d)}
              onEdit={(i, d) => handleEditMeasurement('motor', i, d)}
              onDelete={(i) => handleDeleteMeasurement('motor', i)}
            />
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-orange-600" /> Specifična Testiranja
            </h2>
            <TableSection
              title="Fudbalska Specifičnost"
              data={player.specific}
              columns={[
                { key: 'vodjenje', label: 'Vođenje (s)' },
                { key: 'sut', label: 'Šut Preciznost (1-10)' },
                { key: 'agilnost', label: 'Agilnost (s)' },
              ]}
              onAdd={(d) => handleAddMeasurement('specific', d)}
              onEdit={(i, d) => handleEditMeasurement('specific', i, d)}
              onDelete={(i) => handleDeleteMeasurement('specific', i)}
            />
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-red-600" /> Funkcionalna Testiranja
            </h2>
            <TableSection
              title="Kardio / Ergospirometrija"
              data={player.functional}
              columns={[
                { key: 'vo2max', label: 'VO2 Max' },
                { key: 'hr_max', label: 'HR Max' },
                { key: 'hr_rest', label: 'HR Rest' },
              ]}
              onAdd={(d) => handleAddMeasurement('functional', d)}
              onEdit={(i, d) => handleEditMeasurement('functional', i, d)}
              onDelete={(i) => handleDeleteMeasurement('functional', i)}
            />
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" /> Zdravstveni Karton
            </h2>
            <TableSection
              title="Dijagnostika"
              data={player.diagnostics}
              columns={[
                { key: 'krvna_slika', label: 'Krvna Slika' },
                { key: 'ekg', label: 'EKG' },
                { key: 'povreda', label: 'Status Povrede' },
              ]}
              onAdd={(d) => handleAddMeasurement('diagnostics', d)}
              onEdit={(i, d) => handleEditMeasurement('diagnostics', i, d)}
              onDelete={(i) => handleDeleteMeasurement('diagnostics', i)}
            />
          </section>

          <section className="break-inside-avoid print:break-before-page">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-600" /> Izveštaji i Anamneza
            </h2>
            <ReportSection
              reports={player.reports}
              onAddReport={handleAddReport}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [view, setView] = useState<'dashboard' | 'summary' | 'profile'>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only fetch if logged in
    if (session) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [t, p] = await Promise.all([api.getTeams(), api.getPlayers()]);
          setTeams(t);
          setPlayers(p);
        } catch (e) {
          console.error(e);
          alert('Greška pri učitavanju podataka.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [session]);

  const handleLogin = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPlayers([]);
    setTeams([]);
  };

  const handleSelectPlayer = (p: Player) => {
    setSelectedPlayerId(p.id);
    setView('profile');
  };

  const handleBackToDashboard = () => {
    setSelectedPlayerId(null);
    setView('dashboard');
  };

  const handleAddPlayer = async (p: Partial<Player>) => {
    try {
      const newPlayer = await api.addPlayer(p);
      setPlayers(prev => [newPlayer, ...prev]);
    } catch (e) { console.error(e); }
  };

  const handleAddTeam = async (name: string) => {
    try {
      const newTeam = await api.addTeam(name);
      setTeams(prev => [...prev, newTeam]);
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id: string, s: StatusColor) => {
    try {
      await api.updatePlayerStatus(id, s);
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: s } : p));
    } catch (e) { console.error(e); }
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    try {
      const result = await api.updatePlayer(updatedPlayer);
      setPlayers(prev => prev.map(p => p.id === result.id ? result : p));
    } catch (e) { console.error(e); }
  };

  if (!session) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (view === 'summary') {
    return <ClubSummary players={players} teams={teams} onClose={() => setView('dashboard')} />;
  }

  if (view === 'profile' && selectedPlayerId) {
    const player = players.find(p => p.id === selectedPlayerId);
    if (player) {
      return (
        <PlayerProfile
          player={player}
          teams={teams}
          onBack={handleBackToDashboard}
          onUpdatePlayer={handleUpdatePlayer}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }
  }

  return (
    <Dashboard
      players={players}
      teams={teams}
      onSelectPlayer={handleSelectPlayer}
      onUpdateStatus={handleUpdateStatus}
      onAddPlayer={handleAddPlayer}
      onAddTeam={handleAddTeam}
      onViewSummary={() => setView('summary')}
      onLogout={handleLogout}
      loading={loading}
    />
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);