// mongo-redact.js
//
// A mongo shell function to redact sensitive information while 
// retaining the shape of the document.
//
// Jon Rangel, January 2015


// Note:
// - ints and floats are replaced with 999
// - longs are replaced with the original value times a random value
// - strings are replaced with a random string of the same length


function redactValue(val) {
    var randomVal = Math.random();
    if (typeof val == "number") {
        if (val === (val|0)) {
            return 999;
        } else {
            return 999.123;
        }
    } else if (val instanceof NumberLong) {
        return new NumberLong(val * randomVal);
    } else if (typeof val == "string") {
        var s = "";
        s = randomVal.toString(36).substr(2, val.length);
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
