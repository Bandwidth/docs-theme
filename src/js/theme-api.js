require(['gitbook', 'jquery'], function(gitbook, $) {
    var buttonsId = [],
        $codes,
        themeApi;

    // Default themes
    var THEMES = [
        {
            config: 'light',
            text: 'Light',
            id: 0
        },
        {
            config: 'dark',
            text: 'Dark',
            id: 3
        }
    ];

    // List of created buttons
    var buttons = [],
    // Generated Id for buttons
    BTN_ID = 0;

    function generateId() {
        return 'btn-'+(BTN_ID++);
    }

    // Insert a jquery element at a specific position
    function insertAt(parent, selector, index, element) {
        var lastIndex = parent.children(selector).length;
        if (index < 0) {
            index = Math.max(0, lastIndex + 1 + index);
        }
        parent.append(element);

        if (index < lastIndex) {
            parent.children(selector).eq(index).before(parent.children(selector).last());
        }
    }


        // Default click handler
    function defaultOnClick(e) {
        e.preventDefault();
    }

    // Create a new button in the toolbar
    function createButton(opts) {
        opts = $.extend({
            // Aria label for the button
            label: '',

            // Icon to show
            icon: '',

            // Inner text
            text: '',

            // Right or left position
            position: 'left',

            // Other class name to add to the button
            className: '',

            // Triggered when user click on the button
            onClick: defaultOnClick,

            // Button is a dropdown
            dropdown: null,

            // Position in the toolbar
            index: null,

            // Button id for removal
            id: generateId()
        }, opts || {});

        buttons.push(opts);
        updateButton(opts);

        return opts.id;
    }

    // Update a button
    function updateButton(opts) {
        var $result;
        var $toolbar = $('.api-code-top');

        // Create button
        var $btn = $('<a>', {
            'class': 'btn',
            'text': opts.text? ' ' + opts.text : '',
            'aria-label': opts.label,
            'href': ''
        });

        // Bind click
        $btn.click(opts.onClick);

        // Prepend icon
        if (opts.icon) {
            $('<i>', {
                'class': opts.icon
            }).prependTo($btn);
        }
        $btn.addClass(opts.className);
        $result = $btn;

        $result.addClass('js-langbar-action');

        insertAt($toolbar, '.btn', opts.index, $result);
    }

    // Update all buttons
    function updateAllButtons() {
        $('.js-langbar-action').remove();
        buttons.forEach(updateButton);
    }

    // Remove a button provided its id
    function removeButton(id) {
        buttons = $.grep(buttons, function(button) {
            return button.id != id;
        });

        updateAllButtons();
    }

    // Remove multiple buttons from an array of ids
    function removeButtons(ids) {
        buttons = $.grep(buttons, function(button) {
            return ids.indexOf(button.id) == -1;
        });

        updateAllButtons();
    }



    // Instantiate localStorage
    function init(config) {
        themeApi = gitbook.storage.get('themeApi', {
            split:       config.split,
            currentLang: null
        });
    }

    // Update localStorage settings
    function saveSettings() {
        gitbook.storage.set('themeApi', themeApi);
        updateDisplay();
    }

    // Update display
    function updateDisplay() {
        // Update layout
        $('.book').toggleClass('two-columns', themeApi.split);

        // Update code samples elements
        $codes = $('.api-method-sample');
        // Display corresponding code snippets
        $codes.each(function() {
            // Show corresponding
            var hidden = !($(this).data('lang') == themeApi.currentLang);
            $(this).toggleClass('hidden', hidden);
        });
    }

    // Update code tabs
    function updateCodeTabs() {
        // Remove languages buttons
        removeButtons(buttonsId);
        buttonsId = [];

        // Update code snippets elements
        $codes = $('.api-method-sample');

        // Recreate languages buttons
        var languages = [],
            hasCurrentLang = false;

        $codes.each(function() {
            var isDefault = false,
                codeLang  = $(this).data('lang'),
                codeName  = $(this).data('name'),
                exists,
                found;

            // Check if is current language
            if (codeLang == themeApi.currentLang) {
                hasCurrentLang = true;
                isDefault = true;
            }

            // Check if already added
            exists = $.grep(languages, function(language) {
                return language.name == codeName;
            });

            found = !!exists.length;

            if (!found) {
                // Add language
                languages.push({
                    name: codeName,
                    lang: codeLang,
                    default: isDefault
                });
            }
        });

        var a = 0;
        $.each(languages, function(i, language) {
            // Set first language as active if no default

            var isDefault = language.default || (!hasCurrentLang && i == (languages.length - 1)),
                buttonId;

            var className;

            // Add special classes to first and last button
            if (a === 0) {
                className = 'lang-switcher first-code-lang ' + (isDefault? ' active ': '');
            }
            else if (a === languages.length - 1){
                className = 'lang-switcher last-code-lang ' + (isDefault? ' active ': '');
            }
            else {
                className = 'lang-switcher' + (isDefault? ' active ': '');
            }
            // Create button
            buttonId = createButton({
                text: language.name,
                position: 'left',
                className: className,
                index: a,
                onClick: function(e) {
                    // Update language
                    themeApi.currentLang = language.lang;
                    saveSettings();

                    // Update active button
                    $('.btn.lang-switcher.active').removeClass('active');
                    $(e.currentTarget).addClass('active');
                }
            });

            // Add to list of buttons
            buttonsId.push(buttonId);

            //Incremennt Count
            a += 1;
            // Set as current language if is default
            if (isDefault) {
                themeApi.currentLang = language.lang;
            }
        });
    }

    // Initialization
    gitbook.events.bind('start', function(e, config) {
        var opts = config['theme-bandwidth'];

        // Initialize themes
        gitbook.fontsettings.setThemes(THEMES);

        // Set to configured theme
        gitbook.fontsettings.setTheme(opts.theme);

        // Init current settings
        init(opts);
    });

    // Update state
    gitbook.events.on('page.change', function() {
        updateCodeTabs();
        // updateComments();
        updateDisplay();

        if (localStorage.getItem('popState') != 'shown' && $(window).width() < 980){
          $("#banner").show();
          $('.head').has('#banner').siblings('.book-body, .book-summary').css('height','calc(100% - 200px)');
          $('.head').has('#banner').siblings().children().find('.book-header').css('top','200px');
          localStorage.setItem('popState','shown');
        } else if (localStorage.getItem('popState') != 'shown'){
            $("#banner").show();
            $('.head').has('#banner').siblings('.book-body, .book-summary').css('height','calc(100% - 120px)');
	          $('.head').has('#banner').siblings().children().find('.book-header').css('top','120px');
            localStorage.setItem('popState','shown');
        } else {
            $('.book-body, .book-summary').css('height','calc(100% - 70px)');
        }

        $('#bannerClose').click(function(e){
            $('.head').has('#banner').siblings('.book-body, .book-summary').css('height','calc(100% - 70px)');
	          $('.head').has('#banner').siblings().children().find('.book-header').css('top','70px');
            $('#banner').hide();
        });
    });

    // Comments toggled event
    gitbook.events.on('comment.toggled', function(e, $from, open) {
        // If triggering element is in a definition
        if (!!$from.parents('.api-method-definition').length) {
            // Add class to wrapper only if comments are open and in two-columns mode
            var $wrapper = gitbook.state.$book.find('.page-wrapper');
            $wrapper.toggleClass('comments-open-from-definition', open && themeApi.split);
        }
    });
});
