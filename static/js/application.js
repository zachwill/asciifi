(function() {
  var AsciiCharacter, Asciify, DropZone, ExternalImage, ImageFile, LinkButton, Ratio, ReadFiles, Setup, Upload, Usability;
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
      $('html, body').animate({
        scrollTop: 710
      });
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
      upload = input.siblings('.upload');
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
  LinkButton = (function() {
    /*
      Functionality for when the external link button is clicked.
      */    function LinkButton(selector) {
      var link;
      link = $(selector);
      link.click(function(event) {
        var input, value;
        input = $('.image-link');
        value = input.val();
        new ExternalImage(value);
        return false;
      }).popover({
        offset: 10,
        placement: "below",
        trigger: 'manual'
      }).hover(function(event) {
        var content, popover, self, tabs;
        self = $(this);
        tabs = $('.tabs');
        popover = $('.popover.below');
        if (!popover.length) {
          self.popover('show');
          content = self.siblings('.hidden').html();
          $('.popover.below').find('.content').html(content);
        }
        return tabs.click(function() {
          return self.popover('hide');
        });
      });
    }
    return LinkButton;
  })();
  ExternalImage = (function() {
    /*
      Get the base64 encoding for external images.
      */    function ExternalImage(image, character_max) {
      var component;
      component = encodeURIComponent(image);
      $.ajax({
        url: "http://img64.com/?q=" + component,
        dataType: "jsonp"
      }).then(function(data) {
        return new ImageFile(image, data, character_max);
      });
    }
    return ExternalImage;
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
        ratio = new Ratio(image.width, image.height, character_max);
        _ref = ratio.dimensions, width = _ref[0], height = _ref[1];
        ctx = document.createElement('canvas').getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        data = ctx.getImageData(0, 0, width, height).data;
        ascii = new Asciify(data, width, height);
        $('.photo').val(ascii.art);
        return window._image = {
          name: name,
          result: result
        };
      };
    }
    return ImageFile;
  })();
  Ratio = (function() {
    /*
      Determine image ratio when converting to Ascii art.
      */    function Ratio(width, height, character_max) {
      var ratio;
      if (width > height) {
        ratio = height / width;
        this.dimensions = [character_max, Math.floor(character_max * ratio)];
      } else {
        if (height > width) {
          character_max *= .625;
        }
        ratio = width / height;
        this.dimensions = [Math.floor(character_max * ratio), character_max];
      }
      return;
    }
    return Ratio;
  })();
  Asciify = (function() {
    /*
      Turn an image into Ascii text.
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
  Usability = (function() {
    /*
        Little usability enhancements.
        */    function Usability() {
      $('.photo').click(function() {
        return $(this).select();
      });
    }
    Usability.prototype.photo_font = function(value) {
      var size;
      if (value > 90) {
        if (value > 110) {
          size = 6;
        } else {
          size = 8;
        }
        return $('.photo').css('font-size', "" + size + "px");
      } else if (value < 50) {
        return $('.photo').css('font-size', "12px");
      } else {
        return $('.photo').css('font-size', '');
      }
    };
    return Usability;
  })();
  Setup = (function() {
    /*
        What happens when a user first visits the site.
        */    function Setup() {
      var usability;
      usability = new Usability;
      $('#slider').slider({
        max: 120,
        min: 20,
        value: 80,
        change: function(event) {
          var image, name, result, value, _ref;
          value = $(this).slider('value');
          usability.photo_font(value);
          image = window._image;
          _ref = [image.name, image.result], name = _ref[0], result = _ref[1];
          console.log(name, result, value);
          return new ImageFile(name, result, value);
        }
      });
      new ImageFile('zachwill', '/static/img/zach.png');
    }
    return Setup;
  })();
  (function() {
    new DropZone('.dropzone');
    new Upload('#files');
    new LinkButton('.link');
    return new Setup;
  })();
}).call(this);
