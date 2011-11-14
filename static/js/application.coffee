class DropZone
  ###
  Handle drag and drop functionality.
  ###

  constructor: (selector) ->
    selector = $(selector)
    selector.bind('dragover', -> false)
            .bind('drop', @drop)

  drop: (event) ->
    files = event.files
    new ReadFiles(files)
    return false


class Upload
  ###
  Upload files and clear out the resulting FileList.
  ###

  constructor: (selector) ->
    $(selector).change( ->
      files = this.files
      new ReadFiles(files)
      this.value = ""
    )


class ReadFiles
  ###
  Read the image files and create new images.
  ###

  constructor: (files) ->
    for file in files
      do (file) ->
        reader = new FileReader()
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

  constructor: (@name, @result) ->
    console.log "ohai #{name} #{result}"


class Asciify
  ###
  Turn an image into Ascii text. The height of the output is determined
  by the 8x5 dimensions of the bounding box.
  ###

  constructor: (data, max_width=80) ->
    image = new Image
    image.src = data
    max_height = Math.floor(.3 * max_width)
    ctx = document.getElementById('canvas').getContext('2d')
    ctx.drawImage(image, 0, 0, max_width, max_height)
    data = ctx.getImageData(0, 0, max_width, max_height).data
    characters = []
    for height in [0...max_height]
      for width in [0...max_width]
        num = (height * max_width + width) * 4
        characters.push @ascii_char(data[num], data[num + 1], data[num + 2])
      characters.push('\n')
    chararacters.join('')

  ascii_char: (red, green, blue) ->
    # TODO: Ascii variants
    ascii = "@GCLftli;:,. "
    brightness = 3 * red + 4 * green + blue
    ascii[Math.floor(brightness / 256 * ascii.length)]


do ->
  new DropZone('.dropzone')
  new Upload('#files')
