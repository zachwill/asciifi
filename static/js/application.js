(function() {
  var Asciify, DropZone, ImageFile, ReadFiles, Upload;
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
      var input, label;
      input = $(selector);
      label = input.parent('label');
      input.change(function() {
        var files;
        files = this.files;
        new ReadFiles(files);
        return this.value = "";
      }).click(function(event) {
        return event.stopPropagation();
      });
      label.click(function() {
        if ($.browser.mozilla) {
          return input.click();
        }
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
      this.name = name;
      this.result = result;
      console.log("ohai " + name + " " + result);
    }
    return ImageFile;
  })();
  Asciify = (function() {
    /*
      Turn an image into Ascii text. The height of the output is determined
      by the 8x5 dimensions of the bounding box.
      */    function Asciify(data, max_width) {
      var characters, ctx, height, image, max_height, num, width;
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
      for (height = 0; 0 <= max_height ? height < max_height : height > max_height; 0 <= max_height ? height++ : height--) {
        for (width = 0; 0 <= max_width ? width < max_width : width > max_width; 0 <= max_width ? width++ : width--) {
          num = (height * max_width + width) * 4;
          characters.push(this.ascii_char(data[num], data[num + 1], data[num + 2]));
        }
        characters.push('\n');
      }
      chararacters.join('');
    }
    Asciify.prototype.ascii_char = function(red, green, blue) {
      var ascii, brightness;
      ascii = "@GCLftli;:,. ";
      brightness = 3 * red + 4 * green + blue;
      return ascii[Math.floor(brightness / 256 * ascii.length)];
    };
    return Asciify;
  })();
  (function() {
    new DropZone('.dropzone');
    return new Upload('#files');
  })();
}).call(this);
