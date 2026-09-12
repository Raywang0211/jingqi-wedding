const STORAGE_KEY = 'jingqiWeddingApp_v1';
const defaultData = { memo:'', myFlights:[] };
let data;
try { data = {...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; } catch { data = structuredClone(defaultData); }
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };

const MAP_POINTS = [
  { target:'card-s1', label:'1', name:'大三巴牌坊 & 戀愛巷', x:414, y:575, kind:'spot' },
  { target:'card-s2', label:'2', name:'議事亭前地', x:414, y:741, kind:'spot' },
  { target:'card-s3', label:'3', name:'澳門旅遊塔', x:348, y:1240, kind:'spot' },
  { target:'card-s4', label:'4', name:'東望洋燈塔 & 松山纜車', x:780, y:727, kind:'spot' },
  { target:'card-s5', label:'5', name:'主教山', x:245, y:1006, kind:'spot' },
  { target:'card-s6', label:'6', name:'媽閣廟', x:66, y:1149, kind:'spot' },
  { target:'card-f1', label:'A', name:'粵匠茶餐廳', x:731, y:210, kind:'food' },
  { target:'card-f2', label:'B', name:'新鴻發茶餐廳', x:614, y:445, kind:'food' },
  { target:'card-f3', label:'C', name:'Blooom Coffee House', x:578, y:685, kind:'food' },
  { target:'card-f4', label:'D', name:'Dino漢堡', x:666, y:571, kind:'food' },
  { target:'card-f5', label:'F', name:'澳門世記咖啡', x:569, y:963, kind:'food' },
  { target:'card-f6', label:'G', name:'Brew Lab', x:339, y:785, kind:'food' },
  { target:'card-f7', label:'H', name:'momokawa coffee', x:378, y:895, kind:'food' },
  { target:'card-hotel', label:null, name:'澳門雅辰酒店', x:916, y:915, kind:'hotel' }
];
function renderMapPins(){
  const g = document.getElementById('mapPins');
  if (!g) return;
  g.innerHTML = MAP_POINTS.map(p=>{
    const label = p.kind === 'hotel' ? `${p.name}（飯店）` : `${p.label} · ${p.name}`;
    return `<g class="map-pin" data-target="${p.target}" style="cursor:pointer">
      <circle cx="${p.x}" cy="${p.y}" r="22" fill="transparent" />
      <title>${label}</title>
    </g>`;
  }).join('');
}
function renderMapLegend(){
  const el = document.getElementById('mapLegendList');
  if (!el) return;
  el.innerHTML = MAP_POINTS.filter(p=>p.kind !== 'hotel').map(p=>{
    const color = p.kind === 'spot' ? '#B23A32' : '#8B6142';
    return `<button type="button" class="map-pin flex items-center gap-2 text-left" data-target="${p.target}">
      <span class="shrink-0 inline-flex items-center justify-center rounded-full text-white text-[11px] font-semibold w-5 h-5" style="background:${color}">${p.label}</span>
      <span class="text-stone-600 hover:text-ink transition">${p.name}</span>
    </button>`;
  }).join('');
}
function highlightCard(id){
  const el = document.getElementById(id);
  if (!el) return;
  const targetPage = el.closest('.page');
  if (targetPage && !targetPage.classList.contains('active')) switchPage(targetPage.id);
  setTimeout(()=>{
    el.scrollIntoView({ behavior:'smooth', block:'center' });
    el.classList.add('map-card-highlight');
    setTimeout(()=>el.classList.remove('map-card-highlight'), 1800);
  }, targetPage && !targetPage.classList.contains('active') ? 300 : 0);
}
document.addEventListener('click', e=>{
  const pin = e.target.closest('.map-pin');
  if (pin) highlightCard(pin.dataset.target);
});
renderMapPins();
renderMapLegend();

function switchPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active', p.id===id));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===id));
  document.querySelectorAll('.desktop-tab').forEach(b=>{ const on=b.dataset.page===id; b.classList.toggle('bg-moss',on); b.classList.toggle('text-white',on); b.classList.toggle('text-stone-500',!on); });
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>switchPage(b.dataset.page)));

const memo = document.getElementById('memo'), memoStatus=document.getElementById('memoStatus');
memo.value=data.memo || '';
let statusTimer;
memo.addEventListener('input',()=>{ data.memo=memo.value; save(); memoStatus.classList.remove('opacity-0'); clearTimeout(statusTimer); statusTimer=setTimeout(()=>memoStatus.classList.add('opacity-0'),1400); });

