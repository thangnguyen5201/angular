'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var interfaces_1 = require('../interfaces');
var enums_1 = require('../enums');
var static_response_1 = require('../static_response');
var base_response_options_1 = require('../base_response_options');
var core_1 = require('angular2/core');
var browser_jsonp_1 = require('./browser_jsonp');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var Observable_1 = require('rxjs/Observable');
var JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
var JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';
var JSONPConnection = (function () {
    function JSONPConnection() {
    }
    return JSONPConnection;
})();
exports.JSONPConnection = JSONPConnection;
var JSONPConnection_ = (function (_super) {
    __extends(JSONPConnection_, _super);
    function JSONPConnection_(req, _dom, baseResponseOptions) {
        var _this = this;
        _super.call(this);
        this._dom = _dom;
        this.baseResponseOptions = baseResponseOptions;
        this._finished = false;
        if (req.method !== enums_1.RequestMethod.Get) {
            throw exceptions_1.makeTypeError(JSONP_ERR_WRONG_METHOD);
        }
        this.request = req;
        this.response = new Observable_1.Observable(function (responseObserver) {
            _this.readyState = enums_1.ReadyState.Loading;
            var id = _this._id = _dom.nextRequestID();
            _dom.exposeConnection(id, _this);
            // Workaround Dart
            // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
            var callback = _dom.requestCallback(_this._id);
            var url = req.url;
            if (url.indexOf('=JSONP_CALLBACK&') > -1) {
                url = lang_1.StringWrapper.replace(url, '=JSONP_CALLBACK&', "=" + callback + "&");
            }
            else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
                url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + ("=" + callback);
            }
            var script = _this._script = _dom.build(url);
            var onLoad = function (event) {
                if (_this.readyState === enums_1.ReadyState.Cancelled)
                    return;
                _this.readyState = enums_1.ReadyState.Done;
                _dom.cleanup(script);
                if (!_this._finished) {
                    var responseOptions_1 = new base_response_options_1.ResponseOptions({ body: JSONP_ERR_NO_CALLBACK, type: enums_1.ResponseType.Error, url: url });
                    if (lang_1.isPresent(baseResponseOptions)) {
                        responseOptions_1 = baseResponseOptions.merge(responseOptions_1);
                    }
                    responseObserver.error(new static_response_1.Response(responseOptions_1));
                    return;
                }
                var responseOptions = new base_response_options_1.ResponseOptions({ body: _this._responseData, url: url });
                if (lang_1.isPresent(_this.baseResponseOptions)) {
                    responseOptions = _this.baseResponseOptions.merge(responseOptions);
                }
                responseObserver.next(new static_response_1.Response(responseOptions));
                responseObserver.complete();
            };
            var onError = function (error) {
                if (_this.readyState === enums_1.ReadyState.Cancelled)
                    return;
                _this.readyState = enums_1.ReadyState.Done;
                _dom.cleanup(script);
                var responseOptions = new base_response_options_1.ResponseOptions({ body: error.message, type: enums_1.ResponseType.Error });
                if (lang_1.isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                responseObserver.error(new static_response_1.Response(responseOptions));
            };
            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);
            _dom.send(script);
            return function () {
                _this.readyState = enums_1.ReadyState.Cancelled;
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                if (lang_1.isPresent(script)) {
                    _this._dom.cleanup(script);
                }
            };
        });
    }
    JSONPConnection_.prototype.finished = function (data) {
        // Don't leak connections
        this._finished = true;
        this._dom.removeConnection(this._id);
        if (this.readyState === enums_1.ReadyState.Cancelled)
            return;
        this._responseData = data;
    };
    return JSONPConnection_;
})(JSONPConnection);
exports.JSONPConnection_ = JSONPConnection_;
var JSONPBackend = (function (_super) {
    __extends(JSONPBackend, _super);
    function JSONPBackend() {
        _super.apply(this, arguments);
    }
    return JSONPBackend;
})(interfaces_1.ConnectionBackend);
exports.JSONPBackend = JSONPBackend;
var JSONPBackend_ = (function (_super) {
    __extends(JSONPBackend_, _super);
    function JSONPBackend_(_browserJSONP, _baseResponseOptions) {
        _super.call(this);
        this._browserJSONP = _browserJSONP;
        this._baseResponseOptions = _baseResponseOptions;
    }
    JSONPBackend_.prototype.createConnection = function (request) {
        return new JSONPConnection_(request, this._browserJSONP, this._baseResponseOptions);
    };
    JSONPBackend_ = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [browser_jsonp_1.BrowserJsonp, base_response_options_1.ResponseOptions])
    ], JSONPBackend_);
    return JSONPBackend_;
})(JSONPBackend);
exports.JSONPBackend_ = JSONPBackend_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnBfYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2pzb25wX2JhY2tlbmQudHMiXSwibmFtZXMiOlsiSlNPTlBDb25uZWN0aW9uIiwiSlNPTlBDb25uZWN0aW9uLmNvbnN0cnVjdG9yIiwiSlNPTlBDb25uZWN0aW9uXyIsIkpTT05QQ29ubmVjdGlvbl8uY29uc3RydWN0b3IiLCJKU09OUENvbm5lY3Rpb25fLmZpbmlzaGVkIiwiSlNPTlBCYWNrZW5kIiwiSlNPTlBCYWNrZW5kLmNvbnN0cnVjdG9yIiwiSlNPTlBCYWNrZW5kXyIsIkpTT05QQmFja2VuZF8uY29uc3RydWN0b3IiLCJKU09OUEJhY2tlbmRfLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTRDLGVBQWUsQ0FBQyxDQUFBO0FBQzVELHNCQUFzRCxVQUFVLENBQUMsQ0FBQTtBQUVqRSxnQ0FBdUIsb0JBQW9CLENBQUMsQ0FBQTtBQUM1QyxzQ0FBbUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RSxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFDekMsOEJBQTJCLGlCQUFpQixDQUFDLENBQUE7QUFDN0MsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsMkJBQXlCLGlCQUFpQixDQUFDLENBQUE7QUFFM0MsSUFBTSxxQkFBcUIsR0FBRyxnREFBZ0QsQ0FBQztBQUMvRSxJQUFNLHNCQUFzQixHQUFHLDZDQUE2QyxDQUFDO0FBRTdFO0lBQUFBO0lBS0FDLENBQUNBO0lBQURELHNCQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFMcUIsdUJBQWUsa0JBS3BDLENBQUE7QUFFRDtJQUFzQ0Usb0NBQWVBO0lBTW5EQSwwQkFBWUEsR0FBWUEsRUFBVUEsSUFBa0JBLEVBQ2hDQSxtQkFBcUNBO1FBUDNEQyxpQkEwRkNBO1FBbEZHQSxp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QUFlQSxHQUFHQSxJQUFJQSx1Q0FBZUEsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsRUFBRUEsb0JBQVlBLENBQUNBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBO2dCQUMzRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25DQSxlQUFlQSxHQUFHQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO2dCQUMvREEsQ0FBQ0E7Z0JBQ0RBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsMEJBQVFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hEQSxDQUFDQSxDQUFDQTtZQUVGQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3hDQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1lBRTFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUVsQkEsTUFBTUEsQ0FBQ0E7Z0JBQ0xBLEtBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxTQUFTQSxDQUFDQTtnQkFDdkNBLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxNQUFNQSxDQUFDQSxtQkFBbUJBLENBQUNBLE9BQU9BLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO2dCQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN0QkEsS0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxDQUFDQTtZQUVIQSxDQUFDQSxDQUFDQTtRQUNKQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVERCxtQ0FBUUEsR0FBUkEsVUFBU0EsSUFBVUE7UUFDakJFLHlCQUF5QkE7UUFDekJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3JDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxLQUFLQSxrQkFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDckRBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUNIRix1QkFBQ0E7QUFBREEsQ0FBQ0EsQUExRkQsRUFBc0MsZUFBZSxFQTBGcEQ7QUExRlksd0JBQWdCLG1CQTBGNUIsQ0FBQTtBQUVEO0lBQTJDRyxnQ0FBaUJBO0lBQTVEQTtRQUEyQ0MsOEJBQWlCQTtJQUFFQSxDQUFDQTtJQUFERCxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFBL0QsRUFBMkMsOEJBQWlCLEVBQUc7QUFBekMsb0JBQVksZUFBNkIsQ0FBQTtBQUUvRDtJQUNtQ0UsaUNBQVlBO0lBQzdDQSx1QkFBb0JBLGFBQTJCQSxFQUFVQSxvQkFBcUNBO1FBQzVGQyxpQkFBT0EsQ0FBQ0E7UUFEVUEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWNBO1FBQVVBLHlCQUFvQkEsR0FBcEJBLG9CQUFvQkEsQ0FBaUJBO0lBRTlGQSxDQUFDQTtJQUVERCx3Q0FBZ0JBLEdBQWhCQSxVQUFpQkEsT0FBZ0JBO1FBQy9CRSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBZ0JBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBUkhGO1FBQUNBLGlCQUFVQSxFQUFFQTs7c0JBU1pBO0lBQURBLG9CQUFDQTtBQUFEQSxDQUFDQSxBQVRELEVBQ21DLFlBQVksRUFROUM7QUFSWSxxQkFBYSxnQkFRekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29ubmVjdGlvbkJhY2tlbmQsIENvbm5lY3Rpb259IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtSZWFkeVN0YXRlLCBSZXF1ZXN0TWV0aG9kLCBSZXNwb25zZVR5cGV9IGZyb20gJy4uL2VudW1zJztcbmltcG9ydCB7UmVxdWVzdH0gZnJvbSAnLi4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi4vc3RhdGljX3Jlc3BvbnNlJztcbmltcG9ydCB7UmVzcG9uc2VPcHRpb25zLCBCYXNlUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuLi9iYXNlX3Jlc3BvbnNlX29wdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QnJvd3Nlckpzb25wfSBmcm9tICcuL2Jyb3dzZXJfanNvbnAnO1xuaW1wb3J0IHttYWtlVHlwZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5cbmNvbnN0IEpTT05QX0VSUl9OT19DQUxMQkFDSyA9ICdKU09OUCBpbmplY3RlZCBzY3JpcHQgZGlkIG5vdCBpbnZva2UgY2FsbGJhY2suJztcbmNvbnN0IEpTT05QX0VSUl9XUk9OR19NRVRIT0QgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgR0VUIHJlcXVlc3QgbWV0aG9kLic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKU09OUENvbm5lY3Rpb24gaW1wbGVtZW50cyBDb25uZWN0aW9uIHtcbiAgcmVhZHlTdGF0ZTogUmVhZHlTdGF0ZTtcbiAgcmVxdWVzdDogUmVxdWVzdDtcbiAgcmVzcG9uc2U6IE9ic2VydmFibGU8UmVzcG9uc2U+O1xuICBhYnN0cmFjdCBmaW5pc2hlZChkYXRhPzogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEpTT05QQ29ubmVjdGlvbl8gZXh0ZW5kcyBKU09OUENvbm5lY3Rpb24ge1xuICBwcml2YXRlIF9pZDogc3RyaW5nO1xuICBwcml2YXRlIF9zY3JpcHQ6IEVsZW1lbnQ7XG4gIHByaXZhdGUgX3Jlc3BvbnNlRGF0YTogYW55O1xuICBwcml2YXRlIF9maW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHJlcTogUmVxdWVzdCwgcHJpdmF0ZSBfZG9tOiBCcm93c2VySnNvbnAsXG4gICAgICAgICAgICAgIHByaXZhdGUgYmFzZVJlc3BvbnNlT3B0aW9ucz86IFJlc3BvbnNlT3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHJlcS5tZXRob2QgIT09IFJlcXVlc3RNZXRob2QuR2V0KSB7XG4gICAgICB0aHJvdyBtYWtlVHlwZUVycm9yKEpTT05QX0VSUl9XUk9OR19NRVRIT0QpO1xuICAgIH1cbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gICAgdGhpcy5yZXNwb25zZSA9IG5ldyBPYnNlcnZhYmxlKHJlc3BvbnNlT2JzZXJ2ZXIgPT4ge1xuXG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkxvYWRpbmc7XG4gICAgICBsZXQgaWQgPSB0aGlzLl9pZCA9IF9kb20ubmV4dFJlcXVlc3RJRCgpO1xuXG4gICAgICBfZG9tLmV4cG9zZUNvbm5lY3Rpb24oaWQsIHRoaXMpO1xuXG4gICAgICAvLyBXb3JrYXJvdW5kIERhcnRcbiAgICAgIC8vIHVybCA9IHVybC5yZXBsYWNlKC89SlNPTlBfQ0FMTEJBQ0soJnwkKS8sIGBnZW5lcmF0ZWQgbWV0aG9kYCk7XG4gICAgICBsZXQgY2FsbGJhY2sgPSBfZG9tLnJlcXVlc3RDYWxsYmFjayh0aGlzLl9pZCk7XG4gICAgICBsZXQgdXJsOiBzdHJpbmcgPSByZXEudXJsO1xuICAgICAgaWYgKHVybC5pbmRleE9mKCc9SlNPTlBfQ0FMTEJBQ0smJykgPiAtMSkge1xuICAgICAgICB1cmwgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UodXJsLCAnPUpTT05QX0NBTExCQUNLJicsIGA9JHtjYWxsYmFja30mYCk7XG4gICAgICB9IGVsc2UgaWYgKHVybC5sYXN0SW5kZXhPZignPUpTT05QX0NBTExCQUNLJykgPT09IHVybC5sZW5ndGggLSAnPUpTT05QX0NBTExCQUNLJy5sZW5ndGgpIHtcbiAgICAgICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCB1cmwubGVuZ3RoIC0gJz1KU09OUF9DQUxMQkFDSycubGVuZ3RoKSArIGA9JHtjYWxsYmFja31gO1xuICAgICAgfVxuXG4gICAgICBsZXQgc2NyaXB0ID0gdGhpcy5fc2NyaXB0ID0gX2RvbS5idWlsZCh1cmwpO1xuXG4gICAgICBsZXQgb25Mb2FkID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBSZWFkeVN0YXRlLkNhbmNlbGxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgICAgIF9kb20uY2xlYW51cChzY3JpcHQpO1xuICAgICAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XG4gICAgICAgICAgbGV0IHJlc3BvbnNlT3B0aW9ucyA9XG4gICAgICAgICAgICAgIG5ldyBSZXNwb25zZU9wdGlvbnMoe2JvZHk6IEpTT05QX0VSUl9OT19DQUxMQkFDSywgdHlwZTogUmVzcG9uc2VUeXBlLkVycm9yLCB1cmx9KTtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGJhc2VSZXNwb25zZU9wdGlvbnMpKSB7XG4gICAgICAgICAgICByZXNwb25zZU9wdGlvbnMgPSBiYXNlUmVzcG9uc2VPcHRpb25zLm1lcmdlKHJlc3BvbnNlT3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3BvbnNlT2JzZXJ2ZXIuZXJyb3IobmV3IFJlc3BvbnNlKHJlc3BvbnNlT3B0aW9ucykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXNwb25zZU9wdGlvbnMgPSBuZXcgUmVzcG9uc2VPcHRpb25zKHtib2R5OiB0aGlzLl9yZXNwb25zZURhdGEsIHVybH0pO1xuICAgICAgICBpZiAoaXNQcmVzZW50KHRoaXMuYmFzZVJlc3BvbnNlT3B0aW9ucykpIHtcbiAgICAgICAgICByZXNwb25zZU9wdGlvbnMgPSB0aGlzLmJhc2VSZXNwb25zZU9wdGlvbnMubWVyZ2UocmVzcG9uc2VPcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3BvbnNlT2JzZXJ2ZXIubmV4dChuZXcgUmVzcG9uc2UocmVzcG9uc2VPcHRpb25zKSk7XG4gICAgICAgIHJlc3BvbnNlT2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH07XG5cbiAgICAgIGxldCBvbkVycm9yID0gZXJyb3IgPT4ge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBSZWFkeVN0YXRlLkNhbmNlbGxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgICAgIF9kb20uY2xlYW51cChzY3JpcHQpO1xuICAgICAgICBsZXQgcmVzcG9uc2VPcHRpb25zID0gbmV3IFJlc3BvbnNlT3B0aW9ucyh7Ym9keTogZXJyb3IubWVzc2FnZSwgdHlwZTogUmVzcG9uc2VUeXBlLkVycm9yfSk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoYmFzZVJlc3BvbnNlT3B0aW9ucykpIHtcbiAgICAgICAgICByZXNwb25zZU9wdGlvbnMgPSBiYXNlUmVzcG9uc2VPcHRpb25zLm1lcmdlKHJlc3BvbnNlT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2VPYnNlcnZlci5lcnJvcihuZXcgUmVzcG9uc2UocmVzcG9uc2VPcHRpb25zKSk7XG4gICAgICB9O1xuXG4gICAgICBzY3JpcHQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICBzY3JpcHQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcblxuICAgICAgX2RvbS5zZW5kKHNjcmlwdCk7XG5cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuQ2FuY2VsbGVkO1xuICAgICAgICBzY3JpcHQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIHNjcmlwdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoaXNQcmVzZW50KHNjcmlwdCkpIHtcbiAgICAgICAgICB0aGlzLl9kb20uY2xlYW51cChzY3JpcHQpO1xuICAgICAgICB9XG5cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmaW5pc2hlZChkYXRhPzogYW55KSB7XG4gICAgLy8gRG9uJ3QgbGVhayBjb25uZWN0aW9uc1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9kb20ucmVtb3ZlQ29ubmVjdGlvbih0aGlzLl9pZCk7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5DYW5jZWxsZWQpIHJldHVybjtcbiAgICB0aGlzLl9yZXNwb25zZURhdGEgPSBkYXRhO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKU09OUEJhY2tlbmQgZXh0ZW5kcyBDb25uZWN0aW9uQmFja2VuZCB7fVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSlNPTlBCYWNrZW5kXyBleHRlbmRzIEpTT05QQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2Jyb3dzZXJKU09OUDogQnJvd3Nlckpzb25wLCBwcml2YXRlIF9iYXNlUmVzcG9uc2VPcHRpb25zOiBSZXNwb25zZU9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXF1ZXN0OiBSZXF1ZXN0KTogSlNPTlBDb25uZWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IEpTT05QQ29ubmVjdGlvbl8ocmVxdWVzdCwgdGhpcy5fYnJvd3NlckpTT05QLCB0aGlzLl9iYXNlUmVzcG9uc2VPcHRpb25zKTtcbiAgfVxufVxuIl19