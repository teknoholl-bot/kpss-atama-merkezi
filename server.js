const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {URL}=require('node:url');
const PORT=process.env.PORT||3000, CACHE_MS=15*60*1000;
const SEARCHES=[
['KARİYER KAPISI','site:kariyerkapisi.gov.tr/isealim personel alımı OR sözleşmeli personel'],
['BAKANLIK / ÜNİVERSİTE','site:gov.tr KPSS ön lisans personel alımı OR büro personeli OR memur alımı'],
['RESMÎ GAZETE','site:resmigazete.gov.tr personel alımı memur sözleşmeli personel'],
['ÖSYM','site:osym.gov.tr KPSS tercih kılavuzu OR yerleştirme'],
['SAĞLIK','site:saglik.gov.tr personel alımı OR sağlık teknikeri KPSS'],
['ÜNİVERSİTELER','site:edu.tr 4/B personel alımı KPSS ön lisans']];
let cache={updatedAt:null,items:[]},refreshing=null;
const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
const tag=(x,n)=>{let m=x.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${n}>`,'i'));return m?decode(m[1].trim()):''};
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
async function getFeed(label,q){
 const url='https://news.google.com/rss/search?q='+encodeURIComponent(q+' when:30d')+'&hl=tr&gl=TR&ceid=TR:tr';
 const r=await fetch(url,{headers:{'User-Agent':'KPSSAtamaMerkezi/1.0'},signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error('RSS '+r.status);const xml=await r.text();
 return (xml.match(/<item\b[\s\S]*?<\/item>/gi)||[]).map(b=>{
  const title=clean(tag(b,'title')),raw=tag(b,'link'),date=tag(b,'pubDate'),dt=date?new Date(date):null;
  let link;try{const u=new URL(raw);link=u.protocol==='https:'?u.href:null}catch{}
  if(!title||!link)return null;
  return {title,url:link,description:clean(tag(b,'description')).slice(0,240),source:label,publishedAt:dt&&!isNaN(dt)?dt.toISOString():null,dateLabel:dt&&!isNaN(dt)?dt.toLocaleDateString('tr-TR'):'Yeni duyuru'};
 }).filter(Boolean);
}
async function refresh(){
 if(refreshing)return refreshing;
 refreshing=(async()=>{const res=await Promise.allSettled(SEARCHES.map(x=>getFeed(...x)));
  const all=res.flatMap(x=>x.status==='fulfilled'?x.value:[]),seen=new Set();
  const items=all.filter(x=>{let k=x.title.toLocaleLowerCase('tr-TR');if(seen.has(k))return false;seen.add(k);return true})
   .sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0)).slice(0,80);
  cache={updatedAt:new Date().toISOString(),items};return cache;
 })().finally(()=>refreshing=null);return refreshing;
}
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://'+req.headers.host);
 if(u.pathname==='/api/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}));}
 if(u.pathname==='/api/announcements'){
  try{if(!cache.updatedAt||Date.now()-Date.parse(cache.updatedAt)>CACHE_MS)await refresh();
   res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
   return res.end(JSON.stringify({updatedAt:cache.updatedAt,cacheMinutes:CACHE_MS/60000,items:cache.items}));
  }catch(e){res.writeHead(502,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Kaynak akışları okunamadı',detail:e.message,items:cache.items}));}
 }
 if(u.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'index.html')));}
 res.writeHead(404);res.end('Not found');
}).listen(PORT,()=>console.log('KPSS Atama Merkezi listening on '+PORT));
