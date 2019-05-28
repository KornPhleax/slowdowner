import './scss/app.scss';
import 'bootstrap';

//adding the fontawesome icons
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
library.add(fas);
library.add(far);
library.add(fab);
dom.watch();
//icons end

let socket = null;
socket = io();

socket.on('status', function(msg){
  $('#user_count').text('Verbundene Geräte: ' + msg.users);
});

export { socket };