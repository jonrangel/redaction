// mongo-redact.js
//
// A mongo shell function to redact sensitive information while 
// retaining the shape of the document.
//
// Jon Rangel, January 2015


function redactValue(val) {
    if (typeof val == "number") {
        if (val === (val|0)) {
            return 999;
        } else {
            return 999.123;
        }
    } else if (val instanceof NumberLong) {
        return new NumberLong(999999);
    } else if (typeof val == "string") {
        var s = "";
        for (var i = 0; i < val.length; i++) {
            s += "X";
        }
        return s;
    } else if (val instanceof Date) {
        // return the same date
    } else if (val instanceof ObjectId) {
        // return the same Object ID
    } else if (val instanceof Array) {
        return redactArray(val);
    } else if (val instanceof Object) {
        return redactDoc(val);
    }

    return val;
}


function redactArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = redactValue(arr[i]);
    }

    return arr;
}


function redactDoc(doc) {
    for (var prop in doc) {
        if (doc.hasOwnProperty(prop)) {
            doc[prop] = redactValue(doc[prop]);
        }
    }

    return doc;
}


function printRedactedDoc(doc) {
    printjson(redactDoc(doc));
}


// override DBQuery.prototype.next() method to allow for automatic redaction
(function() {
    var re = /^\$cmd|^system/;
    var proxied = DBQuery.prototype.next;
    DBQuery.prototype.next = function() {
        var res = proxied.apply(this, arguments);
        if (this._autoRedact && !this._collection.getName().match(re)) {
            res = redactDoc(res);
        }
        return res;
    };
})();


// override DBCommandCursor.prototype.next() method to allow for automatic redaction
(function() {
    var proxied = DBCommandCursor.prototype.next;
    DBCommandCursor.prototype.next = function() {
        var res = proxied.apply(this, arguments);
        if (this._autoRedact) {
            res = redactDoc(res);
        }
        return res;
    };
})();


// enable automatic redaction by default when this script is loaded
DBQuery.prototype._autoRedact = true;
DBCommandCursor.prototype._autoRedact = true;


// enable/disable automatic redaction globally
function setAutoRedaction(value) {
    if (value == undefined) value = true;
    DBQuery.prototype._autoRedact = value;
    DBCommandCursor.prototype._autoRedact = value;
}


// enable/disable redaction on a per query basis
DBQuery.prototype.redact = function(value) {
    if (value == undefined) value = true;
    this._autoRedact = value;
    return this;
};
