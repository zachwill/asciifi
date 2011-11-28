(function() {
  var AsciiCharacter, Asciify, CheckFlashPlayer, DropZone, ExternalImage, ImageFile, LinkButton, Ratio, ReadFiles, RefreshImage, Setup, Upload, Usability;
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
      var image, value;
      if (character_max == null) {
        character_max = 80;
      }
      value = $('#slider').slider('value');
      character_max = value || character_max;
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
      ascii = $('#variants').val();
      if (alpha === 0 || alpha === void 0) {
        return this.value = ' ';
      }
      brightness = (3 * red + 4 * green + blue) >>> 3;
      this.value = ascii[Math.floor(brightness / 256 * ascii.length)];
    }
    return AsciiCharacter;
  })();
  RefreshImage = (function() {
    /*
      Refresh the ASCII art image.
      */    function RefreshImage(value) {
      var image, input, name, result, _ref;
      value || (value = $('#slider').slider('value'));
      input = $('.width');
      input.val(value);
      this.photo_font(value);
      image = window._image;
      _ref = [image.name, image.result], name = _ref[0], result = _ref[1];
      new ImageFile(name, result, value);
    }
    RefreshImage.prototype.photo_font = function(value) {
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
    return RefreshImage;
  })();
  Usability = (function() {
    /*
        Little usability enhancements.
        */    function Usability() {
      var form;
      $('.photo').click(function() {
        return $(this).select();
      });
      form = $('#slider').siblings('form');
      form.submit(function(event) {
        var value;
        value = $(this).find('.width').val();
        $('#slider').slider('value', value);
        return false;
      });
    }
    return Usability;
  })();
  Setup = (function() {
    /*
        Tie up all loose ends for ASCII art functionality.
        */    function Setup() {
      new Usability;
      $('#slider').slider({
        max: 120,
        min: 20,
        value: 80,
        change: function(event) {
          var self, value;
          self = $(this);
          value = self.slider('value');
          return new RefreshImage(value);
        }
      });
      $('#variants').change(function() {
        return new RefreshImage;
      });
      new ImageFile('zachwill', '/static/img/zach.png');
    }
    return Setup;
  })();
  CheckFlashPlayer = (function() {
    /*
      Check that Flash is present -- if not, then Popcorn won't work, so
      a Vimeo iframe should be embedded.
      */    function CheckFlashPlayer() {
      if (!swfobject.hasFlashPlayerVersion('11')) {
        $('#video').html("<iframe src=\"http://player.vimeo.com/video/32772167\"\n        width=\"560\" height=\"350\" frameborder=\"0\" webkitAllowFullScreen\n        allowFullScreen></iframe>");
      }
    }
    return CheckFlashPlayer;
  })();
  (function() {
    new DropZone('.dropzone');
    new Upload('#files');
    new LinkButton('.link');
    new Setup;
    return new CheckFlashPlayer;
  })();
  (function() {
    var song;
    song = '/static/img/song';
    return Popcorn.vimeo('#video', 'http://vimeo.com/32772167').code({
      start: .1,
      onStart: function() {
        return $('#slider').slider('value', 120);
      }
    }).code({
      start: 2,
      end: 3,
      onStart: function() {
        return new ImageFile('delorean', "" + song + "/delorean.jpeg");
      },
      onEnd: function() {
        $('html, body').animate({
          scrollTop: 710
        });
        return $('textarea').animate({
          height: 525
        });
      }
    }).code({
      start: 6,
      onStart: function() {
        return new ImageFile('star wars', "" + song + "/star_wars.jpeg");
      }
    }).code({
      start: 8,
      onStart: function() {
        return new ImageFile('bennigans', "" + song + "/bennigans.jpeg");
      }
    }).code({
      start: 9.5,
      onStart: function() {
        return new ImageFile('boba fett', "" + song + "/boba_fett.jpeg");
      }
    }).code({
      start: 12,
      onStart: function() {
        return new ImageFile('hesitate', "" + song + "/hesitate.jpeg");
      }
    }).code({
      start: 14,
      onStart: function() {
        return new ImageFile('darth vader', "" + song + "/darth.jpeg");
      }
    }).code({
      start: 16,
      onStart: function() {
        return new ImageFile('skywalker', "" + song + "/skywalker.jpeg");
      }
    }).code({
      start: 19,
      onStart: function() {
        return new ImageFile('han solo', "" + song + "/solo.jpeg");
      }
    }).code({
      start: 21,
      onStart: function() {
        return new ImageFile('yoda', "" + song + "/yoda.jpeg");
      }
    }).code({
      start: 22,
      onStart: function() {
        return new ImageFile('money', "" + song + "/money.png");
      }
    }).code({
      start: 24,
      onStart: function() {
        return new ImageFile('jawas', "" + song + "/jawas.jpeg");
      }
    }).code({
      start: 26,
      onStart: function() {
        return new ImageFile('cook', "" + song + "/cook.jpeg");
      }
    }).code({
      start: 27,
      onStart: function() {
        return new ImageFile('hook', "" + song + "/hook.jpeg");
      }
    }).code({
      start: 29,
      onStart: function() {
        return new ImageFile('quick', "" + song + "/quick.png");
      }
    }).code({
      start: 30,
      onStart: function() {
        return new ImageFile('mask', "" + song + "/mask.jpeg");
      }
    }).code({
      start: 32,
      onStart: function() {
        return new ImageFile('detention', "" + song + "/detention.jpeg");
      }
    }).code({
      start: 35,
      onStart: function() {
        return new ImageFile('jets', "" + song + "/jets.jpeg");
      }
    }).code({
      start: 37,
      onStart: function() {
        return new ImageFile('boba fett', "" + song + "/boba_fett.jpeg");
      }
    }).code({
      start: 39,
      onStart: function() {
        return new ImageFile('jabba', "" + song + "/jabba.jpeg");
      }
    }).code({
      start: 41,
      onStart: function() {
        return new ImageFile('ship', "" + song + "/ship.jpeg");
      }
    }).code({
      start: 44,
      onStart: function() {
        return new ImageFile('mask', "" + song + "/mask.jpeg");
      }
    }).code({
      start: 48,
      end: 50,
      onStart: function() {
        return new ImageFile('boba fett', "" + song + "/boba_fett.jpeg");
      },
      onEnd: function() {
        return $('html, body').animate({
          scrollTop: 0
        });
      }
    }).code({
      start: 52,
      onStart: function() {
        return $('textarea').css('height', '');
      }
    });
  })();
}).call(this);
