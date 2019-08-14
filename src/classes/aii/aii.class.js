var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Aii = (function (_super) {
    __extends(Aii, _super);
    function Aii(origin) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, params) || this;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, Aii);
        }
        _this.name = 'Aii';
        _this.origin = origin;
        _this.date = new Date();
        return _this;
    }
    return Aii;
}(Error));
var NestedErrorThrow = (function () {
    function NestedErrorThrow(lvl) {
        if (lvl === void 0) { lvl = 0; }
        this.maxLvl = 5;
        this.lastLvl = false;
        this.lvl = lvl;
        this.lastLvl = this.lvl === this.maxLvl;
        this.nest();
    }
    NestedErrorThrow.prototype.nest = function () {
        if (!this.lastLvl) {
            this.child = new NestedErrorThrow(this.lvl + 1);
        }
    };
    NestedErrorThrow.prototype.throw = function () {
        if (this.lastLvl) {
            throw new Aii(this, "Error message for level " + this.lvl);
        }
        this.child.throw();
    };
    return NestedErrorThrow;
}());
var thrower = new NestedErrorThrow();
try {
    thrower.throw();
}
catch (error) {
    console.log(error.toString());
    console.log('-------');
    console.log(error.toSource());
    console.log('-------');
    console.log(error);
}
//# sourceMappingURL=aii.class.js.map