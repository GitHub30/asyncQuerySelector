// XPath Helper
// https://wiki.greasespot.net/XPath_Helper
function $x() {
  var x = '';
  var node = document;
  var type = 0;
  var fix = true;
  var i = 0;
  var cur;

  function toArray(xp) {
    var final = [], next;
    while (next = xp.iterateNext()) {
      final.push(next);
    }
    return final;
  }

  while (cur = arguments[i++]) {
    switch (typeof cur) {
      case "string": x += (x == '') ? cur : " | " + cur; continue;
      case "number": type = cur; continue;
      case "object": node = cur; continue;
      case "boolean": fix = cur; continue;
    }
  }

  if (fix) {
    if (type == 6) type = 4;
    if (type == 7) type = 5;
  }

  // selection mistake helper
  if (!/^\//.test(x)) x = "//" + x;

  // context mistake helper
  if (node != document && !/^\./.test(x)) x = "." + x;

  var result = document.evaluate(x, node, null, type, null);
  if (fix) {
    // automatically return special type
    switch (type) {
      case 1: return result.numberValue;
      case 2: return result.stringValue;
      case 3: return result.booleanValue;
      case 8:
      case 9: return result.singleNodeValue;
    }
  }

  return fix ? toArray(result) : result;
}

function observe(startNode, query) {
  return new Promise((resolve, reject) => {
    let observer, timeoutID
    const callback = () => {
      const elements = query()
      if (elements != null && ('length' in elements && elements.length || !('length' in elements) && elements)) {
        if (observer) observer.disconnect()
        if (timeoutID) clearTimeout(timeoutID)
        resolve(elements)
      }
    }
    callback()
    observer = new MutationObserver(callback)
    observer.observe(startNode, { attributes: true, childList: true, characterData: true, subtree: true })
    if (window.ASYNC$_TIMEOUT) {
      timeoutID = setTimeout(() => {
        if (observer) observer.disconnect()
        if (timeoutID) clearTimeout(timeoutID)
        reject('Could not find elements.')
      }, window.ASYNC$_TIMEOUT)
    }
  })
}

// const title = await async$('title')
// console.log(title.textContent)
async function async$(selector, startNode = document) {
  return observe(startNode, () => startNode['querySelector'](selector))
}
asyncQuerySelector = async$

// const links = await async$$('a')
// console.log(links)
async function async$$(selector, startNode = document) {
  return observe(startNode, () => [...startNode['querySelectorAll'](selector)])
}
asyncQuerySelectorAll = async$$

// const links = await async$x('//a')
// console.log(links)
// const h1 = await async$x('//h1', undefined, XPathResult.FIRST_ORDERED_NODE_TYPE)
// console.log(h1.textContent)
async function async$x(xpath, startNode = document, ...args) {
  return observe(startNode, () => $x(xpath, startNode, ...args))
}
asyncXPath = async$x
