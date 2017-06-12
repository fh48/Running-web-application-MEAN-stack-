"use strict";

/** @module config module */

let devConfig = {
        server: {
            'port': 1337
        },
        jwt: {
            'secret': 'nudel'
        },
        darkSky: {
            'url': 'https://api.darksky.net/forecast/',
            'apiKey': '449561c1b3760637c70eadbfc21821ba'
        },
        cloudinary: {
            'cloudName': 'depwjrqra',
            'apiKey': '216455422744166',
            'secret': '-IKcKsC5sPj7A1ZAi4rmLWqQWTM'
        },
        mongo: {
            'url': 'mongodb://ks255.host.cs.st-andrews.ac.uk:27017/',
            //'url': 'mongodb://localhost:27017/',
            'dbName': 'hf-dev-db',
            'user': 'admin',
            'password': 'j3Jh34Ak5qwer',
            'auth': {
                authdb: "admin"
            }
        }
    },
    prodConfig = {
        server: {
            'port': 1337
        },
        jwt: {
            'secret': 'nudel'
        },
        darkSky: {
            'url': 'https://api.darksky.net/forecast/',
            'apiKey': '449561c1b3760637c70eadbfc21821ba'
        },
        cloudinary: {
            'cloudName': 'depwjrqra',
            'apiKey': '216455422744166',
            'secret': '-IKcKsC5sPj7A1ZAi4rmLWqQWTM'
        },
        mongo: {
            'url': 'mongodb://ks255.host.cs.st-andrews.ac.uk:27017/',
            'dbName': 'hf-dev-db',
            'user': 'admin',
            'password': 'j3Jh34Ak5qwer',
            'auth': {
                'authdb': "admin"
            }
        }
    },
    testConfig = {
        server: {
            'port': 1338
        },
        jwt: {
            'secret': 'nudel-test'
        },
        darkSky: {
            'url': 'https://api.darksky.net/forecast/',
            'apiKey': '449561c1b3760637c70eadbfc21821ba'
        },
        cloudinary: {
            'cloudName': 'depwjrqra',
            'apiKey': '216455422744166',
            'secret': '-IKcKsC5sPj7A1ZAi4rmLWqQWTM'
        },
        mongo: {
            'url': 'mongodb://ks255.host.cs.st-andrews.ac.uk:27017/',
            'dbName': 'hf-test-db',
            'user': 'admin',
            'password': 'j3Jh34Ak5qwer',
            'auth': {
                'authdb': "admin"
            }
        }
    }

/**
 * Exports the appropriate configuration object dependant from the server mode.
 */
module.exports = function() {
    switch (process.env.NODE_ENV) {
        case 'production':
            return prodConfig;

        case 'test':
            return testConfig;

        default:
            return devConfig;
    }
}();
