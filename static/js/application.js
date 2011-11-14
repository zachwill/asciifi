(function() {
  var AsciiCharacter, Asciify, DropZone, ImageFile, ReadFiles, Upload;
  DropZone = (function() {
    /*
      Handle drag and drop functionality.
      */    function DropZone(selector) {
      selector = $(selector);
      selector.bind('dragover', function() {
        return false;
      }).bind('drop', this.drop);
    }
    DropZone.prototype.drop = function(event) {
      var files;
      files = event.originalEvent.dataTransfer.files;
      new ReadFiles(files);
      return false;
    };
    return DropZone;
  })();
  Upload = (function() {
    /*
      Upload files and clear out the resulting FileList.
      */    function Upload(selector) {
      var input, upload;
      input = $(selector);
      upload = input.siblings('a');
      input.change(function() {
        var files;
        files = this.files;
        new ReadFiles(files);
        return this.value = "";
      });
      upload.click(function(event) {
        input.click();
        return false;
      });
    }
    return Upload;
  })();
  ReadFiles = (function() {
    /*
      Read the image files and create new images.
      */    function ReadFiles(files) {
      var file, _fn, _i, _len;
      _fn = function(file) {
        var reader;
        reader = new FileReader();
        reader.onload = function(event) {
          var name, result;
          name = file.name;
          result = event.target.result;
          return new ImageFile(name, result);
        };
        return reader.readAsDataURL(file);
      };
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _fn(file);
      }
      return;
    }
    return ReadFiles;
  })();
  ImageFile = (function() {
    /*
      Create a new thumbnail for a newly dropped or uploaded image file.
      */    function ImageFile(name, result) {
      var ascii;
      this.name = name;
      this.result = result;
      ascii = new Asciify(result);
      console.log(ascii.art);
    }
    return ImageFile;
  })();
  Asciify = (function() {
    /*
      Turn an image into Ascii text. The height of the output is determined
      by the 8x5 dimensions of the bounding box.
      */    function Asciify(data, max_width) {
      var blue, characters, ctx, green, height, image, letter, max_height, num, red, width, _ref;
      if (max_width == null) {
        max_width = 80;
      }
      image = new Image;
      image.src = data;
      max_height = Math.floor(.3 * max_width);
      ctx = document.getElementById('canvas').getContext('2d');
      ctx.drawImage(image, 0, 0, max_width, max_height);
      data = ctx.getImageData(0, 0, max_width, max_height).data;
      characters = [];
      for (height = 1; 1 <= max_height ? height <= max_height : height >= max_height; 1 <= max_height ? height++ : height--) {
        for (width = 1; 1 <= max_width ? width <= max_width : width >= max_width; 1 <= max_width ? width++ : width--) {
          num = (height * max_width + width) * 4;
          _ref = [data[num], data[num + 1], data[num + 2]], red = _ref[0], green = _ref[1], blue = _ref[2];
          letter = new AsciiCharacter(red, green, blue);
          characters.push(letter.value);
        }
        characters.push('\n');
      }
      this.art = characters.join('');
    }
    return Asciify;
  })();
  AsciiCharacter = (function() {
    function AsciiCharacter(red, green, blue) {
      var ascii, brightness;
      ascii = "@8CLftli;:,. ";
      brightness = (3 * red + 4 * green + blue) >>> 3;
      this.value = ascii[Math.floor(brightness / 256 * ascii.length)];
    }
    return AsciiCharacter;
  })();
  (function() {
    new DropZone('.dropzone');
    return new Upload('#files');
  })();
}).call(this);
