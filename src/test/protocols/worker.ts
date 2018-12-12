import * as fs from "fs";

import { WorkerConnector } from "../../protocols/workers/WorkerConnector";
import { ICalculator } from "../internal/ICalculator";

export function test_worker_connect(): Promise<void>
{
	return _Test_worker(worker =>
	{
		return worker.connect(__dirname + "/browser/worker-server.js", "first", "second");
	});
}

export function test_worker_compile(): Promise<void>
{
	return _Test_worker(worker =>
	{
		return worker.compile(fs.readFileSync("bundle/worker-server.js", "utf8"), "first", "second");
	});
}

async function _Test_worker(connect: (obj: WorkerConnector)=>Promise<void>, talk: boolean = false): Promise<void>
{
	let worker = new WorkerConnector();
	await connect(worker);

	await ICalculator.main(worker.getDriver<ICalculator>(), talk)
	await worker.close();
}