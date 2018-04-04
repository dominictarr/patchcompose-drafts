var h = require('hyperscript')
var isMsg = require('ssb-ref').isMsg
var pull = require('pull-stream')
var friendly = require('base64-url')

exports.gives = {
  app: {
    view: true,
    menu: true
  }
}

exports.needs = {
  message: {layout: 'first'},
  sbot: { get: 'first' }
}

function prepend(container, el) {
  if(container.firstChild)
    container.insertBefore(el, container.firstChild)
  else
    container.appendChild(el)
}

exports.create = function (api) {
  return {
    app: {
      view: function (src) {
        if(src !== '/drafts') return
        var a = [], id
        for(var k in localStorage) {
          if(/^drafts:/.test(k) && isMsg(id = k.substring(7)))
            try {
              a.push({ts: JSON.parse(localStorage[k]).ts, id: id})
            }
            catch (err) {}
        }
        var content = h('div.content')

        pull(
          pull.values(a.sort(function (a, b) {
            return b.ts - a.ts
          })),
          pull.asyncMap(function (e, cb) {
            api.sbot.get(e.id, function (err, value) {
              cb(err, {key:e.id, value: value})
            })
          }),
          pull.drain(function (msg) {
            var el = api.message.layout(msg)
            el.id = friendly.encode(msg.key)
            content.appendChild(el)
          })
        )

        window.addEventListener('storage', function (ev) {
          var id
          if(/^drafts:/.test(ev.key) && isMsg(id = ev.key.substring(7))) {
            var el = content.querySelector('#'+friendly.encode(id))
            if(el && !ev.newValue) {
              content.removeChild(el)
            }
            else if(el) {
              //bring to start of list
              prepend(content, el)
            }
            else
              api.sbot.get(id, function (err, msg) {
                var el = api.message.layout({key: id, value: msg})
                el.id = friendly.encode(id)
                prepend(content, el)
              })
          }
        })

        return content

      },
      menu: function () {
        return '/drafts'
      }
    }
  }
}

