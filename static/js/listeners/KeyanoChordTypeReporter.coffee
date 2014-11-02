define [
  'static/js/listeners/AbstractKeyanoListener'
  'static/js/data/ChordData'
], (
  AbstractKeyanoListener
  ChordData
) ->

  IntervalName =
    1  : 'Minor 2nd'
    2  : 'Major 2nd'
    3  : 'Minor 3rd'
    4  : 'Major 3rd'
    5  : 'Perfect 4th'
    6  : 'Tritone'
    7  : 'Perfect 5th'
    8  : 'Minor 6th'
    9  : 'Major 6th'
    10 : 'Minor 7th'
    11 : 'Major 7th'
    12 : 'Octave'
    13 : 'Minor 9th'
    14 : 'Major 9th'
    15 : 'Minor 10th'
    16 : 'Major 10th'
    17 : 'Perfect 11th'
    18 : 'Diminished 12th'
    19 : 'Perfect 12th'


  class KeyanoChordTypeReporter extends AbstractKeyanoListener


    # Instance Variables
    # ------------------

    keyanoKeys : null


    # Overridden Methods
    # ------------------

    activate : (keyanoKeys, $outputElem) ->
      @keyanoKeys  = keyanoKeys
      @$outputElem = $outputElem
      super

    onPianoKeyStartedPlaying : (ev, pianoKeyId) ->
      @_printChord()
      return

    onPianoKeyStoppedPlaying : (ev, pianoKeyId) ->
      @_printChord()
      return


    # Private Methods
    # ---------------

    _printChord : ->
      impressedPianoKeys = @instrument.getImpressedPianoKeys()

      if impressedPianoKeys.length <= 1
        @$outputElem?.text('')
        return
      else if impressedPianoKeys.length is 2
        name = @_identifyInterval(impressedPianoKeys)
      else
        name = @_identifyChord(impressedPianoKeys)

      @$outputElem?.text(name)

      return

    _identifyInterval : (pianoKeys) ->
      if _.size(pianoKeys) < 2
        throw new Error 'Not enough piano keys provided to _identifyInterval (need exactly 2)'
      if _.size(pianoKeys) > 2
        throw new Error 'Too many piano keys provided to _identifyInterval (need exactly 2)'

      [lowerKey, higherKey] = pianoKeys
      intervalSize = @_getIntervalSize(lowerKey, higherKey)

      if not IntervalName[intervalSize]?
        throw new Error "This interval size (#{intervalSize}) is not explicitly named in the IntervalName object"

      return IntervalName[intervalSize]

    ###
    Returns the name of the chord indicated by the provided piano key combination.
    @params
      pianoKeys : [
        <pianoKeyId> (string),
        ...
      ]
    @return
      (string) the name of the chord (e.g. CM7)
    ###
    _identifyChord : (pianoKeys) ->
      # If there are only three keys in pianoKeys, then filtering out a higher duplicate will make the resultant pair
      # be identified as an interval (e.g. Major 3rd, Perfect Fifth). It'd be weird to identify a three-note
      # combination as an interval; thus, we only filter out duplicates if there are four or more keys provided.
      if _.size(pianoKeys) >= 4
        filteredKeys = @_rejectHigherDuplicatesOfLowerKeys(pianoKeys)
      else
        filteredKeys = pianoKeys

      signature    = @_getIntervalSizesSignature(filteredKeys)
      chordData    = ChordData[signature]

      chordName = null
      if chordData?
        rootKeyName = filteredKeys[chordData.root].name
        chordName   = "#{rootKeyName} #{chordData.quality}"
      else
        chordName = signature
      return chordName

    _rejectHigherDuplicatesOfLowerKeys : (pianoKeys) ->
      seenKeyNames = new Set()
      uniqueKeys   = []

      # This loop assumes that pianoKeys is already sorted in ascending order of key index.
      for pianoKey in pianoKeys
        if seenKeyNames.has(pianoKey.name)
          continue
        seenKeyNames.add(pianoKey.name)
        uniqueKeys.push(pianoKey)

      return uniqueKeys

    _getIntervalSizes : (pianoKeys) ->
      intervalSizes = [0] # 0 Represents the first key being in unison with itself.

      for i in [1...pianoKeys.length]
        lastPianoKey = pianoKeys[i - 1]
        currPianoKey = pianoKeys[i]
        intervalSize = @_getIntervalSize(lastPianoKey, currPianoKey)
        intervalSizes.push(intervalSize)

      return intervalSizes

    ###
    @params
      pianoKeyA, pianoKeyB : {
        id        : (string)
        frequency : (float)
        index     : (integer)
      }
    @return
      (integer) the size of the interval
    ###
    _getIntervalSize : (pianoKeyA, pianoKeyB) ->
      return Math.abs(pianoKeyB.index - pianoKeyA.index)

    _getIntervalSizesSignature : (pianoKeys) ->
      intervalSizes = @_getIntervalSizes(pianoKeys)
      signature = intervalSizes.join('-')
      return signature


  return KeyanoChordTypeReporter
