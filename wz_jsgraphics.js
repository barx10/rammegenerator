// Lightweight canvas-backed jsGraphics shim used by the calculator.
(function(global){
  function JsGraphics(targetId){
    this.container = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
    if (!this.container) throw new Error('jsGraphics target not found');

    this.canvas = this.container.querySelector('canvas');
    if (!this.canvas){
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'cnv';
      this.canvas.width = 1200;
      this.canvas.height = 700;
      this.canvas.style.width = '1200px';
      this.canvas.style.height = '700px';
      this.container.appendChild(this.canvas);
    }
    // Resize if container has explicit dimensions
    if (this.container.clientWidth > 100) {
      this.canvas.width = this.container.clientWidth;
      this.canvas.style.width = this.container.clientWidth + 'px';
    }
    if (this.container.clientHeight > 100) {
      this.canvas.height = this.container.clientHeight;
      this.canvas.style.height = this.container.clientHeight + 'px';
    }

    this.ctx = this.canvas.getContext('2d');
    this.commands = [];
    this.color = '#000000';
    this.stroke = 1;
    this.font = '12px Arial';
  }

  JsGraphics.prototype.setPrintable = function(){ return this; };

  JsGraphics.prototype.setStroke = function(width){
    this.stroke = width || 1;
    return this;
  };

  JsGraphics.prototype.setColor = function(color){
    this.color = color || '#000000';
    return this;
  };

  JsGraphics.prototype.drawLine = function(x1, y1, x2, y2){
    this.commands.push({ type: 'line', color: this.color, stroke: this.stroke, pts: [x1, y1, x2, y2] });
    return this;
  };

  JsGraphics.prototype.drawEllipse = function(x, y, w, h){
    this.commands.push({ type: 'ellipse', color: this.color, stroke: this.stroke, rect: [x, y, w, h] });
    return this;
  };

  JsGraphics.prototype.fillEllipse = function(x, y, w, h){
    this.commands.push({ type: 'fillEllipse', color: this.color, rect: [x, y, w, h] });
    return this;
  };

  JsGraphics.prototype.drawImage = function(src, x, y, w, h){
    this.commands.push({ type: 'image', src: src, x: x, y: y, w: w, h: h });
    return this;
  };

  JsGraphics.prototype.drawString = function(text, x, y){
    this.commands.push({ type: 'text', color: this.color, text: String(text), x: x, y: y });
    return this;
  };

  JsGraphics.prototype.clear = function(){
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Legg til subtil gradient bakgrunn
      var grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      grad.addColorStop(0, '#fafafa');
      grad.addColorStop(1, '#ffffff');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.commands = [];
    return this;
  };

  JsGraphics.prototype.paint = function(){
    var ctx = this.ctx;
    if (!ctx) return this;

    // Aktiver antialiasing og smooth lines
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    var cmds = this.commands.slice();
    this.commands = [];

    cmds.forEach(function(cmd){
      switch(cmd.type){
        case 'line':
          ctx.save();
          ctx.strokeStyle = cmd.color;
          ctx.lineWidth = cmd.stroke;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.beginPath();
          ctx.moveTo(cmd.pts[0], cmd.pts[1]);
          ctx.lineTo(cmd.pts[2], cmd.pts[3]);
          ctx.stroke();
          ctx.restore();
          break;
        case 'ellipse':
          ctx.save();
          ctx.strokeStyle = cmd.color;
          ctx.lineWidth = cmd.stroke;
          ctx.lineCap = 'round';
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.beginPath();
          ctx.ellipse(cmd.rect[0] + cmd.rect[2] / 2, cmd.rect[1] + cmd.rect[3] / 2, Math.abs(cmd.rect[2] / 2), Math.abs(cmd.rect[3] / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        case 'fillEllipse':
          ctx.save();
          ctx.fillStyle = cmd.color;
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.ellipse(cmd.rect[0] + cmd.rect[2] / 2, cmd.rect[1] + cmd.rect[3] / 2, Math.abs(cmd.rect[2] / 2), Math.abs(cmd.rect[3] / 2), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case 'image':
          var img = new Image();
          img.onload = function(){ 
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 4;
            ctx.drawImage(img, cmd.x, cmd.y, cmd.w, cmd.h);
            ctx.restore();
          };
          img.src = cmd.src;
          break;
        case 'text':
          ctx.save();
          ctx.fillStyle = cmd.color;
          ctx.font = '600 ' + this.font.replace(/^\d+px/, '13px');
          ctx.shadowColor = 'rgba(255,255,255,0.8)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;
          ctx.fillText(cmd.text, cmd.x, cmd.y);
          ctx.restore();
          break;
      }
    }, this);

    return this;
  };

  global.jsGraphics = function(targetId){ return new JsGraphics(targetId); };
})(window);
