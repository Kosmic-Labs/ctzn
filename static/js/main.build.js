(function () {
  'use strict';

  /*! (C) WebReflection Mit Style License */
  var CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer;}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this;}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value);}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar);}else {mapp[i]=mapp[0];}}else {value=mapp[i];}}else {if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar);}}}else {doNotIgnore=true;}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve);}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve);}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);

  var has = Object.prototype.hasOwnProperty
  , prefix = '~';

  /**
  * Constructor to create a storage for our `EE` objects.
  * An `Events` instance is a plain object whose properties are event names.
  *
  * @constructor
  * @private
  */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
  }

  /**
  * Representation of a single event listener.
  *
  * @param {Function} fn The listener function.
  * @param {*} context The context to invoke the listener with.
  * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
  * @constructor
  * @private
  */
  function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
  }

  /**
  * Add a listener for a given event.
  *
  * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
  * @param {(String|Symbol)} event The event name.
  * @param {Function} fn The listener function.
  * @param {*} context The context to invoke the listener with.
  * @param {Boolean} once Specify if the listener is a one-time listener.
  * @returns {EventEmitter}
  * @private
  */
  function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
  }

  /**
  * Clear event by name.
  *
  * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
  * @param {(String|Symbol)} evt The Event name.
  * @private
  */
  function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
  }

  /**
  * Minimal `EventEmitter` interface that is molded against the Node.js
  * `EventEmitter` interface.
  *
  * @constructor
  * @public
  */
  function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
  }

  /**
  * Return an array listing the events for which the emitter has registered
  * listeners.
  *
  * @returns {Array}
  * @public
  */
  EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
  };

  /**
  * Return the listeners registered for a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @returns {Array} The registered listeners.
  * @public
  */
  EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
  };

  /**
  * Return the number of listeners listening to a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @returns {Number} The number of listeners.
  * @public
  */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
  };

  /**
  * Calls each of the listeners registered for a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @returns {Boolean} `true` if the event had listeners, else `false`.
  * @public
  */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
  };

  /**
  * Add a listener for a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @param {Function} fn The listener function.
  * @param {*} [context=this] The context to invoke the listener with.
  * @returns {EventEmitter} `this`.
  * @public
  */
  EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
  };

  /**
  * Add a one-time listener for a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @param {Function} fn The listener function.
  * @param {*} [context=this] The context to invoke the listener with.
  * @returns {EventEmitter} `this`.
  * @public
  */
  EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
  };

  /**
  * Remove the listeners of a given event.
  *
  * @param {(String|Symbol)} event The event name.
  * @param {Function} fn Only remove the listeners that match this function.
  * @param {*} context Only remove the listeners that have this context.
  * @param {Boolean} once Only remove one-time listeners.
  * @returns {EventEmitter} `this`.
  * @public
  */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
  };

  /**
  * Remove all listeners, or those of the specified event.
  *
  * @param {(String|Symbol)} [event] The event name.
  * @returns {EventEmitter} `this`.
  * @public
  */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  /**
   * WebSocket implements a browser-side WebSocket specification.
   * @module Client
   */
  class WebSocketBrowserImpl extends EventEmitter {
      /** Instantiate a WebSocket class
       * @constructor
       * @param {String} address - url to a websocket server
       * @param {(Object)} options - websocket options
       * @param {(String|Array)} protocols - a list of protocols
       * @return {WebSocketBrowserImpl} - returns a WebSocket instance
       */
      constructor(address, options, protocols) {
          super();
          this.socket = new window.WebSocket(address, protocols);
          this.socket.onopen = () => this.emit("open");
          this.socket.onmessage = (event) => this.emit("message", event.data);
          this.socket.onerror = (error) => this.emit("error", error);
          this.socket.onclose = (event) => {
              this.emit("close", event.code, event.reason);
          };
      }
      /**
       * Sends data through a websocket connection
       * @method
       * @param {(String|Object)} data - data to be sent via websocket
       * @param {Object} optionsOrCallback - ws options
       * @param {Function} callback - a callback called once the data is sent
       * @return {Undefined}
       */
      send(data, optionsOrCallback, callback) {
          const cb = callback || optionsOrCallback;
          try {
              this.socket.send(data);
              cb();
          }
          catch (error) {
              cb(error);
          }
      }
      /**
       * Closes an underlying socket
       * @method
       * @param {Number} code - status code explaining why the connection is being closed
       * @param {String} reason - a description why the connection is closing
       * @return {Undefined}
       * @throws {Error}
       */
      close(code, reason) {
          this.socket.close(code, reason);
      }
      addEventListener(type, listener, options) {
          this.socket.addEventListener(type, listener, options);
      }
  }
  /**
   * factory method for common WebSocket instance
   * @method
   * @param {String} address - url to a websocket server
   * @param {(Object)} options - websocket options
   * @return {Undefined}
   */
  function WebSocketBrowserImpl$1 (address, options) {
      return new WebSocketBrowserImpl(address, options);
  }

  /**
   * "Client" wraps "ws" or a browser-implemented "WebSocket" library
   * according to the environment providing JSON RPC 2.0 support on top.
   * @module Client
   */
  class CommonClient extends EventEmitter {
      /**
       * Instantiate a Client class.
       * @constructor
       * @param {webSocketFactory} webSocketFactory - factory method for WebSocket
       * @param {String} address - url to a websocket server
       * @param {Object} options - ws options object with reconnect parameters
       * @param {Function} generate_request_id - custom generation request Id
       * @return {CommonClient}
       */
      constructor(webSocketFactory, address = "ws://localhost:8080", { autoconnect = true, reconnect = true, reconnect_interval = 1000, max_reconnects = 5 } = {}, generate_request_id) {
          super();
          this.webSocketFactory = webSocketFactory;
          this.queue = {};
          this.rpc_id = 0;
          this.address = address;
          this.autoconnect = autoconnect;
          this.ready = false;
          this.reconnect = reconnect;
          this.reconnect_interval = reconnect_interval;
          this.max_reconnects = max_reconnects;
          this.current_reconnects = 0;
          this.generate_request_id = generate_request_id || (() => ++this.rpc_id);
          if (this.autoconnect)
              this._connect(this.address, {
                  autoconnect: this.autoconnect,
                  reconnect: this.reconnect,
                  reconnect_interval: this.reconnect_interval,
                  max_reconnects: this.max_reconnects
              });
      }
      /**
       * Connects to a defined server if not connected already.
       * @method
       * @return {Undefined}
       */
      connect() {
          if (this.socket)
              return;
          this._connect(this.address, {
              autoconnect: this.autoconnect,
              reconnect: this.reconnect,
              reconnect_interval: this.reconnect_interval,
              max_reconnects: this.max_reconnects
          });
      }
      /**
       * Calls a registered RPC method on server.
       * @method
       * @param {String} method - RPC method name
       * @param {Object|Array} params - optional method parameters
       * @param {Number} timeout - RPC reply timeout value
       * @param {Object} ws_opts - options passed to ws
       * @return {Promise}
       */
      call(method, params, timeout, ws_opts) {
          if (!ws_opts && "object" === typeof timeout) {
              ws_opts = timeout;
              timeout = null;
          }
          return new Promise((resolve, reject) => {
              if (!this.ready)
                  return reject(new Error("socket not ready"));
              const rpc_id = this.generate_request_id(method, params);
              const message = {
                  jsonrpc: "2.0",
                  method: method,
                  params: params || null,
                  id: rpc_id
              };
              this.socket.send(JSON.stringify(message), ws_opts, (error) => {
                  if (error)
                      return reject(error);
                  this.queue[rpc_id] = { promise: [resolve, reject] };
                  if (timeout) {
                      this.queue[rpc_id].timeout = setTimeout(() => {
                          this.queue[rpc_id] = null;
                          reject(new Error("reply timeout"));
                      }, timeout);
                  }
              });
          });
      }
      /**
       * Logins with the other side of the connection.
       * @method
       * @param {Object} params - Login credentials object
       * @return {Promise}
       */
      async login(params) {
          const resp = await this.call("rpc.login", params);
          if (!resp)
              throw new Error("authentication failed");
      }
      /**
       * Fetches a list of client's methods registered on server.
       * @method
       * @return {Array}
       */
      async listMethods() {
          return await this.call("__listMethods");
      }
      /**
       * Sends a JSON-RPC 2.0 notification to server.
       * @method
       * @param {String} method - RPC method name
       * @param {Object} params - optional method parameters
       * @return {Promise}
       */
      notify(method, params) {
          return new Promise((resolve, reject) => {
              if (!this.ready)
                  return reject(new Error("socket not ready"));
              const message = {
                  jsonrpc: "2.0",
                  method: method,
                  params: params || null
              };
              this.socket.send(JSON.stringify(message), (error) => {
                  if (error)
                      return reject(error);
                  resolve();
              });
          });
      }
      /**
       * Subscribes for a defined event.
       * @method
       * @param {String|Array} event - event name
       * @return {Undefined}
       * @throws {Error}
       */
      async subscribe(event) {
          if (typeof event === "string")
              event = [event];
          const result = await this.call("rpc.on", event);
          if (typeof event === "string" && result[event] !== "ok")
              throw new Error("Failed subscribing to an event '" + event + "' with: " + result[event]);
          return result;
      }
      /**
       * Unsubscribes from a defined event.
       * @method
       * @param {String|Array} event - event name
       * @return {Undefined}
       * @throws {Error}
       */
      async unsubscribe(event) {
          if (typeof event === "string")
              event = [event];
          const result = await this.call("rpc.off", event);
          if (typeof event === "string" && result[event] !== "ok")
              throw new Error("Failed unsubscribing from an event with: " + result);
          return result;
      }
      /**
       * Closes a WebSocket connection gracefully.
       * @method
       * @param {Number} code - socket close code
       * @param {String} data - optional data to be sent before closing
       * @return {Undefined}
       */
      close(code, data) {
          this.socket.close(code || 1000, data);
      }
      /**
       * Connection/Message handler.
       * @method
       * @private
       * @param {String} address - WebSocket API address
       * @param {Object} options - ws options object
       * @return {Undefined}
       */
      _connect(address, options) {
          this.socket = this.webSocketFactory(address, options);
          this.socket.addEventListener("open", () => {
              this.ready = true;
              this.emit("open");
              this.current_reconnects = 0;
          });
          this.socket.addEventListener("message", ({ data: message }) => {
              if (message instanceof ArrayBuffer)
                  message = Buffer.from(message).toString();
              try {
                  message = CircularJSON.parse(message);
              }
              catch (error) {
                  return;
              }
              // check if any listeners are attached and forward event
              if (message.notification && this.listeners(message.notification).length) {
                  if (!Object.keys(message.params).length)
                      return this.emit(message.notification);
                  const args = [message.notification];
                  if (message.params.constructor === Object)
                      args.push(message.params);
                  else
                      // using for-loop instead of unshift/spread because performance is better
                      for (let i = 0; i < message.params.length; i++)
                          args.push(message.params[i]);
                  // run as microtask so that pending queue messages are resolved first
                  // eslint-disable-next-line prefer-spread
                  return Promise.resolve().then(() => { this.emit.apply(this, args); });
              }
              if (!this.queue[message.id]) {
                  // general JSON RPC 2.0 events
                  if (message.method && message.params) {
                      // run as microtask so that pending queue messages are resolved first
                      return Promise.resolve().then(() => {
                          this.emit(message.method, message.params);
                      });
                  }
                  return;
              }
              // reject early since server's response is invalid
              if ("error" in message === "result" in message)
                  this.queue[message.id].promise[1](new Error("Server response malformed. Response must include either \"result\"" +
                      " or \"error\", but not both."));
              if (this.queue[message.id].timeout)
                  clearTimeout(this.queue[message.id].timeout);
              if (message.error)
                  this.queue[message.id].promise[1](message.error);
              else
                  this.queue[message.id].promise[0](message.result);
              this.queue[message.id] = null;
          });
          this.socket.addEventListener("error", (error) => this.emit("error", error));
          this.socket.addEventListener("close", ({ code, reason }) => {
              if (this.ready) // Delay close event until internal state is updated
                  setTimeout(() => this.emit("close", code, reason), 0);
              this.ready = false;
              this.socket = undefined;
              if (code === 1000)
                  return;
              this.current_reconnects++;
              if (this.reconnect && ((this.max_reconnects > this.current_reconnects) ||
                  this.max_reconnects === 0))
                  setTimeout(() => this._connect(address, options), this.reconnect_interval);
          });
      }
  }

  class Client extends CommonClient {
      constructor(address = "ws://localhost:8080", { autoconnect = true, reconnect = true, reconnect_interval = 1000, max_reconnects = 5 } = {}, generate_request_id) {
          super(WebSocketBrowserImpl$1, address, {
              autoconnect,
              reconnect,
              reconnect_interval,
              max_reconnects
          }, generate_request_id);
      }
  }

  var rpcWebsockets = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Client: Client
  });

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const directives = new WeakMap();
  /**
   * Brands a function as a directive so that lit-html will call the function
   * during template rendering, rather than passing as a value.
   *
   * @param f The directive factory function. Must be a function that returns a
   * function of the signature `(part: Part) => void`. The returned function will
   * be called with the part object
   *
   * @example
   *
   * ```
   * import {directive, html} from 'lit-html';
   *
   * const immutable = directive((v) => (part) => {
   *   if (part.value !== v) {
   *     part.setValue(v)
   *   }
   * });
   * ```
   */
  // tslint:disable-next-line:no-any
  const directive = (f) => ((...args) => {
      const d = f(...args);
      directives.set(d, true);
      return d;
  });
  const isDirective = (o) => {
      return typeof o === 'function' && directives.has(o);
  };
  //# =directive.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * True if the custom elements polyfill is in use.
   */
  const isCEPolyfill = window.customElements !== undefined &&
      window.customElements.polyfillWrapFlushCallback !==
          undefined;
  /**
   * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), into another container (could be the same container), before
   * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
   * container.
   */
  const reparentNodes = (container, start, end = null, before = null) => {
      let node = start;
      while (node !== end) {
          const n = node.nextSibling;
          container.insertBefore(node, before);
          node = n;
      }
  };
  /**
   * Removes nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), from `container`.
   */
  const removeNodes = (container, startNode, endNode = null) => {
      let node = startNode;
      while (node !== endNode) {
          const n = node.nextSibling;
          container.removeChild(node);
          node = n;
      }
  };
  //# =dom.js.map

  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * A sentinel value that signals that a value was handled by a directive and
   * should not be written to the DOM.
   */
  const noChange = {};
  /**
   * A sentinel value that signals a NodePart to fully clear its content.
   */
  const nothing = {};
  //# =part.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * An expression marker with embedded unique key to avoid collision with
   * possible text in templates.
   */
  const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
  /**
   * An expression marker used text-positions, multi-binding attributes, and
   * attributes with markup-like text values.
   */
  const nodeMarker = `<!--${marker}-->`;
  const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
  /**
   * Suffix appended to all bound attribute names.
   */
  const boundAttributeSuffix = '$lit$';
  /**
   * An updateable Template that tracks the location of dynamic parts.
   */
  class Template {
      constructor(result, element) {
          this.parts = [];
          this.element = element;
          let index = -1;
          let partIndex = 0;
          const nodesToRemove = [];
          const _prepareTemplate = (template) => {
              const content = template.content;
              // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
              // null
              const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
              // Keeps track of the last index associated with a part. We try to delete
              // unnecessary nodes, but we never want to associate two different parts
              // to the same index. They must have a constant node between.
              let lastPartIndex = 0;
              while (walker.nextNode()) {
                  index++;
                  const node = walker.currentNode;
                  if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                      if (node.hasAttributes()) {
                          const attributes = node.attributes;
                          // Per
                          // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                          // attributes are not guaranteed to be returned in document order.
                          // In particular, Edge/IE can return them out of order, so we cannot
                          // assume a correspondance between part index and attribute index.
                          let count = 0;
                          for (let i = 0; i < attributes.length; i++) {
                              if (attributes[i].value.indexOf(marker) >= 0) {
                                  count++;
                              }
                          }
                          while (count-- > 0) {
                              // Get the template literal section leading up to the first
                              // expression in this attribute
                              const stringForPart = result.strings[partIndex];
                              // Find the attribute name
                              const name = lastAttributeNameRegex.exec(stringForPart)[2];
                              // Find the corresponding attribute
                              // All bound attributes have had a suffix added in
                              // TemplateResult#getHTML to opt out of special attribute
                              // handling. To look up the attribute value we also need to add
                              // the suffix.
                              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                              const attributeValue = node.getAttribute(attributeLookupName);
                              const strings = attributeValue.split(markerRegex);
                              this.parts.push({ type: 'attribute', index, name, strings });
                              node.removeAttribute(attributeLookupName);
                              partIndex += strings.length - 1;
                          }
                      }
                      if (node.tagName === 'TEMPLATE') {
                          _prepareTemplate(node);
                      }
                  }
                  else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                      const data = node.data;
                      if (data.indexOf(marker) >= 0) {
                          const parent = node.parentNode;
                          const strings = data.split(markerRegex);
                          const lastIndex = strings.length - 1;
                          // Generate a new text node for each literal section
                          // These nodes are also used as the markers for node parts
                          for (let i = 0; i < lastIndex; i++) {
                              parent.insertBefore((strings[i] === '') ? createMarker() :
                                  document.createTextNode(strings[i]), node);
                              this.parts.push({ type: 'node', index: ++index });
                          }
                          // If there's no text, we must insert a comment to mark our place.
                          // Else, we can trust it will stick around after cloning.
                          if (strings[lastIndex] === '') {
                              parent.insertBefore(createMarker(), node);
                              nodesToRemove.push(node);
                          }
                          else {
                              node.data = strings[lastIndex];
                          }
                          // We have a part for each match found
                          partIndex += lastIndex;
                      }
                  }
                  else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                      if (node.data === marker) {
                          const parent = node.parentNode;
                          // Add a new marker node to be the startNode of the Part if any of
                          // the following are true:
                          //  * We don't have a previousSibling
                          //  * The previousSibling is already the start of a previous part
                          if (node.previousSibling === null || index === lastPartIndex) {
                              index++;
                              parent.insertBefore(createMarker(), node);
                          }
                          lastPartIndex = index;
                          this.parts.push({ type: 'node', index });
                          // If we don't have a nextSibling, keep this node so we have an end.
                          // Else, we can remove it to save future costs.
                          if (node.nextSibling === null) {
                              node.data = '';
                          }
                          else {
                              nodesToRemove.push(node);
                              index--;
                          }
                          partIndex++;
                      }
                      else {
                          let i = -1;
                          while ((i = node.data.indexOf(marker, i + 1)) !==
                              -1) {
                              // Comment node has a binding marker inside, make an inactive part
                              // The binding won't work, but subsequent bindings will
                              // TODO (justinfagnani): consider whether it's even worth it to
                              // make bindings in comments work
                              this.parts.push({ type: 'node', index: -1 });
                          }
                      }
                  }
              }
          };
          _prepareTemplate(element);
          // Remove text binding nodes after the walk to not disturb the TreeWalker
          for (const n of nodesToRemove) {
              n.parentNode.removeChild(n);
          }
      }
  }
  const isTemplatePartActive = (part) => part.index !== -1;
  // Allows `document.createComment('')` to be renamed for a
  // small manual size-savings.
  const createMarker = () => document.createComment('');
  /**
   * This regex extracts the attribute name preceding an attribute-position
   * expression. It does this by matching the syntax allowed for attributes
   * against the string literal directly preceding the expression, assuming that
   * the expression is in an attribute-value position.
   *
   * See attributes in the HTML spec:
   * https://www.w3.org/TR/html5/syntax.html#attributes-0
   *
   * "\0-\x1F\x7F-\x9F" are Unicode control characters
   *
   * " \x09\x0a\x0c\x0d" are HTML space characters:
   * https://www.w3.org/TR/html5/infrastructure.html#space-character
   *
   * So an attribute is:
   *  * The name: any character except a control character, space character, ('),
   *    ("), ">", "=", or "/"
   *  * Followed by zero or more space characters
   *  * Followed by "="
   *  * Followed by zero or more space characters
   *  * Followed by:
   *    * Any character except space, ('), ("), "<", ">", "=", (`), or
   *    * (") then any non-("), or
   *    * (') then any non-(')
   */
  const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
  //# =template.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * An instance of a `Template` that can be attached to the DOM and updated
   * with new values.
   */
  class TemplateInstance {
      constructor(template, processor, options) {
          this._parts = [];
          this.template = template;
          this.processor = processor;
          this.options = options;
      }
      update(values) {
          let i = 0;
          for (const part of this._parts) {
              if (part !== undefined) {
                  part.setValue(values[i]);
              }
              i++;
          }
          for (const part of this._parts) {
              if (part !== undefined) {
                  part.commit();
              }
          }
      }
      _clone() {
          // When using the Custom Elements polyfill, clone the node, rather than
          // importing it, to keep the fragment in the template's document. This
          // leaves the fragment inert so custom elements won't upgrade and
          // potentially modify their contents by creating a polyfilled ShadowRoot
          // while we traverse the tree.
          const fragment = isCEPolyfill ?
              this.template.element.content.cloneNode(true) :
              document.importNode(this.template.element.content, true);
          const parts = this.template.parts;
          let partIndex = 0;
          let nodeIndex = 0;
          const _prepareInstance = (fragment) => {
              // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
              // null
              const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
              let node = walker.nextNode();
              // Loop through all the nodes and parts of a template
              while (partIndex < parts.length && node !== null) {
                  const part = parts[partIndex];
                  // Consecutive Parts may have the same node index, in the case of
                  // multiple bound attributes on an element. So each iteration we either
                  // increment the nodeIndex, if we aren't on a node with a part, or the
                  // partIndex if we are. By not incrementing the nodeIndex when we find a
                  // part, we allow for the next part to be associated with the current
                  // node if neccessasry.
                  if (!isTemplatePartActive(part)) {
                      this._parts.push(undefined);
                      partIndex++;
                  }
                  else if (nodeIndex === part.index) {
                      if (part.type === 'node') {
                          const part = this.processor.handleTextExpression(this.options);
                          part.insertAfterNode(node.previousSibling);
                          this._parts.push(part);
                      }
                      else {
                          this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                      }
                      partIndex++;
                  }
                  else {
                      nodeIndex++;
                      if (node.nodeName === 'TEMPLATE') {
                          _prepareInstance(node.content);
                      }
                      node = walker.nextNode();
                  }
              }
          };
          _prepareInstance(fragment);
          if (isCEPolyfill) {
              document.adoptNode(fragment);
              customElements.upgrade(fragment);
          }
          return fragment;
      }
  }
  //# =template-instance.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * The return type of `html`, which holds a Template and the values from
   * interpolated expressions.
   */
  class TemplateResult {
      constructor(strings, values, type, processor) {
          this.strings = strings;
          this.values = values;
          this.type = type;
          this.processor = processor;
      }
      /**
       * Returns a string of HTML used to create a `<template>` element.
       */
      getHTML() {
          const endIndex = this.strings.length - 1;
          let html = '';
          for (let i = 0; i < endIndex; i++) {
              const s = this.strings[i];
              // This exec() call does two things:
              // 1) Appends a suffix to the bound attribute name to opt out of special
              // attribute value parsing that IE11 and Edge do, like for style and
              // many SVG attributes. The Template class also appends the same suffix
              // when looking up attributes to create Parts.
              // 2) Adds an unquoted-attribute-safe marker for the first expression in
              // an attribute. Subsequent attribute expressions will use node markers,
              // and this is safe since attributes with multiple expressions are
              // guaranteed to be quoted.
              const match = lastAttributeNameRegex.exec(s);
              if (match) {
                  // We're starting a new bound attribute.
                  // Add the safe attribute suffix, and use unquoted-attribute-safe
                  // marker.
                  html += s.substr(0, match.index) + match[1] + match[2] +
                      boundAttributeSuffix + match[3] + marker;
              }
              else {
                  // We're either in a bound node, or trailing bound attribute.
                  // Either way, nodeMarker is safe to use.
                  html += s + nodeMarker;
              }
          }
          return html + this.strings[endIndex];
      }
      getTemplateElement() {
          const template = document.createElement('template');
          template.innerHTML = this.getHTML();
          return template;
      }
  }
  //# =template-result.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const isPrimitive = (value) => {
      return (value === null ||
          !(typeof value === 'object' || typeof value === 'function'));
  };
  /**
   * Sets attribute values for AttributeParts, so that the value is only set once
   * even if there are multiple parts for an attribute.
   */
  class AttributeCommitter {
      constructor(element, name, strings) {
          this.dirty = true;
          this.element = element;
          this.name = name;
          this.strings = strings;
          this.parts = [];
          for (let i = 0; i < strings.length - 1; i++) {
              this.parts[i] = this._createPart();
          }
      }
      /**
       * Creates a single part. Override this to create a differnt type of part.
       */
      _createPart() {
          return new AttributePart(this);
      }
      _getValue() {
          const strings = this.strings;
          const l = strings.length - 1;
          let text = '';
          for (let i = 0; i < l; i++) {
              text += strings[i];
              const part = this.parts[i];
              if (part !== undefined) {
                  const v = part.value;
                  if (v != null &&
                      (Array.isArray(v) ||
                          // tslint:disable-next-line:no-any
                          typeof v !== 'string' && v[Symbol.iterator])) {
                      for (const t of v) {
                          text += typeof t === 'string' ? t : String(t);
                      }
                  }
                  else {
                      text += typeof v === 'string' ? v : String(v);
                  }
              }
          }
          text += strings[l];
          return text;
      }
      commit() {
          if (this.dirty) {
              this.dirty = false;
              this.element.setAttribute(this.name, this._getValue());
          }
      }
  }
  class AttributePart {
      constructor(comitter) {
          this.value = undefined;
          this.committer = comitter;
      }
      setValue(value) {
          if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
              this.value = value;
              // If the value is a not a directive, dirty the committer so that it'll
              // call setAttribute. If the value is a directive, it'll dirty the
              // committer if it calls setValue().
              if (!isDirective(value)) {
                  this.committer.dirty = true;
              }
          }
      }
      commit() {
          while (isDirective(this.value)) {
              const directive = this.value;
              this.value = noChange;
              directive(this);
          }
          if (this.value === noChange) {
              return;
          }
          this.committer.commit();
      }
  }
  class NodePart {
      constructor(options) {
          this.value = undefined;
          this._pendingValue = undefined;
          this.options = options;
      }
      /**
       * Inserts this part into a container.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      appendInto(container) {
          this.startNode = container.appendChild(createMarker());
          this.endNode = container.appendChild(createMarker());
      }
      /**
       * Inserts this part between `ref` and `ref`'s next sibling. Both `ref` and
       * its next sibling must be static, unchanging nodes such as those that appear
       * in a literal section of a template.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      insertAfterNode(ref) {
          this.startNode = ref;
          this.endNode = ref.nextSibling;
      }
      /**
       * Appends this part into a parent part.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      appendIntoPart(part) {
          part._insert(this.startNode = createMarker());
          part._insert(this.endNode = createMarker());
      }
      /**
       * Appends this part after `ref`
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      insertAfterPart(ref) {
          ref._insert(this.startNode = createMarker());
          this.endNode = ref.endNode;
          ref.endNode = this.startNode;
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          const value = this._pendingValue;
          if (value === noChange) {
              return;
          }
          if (isPrimitive(value)) {
              if (value !== this.value) {
                  this._commitText(value);
              }
          }
          else if (value instanceof TemplateResult) {
              this._commitTemplateResult(value);
          }
          else if (value instanceof Node) {
              this._commitNode(value);
          }
          else if (Array.isArray(value) ||
              // tslint:disable-next-line:no-any
              value[Symbol.iterator]) {
              this._commitIterable(value);
          }
          else if (value === nothing) {
              this.value = nothing;
              this.clear();
          }
          else {
              // Fallback, will render the string representation
              this._commitText(value);
          }
      }
      _insert(node) {
          this.endNode.parentNode.insertBefore(node, this.endNode);
      }
      _commitNode(value) {
          if (this.value === value) {
              return;
          }
          this.clear();
          this._insert(value);
          this.value = value;
      }
      _commitText(value) {
          const node = this.startNode.nextSibling;
          value = value == null ? '' : value;
          if (node === this.endNode.previousSibling &&
              node.nodeType === 3 /* Node.TEXT_NODE */) {
              // If we only have a single text node between the markers, we can just
              // set its value, rather than replacing it.
              // TODO(justinfagnani): Can we just check if this.value is primitive?
              node.data = value;
          }
          else {
              this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
          }
          this.value = value;
      }
      _commitTemplateResult(value) {
          const template = this.options.templateFactory(value);
          if (this.value instanceof TemplateInstance &&
              this.value.template === template) {
              this.value.update(value.values);
          }
          else {
              // Make sure we propagate the template processor from the TemplateResult
              // so that we use its syntax extension, etc. The template factory comes
              // from the render function options so that it can control template
              // caching and preprocessing.
              const instance = new TemplateInstance(template, value.processor, this.options);
              const fragment = instance._clone();
              instance.update(value.values);
              this._commitNode(fragment);
              this.value = instance;
          }
      }
      _commitIterable(value) {
          // For an Iterable, we create a new InstancePart per item, then set its
          // value to the item. This is a little bit of overhead for every item in
          // an Iterable, but it lets us recurse easily and efficiently update Arrays
          // of TemplateResults that will be commonly returned from expressions like:
          // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
          // If _value is an array, then the previous render was of an
          // iterable and _value will contain the NodeParts from the previous
          // render. If _value is not an array, clear this part and make a new
          // array for NodeParts.
          if (!Array.isArray(this.value)) {
              this.value = [];
              this.clear();
          }
          // Lets us keep track of how many items we stamped so we can clear leftover
          // items from a previous render
          const itemParts = this.value;
          let partIndex = 0;
          let itemPart;
          for (const item of value) {
              // Try to reuse an existing part
              itemPart = itemParts[partIndex];
              // If no existing part, create a new one
              if (itemPart === undefined) {
                  itemPart = new NodePart(this.options);
                  itemParts.push(itemPart);
                  if (partIndex === 0) {
                      itemPart.appendIntoPart(this);
                  }
                  else {
                      itemPart.insertAfterPart(itemParts[partIndex - 1]);
                  }
              }
              itemPart.setValue(item);
              itemPart.commit();
              partIndex++;
          }
          if (partIndex < itemParts.length) {
              // Truncate the parts array so _value reflects the current state
              itemParts.length = partIndex;
              this.clear(itemPart && itemPart.endNode);
          }
      }
      clear(startNode = this.startNode) {
          removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
      }
  }
  /**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */
  class BooleanAttributePart {
      constructor(element, name, strings) {
          this.value = undefined;
          this._pendingValue = undefined;
          if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
              throw new Error('Boolean attributes can only contain a single expression');
          }
          this.element = element;
          this.name = name;
          this.strings = strings;
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          if (this._pendingValue === noChange) {
              return;
          }
          const value = !!this._pendingValue;
          if (this.value !== value) {
              if (value) {
                  this.element.setAttribute(this.name, '');
              }
              else {
                  this.element.removeAttribute(this.name);
              }
          }
          this.value = value;
          this._pendingValue = noChange;
      }
  }
  /**
   * Sets attribute values for PropertyParts, so that the value is only set once
   * even if there are multiple parts for a property.
   *
   * If an expression controls the whole property value, then the value is simply
   * assigned to the property under control. If there are string literals or
   * multiple expressions, then the strings are expressions are interpolated into
   * a string first.
   */
  class PropertyCommitter extends AttributeCommitter {
      constructor(element, name, strings) {
          super(element, name, strings);
          this.single =
              (strings.length === 2 && strings[0] === '' && strings[1] === '');
      }
      _createPart() {
          return new PropertyPart(this);
      }
      _getValue() {
          if (this.single) {
              return this.parts[0].value;
          }
          return super._getValue();
      }
      commit() {
          if (this.dirty) {
              this.dirty = false;
              // tslint:disable-next-line:no-any
              this.element[this.name] = this._getValue();
          }
      }
  }
  class PropertyPart extends AttributePart {
  }
  // Detect event listener options support. If the `capture` property is read
  // from the options object, then options are supported. If not, then the thrid
  // argument to add/removeEventListener is interpreted as the boolean capture
  // value so we should only pass the `capture` property.
  let eventOptionsSupported = false;
  try {
      const options = {
          get capture() {
              eventOptionsSupported = true;
              return false;
          }
      };
      // tslint:disable-next-line:no-any
      window.addEventListener('test', options, options);
      // tslint:disable-next-line:no-any
      window.removeEventListener('test', options, options);
  }
  catch (_e) {
  }
  class EventPart {
      constructor(element, eventName, eventContext) {
          this.value = undefined;
          this._pendingValue = undefined;
          this.element = element;
          this.eventName = eventName;
          this.eventContext = eventContext;
          this._boundHandleEvent = (e) => this.handleEvent(e);
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          if (this._pendingValue === noChange) {
              return;
          }
          const newListener = this._pendingValue;
          const oldListener = this.value;
          const shouldRemoveListener = newListener == null ||
              oldListener != null &&
                  (newListener.capture !== oldListener.capture ||
                      newListener.once !== oldListener.once ||
                      newListener.passive !== oldListener.passive);
          const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
          if (shouldRemoveListener) {
              this.element.removeEventListener(this.eventName, this._boundHandleEvent, this._options);
          }
          if (shouldAddListener) {
              this._options = getOptions(newListener);
              this.element.addEventListener(this.eventName, this._boundHandleEvent, this._options);
          }
          this.value = newListener;
          this._pendingValue = noChange;
      }
      handleEvent(event) {
          if (typeof this.value === 'function') {
              this.value.call(this.eventContext || this.element, event);
          }
          else {
              this.value.handleEvent(event);
          }
      }
  }
  // We copy options because of the inconsistent behavior of browsers when reading
  // the third argument of add/removeEventListener. IE11 doesn't support options
  // at all. Chrome 41 only reads `capture` if the argument is an object.
  const getOptions = (o) => o &&
      (eventOptionsSupported ?
          { capture: o.capture, passive: o.passive, once: o.once } :
          o.capture);
  //# =parts.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * Creates Parts when a template is instantiated.
   */
  class DefaultTemplateProcessor {
      /**
       * Create parts for an attribute-position binding, given the event, attribute
       * name, and string literals.
       *
       * @param element The element containing the binding
       * @param name  The attribute name
       * @param strings The string literals. There are always at least two strings,
       *   event for fully-controlled bindings with a single expression.
       */
      handleAttributeExpressions(element, name, strings, options) {
          const prefix = name[0];
          if (prefix === '.') {
              const comitter = new PropertyCommitter(element, name.slice(1), strings);
              return comitter.parts;
          }
          if (prefix === '@') {
              return [new EventPart(element, name.slice(1), options.eventContext)];
          }
          if (prefix === '?') {
              return [new BooleanAttributePart(element, name.slice(1), strings)];
          }
          const comitter = new AttributeCommitter(element, name, strings);
          return comitter.parts;
      }
      /**
       * Create parts for a text-position binding.
       * @param templateFactory
       */
      handleTextExpression(options) {
          return new NodePart(options);
      }
  }
  const defaultTemplateProcessor = new DefaultTemplateProcessor();
  //# =default-template-processor.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * The default TemplateFactory which caches Templates keyed on
   * result.type and result.strings.
   */
  function templateFactory(result) {
      let templateCache = templateCaches.get(result.type);
      if (templateCache === undefined) {
          templateCache = {
              stringsArray: new WeakMap(),
              keyString: new Map()
          };
          templateCaches.set(result.type, templateCache);
      }
      let template = templateCache.stringsArray.get(result.strings);
      if (template !== undefined) {
          return template;
      }
      // If the TemplateStringsArray is new, generate a key from the strings
      // This key is shared between all templates with identical content
      const key = result.strings.join(marker);
      // Check if we already have a Template for this key
      template = templateCache.keyString.get(key);
      if (template === undefined) {
          // If we have not seen this key before, create a new Template
          template = new Template(result, result.getTemplateElement());
          // Cache the Template for this key
          templateCache.keyString.set(key, template);
      }
      // Cache all future queries for this TemplateStringsArray
      templateCache.stringsArray.set(result.strings, template);
      return template;
  }
  const templateCaches = new Map();
  //# =template-factory.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const parts = new WeakMap();
  /**
   * Renders a template to a container.
   *
   * To update a container with new values, reevaluate the template literal and
   * call `render` with the new result.
   *
   * @param result a TemplateResult created by evaluating a template tag like
   *     `html` or `svg`.
   * @param container A DOM parent to render to. The entire contents are either
   *     replaced, or efficiently updated if the same result type was previous
   *     rendered there.
   * @param options RenderOptions for the entire render tree rendered to this
   *     container. Render options must *not* change between renders to the same
   *     container, as those changes will not effect previously rendered DOM.
   */
  const render = (result, container, options) => {
      let part = parts.get(container);
      if (part === undefined) {
          removeNodes(container, container.firstChild);
          parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
          part.appendInto(container);
      }
      part.setValue(result);
      part.commit();
  };
  //# =render.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // IMPORTANT: do not change the property name or the assignment expression.
  // This line will be used in regexes to search for lit-html usage.
  // TODO(justinfagnani): inject version number at build time
  (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.0.0');
  /**
   * Interprets a template literal as an HTML template that can efficiently
   * render to and update a container.
   */
  const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
  //# =lit-html.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
  /**
   * Removes the list of nodes from a Template safely. In addition to removing
   * nodes from the Template, the Template part indices are updated to match
   * the mutated Template DOM.
   *
   * As the template is walked the removal state is tracked and
   * part indices are adjusted as needed.
   *
   * div
   *   div#1 (remove) <-- start removing (removing node is div#1)
   *     div
   *       div#2 (remove)  <-- continue removing (removing node is still div#1)
   *         div
   * div <-- stop removing since previous sibling is the removing node (div#1,
   * removed 4 nodes)
   */
  function removeNodesFromTemplate(template, nodesToRemove) {
      const { element: { content }, parts } = template;
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = nextActiveIndexInTemplateParts(parts);
      let part = parts[partIndex];
      let nodeIndex = -1;
      let removeCount = 0;
      const nodesToRemoveInTemplate = [];
      let currentRemovingNode = null;
      while (walker.nextNode()) {
          nodeIndex++;
          const node = walker.currentNode;
          // End removal if stepped past the removing node
          if (node.previousSibling === currentRemovingNode) {
              currentRemovingNode = null;
          }
          // A node to remove was found in the template
          if (nodesToRemove.has(node)) {
              nodesToRemoveInTemplate.push(node);
              // Track node we're removing
              if (currentRemovingNode === null) {
                  currentRemovingNode = node;
              }
          }
          // When removing, increment count by which to adjust subsequent part indices
          if (currentRemovingNode !== null) {
              removeCount++;
          }
          while (part !== undefined && part.index === nodeIndex) {
              // If part is in a removed node deactivate it by setting index to -1 or
              // adjust the index as needed.
              part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
              // go to the next active part.
              partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
              part = parts[partIndex];
          }
      }
      nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
  }
  const countNodes = (node) => {
      let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
      const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
      while (walker.nextNode()) {
          count++;
      }
      return count;
  };
  const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
      for (let i = startIndex + 1; i < parts.length; i++) {
          const part = parts[i];
          if (isTemplatePartActive(part)) {
              return i;
          }
      }
      return -1;
  };
  /**
   * Inserts the given node into the Template, optionally before the given
   * refNode. In addition to inserting the node into the Template, the Template
   * part indices are updated to match the mutated Template DOM.
   */
  function insertNodeIntoTemplate(template, node, refNode = null) {
      const { element: { content }, parts } = template;
      // If there's no refNode, then put node at end of template.
      // No part indices need to be shifted in this case.
      if (refNode === null || refNode === undefined) {
          content.appendChild(node);
          return;
      }
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = nextActiveIndexInTemplateParts(parts);
      let insertCount = 0;
      let walkerIndex = -1;
      while (walker.nextNode()) {
          walkerIndex++;
          const walkerNode = walker.currentNode;
          if (walkerNode === refNode) {
              insertCount = countNodes(node);
              refNode.parentNode.insertBefore(node, refNode);
          }
          while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
              // If we've inserted the node, simply adjust all subsequent parts
              if (insertCount > 0) {
                  while (partIndex !== -1) {
                      parts[partIndex].index += insertCount;
                      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                  }
                  return;
              }
              partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
          }
      }
  }
  //# =modify-template.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // Get a key to lookup in `templateCaches`.
  const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
  let compatibleShadyCSSVersion = true;
  if (typeof window.ShadyCSS === 'undefined') {
      compatibleShadyCSSVersion = false;
  }
  else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
      console.warn(`Incompatible ShadyCSS version detected.` +
          `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` +
          `@webcomponents/shadycss@1.3.1.`);
      compatibleShadyCSSVersion = false;
  }
  /**
   * Template factory which scopes template DOM using ShadyCSS.
   * @param scopeName {string}
   */
  const shadyTemplateFactory = (scopeName) => (result) => {
      const cacheKey = getTemplateCacheKey(result.type, scopeName);
      let templateCache = templateCaches.get(cacheKey);
      if (templateCache === undefined) {
          templateCache = {
              stringsArray: new WeakMap(),
              keyString: new Map()
          };
          templateCaches.set(cacheKey, templateCache);
      }
      let template = templateCache.stringsArray.get(result.strings);
      if (template !== undefined) {
          return template;
      }
      const key = result.strings.join(marker);
      template = templateCache.keyString.get(key);
      if (template === undefined) {
          const element = result.getTemplateElement();
          if (compatibleShadyCSSVersion) {
              window.ShadyCSS.prepareTemplateDom(element, scopeName);
          }
          template = new Template(result, element);
          templateCache.keyString.set(key, template);
      }
      templateCache.stringsArray.set(result.strings, template);
      return template;
  };
  const TEMPLATE_TYPES = ['html', 'svg'];
  /**
   * Removes all style elements from Templates for the given scopeName.
   */
  const removeStylesFromLitTemplates = (scopeName) => {
      TEMPLATE_TYPES.forEach((type) => {
          const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
          if (templates !== undefined) {
              templates.keyString.forEach((template) => {
                  const { element: { content } } = template;
                  // IE 11 doesn't support the iterable param Set constructor
                  const styles = new Set();
                  Array.from(content.querySelectorAll('style')).forEach((s) => {
                      styles.add(s);
                  });
                  removeNodesFromTemplate(template, styles);
              });
          }
      });
  };
  const shadyRenderSet = new Set();
  /**
   * For the given scope name, ensures that ShadyCSS style scoping is performed.
   * This is done just once per scope name so the fragment and template cannot
   * be modified.
   * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
   * to be scoped and appended to the document
   * (2) removes style elements from all lit-html Templates for this scope name.
   *
   * Note, <style> elements can only be placed into templates for the
   * initial rendering of the scope. If <style> elements are included in templates
   * dynamically rendered to the scope (after the first scope render), they will
   * not be scoped and the <style> will be left in the template and rendered
   * output.
   */
  const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
      shadyRenderSet.add(scopeName);
      // Move styles out of rendered DOM and store.
      const styles = renderedDOM.querySelectorAll('style');
      // If there are no styles, skip unnecessary work
      if (styles.length === 0) {
          // Ensure prepareTemplateStyles is called to support adding
          // styles via `prepareAdoptedCssText` since that requires that
          // `prepareTemplateStyles` is called.
          window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
          return;
      }
      const condensedStyle = document.createElement('style');
      // Collect styles into a single style. This helps us make sure ShadyCSS
      // manipulations will not prevent us from being able to fix up template
      // part indices.
      // NOTE: collecting styles is inefficient for browsers but ShadyCSS
      // currently does this anyway. When it does not, this should be changed.
      for (let i = 0; i < styles.length; i++) {
          const style = styles[i];
          style.parentNode.removeChild(style);
          condensedStyle.textContent += style.textContent;
      }
      // Remove styles from nested templates in this scope.
      removeStylesFromLitTemplates(scopeName);
      // And then put the condensed style into the "root" template passed in as
      // `template`.
      insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
      // Note, it's important that ShadyCSS gets the template that `lit-html`
      // will actually render so that it can update the style inside when
      // needed (e.g. @apply native Shadow DOM case).
      window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
      if (window.ShadyCSS.nativeShadow) {
          // When in native Shadow DOM, re-add styling to rendered content using
          // the style ShadyCSS produced.
          const style = template.element.content.querySelector('style');
          renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
      }
      else {
          // When not in native Shadow DOM, at this point ShadyCSS will have
          // removed the style from the lit template and parts will be broken as a
          // result. To fix this, we put back the style node ShadyCSS removed
          // and then tell lit to remove that node from the template.
          // NOTE, ShadyCSS creates its own style so we can safely add/remove
          // `condensedStyle` here.
          template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
          const removes = new Set();
          removes.add(condensedStyle);
          removeNodesFromTemplate(template, removes);
      }
  };
  /**
   * Extension to the standard `render` method which supports rendering
   * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
   * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
   * or when the webcomponentsjs
   * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
   *
   * Adds a `scopeName` option which is used to scope element DOM and stylesheets
   * when native ShadowDOM is unavailable. The `scopeName` will be added to
   * the class attribute of all rendered DOM. In addition, any style elements will
   * be automatically re-written with this `scopeName` selector and moved out
   * of the rendered DOM and into the document `<head>`.
   *
   * It is common to use this render method in conjunction with a custom element
   * which renders a shadowRoot. When this is done, typically the element's
   * `localName` should be used as the `scopeName`.
   *
   * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
   * custom properties (needed only on older browsers like IE11) and a shim for
   * a deprecated feature called `@apply` that supports applying a set of css
   * custom properties to a given location.
   *
   * Usage considerations:
   *
   * * Part values in `<style>` elements are only applied the first time a given
   * `scopeName` renders. Subsequent changes to parts in style elements will have
   * no effect. Because of this, parts in style elements should only be used for
   * values that will never change, for example parts that set scope-wide theme
   * values or parts which render shared style elements.
   *
   * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
   * custom element's `constructor` is not supported. Instead rendering should
   * either done asynchronously, for example at microtask timing (for example
   * `Promise.resolve()`), or be deferred until the first time the element's
   * `connectedCallback` runs.
   *
   * Usage considerations when using shimmed custom properties or `@apply`:
   *
   * * Whenever any dynamic changes are made which affect
   * css custom properties, `ShadyCSS.styleElement(element)` must be called
   * to update the element. There are two cases when this is needed:
   * (1) the element is connected to a new parent, (2) a class is added to the
   * element that causes it to match different custom properties.
   * To address the first case when rendering a custom element, `styleElement`
   * should be called in the element's `connectedCallback`.
   *
   * * Shimmed custom properties may only be defined either for an entire
   * shadowRoot (for example, in a `:host` rule) or via a rule that directly
   * matches an element with a shadowRoot. In other words, instead of flowing from
   * parent to child as do native css custom properties, shimmed custom properties
   * flow only from shadowRoots to nested shadowRoots.
   *
   * * When using `@apply` mixing css shorthand property names with
   * non-shorthand names (for example `border` and `border-width`) is not
   * supported.
   */
  const render$1 = (result, container, options) => {
      const scopeName = options.scopeName;
      const hasRendered = parts.has(container);
      const needsScoping = container instanceof ShadowRoot &&
          compatibleShadyCSSVersion && result instanceof TemplateResult;
      // Handle first render to a scope specially...
      const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
      // On first scope render, render into a fragment; this cannot be a single
      // fragment that is reused since nested renders can occur synchronously.
      const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
      render(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
      // When performing first scope render,
      // (1) We've rendered into a fragment so that there's a chance to
      // `prepareTemplateStyles` before sub-elements hit the DOM
      // (which might cause them to render based on a common pattern of
      // rendering in a custom element's `connectedCallback`);
      // (2) Scope the template with ShadyCSS one time only for this scope.
      // (3) Render the fragment into the container and make sure the
      // container knows its `part` is the one we just rendered. This ensures
      // DOM will be re-used on subsequent renders.
      if (firstScopeRender) {
          const part = parts.get(renderContainer);
          parts.delete(renderContainer);
          if (part.value instanceof TemplateInstance) {
              prepareTemplateStyles(renderContainer, part.value.template, scopeName);
          }
          removeNodes(container, container.firstChild);
          container.appendChild(renderContainer);
          parts.set(container, part);
      }
      // After elements have hit the DOM, update styling if this is the
      // initial render to this container.
      // This is needed whenever dynamic changes are made so it would be
      // safest to do every render; however, this would regress performance
      // so we leave it up to the user to call `ShadyCSSS.styleElement`
      // for dynamic changes.
      if (!hasRendered && needsScoping) {
          window.ShadyCSS.styleElement(container.host);
      }
  };
  //# =shady-render.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
   * replaced at compile time by the munged name for object[property]. We cannot
   * alias this function, so we have to use a small shim that has the same
   * behavior when not compiling.
   */
  window.JSCompiler_renameProperty =
      (prop, _obj) => prop;
  const defaultConverter = {
      toAttribute(value, type) {
          switch (type) {
              case Boolean:
                  return value ? '' : null;
              case Object:
              case Array:
                  // if the value is `null` or `undefined` pass this through
                  // to allow removing/no change behavior.
                  return value == null ? value : JSON.stringify(value);
          }
          return value;
      },
      fromAttribute(value, type) {
          switch (type) {
              case Boolean:
                  return value !== null;
              case Number:
                  return value === null ? null : Number(value);
              case Object:
              case Array:
                  return JSON.parse(value);
          }
          return value;
      }
  };
  /**
   * Change function that returns true if `value` is different from `oldValue`.
   * This method is used as the default for a property's `hasChanged` function.
   */
  const notEqual = (value, old) => {
      // This ensures (old==NaN, value==NaN) always returns false
      return old !== value && (old === old || value === value);
  };
  const defaultPropertyDeclaration = {
      attribute: true,
      type: String,
      converter: defaultConverter,
      reflect: false,
      hasChanged: notEqual
  };
  const microtaskPromise = Promise.resolve(true);
  const STATE_HAS_UPDATED = 1;
  const STATE_UPDATE_REQUESTED = 1 << 2;
  const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
  const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
  const STATE_HAS_CONNECTED = 1 << 5;
  /**
   * Base element class which manages element properties and attributes. When
   * properties change, the `update` method is asynchronously called. This method
   * should be supplied by subclassers to render updates as desired.
   */
  class UpdatingElement extends HTMLElement {
      constructor() {
          super();
          this._updateState = 0;
          this._instanceProperties = undefined;
          this._updatePromise = microtaskPromise;
          this._hasConnectedResolver = undefined;
          /**
           * Map with keys for any properties that have changed since the last
           * update cycle with previous values.
           */
          this._changedProperties = new Map();
          /**
           * Map with keys of properties that should be reflected when updated.
           */
          this._reflectingProperties = undefined;
          this.initialize();
      }
      /**
       * Returns a list of attributes corresponding to the registered properties.
       * @nocollapse
       */
      static get observedAttributes() {
          // note: piggy backing on this to ensure we're finalized.
          this.finalize();
          const attributes = [];
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          this._classProperties.forEach((v, p) => {
              const attr = this._attributeNameForProperty(p, v);
              if (attr !== undefined) {
                  this._attributeToPropertyMap.set(attr, p);
                  attributes.push(attr);
              }
          });
          return attributes;
      }
      /**
       * Ensures the private `_classProperties` property metadata is created.
       * In addition to `finalize` this is also called in `createProperty` to
       * ensure the `@property` decorator can add property metadata.
       */
      /** @nocollapse */
      static _ensureClassProperties() {
          // ensure private storage for property declarations.
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
              this._classProperties = new Map();
              // NOTE: Workaround IE11 not supporting Map constructor argument.
              const superProperties = Object.getPrototypeOf(this)._classProperties;
              if (superProperties !== undefined) {
                  superProperties.forEach((v, k) => this._classProperties.set(k, v));
              }
          }
      }
      /**
       * Creates a property accessor on the element prototype if one does not exist.
       * The property setter calls the property's `hasChanged` property option
       * or uses a strict identity check to determine whether or not to request
       * an update.
       * @nocollapse
       */
      static createProperty(name, options = defaultPropertyDeclaration) {
          // Note, since this can be called by the `@property` decorator which
          // is called before `finalize`, we ensure storage exists for property
          // metadata.
          this._ensureClassProperties();
          this._classProperties.set(name, options);
          // Do not generate an accessor if the prototype already has one, since
          // it would be lost otherwise and that would never be the user's intention;
          // Instead, we expect users to call `requestUpdate` themselves from
          // user-defined accessors. Note that if the super has an accessor we will
          // still overwrite it
          if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
              return;
          }
          const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
          Object.defineProperty(this.prototype, name, {
              // tslint:disable-next-line:no-any no symbol in index
              get() {
                  // tslint:disable-next-line:no-any no symbol in index
                  return this[key];
              },
              set(value) {
                  // tslint:disable-next-line:no-any no symbol in index
                  const oldValue = this[name];
                  // tslint:disable-next-line:no-any no symbol in index
                  this[key] = value;
                  this.requestUpdate(name, oldValue);
              },
              configurable: true,
              enumerable: true
          });
      }
      /**
       * Creates property accessors for registered properties and ensures
       * any superclasses are also finalized.
       * @nocollapse
       */
      static finalize() {
          if (this.hasOwnProperty(JSCompiler_renameProperty('finalized', this)) &&
              this.finalized) {
              return;
          }
          // finalize any superclasses
          const superCtor = Object.getPrototypeOf(this);
          if (typeof superCtor.finalize === 'function') {
              superCtor.finalize();
          }
          this.finalized = true;
          this._ensureClassProperties();
          // initialize Map populated in observedAttributes
          this._attributeToPropertyMap = new Map();
          // make any properties
          // Note, only process "own" properties since this element will inherit
          // any properties defined on the superClass, and finalization ensures
          // the entire prototype chain is finalized.
          if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
              const props = this.properties;
              // support symbols in properties (IE11 does not support this)
              const propKeys = [
                  ...Object.getOwnPropertyNames(props),
                  ...(typeof Object.getOwnPropertySymbols === 'function') ?
                      Object.getOwnPropertySymbols(props) :
                      []
              ];
              // This for/of is ok because propKeys is an array
              for (const p of propKeys) {
                  // note, use of `any` is due to TypeSript lack of support for symbol in
                  // index types
                  // tslint:disable-next-line:no-any no symbol in index
                  this.createProperty(p, props[p]);
              }
          }
      }
      /**
       * Returns the property name for the given attribute `name`.
       * @nocollapse
       */
      static _attributeNameForProperty(name, options) {
          const attribute = options.attribute;
          return attribute === false ?
              undefined :
              (typeof attribute === 'string' ?
                  attribute :
                  (typeof name === 'string' ? name.toLowerCase() : undefined));
      }
      /**
       * Returns true if a property should request an update.
       * Called when a property value is set and uses the `hasChanged`
       * option for the property if present or a strict identity check.
       * @nocollapse
       */
      static _valueHasChanged(value, old, hasChanged = notEqual) {
          return hasChanged(value, old);
      }
      /**
       * Returns the property value for the given attribute value.
       * Called via the `attributeChangedCallback` and uses the property's
       * `converter` or `converter.fromAttribute` property option.
       * @nocollapse
       */
      static _propertyValueFromAttribute(value, options) {
          const type = options.type;
          const converter = options.converter || defaultConverter;
          const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
          return fromAttribute ? fromAttribute(value, type) : value;
      }
      /**
       * Returns the attribute value for the given property value. If this
       * returns undefined, the property will *not* be reflected to an attribute.
       * If this returns null, the attribute will be removed, otherwise the
       * attribute will be set to the value.
       * This uses the property's `reflect` and `type.toAttribute` property options.
       * @nocollapse
       */
      static _propertyValueToAttribute(value, options) {
          if (options.reflect === undefined) {
              return;
          }
          const type = options.type;
          const converter = options.converter;
          const toAttribute = converter && converter.toAttribute ||
              defaultConverter.toAttribute;
          return toAttribute(value, type);
      }
      /**
       * Performs element initialization. By default captures any pre-set values for
       * registered properties.
       */
      initialize() {
          this._saveInstanceProperties();
      }
      /**
       * Fixes any properties set on the instance before upgrade time.
       * Otherwise these would shadow the accessor and break these properties.
       * The properties are stored in a Map which is played back after the
       * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
       * (<=41), properties created for native platform properties like (`id` or
       * `name`) may not have default values set in the element constructor. On
       * these browsers native properties appear on instances and therefore their
       * default value will overwrite any element default (e.g. if the element sets
       * this.id = 'id' in the constructor, the 'id' will become '' since this is
       * the native platform default).
       */
      _saveInstanceProperties() {
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          this.constructor
              ._classProperties.forEach((_v, p) => {
              if (this.hasOwnProperty(p)) {
                  const value = this[p];
                  delete this[p];
                  if (!this._instanceProperties) {
                      this._instanceProperties = new Map();
                  }
                  this._instanceProperties.set(p, value);
              }
          });
      }
      /**
       * Applies previously saved instance properties.
       */
      _applyInstanceProperties() {
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          // tslint:disable-next-line:no-any
          this._instanceProperties.forEach((v, p) => this[p] = v);
          this._instanceProperties = undefined;
      }
      connectedCallback() {
          this._updateState = this._updateState | STATE_HAS_CONNECTED;
          // Ensure connection triggers an update. Updates cannot complete before
          // connection and if one is pending connection the `_hasConnectionResolver`
          // will exist. If so, resolve it to complete the update, otherwise
          // requestUpdate.
          if (this._hasConnectedResolver) {
              this._hasConnectedResolver();
              this._hasConnectedResolver = undefined;
          }
          else {
              this.requestUpdate();
          }
      }
      /**
       * Allows for `super.disconnectedCallback()` in extensions while
       * reserving the possibility of making non-breaking feature additions
       * when disconnecting at some point in the future.
       */
      disconnectedCallback() {
      }
      /**
       * Synchronizes property values when attributes change.
       */
      attributeChangedCallback(name, old, value) {
          if (old !== value) {
              this._attributeToProperty(name, value);
          }
      }
      _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
          const ctor = this.constructor;
          const attr = ctor._attributeNameForProperty(name, options);
          if (attr !== undefined) {
              const attrValue = ctor._propertyValueToAttribute(value, options);
              // an undefined value does not change the attribute.
              if (attrValue === undefined) {
                  return;
              }
              // Track if the property is being reflected to avoid
              // setting the property again via `attributeChangedCallback`. Note:
              // 1. this takes advantage of the fact that the callback is synchronous.
              // 2. will behave incorrectly if multiple attributes are in the reaction
              // stack at time of calling. However, since we process attributes
              // in `update` this should not be possible (or an extreme corner case
              // that we'd like to discover).
              // mark state reflecting
              this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
              if (attrValue == null) {
                  this.removeAttribute(attr);
              }
              else {
                  this.setAttribute(attr, attrValue);
              }
              // mark state not reflecting
              this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
          }
      }
      _attributeToProperty(name, value) {
          // Use tracking info to avoid deserializing attribute value if it was
          // just set from a property setter.
          if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
              return;
          }
          const ctor = this.constructor;
          const propName = ctor._attributeToPropertyMap.get(name);
          if (propName !== undefined) {
              const options = ctor._classProperties.get(propName) || defaultPropertyDeclaration;
              // mark state reflecting
              this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
              this[propName] =
                  // tslint:disable-next-line:no-any
                  ctor._propertyValueFromAttribute(value, options);
              // mark state not reflecting
              this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
          }
      }
      /**
       * Requests an update which is processed asynchronously. This should
       * be called when an element should update based on some state not triggered
       * by setting a property. In this case, pass no arguments. It should also be
       * called when manually implementing a property setter. In this case, pass the
       * property `name` and `oldValue` to ensure that any configured property
       * options are honored. Returns the `updateComplete` Promise which is resolved
       * when the update completes.
       *
       * @param name {PropertyKey} (optional) name of requesting property
       * @param oldValue {any} (optional) old value of requesting property
       * @returns {Promise} A Promise that is resolved when the update completes.
       */
      requestUpdate(name, oldValue) {
          let shouldRequestUpdate = true;
          // if we have a property key, perform property update steps.
          if (name !== undefined && !this._changedProperties.has(name)) {
              const ctor = this.constructor;
              const options = ctor._classProperties.get(name) || defaultPropertyDeclaration;
              if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                  // track old value when changing.
                  this._changedProperties.set(name, oldValue);
                  // add to reflecting properties set
                  if (options.reflect === true &&
                      !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                      if (this._reflectingProperties === undefined) {
                          this._reflectingProperties = new Map();
                      }
                      this._reflectingProperties.set(name, options);
                  }
                  // abort the request if the property should not be considered changed.
              }
              else {
                  shouldRequestUpdate = false;
              }
          }
          if (!this._hasRequestedUpdate && shouldRequestUpdate) {
              this._enqueueUpdate();
          }
          return this.updateComplete;
      }
      /**
       * Sets up the element to asynchronously update.
       */
      async _enqueueUpdate() {
          // Mark state updating...
          this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
          let resolve;
          const previousUpdatePromise = this._updatePromise;
          this._updatePromise = new Promise((res) => resolve = res);
          // Ensure any previous update has resolved before updating.
          // This `await` also ensures that property changes are batched.
          await previousUpdatePromise;
          // Make sure the element has connected before updating.
          if (!this._hasConnected) {
              await new Promise((res) => this._hasConnectedResolver = res);
          }
          // Allow `performUpdate` to be asynchronous to enable scheduling of updates.
          const result = this.performUpdate();
          // Note, this is to avoid delaying an additional microtask unless we need
          // to.
          if (result != null &&
              typeof result.then === 'function') {
              await result;
          }
          resolve(!this._hasRequestedUpdate);
      }
      get _hasConnected() {
          return (this._updateState & STATE_HAS_CONNECTED);
      }
      get _hasRequestedUpdate() {
          return (this._updateState & STATE_UPDATE_REQUESTED);
      }
      get hasUpdated() {
          return (this._updateState & STATE_HAS_UPDATED);
      }
      /**
       * Performs an element update.
       *
       * You can override this method to change the timing of updates. For instance,
       * to schedule updates to occur just before the next frame:
       *
       * ```
       * protected async performUpdate(): Promise<unknown> {
       *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
       *   super.performUpdate();
       * }
       * ```
       */
      performUpdate() {
          // Mixin instance properties once, if they exist.
          if (this._instanceProperties) {
              this._applyInstanceProperties();
          }
          if (this.shouldUpdate(this._changedProperties)) {
              const changedProperties = this._changedProperties;
              this.update(changedProperties);
              this._markUpdated();
              if (!(this._updateState & STATE_HAS_UPDATED)) {
                  this._updateState = this._updateState | STATE_HAS_UPDATED;
                  this.firstUpdated(changedProperties);
              }
              this.updated(changedProperties);
          }
          else {
              this._markUpdated();
          }
      }
      _markUpdated() {
          this._changedProperties = new Map();
          this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
      }
      /**
       * Returns a Promise that resolves when the element has completed updating.
       * The Promise value is a boolean that is `true` if the element completed the
       * update without triggering another update. The Promise result is `false` if
       * a property was set inside `updated()`. This getter can be implemented to
       * await additional state. For example, it is sometimes useful to await a
       * rendered element before fulfilling this Promise. To do this, first await
       * `super.updateComplete` then any subsequent state.
       *
       * @returns {Promise} The Promise returns a boolean that indicates if the
       * update resolved without triggering another update.
       */
      get updateComplete() {
          return this._updatePromise;
      }
      /**
       * Controls whether or not `update` should be called when the element requests
       * an update. By default, this method always returns `true`, but this can be
       * customized to control when to update.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      shouldUpdate(_changedProperties) {
          return true;
      }
      /**
       * Updates the element. This method reflects property values to attributes.
       * It can be overridden to render and keep updated element DOM.
       * Setting properties inside this method will *not* trigger
       * another update.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      update(_changedProperties) {
          if (this._reflectingProperties !== undefined &&
              this._reflectingProperties.size > 0) {
              // Use forEach so this works even if for/of loops are compiled to for
              // loops expecting arrays
              this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
              this._reflectingProperties = undefined;
          }
      }
      /**
       * Invoked whenever the element is updated. Implement to perform
       * post-updating tasks via DOM APIs, for example, focusing an element.
       *
       * Setting properties inside this method will trigger the element to update
       * again after this update cycle completes.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      updated(_changedProperties) {
      }
      /**
       * Invoked when the element is first updated. Implement to perform one time
       * work on the element after update.
       *
       * Setting properties inside this method will trigger the element to update
       * again after this update cycle completes.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      firstUpdated(_changedProperties) {
      }
  }
  /**
   * Marks class as having finished creating properties.
   */
  UpdatingElement.finalized = true;
  //# =updating-element.js.map

  /**
  @license
  Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at
  http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
  http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
  found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
  part of the polymer project is also subject to an additional IP rights grant
  found at http://polymer.github.io/PATENTS.txt
  */
  const supportsAdoptingStyleSheets = ('adoptedStyleSheets' in Document.prototype) &&
      ('replace' in CSSStyleSheet.prototype);
  const constructionToken = Symbol();
  class CSSResult {
      constructor(cssText, safeToken) {
          if (safeToken !== constructionToken) {
              throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
          }
          this.cssText = cssText;
      }
      // Note, this is a getter so that it's lazy. In practice, this means
      // stylesheets are not created until the first element instance is made.
      get styleSheet() {
          if (this._styleSheet === undefined) {
              // Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
              // is constructable.
              if (supportsAdoptingStyleSheets) {
                  this._styleSheet = new CSSStyleSheet();
                  this._styleSheet.replaceSync(this.cssText);
              }
              else {
                  this._styleSheet = null;
              }
          }
          return this._styleSheet;
      }
      toString() {
          return this.cssText;
      }
  }
  /**
   * Wrap a value for interpolation in a css tagged template literal.
   *
   * This is unsafe because untrusted CSS text can be used to phone home
   * or exfiltrate data to an attacker controlled site. Take care to only use
   * this with trusted input.
   */
  const unsafeCSS = (value) => {
      return new CSSResult(String(value), constructionToken);
  };
  const textFromCSSResult = (value) => {
      if (value instanceof CSSResult) {
          return value.cssText;
      }
      else {
          throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
      }
  };
  /**
   * Template tag which which can be used with LitElement's `style` property to
   * set element styles. For security reasons, only literal string values may be
   * used. To incorporate non-literal values `unsafeCSS` may be used inside a
   * template string part.
   */
  const css = (strings, ...values) => {
      const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
      return new CSSResult(cssText, constructionToken);
  };
  //# =css-tag.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // IMPORTANT: do not change the property name or the assignment expression.
  // This line will be used in regexes to search for LitElement usage.
  // TODO(justinfagnani): inject version number at build time
  (window['litElementVersions'] || (window['litElementVersions'] = []))
      .push('2.0.1');
  /**
   * Minimal implementation of Array.prototype.flat
   * @param arr the array to flatten
   * @param result the accumlated result
   */
  function arrayFlat(styles, result = []) {
      for (let i = 0, length = styles.length; i < length; i++) {
          const value = styles[i];
          if (Array.isArray(value)) {
              arrayFlat(value, result);
          }
          else {
              result.push(value);
          }
      }
      return result;
  }
  /** Deeply flattens styles array. Uses native flat if available. */
  const flattenStyles = (styles) => styles.flat ? styles.flat(Infinity) : arrayFlat(styles);
  class LitElement extends UpdatingElement {
      /** @nocollapse */
      static finalize() {
          super.finalize();
          // Prepare styling that is stamped at first render time. Styling
          // is built from user provided `styles` or is inherited from the superclass.
          this._styles =
              this.hasOwnProperty(JSCompiler_renameProperty('styles', this)) ?
                  this._getUniqueStyles() :
                  this._styles || [];
      }
      /** @nocollapse */
      static _getUniqueStyles() {
          // Take care not to call `this.styles` multiple times since this generates
          // new CSSResults each time.
          // TODO(sorvell): Since we do not cache CSSResults by input, any
          // shared styles will generate new stylesheet objects, which is wasteful.
          // This should be addressed when a browser ships constructable
          // stylesheets.
          const userStyles = this.styles;
          const styles = [];
          if (Array.isArray(userStyles)) {
              const flatStyles = flattenStyles(userStyles);
              // As a performance optimization to avoid duplicated styling that can
              // occur especially when composing via subclassing, de-duplicate styles
              // preserving the last item in the list. The last item is kept to
              // try to preserve cascade order with the assumption that it's most
              // important that last added styles override previous styles.
              const styleSet = flatStyles.reduceRight((set, s) => {
                  set.add(s);
                  // on IE set.add does not return the set.
                  return set;
              }, new Set());
              // Array.from does not work on Set in IE
              styleSet.forEach((v) => styles.unshift(v));
          }
          else if (userStyles) {
              styles.push(userStyles);
          }
          return styles;
      }
      /**
       * Performs element initialization. By default this calls `createRenderRoot`
       * to create the element `renderRoot` node and captures any pre-set values for
       * registered properties.
       */
      initialize() {
          super.initialize();
          this.renderRoot = this.createRenderRoot();
          // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
          // element's getRootNode(). While this could be done, we're choosing not to
          // support this now since it would require different logic around de-duping.
          if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
              this.adoptStyles();
          }
      }
      /**
       * Returns the node into which the element should render and by default
       * creates and returns an open shadowRoot. Implement to customize where the
       * element's DOM is rendered. For example, to render into the element's
       * childNodes, return `this`.
       * @returns {Element|DocumentFragment} Returns a node into which to render.
       */
      createRenderRoot() {
          return this.attachShadow({ mode: 'open' });
      }
      /**
       * Applies styling to the element shadowRoot using the `static get styles`
       * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
       * available and will fallback otherwise. When Shadow DOM is polyfilled,
       * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
       * is available but `adoptedStyleSheets` is not, styles are appended to the
       * end of the `shadowRoot` to [mimic spec
       * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
       */
      adoptStyles() {
          const styles = this.constructor._styles;
          if (styles.length === 0) {
              return;
          }
          // There are three separate cases here based on Shadow DOM support.
          // (1) shadowRoot polyfilled: use ShadyCSS
          // (2) shadowRoot.adoptedStyleSheets available: use it.
          // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
          // rendering
          if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
              window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
          }
          else if (supportsAdoptingStyleSheets) {
              this.renderRoot.adoptedStyleSheets =
                  styles.map((s) => s.styleSheet);
          }
          else {
              // This must be done after rendering so the actual style insertion is done
              // in `update`.
              this._needsShimAdoptedStyleSheets = true;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          // Note, first update/render handles styleElement so we only call this if
          // connected after first update.
          if (this.hasUpdated && window.ShadyCSS !== undefined) {
              window.ShadyCSS.styleElement(this);
          }
      }
      /**
       * Updates the element. This method reflects property values to attributes
       * and calls `render` to render DOM via lit-html. Setting properties inside
       * this method will *not* trigger another update.
       * * @param _changedProperties Map of changed properties with old values
       */
      update(changedProperties) {
          super.update(changedProperties);
          const templateResult = this.render();
          if (templateResult instanceof TemplateResult) {
              this.constructor
                  .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
          }
          // When native Shadow DOM is used but adoptedStyles are not supported,
          // insert styling after rendering to ensure adoptedStyles have highest
          // priority.
          if (this._needsShimAdoptedStyleSheets) {
              this._needsShimAdoptedStyleSheets = false;
              this.constructor._styles.forEach((s) => {
                  const style = document.createElement('style');
                  style.textContent = s.cssText;
                  this.renderRoot.appendChild(style);
              });
          }
      }
      /**
       * Invoked on each update to perform rendering tasks. This method must return
       * a lit-html TemplateResult. Setting properties inside this method will *not*
       * trigger the element to update.
       */
      render() {
      }
  }
  /**
   * Ensure this class is marked as `finalized` as an optimization ensuring
   * it will not needlessly try to `finalize`.
   */
  LitElement.finalized = true;
  /**
   * Render method used to render the lit-html TemplateResult to the element's
   * DOM.
   * @param {TemplateResult} Template to render.
   * @param {Element|DocumentFragment} Node into which to render.
   * @param {String} Element name.
   * @nocollapse
   */
  LitElement.render = render$1;

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // Helper functions for manipulating parts
  // TODO(kschaaf): Refactor into Part API?
  const createAndInsertPart = (containerPart, beforePart) => {
      const container = containerPart.startNode.parentNode;
      const beforeNode = beforePart === undefined ? containerPart.endNode :
          beforePart.startNode;
      const startNode = container.insertBefore(createMarker(), beforeNode);
      container.insertBefore(createMarker(), beforeNode);
      const newPart = new NodePart(containerPart.options);
      newPart.insertAfterNode(startNode);
      return newPart;
  };
  const updatePart = (part, value) => {
      part.setValue(value);
      part.commit();
      return part;
  };
  const insertPartBefore = (containerPart, part, ref) => {
      const container = containerPart.startNode.parentNode;
      const beforeNode = ref ? ref.startNode : containerPart.endNode;
      const endNode = part.endNode.nextSibling;
      if (endNode !== beforeNode) {
          reparentNodes(container, part.startNode, endNode, beforeNode);
      }
  };
  const removePart = (part) => {
      removeNodes(part.startNode.parentNode, part.startNode, part.endNode.nextSibling);
  };
  // Helper for generating a map of array item to its index over a subset
  // of an array (used to lazily generate `newKeyToIndexMap` and
  // `oldKeyToIndexMap`)
  const generateMap = (list, start, end) => {
      const map = new Map();
      for (let i = start; i <= end; i++) {
          map.set(list[i], i);
      }
      return map;
  };
  // Stores previous ordered list of parts and map of key to index
  const partListCache = new WeakMap();
  const keyListCache = new WeakMap();
  /**
   * A directive that repeats a series of values (usually `TemplateResults`)
   * generated from an iterable, and updates those items efficiently when the
   * iterable changes based on user-provided `keys` associated with each item.
   *
   * Note that if a `keyFn` is provided, strict key-to-DOM mapping is maintained,
   * meaning previous DOM for a given key is moved into the new position if
   * needed, and DOM will never be reused with values for different keys (new DOM
   * will always be created for new keys). This is generally the most efficient
   * way to use `repeat` since it performs minimum unnecessary work for insertions
   * amd removals.
   *
   * IMPORTANT: If providing a `keyFn`, keys *must* be unique for all items in a
   * given call to `repeat`. The behavior when two or more items have the same key
   * is undefined.
   *
   * If no `keyFn` is provided, this directive will perform similar to mapping
   * items to values, and DOM will be reused against potentially different items.
   */
  const repeat = directive((items, keyFnOrTemplate, template) => {
      let keyFn;
      if (template === undefined) {
          template = keyFnOrTemplate;
      }
      else if (keyFnOrTemplate !== undefined) {
          keyFn = keyFnOrTemplate;
      }
      return (containerPart) => {
          if (!(containerPart instanceof NodePart)) {
              throw new Error('repeat can only be used in text bindings');
          }
          // Old part & key lists are retrieved from the last update
          // (associated with the part for this instance of the directive)
          const oldParts = partListCache.get(containerPart) || [];
          const oldKeys = keyListCache.get(containerPart) || [];
          // New part list will be built up as we go (either reused from
          // old parts or created for new keys in this update). This is
          // saved in the above cache at the end of the update.
          const newParts = [];
          // New value list is eagerly generated from items along with a
          // parallel array indicating its key.
          const newValues = [];
          const newKeys = [];
          let index = 0;
          for (const item of items) {
              newKeys[index] = keyFn ? keyFn(item, index) : index;
              newValues[index] = template(item, index);
              index++;
          }
          // Maps from key to index for current and previous update; these
          // are generated lazily only when needed as a performance
          // optimization, since they are only required for multiple
          // non-contiguous changes in the list, which are less common.
          let newKeyToIndexMap;
          let oldKeyToIndexMap;
          // Head and tail pointers to old parts and new values
          let oldHead = 0;
          let oldTail = oldParts.length - 1;
          let newHead = 0;
          let newTail = newValues.length - 1;
          // Overview of O(n) reconciliation algorithm (general approach
          // based on ideas found in ivi, vue, snabbdom, etc.):
          //
          // * We start with the list of old parts and new values (and
          // arrays of
          //   their respective keys), head/tail pointers into each, and
          //   we build up the new list of parts by updating (and when
          //   needed, moving) old parts or creating new ones. The initial
          //   scenario might look like this (for brevity of the diagrams,
          //   the numbers in the array reflect keys associated with the
          //   old parts or new values, although keys and parts/values are
          //   actually stored in parallel arrays indexed using the same
          //   head/tail pointers):
          //
          //      oldHead v                 v oldTail
          //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
          //   newParts: [ ,  ,  ,  ,  ,  ,  ]
          //   newKeys:  [0, 2, 1, 4, 3, 7, 6] <- reflects the user's new
          //   item order
          //      newHead ^                 ^ newTail
          //
          // * Iterate old & new lists from both sides, updating,
          // swapping, or
          //   removing parts at the head/tail locations until neither
          //   head nor tail can move.
          //
          // * Example below: keys at head pointers match, so update old
          // part 0 in-
          //   place (no need to move it) and record part 0 in the
          //   `newParts` list. The last thing we do is advance the
          //   `oldHead` and `newHead` pointers (will be reflected in the
          //   next diagram).
          //
          //      oldHead v                 v oldTail
          //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
          //   newParts: [0,  ,  ,  ,  ,  ,  ] <- heads matched: update 0
          //   and newKeys:  [0, 2, 1, 4, 3, 7, 6]    advance both oldHead
          //   & newHead
          //      newHead ^                 ^ newTail
          //
          // * Example below: head pointers don't match, but tail pointers
          // do, so
          //   update part 6 in place (no need to move it), and record
          //   part 6 in the `newParts` list. Last, advance the `oldTail`
          //   and `oldHead` pointers.
          //
          //         oldHead v              v oldTail
          //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
          //   newParts: [0,  ,  ,  ,  ,  , 6] <- tails matched: update 6
          //   and newKeys:  [0, 2, 1, 4, 3, 7, 6]    advance both oldTail
          //   & newTail
          //         newHead ^              ^ newTail
          //
          // * If neither head nor tail match; next check if one of the
          // old head/tail
          //   items was removed. We first need to generate the reverse
          //   map of new keys to index (`newKeyToIndexMap`), which is
          //   done once lazily as a performance optimization, since we
          //   only hit this case if multiple non-contiguous changes were
          //   made. Note that for contiguous removal anywhere in the
          //   list, the head and tails would advance from either end and
          //   pass each other before we get to this case and removals
          //   would be handled in the final while loop without needing to
          //   generate the map.
          //
          // * Example below: The key at `oldTail` was removed (no longer
          // in the
          //   `newKeyToIndexMap`), so remove that part from the DOM and
          //   advance just the `oldTail` pointer.
          //
          //         oldHead v           v oldTail
          //   oldKeys:  [0, 1, 2, 3, 4, 5, 6]
          //   newParts: [0,  ,  ,  ,  ,  , 6] <- 5 not in new map; remove
          //   5 and newKeys:  [0, 2, 1, 4, 3, 7, 6]    advance oldTail
          //         newHead ^           ^ newTail
          //
          // * Once head and tail cannot move, any mismatches are due to
          // either new or
          //   moved items; if a new key is in the previous "old key to
          //   old index" map, move the old part to the new location,
          //   otherwise create and insert a new part. Note that when
          //   moving an old part we null its position in the oldParts
          //   array if it lies between the head and tail so we know to
          //   skip it when the pointers get there.
          //
          // * Example below: neither head nor tail match, and neither
          // were removed;
          //   so find the `newHead` key in the `oldKeyToIndexMap`, and
          //   move that old part's DOM into the next head position
          //   (before `oldParts[oldHead]`). Last, null the part in the
          //   `oldPart` array since it was somewhere in the remaining
          //   oldParts still to be scanned (between the head and tail
          //   pointers) so that we know to skip that old part on future
          //   iterations.
          //
          //         oldHead v        v oldTail
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
          //   newParts: [0, 2,  ,  ,  ,  , 6] <- stuck; update & move 2
          //   into place newKeys:  [0, 2, 1, 4, 3, 7, 6]    and advance
          //   newHead
          //         newHead ^           ^ newTail
          //
          // * Note that for moves/insertions like the one above, a part
          // inserted at
          //   the head pointer is inserted before the current
          //   `oldParts[oldHead]`, and a part inserted at the tail
          //   pointer is inserted before `newParts[newTail+1]`. The
          //   seeming asymmetry lies in the fact that new parts are moved
          //   into place outside in, so to the right of the head pointer
          //   are old parts, and to the right of the tail pointer are new
          //   parts.
          //
          // * We always restart back from the top of the algorithm,
          // allowing matching
          //   and simple updates in place to continue...
          //
          // * Example below: the head pointers once again match, so
          // simply update
          //   part 1 and record it in the `newParts` array.  Last,
          //   advance both head pointers.
          //
          //         oldHead v        v oldTail
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
          //   newParts: [0, 2, 1,  ,  ,  , 6] <- heads matched; update 1
          //   and newKeys:  [0, 2, 1, 4, 3, 7, 6]    advance both oldHead
          //   & newHead
          //            newHead ^        ^ newTail
          //
          // * As mentioned above, items that were moved as a result of
          // being stuck
          //   (the final else clause in the code below) are marked with
          //   null, so we always advance old pointers over these so we're
          //   comparing the next actual old value on either end.
          //
          // * Example below: `oldHead` is null (already placed in
          // newParts), so
          //   advance `oldHead`.
          //
          //            oldHead v     v oldTail
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6] // old head already used;
          //   advance newParts: [0, 2, 1,  ,  ,  , 6] // oldHead newKeys:
          //   [0, 2, 1, 4, 3, 7, 6]
          //               newHead ^     ^ newTail
          //
          // * Note it's not critical to mark old parts as null when they
          // are moved
          //   from head to tail or tail to head, since they will be
          //   outside the pointer range and never visited again.
          //
          // * Example below: Here the old tail key matches the new head
          // key, so
          //   the part at the `oldTail` position and move its DOM to the
          //   new head position (before `oldParts[oldHead]`). Last,
          //   advance `oldTail` and `newHead` pointers.
          //
          //               oldHead v  v oldTail
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
          //   newParts: [0, 2, 1, 4,  ,  , 6] <- old tail matches new
          //   head: update newKeys:  [0, 2, 1, 4, 3, 7, 6]   & move 4,
          //   advance oldTail & newHead
          //               newHead ^     ^ newTail
          //
          // * Example below: Old and new head keys match, so update the
          // old head
          //   part in place, and advance the `oldHead` and `newHead`
          //   pointers.
          //
          //               oldHead v oldTail
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
          //   newParts: [0, 2, 1, 4, 3,   ,6] <- heads match: update 3
          //   and advance newKeys:  [0, 2, 1, 4, 3, 7, 6]    oldHead &
          //   newHead
          //                  newHead ^  ^ newTail
          //
          // * Once the new or old pointers move past each other then all
          // we have
          //   left is additions (if old list exhausted) or removals (if
          //   new list exhausted). Those are handled in the final while
          //   loops at the end.
          //
          // * Example below: `oldHead` exceeded `oldTail`, so we're done
          // with the
          //   main loop.  Create the remaining part and insert it at the
          //   new head position, and the update is complete.
          //
          //                   (oldHead > oldTail)
          //   oldKeys:  [0, 1, -, 3, 4, 5, 6]
          //   newParts: [0, 2, 1, 4, 3, 7 ,6] <- create and insert 7
          //   newKeys:  [0, 2, 1, 4, 3, 7, 6]
          //                     newHead ^ newTail
          //
          // * Note that the order of the if/else clauses is not important
          // to the
          //   algorithm, as long as the null checks come first (to ensure
          //   we're always working on valid old parts) and that the final
          //   else clause comes last (since that's where the expensive
          //   moves occur). The order of remaining clauses is is just a
          //   simple guess at which cases will be most common.
          //
          // * TODO(kschaaf) Note, we could calculate the longest
          // increasing
          //   subsequence (LIS) of old items in new position, and only
          //   move those not in the LIS set. However that costs O(nlogn)
          //   time and adds a bit more code, and only helps make rare
          //   types of mutations require fewer moves. The above handles
          //   removes, adds, reversal, swaps, and single moves of
          //   contiguous items in linear time, in the minimum number of
          //   moves. As the number of multiple moves where LIS might help
          //   approaches a random shuffle, the LIS optimization becomes
          //   less helpful, so it seems not worth the code at this point.
          //   Could reconsider if a compelling case arises.
          while (oldHead <= oldTail && newHead <= newTail) {
              if (oldParts[oldHead] === null) {
                  // `null` means old part at head has already been used
                  // below; skip
                  oldHead++;
              }
              else if (oldParts[oldTail] === null) {
                  // `null` means old part at tail has already been used
                  // below; skip
                  oldTail--;
              }
              else if (oldKeys[oldHead] === newKeys[newHead]) {
                  // Old head matches new head; update in place
                  newParts[newHead] =
                      updatePart(oldParts[oldHead], newValues[newHead]);
                  oldHead++;
                  newHead++;
              }
              else if (oldKeys[oldTail] === newKeys[newTail]) {
                  // Old tail matches new tail; update in place
                  newParts[newTail] =
                      updatePart(oldParts[oldTail], newValues[newTail]);
                  oldTail--;
                  newTail--;
              }
              else if (oldKeys[oldHead] === newKeys[newTail]) {
                  // Old head matches new tail; update and move to new tail
                  newParts[newTail] =
                      updatePart(oldParts[oldHead], newValues[newTail]);
                  insertPartBefore(containerPart, oldParts[oldHead], newParts[newTail + 1]);
                  oldHead++;
                  newTail--;
              }
              else if (oldKeys[oldTail] === newKeys[newHead]) {
                  // Old tail matches new head; update and move to new head
                  newParts[newHead] =
                      updatePart(oldParts[oldTail], newValues[newHead]);
                  insertPartBefore(containerPart, oldParts[oldTail], oldParts[oldHead]);
                  oldTail--;
                  newHead++;
              }
              else {
                  if (newKeyToIndexMap === undefined) {
                      // Lazily generate key-to-index maps, used for removals &
                      // moves below
                      newKeyToIndexMap = generateMap(newKeys, newHead, newTail);
                      oldKeyToIndexMap = generateMap(oldKeys, oldHead, oldTail);
                  }
                  if (!newKeyToIndexMap.has(oldKeys[oldHead])) {
                      // Old head is no longer in new list; remove
                      removePart(oldParts[oldHead]);
                      oldHead++;
                  }
                  else if (!newKeyToIndexMap.has(oldKeys[oldTail])) {
                      // Old tail is no longer in new list; remove
                      removePart(oldParts[oldTail]);
                      oldTail--;
                  }
                  else {
                      // Any mismatches at this point are due to additions or
                      // moves; see if we have an old part we can reuse and move
                      // into place
                      const oldIndex = oldKeyToIndexMap.get(newKeys[newHead]);
                      const oldPart = oldIndex !== undefined ? oldParts[oldIndex] : null;
                      if (oldPart === null) {
                          // No old part for this value; create a new one and
                          // insert it
                          const newPart = createAndInsertPart(containerPart, oldParts[oldHead]);
                          updatePart(newPart, newValues[newHead]);
                          newParts[newHead] = newPart;
                      }
                      else {
                          // Reuse old part
                          newParts[newHead] =
                              updatePart(oldPart, newValues[newHead]);
                          insertPartBefore(containerPart, oldPart, oldParts[oldHead]);
                          // This marks the old part as having been used, so that
                          // it will be skipped in the first two checks above
                          oldParts[oldIndex] = null;
                      }
                      newHead++;
                  }
              }
          }
          // Add parts for any remaining new values
          while (newHead <= newTail) {
              // For all remaining additions, we insert before last new
              // tail, since old pointers are no longer valid
              const newPart = createAndInsertPart(containerPart, newParts[newTail + 1]);
              updatePart(newPart, newValues[newHead]);
              newParts[newHead++] = newPart;
          }
          // Remove any remaining unused old parts
          while (oldHead <= oldTail) {
              const oldPart = oldParts[oldHead++];
              if (oldPart !== null) {
                  removePart(oldPart);
              }
          }
          // Save order of new parts for next round
          partListCache.set(containerPart, newParts);
          keyListCache.set(containerPart, newKeys);
      };
  });
  //# =repeat.js.map

  const cssStr = css`
*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  background: none;
  outline-color: transparent;
  border: none;
}

`;

  const cssStr$1 = css`
body {
  --blue: #2864dc; /* this is a leftover that ought to get replaced */
  --border-color--default: #bbc;
  --border-color--light: #ccd;
  --border-color--dark: #99a;
  --border-color--semi-light: #dde;
  --border-color--very-light: #eef;
  --border-color--private-light: #b7c7b0;
  --border-color--unread: #9497f5;
  --text-color--default: #333;
  --text-color--lightish: #555;
  --text-color--light: #667;
  --text-color--pretty-light: #889;
  --text-color--very-light: #bbc;
  --text-color--link: #4040e7;
  --text-color--result-link: blue;
  --text-color--markdown-link: #4040e7;
  --text-color--private-default: #518680;
  --text-color--private-link: #02796d;
  --bg-color--default: #fff;
  --bg-color--secondary: #fafafd;
  --bg-color--light: #fafafd;
  --bg-color--semi-light: #f0f0f6;
  --bg-color--private-light: #f5faf7;
  --bg-color--private-semi-light: #edf6f1;
  --bg-color--light-highlight: #f7faff;
  --bg-color--unread: #f2f3ff;
}

@media (prefers-color-scheme: dark) {
  body {
    --border-color--default: #669;
    --border-color--light: #558;
    --border-color--dark: #88a;
    --border-color--semi-light: #447;
    --border-color--very-light: #334;
    --border-color--private-light: #3a5a4c;
    --border-color--unread: #9497f5;
    --text-color--default: #ccd;
    --text-color--lightish: #bbc;
    --text-color--light: #aab;
    --text-color--pretty-light: #99a;
    --text-color--very-light: #557;
    --text-color--link: #5d80ff;
    --text-color--result-link: #587bfb;
    --text-color--markdown-link: #5d80ff;
    --text-color--private-default: #69a59e;
    --text-color--private-link: #04a294;
    --bg-color--default: #223;
    --bg-color--secondary: #1b1b2b;
    --bg-color--light: #334;
    --bg-color--semi-light: #445;
    --bg-color--private-light: #202f2f;
    --bg-color--private-semi-light: #354a48;
    --bg-color--light-highlight: #3e3e5a;
    --bg-color--unread: #333658;
  }
}
`;

  const cssStr$2 = css`
${cssStr}
${cssStr$1}

.link {
  color: var(--blue);
}

.link:hover {
  text-decoration: underline;
}

.btn.nofocus,
.btn[disabled="disabled"],
.btn.disabled,
.btn:disabled {
  outline: 0;
  box-shadow: none;
}

.btn {
  display: inline-block;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 2px;
  color: var(--text-color--default);
  font-size: 13px;
  line-height: 26px;
  letter-spacing: 0.25px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: none;
}

.btn.small {
  height: 24px;
  line-height: 20px;
}

.btn.small * {
  vertical-align: top;
  line-height: 20px;
}

.btn.plain {
  background: none;
  border: none;
  color: var(--text-color--pretty-light);
  line-height: 28px;
  padding: 0 3px;
}

.btn.plain:hover {
  color: var(--color-text);
  background: none;
}

.btn.plain:focus {
  box-shadow: none;
}

.btn i {
  line-height: 100%;
  line-height: 30px;
  vertical-align: middle;
}

.btn i:last-child {
  margin-left: 2px;
  margin-right: 0;
}

.btn i:first-child {
  margin-left: 0;
  margin-right: 2px;
}

.btn i:first-child:last-child {
  margin-left: 0;
  margin-right: 0;
}

.btn:focus {
  outline: none;
}

.btn.full-width {
  width: 100%;
}

.btn.center {
  text-align: center;
}

.btn.thick {
  font-size: 14px;
  font-weight: normal;
  height: 35px;
  line-height: 32px;
  padding: 0 12px;
}

.btn.pressed {
  box-shadow: inset 0px 0 5px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to top, #ddd, #ccc);
}

.btn.pressed:hover {
  box-shadow: inset 0px 0 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to top, #ddd, #ccc);
  cursor: default;
}

.btn:hover {
  text-decoration: none;
  background: #eee;
}

.btn[disabled="disabled"],
.btn.disabled,
.btn:disabled {
  cursor: default !important;
  background: #fafafa !important;
  color: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid #eee !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: initial !important;
}

.btn[disabled="disabled"] .spinner,
.btn.disabled .spinner,
.btn:disabled .spinner {
  color: #aaa !important;
}

.btn[disabled="disabled"]:hover,
.btn.disabled:hover,
.btn:disabled:hover {
  background: #fafafa;
}

.btn[disabled="disabled"] *,
.btn.disabled *,
.btn:disabled * {
  cursor: default !important;
}

.btn .spinner {
  display: inline-block;
  position: relative;
  top: 1px;
  color: inherit;
}

.btn.warning {
  color: #fff;
  background: #cc2f26;
  border-color: #cc2f26;
}

.btn.warning.pressed,
.btn.warning:hover {
  background: #c42d25;
  border-color: #c42d25;
}

.btn.success {
  background: #41bb56;
  color: #fff;
  border-color: #41bb56;
}

.btn.success.pressed,
.btn.success:hover {
  background: #3baa4e;
  border-color: #3baa4e;
}

.btn.transparent {
  border-color: transparent;
  background: none;
  font-weight: 400;
}

.btn.transparent:hover {
  background: rgba(0, 0, 0, 0.075);
  color: #424242;
}

.btn.transparent.disabled {
  border-color: transparent !important;
  background: none !important;
}

.btn.transparent.pressed {
  background: linear-gradient(to top, #f5f3f3, #ececec);
  border-color: #dadada;
}

.btn.primary {
  background: #2864dc;
  color: #fff;
  border: 1px solid #2864dc;
  transition: background 0.1s ease;
}

.btn.primary.pressed {
  box-shadow: inset 0px 0 5px rgba(0, 0, 0, 0.25);
}

.btn.primary:hover {
  background: #2357bf;
}

.btn.nofocus:focus,
button.nofocus:focus {
  outline: 0;
  box-shadow: none;
}

`;

  const cssStr$3 = css`
textarea {
  line-height: 1.4;
}

input,
textarea {
  border-radius: 4px;
  color: var(--text-color--default);
  background: var(--bg-color--default);
  border: 1px solid #d9d9d9;
}
textarea {
  padding: 7px;
}

input[type="checkbox"],
textarea[type="checkbox"],
input[type="radio"],
textarea[type="radio"],
input[type="range"],
textarea[type="range"] {
  padding: 0;
}

input[type="checkbox"]:focus,
textarea[type="checkbox"]:focus,
input[type="radio"]:focus,
textarea[type="radio"]:focus,
input[type="range"]:focus,
textarea[type="range"]:focus {
  box-shadow: none;
}

input[type="radio"],
textarea[type="radio"] {
  width: 14px;
  height: 14px;
  outline: none;
  -webkit-appearance: none;
  border-radius: 50%;
  cursor: pointer;
  transition: border 0.1s ease;
}

input[type="radio"]:hover,
textarea[type="radio"]:hover {
  border: 1px solid var(--blue);
}

input[type="radio"]:checked,
textarea[type="radio"]:checked {
  border: 4.5px solid var(--blue);
}

input[type="file"],
textarea[type="file"] {
  padding: 0;
  border: 0;
  line-height: 1;
}

input[type="file"]:focus,
textarea[type="file"]:focus {
  border: 0;
  box-shadow: none;
}

input:focus,
textarea:focus,
select:focus {
  outline: 0;
  border: 1px solid rgba(41, 95, 203, 0.8);
  box-shadow: 0 0 0 2px rgba(41, 95, 203, 0.2);
}

input.error,
textarea.error,
select.error {
  border: 1px solid rgba(209, 48, 39, 0.75);
}

input.error:focus,
textarea.error:focus,
select.error:focus {
  box-shadow: 0 0 0 2px rgba(204, 47, 38, 0.15);
}

input.nofocus:focus,
textarea.nofocus:focus,
select.nofocus:focus {
  outline: 0;
  box-shadow: none;
  border: initial;
}

input.inline {
  height: auto;
  border: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  cursor: text;
  padding: 3px 5px;
  line-height: 1;
}

input.big,
textarea.big {
  height: 38px;
  padding: 0 10px;
  font-size: 14px;
}

textarea.big {
  padding: 5px 10px;
}

input.huge,
textarea.huge {
  height: 40px;
  padding: 0 10px;
  font-size: 18px;
}

textarea.huge {
  padding: 5px 10px;
}

input.inline:focus,
input.inline:hover {
  border: 1px solid #ccc;
  box-shadow: none;
}

input.inline:focus {
  background: #fff;
}

.input-file-picker {
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 2px;
  border: 1px solid #d9d9d9;
  color: var(--text-color--pretty-light);
}

.input-file-picker span {
  flex: 1;
  padding-left: 3px;
}

::-webkit-input-placeholder {
  color: var(--text-color--pretty-light);
}

.big::-webkit-input-placeholder,
.huge::-webkit-input-placeholder {
  font-size: 0.9em;
}

label {
  font-weight: 500;
}

input[disabled][data-tooltip],
label[disabled][data-tooltip] {
  cursor: help;
}

input[disabled][data-tooltip] *,
label[disabled][data-tooltip] * {
  cursor: help;
}

label.required:after {
  content: '*';
  color: red;
}

.toggle {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 10px;
  cursor: pointer;
  overflow: initial;
}

.toggle .switch {
  margin-right: 10px;
}

.toggle * {
  cursor: pointer;
}

.toggle.disabled {
  cursor: default;
}

.toggle.disabled * {
  cursor: default;
}

.toggle input {
  display: none;
}

.toggle .text {
  font-weight: 400;
}

.toggle .switch {
  display: inline-block;
  position: relative;
  width: 32px;
  height: 17px;
}

.toggle .switch:before,
.toggle .switch:after {
  position: absolute;
  display: block;
  content: '';
}

.toggle .switch:before {
  width: 100%;
  height: 100%;
  border-radius: 40px;
  background: #dadada;
}

.toggle .switch:after {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  left: 3px;
  top: 3px;
  background: #fafafa;
  transition: transform 0.15s ease;
}

.toggle input:checked:not(:disabled) + .switch:before {
  background: #41b855;
}

.toggle input:checked:not(:disabled) + .switch:after {
  transform: translateX(15px);
}

.toggle.disabled {
  color: var(--text-color--pretty-light);
}

label.checkbox-container {
  display: flex;
  align-items: center;
  height: 15px;
  font-weight: 400;
}

label.checkbox-container input[type="checkbox"] {
  width: 15px;
  height: 15px;
  margin: 0 5px 0 0;
}


`;

  const cssStr$4 = css`
${cssStr$2}
${cssStr$3}

.popup-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 6000;
  background: rgba(0, 0, 0, 0.45);
  font-style: normal;
  overflow-y: auto;
}

.popup-inner {
  background: #fff;
  box-shadow: 0 2px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.55);
  border-radius: 4px;
  width: 450px;
  margin: 80px auto;
  overflow: hidden;
}

.popup-inner .error {
  color: #d80b00 !important;
  margin: 10px 0 !important;
  font-style: italic;
}

.popup-inner .head {
  position: relative;
  background: var(--bg-color--semi-light);
  padding: 7px 12px;
  width: 100%;
  border-bottom: 1px solid var(--border-color--light);
  border-radius: 4px 4px 0 0;
}

.popup-inner .head .title {
  font-size: 0.95rem;
  font-weight: 500;
}

.popup-inner .head .close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  cursor: pointer;
}

.popup-inner .body {
  padding: 12px;
}

.popup-inner .body > div:not(:first-child) {
  margin-top: 20px;
}

.popup-inner p:first-child {
  margin-top: 0;
}

.popup-inner p:last-child {
  margin-bottom: 0;
}

.popup-inner select {
  height: 28px;
}

.popup-inner textarea,
.popup-inner label:not(.checkbox-container),
.popup-inner select,
.popup-inner input {
  display: block;
  width: 100%;
}

.popup-inner label.toggle {
  display: flex;
  justify-content: flex-start;
}

.popup-inner label.toggle .text {
  margin-right: 10px;
}

.popup-inner label.toggle input {
  display: none;
}

.popup-inner label {
  margin-bottom: 3px;
  color: rgba(51, 51, 51, 0.9);
}

.popup-inner textarea,
.popup-inner input {
  margin-bottom: 10px;
}

.popup-inner textarea {
  height: 60px;
  resize: vertical;
}

.popup-inner .actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.popup-inner .actions .left,
.popup-inner .actions .link {
  margin-right: auto;
}

.popup-inner .actions .btn,
.popup-inner .actions .success,
.popup-inner .actions .primary {
  margin-left: 5px;
}

.popup-inner .actions .spinner {
  width: 10px;
  height: 10px;
  border-width: 1.2px;
}
`;

  // exported api
  // =

  class BasePopup extends LitElement {
    constructor () {
      super();

      const onGlobalKeyUp = e => {
        // listen for the escape key
        if (this.shouldCloseOnEscape && e.keyCode === 27) {
          this.onReject();
        }
      };
      document.addEventListener('keyup', onGlobalKeyUp);

      // cleanup function called on cancel
      this.cleanup = () => {
        document.removeEventListener('keyup', onGlobalKeyUp);
      };
    }

    get shouldShowHead () {
      return true
    }

    get shouldCloseOnOuterClick () {
      return true
    }

    get shouldCloseOnEscape () {
      return true
    }

    // management
    //

    static async coreCreate (parentEl, Class, ...args) {
      var popupEl = new Class(...args);
      parentEl.appendChild(popupEl);

      const cleanup = () => {
        popupEl.cleanup();
        popupEl.remove();
      };

      // return a promise that resolves with resolve/reject events
      return new Promise((resolve, reject) => {
        popupEl.addEventListener('resolve', e => {
          resolve(e.detail);
          cleanup();
        });

        popupEl.addEventListener('reject', e => {
          reject();
          cleanup();
        });
      })
    }

    static async create (Class, ...args) {
      return BasePopup.coreCreate(document.body, Class, ...args)
    }

    static destroy (tagName) {
      var popup = document.querySelector(tagName);
      if (popup) popup.onReject();
    }

    // rendering
    // =

    render () {
      return html`
      <div class="popup-wrapper" @click=${this.onClickWrapper}>
        <div class="popup-inner">
          ${this.shouldShowHead ? html`
            <div class="head">
              <span class="title">${this.renderTitle()}</span>
              <span title="Cancel" @click=${this.onReject} class="close-btn square">&times;</span>
            </div>
          ` : ''}
          <div class="body">
            ${this.renderBody()}
          </div>
        </div>
      </div>
    `
    }

    renderTitle () {
      // should be overridden by subclasses
    }

    renderBody () {
      // should be overridden by subclasses
    }

    // events
    // =

    onClickWrapper (e) {
      if (e.target.classList.contains('popup-wrapper') && this.shouldCloseOnOuterClick) {
        this.onReject();
      }
    }

    onReject (e) {
      if (e) e.preventDefault();
      this.dispatchEvent(new CustomEvent('reject'));
    }
  }

  BasePopup.styles = [cssStr$4];

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var __asyncValues = (undefined && undefined.__asyncValues) || function (o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
      function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
      function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  };
  /**
   * A directive that renders the items of an async iterable[1], replacing
   * previous values with new values, so that only one value is ever rendered
   * at a time.
   *
   * Async iterables are objects with a [Symbol.asyncIterator] method, which
   * returns an iterator who's `next()` method returns a Promise. When a new
   * value is available, the Promise resolves and the value is rendered to the
   * Part controlled by the directive. If another value other than this
   * directive has been set on the Part, the iterable will no longer be listened
   * to and new values won't be written to the Part.
   *
   * [1]: https://github.com/tc39/proposal-async-iteration
   *
   * @param value An async iterable
   * @param mapper An optional function that maps from (value, index) to another
   *     value. Useful for generating templates for each item in the iterable.
   */
  const asyncReplace = directive((value, mapper) => async (part) => {
      var e_1, _a;
      if (!(part instanceof NodePart)) {
          throw new Error('asyncReplace can only be used in text bindings');
      }
      // If we've already set up this particular iterable, we don't need
      // to do anything.
      if (value === part.value) {
          return;
      }
      // We nest a new part to keep track of previous item values separately
      // of the iterable as a value itself.
      const itemPart = new NodePart(part.options);
      part.value = value;
      let i = 0;
      try {
          for (var value_1 = __asyncValues(value), value_1_1; value_1_1 = await value_1.next(), !value_1_1.done;) {
              let v = value_1_1.value;
              // Check to make sure that value is the still the current value of
              // the part, and if not bail because a new value owns this part
              if (part.value !== value) {
                  break;
              }
              // When we get the first value, clear the part. This let's the
              // previous value display until we can replace it.
              if (i === 0) {
                  part.clear();
                  itemPart.appendIntoPart(part);
              }
              // As a convenience, because functional-programming-style
              // transforms of iterables and async iterables requires a library,
              // we accept a mapper function. This is especially convenient for
              // rendering a template for each item.
              if (mapper !== undefined) {
                  // This is safe because T must otherwise be treated as unknown by
                  // the rest of the system.
                  v = mapper(v, i);
              }
              itemPart.setValue(v);
              itemPart.commit();
              i++;
          }
      }
      catch (e_1_1) { e_1 = { error: e_1_1 }; }
      finally {
          try {
              if (value_1_1 && !value_1_1.done && (_a = value_1.return)) await _a.call(value_1);
          }
          finally { if (e_1) throw e_1.error; }
      }
  });
  //# =async-replace.js.map

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // For each part, remember the value that was last rendered to the part by the
  // unsafeHTML directive, and the DocumentFragment that was last set as a value.
  // The DocumentFragment is used as a unique key to check if the last value
  // rendered to the part was with unsafeHTML. If not, we'll always re-render the
  // value passed to unsafeHTML.
  const previousValues = new WeakMap();
  /**
   * Renders the result as HTML, rather than text.
   *
   * Note, this is unsafe to use with any user-provided input that hasn't been
   * sanitized or escaped, as it may lead to cross-site-scripting
   * vulnerabilities.
   */
  const unsafeHTML = directive((value) => (part) => {
      if (!(part instanceof NodePart)) {
          throw new Error('unsafeHTML can only be used in text bindings');
      }
      const previousValue = previousValues.get(part);
      if (previousValue !== undefined && isPrimitive(value) &&
          value === previousValue.value && part.value === previousValue.fragment) {
          return;
      }
      const template = document.createElement('template');
      template.innerHTML = value; // innerHTML casts to string internally
      const fragment = document.importNode(template.content, true);
      part.setValue(fragment);
      previousValues.set(part, { value, fragment });
  });
  //# =unsafe-html.js.map

  const cssStr$5 = css`
/**
 * New button styles
 * We should replace buttons.css with this
 */
button {
  --bg-color--button: #fff;
  --bg-color--button--hover: #f5f5f5;
  --bg-color--button--active: #eee;
  --bg-color--button--pressed: #6d6d79;
  --bg-color--button--disabled: #fff;
  --bg-color--primary-button: #5289f7;
  --bg-color--primary-button--hover: rgb(73, 126, 234);
  --bg-color--transparent-button: transparent;
  --bg-color--transparent-button--hover: #f5f5fa;
  --bg-color--transparent-button--pressed: rgba(0,0,0,.1);
  --bg-color--button-gray: #fafafa;
  --bg-color--button-gray--hover: #f5f5f5;
  --text-color--button: #333;
  --text-color--button--pressed: #fff;
  --text-color--button--disabled: #999;
  --text-color--primary-button: #fff;
  --border-color--button: #d4d7dc;
  --border-color--primary-button: #2864dc;
  --box-shadow-color--button: rgba(0,0,0,.05);
  --box-shadow-color--button--hover: rgba(0,0,0,.5);
  --box-shadow-color--transparent-button: rgba(0,0,0,.25);

  background: var(--bg-color--button);
  border: 1px solid var(--border-color--button);
  border-radius: 3px;
  box-shadow: 0 1px 1px var(--box-shadow-color--button);
  padding: 5px 10px;
  color: var(--text-color--button);
  outline: 0;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  button {
    --bg-color--button: #335;
    --bg-color--button--hover: #446;
    --bg-color--button--active: #eee;
    --bg-color--button--pressed: #6d6d79;
    --bg-color--button--disabled: #445;
    --bg-color--primary-button: #5289f7;
    --bg-color--primary-button--hover: rgb(73, 126, 234);
    --bg-color--transparent-button: transparent;
    --bg-color--transparent-button--hover: #445;
    --bg-color--transparent-button--pressed: rgba(0,0,0,.1);
    --bg-color--button-gray: #fafafa;
    --bg-color--button-gray--hover: #f5f5f5;
    --text-color--button: #ccd;
    --text-color--button--pressed: #fff;
    --text-color--button--disabled: #aac;
    --text-color--primary-button: #fff;
    --border-color--button: #779;
    --border-color--primary-button: #2864dc;
    --box-shadow-color--button: rgba(0,0,0,.05);
    --box-shadow-color--button--hover: rgba(0,0,0,.5);
    --box-shadow-color--transparent-button: rgba(0,0,0,.25);
  }
}

button:hover {
  background: var(--bg-color--button--hover);
}

button:active {
  background: var(--bg-color--button--active);
}

button.big {
  padding: 6px 12px;
}

button.block {
  display: block;
  width: 100%;
}

button.pressed {
  box-shadow: inset 0 1px 1px var(--box-shadow-color--button--hover);
  background: var(--bg-color--button--pressed);
  color: var(--text-color--button--pressed);
  border-color: transparent;
  border-radius: 4px;
}

button.primary {
  background: var(--bg-color--primary-button);
  border-color: var(--border-color--primary-button);
  color: var(--text-color--primary-button);
  box-shadow: 0 1px 1px rgba(0,0,0,.1);
}

button.primary:hover {
  background: var(--bg-color--primary-button--hover);
}

button.gray {
  background: var(--bg-color--button-gray);
}

button.gray:hover {
  background: var(--bg-color--button-gray--hover);
}

button[disabled] {
  border-color: var(--border-color--semi-light) !important;
  background: var(--bg-color--button--disabled) !important;
  color: var(--text-color--button--disabled) !important;
  cursor: default !important;
}

button.rounded {
  border-radius: 16px;
}

button.flat {
  box-shadow: none; 
}

button.noborder {
  border-color: transparent;
}

button.transparent {
  background: var(--bg-color--transparent-button);
  border-color: transparent;
  box-shadow: none; 
}

button.transparent[disabled] {
  border-color: transparent !important;
}

button.transparent:hover {
  background: var(--bg-color--transparent-button--hover);
}

button.transparent.pressed {
  background: var(--bg-color--transparent-button--pressed);
  box-shadow: inset 0 1px 2px var(--box-shadow-color--transparent-button);
  color: inherit;
}

.radio-group button {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.radio-group button.pressed {
  background: var(--bg-color--button--pressed);
  border-radius: 30px;
}

.btn-group {
  display: inline-flex;
}

.btn-group button {
  border-radius: 0;
  border-right-width: 0;
}

.btn-group button:first-child {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}

.btn-group button:last-child {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border-right-width: 1px;
}

.btn-group.rounded button:first-child {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
  padding-left: 14px;
}

.btn-group.rounded button:last-child {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
  padding-right: 14px;
}
`;

  const cssStr$6 = css`
*[data-tooltip] {
  position: relative;
}

*[data-tooltip]:hover:before,
*[data-tooltip]:hover:after {
  display: block;
  z-index: 1000;
  transition: opacity 0.01s ease;
  transition-delay: 0.2s;
}

*[data-tooltip]:hover:after {
  opacity: 1;
}

*[data-tooltip]:hover:before {
  transform: translate(-50%, 0);
  opacity: 1;
}

*[data-tooltip]:before {
  opacity: 0;
  transform: translate(-50%, 0);
  position: absolute;
  top: 33px;
  left: 50%;
  z-index: 3000;
  content: attr(data-tooltip);
  background: rgba(17, 17, 17, 0.95);
  font-size: 0.7rem;
  border: 0;
  border-radius: 4px;
  padding: 7px 10px;
  color: rgba(255, 255, 255, 0.925);
  text-transform: none;
  text-align: center;
  font-weight: 500;
  white-space: pre;
  line-height: 1;
  pointer-events: none;
}

*[data-tooltip]:after {
  opacity: 0;
  position: absolute;
  left: calc(50% - 6px);
  top: 28px;
  content: '';
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(17, 17, 17, 0.95);
  pointer-events: none;
}

.tooltip-nodelay[data-tooltip]:hover:before,
.tooltip-nodelay[data-tooltip]:hover:after {
  transition-delay: initial;
}

.tooltip-right[data-tooltip]:before {
  top: 50%;
  left: calc(100% + 6px);
  transform: translate(0, -50%);
  line-height: 0.9;
}

.tooltip-right[data-tooltip]:after {
  top: 50%;
  left: calc(100% + 0px);
  transform: translate(0, -50%);
  border: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid rgba(17, 17, 17, 0.95);
}

.tooltip-left[data-tooltip]:before {
  top: 50%;
  left: auto;
  right: calc(100% + 6px);
  transform: translate(0, -50%);
  line-height: 0.9;
}

.tooltip-left[data-tooltip]:after {
  top: 50%;
  left: auto;
  right: calc(100% + 0px);
  transform: translate(0, -50%);
  border: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid rgba(17, 17, 17, 0.95);
}

.tooltip-top[data-tooltip]:before {
  top: unset;
  bottom: 33px;
}

.tooltip-top[data-tooltip]:after {
  top: unset;
  bottom: 28px;
  border: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(17, 17, 17, 0.95);
}
`;

  const cssStr$7 = css`
.spinner {
  display: inline-block;
  height: 14px;
  width: 14px;
  animation: rotate 1s infinite linear;
  color: #aaa;
  border: 2px solid;
  border-right-color: transparent;
  border-radius: 50%;
  transition: color 0.25s;
}

.spinner.reverse {
  animation: rotate 2s infinite linear reverse;
}

@keyframes rotate {
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
}
`;

  const cssStr$8 = css`
${cssStr$5}
${cssStr$3}
${cssStr$6}
${cssStr$7}

:host {
  display: block;
  position: relative;
  background: var(--bg-color--default);
}

:host([full-page]) {
  background: transparent;
}

ctzn-record {
  display: block;
}

.loading {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.loading .spinner {
  margin-right: 10px;
}

.comments-loading {
  padding: 0 10px;
}

.subject {
  background: var(--bg-color--default);
  border: 1px solid var(--border-color--light);
  border-radius: 4px;
  padding: 0 10px;
}

.subject ctzn-record[render-mode="link"] {
  margin: 10px 6px;
}

:host([full-page]) .subject.card {
  margin-bottom: 10px;
}

.subject .simple-link {
  display: inline-block;
  margin: 10px 2px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: var(--text-color--link);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.subject .simple-link .spinner {
  width: 10px;
  height: 10px;
  margin-right: 5px;
  position: relative;
  top: 2px;
}

.subject .not-found:hover {
  text-decoration: underline;
}

.subject-content {
  background: var(--bg-color--default);
  padding: 0 16px;
  margin-bottom: 10px;
}

.subject-content > :-webkit-any(img, video, audio) {
  display: block;
  margin: 14px auto;
  max-width: 100%;
}

.subject-content pre {
  max-width: 100%;
  overflow: auto;
}

.subject-content .markdown {
  line-height: 1.4;
  letter-spacing: 0.1px;
  margin-bottom: 30px;
  font-size: 15px;
}

.subject-content .markdown :-webkit-any(h1, h2, h3, h4, h5) {
  font-family: arial;
}

.subject-content .markdown hr {
  border: 0;
  border-top: 1px solid var(--border-color--light);
  margin: 2em 0;
}

.subject-content .markdown a {
  color: var(--text-color--markdown-link);
}

.subject-content .markdown blockquote {
  border-left: 10px solid var(--bg-color--semi-light);
  margin: 0 0 0.6em;
  padding: 1px 0px 1px 16px;
  color: var(--text-color--light);
}

.subject-content .markdown blockquote + blockquote {
  margin-top: -14px;
}

.subject-content .markdown blockquote p {
  margin: 0;
}

.subject-content .markdown * {
  max-width: 100%;
}

.comments-header {
  background: var(--bg-color--light);
  padding: 10px;
  margin-bottom: 2px;
  font-size: 13px;
  color: var(--text-color--light);
}

.comments-header strong {
  color: var(--text-color--default);
}

.comments-header > div:first-child {
  margin: 0 4px 10px;
}

.extended-comments-header {
  position: relative;
  margin: 20px 12px 14px;
  border-top: 1px solid var(--border-color--light);
}

.extended-comments-header .label {
  position: absolute;
  font-size: 11px;
  font-weight: bold;
  color: var(--text-color--light);
  padding: 0 4px;
  top: -8px;
  left: 10px;
  background: var(--bg-color--default);
}

.comment-prompt {
  cursor: text;
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid var(--border-color--light);
  font-style: italic;
  background: var(--bg-color--default);
  color: var(--text-color--light);
}

.comment-prompt + .replies {
  margin-top: 10px;
}

.replies .replies {
  margin: 0 0 0 19px;
  padding-left: 10px;
  border-left: 1px solid var(--border-color--semi-light);
}

.replies ctzn-record {
  display: block;
}

.replies ctzn-record.highlight {
  background: var(--bg-color--unread);
}

.error {
  border: 1px solid var(--border-color--light);
  padding: 12px 16px;
  border-radius: 4px;
  margin: 0 -15px;
  color: var(--text-color--light);
}

.error h2 {
  margin-top: 0;
  color: var(--text-color--default);
}

`;

  function findParent (node, test) {
    if (typeof test === 'string') {
      // classname default
      var cls = test;
      test = el => el.classList && el.classList.contains(cls);
    }

    while (node) {
      if (test(node)) {
        return node
      }
      node = node.parentNode;
    }
  }

  function emit (el, evt, opts = {}) {
    opts.bubbles = ('bubbles' in opts) ? opts.bubbles : true;
    opts.composed = ('composed' in opts) ? opts.composed : true;
    el.dispatchEvent(new CustomEvent(evt, opts));
  }

  /*!
   * Dynamically changing favicons with JavaScript
   * Works in all A-grade browsers except Safari and Internet Explorer
   * Demo: http://mathiasbynens.be/demo/dynamic-favicons
   */

  var _head = document.head || document.getElementsByTagName('head')[0]; // https://stackoverflow.com/a/2995536

  const DRIVE_KEY_REGEX = /[0-9a-f]{64}/i;

  function pluralize (num, base, suffix = 's') {
    if (num === 1) { return base }
    return base + suffix
  }

  function shorten (str, n = 6) {
    if (str.length > (n + 3)) {
      return str.slice(0, n) + '...'
    }
    return str
  }

  function joinPath (...args) {
    var str = args[0];
    for (let v of args.slice(1)) {
      v = v && typeof v === 'string' ? v : '';
      let left = str.endsWith('/');
      let right = v.startsWith('/');
      if (left !== right) str += v;
      else if (left) str += v.slice(1);
      else str += '/' + v;
    }
    return str
  }

  function toDomain (str) {
    if (!str) return ''
    try {
      var urlParsed = new URL(str);
      return urlParsed.hostname
    } catch (e) {
      // ignore, not a url
    }
    return str
  }

  function toNiceDomain (str, len=4) {
    var domain = str.includes('://') ? toDomain(str) : str;
    if (DRIVE_KEY_REGEX.test(domain)) {
      domain = `${domain.slice(0, len)}..${domain.slice(-2)}`;
    }
    return domain
  }

  function createResourceSlug (href, title) {
    var slug;
    try {
      var hrefp = new URL(href);
      if (hrefp.pathname === '/' && !hrefp.search && !hrefp.hash) {
        // at the root path - use the hostname for the filename
        if (DRIVE_KEY_REGEX.test(hrefp.hostname) && !!title.trim()) {
          // ...unless it's a hyper key
          slug = slugify(title.trim());
        } else {
          slug = slugify(hrefp.hostname);
        }
      } else if (typeof title === 'string' && !!title.trim()) {
        // use the title if available on subpages
        slug = slugify(title.trim());
      } else {
        // use parts of the url
        slug = slugify(hrefp.hostname + hrefp.pathname + hrefp.search + hrefp.hash);
      }
    } catch (e) {
      // weird URL, just use slugified version of it
      slug = slugify(href);
    }
    return slug.toLowerCase()
  }

  const reservedChars = /[^\w]/g;
  const endingDashes = /([-]+$)/g;
  const extraDashes = /(-[-]+)/g;
  function slugify (str = '') {
    return str.replace(reservedChars, '-').replace(endingDashes, '').replace(extraDashes, '-')
  }

  function isSameOrigin (a, b) {
  	return getOrigin(a) === getOrigin(b)
  }

  function getOrigin (str) {
  	let i = str.indexOf('://');
  	let j = str.indexOf('/', i + 3);
  	return str.slice(0, j === -1 ? undefined : j)
  }

  function fancyUrl (str, siteTitle) {
    try {
      let url = new URL(str);
      let parts = [siteTitle || toNiceDomain(url.hostname)].concat(url.pathname.split('/').filter(Boolean));
      return parts.join(' › ') + (url.search ? ` ? ${url.search.slice(1)}` : '')
    } catch (e) {
      return str
    }
  }

  var _fancyUrlAsyncCache = {};
  async function* fancyUrlAsync (str) {
    try {
      let url = new URL(str);
      if (_fancyUrlAsyncCache[url.origin]) {
        yield fancyUrl(str, _fancyUrlAsyncCache[url.origin]);
        return
      }
      yield fancyUrl(str);
      if (url.protocol === 'hyper:') {
        let {site} = await beaker.index.gql(`
        query Site ($origin: String!) {
          site(url: $origin, cached: true) { title }
        }
      `, {origin: url.origin});
        _fancyUrlAsyncCache[url.origin] = site.title;
        yield fancyUrl(str, site.title);
      }
    } catch (e) {
      return str
    }
  }

  const cssStr$9 = css`
:host {
  --toast-min-width: 350px;
  --toast-padding: 10px 15px;
  --toast-font-size: 16px;
}

.toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 20000;
  transition: opacity 0.1s ease;
}
.toast-wrapper.hidden {
  opacity: 0;
}
.toast {
  position: relative;
  min-width: var(--toast-min-width);
  max-width: 450px;
  background: #ddd;
  margin: 0;
  padding: var(--toast-padding);
  border-radius: 4px;
  font-size: var(--toast-font-size);
  color: #fff;
  background: rgba(0, 0, 0, 0.75);
  -webkit-font-smoothing: antialiased;
  font-weight: 600;
}
.toast.error {
  padding-left: 38px;
}
.toast.success {
  padding-left: 48px;
}
.toast.success:before,
.toast.error:before {
  position: absolute;
  left: 18px;
  top: 5px;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Ubuntu, Cantarell, "Oxygen Sans", "Helvetica Neue", sans-serif;
  font-size: 22px;
  font-weight: bold;
}
.toast.primary {
  background: var(--color-blue);
}
.toast.success {
  background: #26b33e;
}
.toast.success:before {
  content: '✓';
}
.toast.error {
  background: #c72e25;
}
.toast.error:before {
  content: '!';
}
.toast .toast-btn {
  position: absolute;
  right: 15px;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}
`;

  // exported api
  // =

  function create (message, type = '', time = 5000, button = null) {
    // destroy existing
    destroy();

    // render toast
    document.body.appendChild(new BeakerToast({message, type, button}));
    setTimeout(destroy, time);
  }

  function destroy () {
    var toast = document.querySelector('ctzn-toast');

    if (toast) {
      // fadeout before removing element
      toast.shadowRoot.querySelector('.toast-wrapper').classList.add('hidden');
      setTimeout(() => toast.remove(), 500);
    }
  }

  // internal
  // =

  class BeakerToast extends LitElement {
    constructor ({message, type, button}) {
      super();
      this.message = message;
      this.type = type;
      this.button = button;
    }

    render () {
      const onButtonClick = this.button ? (e) => { destroy(); this.button.click(e); } : undefined;
      return html`
    <div id="toast-wrapper" class="toast-wrapper ${this.button ? '' : 'nomouse'}">
      <p class="toast ${this.type}">${this.message} ${this.button ? html`<a class="toast-btn" @click=${onButtonClick}>${this.button.label}</a>` : ''}</p>
    </div>
    `
    }
  }
  BeakerToast.styles = cssStr$9;

  customElements.define('ctzn-toast', BeakerToast);

  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // On IE11, classList.toggle doesn't accept a second argument.
  // Since this is so minor, we just polyfill it.
  if (window.navigator.userAgent.match('Trident')) {
      DOMTokenList.prototype.toggle = function (token, force) {
          if (force === undefined || force) {
              this.add(token);
          }
          else {
              this.remove(token);
          }
          return force === undefined ? true : force;
      };
  }
  /**
   * Stores the ClassInfo object applied to a given AttributePart.
   * Used to unset existing values when a new ClassInfo object is applied.
   */
  const classMapCache = new WeakMap();
  /**
   * Stores AttributeParts that have had static classes applied (e.g. `foo` in
   * class="foo ${classMap()}"). Static classes are applied only the first time
   * the directive is run on a part.
   */
  // Note, could be a WeakSet, but prefer not requiring this polyfill.
  const classMapStatics = new WeakMap();
  /**
   * A directive that applies CSS classes. This must be used in the `class`
   * attribute and must be the only part used in the attribute. It takes each
   * property in the `classInfo` argument and adds the property name to the
   * element's `classList` if the property value is truthy; if the property value
   * is falsey, the property name is removed from the element's `classList`. For
   * example
   * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
   * @param classInfo {ClassInfo}
   */
  const classMap = directive((classInfo) => (part) => {
      if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
          part.committer.name !== 'class' || part.committer.parts.length > 1) {
          throw new Error('The `classMap` directive must be used in the `class` attribute ' +
              'and must be the only part in the attribute.');
      }
      // handle static classes
      if (!classMapStatics.has(part)) {
          part.committer.element.className = part.committer.strings.join(' ');
          classMapStatics.set(part, true);
      }
      // remove old classes that no longer apply
      const oldInfo = classMapCache.get(part);
      for (const name in oldInfo) {
          if (!(name in classInfo)) {
              part.committer.element.classList.remove(name);
          }
      }
      // add new classes
      for (const name in classInfo) {
          if (!oldInfo || (oldInfo[name] !== classInfo[name])) {
              // We explicitly want a loose truthy check here because
              // it seems more convenient that '' and 0 are skipped.
              part.committer.element.classList.toggle(name, Boolean(classInfo[name]));
          }
      }
      classMapCache.set(part, classInfo);
  });
  //# =class-map.js.map

  /*
  Usage:

  <ctzn-img-fallbacks>
    <img src="/foo.png" slot="img1">
    <img src="/bar.png" slot="img2">
    <img src="/baz.png" slot="img3">
  </ctzn-img-fallbacks>
  */

  class ImgFallbacks extends LitElement {
    static get properties () {
      return {
        currentImage: {type: Number}
      }
    }

    constructor () {
      super();
      this.currentImage = 1;
    }

    render () {
      return html`<slot name="img${this.currentImage}" @slotchange=${this.onSlotChange}></slot>`
    }

    onSlotChange (e) {
      var img = this.shadowRoot.querySelector('slot').assignedElements()[0];
      if (img) img.addEventListener('error', this.onError.bind(this));
    }

    onError (e) {
      this.currentImage = this.currentImage + 1;
    }
  }

  customElements.define('ctzn-img-fallbacks', ImgFallbacks);

  /* globals beaker */

  // exported api
  // =

  class SitesListPopup extends BasePopup {
    static get properties () {
      return {isLoading: {type: Boolean}}
    }

    static get styles () {
      return [cssStr$5, cssStr$7, cssStr$4, css`
      .loading {
        padding: 10px 10px 0;
      }
      .sites {
        margin: -5px 0 0 !important;
      }
      .site {
        display: flex;
        align-items: center;
        padding: 8px 4px;
        font-size: 14px;
      }
      .site:hover {
        background: var(--bg-color--light);
      }
      .site .thumb {
        display: block;
        width: 24px;
        height: 24px;
        object-fit: cover;
        border-radius: 50%;
        margin-right: 10px;
      }
      .site .title {
        font-weight: 500;
      }
      .site .url {
        color: var(--text-color--light);
      }
    `]
    }

    constructor ({title, sites}) {
      super();
      this.title = title;
      if (sites instanceof Promise) {
        this.isLoading = true;
        this.sites = undefined;
        sites.then(s => {
          this.isLoading = false;
          this.sites = s;
        });
      } else {
        this.isLoading = false;
        this.sites = sites;
      }
    }

    // management
    //

    static async create (title, sites) {
      return BasePopup.create(SitesListPopup, {title, sites})
    }

    static destroy () {
      return BasePopup.destroy('sites-list-popup')
    }

    // rendering
    // =

    renderTitle () {
      return this.title || 'Sites'
    }

    renderBody () {
      return html`
      <link rel="stylesheet" href=${(new URL('../../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <div class="sites">
        ${this.isLoading ? html`
          <div class="loading"><span class="spinner"></span></div>
        ` : html`
          ${repeat(this.sites, site => this.renderSite(site))}
        `}
      </div>
    `
    }

    renderSite (site) {
      const title = site.title || 'Untitled';
      return html`
      <a href=${site.url} class="site" title=${title} target="_blank">
        <ctzn-img-fallbacks>
          <img class="thumb" src="${site.url}/thumb" slot="img1">
          <img class="thumb" src=${(new URL('../../../img/default-user-thumb', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()} slot="img2">
        </ctzn-img-fallbacks>
        <span class="details">
          <span class="title">${title}</span>
        </span>
      </a>
    `
    }
  }
  customElements.define('sites-list-popup', SitesListPopup);

  const cssStr$a = css`
.markdown :-webkit-any(h1, h2, h3, h4, h5) {
  font-family: arial;
}
.markdown pre { font-size: 13px; }
.markdown :-webkit-any(video, audio, img) { max-width: 100%; }
.markdown a { color: var(--text-color--markdown-link); }
.markdown hr { border: 0; border-bottom: 1px solid var(--border-color--semi-light); }
.markdown blockquote {
  border-left: 10px solid var(--bg-color--semi-light);
  margin: 0 0 0.6em;
  padding: 1px 0px 1px 16px;
  color: var(--text-color--light);
}
.subject-content .markdown blockquote + blockquote {
  margin-top: -14px;
}
.subject-content .markdown blockquote p {
  margin: 0;
}
`;

  const cssStr$b = css`
${cssStr$5}
${cssStr$3}
${cssStr$6}
${cssStr$a}

/** COMMON RECORD STYLES **/

:host {
  display: block;
  content-visibility: auto;
  contain-intrinsic-size: 610px 115px;
}

a {
  text-decoration: none;
  cursor: initial;
}

a:hover {
  text-decoration: underline;
  cursor: pointer;
}

.record .favicon {
  display: block;
  width: 16px;
  height: 16px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 14px;
}

.record .sysicon {
  display: inline-block;
  width: 100%;
  font-size: 12px;
  line-height: 30px;
  color: var(--text-color--private-link);
  text-align: center;
}

.record .title a {
  color: var(--color-text--default);
}

.unknown-link {
  display: inline-block;
  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color--result-link);
  padding: 10px 14px;
}

.vote-ctrl :-webkit-any(.far, .fas) {
  font-size: 13px;
}

.vote-ctrl a {
  display: inline-block;
  padding: 0 4px;
  border-radius: 4px;
  margin-right: 18px;
  color: var(--text-color--pretty-light);
}

.vote-ctrl a.pressed {
  font-weight: bold;
  color: var(--text-color--link);
}

.vote-ctrl a:hover {
  text-decoration: none;
  background: var(--bg-color--semi-light);
}

.vote-ctrl .count {
  font-size: 13px;
}

.comment-ctrl {
  display: inline-block;
  padding: 0 4px;
  border-radius: 4px;
  margin-right: 18px;
  color: var(--text-color--pretty-light);
}

.comment-ctrl:hover {
  text-decoration: none;
  background: var(--bg-color--semi-light);
}

.comment-ctrl .far {
  margin-right: 2px;
  font-size: 12px;
}

.tag-ctrl {
  display: inline-block;
  padding: 0 4px;
  border-radius: 4px;
  color: var(--text-color--pretty-light);
}

.tag-ctrl:hover {
  text-decoration: none;
  background: var(--bg-color--semi-light);
}

.tag-ctrl .fa-tag {
  -webkit-text-stroke: 1px var(--text-color--pretty-light);
  color: transparent;
  font-size: 10px;
}

.tag {
  color: var(--text-color--pretty-light);
  margin-right: 4px;
}

.notification {
  padding: 5px 4px 4px 48px;
  margin-right: 19px;
  font-size: 14px;
  color: var(--text-color--default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification.unread {
  background: var(--bg-color--unread);
}

.notification a {
  color: var(--text-color--light);
}

:host([render-mode="comment"]) .notification {
  padding: 0 12px 5px;
}

.image-loading {
  width: 14px;
  height: 14px;
  background: url(${unsafeCSS((new URL('../../img/spinner.gif', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString())});
  background-size: 100%;
}

/** EXPANDED LINK STYLES **/

.record.expanded-link {
  display: flex;
  align-items: center;
  color: var(--text-color--lightish);
}

.record.expanded-link .thumb {
  display: block;
  width: 100px;
  flex: 0 0 100px;
  height: 100px;
  background: var(--bg-color--light);
  overflow: hidden;
  margin-right: 30px;
  display: none;
}

.record.expanded-link .thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record.expanded-link .info {
  flex: 1;
  overflow: hidden;
}

.record.expanded-link .title {
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 18px;
}

.record.expanded-link .title a {
  color: var(--text-color--result-link);
}

.record.expanded-link.private .title a {
  color: var(--text-color--private-link);
}

.record.expanded-link .href {
  font-size: 14px;
  margin-bottom: 4px;
}

.record.expanded-link .href a {
  color: var(--text-color--light);
}

.record.expanded-link .href .fa-angle-right {
  font-size: 11px;
}

.record.expanded-link .origin {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.record.expanded-link .origin-note {
  margin-right: 5px;
}

.record.expanded-link .author {
  color: var(--text-color--lightish);
  font-weight: 500;
  margin-right: 6px;
}

.record.expanded-link.private .author {
  color: var(--text-color--private-default);
}

.record.expanded-link .type {
  margin: 0 6px;
}

.record.expanded-link .date {
  color: var(--text-color--light);
  margin: 0 6px;
}

.record.expanded-link .excerpt {
  white-space: initial;
  color: var(--text-color--light);
  margin-top: 10px;
  line-height: 1.3;
  font-size: 15px;
  letter-spacing: 0.4px;
}

.record.expanded-link .ctrl {
  margin-left: 6px;
  font-size: 12px;
  color: var(--text-color--light);
  cursor: pointer;
}

.record.expanded-link .ctrl:hover {
  text-decoration: underline;
}

.record.expanded-link .vote-ctrl {
  margin: 0 5px;
}

.record.expanded-link .vote-ctrl a {
  margin-right: 0px;
}

.record.expanded-link .comment-ctrl {
  margin: 0 0 0 2px;
}

/** ACTION STYLES **/

.record.action {
  display: flex;
  align-items: center;
  color: var(--text-color--lightish);
}

:host([thread-view]) .record.action,
:host(.small) .record.action {
  padding: 8px 14px;
  align-items: baseline;
  color: var(--text-color--light);
  font-size: 13px;
}

.record.action.unread {
  background: var(--bg-color--unread);
  box-shadow: 0 0 0 5px var(--bg-color--unread);
  border-radius: 1px;
}

:host([thread-view]) .record.action.unread {
  box-shadow: none;
}

.record.action > * {
  margin-right: 5px;
}

.record.action .thumb {
  display: block;
  width: 30px;
  flex: 0 0 30px;
  height: 30px;
  background: var(--bg-color--semi-light);
  border-radius: 50%;
  margin-right: 18px;
  position: relative;
  top: 1px;
}

:host([thread-view]) .record.action .thumb {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  margin: 0 5px 0 0;
  top: 2px;
}

:host(.small) .record.action .thumb {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin: 0 10px 0 0;
  top: 5px;
}

.record.action .thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record.action .author {
  color: var(--text-color--default);
  font-weight: 600;
}

.record.action .subject,
.record.action .others {
  color: var(--text-color--result-link);
}

:host([thread-view]) .record.action .author {
  font-weight: normal;
}

.record.action .action a {
  color: var(--text-color--link);
}

.record.action .date {
  color: inherit;
}

.action-content {
  letter-spacing: 0.1px;
  line-height: 1.4;
  font-size: 14px;
  padding: 10px;
  margin: 0px 30px 10px;
  border: 1px solid var(--border-color--light);
  border-radius: 4px;
}

.action-content a {
  color: var(--text-color--default);
}

:host([noborders]) .action-content {
  padding: 0 30px 10px;
  margin: -3px 0 0;
  border: 0;
}

/** LINK STYLES **/

.record.link {
  display: flex;
  align-items: center;
  color: var(--text-color--lightish);
}

:host([as-context]) .record.link {
  padding: 8px 14px 10px;
}

.record.link.unread {
  background: var(--bg-color--unread);
  box-shadow: 0 0 0 5px var(--bg-color--unread);
  border-radius: 1px;
}

.record.link .thumb {
  display: block;
  width: 30px;
  flex: 0 0 30px;
  height: 30px;
  background: var(--bg-color--semi-light);
  border-radius: 50%;
  margin-right: 18px;
  position: relative;
  top: 1px;
}

:host([nothumb]) .record.link .thumb {
  display: none;
}

.record.link.private .thumb {
  background: var(--bg-color--private-light);
}

.record.link .thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record.link .container {
  flex: 1;
}

.record.link .action-description {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record.link .origin .author {
  color: var(--text-color--lightish);
  font-weight: 600;
}

.record.link.private .origin .author {
  color: var(--text-color--private-default);
}

.record.link .title {
  color: var(--text-color--light); 
}

.record.link .title .link-title {
  letter-spacing: 0.5px;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-color--result-link);
}

.record.link.private .title .link-title {
  color: var(--text-color--private-link);
}

.record.link .title .link-origin {
  color: inherit;
}

.record.link .date a {
  color: var(--text-color--light);
}

.record.link .ctrls {
  font-size: 13px;
  color: var(--text-color--light);
  margin-top: 2px;
}

.record.link .ctrls .vote-ctrl a {
  margin-right: 0px;
}

.record.link .ctrls .comment-ctrl {
  margin: 0 0 0 2px;
}

/** CARD STYLES **/

.record.card {
  position: relative;
  display: grid;
  grid-template-columns: 45px 1fr;
  color: var(--text-color--lightish);
}

.record.card.unread {
  background: var(--bg-color--unread);
  box-shadow: 0 0 0 5px var(--bg-color--unread);
  margin-bottom: 5px;
  border-radius: 1px;
}

.record.card .info {
  display: flex;
  align-items: center;
}

.record.card .thumb {
  display: block;
  width: 30px;
  height: 30px;
  background: var(--bg-color--semi-light);
  border-radius: 50%;
  position: relative;
  top: 8px;
}

.record.card.private .thumb {
  background: var(--bg-color--private-light);
}

.record.card .thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:host([noborders]) .record.card .thumb .sysicon {
  line-height: 33px;
}

.record.card .arrow {
  content: '';
  display: block;
  position: absolute;
  top: 20px;
  left: 41px;
  width: 8px;
  height: 8px;
  z-index: 10;
  background: var(--bg-color--default);
  border-top: 1px solid var(--border-color--light);
  border-left: 1px solid var(--border-color--light);
  transform: rotate(-45deg);
}

.record.card.private .arrow {
  border-left-style: dashed;
  border-top-style: dashed;
}

.record.card.is-notification .arrow {
  background: var(--bg-color--light);
}

.record.card.unread .arrow {
  border-color: var(--border-color--unread);
}

.record.card .container {
  border: 1px solid var(--border-color--light);
  border-radius: 4px;
  background: var(--bg-color--default);
  padding: 2px;
  min-width: 0; /* this is a hack to make the overflow: hidden work */
}

.record.card.private .container {
  border-style: dashed;
}

.record.card .container:hover {
  cursor: pointer;
  border-color: var(--border-color--dark);
}

.record.card.unread .container {
  background: transparent;
  border-color: var(--border-color--unread);
}

.record.card .header {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  padding: 8px 12px 6px;
  color: var(--text-color--light);
}

.record.card .header > * {
  margin-right: 5px;
  white-space: nowrap;
}

.record.card .origin .icon {
  margin-right: 5px;
}

.record.card .header a {
  color: inherit;
}

.record.card .origin .author {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-color--default);
}

.record.card.private .origin .author {
  color: var(--text-color--private-default);
}

.record.card .title {
  font-weight: normal;
  letter-spacing: 0.5px;
}

.record.card .title a {
  color: var(--text-color--result-link);
}

.card-context {
  position: relative;
  display: block;
  opacity: 0.8;
  background: var(--bg-color--secondary);
  box-sizing: border-box;
  border: 1px solid var(--border-color--light);
  border-bottom: 0;
  margin: 0 0 0 45px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.record.card .content {
  white-space: initial;
  word-break: break-word;
  color: var(--text-color--default);
  line-height: 1.3125;
  font-size: 15px;
  letter-spacing: 0.1px;
  padding: 0px 12px;
}

.record.card.constrain-height .content {
  max-height: 50px;
  overflow: hidden;
}

.record.card .content > :first-child { margin-top: 0; }
.record.card .content > :last-child { margin-bottom: 0; }

.record.card .read-more {
  padding: 2px 12px;
}

.record.card .read-more a {
  color: var(--text-color--link);
}

.record.card .ctrls {
  padding: 8px 12px;
  font-size: 12px;
}

.record.card ctzn-post-composer {
  display: block;
  padding: 10px;
}

:host([noborders]) .record.card {
  grid-template-columns: 34px 1fr;
}

:host([noborders]) .record.card .thumb {
  margin: 5px 0 0;
  width: 36px;
  height: 36px;
}

:host([noborders]) .record.card .arrow,
:host([nothumb]) .record.card .arrow {
  display: none;
}

:host([noborders]) .record.card .container {
  border-color: transparent !important;
  background: none;
}

:host([nothumb]) .record.card {
  display: block;
}

:host([nothumb]) .record.card .thumb {
  display: none;
}

:host([noborders]) .record.card ctzn-post-composer {
  margin-left: -36px;
}

/** COMMENT STYLES **/

.record.comment {
  position: relative;
  padding: 10px 14px 8px;
  border-radius: 4px;
}

.record.comment::before {
  content: "";
  display: block;
  position: absolute;
  left: 19px;
  top: 32px;
  width: 1px;
  height: calc(100% - 32px);
  background: var(--border-color--semi-light);
}

.record.comment.unread {
  background: var(--bg-color--unread);
  box-shadow: 0 0 0 5px var(--bg-color--unread);
  border-radius: 1px;
  border: 1px solid var(--border-color--unread);
}

.record.comment .header {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 0 0 4px;
}

.record.comment .header > * {
  margin-right: 5px;
  white-space: nowrap;
}

.record.comment .header a {
  color: var(--text-color--light);
}

.record.comment .thumb {
  width: 14px;
  height: 14px;
  background: var(--bg-color--semi-light);
  border-radius: 50%;
}

.record.comment .thumb img {
  display: block;
  width: 14px;
  height: 14px;
  object-fit: cover;
}

.record.comment .origin .author {
  color: var(--text-color--default);
}

.record.comment.private .origin .author {
  color: var(--text-color--private-default);
}

.record.comment .title {
  font-weight: normal;
  letter-spacing: 0.5px;
}

.record.comment .title a {
  color: var(--text-color--result-link);
}

.record.comment .action {
  color: var(--text-color--light);
}

.record.comment .context {
  box-sizing: border-box;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record.comment .content {
  white-space: initial;
  color: var(--text-color--default);
  line-height: 1.3125;
  font-size: 14px;
  letter-spacing: 0.1px;
  padding-left: 18px;
}

.record.comment.constrain-height .content {
  max-height: 50px;
  overflow: hidden;
}

.record.comment .content > :first-child { margin-top: 0; }
.record.comment .content > :last-child { margin-bottom: 0; }

.record.comment .read-more {
  padding: 4px 18px 0;
}

.record.comment .read-more a {
  color: var(--text-color--link);
}

.record.comment .ctrls {
  padding: 6px 0 0 18px;
}

.record.comment .ctrls a {
  display: inline-block;
  color: var(--text-color--light);
  font-size: 13px;
}

.record.comment .ctrls a:hover {
  cursor: pointer;
  color: var(--text-color--default);
}

.record.comment .ctrls a.reply {
  margin-right: 18px;
}

.record.comment .ctrls a :-webkit-any(.far, .fas) {
  color: var(--text-color--very-light);
}

.record.comment .ctrls a .fa-tag {
  color: transparent;
  -webkit-text-stroke: 1px var(--text-color--very-light);
}

.record.comment .ctrls a small {
  position: relative;
  top: -1px;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.record.comment ctzn-post-composer {
  display: block;
  padding: 10px 20px;
}

/** WRAPPER STYLES **/

.record.wrapper {
  display: flex;
  align-items: ceflex-startnter;
  color: var(--text-color--lightish);
}

:host([as-context]) .record.wrapper {
  padding: 10px 12px;
}

.record.wrapper.unread {
  background: var(--bg-color--unread);
  box-shadow: 0 0 0 5px var(--bg-color--unread);
  border-radius: 1px;
}

.record.wrapper .thumb {
  display: block;
  width: 20px;
  flex: 0 0 20px;
  height: 20px;
  background: var(--bg-color--semi-light);
  border-radius: 50%;
  margin-right: 18px;
  margin-left: 10px;
}

:host([nothumb]) .record.wrapper .thumb {
  display: none;
}

.record.wrapper.private .thumb {
  background: var(--bg-color--private-light);
}

.record.wrapper .thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record.wrapper .container {
  flex: 1;
}

.record.wrapper .notification {
  padding: 0 0 5px;
}

.record.wrapper .subject {
  color: var(--text-color--light);
}


`;

  /*
  Modified by PRF to include:

   - options.keepHtmll


  https://github.com/stiang/remove-markdown

  The MIT License (MIT)

  Copyright (c) 2015 Stian Grytøyr

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */

  function removeMarkdown (md, options) {
    options = options || {};
    options.keepHtml = options.hasOwnProperty('keepHtml') ? options.keepHtml : false; // ADDITION -prf
    options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
    options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
    options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
    options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;

    var output = md || '';

    // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
    output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

    try {
      if (options.stripListLeaders) {
        if (options.listUnicodeChar)
          output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');
        else
          output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
      }
      if (options.gfm) {
        output = output
          // Header
          .replace(/\n={2,}/g, '\n')
          // Fenced codeblocks
          .replace(/~{3}.*\n/g, '')
          // Strikethrough
          .replace(/~~/g, '')
          // Fenced codeblocks
          .replace(/`{3}.*\n/g, '');
      }
      if (!options.keepHtml) {
        // ADDITION -prf
        output = output
          // Remove HTML tags
          .replace(/<[^>]*>/g, '');
      }
      output = output
        // Remove setext-style headers
        .replace(/^[=\-]{2,}\s*$/g, '')
        // Remove footnotes?
        .replace(/\[\^.+?\](\: .*?$)?/g, '')
        .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
        // Remove images
        .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
        // Remove inline links
        .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
        // Remove blockquotes
        .replace(/^\s{0,3}>\s?/g, '')
        // Remove reference-style links?
        .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
        // Remove atx-style headers
        .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
        // Remove emphasis (repeat the line to remove double emphasis)
        .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
        .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
        // Remove code blocks
        .replace(/(`{3,})(.*?)\1/gm, '$2')
        // Remove inline code
        .replace(/`(.+?)`/g, '$1')
        // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
        .replace(/\n{2,}/g, '\n\n');
    } catch(e) {
      console.error(e);
      return md;
    }
    return output;
  }

  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * For AttributeParts, sets the attribute if the value is defined and removes
   * the attribute if the value is undefined.
   *
   * For other part types, this directive is a no-op.
   */
  const ifDefined = directive((value) => (part) => {
      if (value === undefined && part instanceof AttributePart) {
          if (value !== part.value) {
              const name = part.committer.name;
              part.committer.element.removeAttribute(name);
          }
      }
      else {
          part.setValue(value);
      }
  });
  //# =if-defined.js.map

  const cssStr$c = css`
.dropdown {
  position: relative;

  --text-color--dropdown-default: #333;
  --text-color--dropdown-section: #aaa;
  --text-color--dropdown-icon: rgba(0, 0, 0, 0.65);
  --text-color--dropdown-btn--pressed: #dadada;
  --text-color--title: gray;
  --bg-color--dropdown: #fff;
  --bg-color--dropdown-item--hover: #eee;
  --border-color--dropdown: #dadada;
  --border-color--dropdown-item: #eee;
  --border-color--dropdown-section: rgba(0,0,0,.1);
  --border-color--dropdown-separator: #ddd;
}

@media (prefers-color-scheme: dark) {
  .dropdown {
    --text-color--dropdown-default: #ccd;
    --text-color--dropdown-section: #aaa;
    --text-color--dropdown-icon: #eef;
    --text-color--dropdown-btn--pressed: #2c2c31;
    --text-color--title: gray;
    --bg-color--dropdown: #334;
    --bg-color--dropdown-item--hover: #445;
    --border-color--dropdown: #556;
    --border-color--dropdown-item: #669;
    --border-color--dropdown-section: rgba(0,0,0,.1);
    --border-color--dropdown-separator: #ddd;
  }
}

.dropdown.open .toggleable:not(.primary) {
  background: var(--text-color--dropdown-btn--pressed);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
  border-color: transparent;
  outline: 0;
}

.toggleable-container .dropdown-items {
  display: none;
}

.toggleable-container.hover:hover .dropdown-items,
.toggleable-container.open .dropdown-items {
  display: block;
}

.dropdown-items {
  width: 270px;
  position: absolute;
  right: 0px;
  z-index: 3000;
  background: var(--bg-color--dropdown);
  color: var(--text-color--dropdown-default);
  border: 1px solid var(--border-color--dropdown);
  border-radius: 0px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.dropdown-items .section {
  border-bottom: 1px solid var(--border-color--dropdown-section);
  padding: 5px 0;
}

.dropdown-items .section-header {
  padding: 2px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-items .section-header.light {
  color: var(--text-color--dropdown-section);
  font-weight: 500;
}

.dropdown-items .section-header.small {
  font-size: 12px;
}

.dropdown-items hr {
  border: 0;
  border-bottom: 1px solid var(--border-color--dropdown-separator);
}

.dropdown-items.thin {
  width: 170px;
}

.dropdown-items.wide {
  width: 400px;
}

.dropdown-items.compact .dropdown-item {
  padding: 2px 15px;
  border-bottom: 0;
}

.dropdown-items.compact .description {
  margin-left: 0;
}

.dropdown-items.compact hr {
  margin: 5px 0;
}

.dropdown-items.roomy .dropdown-item {
  padding: 10px 15px;
}

.dropdown-items.very-roomy .dropdown-item {
  padding: 16px 40px 16px 20px;
}

.dropdown-items.rounded {
  border-radius: 16px;
}

.dropdown-items.no-border .dropdown-item {
  border-bottom: 0;
}

.dropdown-items.center {
  left: 50%;
  right: unset;
  transform: translateX(-50%);
}

.dropdown-items.left {
  right: initial;
  left: 0;
}

.dropdown-items.over {
  top: 0;
}

.dropdown-items.top {
  bottom: calc(100% + 5px);
}

.dropdown-items.with-triangle:before {
  content: '';
  position: absolute;
  top: -8px;
  right: 10px;
  width: 12px;
  height: 12px;
  z-index: 3;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--bg-color--dropdown);
}

.dropdown-items.with-triangle.left:before {
  left: 10px;
}

.dropdown-items.with-triangle.center:before {
  left: 43%;
}

.dropdown-title {
  border-bottom: 1px solid var(--border-color--dropdown-item);
  padding: 2px 8px;
  font-size: 11px;
  color: var(--text-color--title);
}

.dropdown-item {
  display: block;
  padding: 7px 15px;
  border-bottom: 1px solid var(--border-color--dropdown-item);
}

.dropdown-item.disabled {
  opacity: 0.25;
}

.dropdown-item.no-border {
  border-bottom: 0;
}

.dropdown-item.selected {
  background: var(--bg-color--dropdown-item--hover);  
}

.dropdown-item:hover:not(.no-hover) {
  background: var(--bg-color--dropdown-item--hover);
  cursor: pointer;
}

.dropdown-item:hover:not(.no-hover) i:not(.fa-check-square) {
  color: var(--text-color--dropdown-default);
}

.dropdown-item:hover:not(.no-hover) .description {
  color: var(--text-color--dropdown-default);
}

.dropdown-item:hover:not(.no-hover).disabled {
  background: inherit;
  cursor: default;
}

.dropdown-item .fa,
.dropdown-item i {
  display: inline-block;
  width: 20px;
  color: var(--text-color--dropdown-icon);
}

.dropdown-item .fa-fw {
  margin-left: -3px;
  margin-right: 3px;
}

.dropdown-item img {
  display: inline-block;
  width: 16px;
  position: relative;
  top: 3px;
  margin-right: 6px;
}

.dropdown-item .btn .fa {
  color: inherit;
}

.dropdown-item .label {
  font-weight: 500;
  margin-bottom: 3px;
}

.dropdown-item .description {
  color: var(--text-color--muted);
  margin: 0;
  margin-left: 23px;
  margin-bottom: 3px;
  line-height: 1.5;
}

.dropdown-item .description.small {
  font-size: 12.5px;
}

.dropdown-item:first-of-type {
  border-radius: 2px 2px 0 0;
}

.dropdown-item:last-of-type {
  border-radius: 0 0 2px 2px;
}

`;

  // globals
  // =

  var resolve;

  // exported api
  // =

  // create a new context menu
  // - returns a promise that will resolve to undefined when the menu goes away
  // - example usage:
  /*
  create({
    // where to put the menu
    x: e.clientX,
    y: e.clientY,

    // align edge to right instead of left
    right: true,

    // use triangle
    withTriangle: true,

    // roomy style
    roomy: true,

    // no borders on items
    noBorders: false,

    // additional styles on dropdown-items
    style: 'font-size: 14px',

    // parent element to append to
    parent: document.body,

    // url to fontawesome css
    fontAwesomeCSSUrl: '/css/font-awesome.css',

    // menu items
    items: [
      // icon from font-awesome
      {icon: 'fa fa-link', label: 'Copy link', click: () => writeToClipboard('...')}
    ]

    // instead of items, can give render()
    render () {
      return html`
        <img src="smile.png" onclick=${contextMenu.destroy} />
      `
    }
  }
  */
  function create$1 (opts) {
    // destroy any existing
    destroy$1();

    // extract attrs
    var parent = opts.parent || document.body;

    // render interface
    parent.appendChild(new BeakerContextMenu(opts));
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onClickAnywhere);

    // return promise
    return new Promise(_resolve => {
      resolve = _resolve;
    })
  }

  function destroy$1 (value) {
    const el = document.querySelector('ctzn-context-menu');
    if (el) {
      el.parentNode.removeChild(el);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('click', onClickAnywhere);
      resolve(value);
    }
  }

  // global event handlers
  // =

  function onKeyUp (e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.keyCode === 27) {
      destroy$1();
    }
  }

  function onClickAnywhere (e) {
    if (!findParent(e.target, el => el.tagName === 'ctzn-CONTEXT-MENU')) {
      // click is outside the context-menu, destroy
      destroy$1();
    }
  }

  // internal
  // =

  class BeakerContextMenu extends LitElement {
    constructor ({x, y, right, center, top, withTriangle, roomy, veryRoomy, rounded, noBorders, style, items, fontAwesomeCSSUrl, render}) {
      super();
      this.x = x;
      this.y = y;
      this.right = right || false;
      this.center = center || false;
      this.top = top || false;
      this.withTriangle = withTriangle || false;
      this.roomy = roomy || false;
      this.veryRoomy = veryRoomy || false;
      this.rounded = rounded || false;
      this.noBorders = noBorders || false;
      this.customStyle = style || undefined;
      this.items = items;
      this.fontAwesomeCSSUrl = fontAwesomeCSSUrl || '/css/fontawesome.css';
      this.customRender = render;
    }

    // calls the global destroy
    // (this function exists so that custom renderers can destroy with this.destroy)
    destroy () {
      destroy$1();
    }

    // rendering
    // =

    render () {
      const cls = classMap({
        'dropdown-items': true,
        right: this.right,
        center: this.center,
        left: !this.right,
        top: this.top,
        'with-triangle': this.withTriangle,
        roomy: this.roomy,
        'very-roomy': this.veryRoomy,
        rounded: this.rounded,
        'no-border': this.noBorders
      });
      var style = '';
      if (this.x) style += `left: ${this.x}px; `;
      if (this.y) style += `top: ${this.y}px; `;
      return html`
      ${this.fontAwesomeCSSUrl ? html`<link rel="stylesheet" href="${this.fontAwesomeCSSUrl}">` : ''}
      <div class="context-menu dropdown" style="${style}">
        ${this.customRender
          ? this.customRender.call(this)
          : html`
            <div class="${cls}" style="${ifDefined(this.customStyle)}">
              ${this.items.map(item => {
                if (item === '-') {
                  return html`<hr />`
                }
                if (item.type === 'html') {
                  return item
                }
                var icon = item.icon;
                if (typeof icon === 'string' && !icon.includes(' ')) {
                  icon = 'fa fa-' + icon;
                }
                if (item.disabled) {
                  return html`
                    <div class="dropdown-item disabled">
                      ${icon !== false ? html`<i class="${icon}"></i>` : ''}
                      ${item.label}
                    </div>
                  `
                }
                if (item.href) {
                  return html`
                    <a class="dropdown-item ${item.selected ? 'selected' : ''}" href=${item.href}>
                      ${icon !== false ? html`<i class="${icon}"></i>` : ''}
                      ${item.label}
                    </a>
                  `
                }
                return html`
                  <div class="dropdown-item ${item.selected ? 'selected' : ''}" @click=${() => { destroy$1(); item.click(); }}>
                    ${typeof icon === 'string'
                      ? html`<i class="${icon}"></i>`
                      : icon ? icon : ''}
                    ${item.label}
                  </div>
                `
              })}
            </div>`
        }
      </div>`
    }
  }

  BeakerContextMenu.styles = css`
${cssStr$c}

.context-menu {
  position: fixed;
  z-index: 10000;
}

.dropdown-items {
  width: auto;
  white-space: nowrap;
}

a.dropdown-item {
  color: inherit;
  text-decoration: none;
}

.dropdown-item,
.dropdown-items.roomy .dropdown-item {
  padding-right: 30px; /* add a little cushion to the right */
}

/* custom icon css */
.fa-long-arrow-alt-right.custom-link-icon {
  position: relative;
  transform: rotate(-45deg);
  left: 1px;
}
.fa-custom-path-icon:after {
  content: './';
  letter-spacing: -1px;
  font-family: var(--code-font);
}
`;

  customElements.define('ctzn-context-menu', BeakerContextMenu);

  function create$2 ({x, y, record, profileUrl, onAdd, onRemove}) {
    return create$1({
      x,
      y,
      noBorders: true,
      render () {
        setTimeout(() => {
          this.shadowRoot.querySelector('input').focus();
        }, 50);
        const onKeyupInput = async e => {
          var input = e.currentTarget;
          var value = input.value.toLowerCase().trim();
          value = value.replace(/[^a-z0-9-]/g, '').slice(0, 25);
          input.value = value;
          if (e.code === 'Enter') {
            input.value = '';
            let url = await onAdd(value);
            record.tags.push({
              url,
              metadata: {'tag/id': value},
              site: {url: profileUrl, title: 'You'}
            });
            this.requestUpdate();
          }
        };
        const onClickRemove = async (e, tag) => {
          record.tags = record.tags.filter(t => t !== tag);
          this.requestUpdate();
          await onRemove(tag);
          this.requestUpdate();
        };
        return html`
        <style>
          .tags-dropdown {
            width: 250px !important;
            font-size: 14px;
            border-radius: 22px !important;
          }
          .tags-dropdown input {
            border-radius: 16px;
            box-sizing: border-box;
            border: 1px solid var(--border-color--default);
            padding: 6px 12px;
            margin: 9px 10px 9px;
            width: calc(100% - 20px);
            outline: 0;
          }
          .tags-dropdown input:focus {
            border-color: var(--border-color--focused);
            box-shadow: 0 0 2px #7599ff77;
          }
          .tags-dropdown .tags {
            max-height: 25vh;
            overflow-y: scroll !important;
            background: var(--bg-color--light);
            border-top: 1px solid var(--border-color--default);
            padding: 8px 15px 10px;
            font-size: 12px;
            line-height: 20px;
          }
          .tags-dropdown .dropdown-item.hide {
            display: none;
          }
          .tags-dropdown .tags a {
            color: var(--text-color--link);
            text-decoration: none;
            cursor: pointer;
          }
          .tags-dropdown .tags a.remove {
            color: var(--text-color--light);
          }
        </style>
        <div class="tags-dropdown dropdown-items with-triangle no-border center">
          <input placeholder="Add a tag..." autofocus @keyup=${onKeyupInput}>
          ${record.tags.length ? html`
            <div class="tags">
              ${record.tags.filter(item => !!item.metadata['tag/id']).map(tag => {
                return html`
                  <div class="tag">
                    #${tag.metadata['tag/id'].slice(0, 25)}
                    ${isSameOrigin(tag.site.url, profileUrl) ? html`
                      <a class="remove" @click=${e => onClickRemove(e, tag)} title="Remove tag">
                        <span class="fas fa-times"></span>
                      </a>
                    ` : ''}
                    &ndash; <a href=${tag.site.url}>${tag.site.title}</a>
                  </div>
                `
              })}
            </div>
          ` : ''}
        </div>
      `
      }
    })
  }

  function debouncer (ms, fallback) {
    let stack = [];
    let running = false;

    async function pop () {
      if (!stack.length) {
        running = false;
        return
      }
      running = true;
      const startTime = Date.now();
      const { run, cancel } = stack.pop();
      for (let i = 0; i < stack.length; i++) {
        stack.pop().cancel();
      }
      try {
        await run();
      } finally {
        const diff = ms - (Date.now() - startTime);
        if (diff < 0) return pop()
        else setTimeout(pop, diff);
      }
    }

    return async function push (task) {
      return new Promise((resolve, reject) => {
        stack.push({
          run: () => task().then(resolve, reject),
          // Resolve with empty search results if cancelled.
          cancel: () => resolve(fallback)
        });
        if (!running) pop();
      })
    }
  }

  /* globals monaco */

  function registerSuggestions () {
    MarkdownSuggestions.register();
  }

  class MarkdownSuggestions {
    constructor () {
      this.mdLinkQueryRegex = /\[(.*?)\]/;
      this.mdMentionQueryRegex = /@(\w*)/;
      this.searchDebouncer = debouncer$1(100);
      beaker.session.get().then(async (session) => {
        this.profile = session ? session.user : undefined;
      });
    }

    static register () {
      // TODO: Currently must provide "wildcard" trigger characters (workaround).
      const triggerCharacters = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
      const handler = new MarkdownSuggestions();
      monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters,
        provideCompletionItems: handler.provideCompletionItems.bind(handler)
      });
    }

    async completeLinkSuggestions (term, match, value) {
      // If the query is only one char, wait until it's longer.
      if (term.length === 1) {
        return null
      }
      const {queryResults} = await this.searchDebouncer(() => beaker.index.gql(`
      query Search ($search: String!) {
        queryResults: records(
          search: $search,
          paths: ["/blog/*.md"],
          limit: 10
        ) {
          url
          path
          metadata
          site { title }
        }
      }
    `, {search: term}));
      const suggestions = queryResults.map(s => {
        var type = 'blogpost';
        if (s.path.startsWith('/pages/')) type = 'page';
        const title = s.metadata.title || s.url.split('/').pop();
        const detail = s.site.title;
        return {
          kind: 7, // "Interface"
          label: title ? `(${type}) - ${title}` : `(${type})`,
          detail,
          range: match.range,
          filterText: value,
          insertText: `[${title}](${s.url})`
        }
      });
      return { suggestions }
    }

    async completePeopleSuggestions (term, match, value) {
      const {queryResults} = await this.searchDebouncer(() => beaker.index.gql(`
      query Search($search: String!) {
        queryResults: sites(search: $search, limit: 10) { url, title }
      }
    `, {search: term}));
      const suggestions = queryResults.map(s => {
        return {
          kind: 7, // "Interface"
          label: s.title,
          range: match.range,
          filterText: value,
          insertText: `[@${s.title}](${s.url})`
        }
      });

      {
        let title = this.profile?.title.toLowerCase() || '';
        if (title.includes(term.toLowerCase())) {
          suggestions.unshift({
            kind: 7, // "Interface"
            label: this.profile.title,
            range: match.range,
            filterText: value,
            insertText: `[@${this.profile.title}](hyper://${this.profile.key})`
          });
        }
      }

      return { suggestions }
    }

    async provideCompletionItems (model, position) {
      // link match
      var matches = model.findMatches(this.mdLinkQueryRegex, {
        startColumn: 1,
        endColumn: model.getLineMaxColumn(position.lineNumber),
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber
      }, true, false, null, true);
      var match = matches.length && matches.find(m => m.range.containsPosition(position));
      if (match) {
        let term = match.matches[1];
        let value = model.getValueInRange(match.range); 
        if (term.startsWith('@')) return this.completePeopleSuggestions(term.slice(1), match, value)
        return this.completeLinkSuggestions(term, match, value)
      }

      // mention match
      var matches = model.findMatches(this.mdMentionQueryRegex, {
        startColumn: 1,
        endColumn: model.getLineMaxColumn(position.lineNumber),
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber
      }, true, false, null, true);
      var match = matches.length && matches.find(m => m.range.containsPosition(position));
      if (match) {
        let term = match.matches[1];
        let value = model.getValueInRange(match.range); 
        return this.completePeopleSuggestions(term, match, value)
      }

      return null
    }
  }

  function debouncer$1 (ms, fallback) {
    let stack = [];
    let running = false;

    async function pop () {
      if (!stack.length) {
        running = false;
        return
      }
      running = true;
      const startTime = Date.now();
      const { run, cancel } = stack.pop();
      for (let i = 0; i < stack.length; i++) {
        stack.pop().cancel();
      }
      try {
        await run();
      } finally {
        const diff = ms - (Date.now() - startTime);
        if (diff < 0) return pop()
        else setTimeout(pop, diff);
      }
    }

    return async function push (task) {
      return new Promise((resolve, reject) => {
        stack.push({
          run: () => task().then(resolve, reject),
          // Resolve with empty search results if cancelled.
          cancel: () => resolve(fallback)
        });
        if (!running) pop();
      })
    }
  }

  const cssStr$d = css`
${cssStr$5}
${cssStr$6}
${cssStr$a}

nav {
  display: flex;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

nav a {
  border: 1px solid transparent;
  padding: 5px 14px;
}

nav a.current {
  position: relative;
  background: var(--bg-color--default);
  border: 1px solid var(--border-color--light);
  border-bottom: 1px solid transparent;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

nav a.current:after {
  content: '';
  background: var(--bg-color--default);
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  z-index: 1;
}

nav a:hover:not(.current) {
  text-decoration: none;
  cursor: pointer;
  background: var(--bg-color--light);
}

.view {
  position: relative;
  background: var(--bg-color--default);
  border: 1px solid var(--border-color--light);
  border-radius: 4px;
  border-top-left-radius: 0;
  padding: 14px 0 2px;
  margin-bottom: 6px;
}

.placeholder {
  position: absolute;
  top: 15px;
  left: 13px;
  color: var(--text-color--pretty-light);
  z-index: 1;
  pointer-events: none;
}

.editor {
  height: 150px;
  position: relative;
}

.editor.hidden {
  display: none;
}

textarea.hidden {
  display: none;
}

.preview {
  font-size: 14px;
  background: var(--bg-color--default);
  color: var(--text-color--default);
  padding: 0px 14px 14px;
}
.preview > :first-child {
  margin-top: 0;
}
.preview > :last-child {
  margin-bottom: 0;
}

.tags {
  display: flex;
  align-items: center;
  background: var(--bg-color--default);
  border: 1px solid var(--border-color--light);
  border-radius: 4px;
  padding: 6px 12px;
  margin-bottom: 6px;
}

.tags .fas {
  margin-right: 6px;
  font-size: 12px;
  -webkit-text-stroke: 1px var(--text-color--default);
  color: transparent;
}

.tags input {
  flex: 1;
  border: 0;
  outline: 0;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.visibility {
  display: inline-block;
  background: var(--bg-color--semi-light);
  border-radius: 4px;
  padding: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.visibility.disabled {
  cursor: default;
}

input[type="file"] {
  display: none;
}
`;

  /* globals beaker monaco */

  var _currentComposer = undefined;
  window.addEventListener('paste', onGlobalPaste);

  class PostComposer extends LitElement {
    static get properties () {
      return {
        driveUrl: {type: String, attribute: 'drive-url'},
        placeholder: {type: String},
        currentView: {type: String},
        draftText: {type: String, attribute: 'draft-text'},
        subject: {type: String},
        parent: {type: String},
        _visibility: {type: String}
      }
    }

    constructor () {
      super();
      _currentComposer = this;
      this.driveUrl = undefined;
      this.placeholder = 'What\'s new?';
      this.currentView = 'edit';
      this.draftText = '';
      this.tags = '';
      this._visibility = 'public';
      this.subject = undefined;
      this.parent = undefined;
      this.editor = undefined;
      this.blobs = [];
      this.profile = undefined;
      this.searchQueryId = 0;
      this.searchDebouncer = debouncer(100);
    }

    async connectedCallback () {
      super.connectedCallback();
      if (this.driveUrl) {
        this.profile = await beaker.hyperdrive.getInfo(this.driveUrl);
      } else {
        this.profile = (await beaker.session.get())?.user;
      }
      this.requestUpdate();
    }

    static get styles () {
      return cssStr$d
    }

    get isEmpty () {
      return !this.draftText
    }

    get mustBePrivate () {
      if (this.subject && this.subject.startsWith('hyper://private')) return true
      if (this.parent && this.parent.startsWith('hyper://private')) return true
      return false
    }

    get visibility () {
      if (this.mustBePrivate) {
        return 'private'
      }
      return this._visibility
    }

    set visibility (v) {
      this._visibility = v;
    }

    async createEditor () {
      return new Promise((resolve, reject) => {
        window.require.config({baseUrl: (new URL('..', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()});
        window.require(['vs/editor/editor.main'], () => {
          registerSuggestions();
          var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [{ background: '222233' }],
            colors: {'editor.background': '#222233'}
          });
          this.editor = monaco.editor.create(this.shadowRoot.querySelector('.editor'), {
            automaticLayout: true,
            contextmenu: false,
            dragAndDrop: true,
            fixedOverflowWidgets: true,
            folding: false,
            lineNumbers: false,
            links: true,
            minimap: {enabled: false},
            model: monaco.editor.createModel(this.draftText, 'markdown'),
            renderLineHighlight: 'none',
            roundedSelection: false,
            theme: isDarkMode ? 'custom-dark' : undefined,
            wordWrap: 'on'
          });
          resolve();
        });
      })
    }

    insertImage (file) {
      var url = URL.createObjectURL(file);
      this.blobs.push({file, url});

      var newlines = '\n\n';
      if (!this.draftText || this.draftText.endsWith('\n\n')) {
        newlines = '';
      } else if (this.draftText.endsWith('\n')) {
        newlines = '\n';
      }
      this.draftText += `${newlines}![${file.name.replace(/]/g, '')}](${url})\n`;
      this.editor.setValue(this.draftText);
      this.editor.setPosition({column: 0, lineNumber: this.editor.getModel().getLineCount()});
    }

    // rendering
    // =

    render () {
      const mustBePrivate = this.mustBePrivate;
      const navItem = (id, label) => html`
      <a
        class=${this.currentView === id ? 'current' : ''}
        @click=${e => { this.currentView = id; }}
      >${label}</a>
    `;
      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <link rel="stylesheet" href=${(new URL('../vs/editor/editor.main.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <form @submit=${this.onSubmit}>
        <nav>
          ${navItem('edit', 'Write')}
          ${navItem('preview', 'Preview')}
        </nav>

        <div class="view">
          ${this.isEmpty && this.currentView === 'edit' ? html`<div class="placeholder">${this.placeholder}</div>` : ''}
          <div class="editor ${this.currentView === 'edit' ? '' : 'hidden'}" @contextmenu=${this.onContextmenu}></div>
          ${this.currentView === 'preview' ? this.renderPreview() : ''}
        </div>

        <div class="tags">
          <span class="fas fa-tag"></span>
          <input placeholder="Tags, separated by spaces" @keyup=${this.onKeyupTags}>
        </div>

        <div class="actions">
          <div class="ctrls">
            <input type="file" class="image-select" accept=".png,.gif,.jpg,.jpeg" @change=${this.onChangeImage}>
            <button class="transparent tooltip-right" @click=${this.onClickAddImage} data-tooltip="Add Image">
              <span class="far fa-fw fa-image"></span>
            </button>
          </div>
          <div>
            ${this.driveUrl ? html`
              <a
                class="visibility disabled tooltip-top"
                data-tooltip="Posting to ${this.profile?.title}"
              >
                <span class="fas fa-fw fa-globe-africa"></span> Posting to ${this.profile?.title}
              </a>
            ` : html`
              <a
                class="visibility ${mustBePrivate ? 'disabled' : ''} tooltip-top"
                data-tooltip=${mustBePrivate ? 'Must be private as you are commenting on private content' : 'Choose who can see this content'}
                @click=${this.onClickVisibility}
              >
                ${this.visibility === 'private' ? html`
                  <span class="fas fa-fw fa-lock"></span> Private
                ` : html`
                  <span class="fas fa-fw fa-globe-africa"></span> Public
                `}
                ${mustBePrivate ? '' : html`<span class="fas fa-fw fa-caret-down"></span>`}
              </a>
            `}
            <button @click=${this.onCancel} tabindex="4">Cancel</button>
            <button type="submit" class="primary" tabindex="3" ?disabled=${this.isEmpty}>
              ${this.visibility === 'private' ? 'Save privately' : 'Publish publicly'}
            </button>
          </div>
        </div>
      </form>
    `
    }

    renderPreview () {
      if (!this.draftText) { 
        return html`<div class="preview"><small><span class="fas fa-fw fa-info"></span> You can use Markdown to format your post.</small></div>`
      }
      return html`
      <div class="preview markdown">
        ${unsafeHTML(beaker.markdown.toHTML(this.draftText))}
      </div>
    `
    }

    async firstUpdated () {
      await this.createEditor();
      this.editor.focus();
      this.editor.onDidChangeModelContent(e => {
        this.draftText = this.editor.getValue();
      });
    }
    
    // events
    // =

    async onContextmenu (e) {
      e.preventDefault();
      e.stopPropagation();
      create$1({
        x: e.clientX,
        y: e.clientY,
        noBorders: true,
        style: `padding: 6px 0`,
        items: [
          {label: 'Cut', click: () => {
            this.editor.focus();
            document.execCommand('cut');
          }},
          {label: 'Copy', click: () => {
            this.editor.focus();
            document.execCommand('copy');
          }},
          {label: 'Paste', click: () => {
            this.editor.focus();
            document.execCommand('paste');
          }},
          '-',
          {label: 'Select All', click: () => {
            this.editor.setSelection(this.editor.getModel().getFullModelRange());
          }},
          '-',
          {label: 'Undo', click: () => {
            this.editor.trigger('contextmenu', 'undo');
          }},
          {label: 'Redo', click: () => {
            this.editor.trigger('contextmenu', 'redo');
          }},
        ]
      });
    }

    onKeyupTags (e) {
      var input = e.currentTarget;
      this.tags = input.value.toLowerCase();
      this.tags = this.tags.replace(/[^a-z0-9- ]/g, '');
      input.value = this.tags;
    }

    onClickAddImage (e) {
      e.preventDefault();
      this.currentView = 'edit';
      this.shadowRoot.querySelector('.image-select').click();
    }

    onChangeImage (e) {
      var file = e.currentTarget.files[0];
      if (!file) return
      this.insertImage(file);
    }

    onClickVisibility (e) {
      if (this.mustBePrivate) return
      var rect = e.currentTarget.getClientRects()[0];
      e.preventDefault();
      e.stopPropagation();
      const items = [
        {icon: 'fas fa-lock', label: 'Private (Only Me)', click: () => { this.visibility = 'private'; } },
        {icon: 'fas fa-globe-africa', label: 'Public (Everybody)', click: () => { this.visibility = 'public'; } }
      ];
      create$1({
        x: rect.left,
        y: rect.bottom,
        noBorders: true,
        roomy: true,
        rounded: true,
        style: `padding: 6px 0`,
        items
      });
    }

    onCancel (e) {
      e.preventDefault();
      e.stopPropagation();
      this.draftText = '';
      this.currentView = 'edit';
      this.dispatchEvent(new CustomEvent('cancel'));
      _currentComposer = undefined;
    }

    async onSubmit (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!this.draftText) {
        return
      }

      if (!this.profile) {
        throw new Error('.profile is missing')
      }

      var driveUrl = this.driveUrl;
      if (!driveUrl) {
        driveUrl = this.visibility === 'private' ? 'hyper://private' : this.profile.url;
      }
      var drive = beaker.hyperdrive.drive(driveUrl);
      var filename = '' + Date.now();
      var folder = '';
      var postBody = this.draftText;
      if (this.subject || this.parent) {
        folder = '/comments/';
      } else {
        folder = '/microblog/';
      }

      // write all images to the drive and replace their URLs in the post
      var i = 1;
      var blobsToWrite = this.blobs.filter(b => this.draftText.includes(b.url));
      for (let blob of blobsToWrite) {
        let ext = blob.file.name.split('.').pop();
        let path = `${folder}${filename}-${i++}.${ext}`;

        let buf = await blob.file.arrayBuffer();
        await drive.writeFile(path, buf);

        let url = joinPath(driveUrl, path);
        while (postBody.includes(blob.url)) {
          postBody = postBody.replace(blob.url, url);
        }
      }

      if (this.subject || this.parent) {
        let subject = this.subject;
        let parent = this.parent;
        if (subject === parent) parent = undefined; // not needed
        await drive.writeFile(`${folder}${filename}.md`, postBody, {
          metadata: {
            'comment/subject': subject ? normalizeUrl(subject) : undefined,
            'comment/parent': parent ? normalizeUrl(parent) : undefined
          }
        });
      } else {
        await drive.writeFile(`${folder}${filename}.md`, postBody);
      }
      var url = joinPath(driveUrl, `${folder}${filename}.md`);

      var tags = this.tags.trim();
      if (tags) {
        let tagFilename = Date.now();
        for (let tag of tags.split(' ').filter(Boolean)) {
          tag = tag.trim();
          if (!tag) continue
          await drive.writeFile(`/tags/${tagFilename++}.goto`, '', {
            metadata: {href: url, 'tag/id': tag}
          });
        }
      }
      
      this.draftText = '';
      this.tags = '';
      this.currentView = 'edit';
      this.dispatchEvent(new CustomEvent('publish', {detail: {url}}));
      _currentComposer = undefined;
    }
  }

  customElements.define('ctzn-post-composer', PostComposer);

  // handles image-pasting
  function onGlobalPaste (e) {
    if (!_currentComposer || !_currentComposer.editor) {
      return
    }
    var editor = _currentComposer.editor;
    if (editor.hasTextFocus()) {
      let items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        let matches = items[i].type.match(/^image\/(png|jpg|jpeg|gif)$/i);
        if (matches) {
          _currentComposer.insertImage(items[i].getAsFile());
        }
      }
    }
  }

  function normalizeUrl (url) {
    try {
      // strips the hash segment
      let {protocol, hostname, port, pathname, search} = new URL(url);
      return `${protocol}//${hostname}${(port ? `:${port}` : '')}${pathname || '/'}${search}`
    } catch (e) {
      return url
    }
  }

  class Record extends LitElement {
    static get properties () {
      return {
        record: {type: Object},
        loadRecordUrl: {type: String, attribute: 'record-url'},
        renderMode: {type: String, attribute: 'render-mode'},
        isNotification: {type: Boolean, attribute: 'is-notification'},
        isUnread: {type: Boolean, attribute: 'is-unread'},
        searchTerms: {type: String, attribute: 'search-terms'},
        showContext: {type: Boolean, attribute: 'show-context'},
        constrainHeight: {type: Boolean, attribute: 'constrain-height'},
        profileUrl: {type: String, attribute: 'profile-url'},
        actionTarget: {type: String, attribute: 'action-target'},
        isReplyOpen: {type: Boolean},
        viewContentOnClick: {type: Boolean, attribute: 'view-content-on-click'},
        showReadMore: {type: Boolean}
      }
    }

    static get styles () {
      return cssStr$b
    }

    constructor () {
      super();
      this.record = undefined;
      this.loadRecordUrl = undefined;
      this.renderMode = undefined;
      this.isNotification = false;
      this.isUnread = false;
      this.searchTerms = undefined;
      this.showContext = false;
      this.constrainHeight = false;
      this.profileUrl = undefined;
      this.actionTarget = undefined;
      this.isReplyOpen = false;
      this.viewContentOnClick = false;
      this.showReadMore = false;

      // helper state
      this.hasLoadedSignals = false;
      this.hasCheckedOverflow = false;
      this.isMouseDown = false;
      this.isMouseDragging = false;
    }

    updated (changedProperties) {
      let markdownEl = this.shadowRoot.querySelector('.markdown');
      if (markdownEl) {
        this.attachImageLoaders(markdownEl);
      }

      if (this.record && this.constrainHeight && !this.hasCheckedOverflow && document.visibilityState === 'visible') {
        this.hasCheckedOverflow = true;
        this.whenContentLoaded().then(r => {
          if (this.isContentOverflowing) {
            this.showReadMore = true;
          }
        });
      }
      if ((!this.record && this.loadRecordUrl) || changedProperties.has('loadRecordUrl') && changedProperties.get('loadRecordUrl') != this.recordUrl) {
        this.load();
      }
    }

    async load () {
      let {record} = await beaker.index.gql(`
      query Record ($url: String!) {
        record (url: $url) {
          type
          path
          url
          ctime
          mtime
          rtime
          metadata
          index
          content
          site {
            url
            title
          }
          votes: backlinks(paths: ["/votes/*.goto"]) {
            url
            metadata
            site { url title }
          }
          tags: backlinks(paths: ["/tags/*.goto"]) {
            url
            metadata
            site { url title }
          }
          commentCount: backlinkCount(paths: ["/comments/*.md"])
        }
      }
    `, {url: this.loadRecordUrl});
      this.record = record;
      if (!this.renderMode) {
        this.renderMode = getPreferredRenderMode(this.record);
        this.setAttribute('render-mode', this.renderMode);
      }
    }

    async reloadSignals () {
      let {votes, tags, commentCount} = await beaker.index.gql(`
      query Signals ($href: String!) {
        votes: records(paths: ["/votes/*.goto"] links: {url: $href}) {
          url
          metadata
          site { url title }
        }
        tags: records(paths: ["/tags/*.goto"] links: {url: $href}) {
          url
          metadata
          site { url title }
        }
        commentCount: recordCount(paths: ["/comments/*.md"] links: {url: $href})
      }
    `, {href: this.record.url});
      this.record.votes = votes;
      this.record.tags = tags;
      this.record.commentCount = commentCount;
      this.requestUpdate();
    }

    get myVote () {
      return this.record?.votes.find(v => isSameOrigin(v.site.url, this.profileUrl) || isSameOrigin(v.site.url, 'hyper://private'))
    }

    get upvoteCount () {
      return (new Set(this.record?.votes.filter(v => v.metadata['vote/value'] == 1).map(v => v.site.url))).size
    }

    get downvoteCount () {
      return (new Set(this.record?.votes.filter(v => v.metadata['vote/value'] == -1).map(v => v.site.url))).size    
    }

    async whenContentLoaded () {
      let images = Array.from(this.shadowRoot.querySelectorAll('.content img'));
      images = images.filter(el => !el.complete);
      while (images.length) {
        await new Promise(r => setTimeout(r, 10));
        images = images.filter(el => !el.complete);
      }
    }

    get isContentOverflowing () {
      try {
        let content = this.shadowRoot.querySelector('.content');
        if (this.renderMode === 'card') {
          return content.clientHeight >= 50 || content.scrollHeight >= 50
        }
        if (this.renderMode === 'comment') {
          return content.clientHeight >= 50 || content.scrollHeight >= 50
        }
      } catch {}
      return false
    }

    attachImageLoaders (el) {
      for (let img of Array.from(el.querySelectorAll('img'))) {
        if (!img.complete) {
          img.classList.add('image-loading');
          img.addEventListener('load', e => img.classList.remove('image-loading'));
          img.addEventListener('error', e => img.classList.remove('image-loading'));
        }
      }
    }

    // rendering
    // =

    render () {
      if (!this.record) {
        if (this.loadRecordUrl) {
          return html`
          <a class="unknown-link" href=${this.loadRecordUrl}>
            ${asyncReplace(fancyUrlAsync(this.loadRecordUrl))}
          </a>
        `
        }
        return html``
      }
      switch (this.renderMode) {
        case 'card': return this.renderAsCard()
        case 'comment': return this.renderAsComment()
        case 'action': return this.renderAsAction()
        case 'expanded-link': return this.renderAsExpandedLink()
        case 'wrapper': return this.renderResultAsWrapper()
        case 'link':
        default:
          return this.renderResultAsLink()
      }
    }

    renderAsCard () {
      const res = this.record;
      const rtype = getRecordType(res);

      var context = undefined;
      switch (rtype) {
        case 'comment':
          context = res.metadata['comment/parent'] || res.metadata['comment/subject'];
          break
      }

      var shouldShowContent = ['comment', 'microblogpost'].includes(rtype);
      if (shouldShowContent && !res.content) {
        return html`
        <a class="unknown-link" href=${res.url}>
          ${asyncReplace(fancyUrlAsync(res.url))}
        </a>
      `
      }

      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      ${this.isNotification ? this.renderNotification() : ''}
      ${this.showContext && context ? html`
        <div class="card-context">
          <ctzn-record
            record-url=${context}
            render-mode="wrapper"
            constrain-height
            noborders
            nothumb
            as-context
            profile-url=${this.profileUrl}
          ></ctzn-record>
        </div>
      ` : ''}
      <div
        class=${classMap({
          record: true,
          card: true,
          'private': res.url.startsWith('hyper://private'),
          'constrain-height': this.constrainHeight,
          'is-notification': this.isNotification,
          unread: this.isUnread
        })}
      >
        <a class="thumb" href=${res.site.url} title=${res.site.title} data-tooltip=${res.site.title}>
          ${res.url.startsWith('hyper://private') ? html`
            <span class="sysicon fas fa-lock"></span>
          ` : html`
            <img class="favicon" src="${res.site.url}/thumb">
          `}
        </a>
        <span class="arrow"></span>
        <div
          class="container"
          @mousedown=${this.onMousedownCard}
          @mouseup=${this.onMouseupCard}
          @mousemove=${this.onMousemoveCard}
        >
          <div class="header">
            <div class="origin">
              ${res.url.startsWith('hyper://private/') ? html`
                <a class="author" href=${res.site.url} title=${res.site.title}>
                  Private
                  ${getRecordType(res)}
                </a>
              ` : html`
                <a class="author" href=${res.site.url} title=${res.site.title}>
                  ${res.site.title}
                </a>
              `}
            </div>
            <span>&middot;</span>
            <div class="date">
              <a href=${res.url} data-tooltip=${(new Date(res.ctime)).toLocaleString()}>
                ${relativeDate(res.ctime)}
              </a>
            </div>
          </div>
          <div class="content markdown">
            ${res.content ? (this.renderMatchText('content') || unsafeHTML(beaker.markdown.toHTML(res.content))) : ''}
          </div>
          ${this.showReadMore ? html`
            <div class="read-more">
              <a @click=${this.onClickReadMore}>Read more <span class="fas fa-angle-down"></span></a>
            </div>
          ` : ''}
          <div class="ctrls">
            ${this.renderVoteCtrl()}
            ${this.renderCommentsCtrl()}
            ${this.renderTagsCtrl()}
          </div>
        </div>
      </div>
    `
    }

    renderAsComment () {
      const res = this.record;

      var context = undefined;
      switch (getRecordType(res)) {
        case 'comment':
          context = res.metadata['comment/subject'] || res.metadata['comment/parent'];
          break
      }

      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      ${this.isNotification ? this.renderNotification() : ''}
      <div
        class=${classMap({
          record: true,
          comment: true,
          'private': res.url.startsWith('hyper://private'),
          'constrain-height': this.constrainHeight,
          'is-notification': this.isNotification,
          unread: this.isUnread
        })}
      >
        <div class="header">
          <a class="thumb" href=${res.site.url} title=${res.site.title} data-tooltip=${res.site.title}>
            <img class="favicon" src="${res.site.url}/thumb">
          </a>
          <div class="origin">
            ${res.url.startsWith('hyper://private/') ? html`
              <a class="author" href=${res.site.url} title=${res.site.title}>Private comment</a>
            ` : html`
              <a class="author" href=${res.site.url} title=${res.site.title}>
                ${res.site.title}
              </a>
            `}
          </div>
          ${this.actionTarget ? html`
            <span class="action">mentioned ${this.actionTarget}</span>
          ` : ''}
          <div class="date">
            <a href=${res.url} data-tooltip=${(new Date(res.ctime)).toLocaleString()}>
              ${relativeDate(res.ctime)}
            </a>
          </div>
          ${this.showContext && context ? html`
            <span>&middot;</span>
            <div class="context">
              <a href=${context}>
                ${asyncReplace(fancyUrlAsync(context))}
              </a>
            </div>
          ` : ''}
        </div>
        <div class="content markdown">
          ${this.renderMatchText('content') || unsafeHTML(beaker.markdown.toHTML(res.content))}
        </div>
        ${this.showReadMore ? html`
          <div class="read-more">
            <a @click=${this.onClickReadMore}>Read more <span class="fas fa-angle-down"></span></a>
          </div>
        ` : ''}
        <div class="ctrls">
          ${this.renderVoteCtrl()}
          <a class="reply" @click=${this.onClickReply}><span class="fas fa-fw fa-reply"></span> <small>Reply</small></a>
          ${this.renderTagsCtrl()}
        </div>
        ${this.isReplyOpen ? html`
          <ctzn-post-composer
            subject=${this.record.metadata['comment/subject'] || this.record.url}
            parent=${this.record.url}
            placeholder="Write your comment"
            @publish=${this.onPublishReply}
            @cancel=${this.onCancelReply}
          ></ctzn-post-composer>
        ` : ''}
      </div>
    `
    }

    renderAsAction () {
      const res = this.record;
      const rtype = getRecordType(res);
     
      var subject;
      if (['subscription', 'vote'].includes(rtype)) {
        subject = isSameOrigin(res.metadata.href, this.profileUrl) ? 'you' : fancyUrlAsync(res.metadata.href);
      } else {
        if (!res.path.endsWith('.goto') && res.metadata.title) subject = res.metadata.title;
        else if (res.content) subject = shorten(removeMarkdown(res.content), 150);
        else if (rtype !== 'unknown') subject = `a ${rtype}`;
        else subject = fancyUrlAsync(res.url);
      }
      var showContentAfter = res.content && ['microblogpost', 'comment'].includes(rtype);

      return html`
      <div
        class=${classMap({
          record: true,
          action: true,
          'private': res.url.startsWith('hyper://private'),
          'is-notification': this.isNotification,
          unread: this.isUnread
        })}
      >
        <a class="thumb" href=${res.site.url} title=${res.site.title} data-tooltip=${res.site.title}>
          <img class="favicon" src="${res.site.url}/thumb">
        </a>
        <div>
          <a class="author" href=${res.site.url} title=${res.site.title}>
            ${res.site.url === 'hyper://private' ? 'I privately' : res.site.title}
          </a>
          ${rtype === 'subscription' ? html`
            <span class="action">subscribed to</span>
            <a class="subject" href=${res.metadata.href}>${typeof subject === 'string' ? subject : asyncReplace(subject)}</a>
          ` : this.actionTarget ? html`
            ${rtype === 'vote' ? html`
              <span class="action">${res.metadata['vote/value'] == -1 ? 'downvoted' : 'upvoted'}</span>
              <a class="subject" href=${res.metadata.href}>${this.actionTarget}</a>
            ` : rtype === 'bookmark' ? html`
              <span class="action">bookmarked ${this.actionTarget}</span>
            ` : rtype === 'tag' ? html`
              <span class="action">tagged ${this.actionTarget} <a @click=${e => this.onViewTag(e, res.metadata['tag/id'])}>#${res.metadata['tag/id']}</a></span>
            ` : rtype === 'comment' ? html`
              <span class="action">commented on ${this.actionTarget}</span>
            ` : showContentAfter ? html`
              <span class="action">mentioned ${this.actionTarget}</span>
            ` : html`
              <span class="action">mentioned ${this.actionTarget} in</span>
              <a class="subject" href=${res.url}>${typeof subject === 'string' ? subject : asyncReplace(subject)}</a>
            `}
          ` : html`
            ${rtype === 'vote' ? html`
              <span class="action">${res.metadata['vote/value'] == -1 ? 'downvoted' : 'upvoted'}</span>
              <a class="subject" href=${res.metadata.href}>${subject}</a>
            ` : rtype === 'bookmark' ? html`
              <span class="action">bookmarked <a href=${res.metadata.href} target="_blank">${res.metadata.title || res.metadata.href}</a></span>
            ` : rtype === 'blogpost' ? html`
              <span class="action">published <a href=${res.url} target="_blank">${res.metadata.title || res.path}</a></span>
            ` : ''}
          `}
          ${res.mergedItems ? html`
            <span>and</span>
            <a
              class="others"
              href="#"
              data-tooltip=${shorten(res.mergedItems.map(r => r.metadata.title || 'Untitled').join(', '), 100)}
              @click=${e => this.onClickShowSites(e, res.mergedItems)}
            >${res.mergedItems.length} other ${pluralize(res.mergedItems.length, 'site')}</a>
          ` : ''}
          <a class="date" href=${res.url}>${relativeDate(res.ctime)}</a>
        </div>
      </div>
      ${showContentAfter ? html`
        <div class="action-content">
          <a href=${res.url} title=${subject}>${subject}</a>
        </div>
      ` : ''}
    `
    }

    renderAsExpandedLink () {
      const res = this.record;

      var title = res.metadata.title || res.url.split('/').pop();
      var content = res.content;
      var isBookmark = false;
      var href = undefined;
      var recordType = getRecordType(res);
      switch (recordType) {
        case 'bookmark':
          isBookmark = true;
          href = res.metadata.href;
          break
        case 'comment':
        case 'microblogpost':
          title = removeMarkdown(removeFirstMdHeader(res.content));
          break
      }
      href = href || res.url;

      return html`
    <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <div class="record expanded-link ${res.url.startsWith('hyper://private') ? 'private' : ''}">
        <a class="thumb" href=${href} title=${res.site.title}>
          ${this.renderThumb(res)}
        </a>
        <div class="info">
          <div class="title"><a href=${href}>${this.renderMatchText('title') || shorten(title, 150)}</a></div>
          <div class="origin">
            ${isBookmark ? html`
              <span class="origin-note"><span class="far fa-fw fa-star"></span> Bookmarked by</span>
              <a class="author" href=${res.site.url} title=${res.site.title}>
                ${res.site.url === 'hyper://private/' ? 'Me (Private)' : res.site.title}
              </a>
            ` : (
              res.site.url === 'hyper://private/' ? html`
                <span class="sysicon fas fa-fw fa-lock"></span>
                <a class="author" href=${res.site.url} title=${res.site.title}>
                  Me (Private)
                </a>
              ` : html`
                <img class="favicon" src="${res.site.url}/thumb">
                <a class="author" href=${res.site.url} title=${res.site.title}>
                  ${res.site.title}
                </a>
              `)
            }
            <span>|</span>
            ${recordType === 'bookmark' ? html`<span class="type"><span class="far fa-star"></span> Bookmark</span>` : ''}
            ${recordType === 'page' ? html`<span class="type"><span class="far fa-file"></span> Page</span>` : ''}
            ${recordType === 'blogpost' ? html`<span class="type"><span class="fas fa-blog"></span> Blogpost</span>` : ''}
            ${recordType === 'comment' ? html`<span class="type"><span class="far fa-comments"></span> Comment</span>` : ''}
            ${recordType === 'microblogpost' ? html`<span class="type"><span class="far fa-comment-alt"></span> Post</span>` : ''}
            <span>|</span>
            <a class="date" href=${href}>${niceDate(res.ctime)}</a>
            <span>|</span>
            ${this.renderVoteCtrl()}
            ${this.renderCommentsCtrl()}
            ${this.renderTagsCtrl()}
          </div>
          ${content ? html`
            <div class="excerpt">
              ${this.renderMatchText('content') || shorten(removeMarkdown(removeFirstMdHeader(content)), 300)}
            </div>
          ` : ''}
        </div>
      </a>
    `
    }

    renderResultAsLink () {
      const res = this.record;
      var recordType = getRecordType(res);

      var href = undefined;
      switch (recordType) {
        case 'comment': href = res.metadata['comment/subject']; break
        case 'bookmark': href = res.metadata.href; break
      }
      href = href || res.url;

      var hrefp;
      if (recordType === 'bookmark' && href) {
        try {
          hrefp = new URL(href);
        } catch {}
      }

      var title = res.metadata['title'] || ({
        'bookmark': niceDate(res.ctime),
        'blogpost': niceDate(res.ctime),
        'microblogpost': niceDate(res.ctime),
        'page': niceDate(res.ctime),
        'comment': niceDate(res.ctime)
      })[recordType] || res.url.split('/').pop() || niceDate(res.ctime);

      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      ${this.isNotification ? this.renderNotification() : ''}
      <div
        class=${classMap({
          record: true,
          link: true,
          'private': res.url.startsWith('hyper://private'),
          'is-notification': this.isNotification,
          unread: this.isUnread
        })}
      >
        <a class="thumb" href=${res.site.url} title=${res.site.title} data-tooltip=${res.site.title}>
          ${res.url.startsWith('hyper://private') ? html`
            <span class="sysicon fas fa-lock"></span>
          ` : html`
            <img class="favicon" src="${res.site.url}/thumb">
          `}
        </a>
        <div class="container">
          <div class="title">
            <a class="link-title" href=${href}>${shorten(title, 500)}</a>
            ${hrefp ? html`
              <a class="link-origin" href=${hrefp.origin}>${toNiceDomain(hrefp.hostname)}</a>
            ` : ''}
          </div>
          <div class="ctrls">
            ${recordType === 'bookmark' ? html`<span class="far fa-star"></span>` : ''}
            ${recordType === 'page' ? html`<span class="far fa-file"></span>` : ''}
            ${recordType === 'blogpost' ? html`<span class="fas fa-blog"></span>` : ''}
            by
            <span class="origin">
              <a class="author" href=${res.site.url} title=${res.site.title}>
                ${res.site.url === 'hyper://private' ? 'Me (Private)' : res.site.title}
              </a>
            </span>
            <span class="date">
              <a href=${res.url} data-tooltip=${(new Date(res.ctime)).toLocaleString()}>
                ${relativeDate(res.ctime)}
              </a>
            </span>
            ${this.renderVoteCtrl()}
            ${this.renderCommentsCtrl()}
            ${this.renderTagsCtrl()}
          </div>
        </div>
      </div>
    `
    }

    renderResultAsWrapper () {
      const res = this.record;
      var recordType = getRecordType(res);

      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <div
        class=${classMap({
          record: true,
          wrapper: true,
          'private': res.url.startsWith('hyper://private'),
          'is-notification': this.isNotification,
          unread: this.isUnread
        })}
      >
        <a class="thumb" href=${res.site.url} title=${res.site.title} data-tooltip=${res.site.title}>
          ${res.url.startsWith('hyper://private') ? html`
            <span class="sysicon fas fa-lock"></span>
          ` : html`
            <img class="favicon" src="${res.site.url}/thumb">
          `}
        </a>
        <div class="container">
          ${this.isNotification ? this.renderNotification() : ''}
          <a class="subject" href=${res.metadata.href || res.url} @click=${this.onViewWrapperThread}>
            ${asyncReplace(loadAndSimpleRender(res.metadata.href || res.url))}
          </a>
        </div>
      </div>
    `
    }

    renderThumb (url = undefined) {
      url = url || this.record.url;
      if (url && /\.(png|jpe?g|gif)$/.test(url)) {
        return html`<img src=${url}>`
      }
      var icon = 'far fa-file-alt';
      switch (getRecordType(this.record)) {
        case 'blogpost': icon = 'fas fa-blog'; break
        case 'page': icon = 'far fa-file-alt'; break
        case 'bookmark': icon = 'fas fa-star'; break
        case 'microblogpost': icon = 'fas fa-stream'; break
        case 'comment': icon = 'far fa-comment'; break
      }
      return html`
      <span class="icon">
        <span class="fa-fw ${icon}"></span>
      </span>
    `
    }

    renderVoteCtrl () {
      var myVote = this.myVote?.metadata['vote/value'];
      return html`
      <span class="vote-ctrl">
        <a class="up ${myVote == 1 ? 'pressed' : ''}" data-tooltip="Upvote" @click=${e => this.onToggleVote(e, 1)}>
          <span class="far fa-thumbs-up"></span>
          <span class="count">${this.upvoteCount}</span>
        </a>
        <a class="down ${myVote == -1 ? 'pressed' : ''}" data-tooltip="Downvote" @click=${e => this.onToggleVote(e, -1)}>
          <span class="far fa-thumbs-down"></span>
          <span class="count">${this.downvoteCount}</span>
        </a>
      </span>
    `
    }

    renderCommentsCtrl () {
      return html`
      <a class="comment-ctrl" @click=${this.onViewThread}>
        <span class="far fa-comment"></span>
        ${this.record?.commentCount}
      </a>
    `
    }

    renderTagsCtrl () {
      return html`
      <a class="tag-ctrl" @click=${this.onClickTags}>
        <span class="fas fa-tag"></span>
      </a>
      ${repeat(this.record?.tags || [], tag => tag.url, tag => {
        var id = tag.metadata['tag/id'];
        if (!id) return ''
        return html`<a class="tag" @click=${e => this.onViewTag(e, id)}>#${id}</a>`
      })}
    `
    }

    renderMatchText (key) {
      if (!this.searchTerms) return undefined
      let v = key === 'content' ? this.record.content : this.record.metadata[key];
      if (!v) return undefined
      let re = new RegExp(`(${this.searchTerms.replace(/([\s]+)/g, '|')})`, 'gi');
      let text = removeMarkdown(v).replace(re, match => `<b>${match}</b>`);

      // if there were no facet highlights then it was a link url (or similar) that matched
      // and `removeMarkdown()` has hidden that, which makes the result confusing
      // so we need to show the markdown syntax if that's the case
      let start = text.indexOf('<b>');
      if (start === -1) {
        text = v.replace(re, match => `<b>${match}</b>`);
        start = text.indexOf('<b>');
      }

      // slice to the matched text
      if (start > 50) text = `...${text.slice(start - 50)}`;
      let end = text.indexOf('</b>');
      if ((text.length - end) > 200) text = `${text.slice(0, end + 200)}...`;

      return unsafeHTML(text)
    }

    renderNotification () {
      const res = this.record;
      const link = res.links.find(l => l.url.startsWith(this.profileUrl));
      var type = getRecordType(res);
      var description = 'linked to';
      var afterdesc = '';
      if (type === 'vote') {
        if (res.metadata['vote/value'] == '1') {
          description = 'upvoted';
        } else if (res.metadata['vote/value'] == '-1') {
          description = 'downvoted';
        }
      } else if (type === 'tag') {
        let tag = res.metadata['tag/id'];
        if (tag) {
          description = 'tagged';
          afterdesc = html`
          as <strong><a @click=${e => this.onViewTag(e, tag)}>#${tag}</a></strong>
        `;
        }
      } else if (link.source === 'content') {
        if (type === 'microblogpost' || type === 'comment') {
          description = 'mentioned';
        }
      } else if (link.source === 'metadata:href') {
        if (type === 'bookmark') {
          description = 'bookmarked';
        } else if (type === 'subscription') {
          description = 'subscribed to';
        }
      } else if (link.source === 'metadata:comment/subject') {
        description = 'commented on';
      } else if (link.source === 'metadata:comment/parent') {
        description = 'replied to';
      }
      var where = ({
        'page': 'in',
        'blogpost': 'in'
      })[type] || '';
      return html`
      <div class="notification">
        ${res.site.title}
        ${description}
        <a href=${link.url}>
          ${asyncReplace(getNotificationSubjectStream(link.url, this.profileUrl))}
        </a>
        ${where}
        ${afterdesc}
      </div>
    `
    }

    // events
    // =

    onClickReply (e) {
      e.preventDefault();
      this.isReplyOpen = true;
    }

    onPublishReply (e) {
      e.preventDefault();
      e.stopPropagation();
      this.isReplyOpen = false;
      emit(this, 'publish-reply');
    }

    onCancelReply (e) {
      this.isReplyOpen = false;
    }

    onViewThread (e, record) {
      if (!this.viewContentOnClick && e.button === 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        emit(this, 'view-thread', {detail: {record: this.record}});
      }
    }

    onViewTag (e, tag) {
      emit(this, 'view-tag', {detail: {tag}});
    }

    async onViewWrapperThread (e) {
      if (!this.viewContentOnClick && e.button === 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        let {record} = await beaker.index.gql(`
        query Record ($url: String!) {
          record (url: $url) {
            type
            path
            url
            ctime
            mtime
            rtime
            metadata
            index
            content
            site {
              url
              title
            }
            votes: backlinks(paths: ["/votes/*.goto"]) {
              url
              metadata
              site { url title }
            }
            tags: backlinks(paths: ["/tags/*.goto"]) {
              url
              metadata
              site { url title }
            }
            commentCount: backlinkCount(paths: ["/comments/*.md"])
          }
        }
      `, {url: this.record.metadata.href});
        emit(this, 'view-thread', {detail: {record}});
      }
    }

    onClickReadMore () {
      this.constrainHeight = false;
      this.showReadMore = false;
    }

    onMousedownCard (e) {
      for (let el of e.path) {
        if (el.tagName === 'A' || el.tagName === 'ctzn-POST-COMPOSER') return
      }
      this.isMouseDown = true;
      this.isMouseDragging = false;
    }

    onMousemoveCard (e) {
      if (this.isMouseDown) {
        this.isMouseDragging = true;
      }
    }

    onMouseupCard (e) {
      if (!this.isMouseDown) return
      if (!this.isMouseDragging) {
        e.preventDefault();
        e.stopPropagation();
        emit(this, 'view-thread', {detail: {record: this.record}});
      }
      this.isMouseDown = false;
      this.isMouseDragging = false;
    }

    onClickShowSites (e, results) {
      e.preventDefault();
      SitesListPopup.create('Subscribed Sites', results.map(r => ({
        url: r.metadata.href,
        title: r.metadata.title || 'Untitled'
      })));
    }

    async onToggleVote (e, value) {
      if (this.myVote) {
        if (this.myVote.metadata['vote/value'] == value) {
          await beaker.hyperdrive.unlink(this.myVote.url);
        } else {
          await beaker.hyperdrive.updateMetadata(this.myVote.url, {'vote/value': value});
        }
      } else {
        var drive = this.record.url.startsWith('hyper://private')
          ? beaker.hyperdrive.drive('hyper://private')
          : beaker.hyperdrive.drive(this.profileUrl);
        await drive.writeFile(`/votes/${Date.now()}.goto`, '', {
          metadata: {
            href: this.record.url,
            'vote/value': value
          }
        });
      }
      this.reloadSignals();
    }

    onClickTags (e) {
      e.preventDefault();
      e.stopPropagation();
      var rect = e.currentTarget.getClientRects()[0];
      create$2({
        x: rect.left,
        y: rect.bottom,
        record: this.record,
        profileUrl: this.profileUrl,
        onAdd: async (tagId) => {
          let url = joinPath(this.profileUrl, `/tags/${Date.now()}.goto`);
          await beaker.hyperdrive.writeFile(url, '', {
            metadata: {
              href: this.record.url,
              'tag/id': tagId
            }
          });
          this.reloadSignals();
          return url
        },
        onRemove: async (tag) => {
          await beaker.hyperdrive.unlink(tag.url);
          await this.reloadSignals();
        }
      });
    }
  }

  customElements.define('ctzn-record', Record);

  function removeFirstMdHeader (str = '') {
    return str.replace(/(^#\s.*\r?\n)/, '').trim()
  }

  var _notificationSubjectCache = {};
  async function getNotificationSubject (url) {
    if (_notificationSubjectCache[url]) {
      return _notificationSubjectCache[url]
    }
    try {
      let {record} = await beaker.index.gql(`
      query Record($url: String!) {
        record (url: $url) {
          path
          metadata
        }
      }
    `, {url});
      if (record.metadata.title) {
        return `"${record.metadata.title}"`
      }
      switch (getRecordType(record)) {
        case 'comment': return 'your comment'
        case 'page': return 'your page'
        case 'blogpost': return 'your blog post'
        case 'microblogpost': return 'your post'
      }
    } catch {}
    return 'your page'
  }

  async function* getNotificationSubjectStream (url, profileUrl) {
    if (isRootUrl(url)) {
      if (url === profileUrl) {
        yield 'you';
      } else {
        yield 'your site';
      }
    } else {
      yield await getNotificationSubject(url);
    }
  }

  var _loadAndSimpleRenderCache = {};
  async function* loadAndSimpleRender (url) {
    if (_loadAndSimpleRenderCache[url]) {
      yield _loadAndSimpleRenderCache[url];
      return
    }
    yield html`Loading...`;
    try {
      let st = await beaker.hyperdrive.stat(url);
      if (st.metadata.title) {
        _loadAndSimpleRenderCache[url] = st.metadata.title;
        yield st.metadata.title;
        return
      }
      if (url.endsWith('.md')) {
        let content = await beaker.hyperdrive.readFile(url);
        _loadAndSimpleRenderCache[url] = shorten(removeMarkdown(content), 200);
        yield _loadAndSimpleRenderCache[url];
        return
      }
    } catch {}
    for await (let v of fancyUrlAsync(url)) {
      yield v;
    }
  }

  function isRootUrl (url) {
    try {
      return (new URL(url)).pathname === '/'
    } catch {
      return false
    }
  }

  const today = (new Date()).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
  const yesterday = (new Date(Date.now() - 8.64e7)).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
  function niceDate (ts, {largeIntervals} = {largeIntervals: false}) {
    var date = (new Date(ts)).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
    if (date === today) return 'Today'
    if (date === yesterday) return 'Yesterday'
    if (largeIntervals) {
      return (new Date(ts)).toLocaleDateString('default', { year: 'numeric', month: 'long' })
    }
    return date
  }

  const MINUTE = 1e3 * 60;
  const HOUR = 1e3 * 60 * 60;
  const DAY = HOUR * 24;

  const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
  function relativeDate (d) {
    const nowMs = Date.now();
    const endOfTodayMs = +((new Date).setHours(23,59,59,999));
    var diff = nowMs - d;
    var dayDiff = Math.floor((endOfTodayMs - d) / DAY);
    if (diff < (MINUTE * 5)) return 'just now'
    if (diff < HOUR) return rtf.format(Math.ceil(diff / MINUTE * -1), 'minute')
    if (dayDiff < 1) return rtf.format(Math.ceil(diff / HOUR * -1), 'hour')
    if (dayDiff <= 30) return rtf.format(dayDiff * -1, 'day')
    if (dayDiff <= 365) return rtf.format(Math.floor(dayDiff / 30) * -1, 'month')
    return rtf.format(Math.floor(dayDiff / 365) * -1, 'year')
  }

  class RecordThread extends LitElement {
    static get properties () {
      return {
        recordUrl: {type: String, attribute: 'record-url'},
        profileUrl: {type: String, attribute: 'profile-url'},
        isFullPage: {type: Boolean, attribute: 'full-page'},
        setDocumentTitle: {type: Boolean, attribute: 'set-document-title'},
        subject: {type: Object},
        replies: {type: Array},
        networkReplies: {type: Array},
        isCommenting: {type: Boolean}
      }
    }

    static get styles () {
      return cssStr$8
    }

    constructor () {
      super();
      this.recordUrl = '';
      this.isFullPage = false;
      this.setDocumentTitle = false;
      this.subjectUrl = undefined;
      this.subject = undefined;
      this.commentCount = 0;
      this.relatedItemCount = 0;
      this.replies = undefined;
      this.networkReplies = undefined;
      this.profileUrl = '';
      this.isCommenting = false;
      this.isLoading = false;
    }

    reset () {
      this.subject = undefined;
      this.commentCount = 0;
      this.relatedItemCount = 0;
      this.replies = undefined;
      this.networkReplies = undefined;
    }

    async fetchRecordOrSite (url) {
      var v;
      var isSite = false;
      try {
        let urlp = new URL(url);
        isSite = urlp.pathname === '/' && !urlp.search;
      } catch {}
      try {
        if (isSite) {
          let {site} = await beaker.index.gql(`
          query Site($url: String!) {
            site(url: $url) {
              url
              title
              description
              writable
            }
          }
        `, {url});
          v = site;
          v.isSite = true;
        } else {
          let {record} = await beaker.index.gql(`
          query Record($url: String!) {
            record (url: $url) {
              type
              path
              url
              ctime
              mtime
              rtime
              metadata
              index
              content
              site {
                url
                title
              }
              votes: backlinks(paths: ["/votes/*.goto"]) {
                url
                metadata
                site { url title }
              }
              tags: backlinks(paths: ["/tags/*.goto"]) {
                url
                metadata
                site { url title }
              }
              commentCount: backlinkCount(paths: ["/comments/*.md"])
            }
          }
        `, {url});
          v = record;
        }
      } catch {}
      return v
    }

    async load () {
      this.isLoading = true;
      this.reset();
      var record = await this.fetchRecordOrSite(this.recordUrl);
      this.subjectUrl = record?.metadata?.['comment/subject'] || this.recordUrl;
      /* dont await */ this.loadSubject(record);
      /* dont await */ this.loadComments(record);
      this.isLoading = false;
    }

    async loadSubject (record) {
      var subjectUrl = record?.metadata?.['comment/subject'];
      var subject;
      if (subjectUrl) {
        subject = await this.fetchRecordOrSite(subjectUrl);
      } else {
        subject = record;
      }
      if (!subject) subject = {url: subjectUrl || this.recordUrl, notFound: true};
      this.subject = subject;
      if (this.setDocumentTitle && this.subject.metadata.title) {
        document.title = this.subject.metadata.title;
      }
      await this.requestUpdate();
      emit(this, 'load');
    }

    async loadComments (record) {
      // local first
      let {replies} = await beaker.index.gql(`
      query Replies ($href: String!) {
        replies: records (
          links: {url: $href}
          indexes: ["local"]
          sort: "crtime",
          reverse: true
        ) {
          type
          path
          url
          ctime
          mtime
          rtime
          metadata
          index
          content
          site {
            url
            title
          }
          votes: backlinks(paths: ["/votes/*.goto"]) {
            url
            metadata
            site { url title }
          }
          tags: backlinks(paths: ["/tags/*.goto"]) {
            url
            metadata
            site { url title }
          }
          commentCount: backlinkCount(paths: ["/comments/*.md"])
        }
      }
    `, {href: stripUrlHash(this.subjectUrl)});
      this.commentCount = replies.filter(r => getRecordType(r) === 'comment').length;
      this.relatedItemCount = replies.length - this.commentCount;
      this.replies = toThreadTree(replies);
      await this.requestUpdate();
      this.scrollHighlightedPostIntoView();
      emit(this, 'load');

      // then try network
      var {networkReplies} = await beaker.index.gql(`
      query Replies ($href: String!) {
        networkReplies: records (
          links: {url: $href}
          indexes: ["network"]
          sort: "crtime",
          reverse: true
        ) {
          type
          path
          url
          ctime
          mtime
          rtime
          metadata
          index
          content
          site {
            url
            title
          }
          votes: backlinks(paths: ["/votes/*.goto"]) {
            url
            metadata
            site { url title }
          }
          tags: backlinks(paths: ["/tags/*.goto"]) {
            url
            metadata
            site { url title }
          }
          commentCount: backlinkCount(paths: ["/comments/*.md"])
        }
      }
    `, {href: stripUrlHash(this.subjectUrl)});
      networkReplies = networkReplies.filter(reply => 
        !reply.path.startsWith('/votes/') // filter out votes
        && !replies.find(reply2 => reply.url === reply2.url) // filter out in-network items
      );
      this.networkReplies = toThreadTree(networkReplies);
      await this.requestUpdate();
      emit(this, 'load');
    }

    updated (changedProperties) {
      if (typeof this.subject === 'undefined' && !this.isLoading) {
        this.load();
      } else if (changedProperties.has('recordUrl') && changedProperties.get('recordUrl') != this.recordUrl) {
        this.load();
      }
    }

    scrollHighlightedPostIntoView () {
      try {
        this.shadowRoot.querySelector('.highlight').scrollIntoView();
      } catch {}
    }

    get actionTarget () {
      let urlp = new URL(this.subjectUrl);
      if (this.subject) {
        let desc = ({
          'microblogpost': 'this post',
          'blogpost': 'this blogpost',
        })[getRecordType(this.subject)];
        if (desc) return desc
      }
      return `this ${urlp.pathname === '/' ? 'site' : 'page'}`
    }

    // rendering
    // =

    render () {
      var mode = 'link';
      if (this.subject && ['comment', 'microblogpost'].includes(getRecordType(this.subject))) {
        mode = 'card';
      }
      return html`
      ${this.subject ? html`
        ${this.subject.isSite ? html`
          <div class="subject link">
            <a class="simple-link" href="${this.subject.url}">
              ${this.subject.title || asyncReplace(fancyUrlAsync(this.subject.url))}
            </a>
          </div>
        ` : this.isFullPage && mode === 'link' && this.subject.url.startsWith('hyper') ? html`
          <div class="subject-content">${this.renderSubjectContent()}</div>
        ` : html`
          <div class="subject ${mode}">
            ${this.subject.notFound ? html`
              <a class="simple-link" href="${this.subject.url}">
                ${asyncReplace(fancyUrlAsync(this.subject.url))}
              </a>
            ` : html`
              <ctzn-record
                .record=${this.subject}
                render-mode=${mode}
                noborders
                view-content-on-click
                profile-url=${this.profileUrl}
                @publish-reply=${this.onPublishReply}
              ></ctzn-record>
            `}
          </div>
        `}
      ` : html`
        <div class="subject link">
          <a class="simple-link" href="${this.subjectUrl}">
            <span class="spinner"></span>
            ${asyncReplace(fancyUrlAsync(this.subjectUrl))}
          </a>
        </div>
      `}
      ${this.replies ? html`
        <div class="comments">
          <div class="comments-header">
            <div>
              <strong>Comments (${this.commentCount})</strong>
              and related items (${this.relatedItemCount}) from your network
            </div>
            ${this.isCommenting ? html`
              <ctzn-post-composer
                subject=${this.subject.metadata?.['comment/subject'] || this.subject.url}
                parent=${this.subject.url}
                placeholder="Write your comment"
                @publish=${this.onPublishComment}
                @cancel=${this.onCancelComment}
              ></ctzn-post-composer>
            ` : html`
              <div class="comment-prompt" @click=${this.onStartComment}>
                Write your comment
              </div>
            `}
          </div>
          <div class="extended-comments-header">
            <div class="label">
              My Network
            </div>
          </div>
          ${this.renderReplies(this.replies)}
        </div>
      ` : ''}
      ${!this.networkReplies || this.networkReplies.length ? html`
        <div class="comments">
          <div class="extended-comments-header">
            <div class="label">
              Extended Network
            </div>
          </div>
          ${this.networkReplies ? this.renderReplies(this.networkReplies) : html`<div class="comments-loading"><span class="spinner"></span></div>`}
        </div>
      ` : ''}
    `
    }

    renderSubjectContent () {
      if (/\.(png|jpe?g|gif|svg|webp)$/i.test(this.subject.url)) {
        return html`<img src=${this.subject.url} title=${this.subject.url}>`
      } else if (/\.(mp4|webm|mov)$/i.test(this.subject.url)) {
        return html`<video controls><source src=${this.subject.url}></video>`
      } else if (/\.(mp3|ogg)$/i.test(this.subject.url)) {
        return html`<audio controls><source src=${this.subject.url}></audio>`
      } else if (/\.(pdf|doc|zip|docx|rar|gz|tar)$/i.test(this.subject.url)) {
        let filename = this.subject.url.split('/').pop();
        return html`
        <p>Download: <a href=${this.subject.url} download=${filename} title=${`Download ${filename}`}>${filename}</a></p>
      `
      } else {
        let self = this;
        const loadFile = async function* () {
          yield html`<div class="loading"><span class="spinner"></span> Loading...</div>`;
          try {
            let content = await beaker.hyperdrive.readFile(self.subject.url);
            if (self.subject.url.endsWith('.md')) {
              yield html`<div class="markdown">${unsafeHTML(beaker.markdown.toHTML(content))}</div>`;
            } else {
              yield html`<pre>${content}</pre>`;
            }
          } catch (e) {
            if (e.message.includes('NotFoundError')) {
              yield html`
              <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
              <div class="error">
                <h2>File not found</h2>
                <div>There is no file or folder at this URL. <span class="far fa-frown"></span></div>
              </div>
            `;
            } else {
              yield html`
              <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
              <div class="error">
                <h2>Uhoh!</h2>
                <p>This file wasn't able to load. <span class="far fa-frown"></span></p>
                <p>Possible causes:</p>
                <ul>
                  <li>Nobody hosting the file is online.</li>
                  <li>Connections to online peers failed.</li>
                  <li>Your Internet is down.</li>
                </ul>
                <details>
                  <summary>Error Details</summary>
                  ${e.toString()}
                </details>
              </div>
            `;
            }
          }
        };
        return html`
        ${asyncReplace(loadFile())}
      `
      }
    }

    renderReplies (replies) {
      if (!replies?.length) return ''
      return html`
      <div class="replies">
        ${repeat(replies, r => r.url, reply => {
          var mode = 'action';
          if (reply.content && ['comment', 'microblogpost'].includes(getRecordType(reply))) {
            mode = 'comment';
          }
          return html`
            <ctzn-record
              class=${this.recordUrl === reply.url ? 'highlight' : ''}
              .record=${reply}
              render-mode=${mode}
              thread-view
              action-target=${this.actionTarget}
              profile-url=${this.profileUrl}
              @publish-reply=${this.onPublishReply}
            ></ctzn-record>
            ${reply.replies?.length ? this.renderReplies(reply.replies) : ''}
          `
        })}
      </div>
    `
    }

    // events
    // =

    onStartComment (e) {
      this.isCommenting = true;
    }

    onPublishComment (e) {
      create('Comment published', '', 10e3);
      this.load();
      this.isCommenting = false;
    }

    onCancelComment (e) {
      this.isCommenting = false;
    }
    

    onPublishReply (e) {
      create('Reply published', '', 10e3);
      this.load();
    }
  }

  customElements.define('ctzn-record-thread', RecordThread);

  function toThreadTree (replies) {
    var repliesByUrl = {};
    replies.forEach(reply => { repliesByUrl[reply.url] = reply; });

    var rootReplies = [];
    replies.forEach(reply => {
      if (reply.metadata['comment/parent']) {
        let parent = repliesByUrl[reply.metadata['comment/parent']];
        if (!parent) {
          reply.isMissingParent = true;
          rootReplies.push(reply);
          return
        }
        if (!parent.replies) {
          parent.replies = [];
          parent.replyCount = 0;
        }
        parent.replies.push(reply);
      } else {
        rootReplies.push(reply);
      }
    });
    return rootReplies
  }

  function stripUrlHash (url) {
    try {
      let i = url.indexOf('#');
      if (i !== -1) return url.slice(0, i)
      return url
    } catch (e) {
      return url
    }
  }

  /* globals beaker */

  // exported api
  // =

  class ViewThreadPopup extends BasePopup {
    constructor (opts) {
      super();
      this.recordUrl = opts.recordUrl;
      this.profileUrl = opts.profileUrl;
      this.onViewTag = opts.onViewTag;
    }

    static get properties () {
      return {
        recordUrl: {type: String}
      }
    }

    static get styles () {
      return [cssStr$4, css`
    .popup-inner {
      width: 100%;
      max-width: 900px;
      border-radius: 6px;
      overflow: visible;
    }
    .popup-inner .body {
      background: var(--bg-color--default);
      padding: 8px 10px 10px;
    }
    `]
    }

    // management
    //

    static async create (opts) {
      return BasePopup.create(ViewThreadPopup, opts)
    }

    static destroy () {
      return BasePopup.destroy('view-thread-popup')
    }

    // rendering
    // =

    renderTitle () {
      return `Thread`
    }

    renderBody () {
      return html`
      <ctzn-record-thread
        record-url=${this.recordUrl}
        profile-url=${this.profileUrl}
        @load=${this.onLoadThread}
        @view-thread=${this.onViewThread}
        @view-tag=${this.onViewTag}
      ></ctzn-record-thread>
    `
    }

    // events
    // =

    onLoadThread () {
      this.shadowRoot.querySelector('ctzn-record-thread').scrollHighlightedPostIntoView();
    }

    onViewThread (e) {
      this.recordUrl = e.detail.record.url;
    }
  }

  customElements.define('view-thread-popup', ViewThreadPopup);

  function getParam (k, fallback) {
    return (new URL(window.location)).searchParams.get(k) || fallback
  }

  const cssStr$e = css`
body {
  --system-font: -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Ubuntu, Cantarell, "Oxygen Sans", "Helvetica Neue", sans-serif;
  --code-font: Consolas, 'Lucida Console', Monaco, monospace;
}

body {
  font-family: var(--system-font);
}

code {
  font-family: var(--code-font);
  font-style: normal;
}

`;

  const cssStr$f = css`
${cssStr}
${cssStr$e}
${cssStr$2}
${cssStr$3}

body {
  background: #f5f5f7;
  color: #333;
}
`;

  const cssStr$g = css`
${cssStr$f}
${cssStr$5}
${cssStr$6}
${cssStr$7}

:host {
  display: block;
}

.hidden {
  display: none !important;
}

input:focus {
  border-color: var(--border-color--focused);
  box-shadow: 0 0 2px #7599ff77;
}

.tags-bar {
  background: var(--bg-color--secondary);
  color: var(--text-color--default);
  padding: 6px 8px;
  font-size: 10px;
  line-height: 1;
  border-bottom: 1px solid var(--border-color--light);
  margin-bottom: 24px;
}

.tags-bar a {
  color: inherit;
  margin-right: 4px;
}

.tags-bar a:hover {
  cursor: pointer;
  text-decoration: underline;
}

.tags-bar .fa-tag {
  color: var(--text-color--pretty-light);
  margin-right: 4px;
  font-size: 9px;
}

.tags-bar .sep {
  margin: 0px 4px;
  font-size: 9px;
  line-height: 8px;
  position: relative;
  top: -1px;
}

h2 {
  margin: 0px 45px 0px;
  letter-spacing: 1px;
  font-size: 24px;
}

h2 a {
  color: #5085ff;
  font-size: 17px;
}

.composer {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 15px;
  font-size: 14px;
}

.composer .thumb {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 4px;
}

.compose-post-prompt {
  border: 1px solid var(--border-color--light);
  padding: 12px 16px;
  border-radius: 4px;
  color: var(--text-color--light);
  cursor: text;
}

.search-ctrl {
  display: flex;
  position: relative;
  height: 32px;
  margin: 0 0 15px;
  z-index: 5;
}

.search-ctrl .fa-search,
.search-ctrl .spinner {
  position: absolute;
  z-index: 2;
  font-size: 13px;
  top: 10px;
  left: 14px;
  color: #99a;
}

.search-ctrl .spinner {
  top: 9px;
}

.search-ctrl input {
  position: relative;
  top: -1px;
  background: var(--bg-color--semi-light);
  color: inherit;
  box-sizing: border-box;
  height: 34px;
  flex: 1;
  font-size: 12px;
  letter-spacing: 0.5px;
  font-weight: 500;
  padding: 0 0 0 36px;
  border: 0 solid var(--border-color--default);
  border-radius: 24px;
}

.search-ctrl input:focus {
  background: var(--bg-color--default);
  border-color: var(--border-color--focused);
  box-shadow: 0 0 2px #7599ff77;
}

.search-ctrl .clear-search {
  position: absolute;
  left: 10px;
  top: 6px;
  z-index: 2;
  display: flex;
  background: var(--bg-color--semi-light);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.search-ctrl .clear-search span {
  margin: auto;
}

main {
}

.twocol {
  margin: 10px auto 20px;
  max-width: 840px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 30px;
}

.twocol .sticky {
  position: sticky;
  top: 10px;
}

.twocol .sidebar > div {
  padding-top: 4px;
}

.twocol .sidebar h3 {
  box-sizing: border-box;
  letter-spacing: 1px;
  margin: 3px 0;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--text-color--pretty-light);
}

.twocol .sidebar section {
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .twocol {
    display: block;
  }
  .two .sidebar section {
    margin-bottom: 0;
  }
  .two > :last-child {
    display: none;
  }
  ctzn-sites-list {
    margin-top: 20px;
  }
}

.nav a {
  display: block;
  font-size: 16px;
  padding: 5px;
  margin-bottom: 5px;
}

.nav .fa-fw {
  display: inline-block;
  font-size: 12px;
  margin-right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  line-height: 28px;
  color: var(--text-color--default);
  background: var(--bg-color--semi-light);
}

.nav a.current {
  font-weight: 500;
  color: var(--text-color--markdown-link);
}

.nav a.current .fa-fw {
  color: #fff;
  background: var(--text-color--markdown-link);
}

.nav sup {
  font-weight: bold;
  color: #fff;
  background: var(--text-color--markdown-link);
  border-radius: 4px;
  padding: 1px 4px 2px;
  font-size: 9px;
  font-weight: bold;
}

.suggested-sites .site {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  background: var(--bg-color--secondary);
}

.suggested-sites .site .title a {
  color: var(--text-color--link);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.suggested-sites .site .subscribers {
  margin-bottom: 2px;
}

.suggested-sites .site .subscribers a {
  color: var(--text-color--pretty-light);
}

.suggested-sites .site button {
  font-size: 11px;
  letter-spacing: 0.5px;
}

.alternatives {
  color: var(--text-color--pretty-light);
  margin: 0 0 10px;
}

.alternatives .search-engine {
  display: inline-block;
  margin: 0 3px;
  position: relative;
  top: 5px;
}

.alternatives .search-engine:first-of-type {
  margin-left: 4px;
}

.alternatives .search-engine:hover {
  text-decoration: none;
}

.alternatives .search-engine img {
  display: inline-block;
  width: 18px;
  height: 18px;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
}

ctzn-record-feed,
ctzn-sites-list {
  margin-bottom: 10px;
}

ctzn-record-feed {
  --ctzn-record-feed--default-margin: 20px;
}

.intro {
  margin: 10px 0;
}

.intro .explainer {
  padding: 10px;
  font-size: 18px;
  text-align: center;
}

.intro h4 {
  font-size: 21px;
  margin: 22px 0 10px;
}

.intro a {
  color: var(--text-color--link);
  cursor: pointer;
}

.intro a:hover {
  text-decoration: underline;
}

.intro button {
  font-size: 15px;
}

.intro .sign-in {
  background: var(--bg-color--secondary);
  padding: 10px;
  width: 200px;
  margin: 0 auto;
  text-align: center;
}

.intro .sign-in button {
  margin-right: 5px;
}

.empty {
  font-size: 16px;
  letter-spacing: 0.7px;
  color: var(--text-color--light);
  padding: 160px 0px 170px;
  background: var(--bg-color--default);
  text-align: center;
  margin: 10px 0;
}

.empty :-webkit-any(.fas, .far) {
  font-size: 58px;
  color: var(--text-color--very-light);
  margin: 0 0 30px;
}

.reload-page {
  background: var(--bg-color--secondary);
  text-align: center;
  margin: 8px 0 8px 45px;
  border-radius: 4px;
  color: var(--text-color--link);
  font-size: 15px;
  cursor: pointer;
  overflow: hidden;
  line-height: 40px;

  transition: height 0.2s;
  height: 0px;
}

.reload-page.visible {
  height: 40px;
}

.reload-page:hover {
  text-decoration: underline;
}

`;

  const cssStr$h = css`
${cssStr$5}
${cssStr$3}
${cssStr$6}
${cssStr$7}

:host {
  display: block;
  position: relative;
}

a {
  text-decoration: none;
  cursor: initial;
}

a[href]:hover {
  text-decoration: underline;
  cursor: pointer;
}

h2.title {
  font-size: 18px;
  color: var(--text-color--light);
  border-bottom: 1px solid var(--border-color--light);
  margin: 20px 0;
}

h2.results-header {
  margin: 0 0 30px;
  padding: 0 4px 4px;
  text-align: center;
  color: var(--text-color--default);
  box-sizing: border-box;
  font-weight: 500;
  color: var(--text-color--light);
  letter-spacing: 0.7px;
  font-size: 13px;
  border-bottom: 1px solid var(--border-color--light);
}

h2.results-header:not(:first-child) {
  margin-top: 10px;
}

h2.results-header span {
  position: relative;
  top: 11px;
  background: var(--bg-color--default);
  padding: 5px;
}

h2 a:hover {
  cursor: pointer;
  text-decoration: underline;
}

.result + h2 {
  margin-top: 20px;
}

.results {
  font-size: 14px;
  box-sizing: border-box;
}

.results ctzn-record {
  display: block;
  margin: var(--ctzn-record-feed--default-margin, 10px) 0;
}

.results ctzn-record[render-mode="link"] {
  margin: var(--ctzn-record-feed--link-margin--grouped, 18px) 0;
}
.results ctzn-record:not([render-mode="link"]) + ctzn-record[render-mode="link"] {
  margin-top: var(--ctzn-record-feed--link-margin, 24px);
}
.results ctzn-record[render-mode="link"] + ctzn-record:not([render-mode="link"]) {
  margin-top: var(--ctzn-record-feed--link-margin, 24px);
}

.results ctzn-record[render-mode="expanded-link"] {
  margin: var(--ctzn-record-feed--expanded-link-margin, 20px) 0;
}

.results ctzn-record[render-mode="action"] {
  margin: var(--ctzn-record-feed--action-margin, 16px) 0;
}

.results ctzn-record.small[render-mode="action"] {
  margin: var(--ctzn-record-feed--small-action-margin, 4px) 0;
}

.results ctzn-record[render-mode="comment"] {
  margin: var(--ctzn-record-feed--comment-margin--grouped, 10px) 0 var(--ctzn-record-feed--comment-margin--grouped, 10px) 45px;
}
.results ctzn-record:not([render-mode="comment"]) + ctzn-record[render-mode="comment"] {
  margin-top: var(--ctzn-record-feed--comment-margin, 24px);
}
.results ctzn-record[render-mode="comment"] + ctzn-record:not([render-mode="comment"]) {
  margin-top: var(--ctzn-record-feed--comment-margin, 24px);
}

.results ctzn-record[render-mode="wrapper"] {
  margin: var(--ctzn-record-feed--wrapper-margin--grouped, 18px) 0;
}
.results ctzn-record:not([render-mode="wrapper"]) + ctzn-record[render-mode="wrapper"] {
  margin-top: var(--ctzn-record-feed--wrapper-margin, 18px);
}
.results ctzn-record[render-mode="wrapper"] + ctzn-record:not([render-mode="wrapper"]) {
  margin-top: var(--ctzn-record-feed--wrapper-margin, 18px);
}

.empty {
  font-size: 16px;
  letter-spacing: 0.7px;
  color: var(--text-color--light);
  padding: 60px 0px;
  text-align: center;
}

.notification + .result {
  margin-top: 0;
}
.result + .notification {
  margin-top: 15px;
}
`;

  class RecordFeed extends LitElement {
    static get properties () {
      return {
        pathQuery: {type: Array},
        tagQuery: {type: Array},
        showDateTitles: {type: Boolean, attribute: 'show-date-titles'},
        dateTitleRange: {type: String, attribute: 'date-title-range'},
        forceRenderMode: {type: String, attribute: 'force-render-mode'},
        recordClass: {type: String, attribute: 'record-class'},
        title: {type: String},
        sort: {type: String},
        limit: {type: Number},
        notifications: {type: Object},
        filter: {type: String},
        sources: {type: Array},
        results: {type: Array},
        emptyMessage: {type: String, attribute: 'empty-message'},
        noMerge: {type: Boolean, attribute: 'no-merge'},
        profileUrl: {type: String, attribute: 'profile-url'}
      }
    }

    static get styles () {
      return cssStr$h
    }

    constructor () {
      super();
      this.pathQuery = undefined;
      this.tagQuery = undefined;
      this.showDateTitles = false;
      this.dateTitleRange = undefined;
      this.forceRenderMode = undefined;
      this.recordClass = '';
      this.title = undefined;
      this.sort = 'ctime';
      this.limit = undefined;
      this.filter = undefined;
      this.notifications = undefined;
      this.sources = undefined;
      this.results = undefined;
      this.emptyMessage = undefined;
      this.noMerge = false;
      this.profileUrl = '';

      // query state
      this.activeQuery = undefined;
      this.abortController = undefined;
    }

    get isLoading () {
      return !this.results || !!this.activeQuery
    }

    async load ({clearCurrent} = {clearCurrent: false}) {
      if (clearCurrent) this.results = undefined;
      this.queueQuery();
    }

    updated (changedProperties) {
      if (typeof this.results === 'undefined') {
        if (!this.activeQuery) {
          this.queueQuery();
        }
      }
      if (changedProperties.has('filter') && changedProperties.get('filter') != this.filter) {
        this.queueQuery();
      } else if (changedProperties.has('pathQuery') && changedProperties.get('pathQuery') != this.pathQuery) {
        // NOTE ^ to correctly track this, the query arrays must be reused
        this.results = undefined; // clear results while loading
        this.queueQuery();
      } else if (changedProperties.has('taqQuery') && changedProperties.get('taqQuery') != this.taqQuery) {
        // NOTE ^ to correctly track this, the query arrays must be reused
        this.results = undefined; // clear results while loading
        this.queueQuery();
      } else if (changedProperties.has('sources') && !isArrayEq(this.sources, changedProperties.get('sources'))) {
        this.queueQuery();
      }
    }

    queueQuery () {
      if (!this.activeQuery) {
        this.activeQuery = this.query();
        this.requestUpdate();
      } else {
        if (this.abortController) this.abortController.abort();
        this.activeQuery = this.activeQuery.catch(e => undefined).then(r => {
          this.activeQuery = undefined;
          this.queueQuery();
        });
      }
    }

    async query () {
      emit(this, 'load-state-updated');
      this.abortController = new AbortController();
      var results = [];
      // because we collapse results, we need to run the query until the limit is fulfilled
      let offset = 0;
      do {
        let {subresults} = await beaker.index.gql(`
        query Feed (
          $paths: [String]!
          $offset: Int!
          ${this.tagQuery ? `$tags: [String!]!` : ''}
          ${this.sources ? `$origins: [String]!` : ''}
          ${this.filter ? `$search: String!` : ''}
          ${this.limit ? `$limit: Int!` : ''}
          ${this.notifications ? `$profileUrl: String!` : ''}
        ) {
          subresults: records (
            paths: $paths
            ${this.sources ? `origins: $origins` : ''}
            ${this.filter ? `search: $search` : ''}
            ${this.limit ? `limit: $limit` : ''}
            ${this.tagQuery ? `
              backlinks: {
                paths: ["/tags/*.goto"]
                metadata: [
                  {key: "tag/id", values: $tags}
                ]
              }
            ` : ''}
            ${this.notifications ? `
              links: {origin: $profileUrl}
              excludeOrigins: [$profileUrl]
              indexes: ["local", "network"]
            ` : ''}
            offset: $offset
            sort: "crtime",
            reverse: true
          ) {
            type
            path
            url
            ctime
            mtime
            rtime
            metadata
            index
            content
            ${this.notifications ? `
            links {
              source
              url
            }
            ` : ''}
            site {
              url
              title
            }
            votes: backlinks(paths: ["/votes/*.goto"]) {
              url
              metadata
              site { url title }
            }
            tags: backlinks(paths: ["/tags/*.goto"]) {
              url
              metadata
              site { url title }
            }
            commentCount: backlinkCount(paths: ["/comments/*.md"])
          }
        }
      `, {
          paths: this.pathQuery,
          tags: this.tagQuery,
          origins: this.sources,
          search: this.filter,
          offset,
          limit: this.limit,
          profileUrl: this.profileUrl
        });
        if (subresults.length === 0) break
        
        offset += subresults.length;
        if (!this.noMerge) {
          subresults = subresults.reduce(reduceMultipleActions, []);
        }
        results = results.concat(subresults);
      } while (results.length < this.limit)
      console.log(results);
      this.results = results;
      this.activeQuery = undefined;
      emit(this, 'load-state-updated', {detail: {isEmpty: this.results.length === 0}});
    }

    // rendering
    // =

    render () {
      if (!this.results) {
        return html`
        ${this.title ? html`<h2  class="results-header"><span>${this.title}</span></h2>` : ''}
        <div class="results empty">
          <span class="spinner"></span>
        </div>
      `
      }
      if (!this.results.length) {
        if (!this.emptyMessage) return html``
        return html`
        <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
        ${this.title ? html`<h2  class="results-header"><span>${this.title}</span></h2>` : ''}
        <div class="results empty">
          <span>${this.emptyMessage}</div></span>
        </div>
      `
      }
      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      ${this.title ? html`<h2  class="results-header"><span>${this.title}</span></h2>` : ''}
      ${this.renderResults()}
    `
    }

    renderResults () {
      this.lastResultNiceDate = undefined; // used by renderDateTitle
      if (!this.filter) {
        return html`
        <div class="results">
          ${repeat(this.results, result => result.url, result => html`
            ${this.renderDateTitle(result)}
            ${this.renderNormalResult(result)}
          `)}
        </div>
      `
      }
      return html`
      <div class="results">
        ${repeat(this.results, result => result.url, result => this.renderSearchResult(result))}
      </div>
    `
    }

    renderDateTitle (result) {
      if (!this.showDateTitles) return ''
      var resultNiceDate = dateHeader(result.ctime, this.dateTitleRange);
      if (this.lastResultNiceDate === resultNiceDate) return ''
      this.lastResultNiceDate = resultNiceDate;
      return html`
      <h2 class="results-header"><span>${resultNiceDate}</span></h2>
    `
    }
    
    renderNormalResult (result) {
      var renderMode = this.forceRenderMode || ({
        'comment': 'card',
        'microblogpost': 'card',
        'subscription': 'action',
        'tag': 'wrapper',
        'vote': 'wrapper'
      })[getRecordType(result)] || 'link';
      return html`
      <ctzn-record
        .record=${result}
        ?is-notification=${!!this.notifications}
        ?is-unread=${result.ctime > this.notifications?.unreadSince}
        class=${this.recordClass}
        render-mode=${renderMode}
        show-context
        profile-url=${this.profileUrl}
      ></ctzn-record>
    `
    }

    renderSearchResult (result) {
      var renderMode = this.forceRenderMode || ({
        'comment': 'card',
        'microblogpost': 'card',
        'subscription': 'action',
      })[getRecordType(result)] || 'expanded-link';
      return html`
      <ctzn-record
        .record=${result}
        class=${this.recordClass}
        render-mode=${renderMode}
        search-terms=${this.filter}
        show-context
        profile-url=${this.profileUrl}
      ></ctzn-record>
    `
    }

    // events
    // =
  }

  customElements.define('ctzn-record-feed', RecordFeed);

  function isArrayEq (a, b) {
    if (!a && !!b) return false
    if (!!a && !b) return false
    return a.sort().toString() == b.sort().toString() 
  }

  const HOUR$1 = 1e3 * 60 * 60;
  const DAY$1 = HOUR$1 * 24;
  function dateHeader (ts, range) {
    const endOfTodayMs = +((new Date).setHours(23,59,59,999));
    var diff = endOfTodayMs - ts;
    if (diff < DAY$1) return 'Today'
    if (diff < DAY$1 * 6) return (new Date(ts)).toLocaleDateString('default', { weekday: 'long' })
    if (range === 'month') return (new Date(ts)).toLocaleDateString('default', { month: 'short', year: 'numeric' })
    return (new Date(ts)).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  function reduceMultipleActions (acc, result) {
    let last = acc[acc.length - 1];
    if (last) {
      if (last.site.url === result.site.url && getRecordType(result) === 'subscription' && getRecordType(last) === 'subscription') {
        last.mergedItems = last.mergedItems || [];
        last.mergedItems.push(result);
        return acc
      }
    }
    acc.push(result);
    return acc
  }

  const cssStr$i = css`
${cssStr$5}
${cssStr$3}
${cssStr$6}
${cssStr$7}

:host {
  display: block;
  position: relative;
}

a {
  text-decoration: none;
  cursor: initial;
}

a[href]:hover {
  text-decoration: underline;
  cursor: pointer;
}

h2 {
  box-sizing: border-box;
  letter-spacing: 1px;
  margin: 6px 0 8px;
  font-weight: bold;
  font-size: 11px;
  color: var(--text-color--pretty-light);
  text-transform: uppercase;
}

.container {
}

.sites.single-row {
  display: grid;
  justify-content: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-gap: 15px;
}

.site {
  position: relative;
  background: var(--bg-color--default);
}

.sites.full .site {
  display: flex;
  align-items: flex-start;
  border-top: 1px solid var(--border-color--very-light);
  padding: 6px 0 4px;
}

.sites.full .site:last-child {
  border-bottom-width: 1px;
}

.site .thumb {
  padding: 8px 10px 4px;
}

.sites.single-row .site .thumb {
  border-bottom: 1px solid var(--border-color--very-light);
  padding: 8px 10px 4px;
}

.sites.full .site .thumb {
  padding: 8px 10px 8px 0;
}

.site .thumb img {
  display: inline-block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.sites.full .site .thumb img {
  display: block;
}

.sites.single-row .site button {
  position: absolute;
  font-size: 12px;
  top: 6px;
  right: 4px;
  box-shadow: none;
  border-radius: 16px;
}

.sites.full .site button {
  align-self: normal;
  white-space: nowrap;
}

.site .info {
  flex: 1;
  font-size: 13px;
  line-height: 1;
  padding: 8px 12px 10px;
}

.sites.full .site .info {
  padding: 12px 4px; 
}

.site .title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site .title a {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color--default);
}

.site .description {
  margin-top: 6px;
  word-break: break-word;
}

.fork-of {
  margin-top: 6px;
  color: var(--text-color--light);
  font-size: 12px;
}

.fork-of a {
  color: var(--text-color--link);
}

.label {
  position: relative;
  top: -1px;
  background: var(--bg-color--semi-light);
  padding: 1px 4px 2px;
  border-radius: 4px;
  font-size: 10px;
}

.sites.single-row .site .description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site .known-subscribers {
  margin-top: 4px;
}

.site .known-subscribers a {
  color: var(--text-color--light);
}

.site .known-subscribers a strong {
  color: var(--text-color--default);
}

.sites.full .site .ctrls {
  margin-top: 8px;
}

.sites.full .site .ctrls button {
  font-size: 11px;
  padding: 3px 6px;
}

.empty {
  font-size: 16px;
  letter-spacing: 0.7px;
  color: var(--text-color--light);
  padding: 60px 0px;
  background: var(--bg-color--light);
  text-align: center;
}
`;

  function writeToClipboard (str) {
    var textarea = document.createElement('textarea');
    textarea.textContent = str;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  const EXPLORER_URL = site => `beaker://explorer/${site.url.slice('hyper://'.length)}`;

  class SitesList extends LitElement {
    static get properties () {
      return {
        listing: {type: String},
        singleRow: {type: Boolean, attribute: 'single-row'},
        filter: {type: String},
        limit: {type: Number},
        profile: {type: Object},
        sites: {type: Array},
        emptyMessage: {type: String, attribute: 'empty-message'},
      }
    }

    static get styles () {
      return cssStr$i
    }

    constructor () {
      super();
      this.listing = undefined;
      this.singleRow = false;
      this.filter = undefined;
      this.limit = undefined;
      this.profile = undefined;
      this.sites = undefined;
      this.emptyMessage = undefined;

      // query state
      this.activeQuery = undefined;
    }

    get profileUrl () {
      return this.profile?.url
    }

    get isLoading () {
      return !this.sites || !!this.activeQuery
    }

    async load () {
      this.queueQuery();
    }

    updated (changedProperties) {
      if (typeof this.sites === 'undefined') {
        if (!this.activeQuery) {
          this.queueQuery();
        }
      }
      if (changedProperties.has('singleRow') && changedProperties.get('singleRow') != this.singleRow) {
        this.queueQuery();
      } else if (changedProperties.has('filter') && changedProperties.get('filter') != this.filter) {
        this.queueQuery();
      } else if (changedProperties.has('listing') && changedProperties.get('listing') != this.listing) {
        this.queueQuery();
      }
    }

    getSiteIdent (site) {
      if (isSameOrigin(site.url, this.profileUrl)) {
        return 'profile'
      }
      if (isSameOrigin(site.url, 'hyper://private')) {
        return 'private'
      }
      return undefined
    }

    queueQuery () {
      if (!this.activeQuery) {
        this.activeQuery = this.query();
        this.requestUpdate();
      } else {
        this.activeQuery = this.activeQuery.catch(e => undefined).then(r => {
          this.activeQuery = undefined;
          this.queueQuery();
        });
      }
    }

    async query () {
      emit(this, 'load-state-updated');

      var sites;
      var isFiltered = false;
      if (this.listing === 'mine') {
        sites = await beaker.drives.list({includeSystem: true});
        sites = sites.filter(s => s.info?.writable);
        sites = await Promise.all(sites.map(async s => {
          let res = await beaker.index.gql(`
          query Graph($origin: String!, $profileUrl: String!) {
            isSubscribedByUser: backlinkCount(
              origins: [$profileUrl]
              links: {origin: $origin}
              paths: ["/subscriptions/*.goto"]
            )
            isSubscriberToUser: recordCount(
              origins: [$origin]
              links: {origin: $profileUrl}
              paths: ["/subscriptions/*.goto"]
            )
            subCount: backlinkCount(
              links: {origin: $origin}
              paths: ["/subscriptions/*.goto"]
              indexes: ["local", "network"]
            )
          }
        `, {profileUrl: this.profileUrl, origin: s.url});
          return {
            origin: s.url,
            url: s.url,
            title: s.info?.title || 'Untitled',
            description: s.info?.description,
            writable: s.info?.writable,
            forkOf: s.forkOf,
            isSubscribedByUser: res.isSubscribedByUser,
            isSubscriberToUser: res.isSubscriberToUser,
            subCount: res.subCount
          }
        }));
      } else if (this.listing === 'subscribed') {
        let {subs} = await beaker.index.gql(`
        query Subscriptions($profileUrl: String!) {
          subs: records(paths: ["/subscriptions/*.goto"], origins: [$profileUrl]) {
            linkedSites {
              url
              title
              description
              writable
              isSubscribedByUser: backlinkCount(
                origins: [$profileUrl]
                paths: ["/subscriptions/*.goto"]
              )
              isSubscriberToUser: recordCount(
                links: {origin: $profileUrl}
                paths: ["/subscriptions/*.goto"]
              )
              subCount: backlinkCount(paths: ["/subscriptions/*.goto"] indexes: ["local", "network"])
            }
          }
        }
      `, {profileUrl: this.profileUrl});
        sites = subs.map(sub => sub.linkedSites[0]);
      } else if (this.listing === 'subscribers') {
        let {subs} = await beaker.index.gql(`
        query Subscribers($profileUrl: String!) {
          subs: records(paths: ["/subscriptions/*.goto"], links: {origin: $profileUrl}, indexes: ["local", "network"]) {
            site (cached: true) {
              url
              title
              description
              writable
              isSubscribedByUser: backlinkCount(
                origins: [$profileUrl]
                paths: ["/subscriptions/*.goto"]
              )
              isSubscriberToUser: recordCount(
                links: {origin: $profileUrl}
                paths: ["/subscriptions/*.goto"]
              )
              subCount: backlinkCount(paths: ["/subscriptions/*.goto"] indexes: ["local", "network"])
            }
          }
        }
      `, {profileUrl: this.profileUrl});
        sites = subs.map(sub => sub.site);
      } else if (this.listing === 'network') {
        isFiltered = true;
        let res = await beaker.index.gql(`
        query Sites (
          $profileUrl: String!
          ${this.filter ? `$search: String!` : ''}
        ) {
          sites (
            ${this.filter ? `search: $search"` : ''}
            indexes: ["network"]
            limit: 15
          ) {
            url
            title
            description
            writable
            isSubscribedByUser: backlinkCount(
              origins: [$profileUrl]
              paths: ["/subscriptions/*.goto"]
            )
            isSubscriberToUser: recordCount(
              links: {origin: $profileUrl}
              paths: ["/subscriptions/*.goto"]
            )
            subCount: backlinkCount(paths: ["/subscriptions/*.goto"] indexes: ["local", "network"])
          }
        }
      `, {profileUrl: this.profileUrl, search: this.filter});
        sites = res.sites;
      } else {
        isFiltered = true;
        let res = await beaker.index.gql(`
        query Sites(
          $profileUrl: String!
          ${this.filter ? `$search: String!` : ''}
        ) {
          sites (
            ${this.filter ? `search: $search` : ''}
            indexes: ["local", "network"]
          ) {
            url
            title
            description
            writable
            isSubscribedByUser: backlinkCount(
              origins: [$profileUrl]
              paths: ["/subscriptions/*.goto"]
            )
            isSubscriberToUser: recordCount(
              links: {origin: $profileUrl}
              paths: ["/subscriptions/*.goto"]
            )
            subCount: backlinkCount(paths: ["/subscriptions/*.goto"] indexes: ["local", "network"])
          }
        }
      `, {profileUrl: this.profileUrl, search: this.filter});
        sites = res.sites;
      }

      if (this.filter && !isFiltered) {
        sites = sites.filter(s => (
          (s.title || '').toLowerCase().includes(this.filter.toLowerCase())
          || (s.description || '').toLowerCase().includes(this.filter.toLowerCase())
        ));
      }
      if (this.singleRow) {
        sites = sites.slice(0, 3);
      } else if (this.limit) {
        sites = sites.slice(0, this.limit);
      }

      if (!isFiltered) {
        sites.sort((a, b) => a.title.localeCompare(b.title));
      }

      // always put the profile and private site on top
      moveToTopIfExists(sites, this.profile?.url);
      moveToTopIfExists(sites, 'hyper://private/');
      this.sites = sites;
      console.log(this.sites);
      this.activeQuery = undefined;
      emit(this, 'load-state-updated');
    }

    isSubscribed (site) {
      return site.isSubscribedByUser
    }

    // rendering
    // =

    render () {
      if (!this.sites) {
        return html`
        <div class="sites empty">
          <span class="spinner"></span>
        </div>
      `
      }
      if (!this.sites.length) {
        if (!this.emptyMessage) return html``
        return html`
        <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
        <div class="sites empty">
          <span>${this.emptyMessage}</div></span>
        </div>
      `
      }
      return html`
      <link rel="stylesheet" href=${(new URL('../../css/fontawesome.css', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()}>
      <div class="container">
        <div class="sites ${this.singleRow ? 'single-row' : 'full'}">
          ${repeat(this.sites, site => site.url, site => this.renderSite(site))}
        </div>
      </div>
    `
    }

    renderSite (site) {
      var title = site.title || toNiceDomain(site.url);
      return html`
      <div class="site">
        <div class="thumb">
          <a href=${site.url} title=${title}>
            <ctzn-img-fallbacks>
              <img src="${site.url}/thumb" slot="img1">
              <img src=${(new URL('../../img/default-user-thumb', (document.currentScript && document.currentScript.src || new URL('main.build.js', document.baseURI).href))).toString()} slot="img2">
            </ctzn-img-fallbacks>
          </a>
        </div>
        <div class="info">
          <div class="title"><a href=${site.url} title=${title}>${title}</a></div>
          <div class="description">${shorten(site.description, 200)}</div>
          ${site.forkOf ? html`
            <div class="fork-of">
              <span class="label">${site.forkOf.label}</span>
              Fork of <a href="hyper://${site.forkOf.key}">${toNiceDomain(`hyper://${site.forkOf.key}`)}</a>
            </div>
          ` : ''}
          ${!isSameOrigin(site.url, 'hyper://private') && (!site.writable || site.subCount > 0) ? html`
            <div class="known-subscribers">
              <a
                href="#" 
                class="tooltip-top"
                @click=${e => this.onClickShowSubscribers(e, site)}
              >
                <strong>${site.subCount}</strong>
                ${pluralize(site.subCount, 'subscriber')}
              </a>
            </div>
          ` : ''}
          <div class="ctrls">
            ${site.writable ? html`
              ${isSameOrigin(site.url, 'hyper://private') ? html`
                <span class="label">My Private Site</span></div>
              ` : isSameOrigin(site.url, this.profileUrl || '') ? html`
                <span class="label">My Profile Site</span></div>
              ` : html`
                <span class="label">My Site</span>
              `}
              <button class="transparent" @click=${e => this.onClickMenu(e, site)}>
                <span class="fas fa-fw fa-ellipsis-h"></span>
              </button>
            ` : html`
              <button @click=${e => this.onToggleSubscribe(e, site)}>
                ${this.isSubscribed(site) ? html`
                  <span class="fas fa-fw fa-check"></span> Subscribed
                ` : html`
                  <span class="fas fa-fw fa-rss"></span> Subscribe
                `}
              </button>
            `}
          </div>
        </div>
      </div>
    `
    }

    // events
    // =

    async onClickShowSubscribers (e, site) {
      e.preventDefault();
      e.stopPropagation();
      let sites = /* dont await */ beaker.index.gql(`
      query ($origin: String!) {
        records (links: {origin: $origin} paths: ["/subscriptions/*.goto"]) {
          site {
            url
            title
          }
        }
      }
    `, {origin: site.url}).then(({records}) => records.map(r => r.site));
      SitesListPopup.create('Subscribers', sites);
    }

    async onToggleSubscribe (e, site) {
      var drive = beaker.hyperdrive.drive(this.profile.url);
      if (this.isSubscribed(site)) {
        site.isSubscribedByUser = false;
        site.subCount--;
        this.requestUpdate();

        let res = await drive.query({
          path: '/subscriptions/*.goto',
          metadata: {href: site.url}
        });
        await drive.unlink(res[0].path);
      } else {
        site.isSubscribedByUser = true;
        site.subCount++;
        this.requestUpdate();

        let slug = createResourceSlug(site.url, site.title);
        let filename = await getAvailableName('/subscriptions', slug, drive, 'goto'); // avoid collisions
        await drive.writeFile(`/subscriptions/${filename}`, '', {metadata: {
          href: site.url,
          title: site.title
        }});
      }
    }

    async onClickMenu (e, site) {
      var items = [
        {
          label: 'Open in a New Tab',
          click: () => window.open(site.url)
        },
        {
          label: 'Copy Site Link',
          click: () => {
            writeToClipboard(site.url);
            create('Copied to clipboard');
          }
        },
        {type: 'separator'},
        {
          label: 'Explore Files',
          click: () => window.open(EXPLORER_URL(site))
        },
        {
          label: 'Fork this Site',
          click: () => this.onForkSite(site)
        },
        {type: 'separator'},
        {
          label: 'Edit Properties',
          click: () => this.onEditProps(site)
        },
        {
          label: site.writable ? 'Remove from My Library' : 'Stop hosting',
          disabled: !!this.getSiteIdent(site),
          click: () => this.onRemoveSite(site)
        }
      ];
      var fns = {};
      for (let i = 0; i < items.length; i++) {
        if (items[i].id) continue
        let id = `item=${i}`;
        items[i].id = id;
        fns[id] = items[i].click;
        delete items[i].click;
      }

      var choice = await beaker.browser.showContextMenu(items);
      if (fns[choice]) fns[choice]();
    }

    async onForkSite (site) {
      site = await beaker.hyperdrive.forkDrive(site.url);
      create('Site created');
      window.open(site.url);
      this.load();
    }

    async onEditProps (site) {
      await beaker.shell.drivePropertiesDialog(site.url);
      this.load();
    }

    async onRemoveSite (site) {
      await beaker.drives.remove(site.url);
      const undo = async () => {
        await beaker.drives.configure(site.url);
        this.load();
        this.requestUpdate();
      };
      create('Site removed', '', 10e3, {label: 'Undo', click: undo});
      this.load();
    }
  }

  customElements.define('ctzn-sites-list', SitesList);

  function moveToTopIfExists (arr, url) {
    var i = arr.findIndex(v => v.url === url);
    if (i !== -1) {
      let item = arr[i];
      arr.splice(i, 1);
      arr.unshift(item);
    }
  }

  console.log(rpcWebsockets);
  var ws = new Client('ws://localhost:3000');

  ws.on('open', async () => {
    var api = new Proxy({}, {
      get (target, prop) {
        // generate rpc calls as needed
        if (!(prop in target)) {
          target[prop] = (...params) => ws.call(prop, params);
        }

        return target[prop]
      }
    });

    // call an RPC method with parameters
    console.log('calling');
    console.log(await ws.call('sum', [5, 3]));

    console.log(await api.sum(5, 3));
    try {
      console.log(await api.notRealMethod(5, 3));
    } catch (e) {
      console.log(e);
    }
  });

  const PATH_QUERIES = {
    search: {
      discussion: [
        typeToQuery('microblogpost'),
        typeToQuery('comment')
      ]
    },
    all: [typeToQuery('microblogpost'), typeToQuery('comment')],
    notifications: [
      typeToQuery('microblogpost'),
      typeToQuery('comment'),
      typeToQuery('subscription'),
      typeToQuery('tag'),
      typeToQuery('vote')
    ]
  };
  const TITLE = document.title;

  class CtznApp extends LitElement {
    static get properties () {
      return {
        session: {type: Object},
        profile: {type: Object},
        unreadNotificationCount: {type: Number},
        suggestedSites: {type: Array},
        latestTags: {type: Array},
        isComposingPost: {type: Boolean},
        searchQuery: {type: String},
        tagFilter: {type: Array},
        isEmpty: {type: Boolean},
        numNewItems: {type: Number}
      }
    }

    static get styles () {
      return cssStr$g
    }

    constructor () {
      super();
      this.session = undefined;
      this.profile = undefined;
      this.unreadNotificationCount = 0;
      this.suggestedSites = undefined;
      this.latestTags = [];
      this.isComposingPost = false;
      this.searchQuery = '';
      this.tagFilter = undefined;
      this.isEmpty = false;
      this.numNewItems = 0;
      this.loadTime = Date.now();
      this.notificationsClearTime = +localStorage.getItem('notificationsClearTime') || 1;
      this.cachedNotificationsClearTime = this.notificationsClearTime;

      this.configFromQP();
      this.load().then(() => {
        this.loadSuggestions();
      });

      setInterval(this.checkNewItems.bind(this), 5e3);
      setInterval(this.checkNotifications.bind(this), 5e3);

      window.addEventListener('popstate', (event) => {
        this.configFromQP();
      });
    }

    configFromQP () {
      this.searchQuery = getParam('q', '');
      this.tagFilter = getParam('tag') ? [getParam('tag')] : undefined;
      
      if (this.searchQuery) {
        this.updateComplete.then(() => {
          this.shadowRoot.querySelector('.search-ctrl input').value = this.searchQuery;
        });
      }
    }

    async load ({clearCurrent} = {clearCurrent: false}) {
      if (!this.session) {
        this.session = await beaker.session.get({
          permissions: {
            publicFiles: [
              {path: '/subscriptions/*.goto', access: 'write'},
              {path: '/microblog/*.md', access: 'write'},
              {path: '/comments/*.md', access: 'write'},
              {path: '/tags/*.goto', access: 'write'},
              {path: '/votes/*.goto', access: 'write'}
            ]
          }
        });
      }
      if (!this.session) {
        return this.requestUpdate()
      }
      this.profile = this.session.user;
      this.checkNotifications();
      if (this.shadowRoot.querySelector('ctzn-record-feed')) {
        this.loadTime = Date.now();
        this.numNewItems = 0;
        this.shadowRoot.querySelector('ctzn-record-feed').load({clearCurrent});
      }
      if (location.pathname === '/notifications') {
        this.notificationsClearTime = Date.now();
        localStorage.setItem('notificationsClearTime', '' + this.notificationsClearTime);
        setTimeout(() => {this.unreadNotificationCount = 0;}, 2e3);
      }
      if (this.latestTags.length === 0) {
        let {tagRecords} = await beaker.index.gql(`
        query {
          tagRecords: records (
            paths: ["/tags/*.goto"]
            links: {paths: ["/microblog/*.md", "/comments/*.md"]}
            sort: "crtime"
            reverse: true
            limit: 50
          ) {
            metadata
          }
        }
      `);
        this.latestTags = Array.from(new Set(tagRecords.map(r => r.metadata['tag/id'])));
      }
    }

    async checkNewItems () {
      if (!this.session) return
      if (location.pathname === '/notifications') {
        this.numNewItems = this.unreadNotificationCount;
        return
      }
      if (location.pathname === '/search') return
      var query = PATH_QUERIES[location.pathname.slice(1) || 'all'];
      if (!query) return
      var {count} = await beaker.index.gql(`
      query NewItems ($paths: [String!]!, $loadTime: Long!) {
        count: recordCount(
          paths: $paths
          after: {key: "crtime", value: $loadTime}
        )
      }
    `, {paths: query, loadTime: this.loadTime});
      this.numNewItems = count;
    }

    async checkNotifications () {
      if (!this.session) return
      var {count} = await beaker.index.gql(`
      query Notifications ($profileUrl: String!, $clearTime: Long!) {
        count: recordCount(
          paths: ["/microblog/*.md", "/comments/*.md", "/subscriptions/*.goto", "/tags/*.goto", "/votes/*.goto"]
          links: {origin: $profileUrl}
          excludeOrigins: [$profileUrl]
          indexes: ["local", "network"],
          after: {key: "crtime", value: $clearTime}
        )
      }
    `, {profileUrl: this.profile.url, clearTime: this.notificationsClearTime});
      this.unreadNotificationCount = count;
      if (this.unreadNotificationCount > 0) {
        document.title = `${TITLE} (${this.unreadNotificationCount})`;
      } else {
        document.title = TITLE;
      }
    }

    async loadSuggestions () {
      if (!this.session) return
      const getSite = async (url) => {
        let {site} = await beaker.index.gql(`
        query Site ($url: String!) {
          site(url: $url) {
            url
            title
            description
            subCount: backlinkCount(paths: ["/subscriptions/*.goto"] indexes: ["local", "network"])
          }
        }
      `, {url});
        return site
      };
      let {allSubscriptions, mySubscriptions} = await beaker.index.gql(`
      query Subs ($origin: String!) {
        allSubscriptions: records(paths: ["/subscriptions/*.goto"] limit: 100 sort: "crtime" reverse: true) {
          metadata
        }
        mySubscriptions: records(paths: ["/subscriptions/*.goto"] origins: [$origin]) {
          metadata
        }
      }
    `, {origin: this.profile.url});
      var currentSubs = new Set(mySubscriptions.map(sub => (getOrigin(sub.metadata.href))));
      currentSubs.add(getOrigin(this.profile.url));
      var candidates = allSubscriptions.filter(sub => !currentSubs.has((getOrigin(sub.metadata.href))));
      var suggestedSiteUrls = candidates.reduce((acc, candidate) => {
        var url = candidate.metadata.href;
        if (!acc.includes(url)) acc.push(url);
        return acc
      }, []);
      suggestedSiteUrls.sort(() => Math.random() - 0.5);
      var suggestedSites = await Promise.all(suggestedSiteUrls.slice(0, 12).map(url => getSite(url).catch(e => undefined)));
      suggestedSites = suggestedSites.filter(site => site && site.title);
      if (suggestedSites.length < 12) {
        let {moreSites} = await beaker.index.gql(`
        query { moreSites: sites(indexes: ["network"] limit: 12) { url } }
      `);
        moreSites = moreSites.filter(site => !currentSubs.has(site.url));

        // HACK
        // the network index for listSites() currently doesn't pull from index.json
        // (which is stupid but it's the most efficient option atm)
        // so we need to call getSite()
        // -prf
        moreSites = await Promise.all(moreSites.map(s => getSite(s.url).catch(e => undefined)));
        suggestedSites = suggestedSites.concat(moreSites).filter(Boolean);
      }
      suggestedSites.sort(() => Math.random() - 0.5);
      this.suggestedSites = suggestedSites.slice(0, 12);
    }

    get isLoading () {
      let queryViewEls = Array.from(this.shadowRoot.querySelectorAll('ctzn-record-feed'));
      return !!queryViewEls.find(el => el.isLoading)
    }

    // rendering
    // =

    render () {
      return html`
      <link rel="stylesheet" href="/css/fontawesome.css">
      <div class="tags-bar">
        <span class="fas fa-tag"></span>
        ${repeat(this.latestTags, tag => tag, tag => html`
          <a class="tag" href="/?tag=${encodeURIComponent(tag)}">${tag}</a>
        `)}
      </div>
      <main>
        ${this.renderCurrentView()}
      </main>
    `
    }

    renderRightSidebar () {
      const navItem = (path, label) => html`
      <a class=${location.pathname === path ? 'current' : ''} href=${path}>${label}</a>
    `;
      let n = this.unreadNotificationCount > 0 ? html` <sup>${this.unreadNotificationCount}</sup>` : '';
      return html`
      <div class="sidebar">
        <div class="sticky">
          <div class="search-ctrl">
            <span class="fas fa-search"></span>
            ${!!this.searchQuery ? html`
              <a class="clear-search" @click=${this.onClickClearSearch}><span class="fas fa-times"></span></a>
            ` : ''}
            <input @keyup=${this.onKeyupSearch} placeholder="Search" value=${this.searchQuery}>
          </div>
          <section class="nav">
            ${navItem('/', html`<span class="fas fa-fw fa-stream"></span> Timeline`)}
            ${navItem('/notifications', html`<span class="far fa-fw fa-bell"></span> Notifications${n}`)}
          </section>
          ${this.suggestedSites?.length > 0 ? html`
            <section class="suggested-sites">
              <h3>Suggested Sites</h3>
              ${repeat(this.suggestedSites.slice(0, 3), site => html`
                <div class="site">
                  <div class="title">
                    <a href=${site.url} title=${site.title} target="_blank">${site.title}</a>
                  </div>
                  <div class="subscribers">
                    ${site.subCount} ${pluralize(site.subCount, 'subscriber')}
                  </div>
                  ${site.subscribed ? html`
                    <button class="transparent" disabled><span class="fas fa-check"></span> Subscribed</button>
                  ` : html`
                    <button @click=${e => this.onClickSuggestedSubscribe(e, site)}>Subscribe</button>
                  `}
                </div>
              `)}
            </section>
          ` : ''}
        </div>
      </div>
    `
    }

    renderCurrentView () {
      if (!this.session) return this.renderIntro()
      if (!this.profile) return ''
      var hasSearchQuery = !!this.searchQuery;
      if (hasSearchQuery) {
        return html`
        <div class="twocol">
          <div>
            ${this.renderSites('all')}
            <h3 class="feed-heading">Discussion</h3>
            <ctzn-record-feed
              .pathQuery=${PATH_QUERIES.search.discussion}
              .filter=${this.searchQuery}
              limit="50"
              empty-message="No results found${this.searchQuery ? ` for "${this.searchQuery}"` : ''}"
              @load-state-updated=${this.onFeedLoadStateUpdated}
              @view-thread=${this.onViewThread}
              @publish-reply=${this.onPublishReply}
              profile-url=${this.profile ? this.profile.url : ''}
            ></ctzn-record-feed>
          </div>
          ${this.renderRightSidebar()}
        </div>
      `
      } else {
        return html`
        <div class="twocol">
          <div>
            ${this.tagFilter ? html`
              <h2>#${this.tagFilter[0]} <a href="/"><span class="fas fa-times"></span></a></h2>
            ` : html`
              <div class="composer">
                <img class="thumb" src="${this.profile?.url}/thumb">
                ${this.isComposingPost ? html`
                  <ctzn-post-composer
                    drive-url=${this.profile?.url || ''}
                    @publish=${this.onPublishPost}
                    @cancel=${this.onCancelPost}
                  ></ctzn-post-composer>
                ` : html`
                  <div class="compose-post-prompt" @click=${this.onComposePost}>
                    What's new?
                  </div>
                `}
              </div>
            `}
            ${this.isEmpty ? this.renderEmptyMessage() : ''}
            <div class="reload-page ${this.numNewItems > 0 ? 'visible' : ''}" @click=${e => this.load()}>
              ${this.numNewItems} new ${pluralize(this.numNewItems, 'update')}
            </div>
            <ctzn-record-feed
              .pathQuery=${PATH_QUERIES[location.pathname.slice(1) || 'all']}
              .tagQuery=${this.tagFilter}
              .notifications=${location.pathname === '/notifications' ? {unreadSince: this.cachedNotificationsClearTime} : undefined}
              limit="50"
              @load-state-updated=${this.onFeedLoadStateUpdated}
              @view-thread=${this.onViewThread}
              @view-tag=${this.onViewTag}
              @publish-reply=${this.onPublishReply}
              profile-url=${this.profile ? this.profile.url : ''}
            ></ctzn-record-feed>
          </div>
          ${this.renderRightSidebar()}
        </div>
      `
      }
    }

    renderSites (id) {
      var listing = ({
        all: 'all',
        'my-sites': 'mine',
        subscriptions: 'subscribed',
        subscribers: 'subscribers'
      })[id];
      var title = ({
        all: 'Sites',
        'my-sites': 'My sites',
        subscriptions: 'My subscriptions',
        subscribers: 'Subscribed to me'
      })[id];
      var allSearch = !!this.searchQuery && id === 'all';
      return html`
      ${title ? html`<h3 class="feed-heading">${title}</h3>` : ''}
      <ctzn-sites-list
        listing=${listing}
        filter=${this.searchQuery || ''}
        .limit=${allSearch ? 6 : undefined}
        empty-message="No results found${this.searchQuery ? ` for "${this.searchQuery}"` : ''}"
        .profile=${this.profile}
      ></ctzn-sites-list>
    `
    }

    renderEmptyMessage () {
      if (this.searchQuery) {
        return html`
        <div class="empty">
            <div class="fas fa-search"></div>
          <div>No results found for "${this.searchQuery}"</div>
        </div>
      `
      }
      if (location.pathname.startsWith('/notifications')) {
        return html`
        <div class="empty">
          <div class="fas fa-bell"></div>
          <div>No notifications</div>
        </div>
      `
      }
      if (this.tagFilter) {
        return html`
        <div class="empty">
          <div class="fas fa-hashtag"></div>
          <div>No posts found in "#${this.tagFilter[0]}"</div>
        </div>
      `
      }
      return html`
      <div class="empty">
        <div class="fas fa-stream"></div>
        <div>Subscribe to sites to see what's new</div>
      </div>
    `
    }

    renderIntro () {
      return html`
      <div class="intro">
        <div class="explainer">
          <img src="/thumb">
          <h3>Welcome to Beaker Timeline!</h3>
          <p>Share posts on your feed and stay connected with friends.</p>
          <p>(You know. Like Twitter.)</p>
        </div>
        <div class="sign-in">
          <button class="primary" @click=${this.onClickSignin}>Sign In</button> to get started
        </div>
      </div>
    `
    }

    // events
    // =

    onFeedLoadStateUpdated (e) {
      if (typeof e.detail?.isEmpty !== 'undefined') {
        this.isEmpty = e.detail.isEmpty;
      }
      this.requestUpdate();
    }

    onKeyupSearch (e) {
      if (e.code === 'Enter') {
        window.location = `/search?q=${e.currentTarget.value.toLowerCase()}`;
      }
    }

    onClickClearSearch (e) {
      window.location = '/';
    }

    onViewThread (e) {
      ViewThreadPopup.create({
        recordUrl: e.detail.record.url,
        profileUrl: this.profile.url,
        onViewTag: this.onViewTag.bind(this)
      });
    }

    onViewTag (e) {
      window.location = `/?tag=${encodeURIComponent(e.detail.tag)}`;
    }

    onComposePost (e) {
      this.isComposingPost = true;
    }

    onCancelPost (e) {
      this.isComposingPost = false;
    }

    onPublishPost (e) {
      this.isComposingPost = false;
      create('Post published', '', 10e3);
      this.load();
    }

    onPublishReply (e) {
      create('Reply published', '', 10e3);
      this.load();
    }

    async onClickSuggestedSubscribe (e, site) {
      e.preventDefault();
      site.subscribed = true;
      this.requestUpdate();

      var drive = beaker.hyperdrive.drive(this.profile.url);
      var slug = createResourceSlug(site.url, site.title);
      var filename = await getAvailableName('/subscriptions', slug, drive, 'goto'); // avoid collisions
      await drive.writeFile(`/subscriptions/${filename}`, '', {metadata: {
        href: site.url,
        title: site.title
      }});
      // wait 1s then replace/remove the suggestion
      setTimeout(() => {
        this.suggestedSites = this.suggestedSites.filter(s => s !== site);
      }, 1e3);
    }

    async onClickSignin () {
      await beaker.session.request({
        permissions: {
          publicFiles: [
            {path: '/subscriptions/*.goto', access: 'write'},
            {path: '/microblog/*.md', access: 'write'},
            {path: '/comments/*.md', access: 'write'},
            {path: '/tags/*.goto', access: 'write'},
            {path: '/votes/*.goto', access: 'write'}
          ]
        }
      });
      location.reload();
    }
  }

  customElements.define('ctzn-app', CtznApp);

}());