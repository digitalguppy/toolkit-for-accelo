// Local-only browser fixtures. Run from the repository root, then stop after QA.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!target.startsWith(root+path.sep)||!/^\/(extension|tests\/browser)\//.test(url.pathname)){res.writeHead(403);res.end();return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',target.endsWith('.html')?'text/html':target.endsWith('.css')?'text/css':'text/javascript');res.end(data);});
}).listen(8766,'127.0.0.1',()=>console.log('Theme fixtures: http://127.0.0.1:8766/tests/browser/theme.html'));
