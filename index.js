#! /usr/bin/env node

'use strict';

/**
 * @description
 * A tool that delivers therapy pugs to the directory from which it is run.
 *
 * @example
 * pugbalm 5 //downloads 5 pugs.
 */

var http = require('http'),
    _ = require('lodash'),
    Stream = require('stream').Transform,
    fs = require('fs'),

    baseUrl = 'http://api.giphy.com/v1/gifs/search',
    apiKey = 'dc6zaTOxFJmzC',

    params = {
        q: 'pugs',
        limit: Number(process.argv[2]),
        offset: Date.now() % 800, // because there about 800 results in the query
        fmt: 'json',
        api_key: apiKey,
    };

// Validate cli input
if (!params.limit) {
    throw new Error('You don\'t ask for therapy with a value not representative of actual therapy. SHAME');
}

if (params.limit < 0) {
    throw new Error('Try a positive number for PUG therapy.');
}

/**
 * @jsdoc function
 * @name serializeParams
 * @param {object}
 * Object containing request parameters.
 * @returns {string}
 * Accepts a params object and returns a serialized string to be appended to a base URL.
 */

function serializeParams(params) {
  return '?' + _.keys(params).map(function(k) {
    return k + '=' + params[k];
  }).join('&');
}

/**
 * @jsdoc function
 * @name downloadImage
 * @param {string} path
 * The URL for the image to be downloaded.
 * @param {string} id
 * The ID of the image to be downloaded.  Will be used to make the filename.
 *
 * @description
 * Uses HTTP to download the image from the path provided and save it to the current working directory.
 */

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

          imagesDownloaded++;

          if (imagesToDownload === imagesDownloaded) {

            console.log(imagesToDownload + ' pugs were delivered to ' + process.cwd() + '.\nPowered by GIPHY. http://giphy.com/');

          }

        });

      });

    });

};

/**
 * @jsdoc function
 * @name getListOfImages
 * @param {string} baseUrl
 * The URL for the Giphy API.
 * @param {object} params
 * An object containing configuration information for the API request.
 * @description
 * Uses HTTP to get an array of objects that contain information related to a given gif.
 */

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
