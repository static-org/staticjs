"use strict";

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        if (typeof root.staticjs === "undefined") {
            root.staticjs = new factory(root);
        }
    }
})(this, function staticjs() {
    var self = this;

    hideControllerTemplates();

    var controllerState = {};

    this.controller = function(name, func) {
        var contextCtrl = new func();
        var templateDOM = document.querySelector('[data-static-ctrl=' + name + ']');

        controllerState[name] = 'loading';
        
        var domNodesUnderControl = [];

        function toBeUnderControl(domNode) {
            var isPresent = domNodesUnderControl.filter(function(el) { return el === domNode }).length;

            if (!isPresent) {
                domNodesUnderControl.push(domNode);
            }

            return !isPresent;
        }

        replaceHandlebars(templateDOM, contextCtrl);

        startWatcher(name, templateDOM, contextCtrl, toBeUnderControl);
    };

    function replaceHandlebars(templateDOM, contextCtrl) {
        var html = templateDOM.innerHTML;

        var usedKeys = html.match(/{{([a-z]|[A-Z]|[0-9])*}}/g);

        usedKeys.forEach(function eachHandlebarKey(el) {
            var keyName = el.substring(2, el.length - 2);

            html = html.replace(el, '<span data-static-text="' + keyName + '"></span>');
        });

        templateDOM.innerHTML = html;
    }

    function startWatcher(name, templateDOM, contextCtrl, toBeUnderControl) {
        var watcher = new Watchers(name, templateDOM, contextCtrl, toBeUnderControl);

        setInterval(function() {
            watcher.executeAll();
        }, 300);
    }

    var Watchers = function Watchers(name, templateDOM, contextCtrl, toBeUnderControl) {
        var self = this;

        this.model = function modelWatcher() {
            var usedKeys = templateDOM.querySelectorAll('[data-static-model]');
            var usedKeysLength = usedKeys.length;

            for(var i = 0; i < usedKeysLength; i++) {
                var el = usedKeys[i];
                var isCheckbox = el.tagName === "INPUT" && el.getAttribute('type') === 'checkbox';

                var keyName = el.getAttribute('data-static-model');
                
                if(typeof contextCtrl[keyName] === "function") {
                    throw Error('Usage of functions bound to model not permitted: ' + keyName);
                }
                
                var newValue = contextCtrl[keyName];

                if(((isCheckbox && el.checked != newValue) || (!isCheckbox &&  el.value != newValue)) && el !== document.activeElement) {
                    if(isCheckbox) {
                        el.checked = newValue;
                    } else {
                        el.value = newValue;
                    }

                    if(toBeUnderControl(el)) {
                            el.addEventListener('change', function onElementChange(e) {
                            var node = e.target;
                            var key = node.getAttribute('data-static-model');
                            var isCheckbox = node.tagName === "INPUT" && node.getAttribute('type') === 'checkbox';

                            if(isCheckbox) {
                                contextCtrl[key] = node.checked;
                            } else {
                                contextCtrl[key] = node.value;
                            }
                        });
                    }
                }
            }
        };

        this.text = function textWatcher() {
            var usedKeys = templateDOM.querySelectorAll('[data-static-text]');
            var usedKeysLength = usedKeys.length;

            for(var i = 0; i < usedKeysLength; i++) {
                var el = usedKeys[i];

                var keyName = el.getAttribute('data-static-text');
                var newValue = typeof contextCtrl[keyName] === "function" ? contextCtrl[keyName]() : contextCtrl[keyName];

                if(el.textContent != newValue) {
                    el.textContent = newValue;
                }
            }
        };

        this.click = function clickWatcher() {
            var usedKeys = templateDOM.querySelectorAll('[data-static-click]');
            var usedKeysLength = usedKeys.length;

            for (var i = 0; i < usedKeysLength; i++) {
                var el = usedKeys[i];

                var keyName = el.getAttribute('data-static-click');

                if (typeof contextCtrl[keyName] !== "function") {
                    throw Error('Expecting a function. Found: ' + keyName);
                }

                if (toBeUnderControl(el)) {
                    el.addEventListener('click', function onClick(e) {
                        var domNode = e.target;
                        var key = domNode.getAttribute('data-static-click');
                        
                        contextCtrl[key](domNode);

                        e.preventDefault();
                    });
                }
            }
        };

        this.if = function ifWatcher() {
            var usedKeys = templateDOM.querySelectorAll('[data-static-if]');
            var usedKeysLength = usedKeys.length;

            for (var i = 0; i < usedKeysLength; i++) {
                var el = usedKeys[i];

                var keyName = el.getAttribute('data-static-if');
                var condition = typeof contextCtrl[keyName] === "function" ? contextCtrl[keyName]() : contextCtrl[keyName];

                if (condition) {
                   el.style.display = "block";
                } else { //!condition
                    el.style.display = "none";
                }
            }
        };

        this.forEachW = function forEachWatcher() {
            // var usedKeys = templateDOM.querySelectorAll('[data-static-foreach]');
            // var usedKeysLength = usedKeys.length;

            // for (var i = 0; i < usedKeysLength; i++) {
            //     var el = usedKeys[i];

            //     var baseHTML = el.innerHTML;
            //     el.innerHTML = '';

            //     var parameters = el.getAttribute('data-static-foreach').split('in');
            //     var obj = parameters[0].trim();
            //     var holder = contextCtrl[parameters[1].trim()];
                
            //     if(Array.isArray(holder)) {
            //         holder.forEach(function (currObj, i) {
            //             var tempHTML = baseHTML;

            //             tempHTML = tempHTML.replace(new RegExp(obj, 'g'), obj + '[' + i + ']');

            //             el.innerHTML += tempHTML;
            //         });
            //     } else {
            //         //TODO
            //     }
                

                

            // }
        };

        this.executeAll = function executeAll() {
            this.if();
            this.forEachW();
            this.model();
            this.text();
            this.click();

            if (controllerState[name] === 'loading') {
                controllerState[name] = 'loaded';
                templateDOM.className += ' loaded';
            }
        };
    };

    function hideControllerTemplates() {
        var css = '[data-static-ctrl] {display: none;} .loaded[data-static-ctrl] {display: block;}';
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }
});
