const fs = require('fs/promises');

const SERVER_FILE_PATH = '.next/standalone/server.js';

(async function () {
    try {
        console.log('Replacing publicRuntimeConfig with env variables...');

        // Get next config
        const config = await fs.readFile('next.config.js', { encoding: 'utf8' });
        // Extract publicRuntimeConfig
        const publicRuntimeConfig = config.match(/publicRuntimeConfig[^{]*?(?:{\s+[^}]*?})/gm)[0];
        const serverRuntimeConfig = config.match(/serverRuntimeConfig[^{]*?(?:{\s+[^}]*?})/gm)[0];

        // Get standalone server.js file
        const server = await fs.readFile(SERVER_FILE_PATH, { encoding: 'utf8' });

        // Replace hardcoded publicRuntimeConfig
        const newServer = server.replace(
            /("publicRuntimeConfig":[^{]*?(?:{[^}]*?}))/gm,
            publicRuntimeConfig
        ).replace(
            /("serverRuntimeConfig":[^{]*?(?:{[^}]*?}))/gm,
            serverRuntimeConfig
        );

        // Write to file
        await fs.writeFile(SERVER_FILE_PATH, newServer, 'utf8', function (err) {
            if (err) return console.log(err);
        });

        console.log('Done!');
    } catch (err) {
        console.log(err);
    }
})();