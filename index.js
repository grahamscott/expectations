(function(root, factory) {
    'use strict';
    var AssertionError = function(options){
        this.message = options.message;
    };
    // Set up Backbone appropriately for the environment.
    if (typeof exports !== 'undefined') {
        // Node/CommonJS, no need for jQuery in that case.
        factory(root, require('assert').AssertionError);
    } else if (typeof window.define === 'function' && window.define.amd) {
        // AMD
        window.define('expect', [], function() {
            factory(root, AssertionError);
        });
    } else {
        // Browser globals
        root.expect = factory(root, AssertionError);
    }
})(this, function(root, AssertionError) {
    'use strict';
    var assertions = {
        pass: function(message){
        },
        fail: function(message){
            throw new AssertionError({message: message});
        }
    };

    function formatValue(value, ignoreUndefined){
        if(typeof value === 'undefined'){
            return ignoreUndefined ? '' : 'undefined';
        }
        if(typeof value === 'function'){
            return 'function ' + value.name + '(){}';
        }
        if(typeof value === 'string'){
            return "'" + value + "'";
        }
        if(typeof value === 'object'){
            return JSON.stringify(value);
        }
        return value.toString();
    }

    /*
     * Formats an expectation string - "expected [value] [expr] [toDo] [otherVal]"
     *
     * value: The value that was passed into Expect
     * expr: An optional expression to pivot on, eg "not"
     * toDo: What the value was expected to do - eg "to equal", "to be defined" etc
     * otherVal: Optionally give the value you're comparing against at the end of the message
    **/
    function expectation(value, expr, toDo, otherVal){
        return ('expected ' + formatValue(value) + ' ' + expr + toDo + ' ' + formatValue(otherVal, true)).replace(/\s\s/g, ' ').replace(/(^\s|\s$)/g, '');
    }

    function Expect(value, assertions, expr, parent){
        var self = this;
        expr = expr || '';
        this.assertions = assertions;
        this.expectation = expectation;
        this.toEqual = function(val){
            var message = expectation(value, expr, 'to equal', val);
            if(value !== val){
                return assertions.fail(message);
            }
            assertions.pass(message);
        };
        this.toBeTruthy = function(val){
            var message = expectation(value, expr, 'to be truthy');
            if(!!value){
                return assertions.pass(message);
            }
            this.assertions.fail(message);
        };
        this.toBeGreaterThan = function(val){
            var message = expectation(value, expr, 'to be greater than', val);
            if(value > val){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toContain = function(val){
            var message = expectation(value, expr, 'to contain', val);
            if(value.indexOf(val) > -1){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toBeDefined = function(){
            var message = expectation(value, expr, 'to be defined');
            if(typeof value !== 'undefined'){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toThrow = function(){
            var message = expectation(value, expr, 'to throw an exception');
            try{
                value();
                return assertions.pass(message);
            }catch(e){
                assertions.fail(message);
            }
        };
        this.not = parent || new Expect(value, {
            fail: assertions.pass,
            pass: assertions.fail
        }, 'not ', this);
    }

    global.expect = function(value){
        return new Expect(value, assertions);
    };
    global.expect.assertions = assertions;
});