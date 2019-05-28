import PDFObject from 'pdfobject';
import { socket } from './common.js';
import 'datatables';

let tableAPI = null;
let table = null;
let columns = [
  { data: 'name' }
];
let sheetDir = [];

$(function () {
  table = $('#sheetlist').DataTable({
    paging: true,
    bLengthChange : false,
    searching: true,
    data: [],
    autoWidth: false,
    columns: columns
  });
  tableAPI = $('#sheetlist').dataTable();
  table.on( 'draw.dt', function () {
    tableClickListener();
  });

  //socket io stuff 
  socket.emit('update', 'sheets');
  
  socket.on('update_sheets', function(msg){
    if(msg != null){
      sheetDir = msg;
      $( '#dir-dropdown' ).html("");
      sheetDir.forEach(function(dir){
        $( '#dir-dropdown' ).append('<option>'+dir.name+'</option>');
      });
      updateTable();
    }
  });

  socket.on('message', function(msg){
    console.log(msg);
  });

  $( '#dir-dropdown' ).change(function () {
    updateTable();
  });
});

function updateTable(){
  sheetDir.forEach(function(dir){
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
    let selected = $(this).hasClass("ui-state-highlight");
    $("tbody tr").removeClass("ui-state-highlight");
    if (!selected) {
      $(this).addClass("ui-state-highlight");
    }
  });

  $( "tbody tr").click(function(){
    let sheetName = $(this)[0].lastChild.innerText;
    let dir = $( '#dir-dropdown' ).find(":selected").text();
    PDFObject.embed('sheets/' + dir + '/' + sheetName, "#pdf_viewer", { height: "60em", fallbackLink: true});
  });
}
 /*
var console = {};
console.log = function(msg){
    socket.emit('log', msg);
};
window.console = console;
*/