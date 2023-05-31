const latestVersion = [1, 19, 70]

const scriptModules = {
	"@minecraft/server": {
		"version": "1.0.0-beta"
	},
	"@minecraft/server-gametest": {
		"version": "1.0.0-beta"
	},
	"@minecraft/server-admin": {
		"version": "1.0.0-beta"
	},
	"@minecraft/server-ui": {
		"version": "1.0.0-beta"
	},
	"@minecraft/server-net": {
		"version": "1.0.0-beta"
	},
}

const scriptModules2 = {
	"@minecraft/server": {
		"release": {
			"beta": "1.1.0-beta",
		},
		"preview": {
			"beta": "1.2.0-beta",
		}
	},
	"@minecraft/server-gametest": {
		"release": {
			"beta": "1.1.0-beta",
		},
		"preview": {
			"beta": "1.0.0-beta",
		}
	},
	"@minecraft/server-admin": {
		"release": {
			"beta": "1.1.0-beta",
		},
		"preview": {
			"beta": "1.0.0-beta",
		}
	},
	"@minecraft/server-ui": {
		"release": {
			"beta": "1.1.0-beta",
		},
		"preview": {
			"beta": "1.0.0-beta",
		}
	},
	"@minecraft/server-net": {
		"release": {
			"beta": "1.1.0-beta",
		},
		"preview": {
			"beta": "1.0.0-beta",
		}
	},
}

const entryModule = "@minecraft/server"

module.exports = {
    latestVersion,
	scriptModules,
	entryModule,
}