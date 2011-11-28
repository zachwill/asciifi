class DropZone
  ###
  Handle drag and drop functionality.
  ###
  constructor: (selector) ->
    selector = $(selector)
    selector.bind('dragover', -> false)
            .bind('drop', @drop)

  drop: (event) ->
    files = event.originalEvent.dataTransfer.files
    new ReadFiles(files)
    $('html, body').animate(scrollTop: 710)
    false


class Upload
  ###
  Upload files and clear out the resulting FileList.
  ###
  constructor: (selector) ->
    input = $(selector)
    upload = input.siblings('.upload')
    input.change( ->
      files = @files
      new ReadFiles(files)
      @value = ""
    )
    upload.click( (event) ->
      input.click()
      false
    )


class LinkButton
  ###
  Functionality for when the external link button is clicked.
  ###
  constructor: (selector) ->
    link = $(selector)
    link.click( (event) ->
      input = $('.image-link')
      value = input.val()
      new ExternalImage(value)
      false
    ).popover(
      offset: 10
      placement: "below"
      trigger: 'manual'
    ).hover( (event) ->
      self = $(this)
      tabs = $('.tabs')
      popover = $('.popover.below')
      if not popover.length
        self.popover('show')
        content = self.siblings('.hidden').html()
        $('.popover.below').find('.content').html(content)
      tabs.click(-> self.popover('hide'))
    )


class ExternalImage
  ###
  Get the base64 encoding for external images.
  ###
  constructor: (image, character_max) ->
    component = encodeURIComponent(image)
    $.ajax(
      url: "http://img64.com/?q=#{component}"
      dataType: "jsonp"
    ).then( (data) ->
      new ImageFile(image, data, character_max)
    )


class ReadFiles
  ###
  Read the image files and create new images.
  ###
  constructor: (files) ->
    for file in files
      do (file) ->
        reader = new FileReader
        reader.onload = (event) ->
          name = file.name
          result = event.target.result
          new ImageFile(name, result)
        reader.readAsDataURL(file)
    return


class ImageFile
  ###
  Create a new thumbnail for a newly dropped or uploaded image file.
  ###
  constructor: (name, result, character_max=80) ->
    value = $('#slider').slider('value')
    character_max = value or character_max
    image = new Image
    image.src = result
    image.onload = ->
      ratio = new Ratio(image.width, image.height, character_max)
      [width, height] = ratio.dimensions
      ctx = document.createElement('canvas').getContext('2d')
      ctx.drawImage(image, 0, 0, width, height)
      data = ctx.getImageData(0, 0, width, height).data
      ascii = new Asciify(data, width, height)
      $('.photo').val(ascii.art)
      window._image = name: name, result: result


class Ratio
  ###
  Determine image ratio when converting to Ascii art.
  ###
  constructor: (width, height, character_max) ->
    if width > height
      ratio = height / width
      @dimensions = [character_max, Math.floor(character_max * ratio)]
    else
      if height > width
        # Conform to 8x5 dimensions.
        character_max *= .625
      ratio = width / height
      @dimensions = [Math.floor(character_max * ratio), character_max]
    return


class Asciify
  ###
  Turn an image into Ascii text.
  ###
  constructor: (data, output_width, output_height) ->
    [height_range, width_range] = [[1..output_height], [1..output_width]]
    characters = []
    for height in height_range
      for width in width_range
        offset = (height * output_width + width) * 4
        [red, green, blue, alpha] = (data[i] for i in [offset..offset+3])
        letter = new AsciiCharacter(red, green, blue, alpha)
        characters.push letter.value
      characters.push('\n')
    @art = characters.join('')


class AsciiCharacter
  ###
  Return the Ascii character representation for RGB input.
  ###
  constructor: (red, green, blue, alpha) ->
    ascii = $('#variants').val()
    if alpha is 0 or alpha is undefined
      # Then, the pixel is transparent.
      return @value = ' '
    brightness = (3 * red + 4 * green + blue) >>> 3
    @value = ascii[Math.floor(brightness / 256 * ascii.length)]


class RefreshImage
  ###
  Refresh the ASCII art image.
  ###
  constructor: (value) ->
    value ||= $('#slider').slider('value')
    input = $('.width')
    input.val(value)
    @photo_font(value)
    image = window._image
    [name, result] = [image.name, image.result]
    new ImageFile(name, result, value)

  photo_font: (value) ->
    if value > 90
      if value > 110
        size = 6
      else
        size = 8
      $('.photo').css('font-size', "#{size}px")
    else if value < 50
      $('.photo').css('font-size', "12px")
    else
      $('.photo').css('font-size', '')


