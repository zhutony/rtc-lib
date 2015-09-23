q = require('q')
EventEmitter = require('events').EventEmitter

Stream = require('./stream').Stream

class exports.StreamCollection extends EventEmitter

  constructor: (data, @streams={}) ->
    @defers = {}
    @waiting = {}
    @pending = {}

    @update(data)

  update: (data) ->
    members = []
    @waiting = {}

    # remove old streams

    for name, stream_p in @streams
      if not data[name]?
        # remove

        delete @streams[name]
        @emit('stream_removed', name)

        # close/fail

        if stream_p.isFullfilled()
          stream_p.then (stream) ->
            stream.close()
        else if stream_p.isPending()
          stream_p.reject(new Error("Stream removed before being established"))

    # update mappings

    for name, id of data
      # does stream exist?

      if not @streams[name]?
        # create stream promise

        defer = q.defer()

        @streams[name] = defer.promise
        @defers[name] = defer

        @emit('stream_added', name, defer.promise)

      # do we adjust stream initialization?

      if @defers[name]?
        if @pending[id]?
          # got it!

          stream = @pending[id]
          delete @pending[id]

          @defers[name].resolve(stream)
          delete @defers[name]

        else
          # add waiting mapping

          @waiting[id] = name


  resolve: (stream) ->
    if @waiting[stream.id]?
      # stream is expected

      name = @waiting[stream.id]
      delete @waiting[stream.id]

      @defers[name].resolve(new Stream(stream))
      delete @defers[name]

    else
      # lets hope someone wants this later ...

      @pending[stream.id] = new Stream(stream)