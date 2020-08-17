
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\App.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    // (199:4) {:else}
    function create_else_block_2(ctx) {
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Hyperparameter setting for GLOBAL optimization (Click for RUN 🟢)";
    			attr_dev(h3, "class", "svelte-17wtqq1");
    			add_location(h3, file, 200, 6, 3300);
    			set_style(button, "background", "lightgreen");
    			attr_dev(button, "class", "svelte-17wtqq1");
    			add_location(button, file, 199, 5, 3225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClickGlobal*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(199:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (193:4) {#if globalCliked}
    function create_if_block_3(ctx) {
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Hyperparameter setting for GLOBAL optimization (Click for STOP 🟥)";
    			attr_dev(h3, "class", "svelte-17wtqq1");
    			add_location(h3, file, 194, 6, 3102);
    			set_style(button, "background", "lightpink");
    			attr_dev(button, "class", "svelte-17wtqq1");
    			add_location(button, file, 193, 5, 3028);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClickGlobal*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(193:4) {#if globalCliked}",
    		ctx
    	});

    	return block;
    }

    // (286:4) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Hyperparameter setting for LOCAL optimization (Click for RUN 🟢)";
    			attr_dev(h3, "class", "svelte-17wtqq1");
    			add_location(h3, file, 287, 6, 5470);
    			set_style(button, "background", "lightgreen");
    			attr_dev(button, "class", "svelte-17wtqq1");
    			add_location(button, file, 286, 5, 5396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClickLocal*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(286:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (280:4) {#if localCliked}
    function create_if_block_2(ctx) {
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Hyperparameter setting for LOCAL optimization (Click for STOP 🟥)";
    			attr_dev(h3, "class", "svelte-17wtqq1");
    			add_location(h3, file, 281, 6, 5274);
    			set_style(button, "background", "lightpink");
    			attr_dev(button, "class", "svelte-17wtqq1");
    			add_location(button, file, 280, 5, 5201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClickLocal*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(280:4) {#if localCliked}",
    		ctx
    	});

    	return block;
    }

    // (426:3) {#if showItems}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[12].slice(0, /*i*/ ctx[11]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items, i*/ 6144) {
    				each_value = /*items*/ ctx[12].slice(0, /*i*/ ctx[11]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(426:3) {#if showItems}",
    		ctx
    	});

    	return block;
    }

    // (433:5) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t0_value = /*items*/ ctx[12].indexOf(/*item*/ ctx[33]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*item*/ ctx[33].type + "";
    	let t2;
    	let t3;
    	let t4_value = /*item*/ ctx[33].globalAlpha + "";
    	let t4;
    	let t5;
    	let t6_value = /*item*/ ctx[33].hubNum + "";
    	let t6;
    	let t7;
    	let t8_value = /*item*/ ctx[33].topN + "";
    	let t8;
    	let t9;
    	let t10_value = /*item*/ ctx[33].group + "";
    	let t10;
    	let t11;
    	let t12_value = /*item*/ ctx[33].localAlpha + "";
    	let t12;
    	let t13;
    	let t14_value = /*item*/ ctx[33].negRate + "";
    	let t14;
    	let t15;
    	let t16_value = /*item*/ ctx[33].numIter + "";
    	let t16;
    	let t17;
    	let t18_value = /*item*/ ctx[33].repulsionHub + "";
    	let t18;
    	let t19;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(") type: ");
    			t2 = text(t2_value);
    			t3 = text(", globalAlpha: ");
    			t4 = text(t4_value);
    			t5 = text(", hubNum: ");
    			t6 = text(t6_value);
    			t7 = text(",\n\t\t\t\t\t\t\ttopN: ");
    			t8 = text(t8_value);
    			t9 = text(", group: ");
    			t10 = text(t10_value);
    			t11 = text(", localAlpha: ");
    			t12 = text(t12_value);
    			t13 = text(", negRate: ");
    			t14 = text(t14_value);
    			t15 = text(",\n\t\t\t\t\t\t\tnumIter: ");
    			t16 = text(t16_value);
    			t17 = text(", repulsionHub: ");
    			t18 = text(t18_value);
    			t19 = space();
    			attr_dev(div, "class", "snapshot svelte-17wtqq1");
    			add_location(div, file, 433, 6, 8594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, t10);
    			append_dev(div, t11);
    			append_dev(div, t12);
    			append_dev(div, t13);
    			append_dev(div, t14);
    			append_dev(div, t15);
    			append_dev(div, t16);
    			append_dev(div, t17);
    			append_dev(div, t18);
    			append_dev(div, t19);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*i*/ 2048) && t0_value !== (t0_value = /*items*/ ctx[12].indexOf(/*item*/ ctx[33]) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t2_value !== (t2_value = /*item*/ ctx[33].type + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t4_value !== (t4_value = /*item*/ ctx[33].globalAlpha + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t6_value !== (t6_value = /*item*/ ctx[33].hubNum + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t8_value !== (t8_value = /*item*/ ctx[33].topN + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t10_value !== (t10_value = /*item*/ ctx[33].group + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t12_value !== (t12_value = /*item*/ ctx[33].localAlpha + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t14_value !== (t14_value = /*item*/ ctx[33].negRate + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t16_value !== (t16_value = /*item*/ ctx[33].numIter + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t18_value !== (t18_value = /*item*/ ctx[33].repulsionHub + "")) set_data_dev(t18, t18_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(433:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (428:5) {#if item.type == "global"}
    function create_if_block_1(ctx) {
    	let div;
    	let t0_value = /*items*/ ctx[12].indexOf(/*item*/ ctx[33]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*item*/ ctx[33].type + "";
    	let t2;
    	let t3;
    	let t4_value = /*item*/ ctx[33].globalAlpha + "";
    	let t4;
    	let t5;
    	let t6_value = /*item*/ ctx[33].hubNum + "";
    	let t6;
    	let t7;
    	let t8_value = /*item*/ ctx[33].topN + "";
    	let t8;
    	let t9;
    	let t10_value = /*item*/ ctx[33].group + "";
    	let t10;
    	let t11;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(". type: ");
    			t2 = text(t2_value);
    			t3 = text(", globalAlpha: ");
    			t4 = text(t4_value);
    			t5 = text(", hubNum: ");
    			t6 = text(t6_value);
    			t7 = text(",\n\t\t\t\t\t\t\ttopN: ");
    			t8 = text(t8_value);
    			t9 = text(", group: ");
    			t10 = text(t10_value);
    			t11 = space();
    			attr_dev(div, "class", "snapshot svelte-17wtqq1");
    			add_location(div, file, 428, 6, 8371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, t10);
    			append_dev(div, t11);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*i*/ 2048) && t0_value !== (t0_value = /*items*/ ctx[12].indexOf(/*item*/ ctx[33]) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t2_value !== (t2_value = /*item*/ ctx[33].type + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t4_value !== (t4_value = /*item*/ ctx[33].globalAlpha + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t6_value !== (t6_value = /*item*/ ctx[33].hubNum + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t8_value !== (t8_value = /*item*/ ctx[33].topN + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty[0] & /*i*/ 2048) && t10_value !== (t10_value = /*item*/ ctx[33].group + "")) set_data_dev(t10, t10_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(428:5) {#if item.type == \\\"global\\\"}",
    		ctx
    	});

    	return block;
    }

    // (427:4) {#each items.slice(0, i) as item}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*item*/ ctx[33].type == "global") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(427:4) {#each items.slice(0, i) as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div59;
    	let h1;
    	let t1;
    	let div38;
    	let div18;
    	let div0;
    	let t2;
    	let div4;
    	let div1;
    	let b0;
    	let t4;
    	let br0;
    	let t5;
    	let t6;
    	let div2;
    	let t7;
    	let t8;
    	let div3;
    	let input0;
    	let t9;
    	let div8;
    	let div5;
    	let b1;
    	let t11;
    	let br1;
    	let t12;
    	let t13;
    	let div6;
    	let t14;
    	let t15;
    	let div7;
    	let input1;
    	let t16;
    	let div12;
    	let div9;
    	let b2;
    	let t18;
    	let br2;
    	let t19;
    	let t20;
    	let div10;
    	let t21;
    	let t22;
    	let div11;
    	let input2;
    	let t23;
    	let div16;
    	let div13;
    	let b3;
    	let t25;
    	let div14;
    	let t26;
    	let t27;
    	let div15;
    	let label0;
    	let input3;
    	let input3_value_value;
    	let t28;
    	let t29;
    	let t30;
    	let label1;
    	let input4;
    	let input4_value_value;
    	let t31;
    	let t32;
    	let t33;
    	let div17;
    	let button0;
    	let t35;
    	let button1;
    	let t37;
    	let div37;
    	let div19;
    	let t38;
    	let div23;
    	let div20;
    	let b4;
    	let t40;
    	let br3;
    	let t41;
    	let t42;
    	let div21;
    	let t43;
    	let t44;
    	let div22;
    	let input5;
    	let t45;
    	let div27;
    	let div24;
    	let b5;
    	let t47;
    	let br4;
    	let t48;
    	let t49;
    	let div25;
    	let t50;
    	let t51;
    	let div26;
    	let input6;
    	let t52;
    	let div31;
    	let div28;
    	let b6;
    	let t54;
    	let br5;
    	let t55;
    	let t56;
    	let div29;
    	let t57;
    	let t58;
    	let div30;
    	let input7;
    	let t59;
    	let div35;
    	let div32;
    	let b7;
    	let t61;
    	let br6;
    	let t62;
    	let t63;
    	let div33;
    	let t64;
    	let t65;
    	let div34;
    	let input8;
    	let t66;
    	let div36;
    	let button2;
    	let t68;
    	let div47;
    	let div42;
    	let div39;
    	let h30;
    	let t70;
    	let div41;
    	let div40;
    	let p0;
    	let t72;
    	let div46;
    	let div43;
    	let h31;
    	let t74;
    	let div45;
    	let div44;
    	let p1;
    	let t76;
    	let div56;
    	let div51;
    	let div48;
    	let h32;
    	let t78;
    	let div50;
    	let div49;
    	let p2;
    	let t80;
    	let div55;
    	let div52;
    	let h33;
    	let t82;
    	let div54;
    	let div53;
    	let p3;
    	let t84;
    	let div58;
    	let div57;
    	let label2;
    	let input9;
    	let t85;
    	let t86;
    	let t87;
    	let footer;
    	let t88;
    	let br7;
    	let t89;
    	let a0;
    	let t91;
    	let a1;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*globalCliked*/ ctx[4]) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const default_slot_template = /*$$slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);
    	const default_slot_template_1 = /*$$slots*/ ctx[18].default;
    	const default_slot_1 = create_slot(default_slot_template_1, ctx, /*$$scope*/ ctx[17], null);

    	function select_block_type_1(ctx, dirty) {
    		if (/*localCliked*/ ctx[9]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let if_block2 = /*showItems*/ ctx[10] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div59 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Steerable UMATO";
    			t1 = space();
    			div38 = element("div");
    			div18 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t2 = space();
    			div4 = element("div");
    			div1 = element("div");
    			b0 = element("b");
    			b0.textContent = "Global alpha";
    			t4 = space();
    			br0 = element("br");
    			t5 = text("\n\t\t\t\t\trange: 0.0 ~ 1.0 w/ interval=0.005");
    			t6 = space();
    			div2 = element("div");
    			t7 = text(/*globalAlpha*/ ctx[0]);
    			t8 = space();
    			div3 = element("div");
    			input0 = element("input");
    			t9 = space();
    			div8 = element("div");
    			div5 = element("div");
    			b1 = element("b");
    			b1.textContent = "Number of hub nodes";
    			t11 = space();
    			br1 = element("br");
    			t12 = text("\n\t\t\t\t\trange: 100 ~ 500 w/ interval=50");
    			t13 = space();
    			div6 = element("div");
    			t14 = text(/*hubNum*/ ctx[1]);
    			t15 = space();
    			div7 = element("div");
    			input1 = element("input");
    			t16 = space();
    			div12 = element("div");
    			div9 = element("div");
    			b2 = element("b");
    			b2.textContent = "Top N considerations";
    			t18 = space();
    			br2 = element("br");
    			t19 = text("\n\t\t\t\t\trange: 5 ~ 30 w/ interval=5");
    			t20 = space();
    			div10 = element("div");
    			t21 = text(/*topN*/ ctx[2]);
    			t22 = space();
    			div11 = element("div");
    			input2 = element("input");
    			t23 = space();
    			div16 = element("div");
    			div13 = element("div");
    			b3 = element("b");
    			b3.textContent = "Init method";
    			t25 = space();
    			div14 = element("div");
    			t26 = text(/*group*/ ctx[3]);
    			t27 = space();
    			div15 = element("div");
    			label0 = element("label");
    			input3 = element("input");
    			t28 = space();
    			if (default_slot) default_slot.c();
    			t29 = text("\n\t\t\t\t\t\tPCA");
    			t30 = space();
    			label1 = element("label");
    			input4 = element("input");
    			t31 = space();
    			if (default_slot_1) default_slot_1.c();
    			t32 = text("\n\t\t\t\t\t\tRandom");
    			t33 = space();
    			div17 = element("div");
    			button0 = element("button");
    			button0.textContent = "Save snapshot";
    			t35 = space();
    			button1 = element("button");
    			button1.textContent = "Use this setting for LOCAL optimization";
    			t37 = space();
    			div37 = element("div");
    			div19 = element("div");
    			if_block1.c();
    			t38 = space();
    			div23 = element("div");
    			div20 = element("div");
    			b4 = element("b");
    			b4.textContent = "Local alpha";
    			t40 = space();
    			br3 = element("br");
    			t41 = text("\n\t\t\t\t\trange: 0.0 ~ 1.0 w/ interval=0.005");
    			t42 = space();
    			div21 = element("div");
    			t43 = text(/*localAlpha*/ ctx[5]);
    			t44 = space();
    			div22 = element("div");
    			input5 = element("input");
    			t45 = space();
    			div27 = element("div");
    			div24 = element("div");
    			b5 = element("b");
    			b5.textContent = "Negative sampling rate";
    			t47 = space();
    			br4 = element("br");
    			t48 = text("\n\t\t\t\t\trange: 1 ~ 50 w/ interval=1");
    			t49 = space();
    			div25 = element("div");
    			t50 = text(/*negRate*/ ctx[6]);
    			t51 = space();
    			div26 = element("div");
    			input6 = element("input");
    			t52 = space();
    			div31 = element("div");
    			div28 = element("div");
    			b6 = element("b");
    			b6.textContent = "Number of iterations";
    			t54 = space();
    			br5 = element("br");
    			t55 = text("\n\t\t\t\t\trange: 50 ~ 200 w/ interval=10");
    			t56 = space();
    			div29 = element("div");
    			t57 = text(/*numIter*/ ctx[7]);
    			t58 = space();
    			div30 = element("div");
    			input7 = element("input");
    			t59 = space();
    			div35 = element("div");
    			div32 = element("div");
    			b7 = element("b");
    			b7.textContent = "Repulsion force for hub nodes";
    			t61 = space();
    			br6 = element("br");
    			t62 = text("\n\t\t\t\t\trange: 0 ~ 1.0 w/ interval=0.01");
    			t63 = space();
    			div33 = element("div");
    			t64 = text(/*repulsionHub*/ ctx[8]);
    			t65 = space();
    			div34 = element("div");
    			input8 = element("input");
    			t66 = space();
    			div36 = element("div");
    			button2 = element("button");
    			button2.textContent = "Save snapshot";
    			t68 = space();
    			div47 = element("div");
    			div42 = element("div");
    			div39 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Global optimization D3 Chart";
    			t70 = space();
    			div41 = element("div");
    			div40 = element("div");
    			p0 = element("p");
    			p0.textContent = "sads";
    			t72 = space();
    			div46 = element("div");
    			div43 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Local optimization D3 Chart";
    			t74 = space();
    			div45 = element("div");
    			div44 = element("div");
    			p1 = element("p");
    			p1.textContent = "sads";
    			t76 = space();
    			div56 = element("div");
    			div51 = element("div");
    			div48 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Global optimization Result";
    			t78 = space();
    			div50 = element("div");
    			div49 = element("div");
    			p2 = element("p");
    			p2.textContent = "sads";
    			t80 = space();
    			div55 = element("div");
    			div52 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Local optimization Result";
    			t82 = space();
    			div54 = element("div");
    			div53 = element("div");
    			p3 = element("p");
    			p3.textContent = "sads";
    			t84 = space();
    			div58 = element("div");
    			div57 = element("div");
    			label2 = element("label");
    			input9 = element("input");
    			t85 = text("\n\t\t\t\tshow snapshots");
    			t86 = space();
    			if (if_block2) if_block2.c();
    			t87 = space();
    			footer = element("footer");
    			t88 = text("Copyright 2020 Hyung-Kwon Ko\n\t\t");
    			br7 = element("br");
    			t89 = space();
    			a0 = element("a");
    			a0.textContent = "hkko@hcil.snu.ac.kr";
    			t91 = text(" / ");
    			a1 = element("a");
    			a1.textContent = "hyungkwonko.info";
    			attr_dev(h1, "class", "svelte-17wtqq1");
    			add_location(h1, file, 184, 1, 2894);
    			attr_dev(div0, "class", "sub-title svelte-17wtqq1");
    			add_location(div0, file, 191, 3, 2976);
    			add_location(b0, file, 208, 5, 3490);
    			add_location(br0, file, 209, 5, 3515);
    			attr_dev(div1, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div1, file, 207, 4, 3450);
    			attr_dev(div2, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div2, file, 212, 4, 3575);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0.0");
    			attr_dev(input0, "max", "1.0");
    			attr_dev(input0, "step", "0.005");
    			attr_dev(input0, "class", "svelte-17wtqq1");
    			add_location(input0, file, 216, 5, 3684);
    			attr_dev(div3, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div3, file, 215, 4, 3644);
    			attr_dev(div4, "class", "row svelte-17wtqq1");
    			add_location(div4, file, 206, 3, 3428);
    			add_location(b1, file, 221, 5, 3841);
    			add_location(br1, file, 222, 5, 3873);
    			attr_dev(div5, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div5, file, 220, 4, 3801);
    			attr_dev(div6, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div6, file, 225, 4, 3930);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "100");
    			attr_dev(input1, "max", "500");
    			attr_dev(input1, "step", "50");
    			attr_dev(input1, "class", "svelte-17wtqq1");
    			add_location(input1, file, 229, 5, 4034);
    			attr_dev(div7, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div7, file, 228, 4, 3994);
    			attr_dev(div8, "class", "row svelte-17wtqq1");
    			add_location(div8, file, 219, 3, 3779);
    			add_location(b2, file, 234, 5, 4183);
    			add_location(br2, file, 235, 5, 4216);
    			attr_dev(div9, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div9, file, 233, 4, 4143);
    			attr_dev(div10, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div10, file, 238, 4, 4269);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "5");
    			attr_dev(input2, "max", "30");
    			attr_dev(input2, "step", "5");
    			attr_dev(input2, "class", "svelte-17wtqq1");
    			add_location(input2, file, 242, 5, 4371);
    			attr_dev(div11, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div11, file, 241, 4, 4331);
    			attr_dev(div12, "class", "row svelte-17wtqq1");
    			add_location(div12, file, 232, 3, 4121);
    			add_location(b3, file, 247, 5, 4514);
    			attr_dev(div13, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div13, file, 246, 4, 4474);
    			attr_dev(div14, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div14, file, 249, 4, 4548);
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = "PCA";
    			input3.value = input3.__value;
    			attr_dev(input3, "class", "svelte-17wtqq1");
    			/*$$binding_groups*/ ctx[23][0].push(input3);
    			add_location(input3, file, 254, 6, 4665);
    			add_location(label0, file, 253, 5, 4651);
    			attr_dev(input4, "type", "radio");
    			input4.__value = input4_value_value = "Random";
    			input4.value = input4.__value;
    			attr_dev(input4, "class", "svelte-17wtqq1");
    			/*$$binding_groups*/ ctx[23][0].push(input4);
    			add_location(input4, file, 259, 6, 4768);
    			add_location(label1, file, 258, 5, 4754);
    			attr_dev(div15, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div15, file, 252, 4, 4611);
    			attr_dev(div16, "class", "row svelte-17wtqq1");
    			add_location(div16, file, 245, 3, 4452);
    			attr_dev(button0, "class", "svelte-17wtqq1");
    			add_location(button0, file, 267, 4, 4913);
    			attr_dev(button1, "class", "svelte-17wtqq1");
    			add_location(button1, file, 270, 4, 4989);
    			attr_dev(div17, "class", "sub-footer svelte-17wtqq1");
    			add_location(div17, file, 266, 3, 4884);
    			attr_dev(div18, "class", "column svelte-17wtqq1");
    			add_location(div18, file, 190, 2, 2952);
    			attr_dev(div19, "class", "sub-title svelte-17wtqq1");
    			add_location(div19, file, 278, 3, 5150);
    			add_location(b4, file, 295, 5, 5659);
    			add_location(br3, file, 296, 5, 5683);
    			attr_dev(div20, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div20, file, 294, 4, 5619);
    			attr_dev(div21, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div21, file, 299, 4, 5743);
    			attr_dev(input5, "type", "range");
    			attr_dev(input5, "min", "0.0");
    			attr_dev(input5, "max", "1.0");
    			attr_dev(input5, "step", "0.005");
    			attr_dev(input5, "class", "svelte-17wtqq1");
    			add_location(input5, file, 303, 5, 5851);
    			attr_dev(div22, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div22, file, 302, 4, 5811);
    			attr_dev(div23, "class", "row svelte-17wtqq1");
    			add_location(div23, file, 293, 3, 5597);
    			add_location(b5, file, 308, 5, 6007);
    			add_location(br4, file, 309, 5, 6042);
    			attr_dev(div24, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div24, file, 307, 4, 5967);
    			attr_dev(div25, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div25, file, 312, 4, 6095);
    			attr_dev(input6, "type", "range");
    			attr_dev(input6, "min", "1");
    			attr_dev(input6, "max", "50");
    			attr_dev(input6, "step", "1");
    			attr_dev(input6, "class", "svelte-17wtqq1");
    			add_location(input6, file, 316, 5, 6200);
    			attr_dev(div26, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div26, file, 315, 4, 6160);
    			attr_dev(div27, "class", "row svelte-17wtqq1");
    			add_location(div27, file, 306, 3, 5945);
    			add_location(b6, file, 321, 5, 6346);
    			add_location(br5, file, 322, 5, 6379);
    			attr_dev(div28, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div28, file, 320, 4, 6306);
    			attr_dev(div29, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div29, file, 325, 4, 6435);
    			attr_dev(input7, "type", "range");
    			attr_dev(input7, "min", "50");
    			attr_dev(input7, "max", "200");
    			attr_dev(input7, "step", "10");
    			attr_dev(input7, "class", "svelte-17wtqq1");
    			add_location(input7, file, 329, 5, 6540);
    			attr_dev(div30, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div30, file, 328, 4, 6500);
    			attr_dev(div31, "class", "row svelte-17wtqq1");
    			add_location(div31, file, 319, 3, 6284);
    			add_location(b7, file, 334, 5, 6689);
    			add_location(br6, file, 335, 5, 6731);
    			attr_dev(div32, "class", "column column-width1 svelte-17wtqq1");
    			add_location(div32, file, 333, 4, 6649);
    			attr_dev(div33, "class", "column column-width2 svelte-17wtqq1");
    			add_location(div33, file, 338, 4, 6788);
    			attr_dev(input8, "type", "range");
    			attr_dev(input8, "min", "0");
    			attr_dev(input8, "max", "1");
    			attr_dev(input8, "step", "0.01");
    			attr_dev(input8, "class", "svelte-17wtqq1");
    			add_location(input8, file, 342, 5, 6898);
    			attr_dev(div34, "class", "column column-width3 svelte-17wtqq1");
    			add_location(div34, file, 341, 4, 6858);
    			attr_dev(div35, "class", "row svelte-17wtqq1");
    			add_location(div35, file, 332, 3, 6627);
    			attr_dev(button2, "class", "svelte-17wtqq1");
    			add_location(button2, file, 347, 4, 7020);
    			attr_dev(div36, "class", "sub-footer svelte-17wtqq1");
    			add_location(div36, file, 346, 3, 6991);
    			attr_dev(div37, "class", "column svelte-17wtqq1");
    			add_location(div37, file, 277, 2, 5126);
    			add_location(div38, file, 188, 1, 2926);
    			attr_dev(h30, "class", "svelte-17wtqq1");
    			add_location(h30, file, 358, 4, 7201);
    			attr_dev(div39, "class", "sub-title svelte-17wtqq1");
    			add_location(div39, file, 357, 3, 7173);
    			add_location(p0, file, 364, 5, 7321);
    			attr_dev(div40, "class", "column column-d3 svelte-17wtqq1");
    			add_location(div40, file, 363, 4, 7285);
    			attr_dev(div41, "class", "row svelte-17wtqq1");
    			add_location(div41, file, 362, 3, 7263);
    			attr_dev(div42, "class", "column svelte-17wtqq1");
    			add_location(div42, file, 356, 2, 7149);
    			attr_dev(h31, "class", "svelte-17wtqq1");
    			add_location(h31, file, 372, 4, 7430);
    			attr_dev(div43, "class", "sub-title svelte-17wtqq1");
    			add_location(div43, file, 371, 3, 7402);
    			add_location(p1, file, 378, 5, 7549);
    			attr_dev(div44, "class", "column column-d3 svelte-17wtqq1");
    			add_location(div44, file, 377, 4, 7513);
    			attr_dev(div45, "class", "row svelte-17wtqq1");
    			add_location(div45, file, 376, 3, 7491);
    			attr_dev(div46, "class", "column svelte-17wtqq1");
    			add_location(div46, file, 370, 2, 7378);
    			add_location(div47, file, 354, 1, 7120);
    			attr_dev(h32, "class", "svelte-17wtqq1");
    			add_location(h32, file, 390, 4, 7695);
    			attr_dev(div48, "class", "sub-title svelte-17wtqq1");
    			add_location(div48, file, 389, 3, 7667);
    			add_location(p2, file, 396, 5, 7813);
    			attr_dev(div49, "class", "column column-d3 svelte-17wtqq1");
    			add_location(div49, file, 395, 4, 7777);
    			attr_dev(div50, "class", "row svelte-17wtqq1");
    			add_location(div50, file, 394, 3, 7755);
    			attr_dev(div51, "class", "column svelte-17wtqq1");
    			add_location(div51, file, 388, 2, 7643);
    			attr_dev(h33, "class", "svelte-17wtqq1");
    			add_location(h33, file, 404, 4, 7922);
    			attr_dev(div52, "class", "sub-title svelte-17wtqq1");
    			add_location(div52, file, 403, 3, 7894);
    			add_location(p3, file, 410, 5, 8039);
    			attr_dev(div53, "class", "column column-d3 svelte-17wtqq1");
    			add_location(div53, file, 409, 4, 8003);
    			attr_dev(div54, "class", "row svelte-17wtqq1");
    			add_location(div54, file, 408, 3, 7981);
    			attr_dev(div55, "class", "column svelte-17wtqq1");
    			add_location(div55, file, 402, 2, 7870);
    			add_location(div56, file, 386, 1, 7614);
    			attr_dev(input9, "type", "checkbox");
    			attr_dev(input9, "class", "svelte-17wtqq1");
    			add_location(input9, file, 422, 4, 8195);
    			add_location(label2, file, 421, 3, 8183);
    			attr_dev(div57, "class", "column column-snapshot svelte-17wtqq1");
    			add_location(div57, file, 420, 2, 8143);
    			attr_dev(div58, "class", "row svelte-17wtqq1");
    			add_location(div58, file, 419, 1, 8123);
    			add_location(br7, file, 446, 2, 9030);
    			attr_dev(a0, "href", "mailto:hkko@hcil.snu.ac.kr");
    			add_location(a0, file, 447, 2, 9037);
    			attr_dev(a1, "href", "https://hyungkwonko.info");
    			add_location(a1, file, 447, 65, 9100);
    			attr_dev(footer, "class", "copyright svelte-17wtqq1");
    			add_location(footer, file, 444, 1, 8970);
    			add_location(div59, file, 183, 0, 2887);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div59, anchor);
    			append_dev(div59, h1);
    			append_dev(div59, t1);
    			append_dev(div59, div38);
    			append_dev(div38, div18);
    			append_dev(div18, div0);
    			if_block0.m(div0, null);
    			append_dev(div18, t2);
    			append_dev(div18, div4);
    			append_dev(div4, div1);
    			append_dev(div1, b0);
    			append_dev(div1, t4);
    			append_dev(div1, br0);
    			append_dev(div1, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div2);
    			append_dev(div2, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, input0);
    			set_input_value(input0, /*globalAlpha*/ ctx[0]);
    			append_dev(div18, t9);
    			append_dev(div18, div8);
    			append_dev(div8, div5);
    			append_dev(div5, b1);
    			append_dev(div5, t11);
    			append_dev(div5, br1);
    			append_dev(div5, t12);
    			append_dev(div8, t13);
    			append_dev(div8, div6);
    			append_dev(div6, t14);
    			append_dev(div8, t15);
    			append_dev(div8, div7);
    			append_dev(div7, input1);
    			set_input_value(input1, /*hubNum*/ ctx[1]);
    			append_dev(div18, t16);
    			append_dev(div18, div12);
    			append_dev(div12, div9);
    			append_dev(div9, b2);
    			append_dev(div9, t18);
    			append_dev(div9, br2);
    			append_dev(div9, t19);
    			append_dev(div12, t20);
    			append_dev(div12, div10);
    			append_dev(div10, t21);
    			append_dev(div12, t22);
    			append_dev(div12, div11);
    			append_dev(div11, input2);
    			set_input_value(input2, /*topN*/ ctx[2]);
    			append_dev(div18, t23);
    			append_dev(div18, div16);
    			append_dev(div16, div13);
    			append_dev(div13, b3);
    			append_dev(div16, t25);
    			append_dev(div16, div14);
    			append_dev(div14, t26);
    			append_dev(div16, t27);
    			append_dev(div16, div15);
    			append_dev(div15, label0);
    			append_dev(label0, input3);
    			input3.checked = input3.__value === /*group*/ ctx[3];
    			append_dev(label0, t28);

    			if (default_slot) {
    				default_slot.m(label0, null);
    			}

    			append_dev(label0, t29);
    			append_dev(div15, t30);
    			append_dev(div15, label1);
    			append_dev(label1, input4);
    			input4.checked = input4.__value === /*group*/ ctx[3];
    			append_dev(label1, t31);

    			if (default_slot_1) {
    				default_slot_1.m(label1, null);
    			}

    			append_dev(label1, t32);
    			append_dev(div18, t33);
    			append_dev(div18, div17);
    			append_dev(div17, button0);
    			append_dev(div17, t35);
    			append_dev(div17, button1);
    			append_dev(div38, t37);
    			append_dev(div38, div37);
    			append_dev(div37, div19);
    			if_block1.m(div19, null);
    			append_dev(div37, t38);
    			append_dev(div37, div23);
    			append_dev(div23, div20);
    			append_dev(div20, b4);
    			append_dev(div20, t40);
    			append_dev(div20, br3);
    			append_dev(div20, t41);
    			append_dev(div23, t42);
    			append_dev(div23, div21);
    			append_dev(div21, t43);
    			append_dev(div23, t44);
    			append_dev(div23, div22);
    			append_dev(div22, input5);
    			set_input_value(input5, /*localAlpha*/ ctx[5]);
    			append_dev(div37, t45);
    			append_dev(div37, div27);
    			append_dev(div27, div24);
    			append_dev(div24, b5);
    			append_dev(div24, t47);
    			append_dev(div24, br4);
    			append_dev(div24, t48);
    			append_dev(div27, t49);
    			append_dev(div27, div25);
    			append_dev(div25, t50);
    			append_dev(div27, t51);
    			append_dev(div27, div26);
    			append_dev(div26, input6);
    			set_input_value(input6, /*negRate*/ ctx[6]);
    			append_dev(div37, t52);
    			append_dev(div37, div31);
    			append_dev(div31, div28);
    			append_dev(div28, b6);
    			append_dev(div28, t54);
    			append_dev(div28, br5);
    			append_dev(div28, t55);
    			append_dev(div31, t56);
    			append_dev(div31, div29);
    			append_dev(div29, t57);
    			append_dev(div31, t58);
    			append_dev(div31, div30);
    			append_dev(div30, input7);
    			set_input_value(input7, /*numIter*/ ctx[7]);
    			append_dev(div37, t59);
    			append_dev(div37, div35);
    			append_dev(div35, div32);
    			append_dev(div32, b7);
    			append_dev(div32, t61);
    			append_dev(div32, br6);
    			append_dev(div32, t62);
    			append_dev(div35, t63);
    			append_dev(div35, div33);
    			append_dev(div33, t64);
    			append_dev(div35, t65);
    			append_dev(div35, div34);
    			append_dev(div34, input8);
    			set_input_value(input8, /*repulsionHub*/ ctx[8]);
    			append_dev(div37, t66);
    			append_dev(div37, div36);
    			append_dev(div36, button2);
    			append_dev(div59, t68);
    			append_dev(div59, div47);
    			append_dev(div47, div42);
    			append_dev(div42, div39);
    			append_dev(div39, h30);
    			append_dev(div42, t70);
    			append_dev(div42, div41);
    			append_dev(div41, div40);
    			append_dev(div40, p0);
    			append_dev(div47, t72);
    			append_dev(div47, div46);
    			append_dev(div46, div43);
    			append_dev(div43, h31);
    			append_dev(div46, t74);
    			append_dev(div46, div45);
    			append_dev(div45, div44);
    			append_dev(div44, p1);
    			append_dev(div59, t76);
    			append_dev(div59, div56);
    			append_dev(div56, div51);
    			append_dev(div51, div48);
    			append_dev(div48, h32);
    			append_dev(div51, t78);
    			append_dev(div51, div50);
    			append_dev(div50, div49);
    			append_dev(div49, p2);
    			append_dev(div56, t80);
    			append_dev(div56, div55);
    			append_dev(div55, div52);
    			append_dev(div52, h33);
    			append_dev(div55, t82);
    			append_dev(div55, div54);
    			append_dev(div54, div53);
    			append_dev(div53, p3);
    			append_dev(div59, t84);
    			append_dev(div59, div58);
    			append_dev(div58, div57);
    			append_dev(div57, label2);
    			append_dev(label2, input9);
    			input9.checked = /*showItems*/ ctx[10];
    			append_dev(label2, t85);
    			append_dev(div57, t86);
    			if (if_block2) if_block2.m(div57, null);
    			append_dev(div59, t87);
    			append_dev(div59, footer);
    			append_dev(footer, t88);
    			append_dev(footer, br7);
    			append_dev(footer, t89);
    			append_dev(footer, a0);
    			append_dev(footer, t91);
    			append_dev(footer, a1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[19]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[19]),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[20]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[20]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[21]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[21]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[22]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[24]),
    					listen_dev(button0, "click", /*saveGlobalSnapshot*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*saveGlobalSnapshot*/ ctx[15], false, false, false),
    					listen_dev(input5, "change", /*input5_change_input_handler*/ ctx[25]),
    					listen_dev(input5, "input", /*input5_change_input_handler*/ ctx[25]),
    					listen_dev(input6, "change", /*input6_change_input_handler*/ ctx[26]),
    					listen_dev(input6, "input", /*input6_change_input_handler*/ ctx[26]),
    					listen_dev(input7, "change", /*input7_change_input_handler*/ ctx[27]),
    					listen_dev(input7, "input", /*input7_change_input_handler*/ ctx[27]),
    					listen_dev(input8, "change", /*input8_change_input_handler*/ ctx[28]),
    					listen_dev(input8, "input", /*input8_change_input_handler*/ ctx[28]),
    					listen_dev(button2, "click", /*saveLocalSnapshot*/ ctx[16], false, false, false),
    					listen_dev(input9, "change", /*input9_change_handler*/ ctx[29])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (!current || dirty[0] & /*globalAlpha*/ 1) set_data_dev(t7, /*globalAlpha*/ ctx[0]);

    			if (dirty[0] & /*globalAlpha*/ 1) {
    				set_input_value(input0, /*globalAlpha*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*hubNum*/ 2) set_data_dev(t14, /*hubNum*/ ctx[1]);

    			if (dirty[0] & /*hubNum*/ 2) {
    				set_input_value(input1, /*hubNum*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*topN*/ 4) set_data_dev(t21, /*topN*/ ctx[2]);

    			if (dirty[0] & /*topN*/ 4) {
    				set_input_value(input2, /*topN*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*group*/ 8) set_data_dev(t26, /*group*/ ctx[3]);

    			if (dirty[0] & /*group*/ 8) {
    				input3.checked = input3.__value === /*group*/ ctx[3];
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			if (dirty[0] & /*group*/ 8) {
    				input4.checked = input4.__value === /*group*/ ctx[3];
    			}

    			if (default_slot_1) {
    				if (default_slot_1.p && dirty[0] & /*$$scope*/ 131072) {
    					update_slot(default_slot_1, default_slot_template_1, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div19, null);
    				}
    			}

    			if (!current || dirty[0] & /*localAlpha*/ 32) set_data_dev(t43, /*localAlpha*/ ctx[5]);

    			if (dirty[0] & /*localAlpha*/ 32) {
    				set_input_value(input5, /*localAlpha*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*negRate*/ 64) set_data_dev(t50, /*negRate*/ ctx[6]);

    			if (dirty[0] & /*negRate*/ 64) {
    				set_input_value(input6, /*negRate*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*numIter*/ 128) set_data_dev(t57, /*numIter*/ ctx[7]);

    			if (dirty[0] & /*numIter*/ 128) {
    				set_input_value(input7, /*numIter*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*repulsionHub*/ 256) set_data_dev(t64, /*repulsionHub*/ ctx[8]);

    			if (dirty[0] & /*repulsionHub*/ 256) {
    				set_input_value(input8, /*repulsionHub*/ ctx[8]);
    			}

    			if (dirty[0] & /*showItems*/ 1024) {
    				input9.checked = /*showItems*/ ctx[10];
    			}

    			if (/*showItems*/ ctx[10]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*showItems*/ 1024) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div57, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(default_slot_1, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(default_slot_1, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div59);
    			if_block0.d();
    			/*$$binding_groups*/ ctx[23][0].splice(/*$$binding_groups*/ ctx[23][0].indexOf(input3), 1);
    			if (default_slot) default_slot.d(detaching);
    			/*$$binding_groups*/ ctx[23][0].splice(/*$$binding_groups*/ ctx[23][0].indexOf(input4), 1);
    			if (default_slot_1) default_slot_1.d(detaching);
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function containsObject(items, feed) {
    	let keys = Object.keys(feed);

    	for (let i = 0; i < items.length; i++) {
    		let count = 0;

    		keys.forEach(key => {
    			if (items[i][key] == feed[key]) {
    				count += 1;
    			}
    		});

    		if (count == keys.length) {
    			return true;
    		}
    	}

    	return false;
    }

    function instance($$self, $$props, $$invalidate) {
    	let w;
    	let h;
    	let globalAlpha = 0.1;
    	let hubNum = 100;
    	let topN = 30;
    	let group = "PCA";
    	let globalCliked = false;
    	let localAlpha = 0.1;
    	let negRate = 5;
    	let numIter = 50;
    	let repulsionHub = 0.01;
    	let localCliked = false;
    	let text = "edit me";
    	let showItems = false;
    	let items = [];
    	let i = items.length;

    	function handleClickGlobal() {
    		$$invalidate(4, globalCliked = !globalCliked);
    	}

    	function handleClickLocal() {
    		$$invalidate(9, localCliked = !localCliked);
    	}

    	function saveGlobalSnapshot() {
    		let feed = {
    			"type": "global",
    			globalAlpha,
    			hubNum,
    			topN,
    			group
    		};

    		let flag = containsObject(items, feed);

    		if (!flag) {
    			items.push(feed);
    			$$invalidate(11, i = items.length);
    		} else {
    			console.log("already in it");
    		}
    	}

    	function saveLocalSnapshot() {
    		let feed = {
    			"type": "local",
    			globalAlpha,
    			hubNum,
    			topN,
    			group,
    			localAlpha,
    			negRate,
    			numIter,
    			repulsionHub
    		};

    		let flag = containsObject(items, feed);

    		if (!flag) {
    			items.push(feed);
    			$$invalidate(11, i = items.length);
    		} else {
    			console.log("already in it");
    		}
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, ['default']);
    	const $$binding_groups = [[]];

    	function input0_change_input_handler() {
    		globalAlpha = to_number(this.value);
    		$$invalidate(0, globalAlpha);
    	}

    	function input1_change_input_handler() {
    		hubNum = to_number(this.value);
    		$$invalidate(1, hubNum);
    	}

    	function input2_change_input_handler() {
    		topN = to_number(this.value);
    		$$invalidate(2, topN);
    	}

    	function input3_change_handler() {
    		group = this.__value;
    		$$invalidate(3, group);
    	}

    	function input4_change_handler() {
    		group = this.__value;
    		$$invalidate(3, group);
    	}

    	function input5_change_input_handler() {
    		localAlpha = to_number(this.value);
    		$$invalidate(5, localAlpha);
    	}

    	function input6_change_input_handler() {
    		negRate = to_number(this.value);
    		$$invalidate(6, negRate);
    	}

    	function input7_change_input_handler() {
    		numIter = to_number(this.value);
    		$$invalidate(7, numIter);
    	}

    	function input8_change_input_handler() {
    		repulsionHub = to_number(this.value);
    		$$invalidate(8, repulsionHub);
    	}

    	function input9_change_handler() {
    		showItems = this.checked;
    		$$invalidate(10, showItems);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		w,
    		h,
    		globalAlpha,
    		hubNum,
    		topN,
    		group,
    		globalCliked,
    		localAlpha,
    		negRate,
    		numIter,
    		repulsionHub,
    		localCliked,
    		text,
    		showItems,
    		items,
    		i,
    		handleClickGlobal,
    		handleClickLocal,
    		containsObject,
    		saveGlobalSnapshot,
    		saveLocalSnapshot
    	});

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) w = $$props.w;
    		if ("h" in $$props) h = $$props.h;
    		if ("globalAlpha" in $$props) $$invalidate(0, globalAlpha = $$props.globalAlpha);
    		if ("hubNum" in $$props) $$invalidate(1, hubNum = $$props.hubNum);
    		if ("topN" in $$props) $$invalidate(2, topN = $$props.topN);
    		if ("group" in $$props) $$invalidate(3, group = $$props.group);
    		if ("globalCliked" in $$props) $$invalidate(4, globalCliked = $$props.globalCliked);
    		if ("localAlpha" in $$props) $$invalidate(5, localAlpha = $$props.localAlpha);
    		if ("negRate" in $$props) $$invalidate(6, negRate = $$props.negRate);
    		if ("numIter" in $$props) $$invalidate(7, numIter = $$props.numIter);
    		if ("repulsionHub" in $$props) $$invalidate(8, repulsionHub = $$props.repulsionHub);
    		if ("localCliked" in $$props) $$invalidate(9, localCliked = $$props.localCliked);
    		if ("text" in $$props) text = $$props.text;
    		if ("showItems" in $$props) $$invalidate(10, showItems = $$props.showItems);
    		if ("items" in $$props) $$invalidate(12, items = $$props.items);
    		if ("i" in $$props) $$invalidate(11, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		globalAlpha,
    		hubNum,
    		topN,
    		group,
    		globalCliked,
    		localAlpha,
    		negRate,
    		numIter,
    		repulsionHub,
    		localCliked,
    		showItems,
    		i,
    		items,
    		handleClickGlobal,
    		handleClickLocal,
    		saveGlobalSnapshot,
    		saveLocalSnapshot,
    		$$scope,
    		$$slots,
    		input0_change_input_handler,
    		input1_change_input_handler,
    		input2_change_input_handler,
    		input3_change_handler,
    		$$binding_groups,
    		input4_change_handler,
    		input5_change_input_handler,
    		input6_change_input_handler,
    		input7_change_input_handler,
    		input8_change_input_handler,
    		input9_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
