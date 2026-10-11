(() => {
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17h17v17H18c0 7 4 10 10 13v5C14 48 9 39 12 17ZM36 17h17v17H42c0 7 4 10 10 13v5C38 48 33 39 36 17Z" fill="currentColor" stroke="none"/></svg>';
 document.documentElement.dataset.logo='quotes';
 document.querySelectorAll('[data-logo-mark]').forEach(el=>{el.innerHTML=svg;el.setAttribute('aria-hidden','true')});
 const url=new URL(location.href);url.searchParams.delete('logo');url.searchParams.delete('logoCity');
 if(url.hash==='#logos')url.hash='';
 history.replaceState(null,'',url);
})();
