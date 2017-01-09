/*
 * Copyright (C) 2016 Christux
 */

(function (root) {

    root.Remote = function (context_id) {

        var elem;
        var headerdiv;
        var menudiv;
        var contentdiv;
        var page = 0; // 0-chose mode, 1-chose color, 2-disp about
        var color;
        var mode;

        var menu_items = ["Mode", "Color", "About"];
        var available_modes = [
            "Static color", "Rainbow lamp", "Rainbow lamp rand",
            "Rainbow", "Comet", "Breathing", "Fire", "Theater",
            "Knight Rider", "Flag", "Off"];
        var colors_tab = [// Colors, 5x3 grid
            "rgb(255,0,0)", "rgb(255,128,0)", "rgb(255,215,0)",
            "rgb(255,255,0)", "rgb(128,255,128)", "rgb(0,255,0)",
            "rgb(0,255,128)", "rgb(0,255,255)", "rgb(0,128,255)",
            "rgb(0,0,255)", "rgb(128,0,255)", "rgb(255,0,255)",
            "rgb(255,128,128)", "rgb(255,0,128)", "rgb(255,255,255)"];

        /*
         * Generates web page
         */
        function generate_remote() {

            generate_menu();
            switch (page) {
                case 1:
                    generate_color_table();
                    break;
                case 2:
                    generate_about();
                    break;
                default:
                    generate_mode();
            }
        }
        /*
         * Generates menu bar
         */
        function generate_menu() {

            menudiv.innerHTML = "";
            for (var i = 0, len = menu_items.length; i < len; i++) {

                var cell = document.createElement('div');
                if (i === parseInt(page)) {
                    cell.className = 'item_current';
                } else {
                    cell.className = 'item';
                }

                cell.innerHTML = menu_items[i];

                // Associate reload page function                
                cell.onclick = (function (I) {
                    return function () {
                        change_page(I);
                    };
                })(i);

                menudiv.appendChild(cell);
            }
        }

        /*
         * Changes page
         */
        function change_page(new_page) {
            page = new_page;
            generate_remote();
        }
        /*
         * Generates mode page
         */
        function generate_mode() {
            contentdiv.innerHTML = "";
            var modediv = document.createElement('div');
            modediv.id = 'mode';
            contentdiv.appendChild(modediv);
            for (var i = 0, len = available_modes.length; i < len; i++) {

                var cell = document.createElement('div');
                if (i === parseInt(mode)) {
                    cell.className = 'item_current';
                } else {
                    cell.className = 'item';
                }

                cell.innerHTML = available_modes[i];
                cell.onclick = (function (I) {
                    return function () {
                        send_mode(I);
                        generate_mode();
                    };
                })(i);
                modediv.appendChild(cell);
            }
        }
        /*
         * Generates color table
         */
        function generate_color_table() {
            contentdiv.innerHTML = "";
            var values = new Array();
            var rgb = color.split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
            var r = parseInt(rgb[1]);
            var g = parseInt(rgb[2]);
            var b = parseInt(rgb[3]);
            var brightness = Math.max(r, g, b, 1); // Avoid dividing by zero
            var brightIdx = Math.max(0, Math.round(6 - brightness / (255 / 6)));

            for (var i = 0; i < 6; i++) {

                var newR = Math.round(r * (1 - 1 / 6 * i) * 255 / brightness);
                var newG = Math.round(g * (1 - 1 / 6 * i) * 255 / brightness);
                var newB = Math.round(b * (1 - 1 / 6 * i) * 255 / brightness);
                values[i] = "rgb(" + newR + "," + newG + "," + newB + ")";
            }

            /*
             * Values selector
             */
            var colors = Array();

            // Adjust color table to brightness
            for (var i = 0, len = colors_tab.length; i < len; i++) {
                var rgb = colors_tab[i].split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
                var r = parseInt(rgb[1]);
                var g = parseInt(rgb[2]);
                var b = parseInt(rgb[3]);
                var newR = Math.round(r * brightness / 255);
                var newG = Math.round(g * brightness / 255);
                var newB = Math.round(b * brightness / 255);
                colors[i] = "rgb(" + newR + "," + newG + "," + newB + ")";
            }

            var colortable = document.createElement('div');
            colortable.id = 'colorTable';
            contentdiv.appendChild(colortable);
            var tablebody = document.createElement('div');
            tablebody.className = 'divTableBody';
            colortable.appendChild(tablebody);
            var tablerow = document.createElement('div');
            tablerow.className = 'divTableRow';
            tablebody.appendChild(tablerow);
            for (var i = 0; i < 6; i++) {
                var cell = document.createElement('div');
                cell.className = 'divTableCell';
                cell.style.cssText = "background-color:" + values[i];
                if (i === brightIdx)
                    cell.style.cssText = "border-style: solid;border-width: 0.5em;border-color:white;background-color:" + values[i];
                // Attach click function
                cell.onclick = (function (I) {
                    return function () {
                        send_color(I);
                        generate_color_table();
                    };
                })(values[i]);
                tablerow.appendChild(cell);
            }

            /*
             * Color grid
             */
            var colortable = document.createElement('div');
            colortable.id = 'colorTable';
            contentdiv.appendChild(colortable);
            var tablebody = document.createElement('div');
            tablebody.className = 'divTableBody';
            colortable.appendChild(tablebody);
            for (var i = 0; i < 5; i++) {

                var tablerow = document.createElement('div');
                tablerow.className = 'divTableRow';
                tablebody.appendChild(tablerow);
                for (var j = 0; j < 3; j++) {

                    var cell = document.createElement('div');
                    cell.className = 'divTableCell';
                    cell.style.cssText = "background-color:" + colors_tab[i * 3 + j];
                    // Attach click function
                    cell.onclick = (function (I) {
                        return function () {
                            send_color(I);
                            generate_color_table();
                        };

                    })(colors[i * 3 + j]);
                    tablerow.appendChild(cell);
                }
            }
        }
        /*
         * Generates about page
         */
        function generate_about() {
            contentdiv.innerHTML = "";
            var aboutdiv = document.createElement('div');
            aboutdiv.id = 'about';
            contentdiv.appendChild(aboutdiv);
            aboutdiv.innerHTML = "<h1>Led Strip Control</h1>" +
                    "<p>Copyright Christux 2016</p>" +
                    "<p>All rights reserved</p>";
        }

        function send_mode(new_mode) {
            mode = new_mode;
            // Server url
            var order = "/mode?page=" + mode;
            // Sends request
            send_request(order);
        }

        function send_color(new_color) {
            color = new_color;
            // Extraction of RGB values from string
            var rgb = color.split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
            var r = parseInt(rgb[1]);
            var g = parseInt(rgb[2]);
            var b = parseInt(rgb[3]);
            // Reformat to server standard
            var order = "/color?r=" + r + "&g=" + g + "&b=" + b;
            // SEnds request
            send_request(order);
        }
        /*
         * HTTP request
         */
        function send_request(order) {

            console.log(order);
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {

                var response;
                // If 
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        response = xhr.responseText;
                    } else {
                        console.log("Error :",xhr.status," ", xhr.statusText);
                    }
                } else {
                    //console.log("Error :",xhr.status," ", xhr.statusText);
                }
                
                return response;
            };

            xhr.onerror = function (e) {
                console.log("Error Status: " + e.error);
            };
            
            xhr.open('GET', order, true);
            xhr.send(null);
        }

        return (
                function () {

                    return this.init();

                }).call(
                {
                    // Erase remote div
                    init: function () {

                        elem = root.document.getElementById(context_id);
                        mode = root.document.getElementById("page").value;
                        color = root.document.getElementById("color").value;

                        // Removes inputs
                        elem.innerHTML = "";

                        // Create page pattern
                        // 
                        //    ! Header !
                        //    !! Menu !!
                        //    !--------!
                        //    ! Content!
                        headerdiv = document.createElement('div');
                        headerdiv.id = 'header';
                        elem.appendChild(headerdiv);
                        menudiv = document.createElement('div');
                        menudiv.id = 'menu';
                        headerdiv.appendChild(menudiv);
                        contentdiv = document.createElement('div');
                        contentdiv.id = 'content';
                        elem.appendChild(contentdiv);

                        generate_remote();
                    }
                }
        );
    };
})(window.jQuery || this);
