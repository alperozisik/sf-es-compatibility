var tests = require("./tests.json");

function create() {
    var flatTests = [];
    var category, categoryTests, i, test;
    for (category in tests) {
        categoryTests = tests[category];
        for (i in categoryTests) {
            test = categoryTests[i];
            flatTests.push({
                category: category,
                name: test.name,
                script: test.script
            });
        }
    }
    return flatTests;
}


exports.create = create;
