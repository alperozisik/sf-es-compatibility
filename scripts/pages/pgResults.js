const extend = require('js-base/core/extend');
const PgResultsDesign = require('ui/ui_pgResults');
const LviResult = require("../components/LviResult");
const addChild = require("@smartface/contx/lib/smartface/action/addChild");
const pushClassNames = require("@smartface/contx/lib/styling/action/pushClassNames");
const removeClassName = require("@smartface/contx/lib/styling/action/removeClassName");
const executeTests = require("../tests/execute").execute;
const convert = require("../tests/convert");
const System = require('sf-core/device/system');
const Color = require('sf-core/ui/color');
const RED_COLOR = Color.create(208, 2, 27);
const GREEN_COLOR = Color.create(65, 117, 5);
const Font = require('sf-core/ui/font');
const NORMAL_FONT = Font.create(Font.DEFAULT, 16, Font.NORMAL);
const BOLD_FONT = Font.create(Font.DEFAULT, 16, Font.BOLD);
const HeaderBarItem = require('sf-core/ui/headerbaritem');
const fullResultsService = require("../services/fullResults");

const PgResults = extend(PgResultsDesign)(
  function(_super) {
    _super(this);
    this.onShow = onShow.bind(this, this.onShow.bind(this));
    this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
    const page = this;
    page.data = [];
    page.isFiltered = false;

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
  page.headerBar.leftItemEnabled = false;
  executeTests(function(err, result) {
    if (err)
      return alert(err);
    page.hbiSend.enabled = true;
    page.hbiFilter.enabled = true;
    page.result = result;
    console.log("test");
    var data = convert(result);
    //console.log(JSON.stringify(data, null, "\t"));
    page.data = data.detalils;
    page.unfilteredData = data.detalils;
    page.lblSummary.text = "Test Sucess Rate is " + data.successRate + "%";
    page.successRate = data.successRate;
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
    // lblValue.dispatch(removeClassName(".lblValue-title"));
    // lblValue.dispatch(removeClassName(".lblValue-sucess"));
    // lblValue.dispatch(removeClassName(".lblValue-failure"));
    // lblValue.dispatch(pushClassNames(data.style));


    lblValue.marginLeft = data.style === ".lblValue-title" ? 10 : 40;
    switch (data.style) {
      case ".lblValue-success":
        lblValue.font = NORMAL_FONT;
        lblValue.textColor = GREEN_COLOR;
        break;
      case ".lblValue-failure":
        lblValue.font = NORMAL_FONT;
        lblValue.textColor = RED_COLOR;
        break;
      case ".lblValue-title":
        lblValue.font = BOLD_FONT;
        lblValue.textColor = Color.BLACK;
        break;
      default:
        lblValue.textColor = Color.BLUE;
    }



  };

  var hbiSend = page.hbiSend = new HeaderBarItem({
    title: "Send",
    color: Color.BLACK,
    enabled: false,
    onPress: function() {
      hbiSend.enabled = false;
      var progress = alert({ message: "Sending results", buttons: [] });
      fullResultsService.create({
        fullResult: page.result,
        successRate: page.successRate,
        OS: System.OS + " " + System.OSVersion
      }, function(err, data) {
        try {
          progress.dismiss();
        }
        catch (ex) {
          console.log(Object.keys(progress).sort().join("\n"));
        }
        if (!err) {
          alert("Results are sent to server succesfuly", "Send Success");
        }
        else {
          alert(JSON.stringify(err, null, "\t"), "Send Error");
          hbiSend.enabled = true;
        }
      });
    }
  });
  var hbiFilter = page.hbiFilter = new HeaderBarItem({
    title: "Filter",
    enabled: false,
    color: Color.BLACK,
    onPress: function() {
      if (!page.filtered) {
        var data = [],
          i, test;
        for (i in page.data) {
          test = page.data[i];
          if (test.style !== ".lblValue-success") {
            if (test.style === ".lblValue-title" && data[data.length - 1] && data[data.length - 1].style === ".lblValue-title") {
              data.pop();
            }
            data.push(test);
          }
        }
        if (data[data.length - 1] && data[data.length - 1].style === ".lblValue-title")
          data.pop();
        page.data = data;
      }
      else {
        page.data = page.unfilteredData;
      }
      page.filtered = !page.filtered;
      page.lvDetails.itemCount = page.data.length;
      page.lvDetails.refreshData();
    }
  });

  this.headerBar.setItems([hbiSend, hbiFilter]);

}

module && (module.exports = PgResults);
