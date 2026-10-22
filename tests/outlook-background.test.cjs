const {test} = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto').webcrypto;
const {createService} = require('../experimental/outlook/outlook-background.js');
// All identities and credential values below are fictional test data. The fetch
// function is an in-memory stub: these tests never contact Microsoft or Accelo.
const CLIENT='12345678-1234-1234-1234-123456789012', NOW=1800000000000, EMAIL='tester@example.com';
const SETTINGS={id:'extension',url:'chrome-extension://extension/settings.html'};
const ACCELO={id:'extension',frameId:0,tab:{id:1},url:'https://digitalguppy.accelo.com/?action=home_inbox'};
function harness(options={}) {
  const local={toolkitSettings:{outlookSyncMode:'read_archive',outlookClientId:CLIENT,outlookTenant:'organizations',...options.settings}};
  const session={toolkitOutlookSession:{accessToken:'TEST_ONLY_FAKE_ACCESS',refreshToken:'TEST_ONLY_FAKE_REFRESH',scope:'User.Read Mail.ReadWrite',expiresAt:NOW+3600000,email:EMAIL,accountId:'account',clientId:CLIENT,tenant:'organizations',generation:'session'},...options.session};
  const calls=[], changes=[];
  let verified=0, requests=0;
  const storage=data=>({get:async keys=>Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(key=>[key,structuredClone(data[key])])),set:async value=>{changes.push(value);Object.assign(data,structuredClone(value));},remove:async keys=>{for(const key of Array.isArray(keys)?keys:[keys])delete data[key];},setAccessLevel:async value=>{assert.equal(value.accessLevel,'TRUSTED_CONTEXTS');}});
  const chrome={storage:{local:storage(local),session:storage(session)},permissions:{contains:async()=>options.permission!==false},runtime:{id:'extension',getURL:path=>`chrome-extension://extension/${path}`},identity:{getRedirectURL:path=>`https://extension.chromiumapp.org/${path}`,launchWebAuthFlow:async({url})=>{const auth=new URL(url);assert.equal(auth.searchParams.get('code_challenge_method'),'S256');assert(auth.searchParams.get('code_challenge').length>=43);return `https://extension.chromiumapp.org/outlook?state=${options.badState?'wrong':auth.searchParams.get('state')}&code=authorization`;}}};
  const message={id:'immutable',internetMessageId:'<test@example.com>',from:{emailAddress:{address:'sender@example.com'}},toRecipients:[{emailAddress:{address:EMAIL}}],parentFolderId:'inbox',isRead:false,...options.message};
  const fetch=async(url,init)=>{
    calls.push({url,init}); requests++;
    if(options.onFetch) await options.onFetch(url,init,{message,requests});
    if(options.fetch)return options.fetch(url,init,{message,requests});
    if (url.includes('/oauth2/v2.0/token')) {assert(!init.body.includes('client_secret'));return response({access_token:'TEST_ONLY_FAKE_RENEWED_ACCESS',refresh_token:'TEST_ONLY_FAKE_RENEWED_REFRESH',expires_in:3600,token_type:'Bearer',scope:'User.Read Mail.ReadWrite'});}
    if(url.includes('/me?$select='))return response({id:'account',mail:EMAIL});
    assert.equal(init.headers.Prefer,'IdType="ImmutableId"');
    if(url.includes('/me/messages?'))return response({value:options.ambiguous?[message,message]:[message]});
    if(url.includes('/mailFolders/'))return response({id:url.includes('/inbox?')?'inbox':'archive'});
    if(init.method==='PATCH'){message.isRead=true;return response(message);}
    if(init.method==='POST'){if(options.moveFails)throw new Error('Network lost');message.parentFolderId='archive';return response(message);}
    return response(message);
  };
  const verifyAccelo=async()=>{verified++;return options.verification===false?null:{activityId:'7',messageId:'<test@example.com>',dateActioned:NOW/1000,recipientEmail:EMAIL,medium:'email',incoming:true};};
  const prepareAccelo=async args=>{assert.equal(args.connectionId,'session');return options.ineligible?null:{nonce:'sample-verification-nonce-12345678',expires:NOW+120000};};
  const service=createService({chrome,fetch,crypto,now:()=>NOW,verifyAccelo,prepareAccelo});
  return {service,local,session,calls,changes,message,get verified(){return verified;}};
}
const response=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>structuredClone(body)});
const writes=h=>h.calls.filter(call=>['POST','PATCH'].includes(call.init.method)&&call.url.startsWith('https://graph.microsoft.com'));

