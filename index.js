var _ = require('lodash');
var Q = require('q-plus');
var cheerio = require('cheerio');

var DEFAULT_LANGUAGES = require('./languages');
var configLanguages = [];

var bookName;

function generateExtendMethod(book, body, examples) {
    // Main container
    var $ = cheerio.load('<div class="api-method"></div>'),
        $apiMethod = $('div.api-method'),
    // Method definition
        $apiDefinition = $('<div class="api-method-definition"></div>'),
    //  Definition Top
        $apiDefinitionTop = $('<div class="api-definition-top"></div>'),
    // Method code
        $apiCode = $('<div class="api-method-code mm-method-code"></div>');
    // Append elements
    $apiMethod.append($apiDefinition);

    $apiMethod.append($apiCode);

    // Render method body
    return Q()
    .then(function() {
        return book.renderBlock('markdown', body);
    })
    .then(function(apiDefinition) {
        $apiDefinition.html(apiDefinition);
        $apiDefinition.prepend($apiDefinitionTop);
        // Set method examples
        return Q(examples).eachSeries(function(example) {
            var $example;

            // Common text
            if (example.type == 'common') {
                $example = $('<div class="api-method-example"></div>');

            }

            // Example code snippet
            if (example.type == 'sample') {
                $example = $('<div class="api-method-sample" data-lang="'+example.lang+'" data-name="'+example.name+'"></div>');
            }

            return book.renderBlock('markdown', example.body)
            .then(function(body) {
                $example.html(body);
                $apiCode.append($example);
            });
        });
    })
    .then(function() {
        // Return whole HTML
        return $.html('div.api-method');
    });
}

function generateMultiMethod(book, body, examples) {
    // Main container
    var $ = cheerio.load('<div class="api-method"></div>'),
        $apiMethod = $('div.api-method'),
    // Method definition
        $apiDefinition = $('<div class="api-method-definition"></div>'),
    //  Definition Top
        $apiDefinitionTop = $('<div class="api-definition-top"></div>'),
    // Method code
        $apiCode = $('<div class="api-method-code mm-code-first"></div>'),
    // Code Top Bar
        $apiCodeTop = $('<div class="api-code-top mm-code-top"></div>');

    // console.log(body);
    // var rawBody = cheerio.load(body);
    // var topBar = rawBody('.api-code-top');
    // console.log(topBar);
    // if(topBar.length < 1){
    //     $apiCode.append($apiCodeTop);
    // }
    $apiCode.append($apiCodeTop);
    // Append elements
    $apiMethod.append($apiDefinition);

    $apiMethod.append($apiCode);

    // Render method body
    return Q()
    .then(function() {
        return book.renderBlock('markdown', body);
    })
    .then(function(apiDefinition) {
        $apiDefinition.html(apiDefinition);
        $apiDefinition.prepend($apiDefinitionTop);
        // Set method examples
        return Q(examples).eachSeries(function(example) {
            var $example;

            // Common text
            if (example.type == 'common') {
                $example = $('<div class="api-method-example"></div>');

            }

            // Example code snippet
            if (example.type == 'sample') {
                $example = $('<div class="api-method-sample" data-lang="'+example.lang+'" data-name="'+example.name+'"></div>');
            }

            return book.renderBlock('markdown', example.body)
            .then(function(body) {
                $example.html(body);
                $apiCode.append($example);
            });
        });
    })
    .then(function() {
        // Return whole HTML
        $('.mm-code-top').parent('.api-method-code').css('min-height', '0vh');
        return $.html('div.api-method');
    });
}

