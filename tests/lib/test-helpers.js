
// because we pass paths through eval() code,
// we need to make windows dir-separators escape properly
// so c:\foo\bar needs to be c:\\foo\\bar
// because without it
// when we eval `act("${path}")`
// it becomes act("c:\foo\bar")
// and it should be act("c:\\foo\\bar")
exports.escapeWindowsSlashes = function (str) {
  return str.replace(/\\/g, '\\\\\\\\')
}

exports.toUnixPath = function (str) {
  return str.replace(/\\/g, '/')
}

exports.waitForSync = async function (tab, url, direction) {
  await tab.executeJavascript(`
  {
    let ti
    let resolve
    let p = new Promise(r => {resolve = r})
    let finish = function () {
      clearTimeout(ti)
      beaker.archives.removeEventListener('folder-synced', onSync)
      resolve()
    }
    let onSync = function ({details}) {
      if (stripFinalSlash(details.url) === stripFinalSlash("${url}") && details.direction === "${direction}") {
        finish()
      }
    }
    let stripFinalSlash = function (str) {
      if (str.endsWith('/')) return str.slice(0, -1)
      return str
    }
    ti = setTimeout(finish, 10e3)
    beaker.archives.addEventListener('folder-synced', onSync);
    p
  }
  `)
}