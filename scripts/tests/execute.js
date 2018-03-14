/* global Symbol */
var flatTests = require("./flatTests.js");
var index;
global.__script_executed = {};
global.suspendErrors = false;

function execute(callback) {
    var tests = flatTests.create();
    global.suspendErrors = true;
    for (index in tests) {
        tests[index].result = false;
        
        global.test = function test(expression) {
            tests[index].result = tests[index].result || expression;
        };
        global.asyncPassed = function asyncPassed() {
            tests[index].result = true;
        };
        global.__createIterableObject = function(arr, methods) {
            methods = methods || {};
            if (typeof Symbol !== 'function' || !Symbol.iterator)
                return {};
            arr.length++;
            var iterator = {
                next: function() {
                    return { value: arr.shift(), done: arr.length <= 0 };
                },
                'return': methods['return'],
                'throw': methods['throw']
            };
            var iterable = {};
            iterable[Symbol.iterator] = function() { return iterator; };
            return iterable;
        };

        eval(tests[index].script);
    }

    setTimeout(function() {
        global.suspendErrors = false;
        callback && callback(null, tests);
    }, 1000);

}


exports.execute = execute;
