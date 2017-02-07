/*
 * Led Strip Remote
 *
 * Author : Christux
 * Version : 3.1
 * Date : 8 fev 2017
 */
(function (root) {

    root.Remote = function (contextId) {

        /*
         * Namespace Server
         */
        var Server = (function () {

            /*
             * HTTP request
             */
            function sendRequest(order) {

                console.log(order);
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {

                    if (xhr.readyState === xhr.DONE) {
                        if (xhr.status === 200) {
                            console.log(xhr.responseText);
                        } else {
                            console.log("Error :", xhr.status, " ", xhr.statusText);
                        }
                    }
                };
                xhr.onerror = function (e) {
                    console.log("Error Status: " + e.error);
                };
                xhr.open('GET', order, true);
                xhr.send(null);
            }

            return {

                sendMode: function (mode) {
                    // Server url
                    var order = "/mode?page=" + mode;
                    sendRequest(order);
                },
                sendColor: function (color) {
                    // Extraction of RGB values from string
                    var rgb = color.split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
                    var r = parseInt(rgb[1]);
                    var g = parseInt(rgb[2]);
                    var b = parseInt(rgb[3]);
                    // Reformat to server standard
                    var order = "/color?r=" + r + "&g=" + g + "&b=" + b;
                    sendRequest(order);
                }
            };
        })();

        var GuiLib = (function () {

            return {

                Page: function (label) {

                    var node = document.createElement('div');

                    return {
                        getNode: function () {
                            return node;
                        },
                        getLabel: function () {
                            return label;
                        },
                        setVisibility: function (isVisible) {
                            node.id = isVisible === true ? label.toLowerCase() : 'hidden';
                        },
                        updateContent: function (args) {
                            return;
                        }
                    };
                },

                PageContainer: function (rootNode) {

                    var pageList = [];
                    
                    function goToPage(idx,args) {
                        // Hide all pages and unhide requested page
                            for (var i = 0, len = pageList.length; i < len; i++) {
                                pageList[i].setVisibility(idx === i);
                            }

                            pageList[idx].updateContent(args);
                    }

                    return {
                        add: function (page) {
                            pageList.push(page);
                            rootNode.appendChild(page.getNode());
                            return;
                        },
                        goToPageNamed: function (pageName, args) {

                            // Find index of page
                            var idx = 0;
                            for (var i = 0, len = pageList.length; i < len; i++) {
                                if (pageList[i].getLabel().localeCompare(pageName) === 0)
                                    idx = i;
                            }
                            goToPage(idx,args);
                            return;
                        },
                        goToPageId: function(idx,args) {
                            goToPage(idx,args);
                            return;
                        },
                        getPageList: function () {
                            return pageList;
                        }
                    };
                },

                Button: function (label, callback) {

                    var cell = document.createElement('div');
                    cell.innerHTML = label;
                    cell.onclick = function () {
                        callback();
                    };
                    return {
                        getNode: function () {
                            return cell;
                        },
                        setClass: function (className) {
                            cell.className = className;
                            return;
                        }
                    };
                },

                ButtonPanel: function () {

                    var buttonList = [];
                    var className = function (isSelected) {
                        return isSelected === true ? 'item_current' : 'item';
                    };
                    return {
                        add: function (node, button) {
                            button.setClass(className(buttonList.length===0));
                            node.appendChild(button.getNode());
                            buttonList.push(button);
                            return;
                        },
                        update: function (idx) {

                            for (var i = 0, len = buttonList.length; i < len; i++) {
                                buttonList[i].setClass(className(idx===i));
                            }
                            return;
                        },
                        getButton: function (idx) {
                            return buttonList[idx];
                        }
                    };
                },

                Link: function (label, callback) {
                    var link = document.createElement('div');
                    link.id = "link";
                    link.innerHTML = label;
                    link.onclick = function () {
                        callback();
                    };
                    return link;
                }
            };
        })();

        /*
         * Namespace RemoteApplication
         */
        var RemoteApplication = function (rootNode, initMode, initColor) {


            // Create page pattern
            // 
            //    ! Header !
            //    !! Menu !!
            //    !--------!
            //    ! Content!

            var headerdiv = document.createElement('div');
            headerdiv.id = 'header';
            rootNode.appendChild(headerdiv);
            
            var contentdiv = document.createElement('div');
            contentdiv.id = 'content';
            rootNode.appendChild(contentdiv);
            
            var topMenu = (function () {

                var menudiv = document.createElement('div');
                menudiv.id = 'menu';
                var buttonPanel = GuiLib.ButtonPanel();
                
                function init(pageContainer) {

                    function changePage(idx) {
                        buttonPanel.update(idx);
                        pageContainer.goToPageId(idx);
                        return;
                    }
                    // Init menu
                    for (var i = 0, len = pageContainer.getPageList().length; i < len; i++) {

                        buttonPanel.add(menudiv,
                                GuiLib.Button(pageContainer.getPageList()[i].getLabel(),
                                        (function (I) {
                                            return function () {
                                                changePage(I);
                                            };
                                        })(i)));
                    }

                }

                return  {
                    getNode: function () {
                        return menudiv;
                    },
                    init: function (pageContainer) {
                        init(pageContainer);
                    }
                };
            })();

            headerdiv.appendChild(topMenu.getNode());

            var pageContainer = GuiLib.PageContainer(contentdiv);

            /*
             * Mode selection page, inherit from Page
             */
            var modePage = (function (initMode) {

                var page = GuiLib.Page("Mode");
                var availableModes = [
                    "Static color", "Rainbow lamp", "Rainbow lamp rand",
                    "Rainbow", "Comet", "Breathing", "Fire", "Theater",
                    "Knight Rider", "Flag", "Sunrise","Off"];
                var buttonPanel = GuiLib.ButtonPanel();

                function changeMode(idx) {
                    buttonPanel.update(idx);
                    Server.sendMode(idx);
                    return;
                }
                
                // Add buttons to panel
                for (var i = 0, len = availableModes.length; i < len; i++) {
                    buttonPanel.add(page.getNode(),
                            GuiLib.Button(availableModes[i],
                                    (function (I) {
                                        return function () {
                                            changeMode(I);
                                        };
                                    })(i)));
                }

                // Set initial selection
                buttonPanel.update(parseInt(initMode));

                return  page;
            })(initMode);

            pageContainer.add(modePage);

            /*
             * Color picker page page, inherit from Page
             */
            var colorPickerPage = (function (initColor) {

                var page = GuiLib.Page("Color");

                var Color = (function () {

                    var colorTab = [// Colors, 5x3 grid
                        "rgb(255,0,0)", "rgb(255,128,0)", "rgb(255,215,0)",
                        "rgb(255,255,0)", "rgb(128,255,128)", "rgb(0,255,0)",
                        "rgb(0,255,128)", "rgb(0,255,255)", "rgb(0,128,255)",
                        "rgb(0,0,255)", "rgb(128,0,255)", "rgb(255,0,255)",
                        "rgb(255,128,128)", "rgb(255,0,128)", "rgb(255,255,255)"];

                    var bColors = [];
                    var brightIdx;
                    var gColors = [];

                    return {

                        update: function (color) {

                            var rgb = color.split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
                            var r = parseInt(rgb[1]);
                            var g = parseInt(rgb[2]);
                            var b = parseInt(rgb[3]);
                            var brightness = Math.max(r, g, b, 1); // Avoid dividing by zero
                            brightIdx = Math.max(0, Math.round(6 - brightness / (255 / 6)));
                            for (var i = 0; i < 6; i++) {
                                var newR = Math.round(r * (1 - 1 / 6 * i) * 255 / brightness);
                                var newG = Math.round(g * (1 - 1 / 6 * i) * 255 / brightness);
                                var newB = Math.round(b * (1 - 1 / 6 * i) * 255 / brightness);
                                bColors[i] = "rgb(" + newR.toString() + "," + newG.toString() + "," + newB.toString() + ")";
                            }

                            // Adjust color table to brightness
                            for (var i = 0, len = colorTab.length; i < len; i++) {
                                var rgb = colorTab[i].split(/rgb\(+(.+?)\,+(.+?)\,+(.+?)\)/);
                                var r = parseInt(rgb[1]);
                                var g = parseInt(rgb[2]);
                                var b = parseInt(rgb[3]);
                                var newR = Math.round(r * brightness / 255);
                                var newG = Math.round(g * brightness / 255);
                                var newB = Math.round(b * brightness / 255);
                                gColors[i] = "rgb(" + newR.toString() + "," + newG.toString() + "," + newB.toString() + ")";
                            }
                        },

                        getColorTab: function () {
                            return colorTab;
                        },

                        getBrightnessPanelColors: function () {
                            return bColors;
                        },

                        getBrightnessIdx: function () {
                            return brightIdx;
                        },

                        getGridColors: function () {
                            return gColors;
                        }
                    };
                })();

                /*
                 * Brightness color panel
                 */
                var BrightnessPanel = (function () {

                    var colortable = document.createElement('div');
                    colortable.id = 'colorTable';
                    page.getNode().appendChild(colortable);

                    var tablebody = document.createElement('div');
                    tablebody.className = 'divTableBody';
                    colortable.appendChild(tablebody);

                    var tablerow = document.createElement('div');
                    tablerow.className = 'divTableRow';
                    tablebody.appendChild(tablerow);

                    // Create button panel
                    var brightnessPanel = GuiLib.ButtonPanel();

                    function updateColorPanel() {

                        var values = Color.getBrightnessPanelColors();
                        var idx = Color.getBrightnessIdx();

                        for (var i = 0; i < 6; i++) {

                            if (i === idx)
                                brightnessPanel.getButton(i).getNode().style.cssText
                                        = "border-style: solid;border-width: 0.5em;border-color:white;background-color:" + values[i];
                            else
                                brightnessPanel.getButton(i).getNode().style.cssText
                                        = "background-color:" + values[i];
                        }
                    }

                    function changeBrightness(buttonIdx) {

                        var values = Color.getBrightnessPanelColors();
                        var pickedColor = values[buttonIdx];
                        Color.update(pickedColor);
                        updateColorPanel();
                        Server.sendColor(pickedColor);
                        return;
                    }

                    // Add buttons to panel
                    for (var i = 0; i < 6; i++) {

                        var button = GuiLib.Button("",
                                (function (I) {
                                    return function () {
                                        changeBrightness(I);
                                    };
                                })(i));
                        brightnessPanel.add(tablerow, button);
                        button.getNode().className = 'divTableCell';
                    }

                    return {

                        updateColorPanel: function () {
                            updateColorPanel();
                            return;
                        }
                    };
                })();

                /*
                 * Color grid
                 */
                (function () {

                    var colortable = document.createElement('div');
                    colortable.id = 'colorTable';
                    page.getNode().appendChild(colortable);

                    var tablebody = document.createElement('div');
                    tablebody.className = 'divTableBody';
                    colortable.appendChild(tablebody);

                    function changeColor(idx) {

                        var colors = Color.getGridColors();
                        var pickedColor = colors[idx];
                        Color.update(pickedColor);
                        BrightnessPanel.updateColorPanel();
                        Server.sendColor(pickedColor);
                        return;
                    }

                    var colorPanel = GuiLib.ButtonPanel();
                    var colorTab = Color.getColorTab();

                    // Add buttons to panel
                    for (var i = 0; i < 5; i++) {

                        var tablerow = document.createElement('div');
                        tablerow.className = 'divTableRow';
                        tablebody.appendChild(tablerow);
                        for (var j = 0; j < 3; j++) {

                            var button = GuiLib.Button("",
                                    (function (I) {
                                        return function () {
                                            changeColor(I);
                                        };
                                    })(i * 3 + j));

                            colorPanel.add(tablerow, button);
                            button.getNode().className = 'divTableCell';
                            button.getNode().style.cssText = "background-color:" + colorTab[i * 3 + j];
                        }
                    }
                })();

                // Init page
                Color.update(initColor);
                BrightnessPanel.updateColorPanel();

                return page;
            })(initColor);

            pageContainer.add(colorPickerPage);

            /*
             * About page, inherit from Page
             */
            var aboutPage = (function () {

                var page = GuiLib.Page("About");
                page.getNode().innerHTML = "<h1>Led Strip Control</h1>" +
                        "<p>Copyright Christux 2017</p>" +
                        "<p>All rights reserved</p>";
                
                return page;
            })();

            pageContainer.add(aboutPage);

            /*
             * Constructor of application
             */
            return {

                init: function () {

                    topMenu.init(pageContainer);
                    pageContainer.goToPageNamed("Mode");
                }
            }.init();
        };
        
        /*
         * Constructor of Remote Application
         */
        return {

            init: function () {

                var rootNode = root.document.getElementById(contextId);

                // Read initial data from server
                var mode = root.document.getElementById("page").value;
                var color = root.document.getElementById("color").value;

                // Removes input data
                rootNode.innerHTML = "";

                // Construct web page
                RemoteApplication(rootNode, mode, color);
            }
        }.init();
    };
})(this);