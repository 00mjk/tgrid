import { SharedWorkerServer } from "../../protocols/workers/module";
import { Calculator } from "../providers/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void>
{
    const server: SharedWorkerServer<{}, Calculator> = new SharedWorkerServer();
    await server.open(async acceptor =>
    {
        console.log(acceptor.header);
        await acceptor.accept(new Calculator());
    });
}
main();