import { IExecDataProtector } from '@iexec/dataprotector';

const IAPP_ADDRESS = process.env.NEXT_PUBLIC_IAPP_ADDRESS!;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function protectAndScore(file: File, walletProvider: any, onStatusUpdate?: (status: string) => void) {
  try {
    const dataProtector = new IExecDataProtector(walletProvider);
    
    const fileBuffer = await file.arrayBuffer();

    console.log('Step 1: Encrypting and uploading file...');
    if (onStatusUpdate) onStatusUpdate('Encrypting and uploading file...');
    
    const protectedData = await dataProtector.core.protectData({
      name: `credit-data-${Date.now()}`,
      data: { file: fileBuffer },
      onStatusUpdate: ({ title, isDone }) => {
        console.log(`  ${title}: ${isDone ? '✅' : '⏳'}`);
        if (onStatusUpdate) onStatusUpdate(`${title}...`);
      }
    });

    console.log('✅ Protected data created:', protectedData.address);
    if (onStatusUpdate) onStatusUpdate('Protected data created');

    const signer = await walletProvider.getSigner();
    const userAddress = await signer.getAddress();

    console.log('Step 2: Granting access to iApp...');
    if (onStatusUpdate) onStatusUpdate('Granting access to app...');
    
    await dataProtector.core.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: IAPP_ADDRESS,
      authorizedUser: userAddress,
      numberOfAccess: 1
    });

    console.log('✅ Access granted');
    if (onStatusUpdate) onStatusUpdate('Access granted');

    await delay(3000);

    console.log('Step 3: Processing in TEE (this takes 2-5 minutes)...');
    if (onStatusUpdate) onStatusUpdate('Starting TEE processing...');
    
    const result = await dataProtector.core.processProtectedData({
      protectedData: protectedData.address,
      app: IAPP_ADDRESS,
      maxPrice: 100000000,
      workerpoolMaxPrice: 100000000,
      category: 0,
      onStatusUpdate: ({ title, isDone, payload }) => {
        console.log(`  ${title}: ${isDone ? '✅' : '⏳'}`, payload);
        if (onStatusUpdate && payload?.taskId) {
          onStatusUpdate(`${title}... Task: ${payload.taskId.slice(0, 8)}...`);
        }
      }
    });

    console.log('✅ Task ID:', result.taskId);
    console.log('✅ Deal ID:', result.dealId);
    if (onStatusUpdate) onStatusUpdate(`Task ${result.taskId.slice(0, 8)}... running in TEE`);

    return {
      taskId: result.taskId,
      dealId: result.dealId,
      protectedData: protectedData.address,
      status: 'processing'
    };
    
  } catch (error: any) {
    console.error('❌ Full error:', error);
    
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas. Get Arbitrum Sepolia ETH from faucet');
    }
    
    if (error.message?.includes('Internal JSON-RPC error')) {
      throw new Error('Transaction failed. Check your ETH balance and try again.');
    }
    
    throw error;
  }
}

export async function checkTaskResult(taskId: string, walletProvider: any, onStatusUpdate?: (status: string) => void) {
  try {
    const dataProtector = new IExecDataProtector(walletProvider);
    
    console.log('Step 4: Waiting for task completion...');
    if (onStatusUpdate) onStatusUpdate('Waiting for task completion...');
    
    const taskResult = await dataProtector.core.getResultFromCompletedTask({ 
      taskId: taskId
    });
    
    console.log('✅ Task completed!');
    if (onStatusUpdate) onStatusUpdate('Task completed! Fetching result...');
    
    const decoder = new TextDecoder();
    const resultString = decoder.decode(taskResult.result);
    
    console.log('✅ Score computed!');
    return JSON.parse(resultString);
    
  } catch (error: any) {
    console.error('❌ Error fetching result:', error);
    
    if (error.message?.includes('timeout') || error.message?.includes('Task not completed')) {
      throw new Error('Task is still running. Please wait a few more minutes.');
    }
    
    throw error;
  }
}

export async function checkTaskStatus(taskId: string, walletProvider: any) {
  try {
    const { IExec } = await import('iexec');
    const iexec = new IExec({ ethProvider: walletProvider });
    
    const task = await iexec.task.show(taskId);
    return {
      status: task.status,
      statusName: task.statusName || (task.status === 1 ? 'ACTIVE' : 
                    task.status === 2 ? 'COMPLETED' : 
                    task.status === 3 ? 'FAILED' : 'UNKNOWN'),
      dealId: task.dealid,
      finalDeadline: task.finalDeadline,
      isTimedOut: task.taskTimedOut
    };
  } catch (error) {
    console.error('Error checking task status:', error);
    throw error;
  }
}