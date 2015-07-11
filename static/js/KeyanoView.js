// Generated by CoffeeScript 1.8.0
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['static/js/data/KeyCodes', 'static/js/data/PianoKeys', 'static/js/instrument/KeyanoInstrument', 'static/js/utils/pianoKeyUtils', 'static/js/config/Config'], function(KeyCodes, PianoKeys, KeyanoInstrument, pianoKeyUtils, Config) {
    var KeyanoView;
    KeyanoView = (function() {
      KeyanoView.prototype.KEYBOARD_KEYS_FOR_WHITE_PIANO_KEYS = [
        {
          keyCode: KeyCodes.Q,
          label: 'Q'
        }, {
          keyCode: KeyCodes.W,
          label: 'W'
        }, {
          keyCode: KeyCodes.E,
          label: 'E'
        }, {
          keyCode: KeyCodes.R,
          label: 'R'
        }, {
          keyCode: KeyCodes.T,
          label: 'T'
        }, {
          keyCode: KeyCodes.Y,
          label: 'Y'
        }, {
          keyCode: KeyCodes.U,
          label: 'U'
        }, {
          keyCode: KeyCodes.I,
          label: 'I'
        }, {
          keyCode: KeyCodes.O,
          label: 'O'
        }, {
          keyCode: KeyCodes.P,
          label: 'P'
        }, {
          keyCode: KeyCodes.OPEN_BRACKET,
          label: '['
        }, {
          keyCode: KeyCodes.CLOSE_BRACKET,
          label: ']'
        }
      ];

      KeyanoView.prototype.KEYBOARD_KEYS_FOR_BLACK_PIANO_KEY_WRAPPERS = [
        {
          keyCode: KeyCodes.KEYPAD_2,
          label: '2'
        }, {
          keyCode: KeyCodes.KEYPAD_3,
          label: '3'
        }, {
          keyCode: KeyCodes.KEYPAD_4,
          label: '4'
        }, {
          keyCode: KeyCodes.KEYPAD_5,
          label: '5'
        }, {
          keyCode: KeyCodes.KEYPAD_6,
          label: '6'
        }, {
          keyCode: KeyCodes.KEYPAD_7,
          label: '7'
        }, {
          keyCode: KeyCodes.KEYPAD_8,
          label: '8'
        }, {
          keyCode: KeyCodes.KEYPAD_9,
          label: '9'
        }, {
          keyCode: KeyCodes.KEYPAD_0,
          label: '0'
        }, {
          keyCode: KeyCodes.DASH,
          label: '-'
        }, {
          keyCode: KeyCodes.EQUAL_SIGN,
          label: '='
        }
      ];

      KeyanoView.prototype.DEFAULT_BUTTON_TOOLTIP_OPTIONS = {
        show: {
          delay: 50,
          effect: false
        },
        hide: {
          effect: false
        },
        style: {
          classes: 'KeyboardShiftButton-tooltip'
        }
      };

      KeyanoView.prototype.DEFAULT_SLIDER_OPTIONS = {
        min: 0,
        max: 100,
        step: 1,
        value: 100,
        orientation: 'vertical',
        reversed: true,
        tooltip: 'hide',
        nLogSteps: 3
      };

      KeyanoView.prototype.VOLUME_VALUE_LOCAL_STORAGE_KEY = 'keyano-volume-value';

      KeyanoView.prototype.SLIDER_VALUE_LOCAL_STORAGE_KEY = 'keyano-volume-slider-value';

      KeyanoView.prototype._cachedKeyMappingsForKeyboardWithLowestKey = {};

      KeyanoView.prototype._lowestKeyOfCurrentKeyboardRange = null;

      KeyanoView.prototype._instrument = null;

      KeyanoView.prototype.ui = {
        loadingSpinnerOverlay: $('.LoadingSpinner-overlay'),
        instrument: $('.KeyanoInstrument'),
        keyboards: $('.KeyanoInstrument-keyboard'),
        keyboardLeftShiftButton: $('.KeyboardShiftButton-leftButton'),
        keyboardRightShiftButton: $('.KeyboardShiftButton-rightButton'),
        masterVolumeSlider: $('.KeyanoInstrument-masterVolumeSlider'),
        masterVolumeDropdownTrigger: $('.Header-dropdownTrigger'),
        masterVolumeDropdownWrapper: $('.Header-dropdown')
      };

      function KeyanoView(_arg) {
        var instrument;
        instrument = (_arg != null ? _arg : {}).instrument;
        if (instrument == null) {
          throw new Error('No instrument parameter provided');
        }
        if (!instrument instanceof KeyanoInstrument) {
          throw new Error('Invalid instrument parameter provided');
        }
        this._instrument = instrument;
        this.KEYBOARD_KEYS_FOR_ALL_PIANO_KEYS = this._zipKeyMappingArrays({
          whiteKeys: this.KEYBOARD_KEYS_FOR_WHITE_PIANO_KEYS,
          blackKeys: this.KEYBOARD_KEYS_FOR_BLACK_PIANO_KEY_WRAPPERS
        });
      }

      KeyanoView.prototype.activate = function() {
        this._populatePianoKeyLabelsInDom();
        this._activateMasterVolumeSlider();
        this._activateKeyboardShiftButtonTooltips();
        this._activateKeyboardShiftTriggers({
          instrument: this._instrument,
          downwardKeyCodes: Config.KEYBOARD_SHIFT_DOWNWARD_KEY_CODES,
          upwardKeyCodes: Config.KEYBOARD_SHIFT_UPWARD_KEY_CODES
        });
        this._shiftKeyboardToHaveLowestKey(this._instrument, Config.LOWEST_KEY_OF_DEFAULT_KEYBOARD_RANGE);
        this._deactivateBackspaceKey();
        this.ui.instrument.show();
        return this.ui.loadingSpinnerOverlay.addClass('LoadingSpinner-overlay--hidden');
      };

      KeyanoView.prototype._activateMasterVolumeSlider = function() {
        var savedVolumeValue, sliderOptions;
        this.ui.masterVolumeDropdownTrigger.on('click', (function(_this) {
          return function() {
            return _this.ui.masterVolumeDropdownWrapper.toggleClass('open');
          };
        })(this));
        $(document).on('click', (function(_this) {
          return function(ev) {
            var isClickWithinDropdownWrapper, isDropdownOpen;
            isDropdownOpen = _this.ui.masterVolumeDropdownWrapper.hasClass('open');
            isClickWithinDropdownWrapper = $(ev.target).closest('.Header-dropdown').size() > 0;
            if (isDropdownOpen && !isClickWithinDropdownWrapper) {
              return _this.ui.masterVolumeDropdownWrapper.removeClass('open');
            }
          };
        })(this));
        sliderOptions = this.DEFAULT_SLIDER_OPTIONS;
        savedVolumeValue = this._getSavedVolumeValue();
        if (_.isNumber(savedVolumeValue) && _.isFinite(savedVolumeValue)) {
          sliderOptions = _.defaults({
            value: this._getSavedVolumeSliderValue()
          }, sliderOptions);
          this._instrument.setVolume(savedVolumeValue);
        }
        return this.ui.masterVolumeSlider.slider(sliderOptions).on('change', (function(_this) {
          return function(ev) {
            var newSliderValue, newVolume;
            newSliderValue = ev.value.newValue;
            newVolume = _this._mapSliderValueToVolumeValue(ev.value.newValue);
            _this._setSavedVolumeSliderValue(newSliderValue);
            _this._setSavedVolumeValue(newVolume);
            return _this._instrument.setVolume(newVolume);
          };
        })(this));
      };

      KeyanoView.prototype._mapSliderValueToVolumeValue = function(newSliderValue) {
        var exponent, maxValue, nLogSteps;
        if (newSliderValue === 0) {
          return 0;
        } else {
          maxValue = this.DEFAULT_SLIDER_OPTIONS.max;
          nLogSteps = this.DEFAULT_SLIDER_OPTIONS.nLogSteps;
          exponent = -1 * (nLogSteps - ((newSliderValue / maxValue) * nLogSteps));
          return Math.pow(10, exponent);
        }
      };

      KeyanoView.prototype._activateKeyboardShiftButtonTooltips = function() {
        this.ui.keyboardLeftShiftButton.qtip(_.defaults({
          position: {
            my: 'left center',
            at: 'right center'
          },
          content: {
            text: '<div class="KeyboardShiftButton-tooltipMain">Shift Keyboard Down</div>\n<div class="KeyboardShiftButton-tooltipSecondary">\n  (Shortcut: Tab or Left Arrow Key)\n</div>'
          }
        }, this.DEFAULT_BUTTON_TOOLTIP_OPTIONS));
        return this.ui.keyboardRightShiftButton.qtip(_.defaults({
          position: {
            my: 'right center',
            at: 'left center'
          },
          content: {
            text: '<div class="KeyboardShiftButton-tooltipMain">Shift Keyboard Up</div>\n<div class="KeyboardShiftButton-tooltipSecondary">\n  (Shortcut: \\ or Right Arrow Key)\n</div>'
          }
        }, this.DEFAULT_BUTTON_TOOLTIP_OPTIONS));
      };

      KeyanoView.prototype._activateKeyboardShiftTriggers = function(_arg) {
        var downwardKeyCodes, flashButtonSelectedState, instrument, selectedClass, upwardKeyCodes, verifyKeyCodesAreUnused, _ref;
        _ref = _arg != null ? _arg : {}, instrument = _ref.instrument, downwardKeyCodes = _ref.downwardKeyCodes, upwardKeyCodes = _ref.upwardKeyCodes;
        selectedClass = 'KeyboardShiftButton--selected';
        flashButtonSelectedState = function($button) {
          if ($button.is(':hover')) {
            return;
          }
          return $button.addClass(selectedClass).delay(150).queue(function() {
            $(this).removeClass(selectedClass);
            return $(this).dequeue();
          });
        };
        verifyKeyCodesAreUnused = (function(_this) {
          return function() {
            var shiftOperationKeyCode, shiftOperationKeyCodes, _i, _len, _results;
            shiftOperationKeyCodes = _.flatten([downwardKeyCodes, upwardKeyCodes]);
            _results = [];
            for (_i = 0, _len = shiftOperationKeyCodes.length; _i < _len; _i++) {
              shiftOperationKeyCode = shiftOperationKeyCodes[_i];
              _results.push(_.forEach(_this.KEYBOARD_KEYS_FOR_ALL_PIANO_KEYS, function(keyMapping) {
                if (keyMapping.keyCode === shiftOperationKeyCode) {
                  throw new Error('Tried to map a piano keyboard key to also trigger a keyboard-shift operation.');
                }
              }));
            }
            return _results;
          };
        })(this);
        verifyKeyCodesAreUnused();
        $(document).on('keydown', _.throttle((function(_this) {
          return function(ev) {
            var _ref1, _ref2;
            if (_ref1 = ev.keyCode, __indexOf.call(downwardKeyCodes, _ref1) >= 0) {
              _this._shiftKeyboardDownward(instrument);
              flashButtonSelectedState(_this.ui.keyboardLeftShiftButton);
            }
            if (_ref2 = ev.keyCode, __indexOf.call(upwardKeyCodes, _ref2) >= 0) {
              _this._shiftKeyboardUpward(instrument);
              return flashButtonSelectedState(_this.ui.keyboardRightShiftButton);
            }
          };
        })(this), Config.KEYBOARD_SHIFT_THROTTLE_LIMIT_IN_MILLIS));
        this.ui.keyboardLeftShiftButton.on('click', (function(_this) {
          return function() {
            return _this._shiftKeyboardDownward(instrument);
          };
        })(this));
        this.ui.keyboardRightShiftButton.on('click', (function(_this) {
          return function() {
            return _this._shiftKeyboardUpward(instrument);
          };
        })(this));
        return $(document).on('keydown', function(ev) {
          var _ref1, _ref2;
          if ((_ref1 = ev.keyCode, __indexOf.call(downwardKeyCodes, _ref1) >= 0) || (_ref2 = ev.keyCode, __indexOf.call(upwardKeyCodes, _ref2) >= 0)) {
            ev.stopPropagation();
            return ev.preventDefault();
          }
        });
      };

      KeyanoView.prototype._populatePianoKeyLabelsInDom = function() {
        return this.ui.keyboards.each((function(_this) {
          return function(index, keyboardElem) {
            var $blackKeyWrappersInOrder, $keyboard, $whiteKeysInOrder;
            $keyboard = $(keyboardElem);
            $whiteKeysInOrder = _this._getDomElementsForWhiteKeysInKeyboard($keyboard);
            $blackKeyWrappersInOrder = _this._getDomElementsForBlackKeyWrappersInKeyboard($keyboard);
            $whiteKeysInOrder.each(function(index, whiteKeyElem) {
              var $label, $name, pianoKeyId;
              pianoKeyId = $(whiteKeyElem).attr('data-piano-key-id');
              $label = $(whiteKeyElem).find('.KeyanoInstrument-keyLabel');
              $name = $(whiteKeyElem).find('.KeyanoInstrument-whiteKeyNameLabel');
              $label.text(_this.KEYBOARD_KEYS_FOR_WHITE_PIANO_KEYS[index].label);
              return $name.text(pianoKeyId);
            });
            return $blackKeyWrappersInOrder.each(function(index, blackKeyElem) {
              var $label, $name, pianoKeyId;
              pianoKeyId = $(blackKeyElem).find('[data-piano-key-id]').attr('data-piano-key-id');
              $label = $(blackKeyElem).find('.KeyanoInstrument-keyLabel');
              $name = $(blackKeyElem).find('.KeyanoInstrument-blackKeyNameLabel');
              $label.text(_this.KEYBOARD_KEYS_FOR_BLACK_PIANO_KEY_WRAPPERS[index].label);
              return $name.text(pianoKeyId);
            });
          };
        })(this));
      };

      KeyanoView.prototype._shiftKeyboardDownward = function(instrument) {
        var previousKeyName;
        previousKeyName = pianoKeyUtils.getKeyNameOfNextLowestWhiteKey(this._lowestKeyOfCurrentKeyboardRange);
        return this._shiftKeyboardToHaveLowestKey(instrument, previousKeyName);
      };

      KeyanoView.prototype._shiftKeyboardUpward = function(instrument) {
        var nextKeyName;
        nextKeyName = pianoKeyUtils.getKeyNameOfNextHighestWhiteKey(this._lowestKeyOfCurrentKeyboardRange);
        return this._shiftKeyboardToHaveLowestKey(instrument, nextKeyName);
      };

      KeyanoView.prototype._shiftKeyboardToHaveLowestKey = function(instrument, lowestKeyName) {
        var keyMappings;
        this._lowestKeyOfCurrentKeyboardRange = lowestKeyName;
        this._showDomElementForKeyanoInstrumentWithLowestKey(lowestKeyName);
        keyMappings = this._generateKeyMappingsForInstrumentWithLowestKey(lowestKeyName);
        return instrument.activateKeys(keyMappings);
      };

      KeyanoView.prototype._generateKeyMappingsForInstrumentWithLowestKey = function(lowestKeyName) {
        var $keyboard, cachedKeyMappings, keyMappings, pianoKeyIdsInOrder;
        $keyboard = this._getDomElementForKeyboard(lowestKeyName);
        keyMappings = [];
        cachedKeyMappings = this._cachedKeyMappingsForKeyboardWithLowestKey[lowestKeyName];
        if (cachedKeyMappings != null) {
          keyMappings = cachedKeyMappings;
        } else {
          pianoKeyIdsInOrder = this._getOrderedPianoKeyIdsFromKeyboardDomElement($keyboard);
          keyMappings = _.chain(pianoKeyIdsInOrder).map((function(_this) {
            return function(pianoKeyId, keyIndex) {
              var result;
              result = void 0;
              if (pianoKeyId != null) {
                result = {
                  keyCode: _this.KEYBOARD_KEYS_FOR_ALL_PIANO_KEYS[keyIndex].keyCode,
                  pianoKey: PianoKeys[pianoKeyId]
                };
              }
              return result;
            };
          })(this)).compact().value();
          this._cachedKeyMappingsForKeyboardWithLowestKey[lowestKeyName] = keyMappings;
        }
        return keyMappings;
      };

      KeyanoView.prototype._showDomElementForKeyanoInstrumentWithLowestKey = function(lowestKeyName) {
        if (!_.isString(lowestKeyName)) {
          throw new Error('Passed a lowestKeyName to _showKeyanoInstrumentWithLowestKey that was not a string');
        }
        if (!pianoKeyUtils.isValidWhiteKeyName(lowestKeyName)) {
          throw new Error('Passed an invalid lowestKeyName to _showDefaultKeyanoInstrument');
        }
        this.ui.keyboards.hide();
        return this._getDomElementForKeyboard(lowestKeyName).show();
      };

      KeyanoView.prototype._getDomElementForKeyboard = function(lowestKeyName) {
        return this.ui.keyboards.filter("[data-lowest-key='" + lowestKeyName + "']");
      };

      KeyanoView.prototype._getOrderedPianoKeyIdsFromKeyboardDomElement = function($keyboard) {
        var $blackKey, $blackKeyWrappers, $whiteKeys, blackKeyWrapperIndex, isEvenIndex, keyIndex, numKeys, pianoKeyId, pianoKeyIdsInOrder, whiteKeyIndex, _i, _len, _ref;
        $whiteKeys = this._getDomElementsForWhiteKeysInKeyboard($keyboard);
        $blackKeyWrappers = this._getDomElementsForBlackKeyWrappersInKeyboard($keyboard);
        numKeys = $whiteKeys.size() + $blackKeyWrappers.size();
        pianoKeyIdsInOrder = [];
        pianoKeyId = null;
        _ref = _.range(numKeys);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          keyIndex = _ref[_i];
          isEvenIndex = keyIndex % 2 === 0;
          if (isEvenIndex) {
            whiteKeyIndex = Math.floor(keyIndex / 2);
            pianoKeyId = $whiteKeys.eq(whiteKeyIndex).attr('data-piano-key-id');
          } else {
            blackKeyWrapperIndex = Math.floor(keyIndex / 2);
            $blackKey = $blackKeyWrappers.eq(blackKeyWrapperIndex).children('.KeyanoInstrument-blackKey');
            pianoKeyId = $blackKey.attr('data-piano-key-id');
          }
          pianoKeyIdsInOrder.push(pianoKeyId);
        }
        return pianoKeyIdsInOrder;
      };

      KeyanoView.prototype._getDomElementsForWhiteKeysInKeyboard = function($keyboard) {
        return $keyboard.find('.KeyanoInstrument-whiteKey');
      };

      KeyanoView.prototype._getDomElementsForBlackKeyWrappersInKeyboard = function($keyboard) {
        return $keyboard.find('.KeyanoInstrument-blackKeyWrapper');
      };

      KeyanoView.prototype._deactivateBackspaceKey = function() {
        return $(document).on('keydown', (function(_this) {
          return function(ev) {
            if (ev.keyCode === KeyCodes.BACKSPACE) {
              return ev.preventDefault();
            }
          };
        })(this));
      };

      KeyanoView.prototype._getSavedVolumeValue = function() {
        return parseFloat(window.localStorage[this.VOLUME_VALUE_LOCAL_STORAGE_KEY]);
      };

      KeyanoView.prototype._setSavedVolumeValue = function(volumeValue) {
        return window.localStorage[this.VOLUME_VALUE_LOCAL_STORAGE_KEY] = volumeValue;
      };

      KeyanoView.prototype._getSavedVolumeSliderValue = function() {
        return parseFloat(window.localStorage[this.SLIDER_VALUE_LOCAL_STORAGE_KEY]);
      };

      KeyanoView.prototype._setSavedVolumeSliderValue = function(sliderValue) {
        return window.localStorage[this.SLIDER_VALUE_LOCAL_STORAGE_KEY] = sliderValue;
      };

      KeyanoView.prototype._zipKeyMappingArrays = function(_arg) {
        var blackKeyboardKeys, blackKeys, isEvenIndex, keyIndex, numKeys, whiteKeyboardKeys, whiteKeys, zippedKeys, _i, _len, _ref, _ref1;
        _ref = _arg != null ? _arg : {}, whiteKeys = _ref.whiteKeys, blackKeys = _ref.blackKeys;
        if (whiteKeys == null) {
          throw new Error('No whiteKeys passed to _zipKeyArrays');
        }
        if (blackKeys == null) {
          throw new Error('No blackKeys passed to _zipKeyArrays');
        }
        whiteKeyboardKeys = whiteKeys;
        blackKeyboardKeys = blackKeys;
        zippedKeys = [];
        numKeys = whiteKeyboardKeys.length + blackKeyboardKeys.length;
        _ref1 = _.range(numKeys);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          keyIndex = _ref1[_i];
          isEvenIndex = keyIndex % 2 === 0;
          zippedKeys.push(isEvenIndex ? whiteKeyboardKeys[Math.floor(keyIndex / 2)] : blackKeyboardKeys[Math.floor(keyIndex / 2)]);
        }
        return zippedKeys;
      };

      return KeyanoView;

    })();
    return KeyanoView;
  });

}).call(this);

//# sourceMappingURL=KeyanoView.js.map
