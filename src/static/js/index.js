var socket = null;
var table = null;
var columns = [
  { data: 'name' }
];
var currentSong = null;
var songDir = [];
var player = null;
var aLoopTime = null;
var bLoopTime = null;

// init socket io and 
$(function () {
  socket = io();
  table = $('#songlist').DataTable({
    paging: true,
    bLengthChange : false,
    searching: true,
    data: [],
    autoWidth: false,
    columns: columns
  });
  tableAPI = $('#songlist').dataTable();
  table.on( 'draw.dt', function () {
    tableClickListener();
  });

  //socket io stuff 

  socket.on('update_dirs', function(msg){
    if(msg != null){
      songDir = msg;
      $( '#dir-dropdown' ).html("");
      songDir.forEach(function(dir){
        $( '#dir-dropdown' ).append('<option>'+dir.name+'</option>');
      });
      updateTable();
    }
  });

  socket.on('message', function(msg){
    console.log(msg);
  });

  socket.on('status', function(msg){
    $('#user_count').text('Verbundene Geräte: ' + msg.users);
  });

  //buttons 

  $( '#playBtn' ).click(function(){
    if(player == null)
      return
    if(player.isPlaying()){
      player.pause();
    }else{
      player.play();
    }
  });

  $( '#stopBtn' ).click(function(){
    if(player == null)
      return
    player.stop();
  });

  $( '#aLoopBtn' ).click(function(){
    if(player == null)
      return
    aLoopTime = player.getPosition();
    $( '#bLoopBtn' ).prop("disabled", false);
    $( '#txt-aLoop' ).html(player.formatTime(Math.round(aLoopTime)));
  });

  $( '#bLoopBtn' ).click(function(){
    if(player == null)
      return
    bLoopTime = player.getPosition();
    $( '#aLoopBtn' ).prop("disabled", false);
    $( '#resetLoopBtn' ).prop("disabled", false);
    $( '#txt-bLoop' ).html(player.formatTime(Math.round(bLoopTime)));
  });

  $( '#resetLoopBtn' ).click(function(){
    if(player == null)
      return
    resetLoop();
  });
  
  //dropdown  

  $( '#dir-dropdown' ).change(function () {
    updateTable();
  });

  //sliders

  $( '#position-slider' ).change(function () {
    player.seek(this.value/1000);
    updateDisplay();
  });

  $( '#speed-slider' ).change(function () {
    updateDisplay();
  });

  $( '#volume-slider' ).change(function () {
    updateDisplay();
  });

  $('input[type=range]').on('input', function () {
    $(this).trigger('change');
  });

  $('#extFile').change(function () {
    event = this
    if (event.files.length > 0) {
    var file = event.files[0];
    var reader = new FileReader();
    var songName = event.files[0].name;
    reader.addEventListener('load', function() {
      var data = reader.result;
      if(player != null && player.isPlaying())
        player.pause();
      player = new Player(songName, data);
      player.init();
      updateDisplay();
    });
    reader.readAsDataURL(file);
  }
  });

  updateDisplay();
});

function updateDisplay(){
  playBtn     = $( '#playBtn' );
  stopBtn     = $( '#stopBtn' );
  aLoopBtn    = $( '#aLoopBtn' );
  bLoopBtn    = $( '#bLoopBtn' );
  resetLoopBtn= $( '#resetLoopBtn' );

  volumeSl    = $( '#volume-slider' );
  speedSl     = $( '#speed-slider' );
  positionSl  = $( '#position-slider' );

  speedTxt    = $( '#txt-speed' );
  volumeTxt   = $( '#txt-volume' );

  if(player == null){
    playBtn.prop("disabled", true);
    stopBtn.prop("disabled", true);
    aLoopBtn.prop("disabled", true);
    bLoopBtn.prop("disabled", true);
    resetLoopBtn.prop("disabled", true);
    positionSl.prop("disabled", true);
  }else{
    stopBtn.prop("disabled", false);
    positionSl.prop("disabled", false);
    aLoopBtn.prop("disabled", false);
    player.rate(speedSl[0].value/100);
    player.volume(volumeSl[0].value/1000);
  }
  speedTxt.html((speedSl[0].value) + '%');
  volumeTxt.html(Math.round(volumeSl[0].value/10) + '%');
}

