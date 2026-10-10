(function(){
  const THEME_KEY='uxfr-theme'; // keep in sync with the inline script in index.html
  const LANG_KEY='uxfr-lang';   // keep in sync with the inline script in index.html
  const LANGS=['en','de'];
  const I18N=window.UXFR_I18N||{en:{},de:{}};
  let lang=LANGS.includes(document.documentElement.lang)?document.documentElement.lang:'en';
  const t=key=>(I18N[lang]&&I18N[lang][key])||I18N.en[key]||key;
  const root=document.documentElement;
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  const focusTitle=document.querySelector('.display');
  const focusText=document.querySelector('.focus-text');
  const focusGraphic=document.querySelector('.focus-graphic');
  const focusPath=focusGraphic&&focusGraphic.querySelector('.focus-shape');
  const focusTag=document.querySelector('.focus-tag');
  const updateFocusShape=()=>{
    if(!focusTitle||!focusText||!focusGraphic||!focusPath||!focusTag)return;
    const range=document.createRange();
    range.selectNodeContents(focusText);
    const lines=[];
    for(const rect of range.getClientRects()){
      const line=lines.find(item=>Math.abs(item.top-rect.top)<1.5&&Math.abs(item.bottom-rect.bottom)<1.5);
      if(line){line.left=Math.min(line.left,rect.left);line.right=Math.max(line.right,rect.right)}
      else lines.push({left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom});
    }
    if(!lines.length)return;
    lines.sort((a,b)=>a.top-b.top||a.left-b.left);
    const bounds=focusTitle.getBoundingClientRect();
    focusGraphic.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const rows=lines.map(line=>({
      left:line.left-bounds.left-8,
      top:line.top-bounds.top+8,
      right:line.right-bounds.left+16,
      bottom:line.bottom-bounds.top
    }));
    const centers=rows.map(row=>(row.top+row.bottom)/2);
    for(let index=0;index<rows.length-1;index++){
      const boundary=(centers[index]+centers[index+1])/2;
      rows[index].bottom=boundary;
      rows[index+1].top=boundary;
    }
    const points=[];
    const addPoint=(x,y)=>{
      const previous=points[points.length-1];
      if(!previous||Math.hypot(previous.x-x,previous.y-y)>.1)points.push({x,y});
    };
    addPoint(rows[0].left,rows[0].top);
    addPoint(rows[0].right,rows[0].top);
    for(let index=0;index<rows.length-1;index++){
      addPoint(rows[index].right,rows[index].bottom);
      addPoint(rows[index+1].right,rows[index+1].top);
    }
    addPoint(rows[rows.length-1].right,rows[rows.length-1].bottom);
    addPoint(rows[rows.length-1].left,rows[rows.length-1].bottom);
    for(let index=rows.length-1;index>0;index--){
      addPoint(rows[index].left,rows[index].top);
      addPoint(rows[index-1].left,rows[index-1].bottom);
    }
    if(points.length>1&&Math.hypot(points[0].x-points[points.length-1].x,points[0].y-points[points.length-1].y)<.1)points.pop();
    let simplified=true;
    while(simplified&&points.length>3){
      simplified=false;
      for(let index=0;index<points.length;index++){
        const previous=points[(index+points.length-1)%points.length];
        const point=points[index];
        const next=points[(index+1)%points.length];
        const cross=(point.x-previous.x)*(next.y-point.y)-(point.y-previous.y)*(next.x-point.x);
        if(Math.abs(cross)<.1){points.splice(index,1);simplified=true;break}
      }
    }
    const corners=points.map((point,index)=>{
      const previous=points[(index+points.length-1)%points.length];
      const next=points[(index+1)%points.length];
      const previousLength=Math.hypot(previous.x-point.x,previous.y-point.y);
      const nextLength=Math.hypot(next.x-point.x,next.y-point.y);
      const radius=Math.min(12,previousLength/2,nextLength/2);
      return{
        point,
        before:{x:point.x+(previous.x-point.x)*radius/previousLength,y:point.y+(previous.y-point.y)*radius/previousLength},
        after:{x:point.x+(next.x-point.x)*radius/nextLength,y:point.y+(next.y-point.y)*radius/nextLength}
      };
    });
    let path=`M${corners[0].after.x} ${corners[0].after.y}`;
    for(let index=1;index<corners.length;index++){
      const corner=corners[index];
      path+=`L${corner.before.x} ${corner.before.y}Q${corner.point.x} ${corner.point.y} ${corner.after.x} ${corner.after.y}`;
    }
    const first=corners[0];
    path+=`L${first.before.x} ${first.before.y}Q${first.point.x} ${first.point.y} ${first.after.x} ${first.after.y}Z`;
    focusPath.setAttribute('d',path);
    focusTag.style.left=`${Math.min(...rows.map(row=>row.left))+8}px`;
    focusTag.style.top=`${Math.max(...rows.map(row=>row.bottom))-8}px`;
  };
  if(focusTitle&&'ResizeObserver' in window)new ResizeObserver(updateFocusShape).observe(focusTitle);
  window.addEventListener('resize',updateFocusShape);
  document.fonts.ready.then(updateFocusShape);
  updateFocusShape();
  let saved=null; try{saved=localStorage.getItem(THEME_KEY)}catch(e){}
  if(saved==='light'||saved==='dark') root.setAttribute('data-theme',saved);
  const isDark=()=>{const t=root.getAttribute('data-theme');return t?t==='dark':mq.matches};
  const sync=()=>{const d=isDark();document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.setAttribute('aria-label',t(d?'theme.toLight':'theme.toDark')))};
  document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>{
    const next=isDark()?'light':'dark'; root.setAttribute('data-theme',next);
    try{localStorage.setItem(THEME_KEY,next)}catch(e){} sync();
  }));
  mq.addEventListener&&mq.addEventListener('change',sync); sync();

  // Language: English lives in the markup; remember it per element so we can switch back.
  // The initial language is picked by the inline script in <head> (saved choice, else browser language).
  const textNodes=[...document.querySelectorAll('[data-i18n]')].map(el=>({el,key:el.dataset.i18n,en:el.textContent}));
  const labelNodes=[...document.querySelectorAll('[data-i18n-label]')].map(el=>({el,key:el.dataset.i18nLabel,en:el.getAttribute('aria-label')}));
  const langButtons=[...document.querySelectorAll('[data-lang]')];
  const applyLang=next=>{
    lang=LANGS.includes(next)?next:'en';
    root.lang=lang;
    textNodes.forEach(({el,key,en})=>{el.textContent=lang==='en'?en:(I18N[lang][key]??en)});
    labelNodes.forEach(({el,key,en})=>el.setAttribute('aria-label',lang==='en'?en:(I18N[lang][key]??en)));
    langButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    sync();
    updateFocusShape();
    delete root.dataset.i18nPending;
  };
  langButtons.forEach(b=>b.addEventListener('click',()=>{
    try{localStorage.setItem(LANG_KEY,b.dataset.lang)}catch(e){}
    applyLang(b.dataset.lang);
  }));
  applyLang(lang);

  const menu=document.getElementById('fmenu'), btn=document.getElementById('fmenu-btn');
  const talk=document.querySelector('.talk'), pill=menu.querySelector('.fpill');
  const syncTalkContrast=()=>{
    if(!talk||!pill)return;
    const a=pill.getBoundingClientRect(), b=talk.getBoundingClientRect();
    const overlaps=a.width>0&&a.height>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    menu.classList.toggle('over-talk',!menu.classList.contains('open')&&overlaps);
  };
  const menuFocusables=menu.querySelectorAll('.fmenu-links a, .fmenu-lang button');
  menuFocusables.forEach(el=>el.tabIndex=-1);
  const setOpen=o=>{if(menu.classList.contains('open')===o)return;menu.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o));
    menuFocusables.forEach(el=>el.tabIndex=o?0:-1);syncTalkContrast()};
  setOpen(false);
  btn.addEventListener('click',e=>{e.stopPropagation();setOpen(!menu.classList.contains('open'))});
  menu.querySelectorAll('.fmenu-links a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('click',e=>{if(!menu.contains(e.target))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){setOpen(false);btn.focus()}});

  window.addEventListener('scroll',syncTalkContrast,{passive:true});
  window.addEventListener('resize',syncTalkContrast);
  if(talk&&'ResizeObserver' in window)new ResizeObserver(syncTalkContrast).observe(talk);
  syncTalkContrast();

  const legalDialog=document.getElementById('legal-notice');
  const legalTrigger=document.querySelector('[data-open-legal]');
  if(legalDialog&&legalTrigger){
    legalTrigger.addEventListener('click',event=>{
      event.preventDefault();
      legalDialog.showModal();
    });
    legalDialog.addEventListener('click',event=>{
      if(event.target===legalDialog)legalDialog.close();
    });
    legalDialog.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        event.preventDefault();
        legalDialog.close();
      }
    });
  }
})();
