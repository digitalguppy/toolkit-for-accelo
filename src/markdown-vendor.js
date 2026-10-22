import Editor from '@toast-ui/editor';
import DOMPurify from 'dompurify';
import {Marked} from 'marked';

const tags = ['p','br','strong','b','em','i','del','s','blockquote','pre','code','ul','ol','li','h1','h2','h3','h4','h5','h6','hr','a','table','thead','tbody','tr','th','td','input'];
const config = {ALLOWED_TAGS:tags, ALLOWED_ATTR:['href','title','start','align','type','checked','disabled'], ALLOW_DATA_ATTR:false, ALLOW_ARIA_ATTR:false};
function escape(s) {return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const parser = new Marked({gfm:true, breaks:true, renderer:{
  html(token) {return escape(token.text);},
  image(token) {return `[Image: ${escape(token.text || 'image')}]`;}
}});
function sanitize(html, fragment=false) {return DOMPurify.sanitize(html, {...config, RETURN_DOM_FRAGMENT:fragment});}
function render(text, doc=document) {
  const fragment=sanitize(parser.parse(text),true);
  for (const link of fragment.querySelectorAll('a')) {
    const href=link.getAttribute('href') || '';
    if (!/^(https?:|mailto:)/i.test(href)) link.removeAttribute('href');
    link.setAttribute('rel','noopener noreferrer'); link.setAttribute('target','_blank');
  }
  for (const input of fragment.querySelectorAll('input')) {input.type='checkbox';input.disabled=true;}
  return doc.importNode(fragment,true);
}
function isMarkdown(text) {
  let yes=false;
  parser.walkTokens(parser.lexer(text), token=>{
    if (['heading','list','blockquote','code','table','hr','strong','em','del','codespan','image'].includes(token.type)) yes=true;
    if (token.type==='link' && /^\[/.test(token.raw)) yes=true;
  });
  return yes;
}
function visualSafe(text) {
  let safe=true;
  parser.walkTokens(parser.lexer(text), t=>{if (['html','image'].includes(t.type)) safe=false;});
  return safe;
}
globalThis.ToolkitMarkdown={Editor,render,isMarkdown,visualSafe,sanitize};