test('off and disconnected settings perform no mail reads or writes',async()=>{
  const off=harness({settings:{outlookSyncMode:'none'}});
  assert.equal((await off.service.handle({type:'toolkit-outlook:sync',activityId:'7',nonce:'sample-verification-nonce-12345678'},ACCELO)).state,'off');
  assert.equal(off.calls.length,0);assert.equal(off.verified,0);
  const disconnected=harness({session:{toolkitOutlookSession:null}});
  assert.equal((await disconnected.service.sync('7',ACCELO)).state,'skipped');assert.equal(disconnected.calls.length,0);
});

test('messages from websites, other extensions or frames cannot manage the connection or sync',async()=>{
  const h=harness();
  for (const sender of [ACCELO,{...SETTINGS,id:'other'},{...SETTINGS,url:'file:///settings.html'},{...SETTINGS,url:'chrome-extension://other/settings.html'}]) await assert.rejects(h.service.handle({type:'toolkit-outlook:disconnect'},sender));
  for (const sender of [SETTINGS,{...ACCELO,frameId:1},{...ACCELO,id:'other'},{...ACCELO,url:'https://evil.test/'}]) await assert.rejects(h.service.handle({type:'toolkit-outlook:sync',activityId:'7'},sender));
  assert(h.session.toolkitOutlookSession);assert.equal(h.calls.length,0);
});

test('the action baseline requires an enabled connection and sync requires its nonce',async()=>{
  const h=harness();
  assert.deepEqual(await h.service.handle({type:'toolkit-outlook:prepare',activityId:'7'},ACCELO),{ok:true,nonce:'sample-verification-nonce-12345678',expires:NOW+120000});
  assert.equal(h.calls.length,0);
  await assert.rejects(h.service.handle({type:'toolkit-outlook:sync',activityId:'7'},ACCELO),/prepared/);
  const off=harness({settings:{outlookSyncMode:'none'}});
  assert.equal((await off.service.handle({type:'toolkit-outlook:prepare',activityId:'7'},ACCELO)).state,'off');
  const ineligible=harness({ineligible:true});assert.equal((await ineligible.service.prepare('7',ACCELO)).state,'skipped');
});

test('status and connection results never expose bearer tokens',async()=>{
  const h=harness();
  const status=await h.service.handle({type:'toolkit-outlook:status'},SETTINGS);
  assert.equal(status.connected,true);assert.equal(status.email,EMAIL);assert(!JSON.stringify(status).includes('TEST_ONLY_FAKE'));
  h.local.toolkitSettings.outlookClientId='00000000-0000-0000-0000-000000000000';
  assert.equal((await h.service.status()).connected,false);
  await h.service.disconnect();assert(!h.session.toolkitOutlookSession);
});

test('an unverified Accelo action, denied host access and changed connection config make no Graph requests',async()=>{
  for (const options of [{verification:false},{permission:false},{settings:{outlookTenant:'changed.example'}}]) {
    const h=harness(options);assert.equal((await h.service.sync('7',ACCELO)).ok,false);assert.equal(h.calls.length,0);
  }
});

test('successful read and archive writes are read back and concurrent duplicate actions run only once',async()=>{
  const h=harness();
  const results=await Promise.all([h.service.sync('7',ACCELO),h.service.sync('7',ACCELO)]);
  assert.equal(results[0].state,'done');assert.equal(results[1].state,'duplicate');
  assert.equal(writes(h).length,2);assert.equal(h.message.isRead,true);assert.equal(h.message.parentFolderId,'archive');
  const lookup=new URL(h.calls[0].url);assert.equal(lookup.searchParams.get('$filter'),"internetMessageId eq '<test@example.com>'");assert.equal(lookup.searchParams.get('$top'),'2');
  for(const method of ['PATCH','POST']){const index=h.calls.findIndex(call=>call.init.method===method);assert.equal(h.calls[index+1].init.method,undefined);assert(h.calls[index+1].url.includes('/me/messages/immutable?'));}
});

test('ambiguous matches and already filed messages are untouched',async()=>{
  for (const options of [{ambiguous:true},{message:{parentFolderId:'customer-folder'}}]) {
    const h=harness(options);assert.equal((await h.service.sync('7',ACCELO)).ok,false);assert.equal(writes(h).length,0);
  }
});

