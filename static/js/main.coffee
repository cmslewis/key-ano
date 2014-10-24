require [
  'static/js/KeyCodes'
  'static/js/PianoKeys'
  'static/js/KeyanoKeyValidator'
  'static/js/KeyanoKeyInstrument'
], (
  KeyCodes
  PianoKeys
  KeyanoKeyValidator
  KeyanoKeyInstrument
) ->

  $(document).ready ->

    keyanoInstrument = new KeyanoInstrument()

    keyanoInstrument.activateKeys([

      # Left Hand

      { keyCode : KeyCodes.A, pianoKey : PianoKeys.C3  }
      { keyCode : KeyCodes.W, pianoKey : PianoKeys.Db3 }
      { keyCode : KeyCodes.S, pianoKey : PianoKeys.D3  }
      { keyCode : KeyCodes.E, pianoKey : PianoKeys.Eb3 }
      { keyCode : KeyCodes.D, pianoKey : PianoKeys.E3  }
      { keyCode : KeyCodes.F, pianoKey : PianoKeys.F3  }
      { keyCode : KeyCodes.T, pianoKey : PianoKeys.Gb3 }

      # Right Hand

      { keyCode : KeyCodes.U,         pianoKey : PianoKeys.Gb3 }
      { keyCode : KeyCodes.J,         pianoKey : PianoKeys.G3  }
      { keyCode : KeyCodes.I,         pianoKey : PianoKeys.Ab3 }
      { keyCode : KeyCodes.K,         pianoKey : PianoKeys.A3  }
      { keyCode : KeyCodes.O,         pianoKey : PianoKeys.Bb3 }
      { keyCode : KeyCodes.L,         pianoKey : PianoKeys.B3  }
      { keyCode : KeyCodes.SEMICOLON, pianoKey : PianoKeys.C4  }

    ])