const weddingEvent = {
  title: '菁騏婚禮',
  start: '20270123T160000',
  end: '20270123T213000',
  location: '澳門雅辰酒店',
  description: '16:00 麻將間入席\\n18:00 賓客入席\\n18:30 婚宴開席\\n21:30 送客合影'
};
document.getElementById('addToGoogleCal').addEventListener('click', () => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: weddingEvent.title,
    dates: `${weddingEvent.start}/${weddingEvent.end}`,
    details: weddingEvent.description.replace(/\\n/g, '\n'),
    location: weddingEvent.location,
    ctz: 'Asia/Macau'
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
});
document.getElementById('addToAppleCal').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Jingqi Wedding//Wedding Trip//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:jingqi-wedding-${Date.now()}@wedding-trip`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
    `DTSTART:${weddingEvent.start}`,
    `DTEND:${weddingEvent.end}`,
    `SUMMARY:${weddingEvent.title}`,
    `LOCATION:${weddingEvent.location}`,
    `DESCRIPTION:${weddingEvent.description}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar;charset=utf-8'}));
  link.download = 'jingqi-wedding.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

const FLIGHTS = [
  { airline:'星宇航空', code:'JX201', depart:'07:50', arrive:'09:45', from:'桃園', to:'澳門', link:'https://www.starlux-airlines.com/zh-TW' },
  { airline:'澳門航空', code:'NX631', depart:'09:10', arrive:'11:00', from:'桃園', to:'澳門', link:'https://www.airmacau.com.mo/' },
  { airline:'長榮航空', code:'BR801', depart:'10:00', arrive:'11:50', from:'桃園', to:'澳門', link:'https://www.evaair.com/zh-tw/' }
];
const flightList=document.getElementById('flightList');
function renderFlights(){
  flightList.innerHTML = FLIGHTS.map((f,i)=>`
    <div class="bg-white/70 rounded-2xl border border-white overflow-hidden">
      <button type="button" data-toggle="${i}" class="w-full flex items-center justify-between gap-2 p-3 text-left">
        <div class="flex items-center gap-2">
          <div><p class="text-sm font-serif">${f.depart}</p><p class="text-[10px] text-stone-400">${f.from}</p></div>
          <i class="fa-solid fa-plane text-xs text-stone-300"></i>
          <div><p class="text-sm font-serif">${f.arrive}</p><p class="text-[10px] text-stone-400">${f.to}</p></div>
        </div>
        <div class="flex items-center gap-2"><p class="text-xs font-medium text-ink">${f.airline}</p><i class="fa-solid fa-chevron-down text-[10px] text-stone-400 transition-transform" data-chevron="${i}"></i></div>
      </button>
      <div class="hidden px-3 pb-3" data-detail="${i}">
        <div class="border-t border-line/70 pt-3 flex items-center justify-between gap-2 text-xs text-stone-500">
          <span>${f.airline} · ${f.code}</span>
          <a href="${f.link}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-moss text-white px-3 py-1.5 text-xs whitespace-nowrap">前往官網訂票 <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>
        </div>
      </div>
    </div>
  `).join('');
  flightList.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const i=btn.dataset.toggle;
      flightList.querySelector(`[data-detail="${i}"]`).classList.toggle('hidden');
      flightList.querySelector(`[data-chevron="${i}"]`).classList.toggle('rotate-180');
    });
  });
}
renderFlights();

const myFlightList = document.getElementById('myFlightList');
function renderMyFlights(){
  if (!data.myFlights.length){ myFlightList.innerHTML = '<p class="text-sm text-stone-400 text-center py-4">尚未加入航班，點右上角「新增航班」開始加入。</p>'; return; }
  myFlightList.innerHTML = data.myFlights.map((f,i)=>`
    <div class="bg-rice rounded-2xl p-4 border border-line">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div><p class="text-lg font-serif">${formatFlightDT(f.depart)}</p><p class="text-[10px] text-stone-400">${escapeHtml(f.from||'出發')}</p></div>
          <i class="fa-solid fa-plane text-xs text-stone-300"></i>
          <div><p class="text-lg font-serif">${formatFlightDT(f.arrive)}</p><p class="text-[10px] text-stone-400">${escapeHtml(f.to||'抵達')}</p></div>
        </div>
        <button data-delete-flight="${i}" class="text-stone-300 hover:text-clay p-2 shrink-0" aria-label="刪除航班"><i class="fa-regular fa-trash-can"></i></button>
      </div>
      <div class="mt-2 pt-2 border-t border-line/70 text-xs text-stone-500">${escapeHtml(f.airline)}${f.number ? ' · ' + escapeHtml(f.number) : ''}</div>
    </div>
  `).join('');
  myFlightList.querySelectorAll('[data-delete-flight]').forEach(btn=>btn.addEventListener('click',()=>{
    if (confirm('要刪除這筆航班嗎？')){ data.myFlights.splice(Number(btn.dataset.deleteFlight),1); save(); renderMyFlights(); }
  }));
}
function escapeHtml(v=''){ const d=document.createElement('div'); d.textContent=String(v); return d.innerHTML; }
function formatFlightDT(v){
  if (!v) return '';
  const [datePart, timePart] = String(v).split('T');
  const parts = (datePart||'').split('-');
  if (parts.length !== 3) return escapeHtml(v);
  const [, m, d] = parts;
  return `${Number(m)}/${Number(d)} ${timePart||''}`;
}
renderMyFlights();

const flightModal = document.getElementById('flightModal'), flightForm = document.getElementById('flightForm');
function setFlightModal(show){ flightModal.classList.toggle('hidden',!show); flightModal.classList.toggle('flex',show); if (show) setTimeout(()=>flightForm.elements.airline.focus(),50); }
document.getElementById('addFlight').addEventListener('click',()=>setFlightModal(true));
document.getElementById('closeModal').addEventListener('click',()=>setFlightModal(false));
flightModal.addEventListener('click', e=>{ if (e.target === flightModal) setFlightModal(false); });
document.addEventListener('keydown', e=>{ if (e.key === 'Escape') setFlightModal(false); });
flightForm.addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(flightForm);
  data.myFlights.push(Object.fromEntries(fd.entries()));
  save(); renderMyFlights(); flightForm.reset(); setFlightModal(false);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
