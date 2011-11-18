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
      tabs.click(-> self.popover('hide'))
    )


class ExternalImage
  ###
  Get the base64 encoding for external images.
  ###
  constructor: (image) ->
    component = encodeURIComponent(image)
    $.ajax(
      url: "http://img64.com/?q=#{component}"
      dataType: "jsonp"
    ).then( (data) ->
      new ImageFile(image, data)
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
    image = new Image
    image.src = result
    image.onload = ->
      ratio = new Ratio(image.width, image.height, character_max)
      [width, height] = ratio.dimensions
      ctx = document.createElement('canvas').getContext('2d')
      ctx.drawImage(image, 0, 0, width, height)
      data = ctx.getImageData(0, 0, width, height).data
      ascii = new Asciify(data, width, height)
      console.log ascii.art


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
    # TODO: Ascii variants
    ascii = "@GCLftli;:,. "
    if alpha is 0 or alpha is undefined
      # Then, the pixel is transparent.
      return @value = ' '
    brightness = (3 * red + 4 * green + blue) >>> 3
    @value = ascii[Math.floor(brightness / 256 * ascii.length)]


do ->
  new DropZone('.dropzone')
  new Upload('#files')
  new LinkButton('.link')
