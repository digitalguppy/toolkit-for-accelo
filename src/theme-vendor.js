import {enable, disable, setFetchMethod} from 'darkreader';
import checklistCSS from '../extension/content.css';
import editorCSS from '../extension/vendor/editor.css';
import descriptionCSS from '../extension/descriptions.css';
import timesheetCSS from '../extension/timesheets.css';
import inboxCSS from '../extension/inbox.css';
import retainerCSS from '../extension/retainers.css';

globalThis.ToolkitThemeEngine = Object.freeze({enable, disable, setFetchMethod});
// Chrome's injected extension CSS is absent from document.styleSheets. A local
// copy lets the color engine process exactly the same rules while Dark is on.
globalThis.ToolkitThemeStyles = [checklistCSS, editorCSS, descriptionCSS, inboxCSS, timesheetCSS, retainerCSS].join('\n');
