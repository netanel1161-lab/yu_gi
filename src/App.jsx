import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Disc, X, List, Activity, MessageCircle, ArrowUpRight, Lock, Plus, Trash2, Key, Instagram, User, UserCheck, SkipBack, SkipForward, Ticket, Zap, Radio, Mic2, Speaker, Sliders, Eye, EyeOff, Music, Waves, BarChart2, Repeat } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import bg1 from './data/470364267_570032835857973_6265814776262227318_n.jpg';
import bg2 from './data/470470310_1841524222922306_1770092502604642398_n.jpg';
import bg3 from './data/474605413_18488720428052613_4204304432197577561_n.jpg';
import bg4 from './data/501505771_18513221476052613_319102019743672729_n.jpg';
import v1 from './data/video/AQM8vYATxxJnqloqfy899BSLA3xc9fqpok0V_3NTkzuoO1HvrhZ7f2cwEBEgQ52rMp7Arhloc2E9gS3eqU4Ei_Kvh9K2y6-8X4T3fjQ.mp4';
import v2 from './data/video/AQNzhDKt1YpgZN73M76s9VFr_WTWZJa8EHre60PL9JLXB0joK0rta5lPyL4JKMYqSvB-7iOVydM2gUT8AWqu4NV8r3IRlbkGL2H5YD4.mp4';
import v3 from './data/video/AQOG-eaptixsn-ZARp0tXUoeCQinluHJx0V5F0YymGsg2NrD7SPBgf21bAQ2lufEfHOdQ7mQk_Tc8IWuRpUhQKWC1QhZemyLsnL2I2w.mp4';
import v4 from './data/video/AQPaSw4bzJHiNFmZW_zZUUBb8HEN9JMmPViHyKneVBz5AmlPuxepwpcTIBWIkaM7wbrZyGiVQQf7j1Z9l__x689vfQllEUpFYeHuAWs.mp4';

// --- Firebase Setup (guarded, works without config) ---
const firebaseConfig = (() => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error('Failed to parse __firebase_config', e);
  }
  if (typeof window !== 'undefined' && window.__firebase_config) {
    return window.__firebase_config;
  }
  console.warn('No firebase config found; Firestore features disabled');
  return null;
})();

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'yu1gi';
const adminUid = (() => {
  if (typeof __admin_uid !== 'undefined') return __admin_uid;
  if (typeof window !== 'undefined' && window.__admin_uid) return window.__admin_uid;
  return '';
})();

// --- Audio Synth Utility ---
const playSynth = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'kick') {
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'hihat') {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    noise.start(now);
    noise.stop(now + 0.1);
  } else if (type === 'bass') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.4);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'clap') {
    const bufferSize = ctx.sampleRate * 0.2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.8;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    noise.start(now);
    noise.stop(now + 0.2);
  } else if (type === 'sweep') {
    const bufferSize = ctx.sampleRate * 2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0, now + 1);
    noise.start(now);
    noise.stop(now + 1);
  } else if (type === 'drop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(10, now + 1.5);
    gain.gain.setValueAtTime(1, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);
    osc.start(now);
    osc.stop(now + 1.5);
  }
};

