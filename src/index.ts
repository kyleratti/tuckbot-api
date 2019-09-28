import { ApiServer } from "./server";

function run() {
  let apiServer = new ApiServer();
  apiServer.start();
}

run();