function updateTable(){
  songDir.forEach(function(dir){
    if($( '#dir-dropdown' ).find(":selected").text() == dir.name){
      table.clear();
      if(dir.files.length!=0)
        tableAPI.fnAddData(dir.files);
    }
  });
}

function tableClickListener(){
  $( "tbody tr").unbind();
  $( "tbody tr").hover(function(){
    var selected = $(this).hasClass("ui-state-highlight");
      $("tbody tr").removeClass("ui-state-highlight");
      if (!selected) {
        $(this).addClass("ui-state-highlight");
      }
  });

  $( "tbody tr").click(function(){
    let songName = $(this)[0].lastChild.innerText;
    if(player != null && player.isPlaying())
      player.pause();
    player = new Player(songName);
    player.init();
    updateDisplay();
  });
}

function resetLoop(){
  aLoopTime = null;
  bLoopTime = null;
  $( '#txt-aLoop' ).html('0:00');
  $( '#txt-bLoop' ).html('0:00');
  $( '#bLoopBtn' ).prop("disabled", true);
  $( '#resetLoopBtn' ).prop("disabled", true);
}

var Player = function(songName, data=null) {
  if(data != null){
    this.song = songName;
    this.url = data;
  }else{
    this.song = songName;
    let dir = $( '#dir-dropdown' ).find(":selected").text();
    this.url = './songs/' + dir + '/' + songName;
  }
  this.howl = null;
  resetLoop();

  // Display the title of the first track.
  $( '#txt-titel' ).text(songName);
};

Player.prototype = {
  /**
   * Play a song.
   */
  init: function() {
    $( '#playBtn' ).prop("disabled", true);
    let self = this;
    let sound;
    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (self.howl) {
      sound = self.howl;
    } else {
      sound = self.howl = new Howl({
        src: [self.url],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          updateDisplay();
          $( '#playBtn' ).removeClass('btn-succes').addClass('btn-warning');
          $( '#playBtn i' ).removeClass('fa-play').addClass('fa-pause');
          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        },
        onload: function() {
          $( '#txt-duration' ).text(self.formatTime(Math.round(sound.duration())));
          $( '#playBtn' ).prop("disabled", false);
          self.step();
        },
        onend: function() {
          $( '#playBtn' ).removeClass('btn-warning').addClass('btn-succes');
          $( '#playBtn i' ).removeClass('fa-pause').addClass('fa-play');
          self.seek(0);
        },
        onpause: function() {
          $( '#playBtn' ).removeClass('btn-warning').addClass('btn-succes');
          $( '#playBtn i' ).removeClass('fa-pause').addClass('fa-play');
        },
        onstop: function() {
        },
        onseek: function() {
          requestAnimationFrame(self.step.bind(self));
        }
      });
    }
  },

  play: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // Puase the sound.
    sound.play();
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // Puase the sound.
    sound.pause();
  },

  /**
   * stop the currently playing track.
   */
  stop: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // stop the sound.
    sound.pause();
    self.seek(0);
  },

  /**
   * Set the volume and update the volume slider display.
   * @param  {Number} val Volume between 0 and 1.
   */
  volume: function(val) {
    var self = this;

    // Update the global volume (affecting all Howls).
    Howler.volume(val);
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function(per) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // Convert the percent into a seek position.
    sound.seek(sound.duration() * per);
  },

  /**
   * change rate of current song
   * @param  {Number} speed from 0.5 to 4 times 
   */
  rate: function(speed) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // Convert the percent into a seek position.
    sound.rate(speed);
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    if(aLoopTime != null && bLoopTime != null){
      if(seek > bLoopTime)
        sound.seek(aLoopTime);
    }
    $( '#txt-timer' ).text(self.formatTime(Math.round(seek)));
    $( '#position-slider' ).val(((seek / sound.duration())*1000) || 0);

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * true, if playing
   */
  isPlaying: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.howl;

    if(sound == null)
      return false;

    return (sound.playing());
  },

  /**
   * get raw position in seconds
   * @return {long} seconds
   */
  getPosition: function() {
    var self = this;
    var sound = self.howl;
    if (sound == null)
      return 0;
    return sound.seek();
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

function clog(msg){
  console.log(msg);
  socket.emit('log', msg);
}