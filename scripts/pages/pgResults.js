const extend = require('js-base/core/extend');
const PgResultsDesign = require('ui/ui_pgResults');
const LviResult = require("../components/LviResult");
const addChild = require("@smartface/contx/lib/smartface/action/addChild");
const pushClassNames = require("@smartface/contx/lib/styling/action/pushClassNames");
const removeClassName = require("@smartface/contx/lib/styling/action/removeClassName");
const executeTests = require("../tests/execute").execute;
const convert = require("../tests/convert");
const System = require('sf-core/device/system');

const PgResults = extend(PgResultsDesign)(
  function(_super) {
    _super(this);
    this.onShow = onShow.bind(this, this.onShow.bind(this));
    this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
    const page = this;
    page.data = [];

  });

/**
 * @event onShow
 * This event is called when a page appears on the screen (everytime).
 * @param {function} superOnShow super onShow function
 * @param {Object} parameters passed from Router.go function
 */
function onShow(superOnShow) {
  superOnShow();
  const page = this;
  executeTests(function(err, result) {
    if (err)
      return alert(err);
    
    var data = convert(result);
    console.log(JSON.stringify(data, null, "\t"));
    page.data = data.detalils;
    page.lblSummary.text = "Test Sucess Rate is " + data.successRate + "%";
    page.lblOS.text = System.OS + " " + System.OSVersion;
    page.lvDetails.itemCount = page.data.length;
    page.lvDetails.rowHeight = 40;
    page.lvDetails.refreshData();
    page.flWait.visible = false;
  });
}

/**
 * @event onLoad
 * This event is called once when page is created.
 * @param {function} superOnLoad super onLoad function
 */
function onLoad(superOnLoad) {
  superOnLoad();
  const page = this;
  page.lvDetails.refreshEnabled = false;
  var itemIndex = 0;
  page.lvDetails.onRowCreate = function() {
    var lviResult = new LviResult();
    this.dispatch(addChild(`item${++itemIndex}`, lviResult));
    return lviResult;
  };
  page.lvDetails.onRowBind = function(lviResult, index) {
    var data = page.data[index];
    if (!data)
      return;
    var lblValue = lviResult.lblValue || lviResult.findChildById(1001);
    lblValue.text = data.text;
    lblValue.dispatch(removeClassName(".lblValue-title"));
    lblValue.dispatch(removeClassName(".lblValue-sucess"));
    lblValue.dispatch(removeClassName(".lblValue-failure"));
    lblValue.dispatch(pushClassNames(data.style));
  };


}

module && (module.exports = PgResults);
