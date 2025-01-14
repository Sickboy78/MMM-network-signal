/**
 * Magic Mirror
 * Module: MMM-network-signal
 *
 * By PoOwAa https://github.com/PoOwAa/MMM-network-signal
 * MIT Licensed.
 */

Module.register("MMM-network-signal", {
    // Default module config
    defaults: {
        updateInterval: 1000 * 5, // check network every seconds
        maxTimeout: 1000, // maximum timeout
        animationSpeed: 1000 * 0.25, // fade effect
        initialLoadDelay: 1000 * 3, // first check delay
        server: "8.8.8.8", // Server to check network connection. Default 8.8.8.8 is a Google DNS server
		showMessage: true,
        thresholds: {
            strong: 50,
            medium: 150,
            weak: 500,
        },
        flexDirection: 'row', // set to 'row' to display the row in left-to-right mode, 'row-reverse' to display the row in right-to-left mode
        icon_scale: 0.45, // scale for the icon, must be greater than 0
		icon_height: 45, // space for the icon in px
		font_size: 1, // font size in em
		margin_top: 5, // margin top in px
		margin_bottom: 0 // margin bottom in px
    },
    getTranslations: function() {
		return {
			da: "translations/da.json",
			de: "translations/de.json",
			en: "translations/en.json",
			es: "translations/es.json",
			fr: "translations/fr.json",
			it: "translations/it.json"

		};
	},

    start: function() {
        Log.info("Starting module: " + this.name);
        const self = this;

        setTimeout(() => {
            self.pingTest();
            setInterval(() => {
                self.pingTest();
            }, self.config.updateInterval); // Actual loop timing
        }, self.config.initialLoadDelay); // First delay
    },

    getDom: function() {
        const content = document.createElement("div");
        content.style = `display: flex;flex-direction: ${this.config.flexDirection};justify-content: space-between; align-items: center`;
        const wifiSign = document.createElement("img");
        wifiSign.style = `transform:scale(${this.config.icon_scale}); height: ${this.config.icon_height}px;`;
        if (this.config.showMessage)
        {
            var connStatus = document.createElement("p");
            connStatus.style = `text-align:center; font-size:${this.config.font_size}em; margin-top:${this.config.margin_top}px; margin-bottom:${this.config.margin_bottom}px;`;
        }

        // Changing icon
        switch (true) {
            // Fast ping, strong signal
            case this.ping < this.config.thresholds.strong:
                wifiSign.src = this.file("icons/3.png");
                if (this.config.showMessage)
                {
                    connStatus.innerHTML = this.translate("excellent")
                }
                break;
            // Medium ping, medium signal
            case this.ping < this.config.thresholds.medium:
                wifiSign.src = this.file("icons/2.png");
                if (this.config.showMessage)
                {
                    connStatus.innerHTML = this.translate("good")
                }
                break;
            // Slow ping, weak signal
            case this.ping < this.config.thresholds.weak:
                wifiSign.src = this.file("icons/1.png");
                if (this.config.showMessage)
                {
                    connStatus.innerHTML = this.translate("normal")
                }
                break;
            // Ultraslow ping, better if "no signal"
            case this.ping > this.config.thresholds.weak:
                wifiSign.src = this.file("icons/0.png");
                if (this.config.showMessage)
                {
                    connStatus.innerHTML = this.translate("bad")
                }
                break;
            // No actual ping, maybe just searching for signal
            default:
                wifiSign.src = this.file("icons/loading.gif");
                break;
        }

        if (this.config.showMessage)
        {
            content.appendChild(connStatus);
        }
        content.appendChild(wifiSign);
        return content;
    },

    // Send socket notification, to start pinging the server
    pingTest: function() {
        this.sendSocketNotification("MMM_NETWORKSIGNAL_CHECK_SIGNAL", {
            config: this.config,
        });
    },

    // Handle socket answer
    socketNotificationReceived: function(notification, payload) {
        // Care only own socket answers
        if (notification === "MMM_NETWORKSIGNAL_RESULT_PING") {
            this.ping = payload;
            this.updateDom(this.config.animationSpeed);
        }
    },
});
