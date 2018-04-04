var h = require('hyperscript')
var isMsg = require('ssb-ref').isMsg
exports.gives = {
  compose: {insert: true}
}

function get(str) {
  try {
    return JSON.parse(localStorage['drafts:'+str])
  } catch (err) { }
}
function set (key, value) {
  var _key = 'drafts:'+key
  var _value = localStorage[_key]
  if(value == null || value == '') {
    localStorage.removeItem(_key)
  }
  else
    localStorage[_key] =
      JSON.stringify({ts: Date.now(), value: value})

  var ev = new CustomEvent('storage', {})
  ev.key = _key
  ev.newValue = localStorage[_key]
  ev.oldValue = _value
  window.dispatchEvent(ev)
}

exports.create = function (api) {
  for(var k in localStorage) {
    if(isMsg(k)) {
      var value = localStorage[k]
      localStorage.removeItem(k)
      set(k, value)
    }
  }

  return {
    compose: {
      insert: function (ta, meta, context) {
        if(!context) return
        var timer
        var button = h('button', 'save', {onclick: onSave})

        function onSave () {
          clearTimeout(timer)
          set(context.path, ta.value)
          button.textContent = 'saved!'
        }

        //load from drafts, if defined.
        var data = get(context.path)
        if(data && data.value) ta.value = data.value
        ta.onchange =
        ta.oninput = function () {
          clearTimeout(timer)
          if(ta.value == '') {
            set(context.path, undefined)
            button.disabled = true
            return
          }
          button.disabled = false
          button.textContent = 'save'
          timer = setTimeout(onSave, 3000)
        }

        return button
      }
    }
  }
}

