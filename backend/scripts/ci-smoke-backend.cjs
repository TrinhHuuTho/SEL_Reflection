const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const port = Number(process.env.PORT || 3000);
const healthUrl = `http://127.0.0.1:${port}/auth`;
const startupTimeoutMs = 90000;
const pollIntervalMs = 2000;

function waitForExit(processRef) {
  return new Promise((resolve) => {
    processRef.once('exit', resolve);
  });
}

async function stopServer(serverProcess) {
  if (serverProcess.exitCode !== null) {
    return;
  }

  serverProcess.kill('SIGTERM');

  const exited = await Promise.race([
    waitForExit(serverProcess).then(() => true),
    delay(5000).then(() => false),
  ]);

  if (!exited && serverProcess.exitCode === null) {
    serverProcess.kill('SIGKILL');
  }
}

async function waitForHealth(serverProcess) {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Backend exited early with code ${serverProcess.exitCode}.`);
    }

    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        console.log(`Backend smoke check passed: ${healthUrl} -> ${response.status}`);
        return;
      }
      console.log(`Backend not ready yet: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`Waiting for backend at ${healthUrl}: ${error.message}`);
    }

    await delay(pollIntervalMs);
  }

  throw new Error(`Backend did not become healthy within ${startupTimeoutMs} ms.`);
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required for backend smoke check.');
  }

  const serverProcess = spawn(process.execPath, ['src/app.js'], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (chunk) => {
    process.stdout.write(`[backend] ${chunk}`);
  });

  serverProcess.stderr.on('data', (chunk) => {
    process.stderr.write(`[backend] ${chunk}`);
  });

  try {
    await waitForHealth(serverProcess);
  } finally {
    await stopServer(serverProcess);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
