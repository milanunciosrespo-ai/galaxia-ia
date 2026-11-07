(() => {
  const originalFetch=window.fetch.bind(window), config=window.GALAXIA_PUBLIC;
  const apiBase=config?.api;
  if(!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(apiBase||''))throw Error('La conexión pública no está configurada.');
  window.fetch=async(input,options={})=>{
    if(typeof input==='string'&&input.startsWith('/api/')){
      const headers=new Headers(options.headers||{}), token=localStorage.getItem('galaxia.web.token');
      if(token)headers.set('Authorization','Bearer '+token);
      try{
        const r=await originalFetch(apiBase+input,{...options,headers,credentials:'omit'});
        if(r.status===401&&!input.startsWith('/api/auth/'))location.href='./cuenta.html';
        return r;
      }catch{throw Error('El servidor de Galaxia está apagado o no tiene conexión. Inténtalo más tarde.');}
    }
    return originalFetch(input,options);
  };
  const seen=new WeakMap();
  const hydrate=()=>document.querySelectorAll('img[src^="/api/images/"],a[href^="/api/images/"]').forEach(async node=>{
    const attr=node.tagName==='IMG'?'src':'href',url=node.getAttribute(attr);if(seen.get(node)===url)return;seen.set(node,url);
    try{const r=await fetch(url);if(r.ok){const object=URL.createObjectURL(await r.blob());node.setAttribute(attr,object);}}catch{}
  });
  new MutationObserver(hydrate).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href']});
  addEventListener('DOMContentLoaded',hydrate);
})();
