/*jslint browser: true, continue: true, eqeq: true, plusplus: true, vars: true, white: true */
var FlattrLoader = function() {
    "use strict";
    var e = {
        instance: !1,
        queryString: !1,
        validParams: ["mode", "https", "uid", "button", "language", "html5-key-prefix", "popout", "revsharekey"],
        validButtonParams: ["uid", "owner", "button", "hidden", "title", "url", "revsharekey"],
        options: {},
        POPOUT_WIDTH: 400,
        POPOUT_HEIGHT: 80,
        TIMEOUT: 1500,
        activeButton: null,
        popout: null,
        eventHandlers: {
            unauthorized: function() {
                e.showPopoutForButton(e.activeButton)
            },
            popout_close_button_clicked: function() {
                e.removePopout()
            }
        },
        createIframe: function(e) {
            var t = e.button == "compact", n = document.createElement("iframe");
            n.setAttribute("src", (this.getParam("https") == 1 ? "https" : "http") + "://button.flattr." + this.getParam("domain", "com") + "/view/?e=1&" + this.encodeData(e)), n.setAttribute("class", "FlattrButton"), n.setAttribute("width", t == 1 ? 110 : 55), n.setAttribute("height", t == 1 ? 20 : 62), n.setAttribute("frameBorder", 0), n.setAttribute("scrolling", "no"), n.setAttribute("title", "Flattr"), n.setAttribute("border", 0), n.setAttribute("marginHeight", 0), n.setAttribute("marginWidth", 0), n.setAttribute("allowTransparency", "true"), n.data = e;
            if (e.popout != 0) {
                var r = this;
                n.onmouseover = function() {
                    r.activeButton = this
                }
            }
            return n
        },
        getAbsolutePositionForElement: function(e) {
            var t = {
                x: 0,
                y: 0
            };
            if (e.offsetParent)
                do 
                    t.x += e.offsetLeft, t.y += e.offsetTop, e = e.offsetParent;
            while (e);
            return t
        },
        showPopoutForButton: function(t) {
            e.popout != null && e.removePopout();
            var n, r = "s", i = "e", s = window.innerWidth !== undefined ? window.innerWidth: document.documentElement.clientWidth, o = window.innerHeight !== undefined ? window.innerHeight: document.documentElement.clientHeight, u = this.getAbsolutePositionForElement(t);
            u.x > s / 2 && (i = "w"), u.y + Number(t.height) + this.POPOUT_HEIGHT > o && (r = "n"), n = r + i, t.data.dir = n;
            var a = this.createPopoutIframe(t, t.data);
            i === "w" ? a.style.left = Number(u.x) - Number(this.POPOUT_WIDTH) + Number(t.width) + "px" : i === "e" && (a.style.left = u.x + "px"), r === "n" ? a.style.top = Number(u.y) - Number(this.POPOUT_HEIGHT) + "px" : r === "s" && (a.style.top = Number(u.y) + Number(t.height) + "px"), a.timeout = setTimeout(function() {
                e.popout && e.removePopout()
            }, e.TIMEOUT * 4), e.popout = a, document.querySelector("body").appendChild(a)
        },
        createPopoutIframe: function(t, n) {
            var r = document.createElement("iframe");
            return r.setAttribute("src", (this.getParam("https") == 1 ? "https" : "http") + "://button.flattr." + this.getParam("domain", "com") + "/popout/?" + this.encodeData(n)), r.setAttribute("frameBorder", 0), r.setAttribute("allowTransparency", "true"), r.setAttribute("style", "position: absolute; display:block; z-index: 9999;"), r.setAttribute("width", this.POPOUT_WIDTH), r.setAttribute("height", this.POPOUT_HEIGHT), r.onmouseover = function() {
                this.timeout && (clearTimeout(this.timeout), this.timeout = undefined)
            }, r.onmouseout = function() {
                this.parentNode && (this.timeout = setTimeout(function() {
                    e.popout && e.removePopout()
                }, e.TIMEOUT))
            }, r
        },
        removePopout: function() {
            if (!e.popout)
                return;
            var t = e.popout;
            t.timeout && clearTimeout(t.timeout), t.parentNode.removeChild(t), e.popout = null
        },
        encodeData: function(e) {
            var t, n, r = "";
            for (t in e)
                e.hasOwnProperty(t) && (n = e[t], t == "description" && (n = this.stripTags(n, "<br>"), n.length > 1e3 && (n = n.substring(0, 1e3))), n = n.replace(/^\s+|\s+$/g, "").replace(/\s{2,}|\t+/g, " "), r += t + "=" + encodeURIComponent(n) + "&");
            return r
        },
        getParam: function(e, t) {
            return typeof this.options[e] != "undefined" ? this.options[e] : t
        },
        init: function() {
            try {
                if (document.compatMode == "BackCompat") {
                    var t = document.documentMode;
                    if (t != undefined && t < 8) {
                        console != undefined && console.log("The Flattr button requires the page to be rendered in Standards mode (IE8 or later).");
                        return 
                    }
                }
                var n, r, i, s, o, u, a, f, l, c, h, p, d = document.getElementsByTagName("script");
                for (n = d.length - 1; n >= 0; n--) {
                    r = d[n];
                    if (!r.hasAttribute("src"))
                        continue;
                    i = r.src, s = new RegExp("^(http(?:s?))://((?:(?:api|button).)?flattr.(com|dev))", "i"), o = i.match(s);
                    if (!o)
                        continue;
                    i.indexOf("button/load.js") && (this.options.mode = "d"), this.options.https = o[1].toString() == "https" ? 1 : 0, this.options.domain = o[3].toString(), u = i.indexOf("?");
                    if (u) {
                        a = i.substring(++u), f = a.split("&");
                        for (c = 0; c < f.length; c++)
                            l = f[c].split("="), this.validParam(l[0], this.validParams) && (this.options[l[0]] = l[1])
                        }
                    this.instance = r;
                    break
                }
                if (!this.instance)
                    return 
            } catch (v) {}
            window.addEventListener !== undefined ? (h = window.addEventListener, p = "message") : (h = window.attachEvent, p = "onmessage"), h(p, function(t) {
                var n;
                try {
                    n = JSON.parse(t.data)
                } catch (r) {
                    n = {}
                }
                typeof e.eventHandlers[n.flattr_button_event] == "function" && e.eventHandlers[n.flattr_button_event]()
            }, !1);
            switch (this.getParam("mode", "sdk")) {
            case"d":
                this.options.mode = "direct";
            case"direct":
                this.render();
                break;
            case"auto":
            case"automatic":
                var m = this;
                this.domReady(function() {
                    m.setup()
                });
                break;
            default:
            }
            return this
        },
        loadButton: function(e) {
            var t, n, r, i, s, o = {}, u = null;
            for (t in this.options)
                this.options.hasOwnProperty(t) && this.validParam(t, this.validButtonParams) && (o[t] = this.options[t]);
            e.href && (o.url = e.href), e.getAttribute("title") && (o.title = e.getAttribute("title"));
            if ((u = e.getAttribute("rev")) !== null && u.substring(0, 6) == "flattr" || (u = e.getAttribute("rel")) !== null && u.substring(0, 6) == "flattr") {
                u = u.substring(7).split(";");
                for (n = 0; n < u.length; n++)
                    r = u[n].split(":"), i = r.shift(), this.validParam(i, this.validButtonParams) && (o[i] = r.join(":"))
            } else 
                for (s in this.validButtonParams)
                    this.validButtonParams.hasOwnProperty(s) && (u = e.getAttribute(this.getParam("html5-key-prefix", "data-flattr") + "-" + this.validButtonParams[s])) !== null && (o[this.validButtonParams[s]] = u);
            this.replaceWith(e, this.createIframe(o))
        },
        render: function(e, t, n) {
            var r, i = {};
            for (r in this.options)
                this.options.hasOwnProperty(r) && this.validParam(r, this.validButtonParams) && (i[r] = this.options[r]);
            try {
                if (e)
                    for (r in e)
                        e.hasOwnProperty(r) && this.validParam(r, this.validButtonParams) && (i[r] = e[r]);
                else 
                    window.flattr_uid && (i.uid = window.flattr_uid), window.flattr_url && (i.url = window.flattr_url), window.flattr_btn && (i.button = window.flattr_btn), window.flattr_hide && (i.hidden = window.flattr_hide == 1 ? 1 : 0), window.flattr_tle && (i.title = window.flattr_tle);
                var s = this.createIframe(i);
                if (t) {
                    typeof t == "string" && (t = document.getElementById(t));
                    switch (n) {
                    case"before":
                        t.parentNode.insertBefore(s, t);
                        break;
                    case"replace":
                        this.replaceWith(t, s);
                        break;
                    case"append":
                    default:
                        t.appendChild(s)
                    }
                } else 
                    this.getParam("mode", "manual") == "direct" && this.replaceWith(this.instance, s)
            } catch (o) {}
        },
        replaceWith: function(e, t) {
            if (typeof t == "string")
                if (typeof document.documentElement.outerHTML != "undefined")
                    e.outerHTML = t;
                else {
                    var n = document.createRange();
                    n.selectNode(e), t = n.createContextualFragment(t), e.parentNode.replaceChild(t, e)
                }
            var r = e.parentNode;
            r.replaceChild(t, e)
        },
        setup: function() {
            var e, t, n;
            if (document.querySelectorAll)
                try {
                    n = document.querySelectorAll("a.FlattrButton")
            } catch (r) {}
            if (n == undefined) {
                n = [], e = document.getElementsByTagName("a");
                for (t = e.length - 1; t >= 0; t--) 
                    / FlattrButton / .test(e[t].className) && (n[n.length] = e[t])
            }
            for (t = n.length - 1; t >= 0; t--)
                this.loadButton(n[t])
        },
        stripTags: function(e, t) {
            var n = "", r=!1, i = [], s = [], o = "", u = 0, a = "", f = "", l = function(e, t, n) {
                return n.split(e).join(t)
            };
            t && (s = t.match(/([a-zA-Z0-9]+)/gi)), e += "", i = e.match(/(<\/?[\S][^>]*>)/gi);
            for (n in i)
                if (i.hasOwnProperty(n)) {
                    if (isNaN(n))
                        continue;
                        f = i[n].toString(), r=!1;
                        for (a in s)
                            if (s.hasOwnProperty(a)) {
                                o = s[a], u =- 1, u != 0 && (u = f.toLowerCase().indexOf("<" + o + ">")), u != 0 && (u = f.toLowerCase().indexOf("<" + o + " ")), u != 0 && (u = f.toLowerCase().indexOf("</" + o));
                                if (u == 0) {
                                    r=!0;
                                    break
                                }
                            }
                            r || (e = l(f, "", e))
                }
            return e
        },
        validParam: function(e, t) {
            var n;
            for (n = 0; n < t.length; n++)
                if (t[n] == e)
                    return !0;
            return !1
        }
    };
    return e
}();
!function(e, t) {
    function n(e) {
        h = 1;
        while (e = r.shift())
            e()
    }
    var r = [], i, s, o=!1, u = t.documentElement, a = u.doScroll, f = "DOMContentLoaded", l = "addEventListener", c = "onreadystatechange", h = /^loade|c/.test(t.readyState);
    t[l] && t[l](f, s = function() {
        t.removeEventListener(f, s, o), n()
    }, o), a && t.attachEvent(c, i = function() {
        /^c/.test(t.readyState) && (t.detachEvent(c, i), n())
    }), e.domReady = a ? function(t) {
        self != top ? h ? t() : r.push(t) : function() {
            try {
                u.doScroll("left")
            } catch (n) {
                return setTimeout(function() {
                    e.domReady(t)
                }, 50)
            }
            t()
        }()
    } : function(e) {
        h ? e() : r.push(e)
    }
}(FlattrLoader, document), FlattrLoader.init()

