import anchorPkg from '@anchor-lang/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const BN = require('bn.js');
const fs = require('fs');

const { Program, AnchorProvider, web3 } = anchorPkg;
const idl = JSON.parse(fs.readFileSync('/home/raw/Desktop/New Folder/inaam/bounty-platform/target/idl/bounty_platform.json'));

async function main() {
  const connection = new web3.Connection('http://localhost:8899');
  const wallet = web3.Keypair.generate();
  await connection.requestAirdrop(wallet.publicKey, 10 * web3.LAMPORTS_PER_SOL);
  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program(idl, provider);
  
  try {
    await program.methods.createBounty(
      new BN(1), web3.PublicKey.unique(), web3.PublicKey.default,
      new BN(0), new BN(Math.floor(Date.now()/1000) + 86400)
    ).accounts({
      creator: wallet.publicKey,
      bounty: web3.PublicKey.findProgramAddressSync(
        [Buffer.from('bounty'), wallet.publicKey.toBuffer(), new BN(1).toArrayLike(Buffer, 'le', 8)],
        program.programId
      )[0],
      vault: web3.PublicKey.unique(),
      creatorTokenAccount: null,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    }).rpc();
  } catch (err) {
    console.log('Constructor:', err.constructor?.name);
    console.log('Keys:', Object.keys(err).join(', '));
    console.log('Has error.errorCode:', !!err.error?.errorCode);
    if (err.error?.errorCode) console.log('Code:', err.error.errorCode.code);
    console.log('Has code prop:', !!err.code);
    if (err.code) console.log('Code direct:', err.code);
    console.log('Message:', err.message?.substring(0, 300));
    if (err.logs) console.log('Logs:', err.logs.slice(0, 3).join('\n'));
  }
}
main().catch(e => console.log('Top:', e.message));
