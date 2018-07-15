import { WebServer, CdnServer } from './server';

function run() {
    let webServer = new WebServer();
    webServer.start();

    let cdnServer = new CdnServer();
    cdnServer.start();
}

run();
