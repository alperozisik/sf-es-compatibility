/* 
		You can modify its contents.
*/
const extend = require('js-base/core/extend');

const LviResultsDesign = require('library/LviResults');

const LviResults = extend(LviResultsDesign)(
  //constructor
  function(_super, props, pageName) {
    // initalizes super class for this scope
    _super(this, props || {});
    this.pageName = pageName;
  }

);

module && (module.exports = LviResults);