class Usability
    ###
    Little usability enhancements.
    ###
    constructor: ->
      $('.photo').click(-> $(this).select())
      form = $('#slider').siblings('form')
      form.submit( (event) ->
        value = $(this).find('.width').val()
        $('#slider').slider('value', value)
        false
      )


class Setup
    ###
    Tie up all loose ends for ASCII art functionality.
    ###
    constructor: ->
      new Usability
      $('#slider').slider(
        max: 120,
        min: 20,
        value: 80,
        change: (event) ->
          self = $(this)
          value = self.slider('value')
          new RefreshImage(value)
      )
      $('#variants').change(-> new RefreshImage)
      new ImageFile('zachwill', '/static/img/zach.png')


class CheckFlashPlayer
  ###
  Check that Flash is present -- if not, then Popcorn won't work, so
  a Vimeo iframe should be embedded.
  ###
  constructor: ->
    if not swfobject.hasFlashPlayerVersion('11')
      $('#video').html("""
        <iframe src="http://player.vimeo.com/video/32772167"
                width="560" height="350" frameborder="0" webkitAllowFullScreen
                allowFullScreen></iframe>
      """)


do ->
  new DropZone('.dropzone')
  new Upload('#files')
  new LinkButton('.link')
  new Setup
  new CheckFlashPlayer


do ->
  # And, finally, the Popcorn / Vimeo interaction...
  song = '/static/img/song'
  Popcorn.vimeo('#video', 'http://vimeo.com/32772167')

  .code(
    start: .1
    onStart: ->
      $('#slider').slider('value', 120)
  )

  .code(
    start: 2, end: 3
    onStart: ->
      new ImageFile('delorean', "#{song}/delorean.jpeg")
    onEnd: ->
      $('html, body').animate(scrollTop: 710)
      $('textarea').animate(height: 525)
  )

  .code(
    start: 6
    onStart: ->
      new ImageFile('star wars', "#{song}/star_wars.jpeg")
  )

  .code(
    start: 8
    onStart: ->
      new ImageFile('bennigans', "#{song}/bennigans.jpeg")
  )

  .code(
    start: 9.5
    onStart: ->
      new ImageFile('boba fett', "#{song}/boba_fett.jpeg")
  )

  .code(
    start: 12
    onStart: ->
      new ImageFile('hesitate', "#{song}/hesitate.jpeg")
  )

  .code(
    start: 14
    onStart: ->
      new ImageFile('darth vader', "#{song}/darth.jpeg")
  )

  .code(
    start: 16
    onStart: ->
      new ImageFile('skywalker', "#{song}/skywalker.jpeg")
  )

  .code(
    start: 19
    onStart: ->
      new ImageFile('han solo', "#{song}/solo.jpeg")
  )

  .code(
    start: 21
    onStart: ->
      new ImageFile('yoda', "#{song}/yoda.jpeg")
  )

  .code(
    start: 22
    onStart: ->
      new ImageFile('money', "#{song}/money.png")
  )

  .code(
    start: 24
    onStart: ->
      new ImageFile('jawas', "#{song}/jawas.jpeg")
  )

  .code(
    start: 26
    onStart: ->
      new ImageFile('cook', "#{song}/cook.jpeg")
  )

  .code(
    start: 27
    onStart: ->
      new ImageFile('hook', "#{song}/hook.jpeg")
  )

  .code(
    start: 29
    onStart: ->
      new ImageFile('quick', "#{song}/quick.png")
  )

  .code(
    start: 30
    onStart: ->
      new ImageFile('mask', "#{song}/mask.jpeg")
  )

  .code(
    start: 32
    onStart: ->
      new ImageFile('detention', "#{song}/detention.jpeg")
  )

  .code(
    start: 35
    onStart: ->
      new ImageFile('jets', "#{song}/jets.jpeg")
  )

  .code(
    start: 37
    onStart: ->
      new ImageFile('boba fett', "#{song}/boba_fett.jpeg")
  )

  .code(
    start: 39
    onStart: ->
      new ImageFile('jabba', "#{song}/jabba.jpeg")
  )

  .code(
    start: 41
    onStart: ->
      new ImageFile('ship', "#{song}/ship.jpeg")
  )

  .code(
    start: 44
    onStart: ->
      new ImageFile('mask', "#{song}/mask.jpeg")
  )

  .code(
    start: 48, end: 50
    onStart: ->
      new ImageFile('boba fett', "#{song}/boba_fett.jpeg")
    onEnd: ->
      $('html, body').animate(scrollTop: 0)
  )

  .code(
    start: 52
    onStart: ->
      $('textarea').css('height', '')
  )
