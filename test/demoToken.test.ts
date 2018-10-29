import 'babel-polyfill';
import * as https from 'https';
import { compile, createAccount, deploy, hex2num, initClient, invoke, loadContract } from 'ontology-ts-test';

https.globalAgent.options.rejectUnauthorized = false;

describe('Demo Token test', () => {
  const code = loadContract('./test/demoToken.py');
  const account1 = createAccount('75de8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf');
  const account2 = createAccount('aade8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf');

  let avm: Buffer;
  let abi: Buffer;
  let contract: string;

  const client = initClient({ rpcAddress: 'http://polaris1.ont.io:20336' });

  test('test compile', async () => {
    const response = await compile({ code, type: 'Python' });
    avm = response.avm;
    abi = response.abi;
    contract = response.hash;

    expect(avm).toBeInstanceOf(Buffer);
    expect(avm.length).toBeGreaterThan(0);
    expect(abi).toBeInstanceOf(Buffer);
    expect(abi.length).toBeGreaterThan(0);
  });

  test('test deploy', async () => {
    const response = await deploy({ client, code: avm, account: account1 });

    expect(response.error).toBe(0);
    expect(response.result).toBeDefined();
  });

  test('test init', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'init',
      parameters: [account1.address.toArray(), account2.address.toArray()],
      account: account1
    });

    expect(response.error).toBe(0);
  });

  test('test getBalance of User 1', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'getBalance',
      parameters: [account1.address.toArray()],
      preExec: true
    });

    expect(response.error).toBe(0);
    expect(hex2num(response.result.Result)).toBe(10000);
  });

  test('test getBalance of User 2', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'getBalance',
      parameters: [account2.address.toArray()],
      preExec: true
    });

    expect(response.error).toBe(0);
    expect(hex2num(response.result.Result)).toBe(0);
  });

  test('test transfer', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'transfer',
      account: account1,
      parameters: [account1.address.toArray(), account2.address.toArray(), 6000]
    });

    expect(response.error).toBe(0);
  });

  test('test getBalance of User 1 after transfer', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'getBalance',
      parameters: [account1.address.toArray()],
      preExec: true
    });

    expect(response.error).toBe(0);
    expect(hex2num(response.result.Result)).toBe(4000);
  });

  test('test getBalance of User 2 after transfer', async () => {
    const response = await invoke({
      client,
      contract,
      method: 'getBalance',
      parameters: [account2.address.toArray()],
      preExec: true
    });

    expect(response.error).toBe(0);
    expect(hex2num(response.result.Result)).toBe(6000);
  });
});
