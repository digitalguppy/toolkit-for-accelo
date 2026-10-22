"""Local-only browser QA server. Not part of the extension package."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import html
import json

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == '/qa/source':
            css = (ROOT / 'extension/content.css').read_text(encoding='utf-8')
            source = "(() => {const old=document.getElementById('tka-qa-style');if(old)old.remove();const style=document.createElement('style');style.id='tka-qa-style';style.textContent=" + json.dumps(css) + ";document.head.append(style);})();\n"
            source += (ROOT / 'extension/core.js').read_text(encoding='utf-8') + '\n' + (ROOT / 'extension/content.js').read_text(encoding='utf-8')
            page = '<!doctype html><title>Toolkit local developer source</title><h1>Toolkit developer source ready</h1><textarea id="source" hidden>' + html.escape(source) + '</textarea>'
            encoded = page.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type','text/html; charset=utf-8')
            self.send_header('Content-Length',str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return
        return super().do_GET()

print('Toolkit QA listening on http://127.0.0.1:8766', flush=True)
ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
