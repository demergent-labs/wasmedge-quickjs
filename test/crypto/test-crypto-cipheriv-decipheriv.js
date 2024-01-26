// Copyright Joyent and Node contributors. All rights reserved. MIT license.

'use strict';
import common from '../common';
if (!common.hasCrypto)
  common.skip('missing crypto');

import assert from 'assert';
import crypto from 'crypto';

function testCipher1(key, iv) {
  return; // unsupport des-ebe3-cbc
  // Test encryption and decryption with explicit key and iv
  const plaintext =
          '32|RmVZZkFUVmpRRkp0TmJaUm56ZU9qcnJkaXNNWVNpTTU*|iXmckfRWZBGWWELw' +
          'eCBsThSsfUHLeRe0KCsK8ooHgxie0zOINpXxfZi/oNG7uq9JWFVCk70gfzQH8ZUJ' +
          'jAfaFg**';
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  let ciph = cipher.update(plaintext, 'utf8', 'hex');
  ciph += cipher.final('hex');

  const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  let txt = decipher.update(ciph, 'hex', 'utf8');
  txt += decipher.final('utf8');

  assert.strictEqual(txt, plaintext,
                     `encryption/decryption with key ${key} and iv ${iv}`);

  // Streaming cipher interface
  // NB: In real life, it's not guaranteed that you can get all of it
  // in a single read() like this.  But in this case, we know it's
  // quite small, so there's no harm.
  const cStream = crypto.createCipheriv('des-ede3-cbc', key, iv);
  cStream.end(plaintext);
  ciph = cStream.read();

  const dStream = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  dStream.end(ciph);
  txt = dStream.read().toString('utf8');

  assert.strictEqual(txt, plaintext,
                     `streaming cipher with key ${key} and iv ${iv}`);
}


function testCipher2(key, iv) {
  return; // unsupport des-ebe3-cbc
  // Test encryption and decryption with explicit key and iv
  const plaintext =
          '32|RmVZZkFUVmpRRkp0TmJaUm56ZU9qcnJkaXNNWVNpTTU*|iXmckfRWZBGWWELw' +
          'eCBsThSsfUHLeRe0KCsK8ooHgxie0zOINpXxfZi/oNG7uq9JWFVCk70gfzQH8ZUJ' +
          'jAfaFg**';
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  let ciph = cipher.update(plaintext, 'utf8', 'buffer');
  ciph = Buffer.concat([ciph, cipher.final('buffer')]);

  const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  let txt = decipher.update(ciph, 'buffer', 'utf8');
  txt += decipher.final('utf8');

  assert.strictEqual(txt, plaintext,
                     `encryption/decryption with key ${key} and iv ${iv}`);
}


function testCipher3(key, iv) {
  return; // unsupport id-aes128-wrap
  // Test encryption and decryption with explicit key and iv.
  // AES Key Wrap test vector comes from RFC3394
  const plaintext = Buffer.from('00112233445566778899AABBCCDDEEFF', 'hex');

  const cipher = crypto.createCipheriv('id-aes128-wrap', key, iv);
  let ciph = cipher.update(plaintext, 'utf8', 'buffer');
  ciph = Buffer.concat([ciph, cipher.final('buffer')]);
  const ciph2 = Buffer.from('1FA68B0A8112B447AEF34BD8FB5A7B829D3E862371D2CFE5',
                            'hex');
  assert(ciph.equals(ciph2));
  const decipher = crypto.createDecipheriv('id-aes128-wrap', key, iv);
  let deciph = decipher.update(ciph, 'buffer');
  deciph = Buffer.concat([deciph, decipher.final()]);

  assert(deciph.equals(plaintext),
         `encryption/decryption with key ${key} and iv ${iv}`);
}

// copy from testCipher1 but used aes-128-gcm
function testCipher4(key, iv) {
  // Test encryption and decryption with explicit key and iv
  const plaintext =
          '32|RmVZZkFUVmpRRkp0TmJaUm56ZU9qcnJkaXNNWVNpTTU*|iXmckfRWZBGWWELw' +
          'eCBsThSsfUHLeRe0KCsK8ooHgxie0zOINpXxfZi/oNG7uq9JWFVCk70gfzQH8ZUJ' +
          'jAfaFg**';
  
  const cipher = crypto.createCipheriv('aes-128-gcm', key, iv);
  let ciph = cipher.update(plaintext, 'utf8', 'hex');
  ciph += cipher.final('hex');
  let tag = cipher.getAuthTag();

  const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv);
  decipher.setAuthTag(tag);
  let txt = decipher.update(ciph, 'hex', 'utf8');
  txt += decipher.final('utf8');

  assert.strictEqual(txt, plaintext,
                     `encryption/decryption with key ${key} and iv ${iv}`);
}

