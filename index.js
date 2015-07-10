#! /usr/bin/env node

'use strict';

/**
 * @description
 * A tool that delivers therapy pugs to the directory from which it is run.
 *
 * @example
 * pugbalm 5 //downloads 5 pugs.
 */

var BPromise = require('bluebird'),
    wreck = BPromise.promisifyAll(require('wreck')),
    fs = BPromise.promisifyAll(require('fs')),
    querystring = require('querystring'),
    _ = require('lodash'),

    statusStream = process.stderr,

    baseUrl = 'http://api.giphy.com/v1/gifs/search',
    apiKey = 'dc6zaTOxFJmzC',

    params = {
        q: 'pugs',
        limit: Number(process.argv[2]),
        offset: Date.now() % 800, // because there about 800 results in the query
        fmt: 'json',
        api_key: apiKey
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
    var destination = process.cwd() + '/' + id + '.gif';

    return wreck.requestAsync('GET', path, {agent: false, timeout: 30000})
        .then(function (response) {
            var writeStream = fs.createWriteStream(destination);

            return new BPromise(function (resolve, reject) {
                writeStream.on('finish', function () {
                    resolve();
                });

                writeStream.on('error', function (err) {
                    reject(err);
                });

                response.pipe(writeStream);
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

  return wreck.getAsync(baseUrl + '?' + querystring.stringify(params), {json: true})
      .spread(function (response, payload) {
          return payload.data;
      })
      .map(function (element) {
          return downloadImage(element.images.original.url, element.id).then(function () {
              statusStream.write('.');
          });
      }, {concurrency: 10}).then(function () {
          statusStream.write('therapy complete\n');
      });

};

getListOfImages(baseUrl, params);
