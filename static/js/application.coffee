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
    upload = input.siblings('a')
    input.change( ->
      files = @files
      new ReadFiles(files)
      @value = ""
    )
    upload.click( (event) ->
      input.click()
      false
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
  constructor: (name, result, max_width=80) ->
    image = new Image
    image.src = result
    image.onload = ->
      ratio = image.height / image.width
      max_height = Math.floor(max_width * ratio)
      ctx = document.createElement('canvas').getContext('2d')
      ctx.drawImage(image, 0, 0, max_width, max_height)
      data = ctx.getImageData(0, 0, max_width, max_height).data
      ascii = new Asciify(data, max_width, ratio)
      console.log ascii.art


class Asciify
  ###
  Turn an image into Ascii text. The height of the output is determined
  by the 8x5 dimensions of the bounding box.
  ###
  constructor: (data, max_width=80, ratio) ->
    max_height = Math.floor(max_width * ratio)
    [height_range, width_range] = [[1..max_height], [1..max_width]]
    characters = []
    for height in height_range
      for width in width_range
        num = (height * max_width + width) * 4
        [red, green, blue, alpha] = [data[num], data[num + 1], data[num + 2], data[num + 3]]
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
