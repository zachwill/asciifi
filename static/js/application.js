(function() {
  var AsciiCharacter, Asciify, DropZone, ImageFile, Ratio, ReadFiles, Upload;
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
        reader = new FileReader;
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
      */    function ImageFile(name, result, character_max) {
      var image;
      if (character_max == null) {
        character_max = 80;
      }
      image = new Image;
      image.src = result;
      image.onload = function() {
        var ascii, ctx, data, height, ratio, width, _ref;
        ratio = new Ratio(image.height, image.width, character_max);
        _ref = ratio.dimensions, width = _ref[0], height = _ref[1];
        ctx = document.createElement('canvas').getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        data = ctx.getImageData(0, 0, width, height).data;
        ascii = new Asciify(data, width, height);
        return console.log(ascii.art);
      };
    }
    return ImageFile;
  })();
  Ratio = (function() {
    /*
      Determine image ratio when converting to Ascii art.
      */    function Ratio(height, width, character_max) {
      var ratio;
      if (width > height) {
        ratio = height / width;
        this.dimensions = [character_max, Math.floor(character_max * ratio)];
      } else {
        ratio = width / height;
        this.dimensions = [Math.floor(character_max * ratio), character_max];
      }
      return;
    }
    return Ratio;
  })();
  Asciify = (function() {
    /*
      Turn an image into Ascii text. The height of the output is determined
      by the 8x5 dimensions of the bounding box.
      */    function Asciify(data, output_width, output_height) {
      var alpha, blue, characters, green, height, height_range, i, letter, offset, red, width, width_range, _i, _j, _k, _l, _len, _len2, _ref, _ref2, _results, _results2;
      _ref = [
        (function() {
          _results = [];
          for (var _i = 1; 1 <= output_height ? _i <= output_height : _i >= output_height; 1 <= output_height ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this), (function() {
          _results2 = [];
          for (var _j = 1; 1 <= output_width ? _j <= output_width : _j >= output_width; 1 <= output_width ? _j++ : _j--){ _results2.push(_j); }
          return _results2;
        }).apply(this)
      ], height_range = _ref[0], width_range = _ref[1];
      characters = [];
      for (_k = 0, _len = height_range.length; _k < _len; _k++) {
        height = height_range[_k];
        for (_l = 0, _len2 = width_range.length; _l < _len2; _l++) {
          width = width_range[_l];
          offset = (height * output_width + width) * 4;
          _ref2 = (function() {
            var _ref2, _results3;
            _results3 = [];
            for (i = offset, _ref2 = offset + 3; offset <= _ref2 ? i <= _ref2 : i >= _ref2; offset <= _ref2 ? i++ : i--) {
              _results3.push(data[i]);
            }
            return _results3;
          })(), red = _ref2[0], green = _ref2[1], blue = _ref2[2], alpha = _ref2[3];
          letter = new AsciiCharacter(red, green, blue, alpha);
          characters.push(letter.value);
        }
        characters.push('\n');
      }
      this.art = characters.join('');
    }
    return Asciify;
  })();
  AsciiCharacter = (function() {
    /*
      Return the Ascii character representation for RGB input.
      */    function AsciiCharacter(red, green, blue, alpha) {
      var ascii, brightness;
      ascii = "@GCLftli;:,. ";
      if (alpha === 0 || alpha === void 0) {
        return this.value = ' ';
      }
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
