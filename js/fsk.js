$(document).ready(function() {


    $(document).on("click", ".export2Excel", function() {
        export_table_to_excel("resultsHolder","Summary");
    });

        $(document).on("click", ".export2ExcelErrors", function() {
        export_table_to_excel("rawErrorData","Raw");
    });



    var mcuAlign = function(mcu) {

        var mcuLength = mcu.length;
        var space = 12 - parseInt(mcuLength);
        var mcuSpace = "";
        for (var i = 0; i < space; i++) {
            mcuSpace += " ";
        }

        mcu = mcuSpace + mcu;

        return mcu;
    }


    $('.modal-footer button').click(function() {
        var button = $(this);

        if (button.attr("data-dismiss") != "modal") {
            var inputs = $('form input');
            var title = $('.modal-title');
            var progress = $('.progress');
            var progressBar = $('.progress-bar');
            var user = $("#uLogin").val();
            var pass = $("#uPassword").val();
            var userObj = {};

            userObj.user = user;
            userObj.pass = pass;


            window.localStorage.setItem("userDetails", JSON.stringify(userObj));
            currentUser = user;

            inputs.attr("disabled", "disabled");

            button.hide();
            getToken();
            progress.show();

            progressBar.animate({
                width: "100%"
            }, 100);

            progress.delay(1000)
                .fadeOut(600);

            button.text("Close")
                .removeClass("btn-primary")
                .addClass("btn-success")
                .blur()
                .delay(1600)
                .fadeIn(function() {
                    title.text("Log in is successful");
                    button.attr("data-dismiss", "modal");
                });
        }
    });



    $('#myModal').on('hidden.bs.modal', function(e) {
        e.preventDefault();
        var inputs = $('form input');
        var title = $('.modal-title');
        var progressBar = $('.progress-bar');
        var button = $('.modal-footer button');

        inputs.removeAttr("disabled");

        title.text("Log in");

        progressBar.css({
            "width": "0%"
        });

        button.removeClass("btn-success")
            .addClass("btn-primary")
            .text("Ok")
            .removeAttr("data-dismiss");

    });

    $("#reset").click(function(e) {
        e.preventDefault();
        location.reload();


    });


    var sleep = function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    };


    var jsonData = [];
    var processQ = [];
    var excelRows = [];
    /* set up drag-and-drop event */
    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#excelDownload").hide();
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



                /* if binary string, read with type 'binary' */

                try {
                    var workbook = XLSX.read(binary, {
                        type: 'binary'
                    });
                } catch (e) {
                    $("#drop_zone").html("<p>Invald File <br><span style='font-size:14px'>(expects xlsx)</span></p>");
                    $("#drop_zone").addClass("error");

                }
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function(y) {
                    var worksheet = workbook.Sheets[y];

                    jsonData = XLSX.utils.sheet_to_json(worksheet);
                    //console.log(JSON.stringify(jsonData));
                    excelRows.push(jsonData);
                });
                $("#data").addClass('result');
                $("#drop_zone").removeClass("over");
                $("#drop_zone").hide();

                $("#dataHolder").append("<p>Successfully loaded Excel Data!</p>").fadeOut(3000);
                //$("#data").html(icon);

                window.localStorage.setItem("excelData", JSON.stringify(excelRows));
                $("#dataHolder").trigger("excelDataLoaded");

            };
            reader.readAsArrayBuffer(f);
        }
    }

    var handleOver = function(e) {
        e.preventDefault();

        $(this).addClass("over");

        return false;
    };

    var handleExit = function(e) {

        $(this).removeClass("over");

    };

    var dz = document.getElementById("drop_zone");

    dz.addEventListener('drop', handleDrop, false);
    dz.addEventListener('dragleave', handleExit, false);

    dz.addEventListener('dragover', handleOver, false);

    var prepareData = function(BP, ITM, SAFE, LEAD, ROW) {

        $("#" + ROW).removeClass("info");
        $("#" + ROW).addClass("warning");





        postFormW41026C(BP, ITM, SAFE, LEAD, ROW);


        //console.log("Post Function Call");


    };



    var key = "excelData";
    var loopIndex = {};

    var prepareUi = function() {
        $("#statusBlock").html("<h2>Processing " + totalRows + " total rows</h2>");
        for (var i = 0; i < processQ.length; i++) {
            loopIndex = processQ[i];
            $("#" + loopIndex.ROW).addClass("info");


            prepareData(loopIndex.BP, loopIndex.ITM, loopIndex.SAFE, loopIndex.LEAD, loopIndex.ROW);





            console.log(processQ.length, loopIndex.ROW);
            if (processQ.length == loopIndex.ROW) {



            };

        }






    };

    var totalRows = 0;

    $("#dataHolder").on("excelDataLoaded", function() {



        var eData = JSON.parse(window.localStorage.getItem("excelData"));
        var fData = eData[0];

        $.each(fData, function(inx, ob) {
            ob.ROW = inx + 1;
            totalRows = totalRows + 1;
        });

        processQ = fData;
        $("#dataHolder").hide();
        var html = "<div class='container'><div id='statusBlock'></div><table id='dataRows' class='table table-striped table-bordered'>";
        html += "<tr><th>Row</th><th>Branch Plant</th><th>Item</th><th>SAFE</th><th>LEAD</th></tr>";
        $.each(fData, function(i, obj) {
            html += "<tr id='" + obj.ROW + "'><td>" + obj.ROW + "</td><td>" + obj.BP + "</td><td>" + obj.ITM + "</td><td>" + obj.SAFE + "</td><td>" + obj.LEAD + "</td></tr>";
        });
        html += "</table></div>";
        console.log(jsonData);
        $("#dataHolder").html(html).fadeIn(1500);

        setTimeout(function() {
            prepareUi();

        }, 2000);




    });


    var errorRows = 0;
    var successRows = 0;
    var currentRow = {};
    var JSONTOKENREQUEST = {};
    var TOKEN = "";
    var userInfo = {};
    var sessionInfo = {};
    var jdeConfig = {};
    var configUrl = "http://demo.steltix.com/jderest/defaultconfig";
    var tokenUrl = "http://demo.steltix.com/jderest/tokenrequest";
    var formUrl = "http://demo.steltix.com/jderest/batchformservice";







    var getToken = function() {

        if (!window.localStorage.getItem("userDetails")) {
            alert("You must login to upload Item Changes!");
            return false;
        } else {
            var deets = JSON.parse(window.localStorage.getItem("userDetails"));
            var userName = deets.user;
            var passWord = deets.pass;
            var tokenRequestJSON = {

                "deviceName": "itemRevisionApp"
            };

            tokenRequestJSON.username = userName;
            tokenRequestJSON.password = passWord;

            tokenRequestJSON = JSON.stringify(tokenRequestJSON);
        }
        TOKEN = "";
        $.ajax({
            url: tokenUrl,
            dataType: "json",
            data: tokenRequestJSON,
            type: "POST"
        }).done(function(data) {

            userInfo = data.userInfo;
            TOKEN = userInfo.token;
            console.log(TOKEN);
            window.localStorage.setItem("userInfo", JSON.stringify(userInfo));

        });
    };


    var postFormW41026C = function(BP, LITM, SAFE, LEAD, R) {

        var JSONFORMREQUEST_W41026C = {
            "deviceName": "itemRevisionApp",
            "returnControlIDs": "",
            "version": "ZJDE0001",
            "formRequests": []
        };


        var doAction = {
            "command": "DoAction",
            "controlID": "11"
        };

        var doAction2 = {
            "command": "DoAction",
            "controlID": "11"
        };

        var inputsArr = [];
        var bpInfo = {};

        bpInfo.value = mcuAlign(BP);
        bpInfo.id = "1";

        var litmInfo = {};

        litmInfo.value = LITM;
        litmInfo.id = "2";

        inputsArr.push(bpInfo, litmInfo);



        var inputsArr2 = [];
        var bpInfo2 = {};

        bpInfo2.value = mcuAlign(BP);
        bpInfo2.id = "13";

        var litmInfo2 = {};

        litmInfo2.value = LITM;
        litmInfo2.id = "12";

        inputsArr2.push(bpInfo2, litmInfo2);



        var actionsArr = [];

        if (SAFE != "") {

            var safeInfo = {};
            safeInfo.command = "SetControlValue";
            safeInfo.value = SAFE;
            safeInfo.controlID = "19";

            actionsArr.push(safeInfo);
        }

        actionsArr.push(doAction);


        var actionsArr2 = [];

        if (LEAD != "" || LEAD != "undefined") {

            var leadInfo = {};
            leadInfo.command = "SetControlValue";
            leadInfo.value = LEAD;
            leadInfo.controlID = "42";

            actionsArr2.push(leadInfo);
        }

        actionsArr2.push(doAction2);




        var reqOne = {};
        reqOne.formInputs = inputsArr;
        reqOne.formActions = actionsArr;
        reqOne.formName = "P41026_W41026C";

        var reqTwo = {};
        reqTwo.formInputs = inputsArr2;
        reqTwo.formActions = actionsArr2;
        reqTwo.formName = "P41026_W41026D";

        JSONFORMREQUEST_W41026C.formRequests.push(reqOne);
        JSONFORMREQUEST_W41026C.formRequests.push(reqTwo);

        JSONFORMREQUEST_W41026C.token = TOKEN;
        var test = JSON.stringify(JSONFORMREQUEST_W41026C);


        console.log(test);

        $.ajax({
            url: formUrl,
            dataType: "json",
            data: test,
            type: "POST",
            crossDomain: true
        }).done(function(data) {
            //JSONFORMREQUEST_W41026C = "";


            if (data.fs_0_P41026_W41026C.errors.length > 0 || data.fs_1_P41026_W41026D.errors.length > 0) {

                $.each(data.fs_0_P41026_W41026C.errors, function(index, object) {
                    // console.log(JSON.stringify(object));
                    $("#resultsHolder").prepend("<tr class='danger'><td>ROW: " + R + "</td><td>SAFETY STOCK ERROR - " + object.TITLE + "</td><td colspan='2'>" + object.DESC + "</td></tr>");
                });

                $.each(data.fs_1_P41026_W41026D.errors, function(index, object) {
                    // console.log(JSON.stringify(object));
                    $("#resultsHolder").prepend("<tr class='danger'><td>ROW: " + R + "</td><td>LEAD TIME ERROR - " + object.TITLE + "</td><td colspan='2'>" + object.DESC + "</td></tr>");
                });

                $("#rawErrorData").append("<tr><td>"+R+"</td><td>" + BP + "</td><td>" + LITM + "</td><td>" + SAFE + "</td><td>" + LEAD + "</td></tr>");
                $("#" + R).removeClass("info");
                $("#" + R).addClass("danger").delay(1000).fadeOut(1000);
                errorRows = errorRows + 1;
            } else {
                $("#resultsHolder").append("<tr class='success'><td>Row: " + R + "</td><td>New Safety Stock Value: " + data.fs_0_P41026_W41026C.data.txtSafetyStock_19.value + "</td><td>BP: " + data.fs_0_P41026_W41026C.data.txtBranchPlant_29.value + "</td><td>" + data.fs_0_P41026_W41026C.data.txtItemNumberUITM_43.value + "</td></tr>");
                $("#" + R).removeClass("warning");
                $("#" + R).addClass("success").delay(500).fadeOut(1000);
                successRows = successRows + 1;
            }

            if (totalRows == successRows + errorRows) {
                $("#statusBlock").html("<h2>" + successRows + " successful rows and " + errorRows + " rows with errors.</h2>");
                $("#statusBlock").append("<div class='col-md-6'><button class='btn btn-block btn-default export2Excel'>Export Summary as Excel</button></div><div class='col-md-6'><button class='btn btn-block btn-default export2ExcelErrors'>Export Raw Error Data as Excel</button></div>");

                $("#dataHolder th").remove();
            }

        });



    };


    var init = function() {

        $.ajaxSetup({
            error: function(jqXHR, exception) {
                if (jqXHR.status === 0) {
                    $(".msgBox").html('Not connected.\n Verify Network.').show();
                } else if (jqXHR.status == 404) {
                    $(".msgBox").html('Requested page not found. [404]').show();
                } else if (jqXHR.status == 500) {
                    $(".msgBox").html('Internal Server Error [500].').show();
                } else if (exception === 'parsererror') {
                    $(".msgBox").html('Requested JSON parse failed.').show();
                } else if (exception === 'timeout') {
                    $(".msgBox").html('Time out error.').show();
                } else if (exception === 'abort') {
                    $(".msgBox").html('Ajax request aborted.').show();
                } else {
                    $(".msgBox").html('Uncaught Error.\n' + jqXHR.responseText).show();
                }
            }
        });


        getToken();
    };

    var userObj2 = {};
    userObj2.user = "demo";
    userObj2.pass = "demo";
    window.localStorage.setItem("userDetails", JSON.stringify(userObj2));

    init();

}); //end of document ready handler function