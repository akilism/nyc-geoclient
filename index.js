var fs = require('fs'),
  https = require('https'),
  concat = require('concat-stream');


var geoclient = (function() {
  var TYPE = {
    ADDRESS: '1B',
    BBL: 'BL',
    BIN: 'BN',
    BLOCKFACE: 3,
    INTERSECTION: 2,
    PLACE: '1BP'
  };

  var RESPONSE_TYPE = {
    JSON: 'json',
    XML: 'xml'
  };

  var BOROUGH = {
    MANHATTAN: 'manhattan',
    BRONX: 'bronx',
    BROOKLYN: 'brooklyn',
    QUEENS: 'queens',
    STATEN_ISLAND: 'staten island'
  };

  var DIRECTION = {
    N: 'N',
    S: 'S',
    E: 'E',
    W: 'W',
  };

  var app_id, app_key;

  function MissingValueException(message) {
    this.message = message;
    this.name = "MissingValueException";
  }

  // /v1/address.json?houseNumber=314&street=west 100 st&borough=manhattan&app_id=abc123&app_key=def456
  // /v1/address.xml?houseNumber=109-20&street=71st rd&borough=queens&app_id=abc123&app_key=def456
  var getAddress = function(values, responseType, callBack) {
    if(!values.houseNumber) {
      callBack(new MissingValueException('House Number is Required'));
      return false;
    }

    if(!values.street) {
      callBack(new MissingValueException('Street (Name or 7-Digit Code) is Required'));
      return false;
    }

    if(!values.borough && !values.zip) {
      callBack(new MissingValueException('Either Borough or Zip Code is Required.'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.ADDRESS, values, responseType);
    callApi(apiUrl, callBack);
  };

  // /v1/bbl.json?borough=manhattan&block=1889&lot=1&app_id=abc123&app_key=def456
  // /v1/bbl.xml?borough=manhattan&block=67&lot=1&app_id=abc123&app_key=def456
  var getBbl = function(values, responseType, callBack) {
    if(!values.borough) {
      callBack(new MissingValueException('Borough is Required'));
      return false;
    }

    if(!values.block) {
      callBack(new MissingValueException('Block is Required'));
      return false;
    }

    if(!values.lot) {
      callBack(new MissingValueException('Lot is Required'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.BBL, values, responseType);
    callApi(apiUrl, callBack);
  };

  // /v1/bin.json?bin=1079043&app_id=abc123&app_key=def456
  // /v1/bin.xml?bin=1057127&app_id=abc123&app_key=def456
  var getBin = function(values, responseType, callBack) {
    if(!values.bin) {
      callBack(new MissingValueException('Building Identification Number is Required'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.BIN, values, responseType);
    callApi(apiUrl, callBack);
  };

  // /v1/blockface.json?onStreet=amsterdam ave&crossStreetOne=w 110 st&crossStreetTwo=w 111 st&borough=manhattan&app_id=abc123&app_key=def456
  // /v1/blockface.xml?onStreet=amsterdam ave&crossStreetOne=w 110 st&crossStreetTwo=w 111 st&borough=manhattan&compassDirection=e&app_id=abc123&app_key=def456
  // /v1/blockface.xml?onStreet=eldert ln&crossStreetOne=etna street&crossStreetTwo=ridgewood ave&borough=queens&boroughCrossStreetOne=brooklyn&boughCrossStreetTwo=brooklyn&compassDirection=e&app_id=abc123&app_key=def456
  var getBlockface = function(values, responseType, callBack) {
    if(!values.onStreet) {
      callBack(new MissingValueException('"On street" (Street name of target blockface) is Required'));
      return false;
    }

    if(!values.crossStreetOne) {
      callBack(new MissingValueException('1st Cross Street of Blockface is Required'));
      return false;
    }

    if(!values.crossStreetTwo) {
      callBack(new MissingValueException('2nd Cross Street of Blockface is Required'));
      return false;
    }

    if(!values.borough) {
      callBack(new MissingValueException('Borough is Required'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.BLOCKFACE, values, responseType);
    callApi(apiUrl, callBack);
  };

  // /v1/intersection.json?crossStreetOne=broadway&crossStreetTwo=w 99 st&borough=manhattan&app_id=abc123&app_key=def456
  // /v1/intersection.xml?crossStreetOne=rsd&crossStreetTwo=w 97 st&borough=manhattan&compassDirection=e&app_id=abc123&app_key=def456
  // /v1/intersection.json?crossStreetOne=jamaica ave&crossStreetTwo=eldert ln&borough=brooklyn&boroughCrossStreetTwo=queens&app_id=abc123&app_key=def456
  var getIntersection = function(values, responseType, callBack) {
    if(!values.crossStreetOne) {
      callBack(new MissingValueException('1st Cross Street is Required'));
      return false;
    }

    if(!values.crossStreetTwo) {
      callBack(new MissingValueException('2nd Cross Street is Required'));
      return false;
    }

    if(!values.borough) {
      callBack(new MissingValueException('Borough is Required'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.INTERSECTION, values, responseType);
    callApi(apiUrl, callBack);
  };

  // /v1/place.json?name=empire state building&borough=manhattan&app_id=abc123&app_key=def456
  // /v1/place.xml?name=rfk bridge&borough=queens&app_id=abc123&app_key=def456
  var getPlace = function(values, responseType, callBack) {
    if(!values.name) {
      callBack(new MissingValueException('Place Name is Required'));
      return false;
    }

    if(!values.borough && !values.zip) {
      callBack(new MissingValueException('Either Borough or Zip Code is Required.'));
      return false;
    }

    var apiUrl = buildApiUrl(TYPE.PLACE, values, responseType);
    callApi(apiUrl, callBack);
  };

  var buildAddressUrl = function(values, responseType) {
    var url = [];
    url.push('address.', responseType,
      '?houseNumber=', values.houseNumber,
      '&street=', values.street);

    if(values.borough) {
      url.push('&borough=', values.borough);
    } else {
      url.push('&zip=', values.zip);
    }

    return url;
  };

  var buildBblUrl = function(values, responseType) {
    var url = [];
    url.push('bbl.', responseType,
      '?borough=', values.borough,
      '&block=', values.block,
      '&lot=', values.lot);
    return url;
  };

  var buildBinUrl = function(values, responseType) {
    var url = [];
    url.push('bin.', responseType, '?bin=', values.bin);
    return url;
  };

  var buildBlockfaceUrl = function(values, responseType) {
    var url = [];
    url.push('blockface.', responseType,
      '?onStreet=', values.onStreet,
      '&crossStreetOne=', values.crossStreetOne,
      '&crossStreetTwo=', values.crossStreetTwo,
      '&borough=', values.borough);

    if(values.boroughCrossStreetOne) {
      url.push('&boroughCrossStreetOne=', values.boroughCrossStreetOne);
    }

    if(values.boroughCrossStreetTwo) {
      url.push('&boroughCrossStreetTwo=', values.boroughCrossStreetTwo);
    }

    if(values.compassDirection) {
      url.push('&compassDirection=', values.compassDirection);
    }

    return url;
  };

  var buildIntersectionUrl = function(values, responseType) {
    var url = [];
    url.push('intersection.', responseType,
      '?crossStreetOne=', values.crossStreetOne,
      '&crossStreetTwo=', values.crossStreetTwo,
      '&borough=', values.borough);

    if(values.boroughCrossStreetTwo) {
      url.push('&boroughCrossStreetTwo=', values.boroughCrossStreetTwo);
    }

    if(values.compassDirection) {
      url.push('&compassDirection=', values.compassDirection);
    }

    return url;
  };

  var buildPlaceUrl = function(values, responseType) {
    var url = [];
    url.push('place.', responseType,
      '?name=', values.name);

    if(values.borough) {
      url.push('&borough=', values.borough);
    } else {
      url.push('&zip=', values.zip);
    }

    return url;
  };

  var buildApiUrl = function(type, values, responseType) {
    responseType = responseType || RESPONSE_TYPE.JSON;
    var url = ['https://api.cityofnewyork.us/geoclient/', 'v1/'];

    switch (type) {
      case TYPE.ADDRESS:
        url = url.concat(buildAddressUrl(values, responseType));
        break;
      case TYPE.BBL:
        url = url.concat(buildBblUrl(values, responseType));
        break;
      case TYPE.BIN:
        url = url.concat(buildBinUrl(values, responseType));
        break;
      case TYPE.BLOCKFACE:
        url = url.concat(buildBlockfaceUrl(values, responseType));
        break;
      case TYPE.INTERSECTION:
        url = url.concat(buildIntersectionUrl(values, responseType));
        break;
      case TYPE.PLACE:
        url = url.concat(buildPlaceUrl(values, responseType));
        break;
      default:
        return '';
    }

    url.push('&app_id=', app_id, '&app_key=', app_key);
    var re = /%%/g;
    return url.join('%%').replace(re,'');
  };

  var callApi = function(url, callBack) {
    console.log('requesting', url);
    https.get(url, function(res) {
      res.pipe(concat(function (data) { callBack(null, data.toString()); }));
    }).on('error', function(err) {
      callBack(err);
    });
  };

  return {
    setApi: function(appKey, appId) {
      /*
        appKey: Required
        appId: Required
      */
      app_id = appId;
      app_key = appKey;
    },
    address: function(houseNumber, street, borough, zip, responseType, callBack) {
      /*
        houseNumber: Required
        street: Required
        borough: BOROUGH Must supply either borough or zip.
        zip: Must supply either borough or zip.
        responseType: RESPONSE_TYPE Optional
      */
      return getAddress({ houseNumber: houseNumber,
        street: street,
        borough: borough,
        zip: zip }, responseType, callBack)
    },
    bbl: function(borough, block, lot, responseType, callBack) {
      /*
        borough: BOROUGH Required
        block: Required
        lot: Required
        responseType: RESPONSE_TYPE Optional
      */
      return getBbl({ borough : borough,
        block: block,
        lot: lot }, responseType, callBack);
    },
    bin: function(bin, responseType, callBack) {
      /*
        bin: Required
        responseType: RESPONSE_TYPE Optional
      */
      return getBin({ bin: bin }, responseType, callBack);
    },
    blockface: function(onStreet, crossStreetOne, crossStreetTwo, borough, boroughCrossStreetOne, boroughCrossStreetTwo, compassDirection, responseType, callBack) {
      /*
        onStreet: Required
        crossStreetOne: Required
        crossStreetTwo: Required
        borough: BOROUGH Required
        boroughCrossStreetOne: BOROUGH Optional
        boroughCrossStreetTwo: BOROUGH Optional
        compassDirection: DIRECTION Optional
        responseType: RESPONSE_TYPE Optional
      */
      return getBlockface({ onStreet: onStreet,
        crossStreetOne: crossStreetOne,
        crossStreetTwo: crossStreetTwo,
        borough: borough,
        boroughCrossStreetOne: boroughCrossStreetOne,
        boroughCrossStreetTwo: boroughCrossStreetTwo,
        compassDirection: compassDirection }, responseType, callBack);
    },
    intersection: function(crossStreetOne, crossStreetTwo, borough, boroughCrossStreetTwo, compassDirection, responseType, callBack) {
      /*
        crossStreetOne: Required
        crossStreetTwo: Required
        borough: BOROUGH Required
        boroughCrossStreetTwo:BOROUGH Optional
        compassDirection: DIRECTION Optional
        responseType: RESPONSE_TYPE Optional
      */
      return getIntersection({ crossStreetOne: crossStreetOne,
        crossStreetTwo: crossStreetTwo,
        borough: borough,
        boughCrossStreetTwo: boroughCrossStreetTwo,
        compassDirection: compassDirection }, responseType, callBack);
    },
    place: function(name, borough, zip, responseType, callBack) {
      /*
        name: Required
        borough: BOROUGH Must supply either borough or zip.
        zip: Must supply either borough or zip.
        responseType: RESPONSE_TYPE
      */
      return getPlace({ name: name,
        borough: borough,
        zip: zip }, responseType, callBack);
    },
    BOROUGH: BOROUGH,
    DIRECTION: DIRECTION,
    RESPONSE_TYPE: RESPONSE_TYPE,
    TYPE: TYPE
  };
})();

module.exports = geoclient;
