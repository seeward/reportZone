$(document).ready(function() {

    var loggedIn = false;

    var totalRows = 0;

    var loopIndex = {};
    var currRowIndex = {};
    var jsonData = [];


    var _table_ = document.createElement('table'),
        _tr_ = document.createElement('tr'),
        _th_ = document.createElement('th'),
        _td_ = document.createElement('td');

    function buildHtmlTable(arr) {
        var table = _table_.cloneNode(false),

            columns = addAllColumnHeaders(arr, table);
        for (var i = 0, maxi = arr.length; i < maxi; ++i) {
            var tr = _tr_.cloneNode(false);
            tr.id = i + 1;
            for (var j = 0, maxj = columns.length; j < maxj; ++j) {
                var td = _td_.cloneNode(false);
                cellValue = arr[i][columns[j]];
                td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        table.id = "rawTable";
        return table;
    }


    function addAllColumnHeaders(arr, table) {
        var columnSet = [],
            tr = _tr_.cloneNode(false);
        for (var i = 0, l = arr.length; i < l; i++) {
            for (var key in arr[i]) {
                if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                    columnSet.push(key);
                    var th = _th_.cloneNode(false);
                    th.appendChild(document.createTextNode(key));
                    tr.appendChild(th);
                }
            }
        }
        table.appendChild(tr);
        return columnSet;
    }



    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        var files = e.dataTransfer.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function(e) {
                var data = e.target.result;
                var binary = "";
                var bytes = new Uint8Array(e.target.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }


                try {
                    var workbook = XLSX.read(binary, {
                        type: 'binary'
                    });
                } catch (e) {

                    $("#dropZone").html("<p>Invald File <br><span style='font-size:14px'>(expects xlsx)</span></p>");
                    $("#dropZone").addClass("error");

                }
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function(y) {
                    var worksheet = workbook.Sheets[y];

                    jsonData = XLSX.utils.sheet_to_json(worksheet);
                    console.log(JSON.stringify(jsonData));
                   
                });

                document.body.appendChild(buildHtmlTable(jsonData));
              
                //window.localStorage.setItem("rawData", JSON.stringify(excelRows));
                //mapRows(excelRows[0]);

            

            };

            reader.readAsArrayBuffer(f);
        }

    
    }

    var handleOver = function(e) {
        console.log(e);
        e.preventDefault();

        $(this).addClass("over");

        return false;
    };

    var handleExit = function(e) {

        $(this).removeClass("over");

    };


  

 



    var dz = document.getElementById("dropZone");

    dz.addEventListener('drop', handleDrop, false);
    dz.addEventListener('dragleave', handleExit, false);

    dz.addEventListener('dragover', handleOver, false);





    var init = function(options) {

      

    }

    init();

});