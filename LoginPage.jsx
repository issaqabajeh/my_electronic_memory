import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Brain, Eye, EyeOff, ChevronDown } from 'lucide-react';

const ROLE_REDIRECTS = { patient: '/patient', doctor: '/doctor', caregiver: '/caregiver', admin: '/admin' };

const COUNTRIES = [
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
];

function PhoneInput({ value, onChange, countryCode, onCountryChange }) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  return (
    <div className="flex relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 border border-r-0 border-gray-200 rounded-l-xl px-3 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm min-w-[96px] flex-shrink-0">
        <span className="text-base">{selected.flag}</span>
        <span className="text-gray-700 font-medium">{selected.code}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 w-56 max-h-64 overflow-y-auto">
          {COUNTRIES.map(c => (
            <button key={c.code} type="button"
              onClick={() => { onCountryChange(c.code); setOpen(false); }}
              className={"flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-blue-50 transition text-left " + (c.code === countryCode ? 'bg-blue-50 text-blue-700' : 'text-gray-700')}>
              <span>{c.flag}</span>
              <span className="font-medium">{c.code}</span>
              <span className="text-gray-400 text-xs">{c.name}</span>
            </button>
          ))}
        </div>
      )}
      <input type="tel" value={value} onChange={onChange} placeholder="7x xxx xxxx"
        className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0" />
    </div>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'patient', phone: '', country_code: '+962' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isLogin) {
        const role = await login(form.email, form.password);
        toast.success('Welcome back!');
        navigate(ROLE_REDIRECTS[role] || '/');
      } else {
        try {
          const role = await register(form);
          toast.success('Account created!');
          navigate(ROLE_REDIRECTS[role] || '/');
        } catch (err) {
          if (err.response?.status === 202) {
            toast.success('Account created! Waiting for admin approval.', { duration: 6000 });
            setIsLogin(true);
          } else throw err;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.detail;
      if (msg === 'Account pending admin approval') toast.error('Your account is pending approval.');
      else toast.error(msg || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width:(i+1)*120+'px', height:(i+1)*120+'px', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
              <Brain size={24} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">My Electronic Memory</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Caring for minds,<br/>connecting hearts.
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Integrated Alzheimer care platform for patients, doctors, and caregivers.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['∞','Patients'],['✓','Doctors'],['♥','Caregivers']].map(([v,l]) => (
            <div key={l} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{v}</p>
              <p className="text-blue-200 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">{isLogin ? 'Sign in to continue' : 'Join the care platform'}</p>

          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {['Sign in','Register'].map((t,i) => (
              <button key={t} onClick={() => setIsLogin(i===0)}
                className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all " + ((i===0)===isLogin ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500')}>
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name</label>
                  <input type="text" required value={form.full_name} onChange={set('full_name')} placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone number</label>
                  <PhoneInput value={form.phone} onChange={set('phone')}
                    countryCode={form.country_code} onCountryChange={code => setForm(f => ({...f, country_code: code}))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">I am a</label>
                  <select value={form.role} onChange={set('role')}
                                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                  <option value="patient">Patient</option>
                                  <option value="doctor">Doctor</option>
                                  <option value="caregiver">Caregiver</option>
                                  <option value="admin">Admin</option>
                              </select>
                  {form.role === 'doctor' && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-1.5">
                      ⚠️ Doctor accounts require admin approval before you can log in.
                    </p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                <button type="button" onClick={() => setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-60 shadow-sm shadow-blue-200 mt-2">
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