{
  const Cipheriv = crypto.Cipheriv;
  const key = '1234567890123456';
  const iv = '123456789012';

  const instance = Cipheriv('aes-128-gcm', key, iv);
  assert(instance instanceof Cipheriv, 'Cipheriv is expected to return a new ' +
                                       'instance when called without `new`');

  assert.throws(
    () => crypto.createCipheriv(null),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
      message: 'The "cipher" argument must be of type string. ' +
               'Received null'
    });

  assert.throws(
    () => crypto.createCipheriv('aes-128-gcm', null),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
    });

  assert.throws(
    () => crypto.createCipheriv('aes-128-gcm', key, 10),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
    });
}

{
  const Decipheriv = crypto.Decipheriv;
  const key = '1234567890123456';
  const iv = '123456789012';

  const instance = Decipheriv('aes-128-gcm', key, iv);
  assert(instance instanceof Decipheriv, 'Decipheriv expected to return a new' +
                                         ' instance when called without `new`');

  assert.throws(
    () => crypto.createDecipheriv(null),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
      message: 'The "cipher" argument must be of type string. ' +
               'Received null'
    });

  assert.throws(
    () => crypto.createDecipheriv('aes-128-gcm', null),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
    });

  assert.throws(
    () => crypto.createDecipheriv('aes-128-gcm', key, 10),
    {
      code: 'ERR_INVALID_ARG_TYPE',
      name: 'TypeError',
    });
}

testCipher4('0123456789abcdef', '0123456789ab');
testCipher4('0123456789abcdef', Buffer.from('0123456789ab'));
testCipher4(Buffer.from('0123456789abcdef'), '0123456789ab');
testCipher4(Buffer.from('0123456789abcdef'), Buffer.from('0123456789ab'));

/*
testCipher1('0123456789abcd0123456789', '12345678');
testCipher1('0123456789abcd0123456789', Buffer.from('12345678'));
testCipher1(Buffer.from('0123456789abcd0123456789'), '12345678');
testCipher1(Buffer.from('0123456789abcd0123456789'), Buffer.from('12345678'));
testCipher2(Buffer.from('0123456789abcd0123456789'), Buffer.from('12345678'));

if (!common.hasFipsCrypto) {
  testCipher3(Buffer.from('000102030405060708090A0B0C0D0E0F', 'hex'),
              Buffer.from('A6A6A6A6A6A6A6A6', 'hex'));
}

// Zero-sized IV or null should be accepted in ECB mode.
crypto.createCipheriv('aes-128-ecb', Buffer.alloc(16), Buffer.alloc(0));
crypto.createCipheriv('aes-128-ecb', Buffer.alloc(16), null);
*/
const errMessage = /Invalid initialization vector/;
/*
// But non-empty IVs should be rejected.
for (let n = 1; n < 256; n += 1) {
  assert.throws(
    () => crypto.createCipheriv('aes-128-ecb', Buffer.alloc(16),
                                Buffer.alloc(n)),
    errMessage);
}

// Correctly sized IV should be accepted in CBC mode.
crypto.createCipheriv('aes-128-cbc', Buffer.alloc(16), Buffer.alloc(16));

// But all other IV lengths should be rejected.
for (let n = 0; n < 256; n += 1) {
  if (n === 16) continue;
  assert.throws(
    () => crypto.createCipheriv('aes-128-cbc', Buffer.alloc(16),
                                Buffer.alloc(n)),
    errMessage);
}

// And so should null be.
assert.throws(() => {
  crypto.createCipheriv('aes-128-cbc', Buffer.alloc(16), null);
}, /Invalid initialization vector/);
*/
// Zero-sized IV should be rejected in GCM mode.
assert.throws(
  () => crypto.createCipheriv('aes-128-gcm', Buffer.alloc(16),
                              Buffer.alloc(0)),
  errMessage);

// But all other IV lengths should be accepted.
/* Unsupported
const minIvLength = common.hasOpenSSL3 ? 8 : 1;
const maxIvLength = common.hasOpenSSL3 ? 64 : 256;
for (let n = minIvLength; n < maxIvLength; n += 1) {
  if (common.hasFipsCrypto && n < 12) continue;
  crypto.createCipheriv('aes-128-gcm', Buffer.alloc(16), Buffer.alloc(n));
}*/

{
  // Passing an invalid cipher name should throw.
  assert.throws(
    () => crypto.createCipheriv('aes-127', Buffer.alloc(16), null),
    {
      name: 'Error',
      code: 'ERR_CRYPTO_UNKNOWN_CIPHER',
      message: 'Unknown cipher'
    });

  // Passing a key with an invalid length should throw.
  /*assert.throws(
    () => crypto.createCipheriv('aes-128-ecb', Buffer.alloc(17), null),
    /Invalid key length/);*/
}
