import 'babel-polyfill';
import * as https from 'https';
import { compile, createAccount, deploy, initClient, invoke, loadContract } from 'ontology-ts-test';

https.globalAgent.options.rejectUnauthorized = false;

describe('Demo Token test', () => {
  const contract = loadContract('./test/demoToken.py');
  const account1 = createAccount('75de8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf');
  const account2 = createAccount('aade8489fcb2dcaf2ef3cd607feffde18789de7da129b5e97c81e001793cb7cf');

  let avm: Buffer;
  let abi: Buffer;
  let contractHash: string;

  const client = initClient({ rpcAddress: 'http://polaris1.ont.io:20336' });

  test('test compile', async () => {
    const response = await compile({ code: contract, type: 'Python' });
    avm = response.avm;
    abi = response.abi;
    contractHash = response.hash;

    expect(avm).toBeInstanceOf(Buffer);
    expect(avm.length).toBeGreaterThan(0);
    expect(abi).toBeInstanceOf(Buffer);
    expect(abi.length).toBeGreaterThan(0);
  });

  test('test deploy', async () => {
    const response = await deploy({ client, code: avm, account: account1 });

    expect(response.Error).toBe(0);
    expect(response.Result).toBeDefined();
  });

  test('test init', async () => {
    const response = await invoke({
      client,
      contractHash,
      method: 'init',
      account: account1
    });

    expect(response.Error).toBe(0);
  });

  test('test getBalance of User 1', async () => {
    const response = await invoke({ client, contractHash, method: 'getBalance', parameters: [account1.address] });

    expect(response.Error).toBe(0);
    expect(response.Result).toBe('10000');
  });

  test('test getBalance of User 2', async () => {
    const response = await invoke({ client, contractHash, method: 'getBalance', parameters: [account2.address] });

    expect(response.Error).toBe(0);
    expect(response.Result).toBe('0');
  });

  test('test transfer', async () => {
    const response = await invoke({
      client,
      contractHash,
      method: 'transfer',
      account: account1,
      parameters: [account1.address, account2.address, 6000]
    });

    expect(response.Error).toBe(0);
  });

  test('test getBalance of User 1 after transfer', async () => {
    const response = await invoke({ client, contractHash, method: 'getBalance', parameters: [account1.address] });

    expect(response.Error).toBe(0);
    expect(response.Result).toBe('4000');
  });

  test('test getBalance of User 2 after transfer', async () => {
    const response = await invoke({ client, contractHash, method: 'getBalance', parameters: [account2.address] });

    expect(response.Error).toBe(0);
    expect(response.Result).toBe('6000');
  });
});