const App = () => {
  const [activeImg, setActiveImg] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [glitch, setGlitch] = useState(false);
  
  // States
  const [instaMode, setInstaMode] = useState('hidden'); 
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [chaosMode, setChaosMode] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [visualMode, setVisualMode] = useState('normal'); 
  const [showVisualControls, setShowVisualControls] = useState(false);
  const [isLooping, setIsLooping] = useState(false); // Sequencer State
  
  // FX States
  const [fxState, setFxState] = useState({
    crush: false,
    strobe: false,
    blur: false,
    invert: false,
    vhs: false
  });

  // Ticket Logic
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [ticketSettings, setTicketSettings] = useState({ code: "303", link: "#", active: true });

  // Mouse
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Admin
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newVenue, setNewVenue] = useState("");

  const [titleText, setTitleText] = useState("YU_GI");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";

  const images = [
    { id: 1, src: bg1 },
    { id: 2, src: bg2 },
    { id: 3, src: bg3 },
    { id: 4, src: bg4 }
  ];

  const videos = [
    v1,
    v2,
    v3,
    v4 
  ];

  const tracks = [
    { title: "MINZH 28 // YU_GI", duration: "LIVE", url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/bhvmduwsxgxl/minzh-28-yu_gi%23t%3D2%3A11&color=%23555555&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true" },
    { title: "BALADI EP (SET)", duration: "SET", url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/bhvmduwsxgxl/sets/baladi-ep&color=%23555555&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true" },
    { title: "LA MIMUNA", duration: "SINGLE", url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/bhvmduwsxgxl/la-mimuna&color=%23555555&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true" },
    { title: "BALADI", duration: "SINGLE", url: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/bhvmduwsxgxl/baladi&color=%23555555&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true" },
  ];

  // --- Effects ---

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Visual Mode Cycler (NO RED, just normal/bw)
  useEffect(() => {
    const modes = ['normal', 'normal', 'bw', 'normal', 'bw'];
    const interval = setInterval(() => {
      setVisualMode(modes[Math.floor(Math.random() * modes.length)]);
    }, 12000); 
    return () => clearInterval(interval);
  }, []);

  // Auth & Data
  useEffect(() => {
    if (!auth) {
      console.warn('No auth client; running without Firestore auth');
      return;
    }
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u && !!adminUid && u.uid === adminUid);
      if (u) {
        setAuthStatus(u.uid === adminUid ? "מחובר כאדמין" : `מחובר (uid=${u.uid.substring(0,6)}...)`);
      } else {
        setAuthStatus("לא מחובר");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const unsubSchedule = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'events'), orderBy('timestamp', 'asc')), (s) => {
      setSchedule(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main'), (s) => {
      if (s.exists()) setTicketSettings(s.data());
      else setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main'), { code: "303", link: "https://google.com", active: true });
    });
    return () => { unsubSchedule(); unsubSettings(); };
  }, [user]);

  // Entrance Scramble
  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setTitleText(prev => prev.split("").map((letter, index) => {
        if (index < iterations) return "YU_GI"[index];
        return letters[Math.floor(Math.random() * 26)];
      }).join(""));
      if (iterations >= 5) clearInterval(interval);
      iterations += 1 / 3;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPlaying || chaosMode) return;
    const interval = setInterval(() => setActiveImg(prev => (prev + 1) % images.length), 8000);
    return () => clearInterval(interval);
  }, [isPlaying, chaosMode]);

  useEffect(() => {
    const interval = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 200); }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Instagram Popup Timing - FASTER (5s)
  useEffect(() => {
    if (instaMode === 'hidden') {
      const t = setTimeout(() => { if (!showContactMenu) setInstaMode('popup'); }, 5000);
      return () => clearTimeout(t);
    } else if (instaMode === 'popup') {
      const t = setTimeout(() => setInstaMode('button'), 8000);
      return () => clearTimeout(t);
    }
  }, [instaMode, showContactMenu]);

  // Chaos & Mixer - EARLIER (12s start, 2s later mixer)
  useEffect(() => {
    const t = setTimeout(() => setChaosMode(true), 12000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (chaosMode) {
      const t = setTimeout(() => {
        setShowMixer(true);
        triggerSound('kick', 'invert'); // Auto-kick intro
      }, 2000); // 2s after chaos start
      return () => clearTimeout(t);
    }
  }, [chaosMode]);

  // SEQUENCER / LOOP LOGIC (8 Beats Loop)
  useEffect(() => {
    let seqInterval;
    let step = 0;
    
    if (isLooping && showMixer) {
      seqInterval = setInterval(() => {
        // Simple Techno Pattern
        if (step === 0) triggerSound('kick', 'invert');
        if (step === 2) triggerSound('hihat', 'crush');
        if (step === 3) triggerSound('bass', 'blur');
        if (step === 4) { triggerSound('kick', 'invert'); triggerSound('clap', 'strobe'); }
        if (step === 6) triggerSound('hihat', 'crush');
        if (step === 7) triggerSound('bass', 'blur');

        step = (step + 1) % 8;
      }, 250); // Speed
    }

    return () => clearInterval(seqInterval);
  }, [isLooping, showMixer]);

  useEffect(() => {
    const mm = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mm);
    return () => window.removeEventListener("mousemove", mm);
  }, []);

  // Handlers
  const handleNextTrack = () => setCurrentTrack((prev) => (prev + 1) % tracks.length);
  const handlePrevTrack = () => setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  const toggleFx = (fx) => setFxState(prev => ({ ...prev, [fx]: !prev[fx] }));
  
  // Smart Trigger (Sound + Visual FX)
  const triggerSound = (soundType, visualType) => {
    playSynth(soundType);
    
    // Trigger specific visual FX momentarily
    let duration = 100;
    if (visualType === 'blur' || visualType === 'vhs') duration = 500; // Longer for atmospheric
    if (visualType === 'strobe' || visualType === 'invert' || visualType === 'crush') duration = 80; // Snappy for hits

    if (visualType) {
      setFxState(prev => ({ ...prev, [visualType]: true }));
      setTimeout(() => setFxState(prev => ({ ...prev, [visualType]: false })), duration); 
    }
  };

  const checkSecretCode = (e) => {
    e.preventDefault();
    if (inputCode === ticketSettings.code) setIsUnlocked(true);
    else { alert("INVALID CODE"); setInputCode(""); }
  };

  const handleAdminUpdateSettings = async () => {
    if (!user || !isAdmin || !db) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main'), ticketSettings);
      alert("SETTINGS UPDATED");
    } catch (err) {
      console.error(err);
      alert("FAILED TO UPDATE SETTINGS");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) return;
    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      if (adminUid && cred.user.uid !== adminUid) {
        alert("ACCESS DENIED (UID mismatch)");
        await signOut(auth);
        setAuthStatus("UID mismatch");
        return;
      }
      setShowAdminLogin(false);
      setAdminEmail("");
      setAdminPassword("");
      setIsAdmin(true);
      setAuthStatus("מחובר כאדמין");
    } catch (err) {
      console.error(err);
      setAuthStatus("כניסה נכשלה");
      alert("LOGIN FAILED");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!user || !isAdmin || !newDate || !newCity || !newVenue || !db) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'events'), { date: newDate, city: newCity, venue: newVenue, timestamp: serverTimestamp() });
      setNewDate(""); setNewCity(""); setNewVenue("");
    } catch (err) {
      console.error(err);
      alert("FAILED TO SAVE EVENT");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!user || !isAdmin || !db) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', id));
    } catch (err) {
      console.error(err);
      alert("FAILED TO DELETE EVENT");
    }
  };

  const getContainerFilters = () => {
    let filters = [];
    if (fxState.blur) filters.push("blur(4px)");
    if (fxState.crush) filters.push("contrast(200%) grayscale(100%)");
    if (fxState.invert) filters.push("invert(100%)");
    if (fxState.vhs) filters.push("sepia(50%) hue-rotate(90deg)");
    
    // Atmosphere Moods
    if (visualMode === 'bw') filters.push("grayscale(100%) contrast(120%)");
    
    return filters.join(" ");
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden relative selection:bg-white selection:text-black cursor-none ${fxState.strobe ? 'animate-strobe' : ''}`} style={{ filter: getContainerFilters(), transition: 'filter 0.5s ease-out' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Space+Grotesk:wght@300;400;500&display=swap');
          .font-display { font-family: 'Syncopate', sans-serif; }
          .font-body { font-family: 'Space Grotesk', sans-serif; }
          
          ::-webkit-scrollbar { width: 2px; }
          ::-webkit-scrollbar-track { background: #111; }
          ::-webkit-scrollbar-thumb { background: #555; }

          @keyframes strobe { 0% { background-color: #050505; } 50% { background-color: #555; } 100% { background-color: #050505; } }
          .animate-strobe { animation: strobe 0.08s infinite; }

          /* Red Laser Cursor */
          .cursor-dot {
            position: fixed; top: 0; left: 0; width: 6px; height: 6px; 
            background-color: #ff003c; border-radius: 50%; 
            pointer-events: none; z-index: 9999; transform: translate(-50%, -50%);
            box-shadow: 0 0 10px #ff003c, 0 0 20px #ff003c, 0 0 40px #ff003c;
          }
          
          .modal-pop { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes popIn { from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
          
          .button-slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          /* Entrance Title FX */
          .title-color-split {
             text-shadow: 2px 2px 0px #ff003c, -2px -2px 0px #00f0ff;
             animation: shiftColor 3s infinite alternate;
          }
          @keyframes shiftColor { from { text-shadow: 2px 2px 0px #ff003c, -2px -2px 0px #00f0ff; } to { text-shadow: -2px 2px 0px #ff003c, 2px -2px 0px #00f0ff; } }

          .deck-enter { animation: fadeDeck 1s ease forwards; }
          @keyframes fadeDeck { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          
          /* Circular Mixer Animations */
          .spin-slow { animation: spin 10s linear infinite; }
          .spin-fast { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}
      </style>

      <div className="cursor-dot hidden md:block" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505] z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505] z-10"></div>
        <img src={images[activeImg].src} alt="Atmosphere" className={`w-full h-full object-cover transition-all duration-[5000ms] ease-in-out grayscale brightness-75 scale-105 ${chaosMode ? 'opacity-0' : 'opacity-100'}`} />
        {chaosMode && (
          <div className="absolute inset-0 z-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            {videos.map((vid, idx) => (
              <div key={idx} className="relative w-full h-full overflow-hidden border border-black/50 grayscale opacity-60 mix-blend-screen">
                <video src={vid} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-50 h-screen w-full p-4 md:p-8 pt-16 md:pt-20 flex flex-col justify-between max-w-[1920px] mx-auto pointer-events-none">
        
        {/* --- POPUPS (Pointer Events Auto) --- */}
        <div className="pointer-events-auto">
          {showSecretModal && (
            <>
               <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]" onClick={() => setShowSecretModal(false)}></div>
               <div className="modal-pop fixed top-1/2 left-1/2 z-[120] w-[300px] bg-black border border-red-900/40 p-6 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-2 text-red-600"><Lock size={16} /><span className="font-display text-xs tracking-widest">CLOSE CIRCLE</span></div>
                     <button onClick={() => setShowSecretModal(false)}><X size={16} className="text-gray-500 hover:text-white"/></button>
                  </div>
                  {!isUnlocked ? (
                    <form onSubmit={checkSecretCode} className="flex flex-col gap-4">
                       <p className="font-body text-[10px] text-gray-400 uppercase">למקורבים בלבד / RESTRICTED</p>
                       <input type="password" autoFocus value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="XXX" className="bg-white/5 border border-white/10 p-3 text-center text-xl font-display tracking-[0.5em] text-white focus:border-red-600 outline-none" />
                       <button type="submit" className="bg-white text-black font-display text-xs py-3 hover:bg-gray-200">UNLOCK</button>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 text-center">
                       <div className="text-green-500 font-display text-xl tracking-widest mb-2">ACCESS APPROVED</div>
                       <p className="font-body text-xs text-gray-400 mb-4">SECRET RAVE / DEC 31 / UNDISCLOSED LOCATION</p>
                       <a href={ticketSettings.link} target="_blank" rel="noreferrer" className="bg-red-600 text-white font-display text-xs py-3 hover:bg-red-500 animate-pulse block">PURCHASE TICKET</a>
                    </div>
                  )}
               </div>
            </>
          )}

          {instaMode === 'popup' && (
            <>
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={() => setInstaMode('button')}></div>
              <div className="modal-pop fixed top-1/2 left-1/2 z-[100] w-[320px] md:w-[400px] bg-[#0a0a0a] border border-white/20 shadow-2xl flex flex-col">
                 <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#111]">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                         <div className="w-full h-full bg-black rounded-full overflow-hidden"><img src={images[1].src} alt="Profile" className="w-full h-full object-cover" /></div>
                      </div>
                      <div><h3 className="font-display text-xs font-bold tracking-widest text-white">YU_GI</h3><p className="font-body text-[10px] text-gray-400">Underground Techno</p></div>
                   </div>
                   <button onClick={() => setInstaMode('button')} className="text-gray-500 hover:text-white"><X size={16} /></button>
                 </div>
                 <div className="grid grid-cols-3 gap-0.5 bg-[#050505] p-0.5 h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none"><span className="font-display text-xs tracking-widest text-white border border-white px-2 py-1">VIEW FEED</span></div>
                    {[0, 2, 3, 2, 3, 0, 3, 0, 2].map((imgIdx, i) => (<img key={i} src={images[imgIdx].src} className="w-full h-full object-cover aspect-square opacity-80 hover:opacity-100 transition-opacity" />))}
                 </div>
                 <a href="https://www.instagram.com/yu__gi__/" target="_blank" rel="noopener noreferrer" onClick={() => setInstaMode('button')} className="p-4 bg-[#0a0a0a] border-t border-white/10 flex justify-center hover:bg-[#111] transition-colors group">
                   <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 text-xs font-bold tracking-widest hover:bg-blue-500 transition-colors rounded-sm w-full justify-center"><Instagram size={14} /> FOLLOW</button>
                 </a>
              </div>
            </>
          )}

          {showContactMenu && (
            <>
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]" onClick={() => setShowContactMenu(false)}></div>
              <div className="modal-pop fixed top-1/2 left-1/2 z-[100] w-[300px] bg-[#0a0a0a] border border-white/20 p-6 flex flex-col gap-4">
                 <div className="flex justify-between items-center border-b border-white/10 pb-4"><span className="font-display text-sm tracking-[0.2em] text-white">SELECT CONTACT</span><button onClick={() => setShowContactMenu(false)} className="text-gray-500 hover:text-white"><X size={16} /></button></div>
                 <div className="flex flex-col gap-3">
                    <a href="https://wa.me/972502207764" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/5 border border-white/10 p-4 hover:bg-white hover:text-black hover:border-white transition-all group"><div className="flex items-center gap-3"><UserCheck size={18} className="text-gray-400 group-hover:text-black" /><div className="flex flex-col"><span className="font-display text-[10px] tracking-widest">MANAGER</span><span className="font-mono text-[9px] opacity-60">050-220-7764</span></div></div><ArrowUpRight size={14} /></a>
                    <a href="https://wa.me/972509933199" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/5 border border-white/10 p-4 hover:bg-white hover:text-black hover:border-white transition-all group"><div className="flex items-center gap-3"><User size={18} className="text-gray-400 group-hover:text-black" /><div className="flex flex-col"><span className="font-display text-[10px] tracking-widest">ARTIST</span><span className="font-mono text-[9px] opacity-60">050-993-3199</span></div></div><ArrowUpRight size={14} /></a>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* --- HEADER --- */}
        <header className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-start w-full pointer-events-auto px-4 md:px-8 pt-4 md:pt-6 max-w-[1920px] mx-auto">
           <div className="flex flex-col">
             <div className="font-body text-[10px] md:text-xs tracking-widest text-gray-500 uppercase flex items-center gap-2">
               <span>Est. 2024 / Audio Visual</span>
               <span className="text-red-500 border-l border-white/10 pl-2">SESSION: {formatTime(sessionTime)}</span>
               {isAdmin && <span className="text-red-500 font-bold border border-red-500 px-1 text-[8px]">ADMIN MODE</span>}
             </div>
           </div>
           <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 ${isAdmin ? 'bg-red-500' : 'bg-red-500'} animate-pulse`}></div>
             <span className="font-display text-[10px] tracking-widest text-gray-400">REC</span>
           </div>
        </header>

        {/* --- CIRCULAR MIXER (AUDIO DECK) --- */}
        {showMixer && (
          <div className="fixed inset-x-0 top-24 md:top-[18%] flex justify-center z-40 pointer-events-auto deck-enter px-4">
             
             {/* Main Plate */}
             <div className="relative w-72 h-72 md:w-96 md:h-96 bg-black/95 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_80px_rgba(255,0,60,0.15)] flex items-center justify-center group">
                
                {/* Decorative Rings */}
                <div className={`absolute inset-2 rounded-full border border-white/5 border-t-white/20 ${isLooping ? 'spin-fast' : 'spin-slow'}`}></div>
                <div className={`absolute inset-10 rounded-full border border-white/5 border-b-red-500/20 ${isLooping ? 'spin-fast' : 'spin-slow'}`} style={{ animationDirection: 'reverse' }}></div>

                {/* Close Button (Top Right Outside) */}
                <button onClick={() => { setShowMixer(false); setChaosMode(false); setIsLooping(false); }} className="absolute -top-8 -right-8 bg-black border border-white/20 text-white hover:text-red-500 rounded-full p-2 z-50">
                   <X size={16} />
                </button>

                {/* Visual Toggle (Left Outside) */}
                <button onClick={() => setShowVisualControls(!showVisualControls)} className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors z-50">
                   {showVisualControls ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                {/* LOOP Toggle (Right Outside) */}
                <button onClick={() => setIsLooping(!isLooping)} className={`absolute right-[-40px] top-1/2 transform -translate-y-1/2 transition-colors z-50 p-2 rounded-full border ${isLooping ? 'text-red-500 border-red-500 bg-red-900/20' : 'text-gray-500 border-gray-700 hover:text-white'}`}>
                   <Repeat size={20} className={isLooping ? 'animate-spin' : ''} />
                </button>

                {/* --- AUDIO BUTTONS LAYOUT --- */}
                
                {/* CENTER: KICK (INVERT) */}
                <button 
                  onClick={() => triggerSound('kick', 'invert')} 
                  className="relative z-10 w-28 h-28 bg-[#111] rounded-full border-2 border-red-500/30 hover:border-red-500 hover:bg-red-900/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.1)]"
                >
                   <span className="font-display text-xl tracking-widest text-white font-bold">KICK</span>
                   <span className="text-[9px] text-red-500 font-mono mt-1">INVERT</span>
                </button>

                {/* SURROUNDING BUTTONS (Clockwise) */}
                
                {/* Top: CLAP (STROBE) */}
                <button onClick={() => triggerSound('clap', 'strobe')} className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-black border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex flex-col items-center justify-center active:scale-95">
                   <span className="font-display text-[9px] font-bold">CLAP</span><span className="text-[7px] opacity-60">STROBE</span>
                </button>

                {/* Top Right: HIHAT (CRUSH) */}
                <button onClick={() => triggerSound('hihat', 'crush')} className="absolute top-16 right-10 w-14 h-14 bg-black border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex flex-col items-center justify-center active:scale-95">
                   <span className="font-display text-[8px] font-bold">HIHAT</span><span className="text-[6px] opacity-60">CRUSH</span>
                </button>

                {/* Bottom Right: SWEEP (VHS) */}
                <button onClick={() => triggerSound('sweep', 'vhs')} className="absolute bottom-16 right-10 w-14 h-14 bg-black border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex flex-col items-center justify-center active:scale-95">
                   <span className="font-display text-[8px] font-bold">SWEEP</span><span className="text-[6px] opacity-60">VHS</span>
                </button>

                {/* Bottom: DROP (BLUR) */}
                <button onClick={() => triggerSound('drop', 'blur')} className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-black border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex flex-col items-center justify-center active:scale-95">
                   <span className="font-display text-[9px] font-bold">DROP</span><span className="text-[7px] opacity-60">BLUR</span>
                </button>

                {/* Left: BASS (BLUR) */}
                <button onClick={() => triggerSound('bass', 'blur')} className="absolute left-10 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-black border border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all flex flex-col items-center justify-center active:scale-95">
                   <span className="font-display text-[8px] font-bold">BASS</span><span className="text-[6px] opacity-60">BLUR</span>
                </button>

             </div>

             {/* Hidden Visual Deck (Revealable) */}
             {showVisualControls && (
                <div className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 bg-black/90 border border-white/20 p-2 rounded-lg flex gap-2">
                   {['CRUSH', 'STROBE', 'INVERT', 'BLUR'].map(fx => (
                      <button key={fx} onClick={() => toggleFx(fx.toLowerCase())} className={`h-8 px-2 border ${fxState[fx.toLowerCase()] ? 'bg-white text-black' : 'border-white/20 text-gray-500'} text-[8px] font-display tracking-widest hover:border-white transition-colors`}>
                         {fx}
                      </button>
                   ))}
                </div>
             )}
          </div>
        )}

        {/* --- HERO TITLE --- */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full z-0 transition-all duration-1000">
          <h1 className={`font-display text-[15vw] md:text-[12vw] font-bold tracking-tighter leading-[0.8] mix-blend-overlay opacity-80 select-none ${glitch || chaosMode ? 'glitch-active glitch-text' : 'title-color-split'}`} data-text={titleText}>
            {titleText}
          </h1>
          <p className="font-body text-sm md:text-lg tracking-[0.5em] text-gray-400 mt-4 uppercase opacity-60">Underground Resistance</p>
        </div>

        {/* --- FOOTER / CONTROLS --- */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end w-full z-10 pointer-events-auto">
          
          {/* LEFT: Contact & Ticket */}
          <div className="flex flex-col items-start gap-3 order-3 md:order-1">
             <div className="flex items-center gap-2 w-full md:w-auto">
               <button onClick={() => setShowContactMenu(true)} className="flex-grow group flex items-center gap-3 px-4 py-3 border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 text-left">
                 <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                 <div className="flex flex-col items-start"><span className="font-display text-[10px] tracking-widest">BOOKING</span></div>
                 <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
               </button>
               <button onClick={() => setShowSecretModal(true)} className="h-full w-16 px-4 border border-white/20 bg-black/40 backdrop-blur-md hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300"><Ticket size={24} /></button>
             </div>
             
             {instaMode === 'button' && (
               <a href="https://www.instagram.com/yu__gi__/" target="_blank" rel="noopener noreferrer" className="button-slide-in group flex items-center gap-3 px-5 py-3 border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 w-full md:w-auto text-left">
                 <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                 <div className="flex flex-col items-start"><span className="font-display text-[10px] tracking-widest">FOLLOW</span><span className="font-body text-[9px] text-gray-400 group-hover:text-black/60 uppercase tracking-wide">@YU__GI__</span></div><ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
               </a>
             )}

             <div className="mt-2 relative w-full max-w-xs">
               {!isAdmin && !showAdminLogin && (
                 <button onClick={() => setShowAdminLogin(true)} className="opacity-20 hover:opacity-100 transition-opacity text-gray-500">
                   <Lock size={12} />
                 </button>
               )}

               {showAdminLogin && !isAdmin && (
                 <form onSubmit={handleLogin} className="flex flex-col gap-2 bg-black/80 p-2 border border-red-900/50">
                   <div className="flex items-center gap-2">
                     <Key size={12} className="text-red-500" />
                     <input
                       type="email"
                       value={adminEmail}
                       onChange={(e) => setAdminEmail(e.target.value)}
                       placeholder="admin email"
                       className="flex-1 bg-transparent border-b border-white/20 text-[10px] text-white focus:outline-none font-mono"
                       autoFocus
                     />
                   </div>
                   <div className="flex items-center gap-2">
                     <Key size={12} className="text-red-500" />
                     <input
                       type="password"
                       value={adminPassword}
                       onChange={(e) => setAdminPassword(e.target.value)}
                       placeholder="password"
                       className="flex-1 bg-transparent border-b border-white/20 text-[10px] text-white focus:outline-none font-mono"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <button type="submit" className="text-[10px] text-red-500 hover:text-white px-1">{'>'} LOGIN</button>
                     <button type="button" onClick={() => setShowAdminLogin(false)}><X size={10} className="text-gray-500"/></button>
                   </div>
                   {authStatus && <div className="text-[9px] text-gray-400 mt-1">{authStatus}</div>}
                 </form>
               )}
               
               {isAdmin && ( 
                 <div className="flex flex-col items-start gap-1">
                    <button
                      onClick={async () => { setIsAdmin(false); if (auth) await signOut(auth); }}
                      className="text-[9px] text-red-500 font-mono hover:underline"
                    >
                      LOGOUT
                    </button>
                    {authStatus && <div className="text-[9px] text-gray-400 mb-1">{authStatus}</div>}
                    <div className="bg-red-900/10 p-2 border border-red-500/20 w-full">
                      <span className="text-[8px] text-red-500 block mb-1">SECRET CODE & LINK</span>
                      <input className="w-full bg-transparent border-b border-red-500/30 text-[9px] mb-1" value={ticketSettings.code} onChange={e => setTicketSettings({...ticketSettings, code: e.target.value})} placeholder="CODE" />
                      <input className="w-full bg-transparent border-b border-red-500/30 text-[9px] mb-1" value={ticketSettings.link} onChange={e => setTicketSettings({...ticketSettings, link: e.target.value})} placeholder="LINK" />
                      <button onClick={handleAdminUpdateSettings} className="bg-red-500 text-black text-[8px] px-1 w-full">UPDATE</button>
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* CENTER: Player */}
          <div className="flex justify-center w-full order-1 md:order-2">
            <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-1 shadow-2xl relative flex flex-col gap-1">
              <div className={`absolute bottom-[102%] left-0 w-full bg-[#0a0a0a] border border-white/10 transition-all duration-300 overflow-hidden ${showPlaylist ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                {tracks.map((track, idx) => ( <div key={idx} onClick={() => { setCurrentTrack(idx); setShowPlaylist(false); }} className={`p-3 flex justify-between items-center cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors ${currentTrack === idx ? 'text-red-500' : 'text-gray-400'}`}><span className="font-body text-[10px] uppercase tracking-wider truncate">{track.title}</span>{currentTrack === idx && <Activity size={12} className="animate-pulse" />}</div> ))}
              </div>
              <div className="flex items-center gap-0 h-14 border-b border-white/5">
                <button onClick={() => setShowPlaylist(!showPlaylist)} className="h-full px-4 border-r border-white/10 hover:bg-white/5 transition-colors flex flex-col justify-center items-center gap-1 min-w-[60px]"><List size={16} /><span className="text-[8px] font-display uppercase tracking-widest text-gray-500">List</span></button>
                <div className="flex-grow px-4 flex flex-col justify-center h-full overflow-hidden bg-black/20"><span className="text-[9px] text-gray-500 font-display tracking-widest mb-0.5">NOW PLAYING</span><div className="overflow-hidden relative w-full"><span className="font-body text-xs md:text-sm uppercase whitespace-nowrap text-white/90">{tracks[currentTrack].title}</span></div></div>
                <div className="h-full w-14 border-l border-white/10 relative overflow-hidden group bg-black">
                   <iframe width="100%" height="100%" scrolling="no" frameBorder="no" allow="autoplay" src={tracks[currentTrack].url} className="absolute inset-0 w-[300px] h-[300px] -top-10 -left-10 opacity-30 grayscale group-hover:opacity-80 transition-opacity pointer-events-none"></iframe>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Disc size={20} className={`text-white/20 ${isPlaying ? 'animate-spin' : ''}`} /></div>
                </div>
              </div>
              <div className="h-10 flex items-center justify-between px-2 bg-[#111]">
                <button onClick={handlePrevTrack} className="flex-1 flex justify-center items-center text-gray-500 hover:text-white transition-colors h-full hover:bg-white/5 active:scale-95"><SkipBack size={16} /></button>
                <div className="w-px h-4 bg-white/10"></div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="flex-1 flex justify-center items-center text-white hover:text-red-500 transition-colors h-full hover:bg-white/5 active:scale-95">{isPlaying ? <Pause size={16} fill="currentColor" className="opacity-80"/> : <Play size={16} fill="currentColor"/>}</button>
                <div className="w-px h-4 bg-white/10"></div>
                <button onClick={handleNextTrack} className="flex-1 flex justify-center items-center text-gray-500 hover:text-white transition-colors h-full hover:bg-white/5 active:scale-95"><SkipForward size={16} /></button>
              </div>
            </div>
          </div>

          {/* RIGHT: Schedule */}
          <div className="flex flex-col items-end gap-2 order-2 md:order-3 w-full md:w-auto">
             <div className="font-display text-[10px] tracking-[0.2em] text-gray-500 border-b border-gray-800 pb-1 mb-2 w-full text-right">TOUR DATES</div>
             {isAdmin && ( <form onSubmit={handleAddEvent} className="flex flex-col items-end gap-1 mb-4 bg-red-900/10 p-2 border border-red-900/30 w-full"><input placeholder="DATE (24.12)" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-transparent border-b border-red-500/30 text-right text-[10px] text-white w-full outline-none focus:border-red-500" /><input placeholder="CITY" value={newCity} onChange={e => setNewCity(e.target.value)} className="bg-transparent border-b border-red-500/30 text-right text-[10px] text-white w-full outline-none focus:border-red-500" /><input placeholder="VENUE" value={newVenue} onChange={e => setNewVenue(e.target.value)} className="bg-transparent border-b border-red-500/30 text-right text-[10px] text-white w-full outline-none focus:border-red-500" /><button type="submit" className="flex items-center gap-1 text-[9px] bg-red-600 text-white px-2 py-1 mt-1 hover:bg-red-500"><Plus size={10} /> ADD EVENT</button></form> )}
             <div className="flex flex-col gap-3 w-full max-h-[30vh] overflow-y-auto custom-scrollbar">
                {schedule.length === 0 && <div className="text-right text-[9px] text-gray-600">NO UPCOMING DATES ANNOUNCED</div>}
                {schedule.map((item) => ( <div key={item.id} className="flex justify-end items-center gap-3 group">{isAdmin && <button onClick={() => handleDeleteEvent(item.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}<div className="text-right cursor-default" ><div className="font-display text-sm md:text-base text-gray-300 group-hover:text-white transition-colors">{item.city} <span className="text-gray-600 mx-1">/</span> {item.venue}</div><div className="font-mono text-[9px] text-gray-600">{item.date}</div></div></div> ))}
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
