import { ApiServer } from "./server";

function run() {
  const apiServer = new ApiServer();
  apiServer.start();
}

run();
