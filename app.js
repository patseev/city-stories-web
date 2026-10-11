const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const days=[{day:24,week:'Суббота',name:'Первый вечер',area:'Каракёй'},{day:25,week:'Воскресенье',name:'Галата и Пера',area:'Башня, лестницы, трамвай'},{day:26,week:'Понедельник',name:'Вдоль Босфора',area:'Два берега пролива'},{day:27,week:'Вторник',name:'Старый город и Мода',area:'Султанахмет и Кадыкёй'},{day:28,week:'Среда',name:'На остров',area:'Бююкада и улица Чанкая'},{day:29,week:'Четверг',name:'Вылет',area:'Отель и аэропорт'}];
const mapNames=['Karaköy Istanbul','Kamondo Merdivenleri Istanbul','SALT Galata Istanbul','Galata Kulesi Istanbul','Pera Beyoğlu Istanbul','İstiklal Caddesi Istanbul','Ayasofya Istanbul','Sultanahmet Camii Istanbul','Sultanahmet Meydanı Istanbul','Theodosius Dikilitaşı Istanbul','Yılanlı Sütun Istanbul','Örme Dikilitaş Istanbul','Gülhane Parkı Istanbul','Gülhane Parkı Sarnıcı Istanbul','Topkapı Sarayı Istanbul','Sirkeci Garı Istanbul','Galata Köprüsü Istanbul','Büyük Mecidiye Camii Istanbul','15 Temmuz Şehitler Köprüsü Istanbul','Arnavutköy Beşiktaş Istanbul','Kuzguncuk Istanbul','Büyükada Istanbul','Çankaya Caddesi Büyükada'];
function restore(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return new Set(Array.isArray(value)?value.filter(x=>Number.isInteger(x)&&x>=1&&x<=23):[])}catch{return new Set()}}
let stories=[],mode='all',query='',current=null,photo=0,visited=restore('city-stories-visited'),toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400)}
function persist(key,set){try{localStorage.setItem(key,JSON.stringify([...set]));return true}catch{toast('Сохранено на время этой сессии. Хранилище браузера недоступно.');return false}}
function toggleVisited(id){visited.has(id)?visited.delete(id):visited.add(id);persist('city-stories-visited',visited);render();updateActions();window.refreshPlan?.()}
function renderDays(){$('#days').innerHTML=days.map(d=>`<button class="day ${(window.planDay||24)===d.day?'selected':''}" data-day="${d.day}" aria-pressed="${(window.planDay||24)===d.day}"><span class="day-num">${d.day}</span><span class="day-week">${d.week}</span><span class="day-arrow">↗</span><strong>${d.name}</strong><small>${d.area}</small></button>`).join('')}
function render(){const day=mode==='day'?(window.planDay||24):null;renderDays();for(const [id,value] of [['all-btn',mode==='all'],['day-btn',mode==='day'],['visited-btn',mode==='visited']]){$('#'+id).classList.toggle('active',value);$('#'+id).setAttribute('aria-pressed',value);}const list=stories.filter(s=>(!day||s.day===day)&&(mode==='visited'?visited.has(s.id):!visited.has(s.id))&&(`${s.title} ${s.area} ${s.body.join(' ')}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))));$('#collection-title').textContent=mode==='visited'?'Места, где вы были':day?days.find(d=>d.day===day).name:'Все истории';$('#result-count').textContent=`${day?day+' октября · ':''}${list.length} из ${stories.filter(s=>!day||s.day===day).length}`;$('#cards').innerHTML=list.map(s=>`<article class="card"><button class="card-image" data-open="${s.id}" aria-label="Читать: ${esc(s.title)}"><img src="${s.images[0]}" alt="${esc(s.title)}" loading="lazy"><span class="image-index">${String(s.id).padStart(2,'0')}</span></button><div class="card-meta"><span>${esc(s.area)}</span><span>${s.day} ОКТЯБРЯ ${visited.has(s.id)?' · ✓':''}</span></div><h3><button class="title-button" data-open="${s.id}">${esc(s.title)}</button></h3><p>${esc(s.body[0])}</p><div class="card-bottom"><button class="read-btn" data-open="${s.id}">Читать историю ↗</button><span class="read-time">${Math.max(1,Math.ceil(s.body.join(' ').split(/\s+/).length/180))} мин · ${s.images.length} фото</span></div></article>`).join('');$('#empty').hidden=!!list.length;$('#empty-title').textContent=query?'Ничего не нашлось':mode==='visited'?'Здесь будут ваши прогулки':day===29?'В этот день только дорога':'Все места уже отмечены';$('#empty-copy').textContent=query?'Попробуйте другое название.':mode==='visited'?'Откройте историю и нажмите «Уже были». Отметки сохранятся в этом браузере.':day===29?'Расписание выезда находится выше, в разделе «Мой день».':'Посмотренные истории находятся в разделе «Уже были». Снимите отметку, чтобы вернуть историю в список.'}
function updateActions(){const seen=visited.has(current),b=$('#reader-visited');if(b){b.textContent=seen?'✓ Уже были':'○ Отметить посещение';b.setAttribute('aria-pressed',seen);b.classList.toggle('active',seen)}}
function renderPhoto(){const s=stories.find(x=>x.id===current);$('#gallery-photo').src=s.images[photo];$('#gallery-photo').alt=`${s.title}. Фотография ${photo+1} из ${s.images.length}`;$('#gallery-count').textContent=`${photo+1} / ${s.images.length}`;if($('#lightbox').open)renderLightbox()}
function openStory(id,updateHash=true){const s=stories.find(x=>x.id===id);if(!s)return;current=id;photo=0;$('#reader-number').textContent=`${String(id).padStart(2,'0')} / 23`;$('#reader-content').innerHTML=`<div class="reader-header"><span class="eyebrow">${s.day} ОКТЯБРЯ · ${esc(s.area)}</span><h2 id="story-title">${esc(s.title)}</h2><div class="reader-actions"><button id="reader-visited" class="chip"></button><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapNames[id-1])}&travelmode=walking" target="_blank" rel="noopener noreferrer">От меня до места ↗</a></div></div><div class="gallery"><button id="gallery-expand" aria-label="Открыть фото на весь экран"><img id="gallery-photo" src="${s.images[0]}" alt="${esc(s.title)}"><span class="expand-hint">⤢ На весь экран</span></button><div class="gallery-controls" ${s.images.length<2?'hidden':''}><button id="photo-prev" aria-label="Предыдущее фото">←</button><span id="gallery-count">1 / ${s.images.length}</span><button id="photo-next" aria-label="Следующее фото">→</button></div></div><div class="reader-body">${s.galleryNote?`<p class="gallery-note">${esc(s.galleryNote)}</p>`:''}${s.body.map(p=>`<p>${esc(p)}</p>`).join('')}${s.detail.length?`<aside class="insight"><h3>НЕОБЫЧНАЯ ДЕТАЛЬ</h3>${s.detail.map(p=>`<p>${esc(p).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</p>`).join('')}</aside>`:''}${s.look.length?`<aside class="look"><h3>ЧТО РАССМОТРЕТЬ</h3>${s.look.map(p=>`<p>${esc(p)}</p>`).join('')}</aside>`:''}<div class="reader-foot"><button data-next="${id-1}" ${id===1?'disabled':''}>← Предыдущая история</button><button data-next="${id+1}" ${id===23?'disabled':''}>Следующая история →</button></div></div>`;updateActions();if(!$('#story-dialog').open)$('#story-dialog').showModal();$('#story-dialog').scrollTop=0;$('#close-story').focus({preventScroll:true});if(updateHash)history.replaceState(null,'',`#story-${id}`)}
let storyOrigin=null;
function closeStory(){$('#story-dialog').close()}
$('#story-dialog').addEventListener('close',()=>{current=null;if(location.hash.startsWith('#story-'))history.replaceState(null,'',window.storyReturnHash||'#explore');if(storyOrigin){const origin=storyOrigin;storyOrigin=null;const stop=document.getElementById(origin.stopId);if(stop){if(stop.tagName==='DETAILS')stop.open=true;const trigger=stop.querySelector(`[data-open="${origin.storyId}"]`);trigger?.focus({preventScroll:true});window.scrollTo({top:window.scrollY+stop.getBoundingClientRect().top-origin.top,behavior:'instant'})}else window.scrollTo({top:origin.scrollY,behavior:'instant'})}});
$('#back-to-plan').onclick=closeStory;
$('#close-story').onclick=closeStory;
$('#story-dialog').addEventListener('click',e=>{if(e.target===$('#story-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeStory()}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.open){const stop=b.closest('#day-plan [id^="stop-"]');storyOrigin=stop?{stopId:stop.id,storyId:b.dataset.open,top:stop.getBoundingClientRect().top,scrollY:window.scrollY}:null;window.storyReturnHash=stop?'#journey':'#explore';$('#back-to-plan').hidden=!stop;openStory(+b.dataset.open);}if(b.dataset.day)window.selectPlanDay?.(+b.dataset.day);if(b.dataset.next)openStory(+b.dataset.next);if(b.id==='reader-visited')toggleVisited(current);if(b.id==='photo-next'||b.id==='photo-prev'){const n=stories.find(x=>x.id===current).images.length;photo=(photo+(b.id==='photo-next'?1:-1)+n)%n;renderPhoto()}});
function setMode(m){mode=m;query='';$('#search').value='';render()}
$('#all-btn').onclick=()=>setMode('all');$('#day-btn').onclick=()=>setMode('day');$('#visited-btn').onclick=()=>setMode('visited');$('#search').oninput=e=>{query=e.target.value;render()};document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('#story-dialog').open){e.preventDefault();$('#search').focus()}});window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#story-(\d+)$/);if(m)openStory(+m[1],false)});
fetch('data.json?v=20261011-10').then(r=>{if(!r.ok)throw new Error('Data unavailable');return r.json()}).then(data=>{stories=data;render();window.dispatchEvent(new Event('stories-ready'));const match=location.hash.match(/^#story-(\d+)$/);if(match)openStory(+match[1],false)}).catch(()=>{$('#cards').innerHTML='<p>Не удалось загрузить истории. Обновите страницу, чтобы попробовать ещё раз.</p>'});

// A second modal keeps the story and its scroll position underneath the gallery.
const lightbox=$('#lightbox');
function renderLightbox(){
 const s=stories.find(x=>x.id===current);if(!s)return;
 $('#lightbox-image').src=s.images[photo];
 $('#lightbox-image').alt=`${s.title}. Фотография ${photo+1} из ${s.images.length}`;
 $('#lightbox-count').textContent=`${photo+1} / ${s.images.length}`;
 $('#lightbox-thumbnails').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===photo)));
 $('#lightbox-thumbnails').querySelector(`[data-photo="${photo}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
}
function stepPhoto(offset){const s=stories.find(x=>x.id===current);if(!s)return;photo=(photo+offset+s.images.length)%s.images.length;renderPhoto()}
function openLightbox(){
 const s=stories.find(x=>x.id===current);if(!s)return;
 $('#lightbox-title').textContent=s.title;
 $('#lightbox-thumbnails').innerHTML=s.images.map((src,i)=>`<button data-photo="${i}" aria-label="Фото ${i+1} из ${s.images.length}" aria-pressed="${i===photo}"><img src="${src}" alt="" loading="lazy"></button>`).join('');
 $('#lightbox-prev').hidden=$('#lightbox-next').hidden=s.images.length<2;
 $('#lightbox-thumbnails').hidden=s.images.length<2;
 lightbox.showModal();renderLightbox();$('#lightbox-close').focus({preventScroll:true});
}
document.addEventListener('click',e=>{if(e.target.closest('#gallery-expand'))openLightbox()});
$('#lightbox-close').addEventListener('click',()=>lightbox.close());
$('#lightbox-prev').addEventListener('click',()=>stepPhoto(-1));
$('#lightbox-next').addEventListener('click',()=>stepPhoto(1));
$('#lightbox-thumbnails').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b){photo=Number(b.dataset.photo);renderPhoto()}});
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stepPhoto(e.key==='ArrowRight'?1:-1)}});
lightbox.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();lightbox.close()});
lightbox.addEventListener('close',()=>{$('#gallery-expand')?.focus({preventScroll:true})});
let swipeStart=null;
const stage=$('.lightbox-stage');
stage.addEventListener('touchstart',e=>{swipeStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
stage.addEventListener('touchend',e=>{if(!swipeStart)return;const t=e.changedTouches[0],dx=t.clientX-swipeStart.x,dy=t.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)stepPhoto(dx<0?1:-1)},{passive:true});
stage.addEventListener('touchcancel',()=>{swipeStart=null},{passive:true});

// Keep the mobile shortcut available while reading a story as well as the page.
const topButton=$('#back-to-top'),storyDialog=$('#story-dialog');
const mobileTop=matchMedia('(max-width:768px)');
function updateTopButton(){
 const host=storyDialog.open?storyDialog:document.body;
 if(topButton.parentElement!==host)host.append(topButton);
 const distance=storyDialog.open?Math.max(storyDialog.scrollTop,window.scrollY):window.scrollY;
 topButton.hidden=!mobileTop.matches||lightbox.open||distance<240;
}
window.addEventListener('scroll',updateTopButton,{passive:true});
storyDialog.addEventListener('scroll',updateTopButton,{passive:true});
mobileTop.addEventListener('change',updateTopButton);
const topObserver=new MutationObserver(updateTopButton);
for(const dialog of [storyDialog,lightbox])topObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
topButton.addEventListener('click',()=>{
 const goTop=()=>{
  history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.querySelector('header .brand').focus({preventScroll:true});
 };
 if(storyDialog.open){
  storyOrigin=null;
  storyDialog.addEventListener('close',()=>requestAnimationFrame(goTop),{once:true});
  storyDialog.close();
 }else goTop();
});
updateTopButton();
