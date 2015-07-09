'use strict';

/**
 * @description
 * A tool that downloads a given number of pug images to the directory where it is run.
 *
 * @example
 * node pugbalm 5 // download 5 pugs
 */

var request = require('request'),
    _ = require('lodash'),
    apiKey = 'dc6zaTOxFJmzC',
    params;

/* 
 * @jsdoc function 
 * @name serializeParams
 * @param {object}
 * Object containing request parameters.
 * @returns {string}
 * Accepts a params object and returns a serialized string to be appended to a base URL.
 */

params = {
    q: 'pugs',
    api_key: apiKey,
};

function serializeParams(params) {

    return _.reduce(params, function(result, n, key) {

        return result + key + n;

    },'');

}

console.log(serializeParams(params));
