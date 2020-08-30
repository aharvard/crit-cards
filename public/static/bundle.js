
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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

    /* eslint-disable no-plusplus */
    const shuffle = array => {
      let m = array.length;
      let t;
      let i;

      // While there remain elements to shuffle…
      while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    };

    var cardData = [
    	{
    		category: "brand",
    		question: "Does the design align with the brand values?"
    	},
    	{
    		category: "brand",
    		question: "Does the design differ from the brand? If so, why?"
    	},
    	{
    		category: "brand",
    		question: "Is the tone of voice aligned with the brand?"
    	},
    	{
    		category: "brand",
    		question: "Does the work adhere to the design principles?"
    	},
    	{
    		category: "brand",
    		question: "Does the design match the tone of voice?"
    	},
    	{
    		category: "function",
    		question: "What is the purpose of this page?",
    		example: "(Definition Statement)"
    	},
    	{
    		category: "function",
    		question: "Does the design support the \"definition statement\" or purpose?"
    	},
    	{
    		category: "function",
    		question: "What are the minimal, necessary elements for the design to perform it's task?"
    	},
    	{
    		category: "function",
    		question: "If there are any extra elements, can you justify their place in the design?"
    	},
    	{
    		category: "objectives",
    		question: "What are the objectives for this work?"
    	},
    	{
    		category: "objectives",
    		question: "Is the design aligned with the user objectives?"
    	},
    	{
    		category: "objectives",
    		question: "Is the design aligned with the brand or aspirational objectives?"
    	},
    	{
    		category: "objectives",
    		question: "Is the design aligned with the overall business or commercial objectives?"
    	},
    	{
    		category: "visual language",
    		question: "Layout and proximity: Are supporting elements too far/too close?"
    	},
    	{
    		category: "visual language",
    		question: "How is white space used in this design?"
    	},
    	{
    		category: "visual language",
    		question: "How is the use of color in the design?",
    		example: "Too much/too little?"
    	},
    	{
    		category: "visual language",
    		question: "How is the balance of scale between type, media, and layout?"
    	},
    	{
    		category: "visual language",
    		question: "Is the typeface appropriate for the content?"
    	},
    	{
    		category: "visual language",
    		question: "How does the hierarchy of the typography feel?",
    		example: "(scale/weight/upper-case?)"
    	},
    	{
    		category: "visual language",
    		question: "Is it clear in terms of way-finding and IA?"
    	},
    	{
    		category: "visual language",
    		question: "Can you explain the choice of typeface?"
    	},
    	{
    		category: "visual language",
    		question: "Can you explain the choice of photography in the design?"
    	},
    	{
    		category: "visual language",
    		question: "What is the purpose of illustration in the design?"
    	},
    	{
    		category: "visual language",
    		question: "Does the pace match the user's expectation for this design?"
    	},
    	{
    		category: "user",
    		question: "What is the user journey and does the design support it?"
    	},
    	{
    		category: "user",
    		question: "What do we already know about our users?",
    		example: "(personas?)"
    	},
    	{
    		category: "user",
    		question: "What is the user's expectation of this page?"
    	},
    	{
    		category: "user",
    		question: "What is the user's expectation or mental model of what happens next?"
    	},
    	{
    		category: "user",
    		question: "What are the user's needs for this design?"
    	},
    	{
    		category: "user",
    		question: "What is the user's current emotional state?",
    		example: "(Curious? Frustrated? Excited? Needing Validation?)"
    	},
    	{
    		category: "wild card",
    		question: "What is the problem we are solving and does the design address it?"
    	},
    	{
    		category: "wild card",
    		question: "Where in the design is the most likely place for users to have a problem?"
    	},
    	{
    		category: "wild card",
    		question: "What is the user's \"AHA\" moment within this design for them to perform the next task?"
    	},
    	{
    		category: "wild card",
    		question: "Does the design reject established design patterns? If so, can you justify your decisions?"
    	},
    	{
    		category: "wild card",
    		question: "What would motivate your users to invest more time and attention?"
    	},
    	{
    		category: "wild card",
    		question: "How do YOU feel about the design?"
    	},
    	{
    		category: "wild card",
    		question: "What is the user's \"Ooooh\" moment?",
    		example: "(The part which delights the user.)"
    	},
    	{
    		category: "experience",
    		question: "Is it clear what tasks the user has to perform?"
    	},
    	{
    		category: "experience",
    		question: "How does the speed of our application compare to our competitors?"
    	},
    	{
    		category: "experience",
    		question: "What makes this experience different from another on the market?"
    	},
    	{
    		category: "experience",
    		question: "What in the design invites and encourages use?"
    	},
    	{
    		category: "experience",
    		question: "Is it easy to understand how to perform the tasks set for the user?"
    	},
    	{
    		category: "content",
    		question: "What is the content hierarchy?"
    	},
    	{
    		category: "content",
    		question: "What is the main message of the design?"
    	},
    	{
    		category: "content",
    		question: "What story are we telling?"
    	},
    	{
    		category: "content",
    		question: "Does the content match the targeted persona and their current state?"
    	},
    	{
    		category: "content",
    		question: "Is this the best way to communicate this content i.e. text, image, audio, animation, video?"
    	}
    ];

    /* src/components/CardBack.svelte generated by Svelte v3.24.1 */

    const file = "src/components/CardBack.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = `${cardTitle}`;
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = `${cardTitle}`;
    			attr_dev(div0, "class", "title svelte-19abamj");
    			add_location(div0, file, 32, 2, 725);
    			attr_dev(div1, "class", "title svelte-19abamj");
    			add_location(div1, file, 33, 2, 764);
    			attr_dev(div2, "class", "card-back svelte-19abamj");
    			attr_dev(div2, "aria-hidden", "true");
    			add_location(div2, file, 31, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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

    const cardTitle = "Critique Cards";

    function instance($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardBack> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardBack", $$slots, []);
    	$$self.$capture_state = () => ({ cardTitle });
    	return [];
    }

    class CardBack extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardBack",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/CardFront.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/CardFront.svelte";

    // (67:2) {#if example}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*example*/ ctx[2]);
    			attr_dev(p, "class", "example svelte-1hnknb0");
    			add_location(p, file$1, 67, 4, 1358);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*example*/ 4) set_data_dev(t, /*example*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(67:2) {#if example}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let h3;
    	let t4;
    	let t5;
    	let t6;
    	let div1;
    	let t7;
    	let if_block = /*example*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*categoryAbbreviation*/ ctx[3]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*category*/ ctx[0]);
    			t3 = space();
    			h3 = element("h3");
    			t4 = text(/*question*/ ctx[1]);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div1 = element("div");
    			t7 = text(/*categoryAbbreviation*/ ctx[3]);
    			attr_dev(div0, "class", "category-abreviation svelte-1hnknb0");
    			add_location(div0, file$1, 63, 2, 1199);
    			attr_dev(p, "class", "category svelte-1hnknb0");
    			add_location(p, file$1, 64, 2, 1264);
    			attr_dev(h3, "class", "question svelte-1hnknb0");
    			add_location(h3, file$1, 65, 2, 1301);
    			attr_dev(div1, "class", "category-abreviation svelte-1hnknb0");
    			add_location(div1, file$1, 69, 2, 1401);
    			attr_dev(div2, "class", "card-front svelte-1hnknb0");
    			add_location(div2, file$1, 62, 0, 1172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, p);
    			append_dev(p, t2);
    			append_dev(div2, t3);
    			append_dev(div2, h3);
    			append_dev(h3, t4);
    			append_dev(div2, t5);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, t7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*categoryAbbreviation*/ 8) set_data_dev(t0, /*categoryAbbreviation*/ ctx[3]);
    			if (dirty & /*category*/ 1) set_data_dev(t2, /*category*/ ctx[0]);
    			if (dirty & /*question*/ 2) set_data_dev(t4, /*question*/ ctx[1]);

    			if (/*example*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div2, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*categoryAbbreviation*/ 8) set_data_dev(t7, /*categoryAbbreviation*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { category = "category" } = $$props;
    	let { question = "question" } = $$props;
    	let { example = "example" } = $$props;
    	let { categoryAbbreviation = "cat" } = $$props;
    	const writable_props = ["category", "question", "example", "categoryAbbreviation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardFront> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardFront", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    		if ("question" in $$props) $$invalidate(1, question = $$props.question);
    		if ("example" in $$props) $$invalidate(2, example = $$props.example);
    		if ("categoryAbbreviation" in $$props) $$invalidate(3, categoryAbbreviation = $$props.categoryAbbreviation);
    	};

    	$$self.$capture_state = () => ({
    		category,
    		question,
    		example,
    		categoryAbbreviation
    	});

    	$$self.$inject_state = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    		if ("question" in $$props) $$invalidate(1, question = $$props.question);
    		if ("example" in $$props) $$invalidate(2, example = $$props.example);
    		if ("categoryAbbreviation" in $$props) $$invalidate(3, categoryAbbreviation = $$props.categoryAbbreviation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [category, question, example, categoryAbbreviation];
    }

    class CardFront extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			category: 0,
    			question: 1,
    			example: 2,
    			categoryAbbreviation: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardFront",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get category() {
    		throw new Error("<CardFront>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<CardFront>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get question() {
    		throw new Error("<CardFront>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<CardFront>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get example() {
    		throw new Error("<CardFront>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set example(value) {
    		throw new Error("<CardFront>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get categoryAbbreviation() {
    		throw new Error("<CardFront>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set categoryAbbreviation(value) {
    		throw new Error("<CardFront>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Card.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/components/Card.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let cardback;
    	let t;
    	let cardfront;
    	let current;
    	let mounted;
    	let dispose;
    	cardback = new CardBack({ $$inline: true });

    	cardfront = new CardFront({
    			props: {
    				category: /*category*/ ctx[0],
    				question: /*question*/ ctx[1],
    				example: /*example*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(cardback.$$.fragment);
    			t = space();
    			create_component(cardfront.$$.fragment);
    			attr_dev(div0, "class", "card-flipper svelte-50h934");
    			add_location(div0, file$2, 89, 2, 1691);
    			attr_dev(div1, "class", "card svelte-50h934");
    			set_style(div1, "--card-z-index-start", -1 * (/*index*/ ctx[3] + 1));
    			attr_dev(div1, "index", /*index*/ ctx[3]);
    			attr_dev(div1, "id", /*id*/ ctx[5]);
    			toggle_class(div1, "flipped", /*drawn*/ ctx[4]);
    			add_location(div1, file$2, 81, 0, 1563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(cardback, div0, null);
    			append_dev(div0, t);
    			mount_component(cardfront, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const cardfront_changes = {};
    			if (dirty & /*category*/ 1) cardfront_changes.category = /*category*/ ctx[0];
    			if (dirty & /*question*/ 2) cardfront_changes.question = /*question*/ ctx[1];
    			if (dirty & /*example*/ 4) cardfront_changes.example = /*example*/ ctx[2];
    			cardfront.$set(cardfront_changes);

    			if (!current || dirty & /*index*/ 8) {
    				set_style(div1, "--card-z-index-start", -1 * (/*index*/ ctx[3] + 1));
    			}

    			if (!current || dirty & /*index*/ 8) {
    				attr_dev(div1, "index", /*index*/ ctx[3]);
    			}

    			if (!current || dirty & /*id*/ 32) {
    				attr_dev(div1, "id", /*id*/ ctx[5]);
    			}

    			if (dirty & /*drawn*/ 16) {
    				toggle_class(div1, "flipped", /*drawn*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardback.$$.fragment, local);
    			transition_in(cardfront.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardback.$$.fragment, local);
    			transition_out(cardfront.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(cardback);
    			destroy_component(cardfront);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { category = "category" } = $$props;
    	let { question = "question" } = $$props;
    	let { example } = $$props;
    	let { index = 0 } = $$props;
    	let { drawn } = $$props;
    	let { id } = $$props;
    	const writable_props = ["category", "question", "example", "index", "drawn", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    		if ("question" in $$props) $$invalidate(1, question = $$props.question);
    		if ("example" in $$props) $$invalidate(2, example = $$props.example);
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("drawn" in $$props) $$invalidate(4, drawn = $$props.drawn);
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		CardBack,
    		CardFront,
    		category,
    		question,
    		example,
    		index,
    		drawn,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    		if ("question" in $$props) $$invalidate(1, question = $$props.question);
    		if ("example" in $$props) $$invalidate(2, example = $$props.example);
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("drawn" in $$props) $$invalidate(4, drawn = $$props.drawn);
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [category, question, example, index, drawn, id, click_handler];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			category: 0,
    			question: 1,
    			example: 2,
    			index: 3,
    			drawn: 4,
    			id: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*example*/ ctx[2] === undefined && !("example" in props)) {
    			console.warn("<Card> was created without expected prop 'example'");
    		}

    		if (/*drawn*/ ctx[4] === undefined && !("drawn" in props)) {
    			console.warn("<Card> was created without expected prop 'drawn'");
    		}

    		if (/*id*/ ctx[5] === undefined && !("id" in props)) {
    			console.warn("<Card> was created without expected prop 'id'");
    		}
    	}

    	get category() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get question() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get example() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set example(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drawn() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set drawn(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Icon.svelte generated by Svelte v3.24.1 */

    const file$3 = "src/components/Icon.svelte";

    // (23:2) {#if name == 'drawCard'}
    function create_if_block_1(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M9.75,19.11l-2.879,1.049l-3.82393e-08,1.38953e-08c-0.778615,0.282931\n        -1.63917,-0.1189 -1.9221,-0.897515c-0.000300886,-0.000828027\n        -0.000601043,-0.00165632\n        -0.00090047,-0.00248488l-4.107,-11.271l2.47817e-08,6.81982e-08c-0.282931,-0.778615\n        0.1189,-1.63917 0.897515,-1.9221c0.000828027,-0.000300887\n        0.00165632,-0.000601043 0.00248488,-0.000900471l6.509,-2.373");
    			add_location(path0, file$3, 24, 6, 410);
    			attr_dev(path1, "d", "M18.75,12.75v-10.5v0c0,-0.828427 -0.671573,-1.5\n        -1.5,-1.5h-7.5l-6.55671e-08,1.77636e-15c-0.828427,3.62117e-08\n        -1.5,0.671573 -1.5,1.5c0,0 0,0\n        0,0v12l1.77636e-14,2.26494e-07c1.25089e-07,0.828427 0.671573,1.5\n        1.5,1.5h0.75");
    			add_location(path1, file$3, 32, 6, 846);
    			attr_dev(path2, "d", "M15.091,6.65901c0.87868,0.87868 0.87868,2.3033\n        0,3.18198c-0.87868,0.87868 -2.3033,0.87868 -3.18198,0c-0.87868,-0.87868\n        -0.87868,-2.3033 0,-3.18198c0.87868,-0.87868 2.3033,-0.87868 3.18198,0");
    			add_location(path2, file$3, 39, 6, 1136);
    			attr_dev(path3, "d", "M17.92,22.7l2.32622e-08,-8.5272e-08c-0.109014,0.399611\n        -0.521335,0.635187 -0.920946,0.526173c-0.241829,-0.0659709\n        -0.434714,-0.248394\n        -0.514054,-0.486173l-3.185,-8.488l-1.54112e-08,-4.61307e-08c-0.131248,-0.39287\n        0.0808379,-0.817752 0.473708,-0.949c0.154241,-0.0515282\n        0.321051,-0.0515282\n        0.475292,5.21288e-08l8.485,3.182l-3.21092e-08,-1.07139e-08c0.392918,0.131105\n        0.605159,0.55591 0.474054,0.948827c-0.0793398,0.237779\n        -0.272224,0.420202 -0.514054,0.486173l-3.909,0.868Z");
    			add_location(path3, file$3, 44, 6, 1381);
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-width", "1.5");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$3, 23, 4, 334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:2) {#if name == 'drawCard'}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if name == 'shuffle'}
    function create_if_block$1(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "d", "M10.1,9l1.75114e-07,2.35669e-07c-0.974216,-1.3111 -2.4709,-2.13318\n        -4.1,-2.252h-5.25");
    			add_location(path0, file$3, 60, 6, 2075);
    			attr_dev(path1, "d", "M23.25,6.748h-5.25c-3.75,0 -6,5.25 -6,5.25c0,0 -2.25,5.25\n        -6,5.25h-5.25");
    			add_location(path1, file$3, 64, 6, 2207);
    			attr_dev(path2, "d", "M13.9,15l4.87631e-08,6.55751e-08c0.974378,1.31031 2.4713,2.13107\n        4.1,2.248h5.25");
    			add_location(path2, file$3, 68, 6, 2326);
    			attr_dev(path3, "d", "M20.25,3.748l3,3l-3,3");
    			add_location(path3, file$3, 72, 6, 2453);
    			attr_dev(path4, "d", "M20.25,14.248l3,3l-3,3");
    			add_location(path4, file$3, 73, 6, 2499);
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-width", "1.5");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$3, 59, 4, 1999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    			append_dev(g, path4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:2) {#if name == 'shuffle'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let svg;
    	let if_block0_anchor;
    	let if_block0 = /*name*/ ctx[0] == "drawCard" && create_if_block_1(ctx);
    	let if_block1 = /*name*/ ctx[0] == "shuffle" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			attr_dev(svg, "class", "icon svelte-n7yabw");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$3, 14, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block0) if_block0.m(svg, null);
    			append_dev(svg, if_block0_anchor);
    			if (if_block1) if_block1.m(svg, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*name*/ ctx[0] == "drawCard") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(svg, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*name*/ ctx[0] == "shuffle") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(svg, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Icon", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Icon> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Button.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/components/Button.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let icon_1;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	icon_1 = new Icon({
    			props: { name: /*icon*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(icon_1.$$.fragment);
    			t0 = space();
    			t1 = text(/*text*/ ctx[0]);
    			button.disabled = /*disabledState*/ ctx[2];
    			attr_dev(button, "class", "svelte-1l1t15r");
    			add_location(button, file$4, 61, 0, 1155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon_1, button, null);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 2) icon_1_changes.name = /*icon*/ ctx[1];
    			icon_1.$set(icon_1_changes);
    			if (!current || dirty & /*text*/ 1) set_data_dev(t1, /*text*/ ctx[0]);

    			if (!current || dirty & /*disabledState*/ 4) {
    				prop_dev(button, "disabled", /*disabledState*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(icon_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { text = "Button Text" } = $$props;
    	let { icon = "drawCard" } = $$props;
    	let { disabledState } = $$props;
    	const writable_props = ["text", "icon", "disabledState"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("disabledState" in $$props) $$invalidate(2, disabledState = $$props.disabledState);
    	};

    	$$self.$capture_state = () => ({ Icon, text, icon, disabledState });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("disabledState" in $$props) $$invalidate(2, disabledState = $$props.disabledState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, icon, disabledState, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { text: 0, icon: 1, disabledState: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*disabledState*/ ctx[2] === undefined && !("disabledState" in props)) {
    			console.warn("<Button> was created without expected prop 'disabledState'");
    		}
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledState() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledState(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.24.1 */
    const file$5 = "src/components/Header.svelte";

    function create_fragment$5(ctx) {
    	let header;
    	let button0;
    	let t0;
    	let h1;
    	let t2;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: { text: "Shuffle", icon: "shuffle" },
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*shuffleClick*/ ctx[0])) /*shuffleClick*/ ctx[0].apply(this, arguments);
    	});

    	button1 = new Button({
    			props: {
    				text: "Draw Card",
    				disabledState: /*deckSpent*/ ctx[2]
    			},
    			$$inline: true
    		});

    	button1.$on("click", function () {
    		if (is_function(/*drawClick*/ ctx[1])) /*drawClick*/ ctx[1].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Critique Cards";
    			t2 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h1, "class", "svelte-1xzm4qo");
    			add_location(h1, file$5, 29, 2, 565);
    			attr_dev(header, "class", "svelte-1xzm4qo");
    			add_location(header, file$5, 27, 0, 485);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(button0, header, null);
    			append_dev(header, t0);
    			append_dev(header, h1);
    			append_dev(header, t2);
    			mount_component(button1, header, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const button1_changes = {};
    			if (dirty & /*deckSpent*/ 4) button1_changes.disabledState = /*deckSpent*/ ctx[2];
    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { shuffleClick } = $$props;
    	let { drawClick } = $$props;
    	let { deckSpent } = $$props;
    	const writable_props = ["shuffleClick", "drawClick", "deckSpent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("shuffleClick" in $$props) $$invalidate(0, shuffleClick = $$props.shuffleClick);
    		if ("drawClick" in $$props) $$invalidate(1, drawClick = $$props.drawClick);
    		if ("deckSpent" in $$props) $$invalidate(2, deckSpent = $$props.deckSpent);
    	};

    	$$self.$capture_state = () => ({
    		shuffleClick,
    		drawClick,
    		deckSpent,
    		Button
    	});

    	$$self.$inject_state = $$props => {
    		if ("shuffleClick" in $$props) $$invalidate(0, shuffleClick = $$props.shuffleClick);
    		if ("drawClick" in $$props) $$invalidate(1, drawClick = $$props.drawClick);
    		if ("deckSpent" in $$props) $$invalidate(2, deckSpent = $$props.deckSpent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shuffleClick, drawClick, deckSpent];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			shuffleClick: 0,
    			drawClick: 1,
    			deckSpent: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*shuffleClick*/ ctx[0] === undefined && !("shuffleClick" in props)) {
    			console.warn("<Header> was created without expected prop 'shuffleClick'");
    		}

    		if (/*drawClick*/ ctx[1] === undefined && !("drawClick" in props)) {
    			console.warn("<Header> was created without expected prop 'drawClick'");
    		}

    		if (/*deckSpent*/ ctx[2] === undefined && !("deckSpent" in props)) {
    			console.warn("<Header> was created without expected prop 'deckSpent'");
    		}
    	}

    	get shuffleClick() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shuffleClick(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drawClick() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set drawClick(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deckSpent() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deckSpent(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Main.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/components/Main.svelte";

    // (22:8) Main Content
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main Content");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(22:8) Main Content",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(main, "class", "svelte-125800e");
    			add_location(main, file$6, 20, 0, 328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Main", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Button });
    	return [$$scope, $$slots];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Link.svelte generated by Svelte v3.24.1 */

    const file$7 = "src/components/Link.svelte";

    function create_fragment$7(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			attr_dev(a, "class", "svelte-9zpzin");
    			add_location(a, file$7, 13, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*href*/ 2) {
    				attr_dev(a, "href", /*href*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { text = "Link Text" } = $$props;
    	let { href = "#" } = $$props;
    	const writable_props = ["text", "href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    	};

    	$$self.$capture_state = () => ({ text, href });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, href];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { text: 0, href: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get text() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.24.1 */
    const file$8 = "src/components/Footer.svelte";

    function create_fragment$8(ctx) {
    	let footer;
    	let p0;
    	let t0;
    	let link0;
    	let t1;
    	let p1;
    	let t2;
    	let link1;
    	let t3;
    	let p2;
    	let t4;
    	let link2;
    	let t5;
    	let link3;
    	let t6;
    	let p3;
    	let t7;
    	let link4;
    	let current;

    	link0 = new Link({
    			props: { text: "Andrew Harvard" },
    			$$inline: true
    		});

    	link1 = new Link({
    			props: { text: "Mikey Allan" },
    			$$inline: true
    		});

    	link2 = new Link({
    			props: { text: "Svelte" },
    			$$inline: true
    		});

    	link3 = new Link({
    			props: { text: "Netlify" },
    			$$inline: true
    		});

    	link4 = new Link({
    			props: { text: "Streamline 3.0" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p0 = element("p");
    			t0 = text("Site by\n    ");
    			create_component(link0.$$.fragment);
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Critique Cards by\n    ");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			p2 = element("p");
    			t4 = text("Built with\n    ");
    			create_component(link2.$$.fragment);
    			t5 = text("\n    Hosted on\n    ");
    			create_component(link3.$$.fragment);
    			t6 = space();
    			p3 = element("p");
    			t7 = text("Icons from\n    ");
    			create_component(link4.$$.fragment);
    			add_location(p0, file$8, 14, 2, 184);
    			add_location(p1, file$8, 18, 2, 244);
    			add_location(p2, file$8, 22, 2, 311);
    			add_location(p3, file$8, 28, 2, 408);
    			attr_dev(footer, "class", "svelte-x9tf4u");
    			add_location(footer, file$8, 13, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p0);
    			append_dev(p0, t0);
    			mount_component(link0, p0, null);
    			append_dev(footer, t1);
    			append_dev(footer, p1);
    			append_dev(p1, t2);
    			mount_component(link1, p1, null);
    			append_dev(footer, t3);
    			append_dev(footer, p2);
    			append_dev(p2, t4);
    			mount_component(link2, p2, null);
    			append_dev(p2, t5);
    			mount_component(link3, p2, null);
    			append_dev(footer, t6);
    			append_dev(footer, p3);
    			append_dev(p3, t7);
    			mount_component(link4, p3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$9 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (66:4) {#if undrawnCards.length > 0}
    function create_if_block$2(ctx) {
    	let cardback;
    	let current;
    	cardback = new CardBack({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cardback.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardback, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardback.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardback.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardback, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(66:4) {#if undrawnCards.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#each drawnCards as card, i (card.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				category: /*card*/ ctx[7].category,
    				question: /*card*/ ctx[7].question,
    				example: /*card*/ ctx[7].example || null,
    				index: /*i*/ ctx[9],
    				id: /*card*/ ctx[7].id,
    				drawn: /*card*/ ctx[7].drawn
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(card.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*drawnCards*/ 4) card_changes.category = /*card*/ ctx[7].category;
    			if (dirty & /*drawnCards*/ 4) card_changes.question = /*card*/ ctx[7].question;
    			if (dirty & /*drawnCards*/ 4) card_changes.example = /*card*/ ctx[7].example || null;
    			if (dirty & /*drawnCards*/ 4) card_changes.index = /*i*/ ctx[9];
    			if (dirty & /*drawnCards*/ 4) card_changes.id = /*card*/ ctx[7].id;
    			if (dirty & /*drawnCards*/ 4) card_changes.drawn = /*card*/ ctx[7].drawn;
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(69:4) {#each drawnCards as card, i (card.id)}",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Main>
    function create_default_slot(ctx) {
    	let div;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*undrawnCards*/ ctx[1].length > 0 && create_if_block$2(ctx);
    	let each_value = /*drawnCards*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*card*/ ctx[7].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "deck svelte-11zq5xg");
    			add_location(div, file$9, 64, 2, 1572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*undrawnCards*/ ctx[1].length > 0) {
    				if (if_block) {
    					if (dirty & /*undrawnCards*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*drawnCards*/ 4) {
    				const each_value = /*drawnCards*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(64:0) <Main>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				shuffleClick: /*shuffleCards*/ ctx[3],
    				drawClick: /*drawCard*/ ctx[4],
    				deckSpent: /*deckSpent*/ ctx[0]
    			},
    			$$inline: true
    		});

    	main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(main.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*deckSpent*/ 1) header_changes.deckSpent = /*deckSpent*/ ctx[0];
    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope, drawnCards, undrawnCards*/ 1030) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let deckPosition = 0;
    	onMount(() => shuffle(deckOfCards));

    	function shuffleCards() {
    		$$invalidate(6, deckOfCards = shuffle(deckOfCards));

    		deckOfCards.forEach(element => {
    			element.drawn = false;
    		});

    		deckPosition = 0;
    		$$invalidate(0, deckSpent = false);
    	}

    	function drawCard() {
    		if (undrawnCards.length > 1) {
    			console.log(deckPosition);
    			$$invalidate(6, deckOfCards[deckPosition].drawn = true, deckOfCards);
    			deckPosition += 1;
    			console.log(deckPosition);
    		} else {
    			$$invalidate(6, deckOfCards[deckPosition].drawn = true, deckOfCards);
    			$$invalidate(0, deckSpent = true);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		shuffle,
    		cardData,
    		Card,
    		CardBack,
    		Header,
    		Main,
    		Footer,
    		deckPosition,
    		shuffleCards,
    		drawCard,
    		deckSpent,
    		deckOfCards,
    		undrawnCards,
    		drawnCards
    	});

    	$$self.$inject_state = $$props => {
    		if ("deckPosition" in $$props) deckPosition = $$props.deckPosition;
    		if ("deckSpent" in $$props) $$invalidate(0, deckSpent = $$props.deckSpent);
    		if ("deckOfCards" in $$props) $$invalidate(6, deckOfCards = $$props.deckOfCards);
    		if ("undrawnCards" in $$props) $$invalidate(1, undrawnCards = $$props.undrawnCards);
    		if ("drawnCards" in $$props) $$invalidate(2, drawnCards = $$props.drawnCards);
    	};

    	let deckSpent;
    	let deckOfCards;
    	let undrawnCards;
    	let drawnCards;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*deckOfCards*/ 64) {
    			 $$invalidate(1, undrawnCards = deckOfCards.filter(card => !card.drawn));
    		}

    		if ($$self.$$.dirty & /*deckOfCards*/ 64) {
    			 $$invalidate(2, drawnCards = deckOfCards.filter(card => card.drawn));
    		}
    	};

    	 $$invalidate(0, deckSpent = false);
    	 $$invalidate(6, deckOfCards = cardData.map((card, index) => ({ ...card, drawn: false, id: index })));
    	return [deckSpent, undrawnCards, drawnCards, shuffleCards, drawCard];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
