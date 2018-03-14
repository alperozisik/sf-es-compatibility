function convert(flatTests) {
    flatTests = flatTests.slice(0);
    flatTests.push({});
    var data = [];
    var categoryResults = [];
    var category = flatTests[0].category;
    var categoryNumberOfTests = 0;
    var categoryNumberOfSuccess = 0;
    var totalNumberOfTests = 0;
    var totalNumberOfSucess = 0;
    var i, j, test;
    for (i in flatTests) {
        test = flatTests[i];
        if (category !== test.category) {

            data.push({
                text: '▼\t' + category + "\t(" + categoryNumberOfSuccess + "/" + categoryNumberOfTests + ")",
                style: ".lblValue-title"
            });
            for (j in categoryResults)
                data.push(categoryResults[j]);

            categoryNumberOfTests = 0;
            categoryNumberOfSuccess = 0;
            category = test.category;
            categoryResults.length = 0;
        }

        categoryNumberOfTests++;
        totalNumberOfTests++;
        if (test.result) {
            categoryNumberOfSuccess++;
            totalNumberOfSucess++;
            categoryResults.push({
                text: '✔\t' + test.name,
                style: ".lblValue-success"
            });
        }
        else {
            categoryResults.push({
                text: '✘\t' + test.name,
                style: ".lblValue-failure"
            });
        }
    }
    return {
        successRate: Math.floor((totalNumberOfSucess / totalNumberOfTests) * 100),
        detalils: data
    };
}


module.exports = exports = convert;