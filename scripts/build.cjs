const fs=require('node:fs');
const path=require('node:path');
const esbuild=require('esbuild');
const patchEditorLifecycle=require('./editor-lifecycle-patch.cjs');
const patchTheme=require('./theme-vendor-patch.cjs');
const root=path.join(__dirname,'..');
async function build(){
require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'build-icons.cjs')],{stdio:'inherit'});
fs.copyFileSync(path.join(root,'extension/timesheet-core.js'),path.join(root,'extension/timesheet-core-main.js'));
fs.mkdirSync(path.join(root,'extension/vendor'),{recursive:true});
const editorSource=path.join(root,'node_modules/@toast-ui/editor/dist/esm/index.js');
if(JSON.parse(fs.readFileSync(path.join(root,'node_modules/@toast-ui/editor/package.json'),'utf8')).version!=='3.2.2')throw new Error('Review the editor lifecycle patch before changing TOAST UI versions.');
// Feed the patched source to the bundler without changing installed dependencies.
const patchedEditor=patchEditorLifecycle(fs.readFileSync(editorSource,'utf8'));
let patchApplied=false;
await esbuild.build({entryPoints:[path.join(root,'src/markdown-vendor.js')],bundle:true,format:'iife',target:'chrome110',minify:true,legalComments:'eof',outfile:path.join(root,'extension/vendor/markdown.js'),plugins:[{
  name:'editor-lifecycle',setup(build){build.onLoad({filter:/[\\/]@toast-ui[\\/]editor[\\/]dist[\\/]esm[\\/]index\.js$/},()=>{
    patchApplied=true;return{contents:patchedEditor,loader:'js',resolveDir:path.dirname(editorSource)};
  });}
}]});
if(!patchApplied)throw new Error('The editor lifecycle patch was not bundled.');
fs.copyFileSync(path.join(root,'node_modules/@toast-ui/editor/dist/toastui-editor.css'),path.join(root,'extension/vendor/editor.css'));
const themeSource=path.join(root,'node_modules/darkreader/darkreader.mjs');
if(JSON.parse(fs.readFileSync(path.join(root,'node_modules/darkreader/package.json'),'utf8')).version!=='4.9.133')throw new Error('Review the theme patch before changing Dark Reader versions.');
const patchedTheme=patchTheme(fs.readFileSync(themeSource,'utf8'));let themePatched=false;
await esbuild.build({entryPoints:[path.join(root,'src/theme-vendor.js')],bundle:true,format:'iife',target:'chrome111',loader:{'.css':'text'},minify:true,legalComments:'eof',outfile:path.join(root,'extension/vendor/theme.js'),plugins:[{name:'private-theme-runtime',setup(build){build.onLoad({filter:/[\\/]darkreader[\\/]darkreader\.mjs$/},()=>{themePatched=true;return{contents:patchedTheme.source,loader:'js',resolveDir:path.dirname(themeSource)};});}}]});
if(!themePatched)throw new Error('The theme isolation patch was not bundled.');
const proxy=await esbuild.transform(patchedTheme.proxy,{minify:true,target:'chrome111',legalComments:'eof'});
fs.writeFileSync(path.join(root,'extension/vendor/theme-proxy.js'),proxy.code);
const notice=['Third-party software bundled locally. No remote executable code.','TOAST UI Editor 3.2.2 includes a local toolbar lifecycle guard. See scripts/editor-lifecycle-patch.cjs in the Toolkit source.','Dark Reader 4.9.133 uses a private runtime shim and packaged CSSOM bridge. See scripts/theme-vendor-patch.cjs.'];
for(const name of ['darkreader','@toast-ui/editor','dompurify','marked','prosemirror-model','prosemirror-view','prosemirror-state','prosemirror-transform','prosemirror-commands','prosemirror-history','prosemirror-keymap','prosemirror-inputrules','orderedmap','rope-sequence','w3c-keyname']) {
  const dir=path.join(root,'node_modules',name);const p=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
  const file=fs.readdirSync(dir).find(f=>/^licen[sc]e(?:\.md|\.txt)?$/i.test(f));
  notice.push(`\n${name} ${p.version} (${p.license})\n${file?fs.readFileSync(path.join(dir,file),'utf8'):'See upstream package licence.'}`);
}
fs.writeFileSync(path.join(root,'extension/vendor/LICENSES.txt'),notice.join('\n'));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
