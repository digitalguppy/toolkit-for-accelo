const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../experimental/outlook/outlook-core.js');
const clientId = '12345678-1234-1234-1234-123456789012';
const now = 1800000000000;
const action = () => ({activityId:'7', messageId:'<test@example.com>', dateActioned:now/1000, recipientEmail:'tester@example.com', medium:'email', incoming:true});
const message = () => ({id:'immutable', internetMessageId:'<test@example.com>', from:{emailAddress:{address:'sender@example.com'}}, toRecipients:[{emailAddress:{address:'tester@example.com'}}], parentFolderId:'inbox', isRead:false});

test('Outlook configuration accepts only intended modes and safe tenant identifiers', () => {
  assert.equal(C.config({outlookClientId:clientId}).mode, 'none');
  for (const mode of C.MODES) assert.equal(C.config({outlookClientId:clientId,outlookSyncMode:mode}).mode,mode);
  for (const tenant of ['organizations',clientId,'digitalguppy.com']) assert.equal(C.config({outlookClientId:clientId,outlookTenant:tenant}).tenant,tenant);
  for (const tenant of ['evil.test/path','https://evil.test','../common','common?x=y','']) assert.throws(()=>C.config({outlookClientId:clientId,outlookTenant:tenant}));
  assert.throws(()=>C.config({outlookClientId:'not-a-guid'}));
});

test('only a recent confirmed incoming Accelo action for the connected mailbox qualifies', () => {
  assert.equal(C.verifiedAction(action(),'7','TESTER@EXAMPLE.COM',now).activityId,'7');
  for (const changes of [{incoming:false},{medium:'note'},{recipientEmail:'other@example.com'},{dateActioned:0},{dateActioned:now/1000-301},{dateActioned:now/1000+31},{activityId:'8'},{messageId:'test@example.com'},{messageId:'<a\r\n@b>'}]) {
    assert.throws(()=>C.verifiedAction({...action(),...changes},'7','tester@example.com',now));
  }
});

test('matching requires a single exact Internet Message-ID and recipient, never the subject', () => {
  assert.equal(C.matchMessage({value:[{...message(),subject:'A different subject'}]},'<test@example.com>','tester@example.com').id,'immutable');
  for (const result of [{value:[]},{value:[message(),message()]},{value:[message()],'@odata.nextLink':'more'},{value:[{...message(),internetMessageId:'<different@example.com>'}]},{value:[{...message(),toRecipients:[]}]},{value:[{...message(),from:{emailAddress:{address:'tester@example.com'}}}]}]) {
    assert.throws(()=>C.matchMessage(result,'<test@example.com>','tester@example.com'));
  }
});

test('the four options avoid unnecessary writes and leave already filed mail alone', () => {
  const folders={inbox:'inbox',archive:'archive'};
  assert.deepEqual(C.plan('none',message(),folders),[]);
  assert.deepEqual(C.plan('read',message(),folders),['read']);
  assert.deepEqual(C.plan('archive',message(),folders),['archive']);
  assert.deepEqual(C.plan('read_archive',message(),folders),['read','archive']);
  assert.deepEqual(C.plan('read_archive',{...message(),isRead:true,parentFolderId:'archive'},folders),[]);
  assert.throws(()=>C.plan('read_archive',{...message(),parentFolderId:'custom'},folders),/already filed/);
});

test('OAuth redirects require the exact callback and single state/code parameters', () => {
  const redirect='https://extension.chromiumapp.org/outlook';
  assert.equal(C.oauthResponse(`${redirect}?state=expected&code=code`,redirect,'expected'),'code');
  for (const callback of [`https://evil.test/outlook?state=expected&code=code`,`${redirect}?state=bad&code=code`,`${redirect}?state=expected&state=expected&code=code`,`${redirect}?state=expected&code=x&code=y`,`${redirect}?state=expected&error=denied`,`${redirect}?state=expected&code=x#fragment`]) assert.throws(()=>C.oauthResponse(callback,redirect,'expected'));
  assert.equal(C.hasScopes('https://graph.microsoft.com/Mail.ReadWrite User.Read offline_access'),true);
  assert.equal(C.hasScopes('Mail.Read User.Read'),false);
});
