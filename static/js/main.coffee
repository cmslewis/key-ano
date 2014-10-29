require [
  # General
  'static/js/KeyCodes'
  'static/js/PianoKeys'
  'static/js/KeyanoInstrument'
  # Listeners
  'static/js/listeners/KeyanoDomElementHighlighter'
  'static/js/listeners/KeyanoChordTypeReporter'
], (
  # General
  KeyCodes
  PianoKeys
  KeyanoInstrument
  # Listeners
  KeyanoDomElementHighlighter
  KeyanoChordTypeReporter
) ->

  KEYANO_KEY_SELECTOR             = '.keyano-key'
  CACHED_KEYANO_KEY_DOM_ELEMENTS = {}
  KEYANO_KEYS                    = [

    # Left Hand

    { keyCode : KeyCodes.Z,        pianoKey : PianoKeys.C3  }
    { keyCode : KeyCodes.S,        pianoKey : PianoKeys.Db3 }
    { keyCode : KeyCodes.X,        pianoKey : PianoKeys.D3  }
    { keyCode : KeyCodes.D,        pianoKey : PianoKeys.Eb3 }
    { keyCode : KeyCodes.C,        pianoKey : PianoKeys.E3  }
    { keyCode : KeyCodes.Q,        pianoKey : PianoKeys.C4  }
    { keyCode : KeyCodes.KEYPAD_2, pianoKey : PianoKeys.Db4 }
    { keyCode : KeyCodes.W,        pianoKey : PianoKeys.D4  }
    { keyCode : KeyCodes.KEYPAD_3, pianoKey : PianoKeys.Eb4 }
    { keyCode : KeyCodes.E,        pianoKey : PianoKeys.E4  }
    { keyCode : KeyCodes.R,        pianoKey : PianoKeys.F4  }
    { keyCode : KeyCodes.KEYPAD_5, pianoKey : PianoKeys.Gb4 }

    # Right Hand

    { keyCode : KeyCodes.KEYPAD_7, pianoKey : PianoKeys.Gb4 }
    { keyCode : KeyCodes.U,        pianoKey : PianoKeys.G4  }
    { keyCode : KeyCodes.KEYPAD_8, pianoKey : PianoKeys.Ab4 }
    { keyCode : KeyCodes.I,        pianoKey : PianoKeys.A4  }
    { keyCode : KeyCodes.KEYPAD_9, pianoKey : PianoKeys.Bb4 }
    { keyCode : KeyCodes.O,        pianoKey : PianoKeys.B4  }
    { keyCode : KeyCodes.P,        pianoKey : PianoKeys.C5  }

  ]

  $(document).ready ->
    keyanoInstrument = new KeyanoInstrument()
    keyanoInstrument.activateKeys(KEYANO_KEYS)

    keyanoDomElementHighlighter = new KeyanoDomElementHighlighter({
      instrument : keyanoInstrument
    }).activate(KEYANO_KEYS)

    keyanoChordTypeReporter = new KeyanoChordTypeReporter({
      instrument : keyanoInstrument
    }).activate(KEYANO_KEYS)

    return

