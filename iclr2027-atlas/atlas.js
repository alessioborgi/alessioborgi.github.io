/* ICLR 2027 Review Atlas – browser-only dashboard. Public reviews only. */
(() => {
  'use strict';
  const VENUE = 'ICLR.cc/2027/Conference';
  const API = 'https://api2.openreview.net';
  const LIMIT = 150;
  const el = id => document.getElementById(id);
  const state = {papers: [], subset: [], ranked: [], metric: 'mean', area: '', minReviews: 1,
    includeInactive: false, query: '', page: 0, source: '', stamp: '', busy: false, cancel: null};
  const nf = new Intl.NumberFormat('en-US');
  const number = n => Number.isFinite(n) ? nf.format(n) : '—';
  const num2 = n => Number.isFinite(n) ? n.toFixed(2) : '—';
  const toValue = v => (v && typeof v === 'object' && 'value' in v) ? v.value : v;
  const parseScore = value => {
    const raw = toValue(value);
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    const hit = String(raw ?? '').trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:\s|:|$)/);
    return hit ? Number(hit[1]) : null;
  };
  const content = (note, name, fallback = '') => toValue(note?.content?.[name]) ?? fallback;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeUrl = (url, id) => {
    if (typeof id === 'string' && /^[A-Za-z0-9_-]+$/.test(id)) return 'https://openreview.net/forum?id=' + encodeURIComponent(id);
    try {const u = new URL(url);return u.protocol === 'https:' && u.hostname === 'openreview.net' ? u.href : '#';} catch{return '#';}
  };
  const mean = values => values.length ? values.reduce((a,b) => a+b,0)/values.length : null;
  const std = values => values.length > 1 ? Math.sqrt(values.reduce((a,v) => a+(v-mean(values))**2, 0)/(values.length-1)) : null;
  function annotate(rows) {
    for (const p of rows) {
      p.reviews = Array.isArray(p.reviews) ? p.reviews : [];
      const valid = p.reviews.filter(r => Number.isFinite(r.rating));
      const confs = valid.map(r => r.confidence).filter(Number.isFinite);
      const weighted = valid.filter(r => Number.isFinite(r.confidence) && r.confidence > 0);
      const sw = weighted.reduce((a,r) => a+r.confidence,0);
      p.nReviews = p.reviews.length;
      p.nRatings = valid.length;
      p.mean = mean(valid.map(r=>r.rating));
      p.weighted = sw > 0 ? weighted.reduce((a,r)=>a+r.rating*r.confidence,0)/sw : null;
      p.conf = mean(confs);
      p.spread = std(valid.map(r=>r.rating));
    }
    return rows;
  }
  function status(note, settings) {
    const vid = String(content(note,'venueid')||'').toLowerCase();
    const venue = String(content(note,'venue')||'').toLowerCase();
    if(vid === settings.withdrawn.toLowerCase() || vid.includes('withdraw') || venue.includes('withdraw')) return 'Withdrawn';
    if(vid === settings.desk.toLowerCase() || vid.includes('desk_reject') || venue.includes('desk reject') || venue.includes('desk-reject')) return 'Desk rejected';
    if(vid.includes('reject') || venue.includes('reject')) return 'Rejected';
    return 'Active';
  }
  function parsePaper(note, settings) {
    if(!note?.id) throw new Error('Received a submission without an identifier.');
    let replies = note?.details?.directReplies ?? note?.details?.replies;
    if(replies && !Array.isArray(replies) && Array.isArray(replies.notes)) replies = replies.notes;
    if(!Array.isArray(replies)) {
      if((note.replyCount ?? 0) > 0) throw new Error('OpenReview omitted directReplies for a paper. Stopping to avoid incomplete statistics.');
      replies = [];
    }
    const reviews = replies.filter(reply => {
      const inv = reply.invitations ?? (reply.invitation ? [reply.invitation] : []);
      return inv.some(s => String(s).endsWith('/-/' + settings.review)) &&
        (!Array.isArray(reply.readers) || !reply.readers.length || reply.readers.includes('everyone'));
    }).map(r => ({id:String(r.id||''), rating:parseScore(content(r,'rating',null)), confidence:parseScore(content(r,'confidence',null)), reviewer:String(r.signatures?.[0]?.split('/').pop() || 'Anonymous')})).filter(r => r.id);
    return {id:String(note.id),number:Number(note.number)||null,title:String(content(note,'title','Untitled')),area:String(content(note,'primary_area','Unspecified')||'Unspecified'),status:status(note,settings),url:safeUrl(null,note.id),reviews};
  }
  function getSetting(contentObj, name, fallback) {return String(toValue(contentObj?.[name]) || fallback);}
  function groupSettings(g) {
    const c = g?.content || {};
    return {submission:getSetting(c,'submission_name','Submission'),review:getSetting(c,'review_name','Official_Review'),withdrawn:getSetting(c,'withdrawn_venue_id',VENUE+'/Withdrawn_Submission'),desk:getSetting(c,'desk_rejected_venue_id',VENUE+'/Desk_Rejected_Submission')};
  }
  function alert(message, warning=true) {
    const box = el('alert');
    if (!message) {box.hidden=true;box.textContent='';return;}
    box.textContent=message;
    box.style.borderColor=warning?'#78555e':'#3d766e';
    box.style.background=warning?'#2b1d2a':'#172e30';
    box.style.color=warning?'#f1b6c4':'#a7e6de';
    box.hidden=false;
  }
  function setProgress(done, total, reviews) {
    const pct = total ? Math.min(99,Math.floor(done/total*100)):Math.min(90, 3+done/100);
    el('progress-bar').style.width=pct+'%';
    el('load-message').textContent=`${number(done)} submissions · ${number(reviews)} reviews${total?' · '+number(total)+' expected':''}`;
  }
  function busy(on) {
    state.busy=on;el('loading-block').hidden=!on;
    for(const id of ['refresh-btn','fetch-bottom']) el(id).disabled=on;
    el('data-light').className='status-dot '+(on?'busy':(state.papers.length?'ok':''));
    if(on) {el('load-title').textContent='Fetching public OpenReview data';el('progress-bar').style.width='2%';}
  }
  const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
  async function requestJson(url, signal, attempt=0) {
    let response;
    try {response = await fetch(url,{mode:'cors',signal,headers:{'Accept':'application/json'},cache:'no-store'});}
    catch(e) {if(signal?.aborted) throw new Error('Refresh cancelled.');throw new Error('OpenReview could not be reached from this browser (network/CORS issue). Try the published snapshot or CSV import. '+e.message);}
    if((response.status === 429 || response.status >=500) && attempt<5) {
      const delay = Math.min(30000,(2**attempt)*1500);
      await sleep(delay);return requestJson(url,signal,attempt+1);
    }
    if(!response.ok) throw new Error(`OpenReview returned HTTP ${response.status}. Access may be temporarily restricted. Your previously loaded data was preserved.`);
    const payload=await response.json();
    if(!payload || typeof payload!=='object') throw new Error('Unexpected OpenReview response.');
    return payload;
  }
  async function collect() {
    if(state.busy) return;
    const controller = new AbortController();state.cancel=controller;busy(true);alert('');
    try {
      const qp = new URLSearchParams({id:VENUE});
      const groups = await requestJson(`${API}/groups?${qp}`,controller.signal);
      if(!groups.groups?.length) throw new Error('ICLR 2027 conference group is unavailable from the public API.');
      const cfg=groupSettings(groups.groups[0]);
      const invitation=`${VENUE}/-/${cfg.submission}`;
      let after=null, expected=null, reviewCount=0, page=0;
      const papers=[];
      const seen=new Set();
      while(true) {
        const params=new URLSearchParams({invitation,details:'directReplies',limit:String(LIMIT),stream:'true'});
        if(after) params.set('after',after); else params.set('count','true');
        const data=await requestJson(`${API}/notes?${params}`,controller.signal);
        if(!Array.isArray(data.notes)) throw new Error('OpenReview did not provide a notes list.');
        if(expected==null && Number.isFinite(Number(data.count))) expected=Number(data.count);
        if(!data.notes.length) break;
        for(const note of data.notes) {
          const paper=parsePaper(note,cfg);
          if(seen.has(paper.id)) throw new Error('Duplicate submission during pagination; stopped to avoid misleading statistics.');
          seen.add(paper.id);papers.push(paper);reviewCount+=paper.reviews.length;
        }
        const next=data.notes[data.notes.length-1]?.id;
        if(!next || after===next) throw new Error('Pagination cursor did not advance.');
        after=next;page++;
        setProgress(papers.length,expected,reviewCount);
        if(data.notes.length<LIMIT) break;
        if(page>5000) throw new Error('Exceeded the maximum safe page count.');
        await sleep(130);
      }
      if(!papers.length) throw new Error('OpenReview returned no submissions; no data was loaded.');
      if(expected!==null && papers.length<expected) throw new Error(`Received only ${papers.length} of ${expected} submissions. Partial results discarded.`);
      const stamp=new Date().toISOString();
      loadData({complete:true,generated_utc:stamp,total_submissions:papers.length,papers},'Direct public OpenReview API');
      await saveCache({complete:true,generated_utc:stamp,total_submissions:papers.length,papers});
      alert(`Successfully loaded ${number(papers.length)} public submissions and ${number(reviewCount)} official reviews.`,false);
    } catch(e) {alert(e.message || String(e));}
    finally {state.cancel=null;busy(false);}
  }
  function loadData(data,src) {
    if(!data?.complete || !Array.isArray(data.papers) || !data.papers.length) throw new Error('The provided dataset is missing or incomplete.');
    const valid = data.papers.map(p => ({...p, reviews:(p.reviews || []).map(r=>({...r,rating:parseScore(r.rating),confidence:parseScore(r.confidence)}))}));
    state.papers=annotate(valid);
    state.source=src;state.stamp=data.generated_utc||'';
    el('data-light').className='status-dot ok';el('data-status-small').textContent=`${number(state.papers.length)} submissions loaded`;
    el('snapshot-time').textContent=state.stamp?'Updated '+new Date(state.stamp).toLocaleString():'Loaded dataset';
    el('data-provenance').textContent=`Source: ${src}${data.source?' · '+data.source:''}. ${state.stamp?'Collected at '+state.stamp+'. ':''}Public official reviews only. Total submissions: ${number(state.papers.length)}.`;
    fillAreas();compute();
  }
  function fillAreas() {
    const available=Array.from(new Set(state.papers.map(p=>p.area).filter(Boolean))).sort();
    el('area').innerHTML='<option value="">All research areas</option>'+available.map(a=>`<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    if(available.includes(state.area))el('area').value=state.area;else state.area='';
  }
  function compute() {
    const cohort=state.papers.filter(p=>(state.includeInactive||p.status==='Active')&&(!state.area||p.area===state.area));
    state.subset=cohort.filter(p=>p.nRatings>=state.minReviews&&Number.isFinite(p[state.metric]));
    state.ranked=state.subset.slice().sort((a,b)=>b[state.metric]-a[state.metric]||b.nRatings-a.nRatings||(b.conf||0)-(a.conf||0)||(a.number||Infinity)-(b.number||Infinity));
    let r=0,last=null;
    for(let i=0;i<state.ranked.length;i++) {const v=state.ranked[i][state.metric];if(last===null||Math.abs(last-v)>1e-8)r=i+1;state.ranked[i].rank=r;last=v;}
    el('kpi-total').textContent=number(cohort.length);
    el('kpi-total-sub').textContent=state.includeInactive?'Including inactive statuses':'Active submissions';
    el('kpi-scored').textContent=number(state.subset.length);
    el('kpi-scored-sub').textContent=`At least ${state.minReviews} scored review${state.minReviews>1?'s':''}`;
    el('kpi-average').textContent=num2(mean(state.subset.map(p=>p.mean).filter(Number.isFinite)));
    const reviews=state.subset.flatMap(p=>p.reviews.filter(r=>Number.isFinite(r.rating)));
    el('kpi-confidence').textContent=num2(mean(reviews.map(r=>r.confidence).filter(Number.isFinite)));
    drawHistogram(el('histogram'),state.subset.map(p=>p[state.metric]),1,4,15,'#9385f3');
    drawBarList('rating-bars',[1,2,3,4].map(v=>({label:['','1 · Strong reject','2 · Weak reject','3 · Weak accept','4 · Strong accept'][v],count:reviews.filter(r=>Math.round(r.rating)===v).length})),false);
    drawBarList('confidence-chart',[1,2,3,4].map(v=>({label:`Confidence ${v}`,count:reviews.filter(r=>Math.round(r.confidence)===v).length})),false);
    drawHistogram(el('disagreement'),state.subset.map(p=>p.spread).filter(Number.isFinite),0,2,12,'#62cfc6');
    compare();renderTable();
  }
  function drawHistogram(target,vals,min,max,bins,color) {
    if(!vals.length) {target.innerHTML='<span class="empty-chart">No ratings available yet</span>';return;}
    const counts=Array(bins).fill(0);
    for(const v of vals) {if(Number.isFinite(v))counts[Math.max(0,Math.min(bins-1,Math.floor((v-min)/(max-min)*bins)))]++;}
    const highest=Math.max(...counts,1),W=640,H=210,pad=18,gap=6,plotH=160,step=(W-pad*2)/bins,bw=step-gap;
    let axes='';for(let i=0;i<4;i++){const y=H-22-(i/3)*plotH;axes+=`<line x1="${pad}" y1="${y}" x2="${W-pad}" y2="${y}" stroke="#354058" stroke-dasharray="3 5" opacity=".8"/>`;}
    let bars='';counts.forEach((n,i)=>{const h=n/highest*plotH,x=pad+i*step+gap/2,y=H-22-h;bars+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${color}" opacity="${.38+.58*(n/highest)}"><title>${n} papers</title></rect>`;});
    target.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram of ${vals.length} scores">${axes}${bars}</svg>`;
  }
  function drawBarList(id,entries,flag) {
    const max=Math.max(...entries.map(d=>d.count),1);
    el(id).innerHTML=entries.map(d=>`<div class="hbar-row"><span>${escapeHtml(d.label)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${(100*d.count/max).toFixed(2)}%"></div></div><strong>${number(d.count)}</strong></div>`).join('');
  }
  function compare() {
    const target=Number(el('target').value),valid=Number.isFinite(target)&&target>=1&&target<=4;
    if(!valid||!state.subset.length) {
      for(const id of ['your-rank','higher','lower','ties','percentile'])el(id).textContent='—';
      el('rank-of').textContent=valid?'among scored papers':'Enter a rating between 1 and 4';
      el('percentile-fill').style.width='0%';return;
    }
    const vals=state.subset.map(p=>p[state.metric]);
    const high=vals.filter(v=>v>target+1e-8).length;
    const low=vals.filter(v=>v<target-1e-8).length;
    const tied=vals.length-high-low;
    const percentile=100*(low+.5*tied)/vals.length;
    el('your-rank').textContent='#'+number(high+1);
    el('rank-of').textContent=`of ${number(vals.length)} papers`;
    el('higher').textContent=number(high);el('lower').textContent=number(low);el('ties').textContent=number(tied);
    el('percentile').textContent=percentile.toFixed(1)+'%';
    el('percentile-fill').style.width=percentile.toFixed(1)+'%';
    el('cohort-name').textContent=state.area||'All research areas';
  }
  function scoreClass(v){return !Number.isFinite(v)?'':v>=3?' high':v<2?' low':'';}
  function renderTable() {
    const q=state.query.toLowerCase();
    const display=state.ranked.filter(p=>!q||p.title.toLowerCase().includes(q)||String(p.number??'').includes(q)||p.id.toLowerCase().includes(q));
    const count=display.length,per=50,pages=Math.ceil(count/per)||1;
    state.page=Math.min(state.page,pages-1);
    const current=display.slice(state.page*per,(state.page+1)*per);
    el('rank-total').textContent=`${number(count)} matching papers`;
    el('paper-rows').innerHTML=current.length?current.map(p=>`<tr><td><strong>#${number(p.rank)}</strong></td><td><a class="title-link" href="${safeUrl(p.url,p.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a><small>Submission #${escapeHtml(p.number??'—')} · ${escapeHtml(p.id)}</small></td><td>${escapeHtml(p.area)}</td><td><span class="score-pill${scoreClass(p.mean)}">${num2(p.mean)}</span></td><td>${num2(p.weighted)}</td><td>${number(p.nRatings)}</td><td>${num2(p.conf)}</td><td>${num2(p.spread)}</td></tr>`).join(''):'<tr><td colspan="8" class="empty-row">No matching scored papers. Load data or relax the filters.</td></tr>';
    el('pagination-label').textContent=count?`${number(state.page*per+1)}–${number(Math.min(count,(state.page+1)*per))} of ${number(count)}`:'No papers to display';
    el('prev-page').disabled=state.page===0;el('next-page').disabled=state.page>=pages-1;
  }
  const csvCell = value=>'"'+String(value??'').replace(/"/g,'""')+'"';
  function downloadCsv(kind) {
    if(!state.papers.length){alert('Load data before exporting.');return;}
    let rows,headers;
    if(kind==='ranking') {headers=['rank','number','title','area','status','mean_rating','weighted_rating','mean_confidence','n_ratings','n_reviews','std_dev','paper_id','url'];rows=state.ranked.map(p=>[p.rank,p.number,p.title,p.area,p.status,p.mean,p.weighted,p.conf,p.nRatings,p.nReviews,p.spread,p.id,p.url]);}
    else {headers=['paper_id','paper_number','title','area','review_id','rating','confidence','reviewer'];rows=state.subset.flatMap(p=>p.reviews.map(r=>[p.id,p.number,p.title,p.area,r.id,r.rating,r.confidence,r.reviewer]));}
    const csv=[headers.map(csvCell).join(','),...rows.map(r=>r.map(csvCell).join(','))].join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`iclr2027_${kind}_${new Date().toISOString().slice(0,10)}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
  }
  function parseCsv(text) {
    const rows=[];let cur=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++) {const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
    else if(c==='"')quoted=true;else if(c===','){cur.push(cell);cell='';}else if(c==='\n'){cur.push(cell.replace(/\r$/,''));if(cur.some(x=>x.trim()))rows.push(cur);cur=[];cell='';}else cell+=c;}
    if(quoted)throw new Error('Unterminated CSV quoted cell.');cur.push(cell);if(cur.some(x=>x.trim()))rows.push(cur);return rows;
  }
  function loadCsv(text) {
    const rows=parseCsv(text);if(rows.length<2)throw new Error('The CSV contains no review records.');
    const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,'').trim().toLowerCase());
    for(const name of ['paper_id','title','rating','confidence'])if(!headers.includes(name))throw new Error('Missing required CSV column: '+name);
    const idx=name=>headers.indexOf(name);const m=new Map();let n=0;
    for(const cells of rows) {const v=name=>idx(name)<0?'':cells[idx(name)]??'';const id=v('paper_id').trim();if(!id)continue;
      if(!m.has(id))m.set(id,{id,title:v('title')||'Untitled',number:Number(v('number'))||null,area:v('area')||'Unspecified',status:v('status')||'Active',url:safeUrl(v('url'),id),reviews:[]});
      m.get(id).reviews.push({id:v('review_id')||`import_${n++}`,rating:parseScore(v('rating')),confidence:parseScore(v('confidence')),reviewer:v('reviewer')||'Anonymous'});
    }
    if(!m.size)throw new Error('No valid paper IDs were found in the CSV.');
    loadData({complete:true,generated_utc:new Date().toISOString(),papers:[...m.values()]},'Imported local CSV');
    alert(`Loaded ${number(m.size)} papers from CSV. Results cover the imported cohort, not necessarily the entire conference.`,false);
  }
  function db() {return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(new Error('No IndexedDB support'));const req=indexedDB.open('iclr2027-atlas',1);req.onupgradeneeded=()=>req.result.createObjectStore('cache');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function saveCache(data){try{const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('cache','readwrite');tx.objectStore('cache').put(data,'complete');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});d.close();}catch{/* cache optional */}}
  async function readCache(){try{const d=await db();const data=await new Promise((resolve,reject)=>{const tx=d.transaction('cache','readonly');const req=tx.objectStore('cache').get('complete');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});d.close();return data;}catch{return null;}}
  async function loadPublicFallback() {
    const url='https://raw.githubusercontent.com/songjhPKU/ICLR2027-statistics/main/src/snapshot.json';
    const resp=await fetch(url,{mode:'cors'});
    if(!resp.ok)throw new Error(`Public snapshot endpoint returned ${resp.status}`);
    const data=await resp.json();
    if(!Array.isArray(data.rows)||data.rows.length<10000||!data.meta?.fetched_at)
      throw new Error('Third-party public snapshot was unavailable or incomplete.');
    const status={active:'Active',withdrawn:'Withdrawn',desk:'Desk rejected',other:'Rejected'};
    const papers=data.rows.map(([id,title,area,st,rows])=>({
      id:String(id),number:null,title:String(title||'Untitled'),area:String(area||'Unspecified'),
      status:status[st]||'Rejected',url:safeUrl(null,id),
      reviews:rows.map(([rating,confidence],i)=>({id:`${id}_snapshot_${i}`,rating,confidence,reviewer:'Anonymous'}))
    }));
    const snap={complete:true,generated_utc:data.meta.fetched_at,source:'Third-party public OpenReview snapshot (Nov 6, 2026)',source_url:'https://github.com/songjhPKU/ICLR2027-statistics',papers};
    loadData(snap,'Public snapshot · songjhPKU/ICLR2027-statistics');
    await saveCache(snap);
    alert('Loaded an independently published OpenReview snapshot dated November 6, 2026. It is not live: review scores may have changed during rebuttal. The original public bulk endpoint currently returns HTTP 403.',false);
  }
  async function boot() {
    const local=await readCache();if(local?.complete){try{loadData(local,'Browser cache');}catch{}}
    try {
      const resp=await fetch('./snapshot.json',{cache:'no-store'});
      if(resp.ok) {
        const snap=await resp.json();
        if(snap?.complete && snap.papers?.length && (!state.stamp || String(snap.generated_utc||'')>state.stamp)) {
          loadData(snap,'Published GitHub Pages snapshot');await saveCache(snap);
        }
      }
    } catch {/* browser can still fetch live or import CSV */}
    if(!state.papers.length) {try{await loadPublicFallback();}catch(e){alert('No complete snapshot could be loaded. OpenReview bulk retrieval is currently blocked, and the public fallback could not be reached ('+e.message+'). You can still import a review-level CSV.');}}
  }
  function bind() {
    el('refresh-btn').addEventListener('click',collect);el('fetch-bottom').addEventListener('click',collect);
    el('stop-btn').addEventListener('click',()=>state.cancel?.abort());
    el('metric').addEventListener('change',e=>{state.metric=e.target.value;state.page=0;compute();});
    el('area').addEventListener('change',e=>{state.area=e.target.value;state.page=0;compute();});
    el('min-reviews').addEventListener('change',e=>{state.minReviews=Number(e.target.value)||1;state.page=0;compute();});
    el('include-inactive').addEventListener('change',e=>{state.includeInactive=e.target.checked;state.page=0;compute();});
    el('target').addEventListener('input',e=>{const value=Number(e.target.value);if(value>=1&&value<=4)el('score-slider').value=String(value);compare();});
    el('score-slider').addEventListener('input',e=>{el('target').value=Number(e.target.value).toFixed(2);compare();});
    el('search').addEventListener('input',e=>{state.query=e.target.value.trim();state.page=0;renderTable();});
    el('prev-page').addEventListener('click',()=>{state.page=Math.max(0,state.page-1);renderTable();});
    el('next-page').addEventListener('click',()=>{state.page++;renderTable();});
    el('download-rankings').addEventListener('click',()=>downloadCsv('ranking'));
    el('download-reviews').addEventListener('click',()=>downloadCsv('reviews'));
    el('csv-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{loadCsv(await file.text());}catch(err){alert(err.message);}e.target.value='';});
    const nav=Array.from(document.querySelectorAll('[data-nav]'));
    const mark=()=>{const pos=window.scrollY+170;let active='overview';for(const id of ['overview','compare','rankings','reviews','settings']){const element=el(id);if(element && element.offsetTop<=pos)active=id;}nav.forEach(a=>a.classList.toggle('active',a.dataset.nav===active));};
    window.addEventListener('scroll',mark,{passive:true});mark();
    compute();
  }
  bind();boot();
})();