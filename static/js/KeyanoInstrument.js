// Generated by CoffeeScript 1.8.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['static/js/KeyanoKeyValidator', 'static/js/Logger', 'static/js/Config'], function(KeyanoKeyValidator, Logger, Config) {
    var KeyanoInstrument;
    KeyanoInstrument = (function() {
      var _audioContext, _impressedKeyIds, _keyMappings, _keyValidator, _nodesForActivePianoKeys, _pianoKeyRegistry;

      KeyanoInstrument.prototype.DURATION_WITHOUT_PEDAL = 100;

      KeyanoInstrument.prototype.DURATION_WITH_PEDAL = 3000;

      KeyanoInstrument.prototype.TIMEOUT = 50;

      _audioContext = null;

      _impressedKeyIds = null;

      _keyMappings = null;

      _keyValidator = null;

      _pianoKeyRegistry = null;

      _nodesForActivePianoKeys = null;

      function KeyanoInstrument() {
        this._pianoKeyIdComparator = __bind(this._pianoKeyIdComparator, this);
        this._activateKey = __bind(this._activateKey, this);
        this._activatePedalKey = __bind(this._activatePedalKey, this);
        this._audioContext = new (window.AudioContext || window.webkitAudioContext);
        this._impressedKeyIds = {};
        this._keyMappings = [];
        this._keyValidator = new KeyanoKeyValidator();
        this._pianoKeyRegistry = {};
        this._nodesForActivePianoKeys = {};
        this._activatePedalKey(Config.PEDAL_KEY_CODE);
      }


      /*
      @params
        keyMappings : (array of objects) [
          {
            keyCode  : (integer) the keyboard keyCode that will trigger the piano key
            pianoKey : {
              id        : (string) the unique ID for the piano key
              frequency : (float)  the pitch of the piano key in hertz
            }
          },
          ...
        ]
      @events
        'piano:key:did:start:playing' : emitted on $(document) once a piano key's pitch has started playing
        'piano:key:did:stop:playing'  : emitted on $(document) once a piano key's pitch has stopped playing
       */

      KeyanoInstrument.prototype.activateKeys = function(keyMappings) {
        this._keyMappings = _.flatten([this._keyMappings, keyMappings]);
        _.forEach(keyMappings, this._activateKey);
      };


      /*
      @return
        (list) the sorted list of ids for the currently impressed piano keys
       */

      KeyanoInstrument.prototype.getImpressedPianoKeyIds = function() {
        var pianoKeyIds;
        pianoKeyIds = _.keys(this._impressedKeyIds);
        pianoKeyIds.sort(this._pianoKeyIdComparator);
        return pianoKeyIds;
      };

      KeyanoInstrument.prototype._activatePedalKey = function(pedalKeyCode) {
        $(document).on('keydown', (function(_this) {
          return function(ev) {
            if (ev.keyCode === pedalKeyCode) {
              return _this._isPedalPressed = true;
            }
          };
        })(this));
        return $(document).on('keyup', (function(_this) {
          return function(ev) {
            if (ev.keyCode === pedalKeyCode) {
              return _this._isPedalPressed = false;
            }
          };
        })(this));
      };

      KeyanoInstrument.prototype._activateKey = function(keyMapping) {
        var keyCode, pianoKey;
        this._keyValidator.validateKeyMapping(keyMapping);
        keyCode = keyMapping.keyCode, pianoKey = keyMapping.pianoKey;
        $(document).on('keydown', (function(_this) {
          return function(ev) {
            if (ev.keyCode === keyCode) {
              return _this._startPlayingPianoKeyIfNecessary(pianoKey);
            }
          };
        })(this));
        $(document).on('keyup', (function(_this) {
          return function(ev) {
            if (ev.keyCode === keyCode) {
              return _this._stopPlayingPianoKeyIfNecessary(pianoKey);
            }
          };
        })(this));
      };

      KeyanoInstrument.prototype._startPlayingPianoKeyIfNecessary = function(pianoKey) {
        var gainNode, pitchNode, _base, _name, _ref;
        if (this._isPianoKeyPlaying(pianoKey)) {
          Logger.debug('  ', pianoKey.id, ' is already playing, so not playing it');
          return;
        }
        Logger.debug('user pressed the key:', pianoKey.id);
        if ((_base = this._impressedKeyIds)[_name = pianoKey.id] == null) {
          _base[_name] = true;
        }
        Logger.debug('impressed keys:', this._impressedKeyIds);
        _ref = this._startPitchNode(pianoKey), pitchNode = _ref.pitchNode, gainNode = _ref.gainNode;
        this._saveActivePianoKeyInstance(pianoKey, {
          pitchNode: pitchNode,
          gainNode: gainNode
        });
        return $(document).trigger('piano:key:did:start:playing', pianoKey.id);
      };

      KeyanoInstrument.prototype._stopPlayingPianoKeyIfNecessary = function(pianoKey, isPedalPressed) {
        var gainNode, pitchNode, _ref;
        if (isPedalPressed == null) {
          isPedalPressed = true;
        }
        if (!this._isPianoKeyPlaying(pianoKey)) {
          Logger.debug('  ', pianoKey.id, ' is not playing, so not stopping it');
          return;
        }
        Logger.debug('user released the key:', pianoKey.id);
        delete this._impressedKeyIds[pianoKey.id];
        _ref = this._getActivePianoKey(pianoKey), pitchNode = _ref.pitchNode, gainNode = _ref.gainNode;
        if (this._isPedalPressed) {
          this._stopPitchNodeWithPedal(pitchNode, gainNode);
        } else {
          this._stopPitchNodeWithoutPedal(pitchNode, gainNode);
        }
        $(document).trigger('piano:key:did:stop:playing', pianoKey.id);
        this._deleteActivePianoKeyInstance(pianoKey);
      };

      KeyanoInstrument.prototype._createPitchNodeForPianoKey = function(pianoKey) {
        var oscillatorNode;
        oscillatorNode = this._audioContext.createOscillator();
        oscillatorNode.type = Config.PITCH_TYPE;
        oscillatorNode.frequency.value = pianoKey.frequency;
        return oscillatorNode;
      };

      KeyanoInstrument.prototype._createVolumeNode = function() {
        return this._audioContext.createGain();
      };

      KeyanoInstrument.prototype._startPitchNode = function(pianoKey) {
        var gainNode, pitchNode;
        pitchNode = this._createPitchNodeForPianoKey(pianoKey);
        gainNode = this._createVolumeNode();
        pitchNode.connect(gainNode);
        gainNode.connect(this._audioContext.destination);
        pitchNode.start();
        return {
          pitchNode: pitchNode,
          gainNode: gainNode
        };
      };

      KeyanoInstrument.prototype._stopPitchNodeWithoutPedal = function(pitchNode, gainNode) {
        return this._stopPitchNodeOverTime(pitchNode, gainNode, this.DURATION_WITHOUT_PEDAL);
      };

      KeyanoInstrument.prototype._stopPitchNodeWithPedal = function(pitchNode, gainNode) {
        return this._stopPitchNodeOverTime(pitchNode, gainNode, this.DURATION_WITH_PEDAL);
      };

      KeyanoInstrument.prototype._stopPitchNodeOverTime = function(pitchNode, gainNode, duration) {
        var pedalInterval, reductionPerInterval;
        reductionPerInterval = this.TIMEOUT / duration;
        return pedalInterval = setInterval((function(_this) {
          return function() {
            if (!_this._isPedalPressed) {
              clearInterval(pedalInterval);
              _this._stopPitchNodeWithoutPedal(pitchNode, gainNode);
            }
            gainNode.gain.value -= reductionPerInterval;
            if (gainNode.gain.value <= 0) {
              clearInterval(pedalInterval);
              return pitchNode.stop();
            }
          };
        })(this), this.TIMEOUT);
      };

      KeyanoInstrument.prototype._isPianoKeyPlaying = function(pianoKey) {
        var pitchNode;
        pitchNode = this._getActivePianoKey(pianoKey);
        return !!pitchNode;
      };

      KeyanoInstrument.prototype._saveActivePianoKeyInstance = function(pianoKey, _arg) {
        var gainNode, pitchNode;
        pitchNode = _arg.pitchNode, gainNode = _arg.gainNode;
        this._nodesForActivePianoKeys[pianoKey.id] = {
          pitchNode: pitchNode,
          gainNode: gainNode
        };
      };

      KeyanoInstrument.prototype._deleteActivePianoKeyInstance = function(pianoKey) {
        this._nodesForActivePianoKeys[pianoKey.id] = void 0;
      };

      KeyanoInstrument.prototype._getActivePianoKey = function(pianoKey) {
        return this._nodesForActivePianoKeys[pianoKey.id];
      };

      KeyanoInstrument.prototype.PIANO_KEY_INDICES = {
        'C': 0,
        'Db': 1,
        'D': 2,
        'Eb': 3,
        'E': 4,
        'F': 5,
        'Gb': 6,
        'G': 7,
        'Ab': 8,
        'A': 9,
        'Bb': 10,
        'B': 11
      };

      KeyanoInstrument.prototype._pianoKeyIdComparator = function(a, b) {
        var aIndex, aKey, aOctave, bIndex, bKey, bOctave;
        if (_.isEmpty(a) && _.isEmpty(b)) {
          return 0;
        }
        if (_.isEmpty(b)) {
          return -1;
        }
        if (_.isEmpty(a)) {
          return 1;
        }
        aOctave = parseInt(a[a.length - 1]);
        bOctave = parseInt(b[b.length - 1]);
        if (bOctave < aOctave) {
          return 1;
        }
        if (aOctave < bOctave) {
          return -1;
        }
        aKey = a.substring(0, a.length - 1);
        bKey = b.substring(0, b.length - 1);
        aIndex = this.PIANO_KEY_INDICES[aKey];
        bIndex = this.PIANO_KEY_INDICES[bKey];
        if (bIndex < aIndex) {
          return 1;
        }
        if (aIndex < bIndex) {
          return -1;
        }
        return 0;
      };

      return KeyanoInstrument;

    })();
    return KeyanoInstrument;
  });

}).call(this);

//# sourceMappingURL=KeyanoInstrument.js.map
