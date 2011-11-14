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
    return false


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
      return false
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
    ascii = new Asciify(result)
    console.log ascii.art


class Asciify
  ###
  Turn an image into Ascii text. The height of the output is determined
  by the 8x5 dimensions of the bounding box.
  ###
  constructor: (image_data, max_width=80) ->
    max_height = Math.floor(.3 * max_width)
    data = @create_canvas_image(image_data, max_width, max_height)
    [height_range, width_range] = [[1..max_height], [1..max_width]]
    characters = []
    for height in height_range
      for width in width_range
        num = (height * max_width + width) * 4
        [red, green, blue] = [data[num], data[num + 1], data[num + 2]]
        letter = new AsciiCharacter(red, green, blue)
        characters.push letter.value
      characters.push('\n')
    @art = characters.join('')

  create_canvas_image: (image_data, max_width, max_height) ->
    image = new Image
    image.src = image_data
    ctx = document.getElementById('canvas').getContext('2d')
    ctx.drawImage(image, 0, 0, max_width, max_height)
    data = ctx.getImageData(0, 0, max_width, max_height).data
    return data


class AsciiCharacter
  ###
  Return the Ascii character representation for RGB input.
  ###
  constructor: (red, green, blue) ->
    # TODO: Ascii variants
    ascii = "@8CLftli;:,. "
    brightness = (3 * red + 4 * green + blue) >>> 3
    @value = ascii[Math.floor(brightness / 256 * ascii.length)]


do ->
  new DropZone('.dropzone')
  new Upload('#files')
