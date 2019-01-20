var socket = null;
var table = null;
var columns = [
  { data: 'name' }
];
var currentSong = null;
var songDir = [];
var player = null;

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
    }
  });

  socket.on('message', function(msg){
    console.log(msg);
  });

  socket.on('status', function(msg){
    $('#user_count').text('Verbundene Computer: ' + msg.users);
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
  
  //dropdown  

  $( '#dir-dropdown' ).change(function () {
    updateTable()
  });

  //sliders

  $( '#position-slider' ).change(function () {
    if(player == null)
      return
    player.seek(this.value/1000);
  });

  $( '#speed-slider' ).change(function () {
    if(player == null)
      return
    player.rate(this.value/100);
  });

  $( '#volume-slider' ).change(function () {
    if(player == null)
      return
    player.volume(this.value/1000);
  });
});

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
  });
}


var Player = function(songName) {
  this.song = songName;
  let dir = $( '#dir-dropdown' ).find(":selected").text();
  this.url = './songs/' + dir + '/' + songName;
  this.howl = null;

  // Display the title of the first track.
  $( '#txt-titel' ).text(songName);
  console.log(songName);
};
Player.prototype = {
  /**
   * Play a song.
   */
  play: function() {
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
          // Display the duration.
          $( '#txt-duration' ).text(self.formatTime(Math.round(sound.duration())));
          $( '#playBtn' ).removeClass('btn-succes').addClass('btn-warning');
          $( '#playBtn i' ).removeClass('fa-play').addClass('fa-pause');
          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        },
        onload: function() {

        },
        onend: function() {
          self.seek(0);
        },
        onpause: function() {
          console.log("pause");
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

    // Begin playing the sound.
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