var h = require('hyperscript')

exports.gives = {
  compose: {insert: true}
}

exports.create = function (api) {
  return { compose: { insert: function (ta, meta, context) {
    if(!context) return
    var timer
    var button = h('button', 'save', {onclick: onSave})

    function onSave () {
      clearTimeout(timer)
      localStorage[context.path] = ta.value
      button.textContent = 'saved!'
    }

    //load from drafts, if defined.
    if(localStorage[context.path])
      ta.value = localStorage[context.path]

    ta.oninput = function () {
      clearTimeout(timer)
      if(ta.value == '') {
        localStorage.removeItem(context.path)
        button.disabled = true
        return
      }
      button.disabled = false
      button.textContent = 'save'
      timer = setTimeout(onSave, 3000)
    }

    return button
  }}}
}



