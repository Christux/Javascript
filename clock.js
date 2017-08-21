/*
 * Copyright (C) 2016 Christux
 */

(function (root) {

    root.Clock = function (canvas_id, tzoffset = 0) {

        /*
         * private
         */
        var cnv = document.getElementById(canvas_id);
        var ctx = cnv.getContext("2d");
        var timezoneoffset = tzoffset;

        return (
                function () {

                    /*
                     * Events
                     */
//                    context.setInterval(function () {
//                        this.update();
//                    }.bind(this), 1000);
                    
                    window.setInterval(function (ctx) {
                        return function() {
                            ctx.update();
                        };
                    }(this), 100);

                    return this.update();

                }).call(
                {
                    /*
                     * Public
                     */

                    update: function () {

                        // Clear canvas
                        ctx.clearRect(0, 0, cnv.width, cnv.height);

                        var d = new Date(Date.now());
                        const x0 = cnv.width / 2;
                        const y0 = cnv.height / 2;
                        const rmax = Math.min(x0, y0);

                        /*
                         * Cadrant
                         */
                        ctx.beginPath();

                        // Circle
                        const r = rmax * .70;
                        ctx.fillStyle = "white";
                        ctx.strokeStyle = "grey";
                        ctx.arc(x0, y0, r, 0, 2 * Math.PI);
                        ctx.fill(); // Interieur
                        ctx.stroke(); // Bordure
                        ctx.closePath();

                        // Marquees
                        ctx.beginPath();
                        ctx.strokeStyle = "grey";
                        ctx.fillStyle = "grey";
                        for (var i = 0; i < 60; i++) {
                            var ri = (i % 5 === 0) ? rmax * .65 : rmax * .68;
                            var angle = i / 60 * (2 * Math.PI) - Math.PI / 2;
                            var x = x0 + 60 * Math.cos(angle);
                            var y = y0 + 60 * Math.sin(angle);
                            ctx.moveTo(x0 + ri * Math.cos(angle), y0 + ri * Math.sin(angle));
                            ctx.lineTo(x0 + r * Math.cos(angle), y0 + r * Math.sin(angle));
                        }

                        // Digits
                        const rt = rmax * .58;
                        for (var i = 0; i < 12; i++) {
                            var angle = i / 12 * (2 * Math.PI) - Math.PI / 2;
                            var x = x0 + rt * Math.cos(angle);
                            var y = y0 + rt * Math.sin(angle);
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            if (i === 0) {
                                ctx.fillText("12", x, y);
                            } else {
                                ctx.fillText(i, x, y);
                            }
                        }

                        // Logo & digital clock
                        if (r > 60) {
                            ctx.fillText("Christux", x0, y0 - r * 0.3);
                            ctx.fillText(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(), x0, y0 + r * 0.4);
                        }

                        ctx.stroke();
                        ctx.closePath();

                        /*
                         * Needles
                         */

                        // Second
                        const rs = rmax * .50;
                        //var angle_s = d.getSeconds() / 60 * (2 * Math.PI) - Math.PI / 2;
                        var angle_s = (d.getSeconds() / 60 + d.getMilliseconds() / 1000 / 60) * (2 * Math.PI) - Math.PI / 2;
                        ctx.beginPath();
                        ctx.strokeStyle = '#4d4d4d';
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x0 + rs * Math.cos(angle_s), y0 + rs * Math.sin(angle_s));
                        ctx.stroke();
                        ctx.closePath();

                        // Minute
                        const rm = rmax * .40;
                        //var angle_m = d.getMinutes() / 60 * (2 * Math.PI) - Math.PI / 2;
                        var angle_m = (d.getMinutes() / 60 + d.getSeconds() / 60 / 60) * (2 * Math.PI) - Math.PI / 2;
                        ctx.beginPath();
                        ctx.strokeStyle = '#4d4d4d';
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x0 + rm * Math.cos(angle_m), y0 + rm * Math.sin(angle_m));
                        ctx.stroke();
                        ctx.closePath();

                        // Hour
                        const rh = rmax * .30;
                        //var angle_h = (d.getHours() % 12) / 12 * (2 * Math.PI) - Math.PI / 2;
                        var angle_h = (((d.getHours() + timezoneoffset) % 12) / 12 + d.getMinutes() / 60 / 12) * (2 * Math.PI) - Math.PI / 2;
                        ctx.beginPath();
                        ctx.strokeStyle = '#4d4d4d';
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x0 + rh * Math.cos(angle_h), y0 + rh * Math.sin(angle_h));
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
        );
    };
})(window.jQuery || this);
