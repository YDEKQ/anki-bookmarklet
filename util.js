function defaultOptions(options = {}) {
    const defaults = {
        deck: 'Antimoon',
        type: 'Antimoon',
        word: 'expression',
        defs: 'glossary',
        sent: 'sentence',
        base: "https://rawgit.com/ninja33/anki-bookmarklet/master/",
        libs: ["lib/md5.js", "main.css", "translator.js", "popup.js", "util.js", "ankiconnect.js"],
    };

    for (let key in defaults) {
        if (!(key in options)) {
            options[key] = defaults[key];
        }
    }

    return options;
}

function loadOptions() {
    return !(typeof _bklOptions == "undefined") ? defaultOptions(_bklOptions) : defaultOptions();
}

function showIndicator(option = defaultOptions()) {
    let base = option.base;
    var elemDiv = document.createElement('div');
    elemDiv.innerHTML = `\
        <div id='ankiframe'>\
            <div id='ankiframe_veil' style=''>\
                <img id='ankibutton' src="${base}img/greenlight.gif">\
            </div>\
            <style type='text/css'>\
                #ankiframe { float: right; }\
                #ankiframe_veil { display: block; position: fixed; bottom: 5px; right: 5px; cursor: pointer; z-index: 900; }\
            </style>\
        </div>`;
    document.body.appendChild(elemDiv);
}

function getBlock(node, deep) {
    const blockTags = ['LI', 'P', 'DIV', 'BODY'];
    if (blockTags.indexOf(node.nodeName.toUpperCase()) !== -1 || deep === 0) {
        return node;
    } else {
        return getBlock(node.parentElement, deep - 1);
    }
}

function cutSentence(word, sentence) {
    var autocut = true;
    var sentenceNum = 3;

    if (autocut && sentenceNum > 0) {
        let puncts = sentence.match(/[\.\?!;]/g) || [];
        let arr = sentence.split(/[\.\?!;]/).filter(s => s.trim() !== '').map((s, index) => s.trim() + `${puncts[index] || ''} `);
        let index = arr.findIndex(s => s.indexOf(word) !== -1);
        let left = Math.ceil((sentenceNum - 1) / 2);
        let start = index - left;
        let end = index + ((sentenceNum - 1) - left);

        if (start < 0) {
            start = 0;
            end = sentenceNum - 1;
        } else if (end > (arr.length - 1)) {
            end = arr.length - 1;

            if ((end - (sentenceNum - 1)) < 0) {
                start = 0;
            } else {
                start = end - (sentenceNum - 1);
            }
        }

        return arr.slice(start, end + 1).join('').replace(word, '<b>' + word + '</b>');
    } else {
        return sentence.replace(word, '<b>' + word + '</b>');
    }
}

function getSentence(word) {
    let wordContent = '';
    const upNum = 4;
    const selection = window.getSelection();

    if (selection.rangeCount < 1)
        return;

    var node = selection.getRangeAt(0).commonAncestorContainer;

    if (['INPUT', 'TEXTAREA'].indexOf(node.tagName) !== -1) {
        return;
    }

    node = getBlock(node, upNum);

    if (node !== document) {
        wordContent = node.innerText;
    }

    return cutSentence(word, wordContent);
}

function renderPopup(noteinfo, option = defaultOptions()) {
    let {
        word,
        defs,
        sent
    } = noteinfo;
    let base = option.base;
    var content = `\
    <html lang="zh-CN">\
        <head><meta charset="UTF-8"><title></title>\
            <link rel="stylesheet" href="${base}frame.css">\
        </head>\
        <body style="margin:3px;">\
        <div class="abkl-content">\
            <div class="abkl-sect abkl-word">${word}<span class="abkl-addnote"><img src="${base}img/add.png"/></span></div>\
            <div class="abkl-sect abkl-defs">${defs}</div>\
            <div class="abkl-sect abkl-sent">${sent}</div>\
        </div>\
        <script src="${base}frame.js"></script>\
        </body>\
    </html>`;
    return content;
}