function generateMethod(book, body, examples) {
    // Main container
    var $ = cheerio.load('<div class="api-method"></div>'),
        $apiMethod = $('div.api-method'),
    // Method definition
        $apiDefinition = $('<div class="api-method-definition"></div>'),
    //  Definition Top
        $apiDefinitionTop = $('<div class="api-definition-top"></div>'),
    // Method code
        $apiCode = $('<div class="api-method-code"></div>'),
    // Code Top Bar
        $apiCodeTop = $('<div class="api-code-top"></div>');

    // console.log(body);
    // var rawBody = cheerio.load(body);
    // var topBar = rawBody('.api-code-top');
    // console.log(topBar);
    // if(topBar.length < 1){
    //     $apiCode.append($apiCodeTop);
    // }
    $apiCode.append($apiCodeTop);
    // Append elements
    $apiMethod.append($apiDefinition);

    $apiMethod.append($apiCode);

    // Render method body
    return Q()
    .then(function() {
        return book.renderBlock('markdown', body);
    })
    .then(function(apiDefinition) {
        $apiDefinition.html(apiDefinition);
        $apiDefinition.prepend($apiDefinitionTop);
        // Set method examples
        return Q(examples).eachSeries(function(example) {
            var $example;

            // Common text
            if (example.type == 'common') {
                $example = $('<div class="api-method-example"></div>');

            }

            // Example code snippet
            if (example.type == 'sample') {
                $example = $('<div class="api-method-sample" data-lang="'+example.lang+'" data-name="'+example.name+'"></div>');
            }

            return book.renderBlock('markdown', example.body)
            .then(function(body) {
                $example.html(body);
                $apiCode.append($example);
            });
        });
    })
    .then(function() {
        // Return whole HTML
        return $.html('div.api-method');
    });
}

module.exports = {
    book: {
        assets: './assets',
        js: [
            'theme-api.js'
        ],
        css: [
            'theme-api.css'
        ]
    },

    blocks: {
        method: {
            blocks: ['sample', 'common'],
            process: function(blk) {
                var examples = [];

                _.each(blk.blocks, function(_blk) {
                    var languageName;

                    // Search if is user-defined language
                    if (_blk.name == 'sample') {
                        // Sample blocks should have a lang argument
                        if (!_blk.kwargs.lang) {
                            throw Error('sample blocks must provide a "lang" argument');
                        }

                        var language = _.find(configLanguages, { lang: _blk.kwargs.lang });

                        if (!!language) {
                            languageName = language.name;
                        } else {
                            // Default to upper-cased lang
                            languageName = _blk.kwargs.lang.toUpperCase();
                        }
                    }

                    examples.push({
                        type: _blk.name,
                        body: _blk.body.trim(),
                        lang: _blk.kwargs.lang,
                        name: languageName
                    });
                });

                return {
                    parse: true,
                    body: generateMethod(this, blk.body.trim(), examples)
                };
            }
        },
        multimethod : {
            blocks: ['sample', 'common'],
            process: function(blk) {
                var examples = [];

                _.each(blk.blocks, function(_blk) {
                    var languageName;

                    // Search if is user-defined language
                    if (_blk.name == 'sample') {
                        // Sample blocks should have a lang argument
                        if (!_blk.kwargs.lang) {
                            throw Error('sample blocks must provide a "lang" argument');
                        }

                        var language = _.find(configLanguages, { lang: _blk.kwargs.lang });

                        if (!!language) {
                            languageName = language.name;
                        } else {
                            // Default to upper-cased lang
                            languageName = _blk.kwargs.lang.toUpperCase();
                        }
                    }

                    examples.push({
                        type: _blk.name,
                        body: _blk.body.trim(),
                        lang: _blk.kwargs.lang,
                        name: languageName
                    });
                });

                return {
                    parse: true,
                    body: generateMultiMethod(this, blk.body.trim(), examples)
                };
            }
        },
        extendmethod: {
            blocks: ['sample', 'common'],
            process: function(blk) {
                var examples = [];

                _.each(blk.blocks, function(_blk) {
                    var languageName;

                    // Search if is user-defined language
                    if (_blk.name == 'sample') {
                        // Sample blocks should have a lang argument
                        if (!_blk.kwargs.lang) {
                            throw Error('sample blocks must provide a "lang" argument');
                        }

                        var language = _.find(configLanguages, { lang: _blk.kwargs.lang });

                        if (!!language) {
                            languageName = language.name;
                        } else {
                            // Default to upper-cased lang
                            languageName = _blk.kwargs.lang.toUpperCase();
                        }
                    }

                    examples.push({
                        type: _blk.name,
                        body: _blk.body.trim(),
                        lang: _blk.kwargs.lang,
                        name: languageName
                    });
                });

                return {
                    parse: true,
                    body: generateExtendMethod(this, blk.body.trim(), examples)
                };
            }
        }
    },

    hooks: {
        config: function(config) {
            // Merge user configured languages with default languages
            configLanguages = _.unionBy(config.pluginsConfig['theme-bandwidth'].languages, DEFAULT_LANGUAGES, 'lang');
            return config;
        }
    }
};
