/**
 * Class Anoncilo
 */
function Anoncilo(sound_path, sounds, on_which_beat, density) {
  this.sound_path = sound_path;
  this.sounds = sounds;
  this.on_which_beat = on_which_beat;
  this.density = density;
  this.residual_duration = 0;
  this.get_sound = function() {
    var index = Math.floor(Math.random() * this.sounds.length);
    return this.sounds[index];
  }
  this.announce = function(beat) {

    if (beat != this.on_which_beat) return;
    // not the beat on which play

    if (this.residual_duration > 0) {
      // the announced figure is still being danced
      this.residual_duration--;
      return;
    }

    if (Math.random() >= this.density) return;
    // choose wether to announce a new figure according to density

    var sound = this.get_sound();
    this.residual_duration = sound.duration - 1;
    $.playSound(this.sound_path + sound.src);
  }
}

/**
 * Class Ritmo
 */
function Ritmo(delta) {
  this.MEASURING = 1;
  this.READY = 2;
  this.delta = delta;
  this._state = this.READY;
  this.isMeasuring = function() {
    return this._state == this.MEASURING;
  }
  this.startMeasuring = function() {
    this._state = this.MEASURING;
    this._startTime = Date.now();
  }
  this.stopMeasuring = function() {
    this.delta = Date.now() - this._startTime;
    this._state = this.READY;
  }
}


/**
 * Class Ludilo
 */
function Ludilo(ritmo, ritmeroj, beatenClass, anoncilo) {
  this.setRitmo = function(r) {
    this.ritmo = r;
  }
  this.stop = function() {
    for (var i=0; i<this._timers.length; i++) {
      clearTimeout(this._timers[i]);
    }
    $(this.$eroj).removeClass(this.beatenClass);
    clearInterval(this.interval);
    this.interval = null;
  }
  this.start = function() {
    this.interval = setInterval(
      this.player,
      this.ritmo.delta,
      this
    );
  }

  this.player = function(me) {
    var batoj = me.$eroj.length;
    for (var i=0; i<batoj; i++) {
      me._timers[i] = setTimeout(me.beat, (me.ritmo.delta / batoj) * i, me, i);
    }

  }

  this.beat = function(me, i) {
    var batoj = me.$eroj.length;
    $(me.$eroj[i]).addClass(me.beatenClass);
    $(me.$eroj[(i-1+batoj) % batoj]).removeClass(
      me.beatenClass
    );
    me.anoncilo.announce(i+1);
  }

  this.is_playing = function() {
    return !!this.interval;
  }

  this.setRitmo(ritmo);
  this._timers = Array();
  this.$eroj = ritmeroj;
  this.beatenClass = beatenClass;
  this.anoncilo = anoncilo;
}
