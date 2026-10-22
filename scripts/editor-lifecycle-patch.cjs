// TOAST UI 3.2.2 disconnects its ResizeObserver on destroy, but a throttled
// toolbar update can already be queued. Prevent that callback from rendering
// the destroyed virtual DOM. Keep this scoped to the bundled editor, never DOM APIs.
module.exports=function patchEditorLifecycle(source) {
  const changes=[
    ['this.handleResize = throttle_1(function () {',
      'this.handleResize = throttle_1(function () {\n            if (_this.toolkitDestroyed) { return; }'],
    ['Toolbar.prototype.beforeDestroy = function () {',
      'Toolbar.prototype.beforeDestroy = function () {\n        this.toolkitDestroyed = true;']
  ];
  for(const [before,after] of changes){
    if(source.split(before).length!==2)throw new Error('TOAST UI lifecycle patch no longer matches. Review the editor dependency before building.');
    source=source.replace(before,after);
  }
  return source;
};