test('a failed move reports partial read success and is not automatically retried',async()=>{
  const h=harness({moveFails:true});
  const result=await h.service.sync('7',ACCELO);
  assert.equal(result.ok,false);assert.match(result.summary,/Marked as read/);
  assert.equal(writes(h).length,2);
  assert.equal((await h.service.sync('7',ACCELO)).state,'duplicate');assert.equal(writes(h).length,2);
});

test('a persisted pending operation is not repeated after a worker restart',async()=>{
  const first=harness({moveFails:true});await first.service.sync('7',ACCELO);
  const restarted=harness({session:structuredClone(first.session)});
  assert.equal((await restarted.service.sync('7',ACCELO)).state,'duplicate');assert.equal(writes(restarted).length,0);
});

test('PKCE connection checks redirect state and stores tokens only in trusted session storage',async()=>{
  const bad=harness({badState:true});await assert.rejects(bad.service.connect(),/verified/);assert.equal(bad.calls.length,0);
  const h=harness();const result=await h.service.connect();
  assert.equal(result.connected,true);assert.equal(h.session.toolkitOutlookSession.accessToken,'TEST_ONLY_FAKE_RENEWED_ACCESS');
  assert(!JSON.stringify(h.local).includes('TEST_ONLY_FAKE_RENEWED_ACCESS'));assert(!JSON.stringify(result).includes('TEST_ONLY_FAKE_RENEWED_ACCESS'));
  assert.equal(writes(h).length,0);
});

test('expired access tokens use the refresh token without a client secret',async()=>{
  const h=harness();h.session.toolkitOutlookSession.expiresAt=NOW;
  assert.equal((await h.service.sync('7',ACCELO)).state,'done');
  assert(h.calls[0].init.body.includes('grant_type=refresh_token'));
  assert(!h.calls[0].init.body.includes('client_secret'));assert.equal(h.session.toolkitOutlookSession.accessToken,'TEST_ONLY_FAKE_RENEWED_ACCESS');
});

test('read-only and archive-only modes never perform the other operation',async()=>{
  for (const [mode,method] of [['read','PATCH'],['archive','POST']]) {
    const h=harness({settings:{outlookSyncMode:mode}});assert.equal((await h.service.sync('7',ACCELO)).state,'done');
    assert.deepEqual(writes(h).map(call=>call.init.method),[method]);
  }
});

test('turning sync off or disconnecting while matching prevents later writes',async()=>{
  for(const disconnect of [false,true]){
    let h;
    h=harness({onFetch:async url=>{if(url.includes('/me/messages?')){if(disconnect)await h.service.disconnect();else h.local.toolkitSettings.outlookSyncMode='none';}}});
    assert.equal((await h.service.sync('7',ACCELO)).ok,false);assert.equal(writes(h).length,0);
  }
});

test('a message filed elsewhere during lookups is not archived',async()=>{
  let h;
  h=harness({settings:{outlookSyncMode:'archive'},onFetch:async(url,init,{message})=>{if(url.includes('/mailFolders/archive'))message.parentFolderId='customer-folder';}});
  const result=await h.service.sync('7',ACCELO);
  assert.equal(result.ok,false);assert.equal(writes(h).length,0);
});

test('an unsuccessful readback stops archive and leaves an actionable error',async()=>{
  let changed=false;
  const h=harness({onFetch:async(url,init,{message})=>{if(init.method==='PATCH')changed=true;else if(changed&&url.includes('/me/messages/immutable?'))message.isRead=false;}});
  const result=await h.service.sync('7',ACCELO);
  assert.equal(result.ok,false);assert.equal(writes(h).length,1);assert.equal(result.error,result.summary);assert.match(result.error,/could not be confirmed/);
  assert.equal((await h.service.sync('7',ACCELO)).state,'duplicate');assert.equal(writes(h).length,1);
});

test('only the connected email and nonce are passed to independent Accelo verification',async()=>{
  const h=harness();
  await assert.rejects(h.service.handle({type:'toolkit-outlook:sync',activityId:'7',nonce:'x',messageId:'<forged@example.com>'},ACCELO),/prepared/);
  assert.equal(h.verified,0);assert.equal(writes(h).length,0);
});
