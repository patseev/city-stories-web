// The itinerary and story catalogue share the selected day and visit marks.
let itinerary=null;
const planKey='city-stories-plan-v1';
let planState={steps:{},starts:{}};
try{const saved=JSON.parse(localStorage.getItem(planKey)||'null');if(saved&&typeof saved==='object'&&Number.isInteger(saved.day)&&saved.day>=24&&saved.day<=29)planState.day=saved.day;if(saved&&typeof saved==='object')for(const k of ['steps','starts'])if(saved[k]&&typeof saved[k]==='object'&&!Array.isArray(saved[k]))planState[k]=saved[k]}catch{}
const istanbulDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
window.planDay=planState.day||(/^2026-10-(24|25|26|27|28|29)$/.test(istanbulDate)?Number(istanbulDate.slice(-2)):24);
if(stories.length)render();
const routeModes={walking:'Пешком',driving:'Такси / авто',transit:'Общественный транспорт'};
function savePlan(){try{localStorage.setItem(planKey,JSON.stringify(planState))}catch{toast('Отметки доступны только до закрытия страницы. Хранилище браузера недоступно.')}}
function directions(s){const p=new URLSearchParams({api:'1',destination:s.place,travelmode:s.mode,dir_action:'navigate'});return 'https://www.google.com/maps/dir/?'+p.toString()}
function stepStatus(s){if(s.stories.length&&s.stories.every(id=>visited.has(id)))return 'done';if(planState.steps[s.id]==='skip')return 'skip';if(!s.stories.length&&planState.steps[s.id]==='done')return 'done';return 'pending'}
function selectedDay(){return itinerary.days.find(d=>d.day===window.planDay)}
function activeStep(d){const index=planState.starts[d.day];if(Number.isInteger(index)&&d.stops[index]){if(stepStatus(d.stops[index])==='pending')return index;const after=d.stops.findIndex((s,i)=>i>index&&stepStatus(s)==='pending');if(after>=0)return after;}return d.stops.findIndex(s=>stepStatus(s)==='pending')}
function stopStories(s){const ids=[...new Set([...s.stories,...(s.relatedStories||[])])];return ids.length?`<div class="stop-stories"><span class="stop-stories-label">Истории у этой остановки</span><div>${ids.map(id=>`<button class="stop-story-link" data-open="${id}"><span>${esc(stories.find(x=>x.id===id)?.title.split(':')[0]||'История')}</span><small>Читать историю ↗</small></button>`).join('')}</div></div>`:''}
function stopTitle(s){return s.primaryStory?`<button class="stop-title-link" data-open="${s.primaryStory}" aria-label="${esc(s.title)}: читать историю">${esc(s.title)} <span aria-hidden="true">↗</span></button>`:esc(s.title)}
function stopActions(s){return `${stopStories(s)}<div class="stop-actions"><a class="chip" href="${esc(directions(s))}" target="_blank" rel="noopener noreferrer">От меня до места ↗</a></div><div class="stop-manage"><button data-step="${s.id}" data-action="done">✓ ${s.stories.length?'Уже были':'Готово'}</button><button data-step="${s.id}" data-action="skip">Пропустить</button><button data-step="${s.id}" data-action="start">Начать отсюда</button></div>`}
function renderPlan(){
 if(!itinerary||!stories.length)return;
 const d=selectedDay(),active=activeStep(d),done=d.stops.filter(s=>stepStatus(s)==='done').length,skip=d.stops.filter(s=>stepStatus(s)==='skip').length;
 $('#day-plan').innerHTML=`<div class="plan-intro"><div><span class="eyebrow">${d.day} ОКТЯБРЯ · ${days.find(x=>x.day===d.day).week.toUpperCase()}</span><h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p></div><div class="plan-progress"><strong>${done}<small> / ${d.stops.length}</small></strong><span>остановок пройдено${skip?` · ${skip} пропущено`:''}</span></div></div>
 <div class="plan-meta"><span>План: ${d.stops[0].time.split('–')[0]} → ${d.stops.at(-1).time.split('–')[1]}</span><span>Бюджет: ${esc(d.budget)}</span></div>
 ${d.alert?`<aside class="plan-alert"><strong>${d.day===28?'Не пропустить паром':'Выезд в аэропорт'}</strong><p>${esc(d.alert)}</p></aside>`:''}
 <div class="plan-timeline">${d.stops.map((s,i)=>{const status=stepStatus(s);if(status!=='pending')return `<details class="completed-stop" id="stop-${s.id}"><summary><span class="stop-time">${s.time}</span><span>${status==='done'?'✓':'↷'} ${esc(s.title)}</span><small>${status==='done'?'Пройдено':'Пропущено'}</small></summary><p>${esc(s.note)}</p>${stopStories(s)}<button class="chip" data-step="${s.id}" data-action="undo">Вернуть в маршрут</button></details>`;return `<article class="plan-stop ${active===i?'current-stop':''}" id="stop-${s.id}"><div class="stop-time">${s.time}${s.fixed?'<small>Фиксировано в плане</small>':''}</div><div class="stop-main"><div class="stop-heading"><h4>${stopTitle(s)}</h4>${active===i?'<span class="next-label">СЛЕДУЮЩАЯ</span>':''}</div><p>${esc(s.note)}</p><div class="leg-label">${routeModes[s.mode]} · От вашего местоположения</div>${stopActions(s)}</div></article>`}).join('')}</div>
 <aside class="return-plan"><span class="eyebrow">${d.day===29?'ФИНИШ ПОЕЗДКИ':'ВОЗВРАЩЕНИЕ В ОТЕЛЬ'}</span><p>${esc(d.back)}</p>${d.day===28?`<a class="chip" href="${esc(directions({place:'Büyükada İskelesi Istanbul',mode:'walking'}))}" target="_blank" rel="noopener noreferrer">К причалу Бююкады ↗</a>`:''}<button class="chip" id="show-day-stories">Истории этого дня ↓</button></aside>`;
 $('#show-day-stories').onclick=()=>{setMode('day');$('#explore').scrollIntoView({behavior:'smooth'})};
 renderDays();
}
window.refreshPlan=renderPlan;
window.selectPlanDay=value=>{window.planDay=value;planState.day=value;savePlan();setMode('day');renderPlan();history.replaceState(null,'','#journey');$('#journey').scrollIntoView({behavior:'smooth'})};
$('#day-plan').addEventListener('click',e=>{
 const b=e.target.closest('[data-step]');if(!b||!itinerary)return;
 const d=selectedDay(),s=d.stops.find(x=>x.id===b.dataset.step);if(!s)return;
 const action=b.dataset.action,index=d.stops.indexOf(s);
 if(action==='start'){planState.starts[d.day]=index;toast('Следующая остановка выбрана. Остальные отметки сохранены.')}
 else{
  if(action==='done'){planState.steps[s.id]='done';s.stories.forEach(id=>visited.add(id))}
  if(action==='skip')planState.steps[s.id]='skip';
  if(action==='undo'){const wasDone=stepStatus(s)==='done';delete planState.steps[s.id];if(wasDone)s.stories.forEach(id=>visited.delete(id));planState.starts[d.day]=index}
  else planState.starts[d.day]=d.stops.findIndex((x,i)=>i>index&&stepStatus(x)==='pending');
  persist('city-stories-visited',visited);render();updateActions();
 }
 savePlan();renderPlan();
});
window.addEventListener('stories-ready',renderPlan);
fetch('itinerary.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{itinerary=data;renderPlan()}).catch(()=>{$('#day-plan').innerHTML='<p>Не удалось загрузить расписание. Обновите страницу.</p>'});
