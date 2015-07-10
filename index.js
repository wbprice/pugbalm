#! /usr/bin/env node

'use strict';

/**
 * @description
 * A tool that downloads a given number of pug images to the directory where it is run.
 *
 * @example
 * node pugbalm 5 // download 5 pugs
 */

var http = require('http'),
    _ = require('lodash'),
    Stream = require('stream').Transform,
    fs = require('fs'),

    baseUrl = 'http://api.giphy.com/v1/gifs/search',
    apiKey = 'dc6zaTOxFJmzC',

    params = {
        q: 'pugs',
        limit: process.argv[2] || 5,
        fmt: 'json',
        api_key: apiKey,
    };

/*
 * @jsdoc function
 * @name serializeParams
 * @param {object}
 * Object containing request parameters.
 * @returns {string}
 * Accepts a params object and returns a serialized string to be appended to a base URL.
 */

function serializeParams(params) {

    var first = true;

    return _.reduce(params, function(result, n, key) {

        if (first) {
            first = false;
            return result + '?' + key + '=' + n;
        } else {
            return result + '&' + key + '=' + n;
        }

    },'');

}

function downloadImage(path, id) {

    http.get(path, function(response) {

      var output = new Stream(),
          destination = process.cwd() + '/' + id + '.gif';

      response.on('data', function(body) {
        output.push(body);;

      });

      response.on('end', function() {
        fs.writeFile(destination, output.read(), function(err) {
          if (err) throw err;

        });

      });

    });

};

function getListOfImages(baseUrl, params) {

  http.get(baseUrl + serializeParams(params), function(response) {

      var output = '';

      response.setEncoding('utf8');
      response.on('data', function(body) {
          output += body;

      });

      response.on('end', function() {
      
          output = JSON.parse(output).data;

          _.forEach(output, function(element) {
              downloadImage(element.images.original.url, element.id);
          });

      });
  });

};

getListOfImages(baseUrl, params);
